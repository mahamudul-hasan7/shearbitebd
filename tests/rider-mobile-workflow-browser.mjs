import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";
import { uiLabel } from "./ui-labels.mjs";

export async function runRiderMobileWorkflowChecks(h) {
  const { base, prisma, assignedRescue, request, issue, login } = h;
  const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH });
  const out = ".local-postgres/rider-mobile-workflow";
  await mkdir(out, { recursive: true });
  const errors = [], results = [];
  function assertBox(box, limit, label) {
    assert.ok(box && box.y >= 0 && box.y + box.height <= limit + 1, `${label} must fit without scrolling: ${JSON.stringify(box)}, limit ${limit}`);
  }
  async function visibleAction(page, locator) {
    await locator.waitFor();
    await page.waitForFunction(() => {
      const task = document.querySelector('[data-testid="rider-current-task"]');
      const header = document.querySelector('header');
      if (!task || !header) return false;
      const r = task.getBoundingClientRect();
      return r.top >= header.getBoundingClientRect().bottom - 2 && r.top < innerHeight;
    });
    assertBox(await locator.boundingBox(), page.viewportSize().height, "Next mission action");
  }
  try {
    for (const [width, height, language] of [[320,568,"bn"],[390,844,"en"],[430,932,"bn"],[844,390,"en"],[1280,900,"en"]]) {
      const t = source => uiLabel(source, language);
      const rescue = await assignedRescue();
      if (width === 320) await prisma.donation.update({ where: { id: rescue.donation.id }, data: { title: "ক্যাফেটেরিয়ার অতিরিক্ত ভাত, সবজি ও ডালের খাবারের প্যাকেট — সন্ধ্যার বিতরণের জন্য" } });
      const context = await browser.newContext({ baseURL: base, viewport: { width, height }, timezoneId: "Asia/Dhaka" });
      await context.addInitScript(lang => localStorage.setItem("sharebite_preferred_lang", lang), language);
      const [name, value] = rescue.volunteer.split("=");
      await context.addCookies([{ name, value, url: base, httpOnly: true, sameSite: "Lax" }]);
      const page = await context.newPage();
      page.on("pageerror", error => errors.push(error.message));
      try {
        await page.goto("/volunteer/dashboard", { waitUntil: "networkidle" });
        const focus = page.getByTestId("rider-mission-focus");
        await focus.waitFor();
        const primary = focus.getByRole("link", { name: t("Continue mission"), exact: true });
        const bottom = page.getByRole("navigation", { name: t("Mobile Bottom App Navigation"), exact: true });
        const visibleLimit = width < 1024 ? (await bottom.boundingBox()).y : height;
        assertBox(await primary.boundingBox(), visibleLimit, "Dashboard mission shortcut");
        const stats = page.getByTestId("rider-impact");
        if (width < 1024) {
          assert.ok((await stats.boundingBox()).height < 170, "Compact contribution cards should stay in one row");
          const cards = await stats.locator(':scope > div').all();
          const tops = await Promise.all(cards.map(card => card.boundingBox().then(box => box.y)));
          assert.ok(Math.max(...tops) - Math.min(...tops) < 2, "All three contribution cards align in one row");
          const demo = page.getByTestId("demo-role-switcher");
          assert.equal(await demo.evaluate(node => getComputedStyle(node).position), "relative");
          await demo.getByRole("button", { name: t("Demo roles"), exact: true }).click();
          await demo.getByRole("button", { name: "Donor", exact: true }).waitFor();
          await demo.getByRole("button", { name: t("Demo roles"), exact: true }).click();
          await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
        }
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        await page.screenshot({ path: `${out}/dashboard-${width}-${language}.png` });
        await primary.click();
        await page.waitForURL("**/volunteer/missions/mission-" + rescue.claim.id);
        const task = page.getByTestId("rider-current-task");
        await task.waitFor();
        const refresh = page.getByRole("button", { name: t("Refresh"), exact: true });
        const refreshBox = await refresh.boundingBox(), titleBox = await page.getByRole("heading", { level: 1 }).boundingBox();
        assert.ok(refreshBox.width <= 45 && refreshBox.height >= 44 && refreshBox.height <= 45, "Refresh is a compact 44px touch target");
        assert.ok(refreshBox.x > titleBox.x + titleBox.width - 1 && Math.abs((refreshBox.y + refreshBox.height / 2) - (titleBox.y + titleBox.height / 2)) < 20, "Refresh belongs to the right of the page title");
        const reloaded = page.waitForResponse(res => res.url().includes('/api/missions') && res.request().method() === 'GET');
        await refresh.click(); assert.equal((await reloaded).status(), 200);
        const start = task.getByRole("button", { name: t("Start pickup trip"), exact: true });
        assertBox(await start.boundingBox(), height, "Initial pickup action");
        await page.screenshot({ path: `${out}/mission-${width}-${language}.png` });

        if (width === 320 || width === 390) {
          await start.click();
          const arrived = task.getByRole("button", { name: t("I have arrived at pickup"), exact: true });
          await visibleAction(page, arrived);
          await arrived.click();
          const code = page.getByLabel(t("Six-digit handover code"), { exact: true });
          const confirmPickup = task.getByRole("button", { name: t("Confirm pickup"), exact: true });
          await visibleAction(page, confirmPickup);
          const pickup = await issue(rescue, "PICKUP");
          if (width === 320) {
            await code.fill(pickup === "111111" ? "222222" : "111111");
            await confirmPickup.click();
            await task.getByRole("alert").waitFor();
            assert.equal((await prisma.claim.findUniqueOrThrow({ where: { id: rescue.claim.id } })).status, "ASSIGNED");
          }
          await code.fill(pickup); await confirmPickup.click();
          const deliveryTrip = task.getByRole("button", { name: t("Start delivery trip"), exact: true });
          await visibleAction(page, deliveryTrip); await deliveryTrip.click();
          const confirmDelivery = task.getByRole("button", { name: t("Confirm delivery"), exact: true });
          await visibleAction(page, confirmDelivery);
          await code.fill(await issue(rescue, "DELIVERY"));
          await page.screenshot({ path: `${out}/handover-${width}-${language}.png` });
          await confirmDelivery.click();
          await task.getByRole("link", { name: t("View mission history"), exact: true }).waitFor();
          assert.equal((await prisma.claim.findUniqueOrThrow({ where: { id: rescue.claim.id } })).status, "DELIVERED");
          assert.equal(await page.getByTestId("mission-handover").count(), 0);
        }
        if (width < 1024) {
          const progress = page.getByTestId("rescue-progress");
          assert.equal(await progress.locator('ol > li:visible').count(), 1);
          await progress.getByRole("button", { name: t("Show all checkpoints"), exact: true }).click();
          assert.equal(await progress.locator('ol > li:visible').count(), 6);
          await progress.getByRole("button", { name: t("Hide extra checkpoints"), exact: true }).click();
        }
        await page.goto("/volunteer/dispatches", { waitUntil: "networkidle" });
        const dispatchRefresh = page.getByRole("button", { name: t("Refresh dispatches"), exact: true });
        const b = await dispatchRefresh.boundingBox(), h1 = await page.getByRole("heading", { level: 1 }).boundingBox();
        assert.ok(b.width <= 45 && b.x > h1.x + h1.width - 1, "Dispatch refresh also sits on the right");
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        results.push({ width, height, language, primaryAboveFold: true, compactStats: width < 1024, refresh: true, fullHandover: width === 320 || width === 390 });
      } catch (error) {
        await page.screenshot({ path: `${out}/failure-${width}-${language}.png`, fullPage: true });
        await writeFile(`${out}/failure-${width}.json`, JSON.stringify({ error: error.message, text: await page.locator('body').innerText(), errors }, null, 2));
        throw error;
      } finally { await context.close(); }
    }
    // Confirm that the donor account still has its authenticated session.
    const donorCookie = (await login()).cookie;
    assert.equal((await request("/api/auth/session", { cookie: donorCookie })).status, 200);
    assert.deepEqual(errors, [], "No runtime errors");
    await writeFile(`${out}/results.json`, JSON.stringify(results, null, 2));
    console.log("Rider mobile workflow passed:", JSON.stringify(results));
  } finally { await browser.close(); }
}
