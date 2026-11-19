import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";
import { uiLabel, uiName } from "./ui-labels.mjs";

export async function runPortalConsistencyChecks(helpers) {
  const {
    prisma,
    base,
    login,
    request,
    newDonation,
    assignedRescue,
    deliveredRescue,
    saveReceipt,
    distribute,
    distributionInput,
    handover,
    issue,
  } = helpers;
  const artifacts = ".local-postgres/portal-consistency";
  await mkdir(artifacts, { recursive: true });
  const assigned = await assignedRescue();
  const completed = await deliveredRescue();
  await saveReceipt(completed);
  assert.equal(
    (await distribute(completed, await distributionInput(completed))).status,
    201,
  );
  const cookies = {
    donor: (await login("DONOR")).cookie,
    ngo: (await login("NGO")).cookie,
  };
  const named = await newDonation(cookies.donor, { title: "Settings" });
  assert.equal(
    (
      await request("/api/claims", {
        cookie: cookies.ngo,
        method: "POST",
        body: { donationId: named.body.donation.id },
      })
    ).status,
    201,
  );
  const recommended = await newDonation(cookies.donor, {
    title: "Fresh vegetable lunch for the community",
    sampleImageId: "packed-meals",
  });
  assert.equal(recommended.response.status, 201);
  await prisma.user.update({
    where: { id: "test-DONOR" },
    data: { displayName: "Green Table Kitchen" },
  });
  await prisma.user.update({
    where: { id: "test-NGO" },
    data: { displayName: "Hope Community Foundation" },
  });
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
      : { channel: process.env.PLAYWRIGHT_CHANNEL || undefined }),
  });
  const checks = [],
    runtime = [];
  async function contextFor(role, language, viewport) {
    const context = await browser.newContext({ baseURL: base, viewport });
    await context.addInitScript(
      (lang) => localStorage.setItem("sharebite_preferred_lang", lang),
      language,
    );
    const [name, value] = cookies[role].split("=");
    await context.addCookies([
      { name, value, url: base, httpOnly: true, sameSite: "Lax" },
    ]);
    const page = await context.newPage();
    page.on("pageerror", (error) =>
      runtime.push({ role, message: error.message }),
    );
    return { context, page };
  }
  try {
    for (const language of ["bn", "en"]) {
      for (const [width, height] of [
        [320, 844],
        [390, 844],
        [768, 1024],
        [844, 390],
        [1024, 900],
        [1440, 1000],
      ]) {
        const appearance = {};
        for (const role of ["donor", "ngo"]) {
          const { context, page } = await contextFor(role, language, {
            width,
            height,
          });
          await page.goto(`/${role}/dashboard`, { waitUntil: "networkidle" });
          const root = page.getByTestId(
            role === "donor" ? "donor-mobile-dashboard" : "ngo-dashboard",
          );
          await root.waitFor();
          const metric = root.locator('[data-stat="meals"]');
          await metric.waitFor();
          const response = await request("/api/impact", {
            cookie: cookies[role],
          });
          const impact = await response.json();
          const expected =
            role === "donor" ? impact.mealsRescued : impact.mealsDistributed;
          assert.equal(
            await metric.locator(":scope > p").first().textContent(),
            expected.toLocaleString(language === "bn" ? "bn-BD" : "en-BD"),
          );
          assert.equal(
            await page.evaluate(
              () => document.documentElement.scrollWidth > innerWidth,
            ),
            false,
            `${role} ${width} ${language} overflow`,
          );
          const outside = await page
            .locator("main")
            .locator("a,button,summary")
            .evaluateAll((nodes) =>
              nodes
                .filter((node) => node.checkVisibility())
                .map((node) => {
                  const box = node.getBoundingClientRect();
                  return {
                    text: node.textContent.trim(),
                    x: box.x,
                    right: box.right,
                    height: box.height,
                  };
                })
                .filter(
                  (box) =>
                    box.x < -1 || box.right > innerWidth + 1 || box.height < 43,
                ),
            );
          assert.deepEqual(
            outside,
            [],
            `Controls must fit and be touch accessible: ${role} ${width} ${language}`,
          );
          if (role === "donor" && language === "bn") {
            const filters = root.getByRole("group", {
              name: uiLabel("Donation list filters", "bn"),
              exact: true,
            });
            assert.equal(
              /[0-9]/.test(await filters.innerText()),
              false,
              "Donation counts use Bengali digits",
            );
            const quantity = root
              .getByTestId("donor-active-donation")
              .locator("p")
              .first();
            assert.match(await quantity.innerText(), /২০/);
          }
          appearance[role] = await metric.evaluate((node) => {
            const style = getComputedStyle(node),
              value = getComputedStyle(node.querySelector("p")),
              title = getComputedStyle(document.querySelector("main h1"));
            return {
              background: style.backgroundColor,
              border: style.borderColor,
              radius: style.borderRadius,
              padding: style.padding,
              valueFont: value.fontSize,
              valueWeight: value.fontWeight,
              headingSize: title.fontSize,
              headingWeight: title.fontWeight,
            };
          });
          const activity = root.getByTestId(
            role === "donor" ? "donor-activity" : "ngo-activity",
          );
          assert.equal(
            await activity.getAttribute("open"),
            null,
            "Optional history starts collapsed in both dashboards",
          );
          await activity.locator("summary").press("Enter");
          assert.equal(await activity.locator("ol").isVisible(), true);
          const content = await activity.locator("ol").innerText();
          assert.ok(
            content.includes("Settings"),
            "User food titles stay unchanged in either language",
          );
          assert.ok((await activity.locator("time[datetime]").count()) > 0);
          await activity.locator("summary").press("Enter");
          if (width === 390 || width === 1440) {
            await page.evaluate(() =>
              scrollTo({ top: 0, behavior: "instant" }),
            );
            await page.screenshot({
              path: `${artifacts}/${role}-${width}-${language}.png`,
              fullPage: width >= 1024,
              animations: "disabled",
            });
          }
          if (width === 390) {
            await page.emulateMedia({ reducedMotion: "reduce" });
            assert.equal(
              await metric.evaluate(
                (node) => node.getAnimations({ subtree: true }).length,
              ),
              0,
              "Reduced motion keeps metric icons still",
            );
          }
          checks.push({ role, width, height, language, passed: true });
          await context.close();
        }
        assert.deepEqual(
          appearance.donor,
          appearance.ngo,
          `Shared card and heading styling at ${width} ${language}`,
        );
      }
    }
    // Both dashboards retain their data after a refresh failure and offer the same retry flow.
    for (const role of ["donor", "ngo"]) {
      const { context, page } = await contextFor(role, "en", {
        width: 390,
        height: 844,
      });
      await page.goto(`/${role}/dashboard`, { waitUntil: "networkidle" });
      await page.locator('[data-stat="meals"]').waitFor();
      await page.route("**/api/impact", (route) =>
        route.fulfill({
          status: 503,
          json: { error: "Temporary dashboard test failure" },
        }),
      );
      await page.evaluate(() => window.dispatchEvent(new Event("focus")));
      const feedback = page.getByTestId(`${role}-dashboard-error`);
      await feedback.waitFor();
      assert.equal(await feedback.getAttribute("data-stale"), "true");
      assert.equal(await page.locator('[data-stat="meals"]').isVisible(), true);
      await page.unroute("**/api/impact");
      await feedback
        .getByRole("button", { name: uiName("Retry"), exact: true })
        .click();
      await feedback.waitFor({ state: "hidden" });
      await page.route("**/api/impact", (route) =>
        route.fulfill({
          status: 503,
          json: { error: "Temporary dashboard test failure" },
        }),
      );
      await page.reload({ waitUntil: "networkidle" });
      await page
        .getByRole("heading", { name: "Dashboard could not load", exact: true })
        .waitFor();
      await page.unroute("**/api/impact");
      await feedback
        .getByRole("button", { name: uiName("Retry"), exact: true })
        .click();
      await page.locator('[data-stat="meals"]').waitFor();
      await context.close();
    }
    // Once food is picked up, a donor sees the next stage instead of a pickup countdown.
    assert.equal(
      (
        await handover(
          assigned,
          assigned.volunteer,
          "verify",
          "PICKUP",
          await issue(assigned, "PICKUP"),
        )
      ).status,
      200,
    );
    const { context, page } = await contextFor("donor", "en", {
      width: 390,
      height: 844,
    });
    await page.goto("/donor/dashboard", { waitUntil: "networkidle" });
    const active = page.getByTestId("donor-active-donation");
    await active.waitFor();
    assert.equal(await active.getAttribute("data-status"), "PICKED_UP");
    await active
      .getByText(
        "The rider has collected this food. Follow the delivery progress.",
        { exact: true },
      )
      .waitFor();
    assert.equal(await active.getByRole("timer").count(), 0);
    await context.close();
    assert.deepEqual(runtime, []);
    await writeFile(
      `${artifacts}/checks.json`,
      JSON.stringify(
        {
          layouts: checks,
          runtime,
          refreshRecovery: true,
          initialRetry: true,
          literalTitles: true,
          postPickupStage: true,
        },
        null,
        2,
      ),
    );
  } finally {
    await browser.close();
  }
}
