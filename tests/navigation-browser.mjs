import assert from "node:assert/strict";
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { uiLabel } from "./ui-labels.mjs";

export async function runNavigationBrowserChecks({
  base,
  login,
  assignedRescue,
}) {
  const artifacts = ".local-postgres/navigation";
  await mkdir(artifacts, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
      : { channel: process.env.PLAYWRIGHT_CHANNEL || undefined }),
  });
  const errors = [],
    checks = [];
  const paths = {
    donor: ["donations", "profile"],
    ngo: ["claims", "discover"],
    volunteer: ["dispatches", "history"],
  };
  let currentPage;
  async function finishAnimation(locator) {
    await locator.evaluate((el) =>
      Promise.all(
        el
          .getAnimations()
          .map((animation) => animation.finished.catch(() => {})),
      ),
    );
  }
  try {
    for (const role of ["donor", "ngo", "volunteer"]) {
      const { cookie } = await login(role.toUpperCase());
      for (const language of ["en", "bn"])
        for (const width of [390, 1440]) {
          const context = await browser.newContext({
            baseURL: base,
            viewport: { width, height: 1000 },
          });
          await context.addInitScript((lang) => {
            localStorage.setItem("sharebite_preferred_lang", lang);
            window.__navigationMoves = [];
            const native = Element.prototype.animate;
            Element.prototype.animate = function (frames, options) {
              if (
                this.hasAttribute("data-portal-page") ||
                ["sidebar-nav-selection", "mobile-nav-selection"].includes(
                  this.getAttribute("data-testid"),
                )
              ) {
                window.__navigationMoves.push({
                  target: this.getAttribute("data-testid") || "page",
                  path: this.getAttribute("data-portal-page"),
                  duration: options?.duration,
                  easing: options?.easing,
                });
              }
              return native.call(this, frames, options);
            };
          }, language);
          const [name, value] = cookie.split("=");
          await context.addCookies([
            { name, value, url: base, httpOnly: true, sameSite: "Lax" },
          ]);
          const page = await context.newPage();
          currentPage = page;
          page.on("pageerror", (error) => errors.push(error.message));
          const dashboard = `/${role}/dashboard`,
            first = `/${role}/${paths[role][0]}`,
            second = `/${role}/${paths[role][1]}`;
          let release;
          const held = new Promise((resolve) => {
            release = resolve;
          });
          await page.route(`**${first}?*`, async (route) => {
            if (route.request().headers().rsc === "1") await held;
            await route.continue().catch(() => {});
          });
          await page.goto(dashboard, { waitUntil: "domcontentloaded" });
          await page
            .locator(`main[data-portal-page="${dashboard}"] h1`)
            .waitFor();
          const nav = () =>
            page.getByRole("navigation", {
              name: uiLabel(
                width >= 1024
                  ? "Account sidebar"
                  : "Mobile Bottom App Navigation",
                language,
              ),
              exact: true,
            });
          await nav()
            .locator(`a[aria-current="page"][href="${dashboard}"]`)
            .waitFor();
          await page.evaluate(() => {
            window.__originalHeader = document.querySelector("header");
            window.__originalSidebar = document.querySelector("aside");
            window.__originalDock = document.querySelector(
              '[data-testid="mobile-bottom-nav"]',
            );
          });
          const persistent = async () =>
            assert.equal(
              await page.evaluate(
                () =>
                  window.__originalHeader ===
                    document.querySelector("header") &&
                  window.__originalSidebar ===
                    document.querySelector("aside") &&
                  window.__originalDock ===
                    document.querySelector('[data-testid="mobile-bottom-nav"]'),
              ),
              true,
              "Navigation chrome must keep its DOM identity",
            );
          const target = nav().locator(`a[href="${first}"]`);
          try {
            const clicking = target.click();
            await target
              .locator('[data-navigation-pending="true"]')
              .waitFor({ timeout: 5000 });
            await persistent();
            release();
            await clicking;
          } finally {
            release();
          }
          await page.waitForURL((url) => url.pathname === first);
          await page.locator(`main[data-portal-page="${first}"] h1`).waitFor();
          await nav()
            .locator(`a[aria-current="page"][href="${first}"]`)
            .waitFor();
          await persistent();
          const indicator = page.getByTestId(
            width >= 1024 ? "sidebar-nav-selection" : "mobile-nav-selection",
          );
          await finishAnimation(indicator);
          const activeBox = await nav()
              .locator('a[aria-current="page"]')
              .boundingBox(),
            pillBox = await indicator.boundingBox();
          assert.ok(
            Math.abs(activeBox.x - pillBox.x) < 1 &&
              Math.abs(activeBox.y - pillBox.y) < 1,
            "Selection must finish on its active row/tab",
          );
          const moves = await page.evaluate(() => window.__navigationMoves);
          assert.ok(
            moves.some(
              (move) =>
                move.target === "page" &&
                move.path === first &&
                move.duration === 220,
            ),
          );
          assert.ok(
            moves.some(
              (move) =>
                move.target ===
                  (width >= 1024
                    ? "sidebar-nav-selection"
                    : "mobile-nav-selection") && move.duration === 320,
            ),
          );
          assert.ok(
            moves.every((move) => move.easing === "cubic-bezier(.2,.75,.25,1)"),
          );
          const entries = moves.filter((move) => move.target === "page").length;
          await nav().locator(`a[href="${first}"]`).click();
          await page.evaluate(
            () =>
              new Promise((resolve) =>
                requestAnimationFrame(() => requestAnimationFrame(resolve)),
              ),
          );
          assert.equal(
            await page.evaluate(
              () =>
                window.__navigationMoves.filter(
                  (move) => move.target === "page",
                ).length,
            ),
            entries,
            "Same-page navigation must not replay page entry",
          );

          // Real route changes and browser history retain the same frame.
          await nav().locator(`a[href="${second}"]`).click();
          await page.waitForURL((url) => url.pathname === second);
          await page.locator(`main[data-portal-page="${second}"] h1`).waitFor();
          await page.goBack({ waitUntil: "domcontentloaded" });
          await page.locator(`main[data-portal-page="${first}"] h1`).waitFor();
          await page.goForward({ waitUntil: "domcontentloaded" });
          await page.locator(`main[data-portal-page="${second}"] h1`).waitFor();
          await persistent();

          // Consecutive selections must settle on the latest destination.
          await nav()
            .locator(`a[href="${dashboard}"]`)
            .evaluate((link) => link.click());
          await nav()
            .locator(`a[href="${first}"]`)
            .evaluate((link) => link.click());
          await page.locator(`main[data-portal-page="${first}"] h1`).waitFor();
          await nav().locator(`a[href="${second}"]`).click();
          await page.locator(`main[data-portal-page="${second}"] h1`).waitFor();
          await persistent();

          if (width < 1024) {
            await page
              .getByRole("button", {
                name: uiLabel("Open mobile navigation menu", language),
                exact: true,
              })
              .click();
            const drawer = page.getByRole("dialog", {
              name: uiLabel("Account navigation", language),
              exact: true,
            });
            await drawer.locator(`a[href="${dashboard}"]`).click();
            await drawer.waitFor({ state: "hidden" });
            await page
              .locator(`main[data-portal-page="${dashboard}"] h1`)
              .waitFor();
            await persistent();
          }
          await page.emulateMedia({ reducedMotion: "reduce" });
          const before = await page.evaluate(
            () => window.__navigationMoves.length,
          );
          const reducedTarget = width < 1024 ? first : dashboard;
          await nav().locator(`a[href="${reducedTarget}"]`).click();
          await page
            .locator(`main[data-portal-page="${reducedTarget}"] h1`)
            .waitFor();
          assert.equal(
            await page.evaluate(() => window.__navigationMoves.length),
            before,
            "Reduced motion disables both page and selection movement",
          );
          assert.equal(await page.locator("main").count(), 1);
          assert.equal(
            await page.evaluate(
              () => document.documentElement.scrollWidth > innerWidth,
            ),
            false,
          );
          await page.screenshot({
            path: `${artifacts}/${role}-${language}-${width}.png`,
            fullPage: true,
            animations: "disabled",
          });
          checks.push({
            role,
            language,
            width,
            pending: true,
            persistent: true,
            history: true,
            reducedMotion: true,
          });
          console.log(
            `Navigation ${role} ${language} ${width}: pending, persistent frame, shared motion, history and reduced motion passed.`,
          );
          await context.close();
        }
    }
    const rescue = await assignedRescue();
    const context = await browser.newContext({
      baseURL: base,
      viewport: { width: 1440, height: 1000 },
    });
    const [name, value] = rescue.volunteer.split("=");
    await context.addCookies([
      { name, value, url: base, httpOnly: true, sameSite: "Lax" },
    ]);
    const page = await context.newPage();
    currentPage = page;
    await page.addInitScript(() =>
      localStorage.setItem("sharebite_preferred_lang", "en"),
    );
    page.on("pageerror", (error) => errors.push(error.message));
    const mission = `/volunteer/missions/mission-${rescue.claim.id}`;
    await page.goto(mission, { waitUntil: "domcontentloaded" });
    await page
      .getByRole("navigation", { name: "Account sidebar", exact: true })
      .locator(`a[aria-current="page"][href="${mission}"]`)
      .waitFor();
    await page.setViewportSize({ width: 320, height: 900 });
    await page
      .getByRole("button", { name: "Open mobile navigation menu", exact: true })
      .click();
    await page
      .getByRole("dialog")
      .locator(`a[aria-current="page"][href="${mission}"]`)
      .waitFor();
    await page.keyboard.press("Escape");
    assert.deepEqual(errors, []);
    await writeFile(
      `${artifacts}/results.json`,
      JSON.stringify(
        { checks, missionNavigation: true, runtime: errors },
        null,
        2,
      ),
    );
  } catch (error) {
    if (currentPage && !currentPage.isClosed())
      await currentPage
        .screenshot({ path: `${artifacts}/failure.png`, fullPage: true })
        .catch(() => {});
    throw error;
  } finally {
    await browser.close();
  }
}
