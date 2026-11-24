import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { uiLabel } from "./ui-labels.mjs";
import { chromium } from "playwright";

export async function runAuthPageBrowserChecks({ base, prisma }) {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
      : { channel: process.env.PLAYWRIGHT_CHANNEL || undefined }),
  });
  const artifacts = ".local-postgres/auth-pages-browser";
  await mkdir(artifacts, { recursive: true });
  const failures = [];
  let sequence = 1;
  try {
    for (const width of [320, 390, 1024, 1440]) {
      for (const language of ["bn", "en"]) {
        const context = await browser.newContext({
          baseURL: base,
          viewport: { width, height: 900 },
        });
        await context.addInitScript(
          (lang) => localStorage.setItem("sharebite_preferred_lang", lang),
          language,
        );
        const page = await context.newPage();
        page.on("pageerror", (error) => failures.push(error.message));
        for (const route of ["/login", "/register?role=NGO"]) {
          await page.goto(route, { waitUntil: "networkidle" });
          await page.evaluate(() => document.fonts.ready);
          assert.equal(
            await page.evaluate(
              () => document.documentElement.scrollWidth > innerWidth,
            ),
            false,
            width + route,
          );
          const placeholder = await page
            .locator('input[name="password"]')
            .getAttribute("placeholder");
          assert.equal(/[\u0980-\u09ff]/.test(placeholder), language === "bn");
          if (!route.startsWith("/login") && width >= 1024) {
            const first = await page
              .locator('input[name="password"]')
              .boundingBox();
            const second = await page
              .locator('input[name="confirmPassword"]')
              .boundingBox();
            assert.ok(
              Math.abs(first.y - second.y) < 1,
              "Password fields should align",
            );
          }
          if (language === "en") {
            const body = await page.locator("body").innerText();
            assert.equal(
              /[\u0980-\u09ff]/.test(body.replaceAll("বাংলা", "")),
              false,
              "English screen contains untranslated text",
            );
          }
          if (route.startsWith("/register"))
            assert.equal(
              await page.locator('select[name="role"]').inputValue(),
              "ngo",
            );
          await page.screenshot({
            path: `${artifacts}/${width}-${language}-${route.startsWith("/login") ? "login" : "register"}.png`,
            fullPage: true,
          });
        }
        await page.goto("/role-selection", { waitUntil: "networkidle" });
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
        );
        const roleLinks = await page
          .locator('a[href^="/register?role="]')
          .evaluateAll((links) =>
            links.map((link) => link.getAttribute("href")).sort(),
          );
        assert.deepEqual(roleLinks, [
          "/register?role=donor",
          "/register?role=ngo",
          "/register?role=volunteer",
        ]);
        await page.screenshot({
          path: `${artifacts}/${width}-${language}-roles.png`,
          fullPage: true,
        });
        await page.goto("/login", { waitUntil: "networkidle" });
        assert.equal(
          await page.locator('input[name="email"]').inputValue(),
          "",
        );
        assert.equal(
          await page.locator('input[name="password"]').inputValue(),
          "",
        );
        await page.locator('button[type="submit"]').click();
        await page.waitForFunction(
          () => document.activeElement?.id === "login-email",
        );
        assert.equal(
          await page.locator("#login-email").getAttribute("aria-invalid"),
          "true",
        );
        await context.close();
      }
    }

    for (const [role, width, language] of [
      ["donor", 390, "bn"],
      ["ngo", 1440, "en"],
      ["volunteer", 320, "en"],
    ]) {
      const context = await browser.newContext({
        baseURL: base,
        viewport: { width, height: 900 },
      });
      await context.addInitScript(
        (lang) => localStorage.setItem("sharebite_preferred_lang", lang),
        language,
      );
      const page = await context.newPage();
      page.on("pageerror", (error) => failures.push(error.message));
      const email = `auth-screen-${role}@example.test`;
      const phone = "01888" + String(sequence++).padStart(6, "0");
      const password = "AccountPassword123 ";
      let submissions = 0;
      page.on("request", (request) => {
        if (
          request.url().endsWith("/api/auth/register") &&
          request.method() === "POST"
        )
          submissions++;
      });
      await page.goto("/register?role=" + role.toUpperCase(), {
        waitUntil: "networkidle",
      });
      const form = page.locator("form");
      await form.locator('input[name="fullName"]').fill("Test " + role);
      await form
        .locator('input[name="email"]')
        .fill(role === "volunteer" ? "donor@example.test" : email);
      await form.locator('input[name="phone"]').fill(phone);
      await form.locator('input[name="password"]').fill(password);
      await form.locator('input[name="confirmPassword"]').fill(password);
      if (role === "donor") {
        await page.getByRole("button", { name: "EN", exact: true }).click();
        await page.waitForFunction(
          () => document.documentElement.lang === "en",
        );
        assert.equal(
          await form.locator('input[name="password"]').inputValue(),
          password,
        );
        assert.equal(
          await form.locator('input[name="email"]').inputValue(),
          email,
        );
        await page.getByRole("button", { name: "বাংলা", exact: true }).click();
        await page.waitForFunction(
          () => document.documentElement.lang === "bn",
        );
      }
      const toggles = form.locator('button[aria-controls="password"]');
      await toggles.first().click();
      assert.equal(
        await form.locator('input[name="password"]').getAttribute("type"),
        "text",
      );
      assert.equal(
        await form.locator('input[name="password"]').inputValue(),
        password,
      );
      await form.locator('input[name="confirmPassword"]').press("Enter");
      await form.locator('[name="address"]').waitFor();
      assert.equal(
        submissions,
        0,
        "Enter on the account step should advance without registration",
      );
      if (role !== "volunteer")
        await form.locator('[name="organizationName"]').fill("Sample " + role);
      if (role === "donor")
        await form
          .locator('[name="donorType"]')
          .selectOption("event_organizer");
      if (role === "ngo") {
        await form.locator('[name="registrationNumber"]').fill("TEST-123");
        await form
          .locator('[name="notes"]')
          .fill("Test distribution capacity.");
      }
      await form.locator('[name="address"]').fill("Test address in Dhaka");
      await form.getByRole("button").last().click();
      await form.locator('input[name="terms"]').waitFor();
      assert.equal(
        await form.locator('input[name="terms"]').isChecked(),
        false,
      );
      await form.locator('button[type="submit"]').click();
      assert.equal(
        await form.locator('input[name="terms"]').getAttribute("aria-invalid"),
        "true",
      );
      assert.equal(submissions, 0);
      await form.locator('input[name="terms"]').check();

      if (role === "ngo") {
        await page.route("**/api/auth/register", (route) => route.abort());
        await form.locator('button[type="submit"]').click();
        await form.getByRole("alert").waitFor();
        assert.equal(
          await form.locator('input[name="terms"]').isChecked(),
          true,
        );
        await page.unroute("**/api/auth/register");
      }
      if (role === "volunteer") {
        await form.locator('button[type="submit"]').click();
        await form.locator('input[name="email"]').waitFor();
        await form.getByRole("alert").waitFor();
        assert.equal(
          await form.locator('input[name="fullName"]').inputValue(),
          "Test volunteer",
        );
        await form.locator('input[name="email"]').fill(email);
        await form.locator('input[name="confirmPassword"]').press("Enter");
        await form.locator('[name="address"]').waitFor();
        assert.equal(
          await form.locator('[name="address"]').inputValue(),
          "Test address in Dhaka",
        );
        await form.getByRole("button").last().click();
        await form.locator('input[name="terms"]').waitFor();
      }
      if (role === "ngo") {
        await page.route("**/api/auth/session", (route) =>
          route.fulfill({
            status: 503,
            json: { error: "Temporary session read failure" },
          }),
        );
      }
      await form.locator('button[type="submit"]').click();
      await page.waitForFunction(() => !document.querySelector("form"));
      if (role === "ngo") {
        assert.equal(
          await page
            .getByRole("link", { name: "Sign in", exact: true })
            .getAttribute("href"),
          "/login",
        );
        await page.unroute("**/api/auth/session");
      }
      const row = await prisma.user.findUnique({
        where: { email },
        include: {
          donorProfile: true,
          ngoProfile: true,
          volunteerProfile: true,
        },
      });
      assert.ok(row);
      assert.equal(row.role, role.toUpperCase());
      if (role === "donor")
        assert.equal(row.donorProfile.donorType, "EVENT_ORGANIZER");
      assert.equal((row.donorProfile || row.ngoProfile || row.volunteerProfile).verificationStatus, "VERIFIED");
      await page.getByText(uiLabel("Your account was approved automatically at registration.", language), { exact: true }).waitFor();
      assert.ok((await page.locator("body").innerText()).includes(email));
      await page.screenshot({
        path: `${artifacts}/${role}-success.png`,
        fullPage: true,
      });

      await context.clearCookies();
      await page.goto(
        "/login?next=" + encodeURIComponent("/" + role + "/dashboard"),
        { waitUntil: "networkidle" },
      );
      await page.locator('input[name="email"]').fill(email);
      await page.locator('input[name="password"]').fill("WrongPassword123");
      await page.locator('button[type="submit"]').click();
      await page.locator("form").getByRole("alert").waitFor();
      assert.equal(
        await page.locator('input[name="email"]').inputValue(),
        email,
      );
      await page.locator('input[name="password"]').fill(password);
      if (role === "ngo")
        await page.locator('input[name="email"]').fill("+88" + phone);
      if (role === "donor")
        await page.locator('input[type="checkbox"]').uncheck();
      await page.locator('button[type="submit"]').click();
      await page.waitForURL("**/" + role + "/dashboard");
      await page.goto("/" + role + "/notifications", { waitUntil: "networkidle" });
      const approval = page.locator('main article[data-unread="true"]').filter({ hasText: uiLabel("Account approved", language) });
      await approval.getByText(uiLabel("Your account was approved automatically at registration.", language), { exact: true }).waitFor();
      assert.equal(await approval.count(), 1);
      await context.close();
    }
    assert.deepEqual(failures, []);
  } finally {
    await browser.close();
  }
}
