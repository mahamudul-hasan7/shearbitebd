import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { uiLabel } from "./ui-labels.mjs";

export async function runRiderDutyMenuChecks({ base, dutyRider, dutyClaim, jsonResult }) {
  await mkdir(".local-postgres/duty-menu", { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH, channel: process.env.PLAYWRIGHT_CHANNEL || undefined });
  try {
    for (const [width, language] of [[320, "bn"], [390, "en"], [1280, "en"]]) {
      const rider = await dutyRider();
      const food = await dutyClaim();
      const context = await browser.newContext({ baseURL: base, viewport: { width, height: 900 } });
      await context.addInitScript(lang => localStorage.setItem("sharebite_preferred_lang", lang), language);
      const [name, value] = rider.cookie.split("=");
      await context.addCookies([{ name, value, url: base, httpOnly: true, sameSite: "Lax" }]);
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", e => errors.push(e.message));
      const t = text => uiLabel(text, language);
      async function open(target = page) {
        await target.getByRole("button", { name: t("Open account menu"), exact: true }).click();
        const menu = target.getByRole("dialog", { name: t("User Account Settings"), exact: true });
        const toggle = menu.getByRole("switch", { name: t("Duty ON/OFF"), exact: true });
        await toggle.waitFor();
        await menu.evaluate(async node => Promise.allSettled(node.getAnimations({ subtree: true }).filter(animation => animation.effect?.getComputedTiming().iterations !== Infinity).map(animation => animation.finished)));
        return toggle;
      }
      async function dismissOffer(target) {
        const offer = target.getByTestId("rider-incoming-offer");
        await offer.waitFor();
        await offer.getByRole("button", { name: t("Not now; keep it in the list"), exact: true }).click();
        await offer.waitFor({ state: "hidden" });
      }
      await page.goto("/volunteer/dashboard", { waitUntil: "networkidle" });
      await page.getByTestId("rider-impact").waitFor();
      assert.equal(await page.getByTestId("volunteer-duty-panel").count(), 0);
      assert.equal(await page.getByRole("heading", { name: t("Your next mission step"), exact: true }).count(), 0);
      assert.ok((await page.getByTestId("rider-impact").boundingBox()).y < 500);
      const toggle = await open();
      assert.equal(await toggle.getAttribute("aria-checked"), "false");
      assert.equal(await toggle.isEnabled(), true);
      assert.ok((await toggle.boundingBox()).height >= 44);
      if (width === 320) {
        await page.route("**/api/volunteer/duty", route => route.request().method() === "PATCH"
          ? route.fulfill({ status: 500, json: { error: "Duty status could not be saved. Try again." } })
          : route.continue());
        await toggle.click();
        await page.getByTestId("volunteer-duty-switch").getByRole("alert").waitFor();
        assert.equal(await toggle.getAttribute("aria-checked"), "false");
        await page.unroute("**/api/volunteer/duty");
        await page.getByRole("button", { name: t("Retry"), exact: true }).click();
        await page.getByTestId("volunteer-duty-switch").getByRole("alert").waitFor({ state: "hidden" });
      }
      await page.screenshot({ path: `.local-postgres/duty-menu/off-${width}-${language}.png` });
      await toggle.click();
      await dismissOffer(page);
      assert.equal((await jsonResult("/api/volunteer/duty", { cookie: rider.cookie })).duty.isOnDuty, true);
      await page.reload({ waitUntil: "networkidle" });
      const saved = await open();
      assert.equal(await saved.getAttribute("aria-checked"), "true");
      await page.screenshot({ path: `.local-postgres/duty-menu/on-${width}-${language}.png` });
      const other = await context.newPage();
      await other.goto("/volunteer/history", { waitUntil: "networkidle" });
      await dismissOffer(other);
      const otherToggle = await open(other);
      await otherToggle.click();
      await page.bringToFront();
      await page.waitForFunction(() => document.querySelector('[role="switch"]')?.getAttribute("aria-checked") === "false");
      assert.equal((await jsonResult("/api/volunteer/duty", { cookie: rider.cookie })).duty.isOnDuty, false);
      await other.close();
      await saved.click();
      await page.waitForFunction(() => document.querySelector('[role="switch"]')?.getAttribute("aria-checked") === "true");
      await jsonResult("/api/dispatches", { cookie: rider.cookie, method: "POST", body: { claimId: food.claim.id } });
      await saved.click();
      await page.waitForFunction(() => document.querySelector('[role="switch"]')?.getAttribute("aria-checked") === "false");
      assert.equal((await jsonResult("/api/missions", { cookie: rider.cookie })).activeMission.claimId, food.claim.id);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      assert.deepEqual(errors, []);
      await context.close();
    }
  } finally {
    await browser.close();
  }
}
