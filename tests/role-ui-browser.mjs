import assert from "node:assert/strict";
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { uiLabel } from "./ui-labels.mjs";

export async function runRoleUiChecks(h) {
  const {
    base,
    login,
    newDonation,
    request,
    deliveredRescue,
    saveReceipt,
    distribute,
    distributionInput,
  } = h;
  const artifacts = ".local-postgres/role-ui";
  await mkdir(artifacts, { recursive: true });
  const received = await deliveredRescue();
  await saveReceipt(received);
  assert.equal(
    (await distribute(received, await distributionInput(received))).status,
    201,
  );
  const posted = await newDonation(received.donor);
  assert.equal(posted.response.status, 201);
  const reserved = await request("/api/claims", {
    cookie: received.ngo,
    method: "POST",
    body: { donationId: posted.body.donation.id },
  });
  assert.equal(reserved.status, 201);
  const claim = (await reserved.json()).claim;
  assert.equal(
    (
      await request("/api/dispatches", {
        cookie: received.volunteer,
        method: "POST",
        body: { claimId: claim.id },
      })
    ).status,
    200,
  );
  const active = { ...received, claim, donation: posted.body.donation };
  const cookies = {
    donor: (await login("DONOR")).cookie,
    ngo: (await login("NGO")).cookie,
    volunteer: active.volunteer,
  };
  const palettes = {
    donor: { accent: "#047857", rgb: "rgb(4, 120, 87)", label: "Donor" },
    ngo: { accent: "#1d4ed8", rgb: "rgb(29, 78, 216)", label: "NGO" },
    volunteer: { accent: "#c2410c", rgb: "rgb(194, 65, 12)", label: "Rider" },
  };
  const routes = {
    donor: [
      "/donor/dashboard",
      "/donor/donations",
      "/donor/donations/new",
      "/donor/profile",
      "/donor/addresses",
      "/donor/notifications",
      "/donor/settings",
      "/donor/support",
      `/donor/donations/${active.donation.id}`,
      `/donor/donations/${active.donation.id}/tracking`,
    ],
    ngo: [
      "/ngo/dashboard",
      "/ngo/claims",
      "/ngo/discover",
      "/ngo/requests/new",
      "/ngo/profile",
      "/ngo/addresses",
      "/ngo/notifications",
      "/ngo/settings",
      "/ngo/support",
      `/ngo/claims/${active.claim.id}`,
      `/ngo/claims/${received.claim.id}/confirm-delivery`,
      `/ngo/claims/${received.claim.id}/distribution`,
    ],
    volunteer: [
      "/volunteer/dashboard",
      "/volunteer/dispatches",
      "/volunteer/history",
      "/volunteer/id-card",
      "/volunteer/notifications",
      `/volunteer/missions/mission-${active.claim.id}`,
    ],
  };
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
      : { channel: process.env.PLAYWRIGHT_CHANNEL || undefined }),
  });
  const layouts = [],
    runtime = [],
    contexts = [],
    semantics = [];
  function contrastWhite(rgb) {
    const channels = rgb
      .match(/\d+/g)
      .map((n) => Number(n) / 255)
      .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return (
      1.05 /
      (channels[0] * 0.2126 +
        channels[1] * 0.7152 +
        channels[2] * 0.0722 +
        0.05)
    );
  }
  async function check(page, role, language, width, path) {
    await page.goto(path, { waitUntil: "networkidle" });
    await page.locator(`[data-portal-shell="${role}"]`).waitFor();
    await page
      .locator("header [data-role-badge]")
      .filter({ visible: true })
      .waitFor();
    assert.equal(
      await page
        .locator("header [data-role-badge]")
        .filter({ visible: true })
        .count(),
      1,
      `${role} header identity`,
    );
    assert.equal(
      await page
        .locator("header [data-role-badge]")
        .filter({ visible: true })
        .innerText(),
      uiLabel(palettes[role].label, language),
    );
    const state = await page
      .locator(`[data-portal-shell="${role}"]`)
      .evaluate((root) => {
        const s = getComputedStyle(root);
        return {
          accent: s.getPropertyValue("--role-accent").trim(),
          success: s.getPropertyValue("--success").trim(),
          danger: s.getPropertyValue("--danger").trim(),
          warning: s.getPropertyValue("--warning").trim(),
          brand: s.getPropertyValue("--brand-700").trim(),
        };
      });
    assert.equal(state.accent, palettes[role].accent);
    semantics.push(state);
    const overflow = await page.evaluate(() =>
      [...document.querySelectorAll("main *")]
        .filter(
          (node) =>
            node.getClientRects().length &&
            node.getBoundingClientRect().right > innerWidth + 1,
        )
        .map((node) => ({
          tag: node.tagName,
          className: node.className?.baseVal ?? node.className,
          text: node.textContent?.trim().slice(0, 80),
          width: node.getBoundingClientRect().width,
          right: node.getBoundingClientRect().right,
        }))
        .slice(0, 30),
    );
    if (overflow.length)
      await writeFile(
        artifacts + "/overflow.json",
        JSON.stringify({ role, language, width, path, overflow }, null, 2),
      );
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      `${role} ${language} ${width} ${path} overflow`,
    );
    assert.equal(
      await page
        .locator("main")
        .getByText(/Application error|client-side exception/)
        .count(),
      0,
    );
    for (const button of await page
      .locator('main [data-ui="button"][data-variant="primary"]')
      .filter({ visible: true })
      .all()) {
      const color = await button.evaluate((node) => ({
        bg: getComputedStyle(node).backgroundImage,
        text: getComputedStyle(node).color,
      }));
      assert.ok(
        color.bg.includes(palettes[role].rgb),
        `${path} primary uses ${role}: ${color.bg}`,
      );
      assert.equal(color.text, "rgb(255, 255, 255)");
    }
    if (path.endsWith("/dashboard")) {
      const meals = page.locator('[data-stat="meals"] > p').first();
      await meals.waitFor();
      assert.equal(
        (await meals.textContent()).trim(),
        (10).toLocaleString(language === "bn" ? "bn-BD" : "en-BD"),
      );
      assert.ok(contrastWhite(palettes[role].rgb) >= 4.5);
      if (width >= 1024) {
        const selected = page
          .getByRole("navigation", {
            name: uiLabel("Account sidebar", language),
          })
          .locator('[aria-current="page"]');
        assert.equal(await selected.count(), 1);
        assert.equal(
          await page.getByTestId("sidebar-nav-selection").evaluate((el) => getComputedStyle(el).backgroundColor),
          palettes[role].rgb,
        );
      }
    }
    layouts.push({ role, language, width, path });
    if (width === 390 || width === 1440) {
      if (
        path.endsWith("/dashboard") ||
        path.endsWith("/profile") ||
        path.endsWith("/history") ||
        path.endsWith("/notifications")
      ) {
        await page.evaluate(() =>
          window.scrollTo({ top: 0, behavior: "instant" }),
        );
        await page.screenshot({
          path: `${artifacts}/${role}-${path.split("/").at(-1)}-${language}-${width}.png`,
          fullPage: true,
          animations: "disabled",
          style: "* { content-visibility:visible!important; }",
        });
      }
    }
  }
  try {
    for (const language of ["en", "bn"]) {
      for (const role of process.env.ROLE_UI_SCOPE
        ? process.env.ROLE_UI_SCOPE.split(",")
        : ["donor", "ngo", "volunteer"]) {
        const context = await browser.newContext({
          baseURL: base,
          viewport: { width: 390, height: 1000 },
          timezoneId: "Asia/Dhaka",
        });
        contexts.push(context);
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
          runtime.push({ role, language, message: error.message }),
        );
        for (const width of [320, 390, 1440]) {
          await page.setViewportSize({ width, height: 1000 });
          for (const path of routes[role])
            await check(page, role, language, width, path);
        }
        for (const width of [768]) {
          await page.setViewportSize({ width, height: 1000 });
          await check(page, role, language, width, `/${role}/dashboard`);
        }
        await page.setViewportSize({ width: 320, height: 844 });
        await page.goto(`/${role}/dashboard`, { waitUntil: "networkidle" });
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
        await drawer.waitFor();
        assert.equal(
          await drawer
            .locator("[data-role-badge]")
            .getAttribute("data-role-badge"),
          role,
        );
        assert.equal(
          await drawer.evaluate((el) =>
            getComputedStyle(el).getPropertyValue("--role-accent").trim(),
          ),
          palettes[role].accent,
        );
        assert.equal(
          await drawer.evaluate((el) => el.scrollWidth > el.clientWidth),
          false,
        );
        await page.keyboard.press("Escape");
        await drawer.waitFor({ state: "hidden" });
        assert.equal(
          await page
            .getByRole("button", {
              name: uiLabel("Open mobile navigation menu", language),
              exact: true,
            })
            .evaluate((el) => el === document.activeElement),
          true,
        );
        await page.goto(
          role === "volunteer" ? "/volunteer/dispatches" : `/${role}/profile`,
          { waitUntil: "networkidle" },
        );
        await page.emulateMedia({ reducedMotion: "reduce" });
        const button = page
          .locator('main [data-ui="button"]')
          .filter({ visible: true })
          .first();
        await button.waitFor();
        assert.equal(
          await button.evaluate(
            (el) => getComputedStyle(el).transitionDuration,
          ),
          "0s",
        );
        // Role identity also stays visible while changing language on a live page.
        await page
          .getByRole("button", {
            name: language === "en" ? "বাংলা" : "EN",
            exact: true,
          })
          .filter({ visible: true })
          .click();
        await page
          .locator("header [data-role-badge]")
          .filter({ visible: true })
          .getByText(
            uiLabel(palettes[role].label, language === "en" ? "bn" : "en"),
            { exact: true },
          )
          .waitFor();
        console.log(
          `Role UI ${role} ${language}: responsive pages, identity and drawer passed.`,
        );
        await context.close();
      }
    }
    for (const key of ["success", "warning", "danger", "brand"])
      assert.equal(
        new Set(semantics.map((x) => x[key])).size,
        1,
        key + " keeps the same semantic meaning across roles",
      );
    assert.deepEqual(runtime, []);
    await writeFile(
      artifacts + "/results.json",
      JSON.stringify(
        {
          layouts,
          runtime,
          palettes,
          checks: [
            "persistent role identity",
            "role accent primary actions",
            "contrast >= 4.5:1",
            "semantic colours preserved",
            "mobile drawer and focus",
            "language switch",
            "reduced motion",
          ],
        },
        null,
        2,
      ),
    );
    console.log(
      `Role UI: ${layouts.length} layouts; all three roles, common page patterns, contrast, identities, drawer focus and semantic colours passed.`,
    );
  } catch (error) {
    for (const context of contexts)
      for (const page of context.pages())
        if (!page.isClosed()) {
          await page
            .screenshot({
              path: `${artifacts}/failure-${new URL(page.url()).pathname.replaceAll("/", "-")}.png`,
              fullPage: true,
            })
            .catch(() => {});
          await writeFile(
            artifacts + "/failure.txt",
            (await page.locator("body").innerText()) + "\n" + page.url(),
          ).catch(() => {});
        }
    throw error;
  } finally {
    await browser.close();
  }
}
