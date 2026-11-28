import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";
import { uiLabel } from "./ui-labels.mjs";

export async function runDonorCompletionChecks(h) {
  const { base, prisma, request, assignedRescue, deliveredRescue, issue, handover, saveReceipt, imageBytes, secondLogin, distribute, distributionInput } = h;
  const artifacts = ".local-postgres/donor-completion";
  await mkdir(artifacts, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH, args: ["--proxy-server=direct://", "--proxy-bypass-list=*"] });
  const errors = [], results = [];
  async function pageFor(cookie, width, language) {
    const context = await browser.newContext({ baseURL: base, viewport: { width, height: 900 }, timezoneId: "Asia/Dhaka" });
    await context.addInitScript(lang => localStorage.setItem("sharebite_preferred_lang", lang), language);
    const [name, value] = cookie.split("=");
    await context.addCookies([{ name, value, url: base, httpOnly: true, sameSite: "Lax" }]);
    const page = await context.newPage();
    page.on("pageerror", error => errors.push(error.message));
    return page;
  }
  async function checkEvidence(page, urls, t) {
    const report = page.getByTestId("distribution-evidence");
    await report.getByRole("heading", { name: t("NGO distribution report"), exact: true }).waitFor({ timeout: 15000 });
    assert.equal(await report.locator("img").count(), urls.length);
    for (const url of urls) {
      const image = report.locator(`img[src="${url}"]`);
      await image.scrollIntoViewIfNeeded();
      await image.evaluate(img => img.decode());
      assert.equal(await image.evaluate(img => img.naturalWidth > 0), true);
      assert.equal(await report.locator(`a[href="${url}"]`).getAttribute("target"), "_blank");
    }
    assert.equal(await report.locator("time").getAttribute("datetime") !== null, true);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  }
  try {
    for (const [width, language] of [[320, "bn"], [390, "en"], [1440, "en"]]) {
      const t = source => uiLabel(source, language);
      const rescue = await assignedRescue();
      const path = "/donor/donations/" + rescue.donation.id;
      const donor = await pageFor(rescue.donor, width, language);
      const ngo = await pageFor(rescue.ngo, width, language);
      try {
        await donor.goto(path, { waitUntil: "domcontentloaded" });
        await donor.locator('[data-testid="rescue-clock"][data-state="counting"]').getByRole("timer").waitFor();
        assert.equal(await donor.getByTestId("distribution-evidence").count(), 0);
        assert.equal((await handover(rescue, rescue.volunteer, "verify", "PICKUP", await issue(rescue, "PICKUP"))).status, 200);
        await donor.locator('[data-testid="rescue-clock"][data-state="PICKED_UP"]').waitFor({ timeout: 15000 });
        assert.equal(await donor.getByTestId("rescue-clock").getByRole("timer").count(), 0);
        assert.equal((await handover(rescue, rescue.volunteer, "verify", "DELIVERY", await issue(rescue, "DELIVERY"))).status, 200);
        await saveReceipt(rescue);
        await donor.locator('[data-testid="rescue-clock"][data-state="DELIVERED"]').waitFor({ timeout: 15000 });
        assert.equal(await donor.getByTestId("distribution-evidence").count(), 0, "Delivery must not claim distribution is complete");

        // Upload and complete the distribution from the actual NGO form.
        await ngo.goto("/ngo/claims/" + rescue.claim.id + "/distribution", { waitUntil: "domcontentloaded" });
        await ngo.getByLabel(t("People served"), { exact: true }).fill("12");
        await ngo.getByLabel(t("Meals distributed"), { exact: true }).fill("14");
        await ngo.getByLabel(t("Operational notes (optional)"), { exact: false }).fill("Packed meals distributed with consent.");
        await ngo.getByLabel(t("I confirm consent and privacy safeguards were followed"), { exact: false }).check();
        const upload = ngo.waitForResponse(res => res.url().endsWith("/api/photos") && res.request().method() === "POST");
        await ngo.locator('input[type="file"]').setInputFiles([
          { name: "packed-meals.png", mimeType: "image/png", buffer: await imageBytes() },
          { name: "distribution-proof.png", mimeType: "image/png", buffer: await imageBytes() },
        ]);
        const uploaded = await upload;
        assert.equal(uploaded.status(), 201);
        const photos = (await uploaded.json()).photos.map(photo => photo.url);
        for (const url of photos) assert.equal((await request(url, { cookie: rescue.donor })).status, 404, "Unsaved evidence must stay private");
        const completed = ngo.waitForResponse(res => res.url().endsWith("/api/distributions") && res.request().method() === "POST");
        await ngo.getByRole("button", { name: t("Complete rescue"), exact: true }).click();
        assert.equal((await completed).status(), 201);
        await ngo.getByText(t("Distribution recorded"), { exact: true }).waitFor();

        // The already-open donor page must update without a manual reload.
        await donor.locator('[data-testid="rescue-clock"][data-state="DISTRIBUTED"]').waitFor({ timeout: 15000 });
        assert.equal(await donor.getByTestId("rescue-clock").getByRole("timer").count(), 0);
        await checkEvidence(donor, photos, t);
        assert.equal(await donor.getByTestId("distribution-evidence").locator("dd").first().innerText(), (14).toLocaleString(language === "bn" ? "bn-BD" : "en-BD"));
        const stored = await prisma.distributionRecord.findUniqueOrThrow({ where: { claimId: rescue.claim.id } });
        assert.deepEqual(stored.photoUrls, photos);
        assert.equal(await donor.getByTestId("distribution-evidence").locator("time").getAttribute("datetime"), stored.distributedAt.toISOString());
        await donor.getByTestId("distribution-evidence").screenshot({ path: `${artifacts}/${width}-${language}-report.png` });
        await donor.getByTestId("rescue-clock").screenshot({ path: `${artifacts}/${width}-${language}-stopped-clock.png` });
        await donor.reload({ waitUntil: "domcontentloaded" });
        await checkEvidence(donor, photos, t);
        await donor.goto(path + "/tracking", { waitUntil: "domcontentloaded" });
        await checkEvidence(donor, photos, t);

        if (width === 320) {
          const outsiderDonor = await secondLogin("DONOR"), outsiderNgo = await secondLogin("NGO");
          for (const url of photos) {
            assert.equal((await request(url, { cookie: rescue.donor })).status, 200);
            assert.equal((await request(url, { cookie: outsiderDonor })).status, 404);
            assert.equal((await request(url, { cookie: outsiderNgo })).status, 404);
            assert.equal((await request(url)).status, 401);
          }
          assert.equal((await request("/api/distributions?claimId=" + rescue.claim.id, { cookie: outsiderDonor })).status, 404);
          assert.equal((await request("/api/distributions?claimId=" + rescue.claim.id, { cookie: outsiderNgo })).status, 404);
          // A completed rescue must stay complete even after its old deadline passes.
          await prisma.donation.update({ where: { id: rescue.donation.id }, data: { safePickupDeadline: new Date(Date.now() - 60000) } });
          await donor.goto(path, { waitUntil: "domcontentloaded" });
          await donor.locator('[data-testid="rescue-clock"][data-state="DISTRIBUTED"]').waitFor();
          await checkEvidence(donor, photos, t);
        }
        results.push({ width, language, photos: photos.length, liveCompletion: true, reload: true, tracking: true });
      } finally { await donor.context().close(); await ngo.context().close(); }
    }

    // Old records that only store filenames must not pretend to contain viewable photos.
    const empty = await deliveredRescue();
    await saveReceipt(empty);
    assert.equal((await distribute(empty, await distributionInput(empty, { photoUrls: [] }))).status, 201);
    const page = await pageFor(empty.donor, 390, "en");
    await page.goto("/donor/donations/" + empty.donation.id, { waitUntil: "domcontentloaded" });
    await page.getByTestId("distribution-evidence").getByText("No distribution photos were attached to this record.", { exact: true }).waitFor();
    assert.equal(await page.getByTestId("distribution-evidence").locator("img").count(), 0);
    await page.context().close();
    assert.deepEqual(errors, [], "No browser runtime errors");
    await writeFile(artifacts + "/results.json", JSON.stringify({ results, errors }, null, 2));
    console.log("Donor completion passed:", JSON.stringify(results));
  } finally { await browser.close(); }
}
