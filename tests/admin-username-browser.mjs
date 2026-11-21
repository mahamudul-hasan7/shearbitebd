import assert from "node:assert/strict";
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { uiLabel } from "./ui-labels.mjs";
export async function runAdminUsernameBrowserChecks({ prisma, base }) {
  const admin = await prisma.user.create({
    data: {
      email: "username-browser@example.test",
      username: "admin",
      password: "admin123",
      displayName: "ShareBite Admin",
      role: "ADMIN",
    },
  });
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
      : { channel: process.env.PLAYWRIGHT_CHANNEL || undefined }),
  });
  const errors = [],
    checks = [];
  const artifacts = ".local-postgres/admin-username-browser";
  await mkdir(artifacts, { recursive: true });
  try {
    for (const language of ["bn", "en"])
      for (const width of [320, 390, 1440]) {
        const context = await browser.newContext({
          baseURL: base,
          viewport: { width, height: 900 },
        });
        await context.addInitScript(
          (lang) => localStorage.setItem("sharebite_preferred_lang", lang),
          language,
        );
        const page = await context.newPage();
        page.on("pageerror", (error) => errors.push(error.message));
        await page.goto("/login", { waitUntil: "networkidle" });
        await page
          .getByLabel(uiLabel("Email, mobile or username", language), {
            exact: true,
          })
          .fill("admin");
        await page.locator("#login-password").fill("admin123");
        await page.screenshot({
          path: `${artifacts}/login-${width}-${language}.png`,
          animations: "disabled",
          fullPage: width === 1440,
        });
        await page
          .getByRole("button", {
            name: uiLabel("Sign in", language),
            exact: true,
          })
          .click();
        await page.waitForURL("**/admin/dashboard");
        await page
          .getByText(uiLabel("Pending accounts", language), { exact: true })
          .waitFor();
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
        );
        await context.close();
        checks.push({ width, language, role: "ADMIN", passed: true });
      }
    assert.deepEqual(errors, []);
    await writeFile(
      `${artifacts}/checks.json`,
      JSON.stringify({ checks, errors }, null, 2),
    );
  } finally {
    await browser.close();
    await prisma.user.delete({ where: { id: admin.id } });
  }
}
