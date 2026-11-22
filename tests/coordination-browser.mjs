import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";
import { uiName } from "./ui-labels.mjs";
export async function runCoordinationBrowserChecks({
  base,
  prisma,
  request,
  login,
  assignedRescue,
  issue,
  reportIncident,
}) {
  const artifacts = ".local-postgres/coordination-browser";
  await mkdir(artifacts, { recursive: true });
  for (const role of ["DONOR", "NGO"]) {
    const cookie = (await login(role)).cookie;
    const profile = await (await request("/api/profile", { cookie })).json();
    const point =
      role === "DONOR"
        ? { latitude: 23.781234, longitude: 90.421234 }
        : { latitude: 23.79, longitude: 90.42 };
    assert.equal(
      (
        await request("/api/profile", {
          cookie,
          method: "POST",
          body: {
            action: "setCoordinates",
            id: profile.addresses[0].id,
            input: { coordinates: point },
          },
        })
      ).status,
      200,
    );
  }
  const rescue = await assignedRescue();
  await prisma.donation.update({
    where: { id: rescue.donation.id },
    data: { sampleImageId: "meal-trays", windowEnd:new Date(Date.now()+240000) },
  });
  const browser = await chromium.launch({
    headless: true,
    args: process.env.RUN_LAN_BROWSER === "1" ? ["--proxy-server=direct://", "--proxy-bypass-list=*"] : [],
    ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
      : { channel: process.env.PLAYWRIGHT_CHANNEL || undefined }),
  });
  const pages = {},
    errors = [],
    layouts = [];
  const paths = {
    donor: `/donor/donations/${rescue.donation.id}/tracking`,
    ngo: `/ngo/claims/${rescue.claim.id}`,
    volunteer: `/volunteer/missions/mission-${rescue.claim.id}`,
  };
  async function phase(page, id, state = "active") {
    await page
      .locator(
        `[data-testid="rescue-progress"][data-phase="${id}"][data-state="${state}"]`,
      )
      .waitFor({ timeout: 16000 });
  }
  try {
    for (const role of ["donor", "ngo", "volunteer"]) {
      const context = await browser.newContext({
        baseURL: base,
        viewport: { width: 390, height: 1000 },
        timezoneId: "Asia/Dhaka",
      });
      await context.addInitScript(() => {
        if (!localStorage.getItem("sharebite_preferred_lang"))
          localStorage.setItem("sharebite_preferred_lang", "en");
      });
      const [name, value] = rescue[role].split("=");
      await context.addCookies([
        { name, value, url: base, httpOnly: true, sameSite: "Lax" },
      ]);
      const page = await context.newPage();
      pages[role] = page;
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(paths[role], { waitUntil: "domcontentloaded" });
      await page.getByTestId("rescue-next-action").waitFor();
      assert.equal(await page.getByTestId("location-map").count(), 0, "Closed rescue maps must not mount or request tiles");
      if (process.env.RUN_LAN_BROWSER === "1") {
        await page.route("https://tile.openstreetmap.org/**", route => route.abort());
        await page.getByText("Map & saved handover locations", { exact: true }).click();
        await page.getByTestId("location-map").waitFor();
        await page.getByRole("status").filter({ hasText: "Map tiles could not load" }).waitFor();
        await page.getByText("Map & saved handover locations", { exact: true }).click();
        await page.getByTestId("location-map").waitFor({ state: "detached" });
      }
    }
    const { donor, ngo, volunteer: rider } = pages;
    assert.equal(
      await rider
        .getByLabel(uiName("Six-digit handover code"), { exact: true })
        .count(),
      0,
      "A travel stage must present its route action before OTP entry",
    );
    for (const language of ["en", "bn"])
      for (const width of [320, 390, 768, 1440])
        for (const role of ["donor", "ngo", "volunteer"]) {
          const page = pages[role];
          await page
            .getByRole("button", {
              name: language === "en" ? "EN" : "বাংলা",
              exact: true,
            })
            .click();
          await page.setViewportSize({ width, height: 1000 });
          await page.evaluate(() => document.fonts.ready);
          assert.equal(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
            true,
            `${role} ${language} ${width}`,
          );
          assert.equal(
            await page.getByTestId("rescue-progress").locator("li").count(),
            6,
          );
          assert.equal(
            await page
              .getByTestId("rescue-progress")
              .getAttribute("data-phase"),
            role === "volunteer" ? "assigned" : "rider",
          );
          if (width === 390 || width === 1440)
            await page.screenshot({
              path: `${artifacts}/${role}-${language}-${width}.png`,
              fullPage: true,
              animations: "disabled",
            });
          layouts.push({ role, language, width });
        }
    for (const page of Object.values(pages)) {
      await page.getByRole("button", { name: "EN", exact: true }).click();
      await page.setViewportSize({ width: 390, height: 1000 });
    }
    await rider
      .getByRole("button", { name: "Start pickup trip", exact: true })
      .evaluate((button) => {
        button.click();
        button.click();
      });
    await phase(rider, "en_route_pickup");
    await Promise.all([phase(donor, "rider"), phase(ngo, "rider")]);
    await rider
      .getByRole("button", { name: "I have arrived at pickup", exact: true })
      .click();
    await phase(rider, "at_pickup");
    await donor
      .getByRole("button", {
        name: uiName("Generate six-digit code"),
        exact: true,
      })
      .waitFor();
    let issues = 0;
    donor.on("request", (req) => {
      if (req.url() === base + "/api/handovers" && req.method() === "POST")
        issues++;
    });
    await donor
      .getByRole("button", {
        name: uiName("Generate six-digit code"),
        exact: true,
      })
      .evaluate((button) => {
        button.click();
        button.click();
      });
    const donorCode = donor.getByLabel(uiName("Six digit handover code"), {
      exact: true,
    });
    await donorCode.waitFor();
    const firstCode = await donorCode.textContent();
    const firstExpiry = (await prisma.handoverChallenge.findUniqueOrThrow({where:{claimId_kind:{claimId:rescue.claim.id,kind:"PICKUP"}}})).expiresAt.toISOString();
    assert.match(firstCode, /^\d{6}$/);
    assert.equal(issues, 1);
    // Another issuer tab replaces the code after the server cooldown. The original
    // tab must hide its old code even when expiry is clipped to the same deadline.
    await prisma.handoverChallenge.update({
      where: { claimId_kind: { claimId: rescue.claim.id, kind: "PICKUP" } },
      data: { issuedAt: new Date(Date.now() - 61000) },
    });
    const replacement = await issue(rescue, "PICKUP");
    assert.notEqual(firstCode, replacement);
    assert.equal((await prisma.handoverChallenge.findUniqueOrThrow({where:{claimId_kind:{claimId:rescue.claim.id,kind:"PICKUP"}}})).expiresAt.toISOString(),firstExpiry,"A replacement with the same clipped expiry must still invalidate the visible old code");
    await donorCode.waitFor({ state: "hidden", timeout: 15000 });
    const input = rider.getByLabel(uiName("Six-digit handover code"), {
      exact: true,
    });
    await input.fill(replacement === "111111" ? "222222" : "111111");
    await rider
      .getByRole("button", { name: uiName("Confirm pickup"), exact: true })
      .click();
    await rider
      .getByRole("alert")
      .filter({ hasText: /Incorrect code/ })
      .waitFor();
    await phase(rider, "at_pickup");
    let verifies = 0;
    rider.on("request", (req) => {
      if (req.url() === base + "/api/handovers" && req.method() === "POST")
        verifies++;
    });
    await input.fill(replacement);
    await rider
      .getByRole("button", { name: uiName("Confirm pickup"), exact: true })
      .evaluate((button) => {
        button.click();
        button.click();
      });
    await phase(rider, "cargo_loaded");
    await Promise.all([phase(donor, "pickup"), phase(ngo, "pickup")]);
    assert.equal(verifies, 1);
    assert.equal(await input.count(), 0);
    await rider
      .getByRole("button", { name: "Start delivery trip", exact: true })
      .click();
    await phase(rider, "en_route_dropoff");
    const navigate = rider.getByRole("link", {
      name: "Navigate to NGO",
      exact: true,
    });
    assert.ok(
      (await navigate.getAttribute("href")).includes("destination=23.79"),
    );
    await ngo
      .getByRole("button", {
        name: uiName("Generate six-digit code"),
        exact: true,
      })
      .click();
    const ngoCode = ngo.getByLabel(uiName("Six digit handover code"), {
      exact: true,
    });
    await ngoCode.waitFor();
    const deliveryCode = await ngoCode.textContent();
    await input.fill(deliveryCode);
    await rider
      .getByRole("button", { name: uiName("Confirm delivery"), exact: true })
      .click();
    await phase(rider, "completed", "complete");
    await Promise.all([phase(donor, "delivery"), phase(ngo, "delivery")]);
    assert.equal(await rider.getByTestId("mission-handover").count(), 0);
    assert.equal(
      await ngo
        .getByTestId("rescue-next-action")
        .getByRole("link", {
          name: uiName("Record delivery receipt"),
          exact: true,
        })
        .count(),
      1,
    );
    assert.equal(
      await prisma.distributionRecord.count({
        where: { claimId: rescue.claim.id },
      }),
      0,
      "Delivery alone must not create impact",
    );
    await ngo
      .getByTestId("rescue-next-action")
      .getByRole("link", {
        name: uiName("Record delivery receipt"),
        exact: true,
      })
      .click();
    await ngo
      .getByRole("button", { name: uiName("Save receipt"), exact: true })
      .waitFor();
    await ngo
      .getByRole("button", { name: uiName("Save receipt"), exact: true })
      .click();
    await ngo
      .getByRole("heading", { name: uiName("Receipt saved"), exact: true })
      .waitFor();
    await ngo.goto(paths.ngo, { waitUntil: "domcontentloaded" });
    await ngo
      .getByTestId("rescue-next-action")
      .getByRole("link", { name: uiName("Record distribution"), exact: true })
      .click();
    await ngo.locator('[name="beneficiariesServed"]').fill("5");
    await ngo.locator('[name="mealsDistributed"]').fill("10");
    const profile = await (
      await request("/api/profile", { cookie: rescue.ngo })
    ).json();
    await ngo
      .locator('[name="addressId"]')
      .selectOption(profile.addresses[0].id);
    await ngo.locator('[name="beneficiaryConsentConfirmed"]').check();
    await ngo
      .getByRole("button", { name: uiName("Complete rescue"), exact: true })
      .click();
    await ngo
      .getByRole("heading", {
        name: uiName("Distribution recorded"),
        exact: true,
      })
      .waitFor();
    const record = await prisma.distributionRecord.findUniqueOrThrow({
      where: { claimId: rescue.claim.id },
    });
    assert.equal(record.mealsDistributed, 10);
    assert.equal(record.beneficiariesServed, 5);
    await ngo
      .getByRole("link", { name: uiName("Return to claim"), exact: true })
      .click();
    await Promise.all([
      phase(donor, "distributed", "complete"),
      phase(ngo, "distributed", "complete"),
    ]);
    await rider.reload({ waitUntil: "domcontentloaded" });
    await phase(rider, "completed", "complete");
    await ngo.screenshot({
      path: `${artifacts}/ngo-distributed.png`,
      fullPage: true,
      animations: "disabled",
    });
    // Maps remain an optional disclosure; navigation is derived from saved pins.
    await donor
      .getByText("Map & saved handover locations", { exact: true })
      .click();
    await donor
      .getByRole("region", {
        name: uiName("Pickup and delivery map"),
        exact: true,
      })
      .waitFor();
    await donor.route("**/api/claims?*", (route) =>
      route.fulfill({
        status: 503,
        contentType: "application/json",
        body: '{"error":"Temporary outage"}',
      }),
    );
    await donor
      .getByRole("button", { name: uiName("Refresh"), exact: true })
      .click();
    await donor
      .getByRole("alert")
      .filter({ hasText: "Showing saved tracking details" })
      .waitFor();
    assert.equal(
      await donor.getByTestId("rescue-progress").getAttribute("data-phase"),
      "distributed",
    );
    assert.equal(
      await donor.getByTestId("rescue-progress").getAttribute("data-motion"),
      "paused",
    );
    await donor.unroute("**/api/claims?*");
    await donor
      .getByRole("button", { name: uiName("Refresh"), exact: true })
      .click();
    await donor
      .locator('[data-testid="rescue-progress"][data-stale="false"]')
      .waitFor();
    const held = await assignedRescue();
    await reportIncident(held, held.ngo);
    await ngo.goto(`/ngo/claims/${held.claim.id}`, {
      waitUntil: "domcontentloaded",
    });
    await phase(ngo, "rider", "paused");
    assert.equal(
      await ngo
        .getByRole("button", {
          name: uiName("Generate six-digit code"),
          exact: true,
        })
        .count(),
      0,
    );
    assert.equal(
      await ngo.getByTestId("rescue-next-action").getByRole("link").count(),
      0,
    );
    await rider.emulateMedia({ reducedMotion: "reduce" });
    assert.equal(
      await rider
        .getByTestId("rescue-progress")
        .evaluate((el) =>
          [...el.querySelectorAll("*")].some(
            (node) => getComputedStyle(node).animationName !== "none",
          ),
        ),
      false,
    );
    assert.equal(layouts.length, 24);
    assert.deepEqual(errors, []);
    console.log(
      "Coordination browser: 24 bilingual layouts; all three roles, real route actions, replacement-code hiding, OTP validation, duplicate protection, delivery receipt, actual distribution, stale recovery and incident hold passed.",
    );
  } catch (error) {
    for (const [role, page] of Object.entries(pages))
      if (!page.isClosed()) {
        await page
          .screenshot({
            path: `${artifacts}/failure-${role}.png`,
            fullPage: true,
          })
          .catch(() => {});
        await writeFile(
          `${artifacts}/failure-${role}.txt`,
          (await page.locator("body").innerText()) + "\n" + page.url(),
        ).catch(() => {});
      }
    throw error;
  } finally {
    await browser.close();
  }
}
