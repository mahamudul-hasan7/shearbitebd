import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";
import { adminFixtures } from "./admin.integration.mjs";

export async function runAdminBrowserChecks(helpers) {
  const { prisma, login, base } = helpers;
  const fixture = await adminFixtures(helpers, "browser-admin");
  const artifacts = ".local-postgres/admin-browser";
  await mkdir(artifacts, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
      : process.env.PLAYWRIGHT_CHANNEL
        ? { channel: process.env.PLAYWRIGHT_CHANNEL }
        : {}),
  });
  const issues = [],
    runtime = [];
  const { cookie } = await login("ADMIN");
  const [name, value] = cookie.split("=");
  try {
    for (const language of ["en", "bn"]) {
      const context = await browser.newContext({ baseURL: base });
      await context.addCookies([
        { name, value, url: base, httpOnly: true, sameSite: "Lax" },
      ]);
      await context.addInitScript(
        (lang) => localStorage.setItem("sharebite_preferred_lang", lang),
        language,
      );
      const page = await context.newPage();
      page.on("pageerror", (error) => runtime.push(error.message));
      for (const width of [320, 390, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
        for (const route of ["dashboard", "verifications", "users", "rescues", "reports"]) {
          await page.goto("/admin/" + route, { waitUntil: "networkidle" });
          await page.locator("main h1").waitFor();
          assert.equal(await page.locator("main [role=alert]").count(), 0);
          const overflow = await page.evaluate(() => ({
            width: innerWidth,
            scroll: document.documentElement.scrollWidth,
          }));
          if (overflow.scroll > overflow.width)
            issues.push({ language, width, route, overflow });
          const nav = page.getByRole("navigation", {
            name:
              language === "en"
                ? width < 1024
                  ? "Mobile admin navigation"
                  : "Admin navigation"
                : width < 1024
                  ? "মোবাইল অ্যাডমিন নেভিগেশন"
                  : "অ্যাডমিন নেভিগেশন",
            exact: true,
          });
          assert.equal(await nav.locator('[aria-current="page"]').count(), 1);
          if (route === "dashboard" || width === 390)
            await page.screenshot({
              path: `${artifacts}/${route}-${language}-${width}.png`,
              fullPage: true,
              animations: "disabled",
            });
        }
      }
      await context.close();
    }
    const context = await browser.newContext({
      baseURL: base,
      viewport: { width: 390, height: 844 },
    });
    await context.addCookies([
      { name, value, url: base, httpOnly: true, sameSite: "Lax" },
    ]);
    await context.addInitScript(() =>
      localStorage.setItem("sharebite_preferred_lang", "en"),
    );
    const page = await context.newPage();
    page.on("pageerror", (e) => runtime.push(e.message));
    await page.goto("/admin/accounts", { waitUntil: "networkidle" });
    await page
      .getByRole("button", { name: "Review Green Table Kitchen", exact: true })
      .click();
    const dialog = page.getByRole("dialog");
    await dialog
      .getByRole("heading", { name: "Green Table Kitchen", exact: true })
      .waitFor();
    assert.equal(
      await dialog
        .getByRole("button", { name: "Save review", exact: true })
        .isDisabled(),
      true,
    );
    await dialog
      .getByLabel("Review note", { exact: true })
      .fill("Identity and registration checked with the account owner.");
    await page.screenshot({
      path: `${artifacts}/account-review-mobile.png`,
      fullPage: false,
      animations: "disabled",
    });
    await dialog
      .getByRole("button", { name: "Save review", exact: true })
      .click();
    await dialog.waitFor({ state: "hidden" });
    assert.equal(
      (
        await prisma.donorProfile.findUniqueOrThrow({
          where: { userId: fixture.pending[0] },
        })
      ).verificationStatus,
      "VERIFIED",
    );
    await page
      .getByRole("button", {
        name: "Review Hope Community Foundation",
        exact: true,
      })
      .click();
    await dialog.getByLabel("Reject account", { exact: true }).check();
    await dialog
      .getByLabel("Review note", { exact: true })
      .fill("Registration number requires correction before approval.");
    await dialog
      .getByRole("button", { name: "Save review", exact: true })
      .click();
    await dialog.waitFor({ state: "hidden" });
    assert.equal(
      (
        await prisma.nGOProfile.findUniqueOrThrow({
          where: { userId: fixture.pending[1] },
        })
      ).verificationStatus,
      "REJECTED",
    );
    await page
      .getByRole("combobox", { name: "Status", exact: true })
      .selectOption("REJECTED");
    await page
      .getByRole("button", {
        name: "Review Hope Community Foundation",
        exact: true,
      })
      .waitFor();
    await page
      .getByLabel("Search", { exact: true })
      .fill("no-such-user-123456");
    await page.getByRole("button", { name: "Search", exact: true }).click();
    await page
      .getByText("No records match these filters.", { exact: true })
      .waitFor();
    await page.goto("/admin/reports", { waitUntil: "networkidle" });
    await page
      .getByRole("button", {
        name: "Review Fresh meals for the community",
        exact: true,
      })
      .click();
    await dialog
      .getByRole("heading", {
        name: "Fresh meals for the community",
        exact: true,
      })
      .waitFor();
    await page.screenshot({
      path: `${artifacts}/report-review-mobile.png`,
      fullPage: false,
      animations: "disabled",
    });
    await dialog
      .getByLabel("Review action", { exact: true })
      .selectOption("UNDER_REVIEW");
    await dialog
      .getByLabel("Review note", { exact: true })
      .fill("Contacting both parties to check the packet quantity.");
    await dialog
      .getByRole("button", { name: "Save review", exact: true })
      .click();
    await dialog.waitFor({ state: "hidden" });
    await page
      .getByRole("button", {
        name: "Review Fresh meals for the community",
        exact: true,
      })
      .click();
    await dialog
      .getByLabel("Review action", { exact: true })
      .selectOption("RESUME");
    await dialog
      .getByLabel("Review note", { exact: true })
      .fill("Both parties confirmed the correct quantity. Resume safely.");
    await dialog
      .getByRole("button", { name: "Save review", exact: true })
      .click();
    await dialog.waitFor({ state: "hidden" });
    assert.equal(
      (
        await prisma.claim.findUniqueOrThrow({
          where: { id: fixture.claim.id },
        })
      ).status,
      "RESERVED",
    );
    await page.route("**/api/admin/overview", (route) => route.abort());
    await page.goto("/admin/dashboard", { waitUntil: "networkidle" });
    await page
      .getByRole("button", { name: "Try again", exact: true })
      .waitFor();
    await page.unroute("**/api/admin/overview");
    await page.getByRole("button", { name: "Try again", exact: true }).click();
    await page.getByText("Pending accounts", { exact: true }).waitFor();
    await page.goto("/admin/accounts", { waitUntil: "networkidle" });
    await page
      .getByRole("button", { name: "Review Nusrat Jahan", exact: true })
      .click();
    await dialog
      .getByRole("heading", { name: "Nusrat Jahan", exact: true })
      .waitFor();
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden" });
    await page.emulateMedia({ reducedMotion: "reduce" });
    assert.equal(
      await page.locator('main a[href="/admin/accounts"]').count(),
      0,
    );
    await page.goto("/admin/dashboard", { waitUntil: "networkidle" });
    assert.equal(
      await page
        .locator('main a[href="/admin/verifications"]')
        .first()
        .evaluate((el) => getComputedStyle(el).animationName),
      "none",
    );
    await context.close();
    const signInContext = await browser.newContext({
      baseURL: base,
      viewport: { width: 1440, height: 1000 },
    });
    await signInContext.addInitScript(() =>
      localStorage.setItem("sharebite_preferred_lang", "en"),
    );
    const signInPage = await signInContext.newPage();
    await signInPage.goto("/login", { waitUntil: "networkidle" });
    await signInPage
      .getByLabel("Email, mobile or username", { exact: true })
      .fill("admin@example.test");
    await signInPage.locator("#login-password").fill(helpers.fixturePassword);
    await signInPage
      .getByRole("button", { name: "Sign in", exact: true })
      .click();
    await signInPage.waitForURL("**/admin/dashboard");
    await signInPage.getByText("Pending accounts", { exact: true }).waitFor();
    await signInContext.close();
    assert.deepEqual(issues, [], "Responsive layout overflows");
    assert.deepEqual(runtime, [], "Runtime and hydration errors");
    await writeFile(
      `${artifacts}/result.json`,
      JSON.stringify(
        {
          layouts: 40,
          issues,
          runtime,
          workflows: [
            "admin sign-in",
            "approval",
            "rejection",
            "search",
            "filter",
            "report review",
            "resume",
            "network retry",
            "escape",
            "reduced motion",
          ],
        },
        null,
        2,
      ),
    );
  } finally {
    await browser.close();
  }
}
