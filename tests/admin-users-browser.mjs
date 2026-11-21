import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";
import { userControlsFixture } from "./admin-users.integration.mjs";
export async function runAdminUsersBrowserChecks(h) {
  const f = userControlsFixture(h),
    admin = await f.admin(),
    cookieParts = admin.split("="),
    artifacts = ".local-postgres/admin-users-browser";
  await mkdir(artifacts, { recursive: true });
  const user = await f.target("DONOR", true);
  await f.prisma.user.update({
    where: { id: user.id },
    data: { displayName: "Community Kitchen Demo" },
  });
  user.displayName = "Community Kitchen Demo";
  const ownerCookie = await f.signIn(user);
  for (const role of ["NGO", "VOLUNTEER"]) {
    const other = await f.target(role, true);
    await f.prisma.user.update({
      where: { id: other.id },
      data: {
        displayName:
          role === "NGO" ? "Community Support Foundation" : "Ayesha Rahman",
      },
    });
  }
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
      : { channel: process.env.PLAYWRIGHT_CHANNEL || undefined }),
  });
  const errors = [],
    layouts = [];
  try {
    for (const language of ["en", "bn"]) {
      const context = await browser.newContext({ baseURL: f.base });
      await context.addCookies([
        {
          name: cookieParts[0],
          value: cookieParts[1],
          url: f.base,
          httpOnly: true,
          sameSite: "Lax",
        },
      ]);
      await context.addInitScript(
        (lang) => localStorage.setItem("sharebite_preferred_lang", lang),
        language,
      );
      const page = await context.newPage();
      page.on("pageerror", (e) => errors.push(e.message));
      for (const width of [320, 390, 768, 1440]) {
        await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
        for (const route of ["verifications", "users"]) {
          await page.goto("/admin/" + route, { waitUntil: "networkidle" });
          await page.locator("main tbody tr").first().waitFor();
          assert.equal(await page.locator("main [role=alert]").count(), 0);
          assert.equal(
            await page.evaluate(
              () => document.documentElement.scrollWidth > innerWidth,
            ),
            false,
            `${language} ${width} ${route} overflow`,
          );
          const nav = page
            .locator("nav")
            .filter({ has: page.locator('a[href="/admin/reports"]') })
            .filter({ visible: true });
          assert.equal(await nav.locator("a").count(), 5);
          assert.equal(await nav.locator('[aria-current="page"]').count(), 1);
          layouts.push({ language, width, route });
          if (width === 390 || width === 1440)
            await page.screenshot({
              path: `${artifacts}/${route}-${language}-${width}.png`,
              fullPage: true,
              animations: "disabled",
            });
        }
        await page
          .getByRole("button", {
            name:
              language === "en"
                ? "Manage Community Kitchen Demo"
                : "Community Kitchen Demo-এর অ্যাকাউন্ট পরিচালনা",
            exact: true,
          })
          .click();
        const dialog = page.getByRole("dialog");
        await dialog
          .getByRole("heading", { name: user.displayName, exact: true })
          .waitFor();
        assert.equal(
          await dialog.evaluate((d) => d.scrollWidth > d.clientWidth),
          false,
          `dialog ${language} ${width} overflow`,
        );
        if (width === 390 || width === 1440)
          await page.screenshot({
            path: `${artifacts}/manage-${language}-${width}.png`,
            animations: "disabled",
          });
        await page.keyboard.press("Escape");
        await dialog.waitFor({ state: "hidden" });
        layouts.push({ language, width, route: "manage-dialog" });
      }
      await context.close();
    }
    const context = await browser.newContext({
      baseURL: f.base,
      viewport: { width: 390, height: 844 },
    });
    await context.addInitScript(() =>
      localStorage.setItem("sharebite_preferred_lang", "en"),
    );
    await context.addCookies([
      {
        name: cookieParts[0],
        value: cookieParts[1],
        url: f.base,
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);
    const page = await context.newPage();
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/admin/accounts", { waitUntil: "networkidle" });
    await page.waitForURL(/\/admin\/verifications/);
    await page
      .getByRole("button", { name: "Review " + user.displayName, exact: true })
      .waitFor();
    assert.equal(
      await page
        .getByRole("button", { name: "Ban / Block", exact: true })
        .count(),
      0,
    );
    await page
      .getByRole("navigation", { name: "User control", exact: true })
      .getByRole("link", { name: /All Users/ })
      .click();
    await page.getByLabel("Search", { exact: true }).fill(user.id);
    await page.getByRole("button", { name: "Search", exact: true }).click();
    await page
      .getByRole("button", { name: "Manage " + user.displayName, exact: true })
      .click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: /Ban \/ Block/ }).click();
    assert.equal(
      await dialog
        .getByRole("button", { name: "Confirm ban", exact: true })
        .isDisabled(),
      true,
    );
    await dialog
      .getByLabel("Reason", { exact: true })
      .fill("Account temporarily blocked for an admin review.");
    await dialog
      .getByRole("button", { name: "Confirm ban", exact: true })
      .click();
    await dialog.waitFor({ state: "hidden" });
    assert.equal(
      (await f.request("/api/profile", { cookie: ownerCookie })).status,
      401,
    );
    await page
      .getByRole("button", { name: "Manage " + user.displayName, exact: true })
      .click();
    await dialog.getByRole("button", { name: /^Unban/ }).click();
    await dialog
      .getByLabel("Reason", { exact: true })
      .fill("Account reviewed and the temporary block is removed.");
    await dialog
      .getByRole("button", { name: "Confirm unban", exact: true })
      .click();
    await dialog.waitFor({ state: "hidden" });
    assert.equal(
      (await f.request("/api/profile", { cookie: ownerCookie })).status,
      401,
    );
    assert.equal(
      (await f.request("/api/profile", { cookie: await f.signIn(user) }))
        .status,
      200,
    );
    await page
      .getByRole("button", { name: "Manage " + user.displayName, exact: true })
      .click();
    await dialog.getByRole("button", { name: /^Delete account/ }).click();
    await dialog
      .getByLabel("Reason", { exact: true })
      .fill("The account owner requested permanent account removal.");
    const remove = dialog.getByRole("button", {
      name: "Delete permanently",
      exact: true,
    });
    await dialog
      .getByLabel("Type DELETE to confirm", { exact: true })
      .fill("delete");
    assert.equal(await remove.isDisabled(), true);
    await dialog
      .getByLabel("Type DELETE to confirm", { exact: true })
      .fill("DELETE");
    assert.equal(await remove.isEnabled(), true);
    await page.screenshot({
      path: artifacts + "/delete-confirmation-mobile.png",
      animations: "disabled",
    });
    await remove.click();
    await dialog.waitFor({ state: "hidden" });
    await page
      .getByRole("combobox", { name: /^Account access/ })
      .selectOption("DELETED");
    await page
      .getByRole("button", { name: "Manage " + user.displayName, exact: true })
      .click();
    await dialog
      .getByRole("heading", { name: "Account access history", exact: true })
      .waitFor();
    assert.equal(await dialog.locator("ol > li").count(), 3);
    assert.equal(
      await dialog
        .getByRole("button", { name: /^Unban|^Delete account/ })
        .count(),
      0,
    );
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden" });
    const active = await f.assignedRescue();
    await f.prisma.user.update({
      where: { id: active.volunteerUser.id },
      data: { displayName: "Active rescue rider" },
    });
    await page
      .getByRole("combobox", { name: /^Account access/ })
      .selectOption("ALL");
    await page
      .getByLabel("Search", { exact: true })
      .fill(active.volunteerUser.id);
    await page.getByRole("button", { name: "Search", exact: true }).click();
    await page
      .getByRole("button", { name: "Manage Active rescue rider", exact: true })
      .click();
    await dialog.getByRole("button", { name: /^Delete account/ }).click();
    await dialog
      .getByRole("alert")
      .getByText("Resolve 1 active rescues before deleting this account.", {
        exact: true,
      })
      .waitFor();
    await dialog
      .getByLabel("Reason", { exact: true })
      .fill("Attempt to remove an account with an active rescue.");
    await dialog
      .getByLabel("Type DELETE to confirm", { exact: true })
      .fill("DELETE");
    assert.equal(
      await dialog
        .getByRole("button", { name: "Delete permanently", exact: true })
        .isDisabled(),
      true,
    );
    await page.screenshot({
      path: artifacts + "/active-rescue-delete-guard.png",
      animations: "disabled",
    });
    await context.close();
    assert.deepEqual(errors, []);
    await writeFile(
      artifacts + "/results.json",
      JSON.stringify(
        {
          layouts,
          runtimeErrors: errors,
          actions: ["ban", "unban", "delete", "active rescue guard"],
        },
        null,
        2,
      ),
    );
  } finally {
    await browser.close();
  }
}
