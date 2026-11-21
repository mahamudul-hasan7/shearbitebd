import { goDonationStep, prepareDonationPhotos } from "./donation-browser.mjs";
import { runNotificationBrowserChecks } from "./notification-browser.mjs";
import { runRiderOfferBrowserChecks } from "./rider-offer-browser.mjs";
import { runNgoDashboardBrowserChecks } from "./ngo-dashboard-browser.mjs";
import { runLiveMotionChecks } from "./live-motion-browser.mjs";
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { loadDatabaseEnv } from "../scripts/database-env.mjs";
import { PrismaClient } from "@prisma/client";
import net from "node:net";
import { setTimeout as delay } from "node:timers/promises";
import sharp from "sharp";
import { englishBrowserContext, uiLabel, uiName } from "./ui-labels.mjs";

test("browser language selection persists across portals and preserves user content", { skip: process.env.RUN_I18N_BROWSER !== "1" }, async () => {
  const { chromium } = await import("playwright");
  const { mkdir, writeFile } = await import("node:fs/promises");
  const artifacts = ".local-postgres/i18n-browser";
  await mkdir(artifacts, { recursive: true });
  const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) });
  const errors = [], untranslated = [];
  const context = await browser.newContext({ baseURL: base, viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push({ route: page.url(), message: error.message }));
  async function checkEnglish(route) {
    await page.goto(route, { waitUntil: "networkidle" });
    await page.waitForFunction(() => document.documentElement.lang === "en");
    const remaining = await page.evaluate(() => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), found = [];
      while (walker.nextNode()) {
        const node = walker.currentNode, parent = node.parentElement;
        if (!parent || parent.closest("script,style,[hidden]")) continue;
        const value = node.textContent.trim();
        if (value !== "বাংলা" && /[\u0980-\u09ff]/.test(value.replaceAll("৳", "")) && parent.getClientRects().length) found.push(value);
      }
      return [...new Set(found)];
    });
    if (remaining.length) untranslated.push({ route, remaining });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, route + " horizontal overflow");
  }
  try {
    await page.goto("/login", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "EN", exact: true }).filter({ visible: true }).click();
    await page.getByLabel("Password", { exact: false }).first().waitFor();
    await checkEnglish("/");
    await checkEnglish("/login");
    await checkEnglish("/register?role=DONOR");
    for (const role of ["DONOR", "NGO", "VOLUNTEER"]) {
      const { cookie } = await login(role);
      const [name, value] = cookie.split("=");
      await context.addCookies([{ name, value, url: base, httpOnly: true, sameSite: "Lax" }]);
      const routes = role === "DONOR" ? ["/donor/dashboard", "/donor/donations", "/donor/donations/new", "/donor/addresses", "/donor/profile", "/donor/profile/edit", "/donor/ngos", "/donor/settings", "/donor/support", "/donor/notifications"]
        : role === "NGO" ? ["/ngo/dashboard", "/ngo/discover", "/ngo/discover/map", "/ngo/claims", "/ngo/requests", "/ngo/requests/new", "/ngo/addresses", "/ngo/profile", "/ngo/profile/edit", "/ngo/impact", "/ngo/verification", "/ngo/team", "/ngo/settings", "/ngo/support", "/ngo/notifications"]
        : ["/volunteer/dashboard", "/volunteer/dispatches", "/volunteer/history", "/volunteer/id-card", "/volunteer/notifications"];
      for (const route of routes) await checkEnglish(route);
      await page.locator("header").getByRole("button", { name: "বাংলা", exact: true }).click();
      await page.waitForFunction(() => document.documentElement.lang === "bn");
      await page.reload({ waitUntil: "networkidle" });
      assert.equal(await page.locator("html").getAttribute("lang"), "bn");
      await page.screenshot({ path: `${artifacts}/${role.toLowerCase()}-bn.png`, fullPage: true });
      await page.locator("header").getByRole("button", { name: "EN", exact: true }).click();
    }
    const { cookie } = await login();
    await writeFile(artifacts + "/untranslated.json", JSON.stringify(untranslated, null, 2));
    const [name, value] = cookie.split("=");
    await context.addCookies([{ name, value, url: base, httpOnly: true, sameSite: "Lax" }]);
    const { body: donation } = await newDonation(cookie, { title: "Settings", description: "আমার নিজের খাবারের বিবরণ" });
    await page.goto(`/donor/donations/${donation.donation.id}`, { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: "Settings", exact: true }).first().waitFor();
    await page.getByText("আমার নিজের খাবারের বিবরণ", { exact: true }).first().waitFor();
    await page.locator("header").getByRole("button", { name: "বাংলা", exact: true }).click();
    await page.getByRole("heading", { name: "Settings", exact: true }).first().waitFor();
    const other = await context.newPage();
    await other.goto("/donor/settings", { waitUntil: "networkidle" });
    await other.locator("header").getByRole("button", { name: "EN", exact: true }).click();
    await page.waitForFunction(() => document.documentElement.lang === "en");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/donor/donations/new", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: uiName("পরবর্তী ধাপ"), exact: false }).click();
    await page.getByText(uiName("Enter a food title."), { exact: true }).waitFor();
    await page.screenshot({ path: artifacts + "/donation-en-mobile.png", fullPage: true });
    await writeFile(artifacts + "/untranslated.json", JSON.stringify(untranslated, null, 2));
    assert.deepEqual(errors, [], "No runtime or hydration errors");
    assert.deepEqual(untranslated, [], "All authored English portal copy must be translated");
  } finally { await browser.close(); }
});

test("browser mobile layouts navigation overlays and form controls fit touch screens", { skip: process.env.RUN_MOBILE_BROWSER !== "1" }, async () => {
  const { chromium } = await import("playwright");
  const { mkdir, writeFile } = await import("node:fs/promises");
  const artifacts = ".local-postgres/mobile-review";
  await mkdir(artifacts, { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL || undefined });
  const issues = [], runtime = [];
  try {
    const cookies = {};
    for (const role of ["DONOR", "NGO", "VOLUNTEER"]) cookies[role] = (await login(role)).cookie;
    await prisma.notification.createMany({ data: Array.from({ length: 8 }, (_, i) => ({ userId: "test-DONOR", type: "SYSTEM", title: "Mobile notification " + i, message: "A longer account update to check scrolling and reachable notification actions on a small screen.", href: "/donor/donations" })) });
    const routes = {
      PUBLIC: ["/", "/login", "/register"],
      DONOR: ["/donor/dashboard", "/donor/donations/new", "/donor/addresses"],
      NGO: ["/ngo/dashboard", "/ngo/discover", "/ngo/requests/new"],
      VOLUNTEER: ["/volunteer/dashboard", "/volunteer/dispatches"],
    };
    const viewports = [{ width: 320, height: 568 }, { width: 360, height: 740 }, { width: 390, height: 844 }, { width: 430, height: 932 }, { width: 844, height: 390 }];
    for (const viewport of process.env.MOBILE_REVIEW_QUICK === "1" ? viewports.slice(0, 1) : viewports) {
      for (const language of process.env.MOBILE_REVIEW_QUICK === "1" ? ["en"] : ["bn", "en"]) {
        const context = await browser.newContext({ baseURL: base, viewport, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
        await context.addInitScript((lang) => localStorage.setItem("sharebite_preferred_lang", lang), language);
        const page = await context.newPage();
        page.on("pageerror", (error) => runtime.push(error.message));
        const t = (source) => uiLabel(source, language);
        for (const [role, pages] of Object.entries(routes)) {
          if (cookies[role]) {
            const [name, value] = cookies[role].split("=");
            await context.addCookies([{ name, value, url: base, httpOnly: true, sameSite: "Lax" }]);
          }
          for (const route of pages) {
            await page.goto(route, { waitUntil: "networkidle" });
            const failures = await page.evaluate(() => {
              const failures = [];
              if (document.documentElement.scrollWidth > innerWidth + 1) {
                const overflowing = [...document.querySelectorAll('main *')].filter((node) => node.getClientRects().length && node.getBoundingClientRect().right > innerWidth + 1).slice(0, 6).map((node) => ({ tag: node.tagName, class: node.className, width: node.getBoundingClientRect().width }));
                failures.push("Horizontal overflow: " + JSON.stringify(overflowing));
              }
              const controls = [...document.querySelectorAll('header button, header a, main input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]), main select, main textarea')].filter((node) => node.getClientRects().length);
              for (const node of controls) {
                const rect = node.getBoundingClientRect();
                if (rect.left < -1 || rect.right > innerWidth + 1) failures.push("Clipped control: " + (node.getAttribute("aria-label") || node.getAttribute("name") || node.textContent.trim()).slice(0, 60) + ` (${rect.left}, ${rect.width})`);
              }
              const headerControls = controls.filter((node) => node.closest('header'));
              for (let a = 0; a < headerControls.length; a++) for (let b = a + 1; b < headerControls.length; b++) {
                const first = headerControls[a], second = headerControls[b];
                if (first.contains(second) || second.contains(first)) continue;
                const x = first.getBoundingClientRect(), y = second.getBoundingClientRect();
                if (Math.min(x.right, y.right) - Math.max(x.left, y.left) > 1 && Math.min(x.bottom, y.bottom) - Math.max(x.top, y.top) > 1) failures.push("Overlapping header controls");
              }
              const fields = [...document.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]):not([type="file"]):not([type="range"]), select, textarea')].filter((node) => node.getClientRects().length);
              if (fields.some((node) => parseFloat(getComputedStyle(node).fontSize) < 16)) failures.push("Touch input text is smaller than 16px");
              if (document.documentElement.lang === "en") for (const select of document.querySelectorAll('select[name="dietaryType"], select[name="quantityUnit"]')) {
                if (/[\u0980-\u09ff]/.test(select.selectedOptions[0]?.textContent || "")) failures.push("Untranslated selected option: " + select.name);
              }
              const viewport = document.querySelector('meta[name="viewport"]')?.content || "";
              if (/user-scalable=no|maximum-scale=1(?:,|$)/.test(viewport)) failures.push("Pinch zoom is disabled");
              return [...new Set(failures)];
            });
            for (const failure of failures) issues.push({ viewport, language, route, failure });
            if (viewport.width === 320 && language === "en" && ["/donor/donations/new", "/volunteer/dashboard"].includes(route)) await page.screenshot({ path: `${artifacts}/${route.includes("volunteer") ? "volunteer" : "donor-form"}-320.png`, fullPage: true });
            if (role !== "PUBLIC") {
              const nav = page.getByRole("navigation", { name: t("Mobile Bottom App Navigation"), exact: true });
              assert.equal(await nav.isVisible(), !route.endsWith("/new"), route + " bottom navigation visibility");
              if (role === "VOLUNTEER") {
                assert.equal(await page.getByRole("switch", { name: t("Duty ON/OFF"), exact: true }).count(), 1);
                assert.equal(await page.getByTestId("volunteer-duty-panel").evaluate((node) => getComputedStyle(node).position), "static");
              }
            }
          }
          if (role === "PUBLIC" && [320, 844].includes(viewport.width)) {
            await page.goto("/", { waitUntil: "networkidle" });
            const toggle = page.getByRole("button", { name: t("Toggle Navigation Menu"), exact: true });
            await toggle.click();
            const faq = viewport.width < 1024 ? page.getByRole("dialog").locator('nav a[href="#mobile-faq"]') : page.locator('header nav a[href="#faq"]').filter({ visible: true });
            await faq.scrollIntoViewIfNeeded();
            const box = await faq.boundingBox();
            if (box.y < 0 || box.y + box.height > viewport.height) issues.push({ viewport, language, failure: "Landing menu link is unreachable" });
            await page.screenshot({ path: `${artifacts}/landing-menu-${viewport.width}-${language}.png` });
            await faq.click();
            assert.equal(await toggle.getAttribute("aria-expanded"), "false");
          }
          if (role === "DONOR" && [320, 844].includes(viewport.width)) {
            await page.goto("/donor/dashboard", { waitUntil: "networkidle" });
            const trigger = page.getByRole("button", { name: t("Open mobile navigation menu"), exact: true });
            await trigger.click();
            const dialog = page.getByRole("dialog", { name: t("Account navigation"), exact: true });
            await dialog.waitFor();
            if (!await dialog.evaluate((node) => node.contains(document.activeElement))) issues.push({ viewport, language, failure: "Navigation menu does not receive focus" });
            const links = dialog.getByRole("link");
            await links.last().scrollIntoViewIfNeeded();
            if ((await links.last().boundingBox()).y + (await links.last().boundingBox()).height > viewport.height + 1) issues.push({ viewport, language, failure: "Last navigation link is unreachable" });
            await links.last().focus();
            await page.keyboard.press("Tab");
            if (!await dialog.evaluate((node) => node.contains(document.activeElement))) issues.push({ viewport, language, failure: "Tab leaves the navigation menu" });
            await page.screenshot({ path: `${artifacts}/menu-${viewport.width}-${language}.png` });
            await page.keyboard.press("Escape");
            await dialog.waitFor({ state: "hidden" });
            if (!await trigger.evaluate((node) => node === document.activeElement)) issues.push({ viewport, language, failure: "Menu does not restore focus" });
            if (viewport.width === 844) {
              await trigger.click();
              await dialog.waitFor();
              await page.setViewportSize({ width: 1100, height: 720 });
              await dialog.waitFor({ state: "hidden" });
              if (await page.evaluate(() => document.body.style.overflow === "hidden")) issues.push({ viewport, language, failure: "Desktop resize leaves scrolling locked" });
              await page.setViewportSize(viewport);
            }
            for (const [button, label] of [["Open notifications", "Notifications"], ["Open account menu", "User Account Settings"]]) {
              await page.getByRole("button", { name: t(button), exact: true }).click();
              const popover = page.getByRole("dialog", { name: t(label), exact: true });
              await popover.waitFor();
              const box = await popover.boundingBox();
              if (box.y < -1 || box.y + box.height > viewport.height - 4 || box.x < 0 || box.x + box.width > viewport.width) issues.push({ viewport, language, failure: label + " does not fit the viewport", box });
              const lastAction = popover.locator('a,button').last();
              await lastAction.scrollIntoViewIfNeeded();
              if (!await lastAction.evaluate((node) => { const rect = node.getBoundingClientRect(); return node.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)); })) issues.push({ viewport, language, failure: label + " last action is covered" });
              await page.screenshot({ path: `${artifacts}/${label.startsWith("Notifications") ? "notifications" : "account"}-${viewport.width}-${language}.png` });
              await page.keyboard.press("Escape");
            }
          }
        }
        await context.close();
      }
    }
    await writeFile(artifacts + "/issues.json", JSON.stringify(issues, null, 2));
    assert.deepEqual(runtime, [], "Mobile screens must not throw runtime errors");
    assert.equal(issues.length, 0, "Mobile layout and interaction issues: " + JSON.stringify(issues.slice(0, 12)));
  } finally { await browser.close(); }
});

// Use a dedicated random PostgreSQL schema, never the application's public schema.
loadDatabaseEnv();
// A separate secret makes this suite independent of the operator's OTP configuration.
process.env.OTP_SECRET = randomBytes(32).toString("hex");
const databaseUrl = new URL(process.env.DATABASE_URL);
const schema = "sharebite_test_" + randomUUID().replaceAll("-", "");
databaseUrl.searchParams.set("schema", schema);
const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl.href } } });
const fixturePassword = "ExactPassword123 ";
const users = ["DONOR", "NGO", "VOLUNTEER"].map((role, index) => ({
  id: `test-${role}`, email: `${role.toLowerCase()}@example.test`, password: fixturePassword,
  displayName: `Test ${role}`, role, phone: `0171234567${index}`,
  normalizedPhone: `0171234567${index}`,
}));
let server;
let base;
let port;
let log = "";

async function seedUser(user) {
  const { role } = user;
  return prisma.user.create({ data: {
    ...user, addresses: { create: { label: "Home", area: "Badda", addressLine: "Test pickup address", isPrimary: true } },
    ...(role === "DONOR" ? { donorProfile: { create: { verificationStatus: "VERIFIED", organizationName: user.displayName } } } : {}),
    ...(role === "NGO" ? { ngoProfile: { create: { organizationName: user.displayName, registrationNumber: "TEST", summary: "", mission: "", vision: "", publicEmail: user.email, publicPhone: user.phone || "", acceptedFoodCategories: ["COOKED_MEAL"], serviceAreas: ["Badda"], verificationStatus: "VERIFIED" } } } : {}),
    ...(role === "VOLUNTEER" ? { volunteerProfile: { create: { verificationStatus: "VERIFIED", isOnDuty: true, dutyStartedAt: new Date() } } } : {}),
  } });
}

async function runNode(args, env = {}) {
  const child = spawn(process.execPath, args, { env: { ...process.env, DATABASE_URL: databaseUrl.href, ...env }, stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
  let output = "";
  child.stdout.on("data", (chunk) => { output += chunk; });
  child.stderr.on("data", (chunk) => { output += chunk; });
  const [code] = await once(child, "exit");
  assert.equal(code, 0, output);
}

async function startServer() {
  log = "";
  server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)], {
    cwd: process.cwd(), env: { ...process.env, DATABASE_URL: databaseUrl.href, AUTH_COOKIE_SECURE: "false" },
    stdio: ["ignore", "pipe", "pipe"], windowsHide: true,
  });
  server.stdout.on("data", (chunk) => { log = (log + chunk).slice(-8000); });
  server.stderr.on("data", (chunk) => { log = (log + chunk).slice(-8000); });
  for (let attempt = 0; attempt < 120; attempt++) {
    if (server.exitCode !== null) throw new Error(`Test server exited: ${log}`);
    try {
      const response = await fetch(`${base}/api/auth/session`, { signal: AbortSignal.timeout(1000) });
      if (response.ok) return;
    } catch { /* Wait for the local test server to bind. */ }
    await delay(100);
  }
  throw new Error(`Test server did not start. Run npm run build first. ${log}`);
}

async function stopServer() {
  if (server && server.exitCode === null) {
    const closed = once(server, "exit");
    server.kill();
    await closed;
  }
}

async function request(route, { cookie, body, method = "GET", headers = {}, raw } = {}) {
  return fetch(`${base}${route}`, {
    method, redirect: "manual", headers: { ...(cookie ? { cookie } : {}), ...(body !== undefined || raw ? { "content-type": "application/json" } : {}), ...headers },
    body: raw ?? (body !== undefined ? JSON.stringify(body) : undefined),
  });
}

async function login(role = "DONOR", remember = false, previousCookie) {
  const response = await request("/api/auth/login", { method: "POST", cookie: previousCookie, body: { email: `${role.toLowerCase()}@example.test`, password: fixturePassword, remember } });
  assert.equal(response.status, 200);
  const setCookie = response.headers.get("set-cookie");
  assert.ok(setCookie?.includes("HttpOnly"));
  assert.match(setCookie, /SameSite=lax/i);
  assert.match(setCookie, /Path=\//i);
  const data = await response.json();
  assert.equal(data.session.role, role);
  assert.equal(data.user.password, undefined);
  return { cookie: setCookie.split(";")[0], setCookie, data };
}

before(async () => {
  const socket = net.createServer();
  socket.listen(0, "127.0.0.1");
  await once(socket, "listening");
  port = socket.address().port;
  await new Promise((resolve) => socket.close(resolve));
  base = `http://127.0.0.1:${port}`;
  await runNode(["node_modules/prisma/build/index.js", "migrate", "deploy"]);
  for (const user of users) await seedUser(user);
  await seedUser({ id: "test-ADMIN", email: "admin@example.test", password: fixturePassword, displayName: "Test administrator", role: "ADMIN", phone: null, normalizedPhone: null });
  for (const role of ["DONOR", "NGO", "VOLUNTEER"]) await seedUser({ ...users.find((u) => u.role === role), id: `second-${role}`, email: `second-${role.toLowerCase()}@example.test`, normalizedPhone: null, phone: null });
  await startServer();
});

after(async () => {
  await stopServer();
  assert.match(schema, /^sharebite_test_[a-f0-9]{32}$/);
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
  await prisma.$disconnect();
});

test("anonymous requests cannot read APIs or enter any portal", async () => {
  for (const route of ["/api/donations", "/api/claims", "/api/dispatches", "/api/volunteer/duty", "/api/notifications", "/api/auth/users", "/api/handovers", "/api/missions", "/api/deliveries", "/api/distributions", "/api/photos", "/api/incidents", "/api/requests"]) {
    assert.equal((await request(route)).status, 401, route);
  }
  for (const role of ["donor", "ngo", "volunteer"]) {
    const response = await request(`/${role}/dashboard`);
    assert.equal(response.status, 307);
    assert.equal(new URL(response.headers.get("location"), base).pathname, "/login");
  }
});

test("rejects incorrect, demo override, case-changed and trimmed passwords", async () => {
  for (const password of ["wrong", "Demo1234", fixturePassword.toLowerCase(), fixturePassword.trim()]) {
    const response = await request("/api/auth/login", { method: "POST", body: { email: users[0].email, password } });
    assert.equal(response.status, 401);
    assert.equal(response.headers.get("set-cookie"), null);
  }
});

test("malformed JSON and invalid input return 400 instead of 500", async () => {
  for (const route of ["/api/auth/login", "/api/auth/register"]) {
    for (const raw of ["{", "[]", "null", '{"email":123,"password":false}']) {
      assert.equal((await request(route, { method: "POST", raw })).status, 400);
    }
  }
});

test("all roles receive a cookie and can access only their portal", async () => {
  for (const role of ["DONOR", "NGO", "VOLUNTEER"]) {
    const { cookie, data } = await login(role);
    assert.equal((await request(`/${role.toLowerCase()}/dashboard`, { cookie })).status, 200);
    const otherRole = role === "DONOR" ? "ngo" : "donor";
    const denied = await request(`/${otherRole}/dashboard`, { cookie });
    assert.equal(denied.status, 307);
    assert.equal(new URL(denied.headers.get("location"), base).pathname, "/unauthorized");
    const current = await (await request("/api/auth/session", { cookie })).json();
    assert.equal(current.session.id, data.session.id);
  }
});

test("remember me changes browser cookie lifetime; tokens are opaque and stored as digests", async () => {
  const temporary = await login();
  const remembered = await login("DONOR", true);
  assert.doesNotMatch(temporary.setCookie, /max-age=/i);
  assert.match(remembered.setCookie, /max-age=2592000/i);
  assert.notEqual(temporary.cookie, remembered.cookie);
  const token = remembered.cookie.split("=")[1];
  assert.match(token, /^[a-f0-9]{64}$/);
  const stored = await prisma.authSession.findUnique({ where: { tokenHash: createHash("sha256").update(token).digest("hex") } });
  assert.ok(stored);
  assert.notEqual(stored.tokenHash, token);
});

test("only the correct account role can create a donation, claim or dispatch", async () => {
  for (const [role, routes] of [["DONOR", ["/api/claims", "/api/dispatches"]], ["NGO", ["/api/donations", "/api/dispatches"]], ["VOLUNTEER", ["/api/donations", "/api/claims"]]]) {
    const { cookie } = await login(role);
    for (const route of routes) assert.equal((await request(route, { cookie, method: "POST", body: {} })).status, 403);
  }
});

test("login requires exact email or a complete normalized Bangladesh phone", async () => {
  for (const email of ["donor", "12345670", "someone@example.test"]) {
    assert.equal((await request("/api/auth/login", { method: "POST", body: { email, password: fixturePassword } })).status, 401);
  }
  assert.equal((await request("/api/auth/login", { method: "POST", body: { email: "+8801712345670", password: fixturePassword } })).status, 200);
});

test("a successful login rotates the current session", async () => {
  const first = await login();
  const second = await login("DONOR", false, first.cookie);
  assert.notEqual(first.cookie, second.cookie);
  assert.equal((await (await request("/api/auth/session", { cookie: first.cookie })).json()).session, null);
});

test("logout revokes the server token, including replay of the old cookie", async () => {
  const { cookie } = await login();
  const response = await request("/api/auth/logout", { method: "POST", cookie });
  assert.equal(response.status, 200);
  assert.match(response.headers.get("set-cookie"), /max-age=0/i);
  assert.equal((await request("/api/donations", { cookie })).status, 401);
  assert.equal((await (await request("/api/auth/session", { cookie })).json()).session, null);
});

test("forged and expired cookies do not authenticate", async () => {
  assert.equal((await request("/api/donations", { cookie: `sharebite.session=${"a".repeat(64)}` })).status, 401);
  const { cookie } = await login();
  const digest = createHash("sha256").update(cookie.split("=")[1]).digest("hex");
  await prisma.authSession.update({ where: { tokenHash: digest }, data: { expiresAt: new Date(Date.now() - 60_000) } });
  assert.equal((await request("/api/donations", { cookie })).status, 401);
});

test("user lists and administrator APIs are not public", async () => {
  assert.equal((await request("/api/auth/register")).status, 403);
  const { cookie } = await login();
  assert.equal((await request("/api/auth/users", { cookie })).status, 403);
});

test("cross-site writes, including login and logout, are rejected", async () => {
  for (const route of ["/api/auth/login", "/api/auth/logout", "/api/auth/register", "/api/donations"]) {
    assert.equal((await request(route, { method: "POST", headers: { origin: "https://unrelated.example" }, body: {} })).status, 403);
  }
});

const registration = {
  email: "registered@example.test", password: "NewPassword123", fullName: "Registered Donor", phone: "01812345678", role: "DONOR",
  termsAccepted: true, details: { address: "Badda, Dhaka", donorType: "individual" },
};

test("registration validates role, password, email, phone and accepted terms on the server", async () => {
  for (const change of [{ role: "ADMIN" }, { role: "random" }, { password: "" }, { email: "bad" }, { phone: "123" }, { termsAccepted: false }, { details: [] }, { details: {} }]) {
    assert.equal((await request("/api/auth/register", { method: "POST", body: { ...registration, ...change } })).status, 400);
  }
});

test("registration persists the account and creates a session; duplicate email and phone are rejected", async () => {
  const response = await request("/api/auth/register", { method: "POST", body: registration });
  assert.equal(response.status, 201);
  assert.ok(response.headers.get("set-cookie"));
  const data = await response.json();
  assert.equal(data.user.password, undefined);
  const user = await prisma.user.findUnique({ where: { email: registration.email } });
  assert.equal(user.password, registration.password, "password hashing is intentionally deferred");
  for (const change of [{ email: registration.email.toUpperCase(), phone: "01812345679" }, { email: "another@example.test", phone: "+8801812345678" }]) {
    assert.equal((await request("/api/auth/register", { method: "POST", body: { ...registration, ...change } })).status, 409);
  }
});

test("accounts and sessions survive an application restart", async () => {
  const { cookie, data } = await login("NGO", true);
  await stopServer();
  await startServer();
  const current = await (await request("/api/auth/session", { cookie })).json();
  assert.equal(current.session.id, data.session.id);
  const response = await request("/api/auth/login", { method: "POST", body: { email: registration.email, password: registration.password } });
  assert.equal(response.status, 200);
});

test("NGO and volunteer registration create their own role-bound sessions", async () => {
  for (const [role, phone] of [["NGO", "01912345678"], ["VOLUNTEER", "01612345678"]]) {
    const response = await request("/api/auth/register", { method: "POST", body: {
      ...registration, email: `new-${role.toLowerCase()}@example.test`, phone, role,
      organizationName: role === "NGO" ? "Registered NGO" : "",
      details: { address: "Badda, Dhaka", registrationNumber: "NGO-TEST-001", transportMethod: "bicycle" },
    } });
    assert.equal(response.status, 201);
    const data = await response.json();
    assert.equal(data.session.role, role);
    const cookie = response.headers.get("set-cookie").split(";")[0];
    assert.equal((await request(`/${role.toLowerCase()}/dashboard`, { cookie })).status, 200);
  }
});

test("passwords in a login URL do not establish a session", async () => {
  const response = await request(`/login?email=${encodeURIComponent(users[0].email)}&password=${encodeURIComponent(fixturePassword)}`);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("set-cookie"), null);
});

test("deactivated accounts lose access even with an existing session", async () => {
  const { cookie } = await login();
  await prisma.user.update({ where: { id: users[0].id }, data: { isActive: false } });
  try { assert.equal((await request("/api/donations", { cookie })).status, 401); }
  finally { await prisma.user.update({ where: { id: users[0].id }, data: { isActive: true } }); }
});

async function secondLogin(role) {
  const response = await request("/api/auth/login", { method: "POST", body: { email: `second-${role.toLowerCase()}@example.test`, password: fixturePassword } });
  assert.equal(response.status, 200);
  return response.headers.get("set-cookie").split(";")[0];
}

async function newDonation(cookie, changes = {}) {
  const profile = await (await request("/api/profile", { cookie })).json();
  const now = Date.now();
  const payload = {
    donorProfileId: "untrusted-client-identity", title: "Test rice and vegetables", description: "Fresh prepared test meal",
    category: "COOKED_MEAL", dietaryTypes: ["HALAL"], quantity: { value: 20, unit: "MEALS", estimatedMeals: 20 },
    preparationTime: new Date(now - 60_000).toISOString(), safePickupDeadline: new Date(now + 3_600_000).toISOString(), storageCondition: "HOT_HOLDING", foodCondition: "FRESHLY_PREPARED", priority: "HIGH", status: "AVAILABLE", allergens: [],
    pickup: { addressId: profile.addresses[0].id, approximateArea: "Badda", contact: { name: "Donor contact", phone: "01712345670" }, windowStart: new Date(now + 60_000).toISOString(), windowEnd: new Date(now + 1_800_000).toISOString() },
    safetyDeclaration: { freshlyPrepared: true, properlyCovered: true, noVisibleSpoilage: true, storedAccordingToDeclaration: true, allergensDisclosed: true, pickupDeadlineConfirmed: true, donorAccuracyConfirmed: true }, ...changes,
  };
  const response = await request("/api/donations", { cookie, method: "POST", body: payload });
  return { response, payload, body: await response.json() };
}

test("registration creates role profile, preferences and owned address atomically", async () => {
  const user = await prisma.user.findUnique({ where: { email: registration.email }, include: { donorProfile: true, addresses: true, preferences: true } });
  assert.ok(user.donorProfile);
  assert.ok(user.preferences);
  assert.equal(user.addresses.length, 1);
  assert.equal(user.addresses[0].ownerId, user.id);
});

test("profile and address operations always use the authenticated owner", async () => {
  const { cookie } = await login();
  const profile = await (await request("/api/profile?userId=second-DONOR", { cookie })).json();
  assert.equal(profile.user.id, "test-DONOR");
  assert.equal(profile.user.password, undefined);
  const other = await prisma.address.findFirst({ where: { ownerId: "second-DONOR" } });
  const result = await request("/api/profile", { cookie, method: "POST", body: { action: "setPrimaryAddress", id: other.id } });
  assert.equal(result.status, 404);
  const saved = await request("/api/profile", { cookie, method: "PATCH", body: { action: "displayName", userId: "second-DONOR", input: { displayName: "Updated own name" } } });
  assert.equal(saved.status, 200);
  assert.equal((await prisma.user.findUnique({ where: { id: "test-DONOR" } })).displayName, "Updated own name");
  assert.equal((await prisma.user.findUnique({ where: { id: "second-DONOR" } })).displayName, "Test DONOR");
});

test("donations persist once, ignore forged donor identity, and isolate other donors", async () => {
  const { cookie } = await login();
  const created = await newDonation(cookie);
  assert.equal(created.response.status, 201, JSON.stringify(created.body));
  const donation = created.body.donation;
  const owner = await prisma.donorProfile.findUnique({ where: { userId: "test-DONOR" } });
  assert.equal(donation.donorProfileId, owner.id);
  assert.equal(await prisma.donation.count({ where: { id: donation.id } }), 1);
  const other = await secondLogin("DONOR");
  assert.equal((await request(`/api/donations?id=${donation.id}`, { cookie: other })).status, 404);
  assert.equal((await request("/api/donations", { cookie: other, method: "PATCH", body: { id: donation.id, action: "cancel", reason: "malicious" } })).status, 404);
  const { cookie: ngo } = await login("NGO");
  const discovery = await (await request(`/api/donations?id=${donation.id}`, { cookie: ngo })).json();
  assert.equal(discovery.donation.pickup.sensitiveDetailsVisible, false);
  assert.equal(discovery.donation.pickup.exactAddress, undefined);
  assert.equal(discovery.donation.pickup.contact, undefined);
});

test("server rejects unsafe donations, negative quantities and another account's address", async () => {
  const { cookie } = await login();
  assert.equal((await newDonation(cookie, { quantity: { value: -1, unit: "MEALS", estimatedMeals: 20 } })).response.status, 422);
  assert.equal((await newDonation(cookie, { safetyDeclaration: {} })).response.status, 422);
  const other = await prisma.address.findFirst({ where: { ownerId: "second-DONOR" } });
  const valid = await newDonation(cookie);
  valid.payload.pickup.addressId = other.id;
  assert.equal((await request("/api/donations", { cookie, method: "POST", body: valid.payload })).status, 403);
});

test("two NGOs racing for the same food produce one active claim", async () => {
  const donor = await login();
  const created = await newDonation(donor.cookie);
  assert.equal(created.response.status, 201);
  const ngo1 = await login("NGO"), ngo2 = await secondLogin("NGO");
  const responses = await Promise.all([ngo1.cookie, ngo2].map((cookie) => request("/api/claims", { cookie, method: "POST", body: { donationId: created.body.donation.id, ngoId: "forged", ngoEmail: "forged@example.test", pickupOtp: "7429" } })));
  assert.deepEqual(responses.map((r) => r.status).sort(), [201, 409]);
  assert.equal(await prisma.claim.count({ where: { donationId: created.body.donation.id } }), 1);
  const winner = responses[0].status === 201 ? ngo1.cookie : ngo2;
  const loser = responses[0].status === 201 ? ngo2 : ngo1.cookie;
  const response = responses.find((r) => r.status === 201);
  const { claim } = await response.json();
  assert.equal(claim.pickupVerificationToken, undefined);
  assert.equal((await request(`/api/claims?id=${claim.id}`, { cookie: loser })).status, 404);
  const visible = await (await request(`/api/donations?id=${created.body.donation.id}`, { cookie: winner })).json();
  assert.equal(visible.donation.pickup.sensitiveDetailsVisible, true);
  assert.equal((await request("/api/claims", { cookie: winner, method: "PATCH", body: { id: claim.id, status: "CANCELLED" } })).status, 200);
  const reclaimed = await request("/api/claims", { cookie: loser, method: "POST", body: { donationId: created.body.donation.id } });
  assert.equal(reclaimed.status, 201);
  assert.notEqual((await reclaimed.json()).claim.id, claim.id);
  assert.equal(await prisma.claim.count({ where: { donationId: created.body.donation.id } }), 2, "cancelled claim history is preserved");
});

test("expired food cannot be claimed and is excluded from discovery", async () => {
  const donor = await login(), ngo = await login("NGO");
  const created = await newDonation(donor.cookie);
  const id = created.body.donation.id;
  await prisma.donation.update({ where: { id }, data: { safePickupDeadline: new Date(Date.now() - 60_000) } });
  assert.equal((await request("/api/claims", { cookie: ngo.cookie, method: "POST", body: { donationId: id } })).status, 409);
  const feed = await (await request("/api/donations", { cookie: ngo.cookie })).json();
  assert.ok(!feed.donations.some((d) => d.id === id));
});

test("unverified newly registered NGOs cannot claim food", async () => {
  const donor = await login();
  const created = await newDonation(donor.cookie);
  const response = await request("/api/auth/login", { method: "POST", body: { email: "new-ngo@example.test", password: registration.password } });
  const cookie = response.headers.get("set-cookie").split(";")[0];
  assert.equal((await request("/api/claims", { cookie, method: "POST", body: { donationId: created.body.donation.id } })).status, 403);
});

test("two volunteers racing for one dispatch produce one assignment", async () => {
  const donor = await login(), ngo = await login("NGO");
  const created = await newDonation(donor.cookie);
  const claimResponse = await request("/api/claims", { cookie: ngo.cookie, method: "POST", body: { donationId: created.body.donation.id } });
  const { claim } = await claimResponse.json();
  const vol1 = await login("VOLUNTEER"), vol2 = await secondLogin("VOLUNTEER");
  const responses = await Promise.all([vol1.cookie, vol2].map((cookie) => request("/api/dispatches", { cookie, method: "POST", body: { claimId: claim.id, volunteerId: "forged" } })));
  assert.deepEqual(responses.map((r) => r.status).sort(), [200, 409]);
  const stored = await prisma.claim.findUnique({ where: { id: claim.id } });
  assert.equal(stored.status, "ASSIGNED");
  const winning = responses[0].status === 200 ? vol1.cookie : vol2;
  const mine = await (await request("/api/dispatches", { cookie: winning })).json();
  assert.equal(mine.activeDispatch.claimId, claim.id);
  assert.equal(mine.dispatches.some((d) => d.claimId === claim.id), false);
});

test("notification reads and mutations are isolated by session, not query parameters", async () => {
  const donor = await login(), other = await secondLogin("DONOR");
  const mine = await (await request("/api/notifications?userId=second-DONOR", { cookie: donor.cookie })).json();
  assert.ok(mine.notifications.length > 0);
  assert.ok(mine.notifications.every((n) => n.userId === "test-DONOR"));
  assert.equal((await request("/api/notifications", { cookie: other, method: "PATCH", body: { id: mine.notifications[0].id } })).status, 404);
  assert.equal((await request("/api/notifications", { cookie: donor.cookie, method: "POST", body: { title: "forged", message: "forged", userId: "second-DONOR" } })).status, 403);
});

async function jsonResult(route, options, expected = 200) {
  const response = await request(route, options);
  const body = await response.json();
  assert.equal(response.status, expected, JSON.stringify(body));
  return body;
}

async function dutyRider(verified = true) {
  const id = randomUUID(), email = id + "@example.test";
  const user = await prisma.user.create({ data: { id, email, password: fixturePassword, displayName: "Duty rider", role: "VOLUNTEER",
    volunteerProfile: { create: { verificationStatus: verified ? "VERIFIED" : "PENDING" } } }, include: { volunteerProfile: true } });
  const response = await request("/api/auth/login", { method: "POST", body: { email, password: fixturePassword } });
  assert.equal(response.status, 200);
  return { user, cookie: response.headers.get("set-cookie").split(";")[0] };
}

async function dutyClaim() {
  const donor = (await login()).cookie, ngo = (await login("NGO")).cookie;
  const { response, body } = await newDonation(donor, { title: "Duty test meal" });
  assert.equal(response.status, 201);
  const { claim } = await jsonResult("/api/claims", { cookie: ngo, method: "POST", body: { donationId: body.donation.id } }, 201);
  return { claim, donor, ngo, donation: body.donation };
}

test("volunteer duty starts OFF, persists across restart and is isolated by the authenticated account", async () => {
  const first = await dutyRider(), second = await dutyRider();
  const read = async (cookie) => (await jsonResult("/api/volunteer/duty", { cookie })).duty;
  const initial = await read(first.cookie);
  assert.equal(initial.isOnDuty, false);
  assert.equal(initial.startedAt, null);
  assert.equal(initial.version, 0);
  const { duty: on } = await jsonResult("/api/volunteer/duty", { cookie: first.cookie, method: "PATCH", body: { isOnDuty: true } });
  assert.equal(on.isOnDuty, true);
  assert.equal(on.version, 1);
  assert.ok(Number.isFinite(Date.parse(on.startedAt)));
  const repeated = await jsonResult("/api/volunteer/duty", { cookie: first.cookie, method: "PATCH", body: { isOnDuty: true } });
  assert.equal(repeated.duty.startedAt, on.startedAt);
  assert.equal(repeated.duty.version, 1);
  await stopServer(); await startServer();
  assert.deepEqual(await read(first.cookie), on);
  assert.equal((await read(second.cookie)).isOnDuty, false);
  await jsonResult("/api/volunteer/duty", { cookie: second.cookie, method: "PATCH", body: { isOnDuty: true, volunteerProfileId: first.user.volunteerProfile.id, userId: first.user.id } });
  assert.deepEqual(await read(first.cookie), on, "Forged identity must not change another rider");
  const { duty: off } = await jsonResult("/api/volunteer/duty", { cookie: first.cookie, method: "PATCH", body: { isOnDuty: false } });
  assert.equal(off.isOnDuty, false);
  assert.equal(off.startedAt, null);
  assert.equal(off.version, 2);
});

test("volunteer duty validates role, verification, input and cross-site writes", async () => {
  const rider = await dutyRider(), pending = await dutyRider(false);
  for (const role of ["DONOR", "NGO"]) {
    const { cookie } = await login(role);
    for (const method of ["GET", "PATCH"]) assert.equal((await request("/api/volunteer/duty", { cookie, method, ...(method === "PATCH" ? { body: { isOnDuty: true } } : {}) })).status, 403);
  }
  for (const isOnDuty of ["true", "online", 1, null, undefined]) assert.equal((await request("/api/volunteer/duty", { cookie: rider.cookie, method: "PATCH", body: { isOnDuty } })).status, 422);
  assert.equal((await request("/api/volunteer/duty", { cookie: rider.cookie, method: "PATCH", body: { isOnDuty: true }, headers: { origin: "https://foreign.example", "sec-fetch-site": "cross-site" } })).status, 403);
  assert.equal((await request("/api/volunteer/duty", { cookie: pending.cookie, method: "PATCH", body: { isOnDuty: true } })).status, 403);
  assert.equal((await jsonResult("/api/volunteer/duty", { cookie: pending.cookie, method: "PATCH", body: { isOnDuty: false } })).duty.isOnDuty, false);
});

test("OFF blocks new assignment without cancelling an active mission or its handovers", async () => {
  const rider = await dutyRider(), food = await dutyClaim();
  assert.equal((await request("/api/dispatches", { cookie: rider.cookie, method: "POST", body: { claimId: food.claim.id } })).status, 409);
  assert.equal((await prisma.claim.findUnique({ where: { id: food.claim.id } })).status, "RESERVED");
  await jsonResult("/api/volunteer/duty", { cookie: rider.cookie, method: "PATCH", body: { isOnDuty: true } });
  await jsonResult("/api/dispatches", { cookie: rider.cookie, method: "POST", body: { claimId: food.claim.id } });
  await jsonResult("/api/volunteer/duty", { cookie: rider.cookie, method: "PATCH", body: { isOnDuty: false } });
  const mission = (await jsonResult("/api/missions", { cookie: rider.cookie })).activeMission;
  assert.equal(mission.claimId, food.claim.id);
  assert.equal(mission.currentStage, "assigned");
  await jsonResult("/api/missions", { cookie: rider.cookie, method: "PATCH", body: { claimId: food.claim.id, stage: "en_route_pickup" } });
  const rescue = { ...food, volunteer: rider.cookie };
  assert.equal((await handover(rescue, rider.cookie, "verify", "PICKUP", await issue(rescue, "PICKUP"))).status, 200);
  assert.equal((await handover(rescue, rider.cookie, "verify", "DELIVERY", await issue(rescue, "DELIVERY"))).status, 200);
  assert.equal((await jsonResult("/api/volunteer/duty", { cookie: rider.cookie })).duty.isOnDuty, false);
  assert.equal((await prisma.claim.findUnique({ where: { id: food.claim.id } })).status, "DELIVERED");
});

test("racing duty OFF and assignment respect the same account lock", async () => {
  for (let i = 0; i < 3; i++) {
    const rider = await dutyRider(), food = await dutyClaim();
    await jsonResult("/api/volunteer/duty", { cookie: rider.cookie, method: "PATCH", body: { isOnDuty: true } });
    const [off, assigned] = await Promise.all([
      request("/api/volunteer/duty", { cookie: rider.cookie, method: "PATCH", body: { isOnDuty: false } }),
      request("/api/dispatches", { cookie: rider.cookie, method: "POST", body: { claimId: food.claim.id } }),
    ]);
    assert.equal(off.status, 200);
    assert.ok([200, 409].includes(assigned.status));
    assert.equal((await jsonResult("/api/volunteer/duty", { cookie: rider.cookie })).duty.isOnDuty, false);
    assert.equal((await prisma.claim.findUnique({ where: { id: food.claim.id } })).status, assigned.status === 200 ? "ASSIGNED" : "RESERVED");
    const next = await dutyClaim();
    assert.equal((await request("/api/dispatches", { cookie: rider.cookie, method: "POST", body: { claimId: next.claim.id } })).status, 409);
  }
});

test("browser rider incoming offers follow duty accept once and handle competing riders", { skip: process.env.RUN_RIDER_OFFERS_BROWSER !== "1" }, async () => {
  await runRiderOfferBrowserChecks({ prisma, base, dutyRider, dutyClaim, jsonResult });
});

test("browser duty switch persists, syncs tabs and blocks new missions while OFF", { skip: process.env.RUN_DUTY_BROWSER !== "1" }, async () => {
  const { chromium } = await import("playwright");
  const { mkdir } = await import("node:fs/promises");
  const artifacts = ".local-postgres/duty-browser";
  await mkdir(artifacts, { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL || undefined });
  const errors = [];
  try {
    for (const [width, language] of [[320, "bn"], [390, "en"], [1280, "en"]]) {
      const rider = await dutyRider(), food = await dutyClaim();
      const context = await browser.newContext({ baseURL: base, viewport: { width, height: 844 }, isMobile: width < 600, hasTouch: width < 600 });
      await context.addInitScript((lang) => localStorage.setItem("sharebite_preferred_lang", lang), language);
      const [name, value] = rider.cookie.split("=");
      await context.addCookies([{ name, value, url: base, httpOnly: true, sameSite: "Lax" }]);
      const page = await context.newPage();
      page.on("pageerror", (error) => errors.push(error.message));
      const t = (source) => uiLabel(source, language);
      const control = (target = page) => target.getByRole("switch", { name: t("Duty ON/OFF"), exact: true });
      async function dismissIncomingOffer(target) {
        const { dispatches, duty } = await jsonResult("/api/dispatches", { cookie: rider.cookie });
        const dismissed = await target.evaluate((userId) => JSON.parse(sessionStorage.getItem(`sharebite.rider-offers.${userId}`) || "[]"), rider.user.id);
        const offer = target.getByTestId("rider-incoming-offer");
        if (duty.isOnDuty && duty.canGoOnDuty && !duty.hasActiveMission && dispatches.some(item => !dismissed.includes(item.id))) await offer.waitFor();
        if (await offer.isVisible()) {
          await offer.getByRole("button", { name: t("Not now; keep it in the list"), exact: true }).click();
          await offer.waitFor({ state: "hidden" });
        }
      }
      async function setDuty(on, target = page) {
        await dismissIncomingOffer(target);
        await control(target).click();
        await target.waitForFunction((value) => document.querySelector('[role="switch"]')?.getAttribute("aria-checked") === String(value), on);
        if (on) await dismissIncomingOffer(target);
      }
      await page.goto("/volunteer/dashboard", { waitUntil: "networkidle" });
      await control().waitFor();
      assert.equal(await control().count(), 1);
      assert.equal(await control().getAttribute("aria-checked"), "false");
      assert.equal(await control().isEnabled(), true);
      assert.equal(await page.getByRole("button", { name: t("মিশন গ্রহণ করুন (Accept Mission 🛵)"), exact: true }).isDisabled(), true);
      assert.ok((await control().boundingBox()).height >= 44);
      assert.equal(await page.getByRole("button", { name: /^Duty:/ }).count(), 0);
      if (width === 320) {
        await page.route("**/api/volunteer/duty", async (route) => {
          if (route.request().method() !== "PATCH") return route.continue();
          await route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: "Duty status could not be saved. Try again." }) });
        }, { times: 1 });
        await control().click();
        await page.getByTestId("volunteer-duty-panel").getByRole("alert").waitFor();
        assert.equal(await control().getAttribute("aria-checked"), "false");
        assert.equal((await jsonResult("/api/volunteer/duty", { cookie: rider.cookie })).duty.isOnDuty, false);
        await page.getByRole("button", { name: t("Retry"), exact: true }).click();
        await page.getByTestId("volunteer-duty-panel").getByRole("alert").waitFor({ state: "hidden" });
      }
      await page.screenshot({ path: `${artifacts}/off-${width}-${language}.png` });
      await page.goto("/volunteer/dispatches", { waitUntil: "networkidle" });
      const accept = page.getByRole("button", { name: t("Accept mission"), exact: true });
      assert.equal(await accept.isDisabled(), true);
      await setDuty(true);
      assert.equal((await jsonResult("/api/volunteer/duty", { cookie: rider.cookie })).duty.isOnDuty, true);
      await page.reload({ waitUntil: "networkidle" });
      assert.equal(await control().getAttribute("aria-checked"), "true");
      const other = await context.newPage();
      await other.goto("/volunteer/dashboard", { waitUntil: "networkidle" });
      assert.equal(await control(other).getAttribute("aria-checked"), "true");
      await setDuty(false, other);
      await page.bringToFront();
      await page.waitForFunction(() => document.querySelector('[role="switch"]')?.getAttribute("aria-checked") === "false");
      assert.equal(await accept.isDisabled(), true);
      await other.close();
      await setDuty(true);
      const assigned = page.waitForResponse((response) => response.url() === base + "/api/dispatches" && response.request().method() === "POST");
      await accept.click();
      assert.equal((await assigned).status(), 200);
      await page.waitForURL(base + "/volunteer/missions/mission-" + food.claim.id);
      await page.goto("/volunteer/dashboard", { waitUntil: "networkidle" });
      await page.getByTestId("volunteer-duty-panel").getByText(t("Mission in progress"), { exact: true }).waitFor();
      await setDuty(false);
      await page.getByText(t("Turning duty OFF does not cancel your current mission. Continue it as usual."), { exact: true }).waitFor();
      assert.equal((await jsonResult("/api/missions", { cookie: rider.cookie })).activeMission.claimId, food.claim.id);
      if (width === 320) {
        const code = await issue({ ...food, volunteer: rider.cookie }, "PICKUP");
        await page.getByRole("textbox", { name: t("হ্যান্ডওভার ওটিপি যাচাইকরণ"), exact: true }).fill(code);
        const verifyButton = page.getByRole("button", { name: t("যাচাই"), exact: true });
        const box = await verifyButton.boundingBox();
        assert.ok(box.x >= 0 && box.x + box.width <= width, "Handover verification must remain reachable while OFF");
        const verified = page.waitForResponse((response) => response.url() === base + "/api/handovers" && response.request().method() === "POST");
        await verifyButton.click();
        assert.equal((await verified).status(), 200);
        assert.equal((await jsonResult("/api/missions", { cookie: rider.cookie })).activeMission.currentStage, "cargo_loaded");
      }
      await page.goto("/volunteer/id-card", { waitUntil: "networkidle" });
      await page.getByTestId("volunteer-duty-panel").getByText(t("Mission in progress"), { exact: true }).waitFor();
      assert.equal(await control().getAttribute("aria-checked"), "false");
      await page.goto("/volunteer/dashboard", { waitUntil: "networkidle" });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await page.screenshot({ path: `${artifacts}/busy-off-${width}-${language}.png`, fullPage: true });
      if (width === 320) {
        await setDuty(true);
        const second = await dutyRider();
        const [nextName, nextValue] = second.cookie.split("=");
        await context.addCookies([{ name: nextName, value: nextValue, url: base, httpOnly: true, sameSite: "Lax" }]);
        await page.goto("/volunteer/dashboard", { waitUntil: "networkidle" });
        assert.equal(await control().getAttribute("aria-checked"), "false");
        assert.equal(await page.getByTestId("volunteer-duty-panel").getByText(t("Mission in progress"), { exact: true }).count(), 0);
      }
      await context.close();
    }
    assert.deepEqual(errors, []);
  } finally { await browser.close(); }
});

async function assignedRescue() {
  const donor = (await login()).cookie;
  const ngo = (await login("NGO")).cookie;
  const unique = randomUUID();
  const volunteerUser = await seedUser({ id: unique, email: unique + "@example.test", password: fixturePassword, displayName: "Workflow volunteer", role: "VOLUNTEER", phone: null, normalizedPhone: null });
  const loginResponse = await request("/api/auth/login", { method: "POST", body: { email: volunteerUser.email, password: fixturePassword } });
  assert.equal(loginResponse.status, 200);
  const volunteer = loginResponse.headers.get("set-cookie").split(";")[0];
  const created = await newDonation(donor);
  assert.equal(created.response.status, 201, JSON.stringify(created.body));
  const donation = created.body.donation;
  const { claim } = await jsonResult("/api/claims", { cookie: ngo, method: "POST", body: { donationId: donation.id } }, 201);
  await jsonResult("/api/dispatches", { cookie: volunteer, method: "POST", body: { claimId: claim.id } });
  return { donor, ngo, volunteer, claim, donation, volunteerUser };
}

function handover(rescue, cookie, action, kind, code) {
  return request("/api/handovers", { cookie, method: "POST", body: { claimId: rescue.claim.id, action, kind, code } });
}
async function issue(rescue, kind) {
  const response = await handover(rescue, kind === "PICKUP" ? rescue.donor : rescue.ngo, "issue", kind);
  const body = await response.json();
  assert.equal(response.status, 200, JSON.stringify(body));
  assert.match(body.code, /^[1-9][0-9]{5}$/);
  return body.code;
}
async function deliveredRescue() {
  const r = await assignedRescue();
  assert.equal((await handover(r, r.volunteer, "verify", "PICKUP", await issue(r, "PICKUP"))).status, 200);
  assert.equal((await handover(r, r.volunteer, "verify", "DELIVERY", await issue(r, "DELIVERY"))).status, 200);
  return r;
}
test("browser page loading avoids external fonts and private pages become usable promptly", { skip: process.env.RUN_PERFORMANCE_BROWSER !== "1", timeout: 120_000 }, async () => {
  const { chromium } = await import("playwright");
  const { mkdir, writeFile } = await import("node:fs/promises");
  const browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL || undefined });
  const artifacts = ".local-postgres/performance";
  await mkdir(artifacts, { recursive: true });
  const results = [], externalFonts = [], errors = [];
  try {
    const cookie = (await login()).cookie;
    assert.equal((await newDonation(cookie)).response.status, 201);
    for (const language of ["bn", "en"]) {
      const context = await browser.newContext({ baseURL: base, viewport: { width: 390, height: 844 }, serviceWorkers: "block" });
      await context.addInitScript((lang) => localStorage.setItem("sharebite_preferred_lang", lang), language);
      // Simulate Google Fonts being unreachable. Local pages must still work.
      await context.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//, (route) => { externalFonts.push(route.request().url()); return route.abort(); });
      const [name, value] = cookie.split("=");
      await context.addCookies([{ name, value, url: base, httpOnly: true, sameSite: "Lax" }]);
      const page = await context.newPage();
      page.on("pageerror", (error) => errors.push(error.message));
      for (const [route, ready] of [["/login", 'form input'], ["/donor/dashboard", '[data-testid="donor-mobile-dashboard"]'], ["/donor/donations/new", 'input[name="title"]']]) {
        const start = performance.now();
        await page.goto(route, { waitUntil: "domcontentloaded" });
        await page.locator(ready).first().waitFor();
        if (route.endsWith("/new")) await page.waitForFunction(() => [...document.querySelectorAll('[data-testid="donation-form-actions"] button')].at(-1)?.disabled === false);
        const usableMs = Math.round(performance.now() - start);
        const fonts = await page.evaluate(async () => {
          await Promise.all([document.fonts.load('400 16px "Hind Siliguri"', '\u09ac\u09be\u0982\u09b2\u09be'), document.fonts.load('400 16px "Plus Jakarta Sans"', 'ShareBite')]);
          await document.fonts.ready;
          const resources = performance.getEntriesByType("resource").filter((entry) => entry.name.includes("/fonts/"));
          return { resources: resources.map((entry) => new URL(entry.name).pathname),
            bengali: document.fonts.check('400 16px "Hind Siliguri"', '\u09ac\u09be\u0982\u09b2\u09be'), latin: document.fonts.check('400 16px "Plus Jakarta Sans"', 'ShareBite') };
        });
        assert.ok(usableMs < 8000, `${route} took ${usableMs} ms on localhost`);
        assert.ok(fonts.resources.length > 0);
        assert.ok(fonts.bengali && fonts.latin, "Both writing systems retain their local fonts");
        results.push({ language, route, usableMs, fontFiles: fonts.resources.length });
      }
      await page.screenshot({ path: `${artifacts}/local-fonts-${language}.png` });
      await context.close();
    }
    assert.deepEqual(externalFonts, [], "Loading text must not depend on a Google connection");
    const font = await request("/fonts/hind-siliguri-ijwTs5juQtsyLLR5jN4cxBEoTI7ax9k0.woff2");
    assert.equal(font.status, 200);
    assert.match(font.headers.get("cache-control"), /max-age=31536000/);
    assert.equal(Buffer.from(await font.arrayBuffer()).subarray(0,4).toString(), "wOF2");
    assert.deepEqual(errors, []);
    await writeFile(artifacts + "/page-loading.json", JSON.stringify(results, null, 2));
    console.log("Local page loading (milliseconds): " + JSON.stringify(results));
  } finally { await browser.close(); }
});

test("browser donor mobile arrangement keeps posting tracking and optional information clear", { skip: process.env.RUN_DONOR_MOBILE_BROWSER !== "1", timeout: 180_000 }, async () => {
  const { chromium } = await import("playwright");
  const { mkdir } = await import("node:fs/promises");
  const artifacts = ".local-postgres/donor-mobile-browser";
  await mkdir(artifacts, { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL || undefined });
  const errors = [];
  try {
    const r = await assignedRescue();
    await newDonation(r.donor, { title: "Covered rice and chicken for community meals", sampleImageId: "packed-meals" });
    await prisma.user.update({ where: { id: "second-DONOR" }, data: { displayName: "UIU Central Cafeteria" } });
    const emptyCookie = await secondLogin("DONOR");
    for (const [width, language] of [[320,"bn"], [390,"en"], [768,"bn"], [1280,"en"]]) {
      const context = await browser.newContext({ baseURL: base, viewport: { width, height: 844 }, isMobile: width < 600, hasTouch: width < 600 });
      await context.addInitScript((lang) => localStorage.setItem("sharebite_preferred_lang", lang), language);
      const [name, value] = emptyCookie.split("=");
      await context.addCookies([{ name, value, url: base, httpOnly: true, sameSite: "Lax" }]);
      const page = await context.newPage();
      page.on("pageerror", (error) => errors.push(error.message));
      const t = (source) => uiLabel(source, language);
      await page.goto("/donor/dashboard", { waitUntil: "networkidle" });
      await page.getByTestId("donor-mobile-dashboard").waitFor();
      const post = page.getByTestId(width < 1024 ? "donor-mobile-post-action" : "donor-post-action");
      const guide = page.getByTestId("donor-getting-started");
      await guide.waitFor();
      assert.equal(await guide.getAttribute("open"), null, "The home page keeps the guide collapsed");
      assert.equal(await guide.locator("ol").isVisible(), false);
      await page.getByTestId("donor-empty-posts").waitFor();
      await guide.locator("summary").click();
      assert.equal(await guide.locator("li").count(), 3);
      assert.equal(await guide.locator("ol").isVisible(), true);
      await guide.locator("summary").press("Enter");
      assert.equal(await guide.locator("ol").isVisible(), false, "The guide closes with the keyboard");
      assert.equal(await page.getByTestId("donor-contribution").count(), 0, "New donors see guidance instead of three zero counters");
      assert.equal(await page.getByRole("group", { name: t("Donation list filters"), exact: true }).count(), 0, "Do not show empty list filters");
      assert.equal(await page.locator("main").locator('a[href="/donor/donations/new"]').filter({ visible: true }).count(), width < 1024 ? 0 : 1);
      if (width < 1024) {
        const banner = page.getByRole("region", { name: t("Share extra food"), exact: true });
        assert.equal(await banner.isVisible(), false, "Mobile home focuses on food posts");
        assert.ok(parseFloat(await page.locator("main h1").evaluate((node) => getComputedStyle(node).fontSize)) <= 20);
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await page.screenshot({ path: `${artifacts}/first-use-${width}-${language}.png`, fullPage: true });
      await page.screenshot({ path: `${artifacts}/first-use-screen-${width}-${language}.png` });
      await post.click();
      await page.waitForURL(base + "/donor/donations/new");
      await page.locator('input[name="title"]').waitFor();
      const [ownerName, ownerValue] = r.donor.split("=");
      await context.addCookies([{ name: ownerName, value: ownerValue, url: base, httpOnly: true, sameSite: "Lax" }]);
      await page.goto("/donor/dashboard", { waitUntil: "networkidle" });
      await page.getByTestId("donor-contribution").waitFor();
      assert.equal(await post.count(), 1);
      const box = await post.boundingBox();
      assert.ok(box.height >= 44 && box.y >= 0 && box.y + box.height <= 844, "The posting action stays reachable");
      if (width < 1024) assert.equal(await page.getByRole("region", { name: t("Share extra food"), exact: true }).isVisible(), false, "Active rescue takes priority over the banner");
      assert.equal(await page.getByTestId("donor-active-donation").getAttribute("data-donation-id"), r.donation.id, "An assigned pickup beats a newer unclaimed post");
      if (width === 320) {
        assert.equal((await handover(r, r.volunteer, "verify", "PICKUP", await issue(r, "PICKUP"))).status, 200);
        await page.locator('[data-testid="donor-active-donation"][data-status="PICKED_UP"]').waitFor({ timeout: 15000 });
        await page.route("**/api/donations", (route) => route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "Temporary connection problem" }) }));
        await page.getByTestId("donor-dashboard-error").waitFor({ timeout: 15000 });
        assert.equal(await page.getByTestId("donor-active-donation").getAttribute("data-status"), "PICKED_UP", "Keep the last saved pickup on a failed refresh");
        await page.unroute("**/api/donations");
        await page.getByTestId("donor-dashboard-error").waitFor({ state: "hidden", timeout: 15000 });
      }
      const dashboard = page.getByTestId("donor-mobile-dashboard");
      assert.ok(!(await dashboard.innerText()).includes(r.donation.id), "Database identifiers do not crowd the dashboard");
      assert.equal(await dashboard.getByTestId("donor-activity").getAttribute("open"), null);
      await dashboard.getByRole("button", { name: new RegExp(t("Distributed")), exact: false }).click();
      await dashboard.getByText(t("Your completed distributions will appear here."), { exact: true }).waitFor();
      await dashboard.getByRole("button", { name: new RegExp(t("Recent posts")), exact: false }).click();
      await dashboard.getByRole("link").filter({ hasText: "Covered rice and chicken" }).waitFor();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: `${artifacts}/dashboard-${width}-${language}.png`, fullPage: true });
      await page.screenshot({ path: `${artifacts}/dashboard-screen-${width}-${language}.png` });
      await page.emulateMedia({ reducedMotion: "reduce" });
      assert.equal(await dashboard.evaluate((node) => [...node.querySelectorAll("*")].some((child) => getComputedStyle(child).animationName !== "none")), false);
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await post.click();
      await page.waitForURL(base + "/donor/donations/new");
      await page.locator('[name="title"]').waitFor();
      await page.getByRole("heading", { name: t("Food and quantity"), exact: true }).waitFor();

      const summary = page.getByRole("button", { name: t("View donation summary"), exact: true });
      if (width < 1280) {
        assert.equal(await summary.getAttribute("aria-expanded"), "false");
        await summary.click();
        assert.equal(await summary.getAttribute("aria-expanded"), "true");
        assert.equal(await page.locator("#donation-preview").isVisible(), true);
        await summary.click();
      } else assert.equal(await page.locator("#donation-preview").isVisible(), true);
      const fields = page.locator('form input:not([type="file"]),form select,form textarea');
      assert.equal(await fields.evaluateAll((nodes) => nodes.some((node) => parseFloat(getComputedStyle(node).fontSize) < 16)), false);
      await page.locator('[name="title"]').fill("Fresh meal boxes");
      await page.locator('[name="quantity"]').fill("50");
      await page.locator('[name="allergenInfo"]').fill("None known");
      await page.locator('textarea[name="description"]').fill("Covered and freshly prepared food for pickup");
      await page.screenshot({ path: `${artifacts}/food-short-${width}-${language}.png`, fullPage: true });
      await goDonationStep(page, 3);
      const samplePicker = page.getByTestId("sample-image-picker");
      assert.equal(await samplePicker.getAttribute("open"), null);
      await samplePicker.locator("summary").click();
      await page.getByRole("button", { name: t("Use sample image: {0}").replace("{0}", t("Packed meals")), exact: true }).click();
      await samplePicker.locator("summary").click();
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: `${artifacts}/form-${width}-${language}.png`, fullPage: true });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await page.getByRole("button", { name: t("Next"), exact: true }).click();
      await page.locator('[name="contactPerson"]').waitFor();
      await goDonationStep(page, 1);
      assert.equal(await page.locator('[name="title"]').inputValue(), "Fresh meal boxes");
      assert.equal(await page.locator('[name="quantity"]').inputValue(), "50");
      await context.close();
    }
    assert.deepEqual(errors, []);
  } finally { await browser.close(); }
});

test("browser animated rescue progress follows real handovers across donor NGO and rider", { skip: process.env.RUN_PROGRESS_BROWSER !== "1", timeout: 180_000 }, async () => {
  const { chromium } = await import("playwright");
  const { mkdir } = await import("node:fs/promises");
  const artifacts = ".local-postgres/progress-browser";
  await mkdir(artifacts, { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL || undefined });
  const errors = [];
  async function pageFor(cookie, width = 390) {
    const context = await englishBrowserContext(browser, { baseURL: base, viewport: { width, height: 900 }, timezoneId: "Asia/Dhaka", serviceWorkers: "block" });
    const [name, value] = cookie.split("=");
    await context.addCookies([{ name, value, url: base, httpOnly: true, sameSite: "Lax" }]);
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(error.message));
    return page;
  }
  const panel = (page) => page.getByTestId("rescue-progress");
  async function phase(page, id, state = "active") {
    await page.locator(`[data-testid="rescue-progress"][data-phase="${id}"][data-state="${state}"]`).waitFor({ timeout: 15_000 });
  }
  try {
    const r = await assignedRescue();
    const donor = await pageFor(r.donor, 320);
    const ngo = await pageFor(r.ngo, 1280);
    const rider = await pageFor(r.volunteer);
    await donor.goto(`/donor/donations/${r.donation.id}/tracking`);
    await ngo.goto(`/ngo/claims/${r.claim.id}`);
    await rider.goto(`/volunteer/missions/mission-${r.claim.id}`);
    await Promise.all([phase(donor, "rider"), phase(ngo, "rider"), phase(rider, "assigned")]);
    for (const page of [donor, ngo, rider]) {
      await panel(page).getByRole("button", { name: uiName("Pause animation"), exact: true }).click();
      assert.equal(await panel(page).getAttribute("data-motion"), "paused");
      await panel(page).getByRole("button", { name: uiName("Play animation"), exact: true }).click();
      assert.equal(await panel(page).getAttribute("data-motion"), "running");
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    }
    // Use the real rider action. Other devices must update without reload.
    await rider.getByRole("button", { name: uiName("Travelling to pickup"), exact: true }).click();
    await phase(rider, "en_route_pickup");
    await Promise.all([donor, ngo].map((page) => panel(page).getByRole("heading", { name: uiName("Travelling to pickup"), exact: true }).waitFor({ timeout: 15_000 })));
    await rider.getByRole("button", { name: uiName("At donor location"), exact: true }).click();
    await phase(rider, "at_pickup");
    const pickupCode = await issue(r, "PICKUP");
    await rider.getByLabel(uiName("Six-digit handover code"), { exact: true }).fill(pickupCode);
    await rider.getByRole("button", { name: uiName("Confirm pickup"), exact: true }).click();
    await Promise.all([phase(rider, "cargo_loaded"), phase(donor, "pickup"), phase(ngo, "pickup")]);
    await rider.getByRole("button", { name: uiName("Travelling to NGO"), exact: true }).click();
    await phase(rider, "en_route_dropoff");
    await Promise.all([donor, ngo].map((page) => panel(page).getByRole("heading", { name: uiName("Travelling to NGO"), exact: true }).waitFor({ timeout: 15_000 })));

    // Losing updates must keep the last saved checkpoint, stop motion and recover.
    await donor.route("**/api/claims?*", (route) => route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "Temporary connection problem" }) }));
    await donor.locator('[data-testid="rescue-progress"][data-stale="true"][data-motion="paused"]').waitFor({ timeout: 15_000 });
    assert.equal(await panel(donor).getAttribute("data-phase"), "pickup");
    await donor.unroute("**/api/claims?*");
    await donor.locator('[data-testid="rescue-progress"][data-stale="false"][data-motion="running"]').waitFor({ timeout: 15_000 });

    // Both languages and narrow/wide containers retain all six steps.
    for (const language of ["en", "bn"]) {
      await donor.evaluate((value) => localStorage.setItem("sharebite_preferred_lang", value), language);
      await donor.reload();
      await phase(donor, "pickup");
      for (const width of [320, 390, 1280]) {
        await donor.setViewportSize({ width, height: 900 });
        await panel(donor).scrollIntoViewIfNeeded();
        assert.equal(await panel(donor).locator("li").count(), 6);
        assert.equal(await donor.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${language} ${width}`);
        await panel(donor).screenshot({ path: `${artifacts}/donor-${language}-${width}.png` });
      }
      assert.ok(language === "bn" ? /[\u0980-\u09ff]/.test(await panel(donor).innerText()) : !/[\u0980-\u09ff]/.test(await panel(donor).innerText()));
    }
    await rider.emulateMedia({ reducedMotion: "reduce" });
    assert.equal(await panel(rider).getByRole("button", { name: uiName("Pause animation"), exact: true }).isVisible(), false);
    assert.equal(await panel(rider).evaluate((root) => [...root.querySelectorAll("*")].some((node) => getComputedStyle(node).animationName !== "none")), false);
    await rider.emulateMedia({ reducedMotion: "no-preference" });
    const deliveryCode = await issue(r, "DELIVERY");
    await rider.getByLabel(uiName("Six-digit handover code"), { exact: true }).fill(deliveryCode);
    await rider.getByRole("button", { name: uiName("Confirm delivery"), exact: true }).click();
    await Promise.all([phase(rider, "completed", "complete"), phase(donor, "delivery"), phase(ngo, "delivery")]);
    assert.equal(await panel(rider).locator('li[data-done="true"]').count(), 6);
    await panel(rider).screenshot({ path: `${artifacts}/rider-completed.png` });
    await saveReceipt(r);
    assert.equal((await distribute(r, await distributionInput(r))).status, 201);
    await Promise.all([phase(donor, "distributed", "complete"), phase(ngo, "distributed", "complete")]);
    await panel(ngo).screenshot({ path: `${artifacts}/ngo-distributed.png` });
    // The dashboard uses the same progress and retains delivery completion.
    await rider.goto("/volunteer/dashboard");
    // Completed rescues stay in history after reload; a fresh mission shows the HUD.
    const paused = await assignedRescue();
    const heldRider = await pageFor(paused.volunteer);
    await heldRider.goto("/volunteer/dashboard");
    await phase(heldRider, "assigned");
    assert.equal((await reportIncident(paused, paused.ngo)).status, 201);
    await heldRider.goto(`/volunteer/missions/mission-${paused.claim.id}`);
    await phase(heldRider, "assigned", "paused");
    assert.equal(await panel(heldRider).getAttribute("data-motion"), "paused");
    assert.equal(await heldRider.getByRole("button", { name: uiName("Confirm pickup"), exact: true }).count(), 0);
    await panel(heldRider).screenshot({ path: `${artifacts}/rider-incident-paused.png` });
    const released = await assignedRescue();
    await jsonResult("/api/claims", { cookie: released.ngo, method: "PATCH", body: { id: released.claim.id, status: "CANCELLED" } });
    await donor.goto(`/donor/donations/${released.donation.id}/tracking`);
    await phase(donor, "posted");
    assert.equal(await panel(donor).locator('[data-step="claimed"] time').count(), 0, "Do not carry cancelled handovers into reopened food");
    assert.deepEqual(errors, []);
  } finally { await browser.close(); }
});

function receiptInput(changes = {}) {
  return { actualQuantity: 20, foodCondition: "GOOD", quantityMismatchConfirmed: false, notes: "Received at NGO", photoNames: [], ...changes };
}
async function saveReceipt(r, changes = {}) {
  return jsonResult("/api/deliveries", { cookie: r.ngo, method: "POST", body: { claimId: r.claim.id, input: receiptInput(changes) } }, 201);
}
async function distributionInput(r, changes = {}) {
  const profile = await jsonResult("/api/profile", { cookie: r.ngo });
  return { beneficiariesServed: 10, mealsDistributed: 10, distributedAt: new Date().toISOString(), addressId: profile.addresses[0].id, photoNames: ["food.jpg"], beneficiaryConsentConfirmed: true, ...changes };
}
function distribute(r, input) {
  return request("/api/distributions", { cookie: r.ngo, method: "POST", body: { claimId: r.claim.id, input } });
}

test("handover codes are issued only by the owner and never exposed by read APIs", async () => {
  const r = await assignedRescue();
  assert.equal((await handover(r, r.ngo, "issue", "PICKUP")).status, 403);
  assert.equal((await handover(r, r.volunteer, "issue", "PICKUP")).status, 403);
  assert.equal((await handover(r, await secondLogin("DONOR"), "issue", "PICKUP")).status, 404);
  assert.equal((await handover(r, r.ngo, "issue", "DELIVERY")).status, 409);
  const code = await issue(r, "PICKUP");
  const stored = await prisma.handoverChallenge.findUnique({ where: { claimId_kind: { claimId: r.claim.id, kind: "PICKUP" } } });
  assert.match(stored.codeHash, /^[a-f0-9]{64}$/);
  assert.notEqual(stored.codeHash, code);
  for (const [route, cookie] of [
    ["/api/handovers?claimId=" + r.claim.id, r.volunteer],
    ["/api/claims?id=" + r.claim.id, r.donor],
    ["/api/missions?claimId=" + r.claim.id, r.volunteer],
    ["/api/dispatches", r.volunteer],
  ]) {
    const body = await jsonResult(route, { cookie });
    assert.ok(!JSON.stringify(body).includes(code), route);
    assert.ok(!JSON.stringify(body).includes(stored.codeHash), route);
  }
  assert.equal((await handover(r, r.donor, "issue", "PICKUP")).status, 429);
});

test("OTP wrong attempts commit, serialize and lock after five tries", async () => {
  const r = await assignedRescue();
  const code = await issue(r, "PICKUP");
  const wrong = code === "100000" ? "100001" : "100000";
  assert.equal((await handover(r, r.volunteer, "verify", "PICKUP", "12")).status, 422);
  const responses = await Promise.all(Array.from({ length: 5 }, () => handover(r, r.volunteer, "verify", "PICKUP", wrong)));
  assert.deepEqual(responses.map((x) => x.status).sort(), [422, 422, 422, 422, 429]);
  assert.equal((await handover(r, r.volunteer, "verify", "PICKUP", code)).status, 429);
  const challenge = await prisma.handoverChallenge.findUnique({ where: { claimId_kind: { claimId: r.claim.id, kind: "PICKUP" } } });
  assert.equal(challenge.attempts, 5);
  assert.equal(challenge.consumedAt, null);
  assert.equal((await prisma.claim.findUnique({ where: { id: r.claim.id } })).status, "ASSIGNED");
});

test("replacement codes rotate old secrets and expired codes fail", async () => {
  const r = await assignedRescue();
  const first = await issue(r, "PICKUP");
  const where = { claimId_kind: { claimId: r.claim.id, kind: "PICKUP" } };
  await prisma.handoverChallenge.update({ where, data: { expiresAt: new Date(Date.now() - 60_000), issuedAt: new Date(Date.now() - 61_000) } });
  assert.equal((await handover(r, r.volunteer, "verify", "PICKUP", first)).status, 410);
  const replacement = await issue(r, "PICKUP");
  assert.notEqual(replacement, first);
  assert.equal((await handover(r, r.volunteer, "verify", "PICKUP", first)).status, 422);
  assert.equal((await handover(r, r.volunteer, "verify", "PICKUP", replacement)).status, 200);
});

test("only the assigned verified volunteer can verify a code; cancelled and unsafe food cannot progress", async () => {
  const r = await assignedRescue();
  const code = await issue(r, "PICKUP");
  assert.equal((await handover(r, r.donor, "verify", "PICKUP", code)).status, 403);
  assert.equal((await handover(r, await secondLogin("VOLUNTEER"), "verify", "PICKUP", code)).status, 404);
  await prisma.volunteerProfile.update({ where: { userId: r.volunteerUser.id }, data: { verificationStatus: "PENDING" } });
  assert.equal((await handover(r, r.volunteer, "verify", "PICKUP", code)).status, 403);
  await prisma.volunteerProfile.update({ where: { userId: r.volunteerUser.id }, data: { verificationStatus: "VERIFIED" } });
  await jsonResult("/api/claims", { cookie: r.ngo, method: "PATCH", body: { id: r.claim.id, status: "CANCELLED" } });
  assert.equal((await handover(r, r.volunteer, "verify", "PICKUP", code)).status, 409);
  const unsafe = await assignedRescue();
  const unsafeCode = await issue(unsafe, "PICKUP");
  await prisma.donation.update({ where: { id: unsafe.donation.id }, data: { safePickupDeadline: new Date(Date.now() - 60_000) } });
  assert.equal((await handover(unsafe, unsafe.volunteer, "verify", "PICKUP", unsafeCode)).status, 409);
});

test("route stages persist and generic status updates cannot bypass OTP", async () => {
  const r = await assignedRescue();
  assert.equal((await request("/api/missions", { cookie: r.volunteer, method: "PATCH", body: { claimId: r.claim.id, stage: "completed" } })).status, 409);
  assert.equal((await request("/api/claims", { cookie: r.ngo, method: "PATCH", body: { id: r.claim.id, status: "PICKED_UP" } })).status, 422);
  for (const stage of ["en_route_pickup", "at_pickup"]) {
    await jsonResult("/api/missions", { cookie: r.volunteer, method: "PATCH", body: { claimId: r.claim.id, stage } });
    const { mission } = await jsonResult("/api/missions?claimId=" + r.claim.id, { cookie: r.volunteer });
    assert.equal(mission.currentStage, stage);
  }
  assert.equal((await request("/api/missions?claimId=" + r.claim.id, { cookie: await secondLogin("VOLUNTEER") })).status, 404);
  assert.equal((await request("/api/missions", { cookie: r.donor })).status, 403);
});

test("single-use verification and volunteer completion are atomic under concurrent requests", async () => {
  const r = await assignedRescue();
  const pickup = await issue(r, "PICKUP");
  const responses = await Promise.all([1, 2].map(() => handover(r, r.volunteer, "verify", "PICKUP", pickup)));
  assert.deepEqual(responses.map((x) => x.status).sort(), [200, 409]);
  assert.equal((await handover(r, r.volunteer, "verify", "PICKUP", pickup)).status, 409);
  const delivery = await issue(r, "DELIVERY");
  const deliveries = await Promise.all([1, 2].map(() => handover(r, r.volunteer, "verify", "DELIVERY", delivery)));
  assert.deepEqual(deliveries.map((x) => x.status).sort(), [200, 409]);
  assert.equal((await prisma.volunteerProfile.findUnique({ where: { userId: r.volunteerUser.id } })).completedRescues, 1);
  assert.equal((await prisma.claim.findUnique({ where: { id: r.claim.id } })).routeStage, "completed");
  const missions = await jsonResult("/api/missions", { cookie: r.volunteer });
  assert.equal(missions.activeMission, null);
  assert.equal(missions.completedHistory.length, 1);
  assert.equal(missions.completedHistory[0].id, r.claim.id);
});

test("issued OTP and mission stage survive an application restart", async () => {
  const r = await assignedRescue();
  const code = await issue(r, "PICKUP");
  await jsonResult("/api/missions", { cookie: r.volunteer, method: "PATCH", body: { claimId: r.claim.id, stage: "en_route_pickup" } });
  await stopServer();
  await startServer();
  const { mission } = await jsonResult("/api/missions?claimId=" + r.claim.id, { cookie: r.volunteer });
  assert.equal(mission.currentStage, "en_route_pickup");
  assert.equal((await handover(r, r.volunteer, "verify", "PICKUP", code)).status, 200);
});

test("NGO receipts require verified delivery and validate quantity ownership and replay", async () => {
  const r = await assignedRescue();
  const options = { cookie: r.ngo, method: "POST", body: { claimId: r.claim.id, input: receiptInput() } };
  assert.equal((await request("/api/deliveries", options)).status, 409);
  assert.equal((await handover(r, r.volunteer, "verify", "PICKUP", await issue(r, "PICKUP"))).status, 200);
  assert.equal((await request("/api/deliveries", options)).status, 409);
  assert.equal((await handover(r, r.volunteer, "verify", "DELIVERY", await issue(r, "DELIVERY"))).status, 200);
  assert.equal((await request("/api/deliveries", { ...options, cookie: r.donor })).status, 403);
  assert.equal((await request("/api/deliveries", { ...options, cookie: await secondLogin("NGO") })).status, 404);
  options.body.input.actualQuantity = 10;
  assert.equal((await request("/api/deliveries", options)).status, 422);
  options.body.input.quantityMismatchConfirmed = true;
  options.body.input.verificationMethod = "QR"; // Client cannot choose an unverified method.
  const saved = await jsonResult("/api/deliveries", options, 201);
  assert.equal(saved.receipt.verificationMethod, "OTP");
  assert.equal(saved.receipt.actualQuantity, 10);
  assert.equal((await request("/api/deliveries", options)).status, 409);
  assert.equal((await jsonResult("/api/deliveries?claimId=" + r.claim.id, { cookie: r.ngo })).receipt.id, saved.receipt.id);
});

test("distribution requires a safe receipt, owned address, consent and credible meal counts", async () => {
  const r = await deliveredRescue();
  let input = await distributionInput(r);
  assert.equal((await distribute(r, input)).status, 409);
  await saveReceipt(r, { actualQuantity: 10, quantityMismatchConfirmed: true });
  for (const changes of [
    { beneficiaryConsentConfirmed: false }, { beneficiariesServed: 0 }, { mealsDistributed: 11 },
    { adultsServed: 11 }, { distributedAt: new Date(Date.now() + 60_000).toISOString() },
    { distributedAt: new Date(Date.now() - 60_000).toISOString() },
  ]) assert.equal((await distribute(r, await distributionInput(r, changes))).status, 422);
  const foreign = await prisma.address.findFirst({ where: { ownerId: "second-NGO" } });
  input = await distributionInput(r, { addressId: foreign.id });
  assert.equal((await distribute(r, input)).status, 403);
  await prisma.donation.update({ where: { id: r.donation.id }, data: { safePickupDeadline: new Date(Date.now() - 60_000) } });
  assert.equal((await distribute(r, await distributionInput(r))).status, 409);
  assert.equal(await prisma.impactRecord.count({ where: { claimId: r.claim.id } }), 0);
});

test("damaged food blocks distribution and produces no impact", async () => {
  const r = await deliveredRescue();
  const saved = await saveReceipt(r, { foodCondition: "DAMAGED_POOR", notes: "Packaging damaged and food spoiled" });
  assert.equal(saved.receipt.distributionBlocked, true);
  assert.equal((await distribute(r, await distributionInput(r))).status, 409);
  assert.equal(await prisma.distributionRecord.count({ where: { claimId: r.claim.id } }), 0);
});

test("complete rescue records distribution and impact exactly once under racing submissions", async () => {
  const r = await deliveredRescue();
  await saveReceipt(r);
  const ngoBefore = await prisma.nGOProfile.findUnique({ where: { userId: "test-NGO" } });
  const input = await distributionInput(r, { adultsServed: 7, childrenServed: 3 });
  const responses = await Promise.all([1, 2].map(() => distribute(r, input)));
  assert.deepEqual(responses.map((x) => x.status).sort(), [201, 409]);
  const ngoAfter = await prisma.nGOProfile.findUnique({ where: { userId: "test-NGO" } });
  assert.equal(ngoAfter.completedRescues, ngoBefore.completedRescues + 1);
  assert.equal(ngoAfter.peopleHelped, ngoBefore.peopleHelped + 10);
  assert.equal(await prisma.impactRecord.count({ where: { claimId: r.claim.id } }), 1);
  const impact = await prisma.impactRecord.findUnique({ where: { claimId: r.claim.id } });
  assert.equal(impact.mealsRescued, 10);
  assert.equal(impact.foodWeightKg, 5);
  assert.match(impact.estimateMethodology, /Illustrative/);
  const record = await jsonResult("/api/distributions?claimId=" + r.claim.id, { cookie: r.donor });
  assert.deepEqual(record.distribution.photoNames, ["food.jpg"]);
  assert.deepEqual(record.distribution.photoUrls, []);
  assert.equal((await prisma.claim.findUnique({ where: { id: r.claim.id } })).status, "DISTRIBUTED");
  assert.equal((await prisma.donation.findUnique({ where: { id: r.donation.id } })).status, "DISTRIBUTED");
  assert.equal((await request("/api/distributions?claimId=" + r.claim.id, { cookie: await secondLogin("NGO") })).status, 404);
  const history = await jsonResult("/api/missions", { cookie: r.volunteer });
  assert.equal(history.completedHistory[0].servings, 10);
  for (const [route, cookie] of [
    ["/donor/donations/" + r.donation.id, r.donor],
    ["/ngo/claims/" + r.claim.id, r.ngo],
    ["/ngo/claims/" + r.claim.id + "/confirm-delivery", r.ngo],
    ["/ngo/claims/" + r.claim.id + "/distribution", r.ngo],
    ["/volunteer/missions/mission-" + r.claim.id, r.volunteer],
  ]) assert.equal((await request(route, { cookie })).status, 200, route);
  const donorImpact = await jsonResult("/api/impact", { cookie: r.donor });
  assert.ok(donorImpact.recentRecords.some((record) => record.claimId === r.claim.id && record.mealsRescued === 10));
  const ngoImpact = await jsonResult("/api/impact", { cookie: r.ngo });
  assert.ok(ngoImpact.recentRecords.some((record) => record.claimId === r.claim.id && record.beneficiariesServed === 10));
});

test("kilogram impact is prorated to received food and recorded distribution", async () => {
  const r = await deliveredRescue();
  await prisma.donation.update({ where: { id: r.donation.id }, data: { quantityValue: 10, quantityUnit: "KILOGRAMS", estimatedMeals: 40 } });
  await saveReceipt(r, { actualQuantity: 5, quantityMismatchConfirmed: true });
  const response = await distribute(r, await distributionInput(r));
  assert.equal(response.status, 201, JSON.stringify(await response.json()));
  const impact = await prisma.impactRecord.findUnique({ where: { claimId: r.claim.id } });
  assert.equal(impact.mealsRescued, 10);
  assert.equal(impact.foodWeightKg, 2.5, "Half of the 20-meal received capacity was distributed");
});

async function imageBytes(format = "png", width = 16, height = 12) {
  return sharp({ create: { width, height, channels: 3, background: "#3c9f66" } }).toFormat(format).toBuffer();
}
async function photoUpload(cookie, { purpose = "DONATION", claimId, files, headers = {} } = {}) {
  const form = new FormData();
  form.set("purpose", purpose);
  if (claimId) form.set("claimId", claimId);
  for (const file of files ?? [{ bytes: await imageBytes(), name: "food.png", type: "image/png" }]) {
    form.append("files", new Blob([file.bytes], { type: file.type }), file.name);
  }
  return fetch(base + "/api/photos", { method: "POST", body: form, headers: { ...(cookie ? { cookie } : {}), ...headers } });
}
async function uploadedPhoto(cookie, options) {
  const response = await photoUpload(cookie, options);
  const body = await response.json();
  assert.equal(response.status, 201, JSON.stringify(body));
  assert.equal(body.photos.length, 1);
  return body.photos[0];
}

test("photo uploads enforce login, role, context and cross-site protection", async () => {
  assert.equal((await photoUpload()).status, 401);
  const donor = (await login()).cookie, ngo = (await login("NGO")).cookie, volunteer = (await login("VOLUNTEER")).cookie;
  assert.equal((await photoUpload(volunteer)).status, 403);
  assert.equal((await photoUpload(ngo)).status, 403);
  assert.equal((await photoUpload(donor, { purpose: "RECEIPT" })).status, 403);
  assert.equal((await photoUpload(donor, { purpose: "INVALID" })).status, 422);
  assert.equal((await photoUpload(donor, { headers: { origin: "https://foreign.example" } })).status, 403);
  assert.equal((await photoUpload(ngo, { purpose: "RECEIPT", claimId: "missing-claim" })).status, 404);
  assert.equal((await request("/api/photos", { cookie: donor, method: "POST", body: {} })).status, 400);
});

test("photo validation rejects fake images, unsupported formats, excessive files and size", async () => {
  const donor = (await login()).cookie;
  for (const file of [
    { bytes: Buffer.from("<svg><script>alert(1)</script></svg>"), type: "image/svg+xml", name: "attack.svg" },
    { bytes: Buffer.from("<svg/>"), type: "image/jpeg", name: "renamed.jpg" },
    { bytes: Buffer.from("not an image"), type: "image/png", name: "fake.png" },
    { bytes: Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), type: "image/png", name: "broken.png" },
    { bytes: await imageBytes(), type: "image/jpeg", name: "wrong-mime.jpg" },
    { bytes: await imageBytes("png", 4500, 4500), type: "image/png", name: "over-20-megapixels.png" },
  ]) assert.equal((await photoUpload(donor, { files: [file] })).status, 415, file.name);
  assert.equal((await photoUpload(donor, { files: [] })).status, 422);
  assert.equal((await photoUpload(donor, { files: Array.from({ length: 6 }, () => ({ bytes: Buffer.from("x"), type: "image/png", name: "food.png" })) })).status, 422);
  assert.equal((await photoUpload(donor, { files: [{ bytes: Buffer.alloc(5 * 1024 * 1024 + 1), type: "image/png", name: "large.png" }] })).status, 413);
  assert.equal(await prisma.photoAsset.count({ where: { originalName: { in: ["fake.png", "broken.png", "large.png", "attack.svg"] } } }), 0);
});

test("real photos are normalized, resized, metadata-stripped and served privately", async () => {
  const donor = (await login()).cookie;
  const bytes = await sharp(await imageBytes("jpeg", 2200, 1000)).withMetadata({ orientation: 6 }).jpeg().toBuffer();
  const photo = await uploadedPhoto(donor, { files: [{ bytes, name: "../camera-photo.jpg", type: "image/jpeg" }] });
  assert.ok(photo.width <= 1600 && photo.height <= 1600);
  assert.equal(photo.name.includes("/"), false);
  assert.equal(photo.data, undefined);
  assert.equal(photo.ownerId, undefined);
  const response = await request(photo.url, { cookie: donor });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "image/webp");
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.match(response.headers.get("vary"), /Cookie/i);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  const received = Buffer.from(await response.arrayBuffer());
  assert.equal(received.length, photo.byteSize);
  const metadata = await sharp(received).metadata();
  assert.equal(metadata.format, "webp");
  assert.equal(metadata.exif, undefined);
  assert.equal(metadata.icc, undefined);
  assert.equal((await request(photo.url)).status, 401);
  assert.equal((await request(photo.url, { cookie: await secondLogin("DONOR") })).status, 404);
  assert.equal((await request(photo.url, { cookie: (await login("NGO")).cookie })).status, 404);
  assert.equal((await request(photo.url, { cookie: await secondLogin("DONOR"), method: "DELETE" })).status, 404);
  assert.equal((await request(photo.url, { cookie: donor, method: "DELETE" })).status, 204);
  assert.equal((await request(photo.url, { cookie: donor })).status, 404);
});

test("multipart uploads over ten MB reach the route and normalize all five files", async () => {
  const donor = (await login()).cookie;
  const bytes = Buffer.concat([await imageBytes(), Buffer.alloc(2300 * 1024)]);
  const response = await photoUpload(donor, { files: Array.from({ length: 5 }, (_, i) => ({ bytes, name: uiName("batch-") + i + ".png", type: "image/png" })) });
  const result = await response.json();
  assert.equal(response.status, 201, JSON.stringify(result));
  assert.equal(result.photos.length, 5);
  assert.ok(result.photos.every((p) => p.byteSize < 1024));
  for (const p of result.photos) assert.equal((await request(p.url, { cookie: donor, method: "DELETE" })).status, 204);
});

test("donation photos bind atomically and follow donation visibility", async () => {
  const r = await assignedRescue();
  // A new available listing is visible to discovery NGOs before it is claimed.
  const photo = await uploadedPhoto(r.donor);
  const created = await newDonation(r.donor, { photoUrls: [photo.url] });
  assert.equal(created.response.status, 201, JSON.stringify(created.body));
  assert.deepEqual(created.body.donation.photoUrls, [photo.url]);
  assert.equal((await request(photo.url, { cookie: r.ngo })).status, 200);
  assert.equal((await request(photo.url, { cookie: await secondLogin("DONOR") })).status, 404);
  assert.equal((await request(photo.url, { cookie: r.volunteer })).status, 404);
  const claim = (await jsonResult("/api/claims", { cookie: r.ngo, method: "POST", body: { donationId: created.body.donation.id } }, 201)).claim;
  assert.equal((await request(photo.url, { cookie: await secondLogin("NGO") })).status, 404);
  assert.equal((await request(photo.url, { cookie: r.donor, method: "DELETE" })).status, 409);
  assert.equal((await newDonation(r.donor, { photoUrls: [photo.url] })).response.status, 409);
  assert.equal((await newDonation(await secondLogin("DONOR"), { photoUrls: [photo.url] })).response.status, 403);
  assert.equal((await newDonation(r.donor, { photoUrls: ["https://external.example/fake.jpg"] })).response.status, 422);
  const pending = await uploadedPhoto(r.donor);
  assert.equal((await newDonation(r.donor, { photoUrls: [pending.url, pending.url] })).response.status, 422);
  assert.equal((await prisma.photoAsset.findUnique({ where: { id: pending.id } })).attachedAt, null);
  assert.equal((await request(pending.url, { cookie: r.donor, method: "DELETE" })).status, 204);
  assert.equal((await prisma.claim.findUnique({ where: { id: claim.id } })).status, "RESERVED");
});

test("invalid batches and concurrent attachment never save partial photo ownership", async () => {
  const donor = (await login()).cookie;
  const response = await photoUpload(donor, { files: [
    { bytes: await imageBytes(), name: "atomic-first.png", type: "image/png" },
    { bytes: Buffer.from("bad"), name: "atomic-second.png", type: "image/png" },
  ] });
  assert.equal(response.status, 415);
  assert.equal(await prisma.photoAsset.count({ where: { originalName: "atomic-first.png" } }), 0);
  const photo = await uploadedPhoto(donor);
  const results = await Promise.all([1, 2].map(() => newDonation(donor, { photoUrls: [photo.url] })));
  assert.deepEqual(results.map((r) => r.response.status).sort(), [201, 409]);
  const stored = await prisma.photoAsset.findUnique({ where: { id: photo.id } });
  assert.ok(stored.attachedAt);
  assert.equal(await prisma.donation.count({ where: { photoUrls: { has: photo.url } } }), 1);
});

test("receipt and distribution evidence stay private until the matching record is saved", async () => {
  const r = await assignedRescue();
  assert.equal((await photoUpload(r.ngo, { purpose: "RECEIPT", claimId: r.claim.id })).status, 409);
  assert.equal((await handover(r, r.volunteer, "verify", "PICKUP", await issue(r, "PICKUP"))).status, 200);
  assert.equal((await handover(r, r.volunteer, "verify", "DELIVERY", await issue(r, "DELIVERY"))).status, 200);
  const receipt = await uploadedPhoto(r.ngo, { purpose: "RECEIPT", claimId: r.claim.id });
  assert.equal((await request(receipt.url, { cookie: r.donor })).status, 404);
  assert.equal((await request(receipt.url, { cookie: r.volunteer })).status, 404);
  const saved = await saveReceipt(r, { photoUrls: [receipt.url], photoNames: ["untrusted-name"] });
  assert.deepEqual(saved.receipt.photoUrls, [receipt.url]);
  assert.deepEqual(saved.receipt.photoNames, ["food.png"]);
  assert.equal((await request(receipt.url, { cookie: r.donor })).status, 200);
  assert.equal((await request(receipt.url, { cookie: r.volunteer })).status, 200);
  assert.equal((await request(receipt.url, { cookie: await secondLogin("NGO") })).status, 404);
  assert.equal((await request(receipt.url, { cookie: r.ngo, method: "DELETE" })).status, 409);
  assert.equal((await photoUpload(r.ngo, { purpose: "RECEIPT", claimId: r.claim.id })).status, 409);
  const photo = await uploadedPhoto(r.ngo, { purpose: "DISTRIBUTION", claimId: r.claim.id });
  assert.equal((await request(photo.url, { cookie: r.donor })).status, 404);
  const input = await distributionInput(r, { photoUrls: [photo.url] });
  const response = await distribute(r, input);
  assert.equal(response.status, 201, JSON.stringify(await response.clone().json()));
  assert.deepEqual((await response.json()).distribution.photoUrls, [photo.url]);
  assert.equal((await request(photo.url, { cookie: r.donor })).status, 200);
  assert.equal((await request(photo.url, { cookie: r.volunteer })).status, 200);
  assert.equal((await request(photo.url, { cookie: await secondLogin("NGO") })).status, 404);
});

test("evidence cannot be attached to another claim or a different purpose", async () => {
  const first = await deliveredRescue(), second = await deliveredRescue();
  const photo = await uploadedPhoto(first.ngo, { purpose: "RECEIPT", claimId: first.claim.id });
  const response = await request("/api/deliveries", { cookie: second.ngo, method: "POST", body: { claimId: second.claim.id, input: receiptInput({ photoUrls: [photo.url] }) } });
  assert.equal(response.status, 409);
  assert.equal(await prisma.deliveryReceipt.count({ where: { claimId: second.claim.id } }), 0);
  await saveReceipt(first);
  const distribution = await distribute(first, await distributionInput(first, { photoUrls: [photo.url] }));
  assert.equal(distribution.status, 409);
  assert.equal((await prisma.photoAsset.findUnique({ where: { id: photo.id } })).attachedAt, null);
  assert.equal((await photoUpload(await secondLogin("NGO"), { purpose: "RECEIPT", claimId: first.claim.id })).status, 404);
  assert.equal((await request(photo.url, { cookie: first.ngo, method: "DELETE" })).status, 204);
});

test("stored photos survive an application restart and logout removes access", async () => {
  const donor = (await login()).cookie;
  const photo = await uploadedPhoto(donor, { files: [{ bytes: await imageBytes("webp"), name: "restart.webp", type: "image/webp" }] });
  await stopServer(); await startServer();
  const read = await request(photo.url, { cookie: donor });
  assert.equal(read.status, 200);
  assert.equal((await read.arrayBuffer()).byteLength, photo.byteSize);
  assert.equal((await request("/api/auth/logout", { cookie: donor, method: "POST" })).status, 200);
  assert.equal((await request(photo.url, { cookie: donor })).status, 401);
});

test("browser distribution reports invalid fields and completes with different device clocks", { skip: process.env.RUN_DISTRIBUTION_BROWSER !== "1" }, async () => {
  const { chromium } = await import("playwright");
  const { mkdir } = await import("node:fs/promises");
  const screenshots = ".local-postgres/distribution-browser";
  await mkdir(screenshots, { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL || undefined });
  const runtime = [];
  try {
    for (const [width, language, clockOffset] of [[390, "en", 0], [320, "bn", 600_000], [1280, "en", -600_000]]) {
      const rescue = await deliveredRescue();
      await saveReceipt(rescue);
      const context = await browser.newContext({ baseURL: base, viewport: { width, height: 844 }, timezoneId: "Asia/Dhaka", isMobile: width < 600, hasTouch: width < 600 });
      await context.addInitScript((lang) => localStorage.setItem("sharebite_preferred_lang", lang), language);
      const [name, value] = rescue.ngo.split("=");
      await context.addCookies([{ name, value, url: base, httpOnly: true, sameSite: "Lax" }]);
      const page = await context.newPage();
      page.on("pageerror", (error) => runtime.push(error.message));
      if (clockOffset) await page.clock.setFixedTime(new Date(Date.now() + clockOffset));
      const t = (source) => uiLabel(source, language);
      await page.goto("/ngo/claims/" + rescue.claim.id + "/distribution", { waitUntil: "networkidle" });
      const people = page.getByLabel(t("People served"), { exact: true });
      const meals = page.getByLabel(t("Meals distributed"), { exact: true });
      const time = page.getByLabel(t("Distribution date and time"), { exact: true });
      const consent = page.getByLabel(t("I confirm consent and privacy safeguards were followed"));
      const complete = page.getByRole("button", { name: t("Complete rescue"), exact: true });
      await people.fill("10"); await meals.fill("10"); await consent.check();
      if (clockOffset === 0) {
        await time.fill("2099-01-01T12:00");
        await complete.click();
        await page.getByText(t("Distribution time cannot be in the future."), { exact: true }).waitFor({ timeout: 5000 });
        assert.equal(await time.getAttribute("aria-invalid"), "true");
        assert.equal(await time.evaluate((node) => node === document.activeElement), true);
        assert.equal(await prisma.distributionRecord.count({ where: { claimId: rescue.claim.id } }), 0);
        await page.screenshot({ path: screenshots + "/invalid-time-mobile.png", fullPage: true });
        await page.getByRole("button", { name: t("Use current time"), exact: true }).click();
        await people.fill(""); await complete.click();
        assert.equal(await people.getAttribute("aria-invalid"), "true");
        await people.fill("10"); await meals.fill("21"); await complete.click();
        assert.equal(await meals.getAttribute("aria-invalid"), "true");
        await meals.fill("10"); await consent.uncheck(); await complete.click();
        assert.equal(await consent.getAttribute("aria-invalid"), "true");
        await consent.check();
        await time.fill("2000-01-01T12:00"); await complete.click();
        await page.getByText(t("Choose a time on or after the NGO receipt."), { exact: true }).waitFor();
        await page.getByRole("button", { name: t("Use current time"), exact: true }).click();
        await page.route("**/api/distributions", async (route) => {
          if (route.request().method() !== "POST") return route.continue();
          await route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: "The request could not be completed. Please try again." }) });
        }, { times: 1 });
        await complete.click();
        await page.getByText(t("The request could not be completed. Please try again."), { exact: true }).waitFor();
        assert.equal(await people.inputValue(), "10");
      } else {
        const selected = await time.evaluate((node) => Date.parse(node.value));
        assert.ok(Math.abs(selected - Date.now()) < 30_000, "Use server time when the device clock is fast or slow");
      }
      const posted = page.waitForResponse((response) => response.url() === base + "/api/distributions" && response.request().method() === "POST");
      await complete.click();
      const response = await posted;
      assert.equal(response.status(), 201, await response.text());
      await page.getByText(t("Distribution recorded"), { exact: true }).waitFor();
      await page.reload({ waitUntil: "networkidle" });
      await page.getByText(t("Distribution recorded"), { exact: true }).waitFor();
      assert.equal(await prisma.distributionRecord.count({ where: { claimId: rescue.claim.id } }), 1);
      assert.equal(await prisma.impactRecord.count({ where: { claimId: rescue.claim.id } }), 1);
      assert.equal((await prisma.claim.findUnique({ where: { id: rescue.claim.id } })).status, "DISTRIBUTED");
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await page.screenshot({ path: `${screenshots}/completed-${width}-${language}.png`, fullPage: true });
      await context.close();
    }
    assert.deepEqual(runtime, []);
  } finally { await browser.close(); }
});

test("browser photo upload preview removal receipt and distribution persist after reload", { skip: process.env.RUN_PHOTO_BROWSER !== "1" }, async () => {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) });
  const screenshots = ".local-postgres/photo-browser";
  const { mkdir } = await import("node:fs/promises");
  await mkdir(screenshots, { recursive: true });
  async function contextFor(cookie, mobile = false) {
    const context = await englishBrowserContext(browser, { baseURL: base, serviceWorkers: "block", viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 900 } });
    const [name, value] = cookie.split("=");
    await context.addCookies([{ name, value, url: base, httpOnly: true, sameSite: "Lax" }]);
    return context;
  }
  async function visibleImage(page, url) {
    // Uploaded previews are below the form and use lazy image loading.
    await page.locator(`img[src="${url}"]`).first().scrollIntoViewIfNeeded();
    await page.waitForFunction((target) => [...document.images].some((image) => image.getAttribute("src") === target && image.complete && image.naturalWidth > 0), url);
  }
  async function uploadThroughUi(page, name) {
    const uploaded = page.waitForResponse((res) => res.url() === base + "/api/photos" && res.request().method() === "POST");
    await page.locator('input[type="file"]').setInputFiles({ name, mimeType: "image/png", buffer: await imageBytes() });
    const response = await uploaded;
    assert.equal(response.status(), 201, await response.text());
    const { photos } = await response.json();
    await visibleImage(page, photos[0].url);
    return photos[0];
  }
  try {
    const donor = (await login()).cookie;
    const donorContext = await contextFor(donor);
    const page = await donorContext.newPage();
    await page.goto("/donor/donations/new", { waitUntil: "networkidle" });
    await prepareDonationPhotos(page);
    const first = await uploadThroughUi(page, "browser-food.png");
    await page.getByRole("button", { name: uiName("Remove photo 1") }).click();
    await page.waitForFunction((url) => ![...document.images].some((img) => img.getAttribute("src") === url), first.url);
    const food = await uploadThroughUi(page, "browser-food-kept.png");
    await goDonationStep(page, 1);
    await page.locator('[name="title"]').fill("Browser photo donation");
    await page.locator('[name="quantity"]').fill("20");
    await page.locator('[name="allergenInfo"]').fill("None known");
    await page.locator('textarea[name="description"]').fill("Fresh food safely covered for pickup");
    await goDonationStep(page, 3);
    await page.getByRole("button", { name: uiName("পরবর্তী ধাপ") }).click();
    await page.locator('[name="contactPerson"]').waitFor();
    await page.reload({ waitUntil: "networkidle" });
    await prepareDonationPhotos(page);
    await visibleImage(page, food.url);
    const created = await newDonation(donor, { photoUrls: [food.url] });
    assert.equal(created.response.status, 201);
    await page.goto("/donor/donations/" + created.body.donation.id, { waitUntil: "networkidle" });
    await visibleImage(page, food.url);
    await page.screenshot({ path: screenshots + "/donor-photo.png", fullPage: true });

    const rescue = await deliveredRescue();
    const ngoContext = await contextFor(rescue.ngo, true);
    const ngo = await ngoContext.newPage();
    await ngo.goto("/ngo/donations/" + created.body.donation.id, { waitUntil: "networkidle" });
    await visibleImage(ngo, food.url);
    await ngo.goto("/ngo/claims/" + rescue.claim.id + "/confirm-delivery", { waitUntil: "networkidle" });
    const receipt = await uploadThroughUi(ngo, "browser-receipt.png");
    await ngo.reload({ waitUntil: "networkidle" });
    await ngo.getByRole("button", { name: uiName("আগে upload করা ছবি দেখুন") }).click();
    await ngo.getByRole("button", { name: uiName("Attach photo"), exact: true }).click();
    await visibleImage(ngo, receipt.url);
    await ngo.getByRole("button", { name: uiName("Save receipt"), exact: true }).click();
    await ngo.getByText(uiName("Receipt saved"), { exact: true }).waitFor();
    await ngo.reload({ waitUntil: "networkidle" });
    await visibleImage(ngo, receipt.url);
    await ngo.screenshot({ path: screenshots + "/receipt-mobile.png", fullPage: true });

    await ngo.goto("/ngo/claims/" + rescue.claim.id + "/distribution", { waitUntil: "networkidle" });
    await ngo.getByLabel(uiName("People served"), { exact: true }).fill("10");
    await ngo.getByLabel(uiName("Meals distributed"), { exact: true }).fill("10");
    const distribution = await uploadThroughUi(ngo, "browser-distribution.png");
    await ngo.getByLabel(uiName("I confirm consent and privacy safeguards were followed")).check();
    await ngo.getByRole("button", { name: uiName("Complete rescue"), exact: true }).click();
    await ngo.getByText(uiName("Distribution recorded"), { exact: true }).waitFor();
    await ngo.reload({ waitUntil: "networkidle" });
    await visibleImage(ngo, distribution.url);
    assert.equal(await ngo.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false, "Mobile photo gallery must fit the viewport");
    await ngo.screenshot({ path: screenshots + "/distribution-mobile.png", fullPage: true });
    assert.equal((await prisma.photoAsset.findUnique({ where: { id: distribution.id } })).claimId, rescue.claim.id);
  } finally { await browser.close(); }
});

test("unused photo library is scoped by owner, purpose and claim", async () => {
  const donor = (await login()).cookie;
  const photo = await uploadedPhoto(donor, { files: [{ bytes: await imageBytes(), type: "image/png", name: "library-photo.png" }] });
  const mine = await jsonResult("/api/photos?purpose=DONATION", { cookie: donor });
  assert.ok(mine.photos.some((p) => p.id === photo.id));
  assert.ok(mine.photos.every((p) => p.data === undefined && p.ownerId === undefined));
  const other = await jsonResult("/api/photos?purpose=DONATION", { cookie: await secondLogin("DONOR") });
  assert.ok(!other.photos.some((p) => p.id === photo.id));
  assert.ok(!(await jsonResult("/api/photos?purpose=RECEIPT", { cookie: donor })).photos.some((p) => p.id === photo.id));
  const saved = await newDonation(donor, { photoUrls: [photo.url] });
  assert.equal(saved.response.status, 201);
  assert.ok(!(await jsonResult("/api/photos?purpose=DONATION", { cookie: donor })).photos.some((p) => p.id === photo.id));
});

test("photo storage quota rejects additional uploads without partial writes", async () => {
  const cookie = await secondLogin("DONOR");
  const data = await imageBytes("webp");
  await prisma.photoAsset.createMany({ data: Array.from({ length: 200 }, () => ({
    ownerId: "second-DONOR", purpose: "DONATION", originalName: "quota-fixture.webp", data,
    byteSize: data.length, width: 16, height: 12,
  })) });
  const before = await prisma.photoAsset.count({ where: { ownerId: "second-DONOR" } });
  const response = await photoUpload(cookie);
  assert.equal(response.status, 413);
  assert.equal(await prisma.photoAsset.count({ where: { ownerId: "second-DONOR" } }), before);
});

function incidentInput(changes = {}) {
  return { type: "SAFETY_CONCERN", severity: "LOW", description: "Observed damaged food packaging during handover.", preferredContactMethod: "IN_APP", submissionKey: randomUUID(), evidenceUrls: [], ...changes };
}
function reportIncident(r, cookie = r.ngo, input = incidentInput()) {
  return request("/api/incidents", { cookie, method: "POST", body: { claimId: r.claim.id, reportedByUserId: "forged-reporter", input } });
}
async function createdIncident(r, cookie = r.ngo, changes = {}) {
  const response = await reportIncident(r, cookie, incidentInput(changes));
  const body = await response.json();
  assert.equal(response.status, 201, JSON.stringify(body));
  return body.incident;
}
function reviewReport(id, action, cookie, note = "Reviewed the factual report and recorded the operator decision.") {
  return request("/api/incidents", { cookie, method: "PATCH", body: { id, action, note } });
}

test("donor NGO and assigned volunteer can submit truthful, private incident records", async () => {
  const r = await assignedRescue();
  for (const cookie of [r.donor, r.ngo, r.volunteer]) {
    const incident = await createdIncident(r, cookie, { status: "RESOLVED", decision: "RESUME", reportedByUserId: "fake-user" });
    assert.equal(incident.status, "SUBMITTED");
    assert.equal(incident.decision, null);
    assert.deepEqual(incident.reviews, []);
    assert.notEqual(incident.reportedByUserId, "fake-user");
    assert.equal(incident.submissionHash, undefined);
    assert.equal(incident.submissionKey, undefined);
    assert.ok(incident.reporterName);
  }
  for (const cookie of [r.donor, r.ngo, r.volunteer]) {
    const { incidents } = await jsonResult("/api/incidents?claimId=" + r.claim.id, { cookie });
    assert.equal(incidents.length, 3);
    assert.ok(incidents.every((i) => i.claimId === r.claim.id));
  }
  for (const role of ["DONOR", "NGO", "VOLUNTEER"]) {
    const foreign = await secondLogin(role);
    assert.equal((await request("/api/incidents?claimId=" + r.claim.id, { cookie: foreign })).status, 404);
    assert.equal((await reportIncident(r, foreign)).status, 404);
  }
});

test("incident validation and participant permissions reject invalid writes and fake evidence", async () => {
  const r = await assignedRescue();
  for (const changes of [
    { description: "too short" }, { description: "x".repeat(2001) }, { type: "FAKE" }, { severity: "FAKE" },
    { preferredContactMethod: "SMS" }, { submissionKey: "short" }, { evidenceUrls: ["https://external.example/fake.jpg"] },
    { evidenceUrls: ["fake-photo"] },
  ]) assert.equal((await reportIncident(r, r.ngo, incidentInput(changes))).status, 422, JSON.stringify(changes).slice(0, 90));
  assert.equal((await request("/api/incidents", { cookie: r.ngo, method: "POST", raw: "{" })).status, 400);
  assert.equal(await prisma.incidentReport.count({ where: { claimId: r.claim.id } }), 0);
  assert.equal((await prisma.claim.findUnique({ where: { id: r.claim.id } })).status, "ASSIGNED");
  const otherPhoto = await uploadedPhoto(r.donor, { purpose: "INCIDENT", claimId: r.claim.id });
  assert.equal((await reportIncident(r, r.ngo, incidentInput({ evidenceUrls: [otherPhoto.url] }))).status, 403);
  const normalPhoto = await uploadedPhoto(r.donor);
  assert.equal((await reportIncident(r, r.donor, incidentInput({ evidenceUrls: [normalPhoto.url] }))).status, 409);
});

test("incident evidence binds to its report and is visible only to rescue participants", async () => {
  const r = await assignedRescue();
  const photo = await uploadedPhoto(r.volunteer, { purpose: "INCIDENT", claimId: r.claim.id });
  assert.equal((await request(photo.url, { cookie: r.donor })).status, 404);
  const report = await createdIncident(r, r.volunteer, { evidenceUrls: [photo.url] });
  assert.deepEqual(report.evidenceUrls, [photo.url]);
  for (const cookie of [r.donor, r.ngo, r.volunteer]) assert.equal((await request(photo.url, { cookie })).status, 200);
  assert.equal((await request(photo.url, { cookie: await secondLogin("NGO") })).status, 404);
  assert.equal((await request(photo.url, { cookie: r.volunteer, method: "DELETE" })).status, 409);
  assert.equal((await prisma.photoAsset.findUnique({ where: { id: photo.id } })).claimId, r.claim.id);
  const record = await jsonResult("/api/incidents?id=" + report.id, { cookie: r.donor });
  assert.deepEqual(record.incidents[0].evidenceUrls, [photo.url]);
});

test("incident submission is idempotent under racing retries and rejects key reuse", async () => {
  const r = await assignedRescue();
  const input = incidentInput();
  const before = await prisma.notification.count();
  const responses = await Promise.all([1, 2].map(() => reportIncident(r, r.ngo, input)));
  assert.deepEqual(responses.map((res) => res.status).sort(), [200, 201]);
  const bodies = await Promise.all(responses.map((res) => res.json()));
  assert.equal(bodies[0].incident.id, bodies[1].incident.id);
  assert.equal(await prisma.incidentReport.count({ where: { claimId: r.claim.id } }), 1);
  assert.equal(await prisma.notification.count(), before + 3);
  assert.equal((await reportIncident(r, r.ngo, { ...input, description: "Changed description under the same submission key" })).status, 409);
  assert.equal((await reportIncident(r, r.ngo, incidentInput())).status, 409, "A new key cannot create a second open category report");
});

test("a safety incident pauses OTP, route progress and release without freeing the volunteer", async () => {
  const r = await assignedRescue();
  const code = await issue(r, "PICKUP");
  await createdIncident(r, r.donor);
  const claim = await prisma.claim.findUnique({ where: { id: r.claim.id } });
  assert.equal(claim.status, "DISPUTED");
  assert.equal(claim.incidentHoldStatus, "ASSIGNED");
  assert.equal((await prisma.donation.findUnique({ where: { id: r.donation.id } })).status, "DISPUTED");
  assert.equal((await handover(r, r.volunteer, "verify", "PICKUP", code)).status, 409);
  assert.equal((await handover(r, r.donor, "issue", "PICKUP")).status, 409);
  assert.equal((await request("/api/missions", { cookie: r.volunteer, method: "PATCH", body: { claimId: r.claim.id, stage: "en_route_pickup" } })).status, 409);
  assert.equal((await request("/api/claims", { cookie: r.ngo, method: "PATCH", body: { id: r.claim.id, status: "CANCELLED" } })).status, 409);
  const missions = await jsonResult("/api/missions", { cookie: r.volunteer });
  assert.equal(missions.activeMission.claimId, r.claim.id);
  assert.equal(missions.activeMission.incidentPaused, true);
  assert.ok((await prisma.handoverChallenge.findUnique({ where: { claimId_kind: { claimId: r.claim.id, kind: "PICKUP" } } })).expiresAt.getTime() <= Date.now());
  const other = await newDonation(r.donor);
  const pending = (await jsonResult("/api/claims", { cookie: r.ngo, method: "POST", body: { donationId: other.body.donation.id } }, 201)).claim;
  assert.equal((await request("/api/dispatches", { cookie: r.volunteer, method: "POST", body: { claimId: pending.id } })).status, 409);
});

test("an incident blocks distribution and remains across application restart", async () => {
  const r = await deliveredRescue();
  await saveReceipt(r);
  const report = await createdIncident(r, r.ngo);
  assert.equal((await distribute(r, await distributionInput(r))).status, 409);
  await stopServer(); await startServer();
  const saved = await jsonResult("/api/incidents?id=" + report.id, { cookie: r.donor });
  assert.equal(saved.incidents[0].status, "SUBMITTED");
  assert.equal((await distribute(r, await distributionInput(r))).status, 409);
  assert.equal(await prisma.impactRecord.count({ where: { claimId: r.claim.id } }), 0);
});

test("ordinary participants cannot review reports or bypass holds with generic status writes", async () => {
  const r = await assignedRescue();
  const report = await createdIncident(r);
  for (const cookie of [r.donor, r.ngo, r.volunteer]) assert.equal((await reviewReport(report.id, "RESUME", cookie)).status, 403);
  assert.equal((await request("/api/claims", { cookie: r.ngo, method: "PATCH", body: { id: r.claim.id, status: "ASSIGNED" } })).status, 422);
  assert.equal((await request("/api/donations", { cookie: r.donor, method: "PATCH", body: { id: r.donation.id, action: "cancel", reason: "Bypass hold" } })).status, 409);
  assert.equal(await prisma.incidentReview.count({ where: { incidentId: report.id } }), 0);
});

test("admin review records an audit trail and resumes only after every open report is resolved", async () => {
  const r = await assignedRescue();
  const first = await createdIncident(r, r.ngo, { type: "WRONG_QUANTITY" });
  const second = await createdIncident(r, r.donor, { type: "LATE_DELIVERY" });
  const admin = (await login("ADMIN")).cookie;
  assert.equal((await reviewReport(first.id, "CLOSE", admin)).status, 409);
  assert.equal((await reviewReport(first.id, "UNDER_REVIEW", admin, "short")).status, 422);
  assert.equal((await reviewReport(first.id, "UNDER_REVIEW", admin)).status, 200);
  assert.equal((await reviewReport(first.id, "RESUME", admin)).status, 200);
  assert.equal((await prisma.claim.findUnique({ where: { id: r.claim.id } })).status, "DISPUTED");
  assert.equal((await reviewReport(second.id, "RESUME", admin)).status, 200);
  const claim = await prisma.claim.findUnique({ where: { id: r.claim.id } });
  assert.equal(claim.status, "ASSIGNED");
  assert.equal(claim.incidentHoldStatus, null);
  assert.equal((await prisma.donation.findUnique({ where: { id: r.donation.id } })).status, "ASSIGNED");
  assert.equal((await reviewReport(first.id, "CLOSE", admin)).status, 200);
  const report = (await jsonResult("/api/incidents?id=" + first.id, { cookie: r.volunteer })).incidents[0];
  assert.deepEqual(report.reviews.map((rev) => rev.status), ["UNDER_REVIEW", "RESOLVED", "CLOSED"]);
  assert.ok(report.reviews.every((rev) => rev.actorLabel === "Test administrator" && rev.note.length >= 12));
});

test("resuming after a hold invalidates the old OTP and requires a new code", async () => {
  const r = await assignedRescue();
  const oldCode = await issue(r, "PICKUP");
  const report = await createdIncident(r);
  const admin = (await login("ADMIN")).cookie;
  assert.equal((await reviewReport(report.id, "RESUME", admin)).status, 200);
  assert.equal((await handover(r, r.volunteer, "verify", "PICKUP", oldCode)).status, 410);
  await prisma.handoverChallenge.update({ where: { claimId_kind: { claimId: r.claim.id, kind: "PICKUP" } }, data: { issuedAt: new Date(Date.now() - 61_000) } });
  const freshCode = await issue(r, "PICKUP");
  assert.notEqual(freshCode, oldCode);
  assert.equal((await handover(r, r.volunteer, "verify", "PICKUP", freshCode)).status, 200);
});

test("unsafe receipts and expired food cannot be resumed through incident review", async () => {
  const r = await deliveredRescue();
  await saveReceipt(r, { foodCondition: "DAMAGED_POOR", notes: "Food visibly damaged at NGO receipt" });
  const report = await createdIncident(r);
  const admin = (await login("ADMIN")).cookie;
  assert.equal((await reviewReport(report.id, "RESUME", admin)).status, 409);
  assert.equal((await prisma.incidentReport.findUnique({ where: { id: report.id } })).status, "SUBMITTED");
  const expired = await assignedRescue();
  const other = await createdIncident(expired);
  await prisma.donation.update({ where: { id: expired.donation.id }, data: { safePickupDeadline: new Date(Date.now() - 60_000) } });
  assert.equal((await reviewReport(other.id, "RESUME", admin)).status, 409);
  assert.equal((await reviewReport(other.id, "REJECT_FOOD", admin)).status, 200);
  assert.equal((await prisma.claim.findUnique({ where: { id: expired.claim.id } })).status, "CANCELLED");
});

test("rejected food closes the rescue, retains evidence and is never made available again", async () => {
  const r = await assignedRescue();
  const report = await createdIncident(r, r.volunteer);
  const admin = (await login("ADMIN")).cookie;
  assert.equal((await reviewReport(report.id, "REJECT_FOOD", admin)).status, 200);
  const claim = await prisma.claim.findUnique({ where: { id: r.claim.id } });
  assert.equal(claim.status, "CANCELLED");
  assert.equal((await prisma.donation.findUnique({ where: { id: r.donation.id } })).status, "CANCELLED");
  assert.equal((await jsonResult("/api/missions", { cookie: r.volunteer })).activeMission, null);
  assert.equal((await reportIncident(r)).status, 409);
  assert.equal((await reviewReport(report.id, "RESUME", admin)).status, 409);
  assert.equal(await prisma.impactRecord.count({ where: { claimId: r.claim.id } }), 0);
});

test("post-distribution reports preserve historical distribution and impact", async () => {
  const r = await deliveredRescue();
  await saveReceipt(r);
  assert.equal((await distribute(r, await distributionInput(r))).status, 201);
  const report = await createdIncident(r, r.donor);
  assert.equal(report.blocksRescue, false);
  assert.equal((await prisma.claim.findUnique({ where: { id: r.claim.id } })).status, "DISTRIBUTED");
  assert.equal(await prisma.impactRecord.count({ where: { claimId: r.claim.id } }), 1);
  const admin = (await login("ADMIN")).cookie;
  assert.equal((await reviewReport(report.id, "REJECT_FOOD", admin)).status, 200);
  assert.equal((await prisma.donation.findUnique({ where: { id: r.donation.id } })).status, "DISTRIBUTED");
});

test("local operator CLI reviews the exact report and records its actor", async () => {
  const r = await assignedRescue();
  const report = await createdIncident(r, r.donor, { type: "LATE_DELIVERY" });
  await runNode(["node_modules/tsx/dist/cli.mjs", "scripts/review-incident.ts", report.id, "UNDER_REVIEW", "Operator checked the recorded delivery delay."]);
  const saved = await prisma.incidentReport.findUnique({ where: { id: report.id }, include: { reviews: true } });
  assert.equal(saved.status, "UNDER_REVIEW");
  assert.equal(saved.reviews[0].actorLabel, "Local project operator");
  assert.equal(saved.reviews[0].actorUserId, null);
});

test("incident and distribution races never create impact after the rescue is held", async () => {
  const r = await deliveredRescue();
  await saveReceipt(r);
  const input = await distributionInput(r);
  const responses = await Promise.all([reportIncident(r), distribute(r, input)]);
  assert.equal(responses[0].status, 201);
  assert.ok([201, 409].includes(responses[1].status));
  const claim = await prisma.claim.findUnique({ where: { id: r.claim.id } });
  const incident = await prisma.incidentReport.findFirst({ where: { claimId: r.claim.id } });
  if (claim.status === "DISPUTED") {
    assert.equal(incident.blocksRescue, true);
    assert.equal(await prisma.impactRecord.count({ where: { claimId: r.claim.id } }), 0);
  } else {
    assert.equal(claim.status, "DISTRIBUTED");
    assert.equal(incident.blocksRescue, false);
    assert.equal(await prisma.impactRecord.count({ where: { claimId: r.claim.id } }), 1);
  }
});

test("browser incident evidence and hold are shared across donor NGO and volunteer screens", { skip: process.env.RUN_INCIDENT_BROWSER !== "1" }, async () => {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) });
  const { mkdir } = await import("node:fs/promises");
  const screenshots = ".local-postgres/incident-browser";
  await mkdir(screenshots, { recursive: true });
  async function pageFor(cookie, mobile = false) {
    const context = await englishBrowserContext(browser, { baseURL: base, serviceWorkers: "block", viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 900 } });
    const [name, value] = cookie.split("=");
    await context.addCookies([{ name, value, url: base, httpOnly: true, sameSite: "Lax" }]);
    return context.newPage();
  }
  async function submit(page, description, category, evidence = false) {
    await page.getByLabel(uiName("Issue category")).selectOption(category);
    await page.getByRole("textbox", { name: /What happened/ }).fill(description);
    let photo;
    if (evidence) {
      const uploaded = page.waitForResponse((res) => res.url() === base + "/api/photos" && res.request().method() === "POST");
      await page.locator('input[type="file"]').setInputFiles({ name: "incident-evidence.png", mimeType: "image/png", buffer: await imageBytes() });
      const response = await uploaded;
      assert.equal(response.status(), 201, await response.text());
      photo = (await response.json()).photos[0];
    }
    const saved = page.waitForResponse((res) => res.url() === base + "/api/incidents" && res.request().method() === "POST");
    await page.getByRole("button", { name: uiName("Submit incident"), exact: true }).click();
    const response = await saved;
    assert.equal(response.status(), 201, await response.text());
    await page.getByText(uiName("Submitted — awaiting review"), { exact: true }).first().waitFor();
    return { incident: (await response.json()).incident, photo };
  }
  try {
    const r = await assignedRescue();
    const donor = await pageFor(r.donor, true);
    await donor.goto("/donor/donations/" + r.donation.id + "/report-issue?claimId=" + r.claim.id, { waitUntil: "networkidle" });
    const first = await submit(donor, "Donor observed damaged packaging and stopped the handover.", "SAFETY_CONCERN", true);
    await donor.reload({ waitUntil: "networkidle" });
    const image = donor.locator(`img[src="${first.photo.url}"]`).first();
    await image.scrollIntoViewIfNeeded();
    await donor.waitForFunction((url) => [...document.images].some((img) => img.getAttribute("src") === url && img.complete && img.naturalWidth > 0), first.photo.url);
    assert.equal(await donor.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await donor.screenshot({ path: screenshots + "/donor-report-mobile.png", fullPage: true });

    const ngo = await pageFor(r.ngo);
    await ngo.goto("/ngo/claims/" + r.claim.id, { waitUntil: "networkidle" });
    await ngo.getByText(first.incident.description, { exact: true }).waitFor();
    await ngo.getByText(uiName("Incident hold: admin/operator review না হওয়া পর্যন্ত pickup, delivery ও distribution বন্ধ।"), { exact: true }).waitFor();
    await ngo.getByRole("link", { name: uiName("Report an issue / history"), exact: true }).click();
    const second = await submit(ngo, "NGO confirmed the quantity mismatch while reviewing this rescue.", "WRONG_QUANTITY");

    const volunteer = await pageFor(r.volunteer);
    await volunteer.goto("/volunteer/missions/mission-" + r.claim.id, { waitUntil: "networkidle" });
    await volunteer.getByText(first.incident.description, { exact: true }).waitFor();
    assert.equal(await volunteer.getByRole("button", { name: uiName("Confirm pickup"), exact: true }).count(), 0);
    await volunteer.getByRole("link", { name: uiName("Report an issue / history"), exact: true }).click();
    const third = await submit(volunteer, "Volunteer reported a transport delay and secured the food.", "LATE_DELIVERY");

    const admin = (await login("ADMIN")).cookie;
    assert.equal((await reviewReport(first.incident.id, "UNDER_REVIEW", admin)).status, 200);
    assert.equal((await reviewReport(first.incident.id, "RESUME", admin)).status, 200);
    assert.equal((await reviewReport(second.incident.id, "RESUME", admin)).status, 200);
    assert.equal((await prisma.claim.findUnique({ where: { id: r.claim.id } })).status, "DISPUTED");
    assert.equal((await reviewReport(third.incident.id, "REJECT_FOOD", admin)).status, 200);
    await donor.reload({ waitUntil: "networkidle" });
    await donor.getByText(uiName("REJECT_FOOD"), { exact: false }).first().waitFor();
    assert.equal(await donor.locator("textarea").count(), 0);
    assert.equal((await prisma.claim.findUnique({ where: { id: r.claim.id } })).status, "CANCELLED");
    await donor.screenshot({ path: screenshots + "/review-history-mobile.png", fullPage: true });
  } finally { await browser.close(); }
});

async function newFoodRequest(cookie, changes = {}) {
  const profile = await jsonResult("/api/profile", { cookie });
  const input = { ngoProfileId: "untrusted-ngo", title: "Meals for community families", requestType: "ONE_TIME", priority: "MEDIUM",
    purpose: "Community evening meal support", recipientType: "Community families", categories: ["COOKED_MEAL"], dietaryTypes: ["HALAL"],
    supportingDocumentNames: [], allergensOrRestrictions: [], peopleToServe: 20, mealsNeeded: 20, neededWhen: "CUSTOM",
    neededBy: new Date(Date.now() + 3 * 3_600_000).toISOString(), preferredTimeSlot: "Within the requested window", deliveryAddressId: profile.addresses[0].id,
    deliveryLocation: { addressLine: "Ignore this forged address", area: "Forged area", city: "Forged city", instructions: "Use the community entrance" },
    locationType: "COMMUNITY_CENTER", submissionKey: randomUUID(), ...changes };
  const response = await request("/api/requests", { cookie, method: "POST", body: input });
  return { response, body: await response.json(), input };
}
async function publishedRequest(cookie, changes) {
  const created = await newFoodRequest(cookie, changes);
  assert.equal(created.response.status, 201, JSON.stringify(created.body));
  return created.body.request;
}
async function requestRescue(foodRequest, ngo, donationChanges = {}, addressAcknowledged = true) {
  const donor = (await login()).cookie;
  const created = await newDonation(donor, donationChanges);
  assert.equal(created.response.status, 201, JSON.stringify(created.body));
  const { claim } = await jsonResult("/api/claims", { cookie: ngo, method: "POST", body: { donationId: created.body.donation.id, foodRequestId: foodRequest.id, allergenReviewAcknowledged: addressAcknowledged } }, 201);
  const unique = randomUUID();
  const volunteerUser = await seedUser({ id: unique, email: unique + "@example.test", password: fixturePassword, displayName: "Request volunteer", role: "VOLUNTEER", phone: null, normalizedPhone: null });
  const response = await request("/api/auth/login", { method: "POST", body: { email: volunteerUser.email, password: fixturePassword } });
  assert.equal(response.status, 200);
  const volunteer = response.headers.get("set-cookie").split(";")[0];
  await jsonResult("/api/dispatches", { cookie: volunteer, method: "POST", body: { claimId: claim.id } });
  return { donor, ngo, volunteer, claim, donation: created.body.donation, volunteerUser };
}
async function deliverRequestRescue(r) {
  assert.equal((await handover(r, r.volunteer, "verify", "PICKUP", await issue(r, "PICKUP"))).status, 200);
  assert.equal((await handover(r, r.volunteer, "verify", "DELIVERY", await issue(r, "DELIVERY"))).status, 200);
}
async function currentFoodRequest(row, ngo) {
  return (await jsonResult("/api/requests?id=" + row.id, { cookie: ngo })).request;
}

test("food requests persist for the authenticated NGO with a trusted address snapshot", async () => {
  const ngo = (await login("NGO")).cookie;
  const created = await newFoodRequest(ngo);
  assert.equal(created.response.status, 201, JSON.stringify(created.body));
  const row = created.body.request;
  const profile = await jsonResult("/api/profile", { cookie: ngo });
  assert.equal(row.ngoProfileId, profile.ngoProfile.id);
  assert.equal(row.status, "FINDING_MATCH");
  assert.equal(row.mealsFulfilled, 0);
  assert.equal(row.remainingMeals, 20);
  assert.equal(row.deliveryLocation.addressLine, profile.addresses[0].addressLine);
  assert.notEqual(row.deliveryLocation.city, "Forged city");
  assert.equal(row.submissionHash, undefined);
  assert.equal(row.submissionKey, undefined);
  assert.equal((await currentFoodRequest(row, ngo)).id, row.id);
  assert.equal(await prisma.foodRequest.count({ where: { id: row.id } }), 1);
});

test("food request APIs enforce NGO roles and owner isolation", async () => {
  const ngo = (await login("NGO")).cookie, other = await secondLogin("NGO");
  const row = await publishedRequest(ngo);
  for (const role of ["DONOR", "VOLUNTEER"]) {
    const cookie = (await login(role)).cookie;
    for (const method of ["GET", "POST", "PATCH"]) assert.equal((await request("/api/requests", { cookie, method, ...(method !== "GET" ? { body: {} } : {}) })).status, 403);
  }
  assert.equal((await request("/api/requests?id=" + row.id, { cookie: other })).status, 404);
  assert.equal((await request("/api/requests?id=" + row.id + "&matches=true", { cookie: other })).status, 404);
  assert.equal((await request("/api/requests", { cookie: other, method: "PATCH", body: { id: row.id, action: "cancel" } })).status, 404);
  const list = await jsonResult("/api/requests?ngoProfileId=" + row.ngoProfileId, { cookie: other });
  assert.ok(!list.requests.some((item) => item.id === row.id));
});

test("food request validation rejects invalid quantities deadlines enums and foreign addresses", async () => {
  const ngo = (await login("NGO")).cookie;
  for (const changes of [
    { mealsNeeded: 0 }, { peopleToServe: -1 }, { mealsNeeded: 2.5 }, { mealsNeeded: 10, peopleToServe: 20 },
    { neededBy: "not-a-date" }, { neededBy: new Date(Date.now() - 60_000).toISOString() },
    { neededBy: new Date(Date.now() + 91 * 86_400_000).toISOString() }, { categories: [] }, { dietaryTypes: ["FAKE"] },
    { requestType: "FAKE" }, { priority: "HIGH", priorityReason: "" }, { neededWhen: "YESTERDAY" },
    { status: "FULFILLED" }, { supportingDocumentNames: ["pretend.pdf"] },
  ]) assert.equal((await newFoodRequest(ngo, changes)).response.status, 422, JSON.stringify(changes));
  const foreign = await prisma.address.findFirst({ where: { ownerId: "second-NGO" } });
  assert.equal((await newFoodRequest(ngo, { deliveryAddressId: foreign.id })).response.status, 403);
  assert.equal((await request("/api/requests", { cookie: ngo, method: "POST", raw: "{" })).status, 400);
});

test("pending NGOs cannot publish community requests", async () => {
  const cookie = await secondLogin("NGO");
  await prisma.nGOProfile.update({ where: { userId: "second-NGO" }, data: { verificationStatus: "PENDING" } });
  try { assert.equal((await newFoodRequest(cookie)).response.status, 403); }
  finally { await prisma.nGOProfile.update({ where: { userId: "second-NGO" }, data: { verificationStatus: "VERIFIED" } }); }
});

test("food request submission keys prevent duplicate writes and survive deadline expiry", async () => {
  const ngo = (await login("NGO")).cookie;
  const profile = await jsonResult("/api/profile", { cookie: ngo });
  const data = (await newFoodRequest(ngo)).input;
  data.submissionKey = randomUUID(); data.deliveryAddressId = profile.addresses[0].id;
  const before = await prisma.notification.count({ where: { userId: "test-NGO" } });
  const responses = await Promise.all([1, 2].map(() => request("/api/requests", { cookie: ngo, method: "POST", body: data })));
  assert.deepEqual(responses.map((res) => res.status).sort(), [200, 201]);
  const results = await Promise.all(responses.map((res) => res.json()));
  assert.equal(results[0].request.id, results[1].request.id);
  assert.equal(await prisma.notification.count({ where: { userId: "test-NGO" } }), before + 1);
  assert.equal((await request("/api/requests", { cookie: ngo, method: "POST", body: { ...data, title: "Different title" } })).status, 409);
  await prisma.foodRequest.update({ where: { id: results[0].request.id }, data: { neededBy: new Date(Date.now() - 60_000) } });
  assert.equal((await currentFoodRequest(results[0].request, ngo)).status, "EXPIRED");
  const retry = await jsonResult("/api/requests", { cookie: ngo, method: "POST", body: data });
  assert.equal(retry.request.status, "EXPIRED");
});

test("matching uses actual food declarations city and time while protecting exact pickup data", async () => {
  const ngo = (await login("NGO")).cookie, donor = (await login()).cookie;
  const row = await publishedRequest(ngo, { dietaryTypes: ["HALAL", "VEGAN"], allergensOrRestrictions: ["milk"] });
  const good = await newDonation(donor, { dietaryTypes: ["HALAL", "VEGAN"] });
  const dietConflict = await newDonation(donor);
  const allergen = await newDonation(donor, { dietaryTypes: ["HALAL", "VEGAN"], allergens: ["Milk powder"] });
  const category = await newDonation(donor, { category: "BAKERY", dietaryTypes: ["HALAL", "VEGAN"] });
  const address = await prisma.address.create({ data: { ownerId: "test-DONOR", label: "Other city", addressLine: "Different city pickup", city: "Chattogram", area: "Central" } });
  const wrongCity = await newDonation(donor, { dietaryTypes: ["HALAL", "VEGAN"], pickup: { ...good.payload.pickup, addressId: address.id } });
  const later = await newDonation(donor, { dietaryTypes: ["HALAL", "VEGAN"], safePickupDeadline: new Date(Date.now() + 8 * 3_600_000).toISOString(), pickup: { ...good.payload.pickup, windowStart: new Date(Date.now() + 4 * 3_600_000).toISOString(), windowEnd: new Date(Date.now() + 5 * 3_600_000).toISOString() } });
  for (const item of [good, dietConflict, allergen, category, wrongCity, later]) assert.equal(item.response.status, 201, JSON.stringify(item.body));
  const result = await jsonResult("/api/requests?id=" + row.id + "&matches=true", { cookie: ngo });
  const ids = result.matches.map((item) => item.donation.id);
  assert.ok(ids.includes(good.body.donation.id));
  for (const bad of [dietConflict, allergen, category, wrongCity, later]) assert.ok(!ids.includes(bad.body.donation.id));
  const match = result.matches.find((item) => item.donation.id === good.body.donation.id);
  assert.equal(match.donation.pickup.sensitiveDetailsVisible, false);
  assert.equal(match.donation.pickup.exactAddress, undefined);
  assert.equal(match.allergenReviewRequired, true);
});

test("linking a claim reserves meals without falsely fulfilling the food request", async () => {
  const ngo = (await login("NGO")).cookie;
  const row = await publishedRequest(ngo);
  const r = await requestRescue(row, ngo);
  assert.equal(r.claim.foodRequestId, row.id);
  assert.equal(r.claim.requestMealsAllocated, 20);
  const saved = await currentFoodRequest(row, ngo);
  assert.equal(saved.status, "MATCHED");
  assert.equal(saved.mealsReserved, 20);
  assert.equal(saved.mealsFulfilled, 0);
  assert.equal(saved.remainingMeals, 0);
  assert.equal(saved.linkedClaims[0].id, r.claim.id);
});

test("server matching blocks incompatible forged and unacknowledged request reservations", async () => {
  const ngo = (await login("NGO")).cookie, donor = (await login()).cookie;
  const row = await publishedRequest(ngo, { dietaryTypes: ["VEGAN"], allergensOrRestrictions: ["nuts"] });
  const bad = await newDonation(donor);
  assert.equal((await request("/api/claims", { cookie: ngo, method: "POST", body: { donationId: bad.body.donation.id, foodRequestId: row.id, allergenReviewAcknowledged: true } })).status, 422);
  const good = await newDonation(donor, { dietaryTypes: ["VEGAN", "HALAL"] });
  assert.equal((await request("/api/claims", { cookie: ngo, method: "POST", body: { donationId: good.body.donation.id, foodRequestId: row.id } })).status, 422);
  assert.equal((await request("/api/claims", { cookie: await secondLogin("NGO"), method: "POST", body: { donationId: good.body.donation.id, foodRequestId: row.id, allergenReviewAcknowledged: true } })).status, 404);
  assert.equal((await prisma.donation.findUnique({ where: { id: good.body.donation.id } })).status, "AVAILABLE");
});

test("two donation reservations cannot over-allocate one food request", async () => {
  const ngo = (await login("NGO")).cookie, donor = (await login()).cookie;
  const row = await publishedRequest(ngo, { peopleToServe: 10, mealsNeeded: 10 });
  const donations = await Promise.all([1, 2].map(() => newDonation(donor)));
  const responses = await Promise.all(donations.map((item) => request("/api/claims", { cookie: ngo, method: "POST", body: { donationId: item.body.donation.id, foodRequestId: row.id } })));
  assert.deepEqual(responses.map((res) => res.status).sort(), [201, 409]);
  const saved = await currentFoodRequest(row, ngo);
  assert.equal(saved.mealsReserved, 10);
  assert.equal(saved.mealsFulfilled, 0);
  assert.equal(await prisma.claim.count({ where: { foodRequestId: row.id } }), 1);
});

test("linked requests cannot be cancelled or edited until their active claim is released", async () => {
  const ngo = (await login("NGO")).cookie;
  const row = await publishedRequest(ngo);
  const r = await requestRescue(row, ngo);
  for (const action of ["cancel", "update"]) assert.equal((await request("/api/requests", { cookie: ngo, method: "PATCH", body: { id: row.id, action, input: { title: "Changed title" } } })).status, 409);
  await jsonResult("/api/claims", { cookie: ngo, method: "PATCH", body: { id: r.claim.id, status: "CANCELLED" } });
  const open = await currentFoodRequest(row, ngo);
  assert.equal(open.status, "FINDING_MATCH");
  assert.equal(open.remainingMeals, 20);
  const updated = await jsonResult("/api/requests", { cookie: ngo, method: "PATCH", body: { id: row.id, action: "update", input: { title: "Updated community need" } } });
  assert.equal(updated.request.title, "Updated community need");
  assert.equal((await request("/api/requests", { cookie: ngo, method: "PATCH", body: { id: row.id, action: "update", input: { status: "FULFILLED" } } })).status, 422);
  assert.equal((await jsonResult("/api/requests", { cookie: ngo, method: "PATCH", body: { id: row.id, action: "cancel" } })).request.status, "CANCELLED");
  assert.equal((await prisma.claim.findUnique({ where: { id: r.claim.id } })).status, "CANCELLED");
});

test("donor cancellation and incident rejection restore request capacity", async () => {
  const ngo = (await login("NGO")).cookie;
  const row = await publishedRequest(ngo);
  const r = await requestRescue(row, ngo);
  await jsonResult("/api/donations", { cookie: r.donor, method: "PATCH", body: { id: r.donation.id, action: "cancel", reason: "Donor cannot supply this batch" } });
  assert.equal((await currentFoodRequest(row, ngo)).remainingMeals, 20);
  const second = await requestRescue(row, ngo);
  const report = await createdIncident(second);
  assert.equal((await currentFoodRequest(row, ngo)).mealsReserved, 20, "Incident holds keep the allocation until rejected");
  assert.equal((await reviewReport(report.id, "REJECT_FOOD", (await login("ADMIN")).cookie)).status, 200);
  const saved = await currentFoodRequest(row, ngo);
  assert.equal(saved.status, "FINDING_MATCH");
  assert.equal(saved.mealsReserved, 0);
});

test("partial and excess batch distributions fulfill only the requested meal target", async () => {
  const ngo = (await login("NGO")).cookie;
  const row = await publishedRequest(ngo, { peopleToServe: 20, mealsNeeded: 30 });
  const first = await requestRescue(row, ngo);
  await deliverRequestRescue(first); await saveReceipt(first);
  assert.equal((await distribute(first, await distributionInput(first, { mealsDistributed: 20 }))).status, 201);
  const partial = await currentFoodRequest(row, ngo);
  assert.equal(partial.status, "FINDING_MATCH"); assert.equal(partial.mealsFulfilled, 20); assert.equal(partial.remainingMeals, 10);
  const second = await requestRescue(row, ngo);
  assert.equal(second.claim.requestMealsAllocated, 10, "The full donation is claimed but only the remaining target is allocated");
  await deliverRequestRescue(second); await saveReceipt(second);
  assert.equal((await distribute(second, await distributionInput(second, { mealsDistributed: 20 }))).status, 201);
  const full = await currentFoodRequest(row, ngo);
  assert.equal(full.status, "FULFILLED"); assert.equal(full.mealsFulfilled, 30); assert.equal(full.remainingMeals, 0);
  const impacts = await prisma.impactRecord.findMany({ where: { claimId: { in: [first.claim.id, second.claim.id] } } });
  assert.equal(impacts.reduce((sum, item) => sum + item.mealsRescued, 0), 40, "Impact retains actual distributed meals");
});

test("short delivery releases unfulfilled demand and partial history survives cancellation", async () => {
  const ngo = (await login("NGO")).cookie;
  const row = await publishedRequest(ngo);
  const r = await requestRescue(row, ngo);
  await deliverRequestRescue(r); await saveReceipt(r, { actualQuantity: 5, quantityMismatchConfirmed: true });
  assert.equal((await distribute(r, await distributionInput(r, { mealsDistributed: 5, beneficiariesServed: 5 }))).status, 201);
  const saved = await currentFoodRequest(row, ngo);
  assert.equal(saved.mealsFulfilled, 5); assert.equal(saved.remainingMeals, 15); assert.equal(saved.status, "FINDING_MATCH");
  assert.equal((await request("/api/requests", { cookie: ngo, method: "PATCH", body: { id: row.id, action: "update", input: { mealsNeeded: 5 } } })).status, 409);
  await jsonResult("/api/requests", { cookie: ngo, method: "PATCH", body: { id: row.id, action: "cancel" } });
  const cancelled = await currentFoodRequest(row, ngo);
  assert.equal(cancelled.status, "CANCELLED"); assert.equal(cancelled.mealsFulfilled, 5);
  assert.equal(await prisma.distributionRecord.count({ where: { claimId: r.claim.id } }), 1);
});

test("request fulfillment is counted once under racing distribution and survives restart", async () => {
  const ngo = (await login("NGO")).cookie;
  const row = await publishedRequest(ngo);
  const r = await requestRescue(row, ngo);
  await deliverRequestRescue(r); await saveReceipt(r);
  const input = await distributionInput(r, { mealsDistributed: 20 });
  const responses = await Promise.all([1, 2].map(() => distribute(r, input)));
  assert.deepEqual(responses.map((res) => res.status).sort(), [201, 409]);
  await stopServer(); await startServer();
  const saved = await currentFoodRequest(row, ngo);
  assert.equal(saved.status, "FULFILLED"); assert.equal(saved.mealsFulfilled, 20);
  assert.equal((await request("/api/requests", { cookie: ngo, method: "PATCH", body: { id: row.id, action: "cancel" } })).status, 409);
});

test("request delivery uses its owned address snapshot through mission and distribution", async () => {
  const ngo = (await login("NGO")).cookie;
  const address = await prisma.address.create({ data: { ownerId: "test-NGO", label: "Request site", city: "Dhaka", area: "Badda", addressLine: "Original request destination" } });
  const row = await publishedRequest(ngo, { deliveryAddressId: address.id });
  const r = await requestRescue(row, ngo);
  const details = await jsonResult("/api/claims?id=" + r.claim.id, { cookie: ngo });
  assert.equal(details.details.deliveryAddress.addressLine, "Original request destination");
  await prisma.address.update({ where: { id: address.id }, data: { addressLine: "Later edited address" } });
  const mission = await jsonResult("/api/missions?claimId=" + r.claim.id, { cookie: r.volunteer });
  assert.equal(mission.mission.ngoAddress, "Original request destination");
  await deliverRequestRescue(r); await saveReceipt(r);
  assert.equal((await distribute(r, await distributionInput(r, { mealsDistributed: 20 }))).status, 422);
  assert.equal((await distribute(r, await distributionInput(r, { mealsDistributed: 20, addressId: address.id }))).status, 201);
  assert.equal((await request("/api/profile", { cookie: ngo, method: "POST", body: { id: address.id, action: "removeAddress" } })).status, 409);
});

test("expired requests stop new matching while existing rescues may finish", async () => {
  const ngo = (await login("NGO")).cookie, donor = (await login()).cookie;
  const row = await publishedRequest(ngo);
  await prisma.foodRequest.update({ where: { id: row.id }, data: { neededBy: new Date(Date.now() - 60_000) } });
  assert.equal((await currentFoodRequest(row, ngo)).status, "EXPIRED");
  assert.deepEqual((await jsonResult("/api/requests?id=" + row.id + "&matches=true", { cookie: ngo })).matches, []);
  const donation = await newDonation(donor);
  assert.equal((await request("/api/claims", { cookie: ngo, method: "POST", body: { donationId: donation.body.donation.id, foodRequestId: row.id } })).status, 409);
  const active = await publishedRequest(ngo);
  const r = await requestRescue(active, ngo);
  await prisma.foodRequest.update({ where: { id: active.id }, data: { neededBy: new Date(Date.now() - 60_000) } });
  assert.equal((await currentFoodRequest(active, ngo)).status, "MATCHED");
  await deliverRequestRescue(r); await saveReceipt(r);
  assert.equal((await distribute(r, await distributionInput(r, { mealsDistributed: 20 }))).status, 201);
  assert.equal((await currentFoodRequest(active, ngo)).status, "FULFILLED");
});

test("browser food request proceeds from NGO publication through rescue to actual fulfillment", { skip: process.env.RUN_REQUEST_BROWSER !== "1" }, async () => {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) });
  const { mkdir } = await import("node:fs/promises");
  const screenshots = ".local-postgres/request-browser";
  await mkdir(screenshots, { recursive: true });
  async function pageFor(cookie, mobile = false) {
    const context = await englishBrowserContext(browser, { baseURL: base, serviceWorkers: "block", viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 900 } });
    const [name, value] = cookie.split("=");
    await context.addCookies([{ name, value, url: base, httpOnly: true, sameSite: "Lax" }]);
    return context.newPage();
  }
  try {
    const ngoCookie = (await login("NGO")).cookie, donorCookie = (await login()).cookie;
    const ngo = await pageFor(ngoCookie, true);
    await ngo.goto("/ngo/requests/new", { waitUntil: "networkidle" });
    await ngo.locator('input[name="title"]').fill("Browser community meal request");
    await ngo.locator('input[name="purpose"]').fill("Evening meals for community families");
    await ngo.locator('input[name="recipientType"]').fill("Community families");
    await ngo.getByRole("button", { name: uiName("Continue"), exact: true }).click();
    await ngo.getByText(uiName("Preferred food categories"), { exact: true }).waitFor();
    await ngo.getByRole("button", { name: uiName("Continue"), exact: true }).click();
    await ngo.getByRole("heading", { name: uiName("Quantity & Time"), exact: true }).waitFor();
    await ngo.locator('input[name="peopleToServe"]').fill("20");
    await ngo.locator('input[name="mealsNeeded"]').fill("20");
    await ngo.getByRole("button", { name: uiName("Continue"), exact: true }).click();
    assert.ok(await ngo.locator('input[name="addressLine"]').inputValue());
    await ngo.getByRole("button", { name: uiName("Continue"), exact: true }).click();
    await ngo.getByRole("button", { name: uiName("Submit request"), exact: true }).waitFor({ timeout: 5000 }).catch(async () => {
      await ngo.screenshot({ path: screenshots + "/request-wizard-failure.png", fullPage: true });
      throw new Error("Wizard did not reach review: " + await ngo.locator("body").innerText());
    });
    assert.equal(await prisma.foodRequest.count({ where: { title: "Browser community meal request" } }), 0, "Reaching review must not publish the request");
    await ngo.route("**/api/requests", async (route) => {
      if (route.request().method() !== "POST") return route.continue();
      await route.fulfill({ status: 422, contentType: "application/json", body: JSON.stringify({ error: "Choose a future deadline within 90 days.", fieldErrors: { neededBy: "Choose a valid future requested time." } }) });
    }, { times: 1 });
    await ngo.getByRole("button", { name: uiName("Submit request"), exact: true }).click();
    await ngo.locator('input[name="neededBy"][aria-invalid="true"]').waitFor();
    assert.equal(await ngo.locator('input[name="mealsNeeded"]').inputValue(), "20");
    await ngo.getByRole("button", { name: uiName("Continue"), exact: true }).click();
    await ngo.getByRole("button", { name: uiName("Continue"), exact: true }).click();
    await ngo.getByRole("button", { name: uiName("Submit request"), exact: true }).waitFor();
    assert.equal(await prisma.foodRequest.count({ where: { title: "Browser community meal request" } }), 0);
    await ngo.evaluate(() => {
      const removeItem = Storage.prototype.removeItem;
      Storage.prototype.removeItem = function (key) {
        if (key.startsWith("sharebite.ngo.food-request-draft")) throw new DOMException("Storage blocked", "SecurityError");
        return removeItem.call(this, key);
      };
    });
    const published = ngo.waitForResponse((res) => res.url() === base + "/api/requests" && res.request().method() === "POST");
    await ngo.getByRole("button", { name: uiName("Submit request"), exact: true }).click();
    const publishedResponse = await published;
    assert.equal(publishedResponse.status(), 201, await publishedResponse.text());
    const foodRequest = (await publishedResponse.json()).request;
    await ngo.getByRole("link", { name: uiName("Find suitable donations"), exact: true }).click();
    await ngo.waitForURL(base + "/ngo/requests/" + foodRequest.id);
    await ngo.getByText(uiName("Meals fulfilled"), { exact: true }).waitFor();
    await ngo.reload({ waitUntil: "networkidle" });
    await ngo.getByText(uiName("Meals fulfilled"), { exact: true }).waitFor();
    assert.equal((await currentFoodRequest(foodRequest, ngoCookie)).mealsFulfilled, 0);
    await ngo.screenshot({ path: screenshots + "/request-created-mobile.png", fullPage: true });

    const created = await newDonation(donorCookie);
    assert.equal(created.response.status, 201);
    await ngo.getByRole("button", { name: uiName("Refresh matches"), exact: true }).click();
    const claimed = ngo.waitForResponse((res) => res.url() === base + "/api/claims" && res.request().method() === "POST");
    await ngo.getByRole("button", { name: uiName("Reserve for this request"), exact: true }).click();
    const claimResponse = await claimed;
    assert.equal(claimResponse.status(), 201, await claimResponse.text());
    const claim = (await claimResponse.json()).claim;
    await ngo.getByRole("link", { name: uiName("View linked food request"), exact: true }).waitFor();

    const unique = randomUUID();
    await seedUser({ id: unique, email: unique + "@example.test", password: fixturePassword, displayName: "Browser request volunteer", role: "VOLUNTEER", phone: null, normalizedPhone: null });
    const loggedIn = await request("/api/auth/login", { method: "POST", body: { email: unique + "@example.test", password: fixturePassword } });
    assert.equal(loggedIn.status, 200);
    const volunteerCookie = loggedIn.headers.get("set-cookie").split(";")[0];
    const volunteer = await pageFor(volunteerCookie);
    await volunteer.goto("/volunteer/dispatches", { waitUntil: "networkidle" });
    await volunteer.getByTestId("rider-incoming-offer").getByRole("button", { name: uiName("Take this delivery"), exact: true }).click();
    await volunteer.getByRole("textbox", { name: /Six-digit handover code/ }).waitFor();

    const donor = await pageFor(donorCookie);
    await donor.goto("/donor/donations/" + created.body.donation.id, { waitUntil: "networkidle" });
    const pickupIssued = donor.waitForResponse((res) => res.url() === base + "/api/handovers" && res.request().method() === "POST");
    await donor.getByRole("button", { name: uiName("Generate six-digit code"), exact: true }).click();
    const pickupResponse = await pickupIssued;
    assert.equal(pickupResponse.status(), 200);
    const pickupCode = (await pickupResponse.json()).code;
    await volunteer.getByRole("textbox", { name: /Six-digit handover code/ }).fill(pickupCode);
    await volunteer.getByRole("button", { name: uiName("Confirm pickup"), exact: true }).click();
    await volunteer.getByText(uiName("Pickup verified. Food is now in transit."), { exact: true }).waitFor();

    await ngo.reload({ waitUntil: "networkidle" });
    const deliveryIssued = ngo.waitForResponse((res) => res.url() === base + "/api/handovers" && res.request().method() === "POST");
    await ngo.getByRole("button", { name: uiName("Generate six-digit code"), exact: true }).click();
    const deliveryResponse = await deliveryIssued;
    assert.equal(deliveryResponse.status(), 200);
    const deliveryCode = (await deliveryResponse.json()).code;
    await volunteer.getByRole("textbox", { name: /Six-digit handover code/ }).fill(deliveryCode);
    await volunteer.getByRole("button", { name: uiName("Confirm delivery"), exact: true }).click();
    await volunteer.getByText(uiName("Delivery verified and saved."), { exact: true }).waitFor();

    await ngo.reload({ waitUntil: "networkidle" });
    await ngo.getByRole("link", { name: uiName("Record delivery receipt"), exact: true }).click();
    await ngo.getByRole("button", { name: uiName("Save receipt"), exact: true }).click();
    await ngo.getByRole("link", { name: uiName("Record distribution"), exact: true }).click();
    await ngo.getByLabel(uiName("People served"), { exact: true }).fill("20");
    await ngo.getByLabel(uiName("Meals distributed"), { exact: true }).fill("20");
    await ngo.getByLabel(uiName("I confirm consent and privacy safeguards were followed")).check();
    await ngo.getByRole("button", { name: uiName("Complete rescue"), exact: true }).click();
    await ngo.getByText(uiName("Distribution recorded"), { exact: true }).waitFor();

    await ngo.goto("/ngo/requests/" + foodRequest.id, { waitUntil: "networkidle" });
    await ngo.getByText(uiName("20 / 20"), { exact: true }).waitFor();
    await ngo.reload({ waitUntil: "networkidle" });
    await ngo.getByText(uiName("20 / 20"), { exact: true }).waitFor();
    assert.equal(await ngo.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, "Request detail must fit mobile viewport");
    await ngo.screenshot({ path: screenshots + "/request-fulfilled-mobile.png", fullPage: true });
    const saved = await currentFoodRequest(foodRequest, ngoCookie);
    assert.equal(saved.status, "FULFILLED");
    assert.equal(saved.mealsFulfilled, 20);
    assert.equal(saved.linkedClaims[0].id, claim.id);
  } finally { await browser.close(); }
});

test("request requirements retain handover history after a delivered batch is rejected", async () => {
  const ngo = (await login("NGO")).cookie;
  const row = await publishedRequest(ngo);
  const r = await requestRescue(row, ngo);
  await deliverRequestRescue(r);
  const report = await createdIncident(r);
  assert.equal((await reviewReport(report.id, "REJECT_FOOD", (await login("ADMIN")).cookie)).status, 200);
  const current = await currentFoodRequest(row, ngo);
  assert.equal(current.status, "FINDING_MATCH");
  assert.equal(current.mealsReserved, 0);
  assert.equal((await request("/api/requests", { cookie: ngo, method: "PATCH", body: { id: row.id, action: "update", input: { title: "Rewrite history" } } })).status, 409);
  assert.equal((await currentFoodRequest(row, ngo)).title, row.title);
});











async function mapAddress(cookie, label, point) {
  const profile = await jsonResult("/api/profile", { cookie, method: "POST", body: { action: "addAddress", input: {
    label, division: "Dhaka", district: "Dhaka", city: "Dhaka", area: "Badda", addressLine: label + " handover point", coordinates: point,
  } } });
  return profile.addresses.find((address) => address.label === label);
}
async function saveMapPin(cookie, id, point) {
  return jsonResult("/api/profile", { cookie, method: "POST", body: { action: "setCoordinates", id, input: { coordinates: point } } });
}
async function mapDonation(cookie, address, changes = {}) {
  return newDonation(cookie, { title: "Mapped rescue " + randomUUID(), pickup: {
    addressId: address.id, approximateArea: "Badda", contact: { name: "Map donor", phone: "01712345670" },
    windowStart: new Date(Date.now() + 60_000).toISOString(), windowEnd: new Date(Date.now() + 1_800_000).toISOString(),
    coordinates: { latitude: 1, longitude: 2 }, distanceKm: 999, ...changes.pickup,
  }, ...Object.fromEntries(Object.entries(changes).filter(([key]) => key !== "pickup")) });
}

test("map pins validate coordinate pairs and reject foreign ownership", async () => {
  const donor = (await login()).cookie;
  const address = await mapAddress(donor, "Map validation " + randomUUID(), null);
  for (const point of [{ latitude: 91, longitude: 90 }, { latitude: 23, longitude: -181 }, { latitude: 23 }, { latitude: "23", longitude: 90 }, [], "23,90", { latitude: null, longitude: 90 }]) {
    assert.equal((await request("/api/profile", { cookie: donor, method: "POST", body: { action: "setCoordinates", id: address.id, input: { coordinates: point } } })).status, 422);
  }
  assert.equal((await request("/api/profile", { cookie: donor, method: "POST", body: { action: "setCoordinates", id: address.id, input: {} } })).status, 422);
  const foreign = await prisma.address.findFirst({ where: { ownerId: "second-DONOR" } });
  assert.equal((await request("/api/profile", { cookie: donor, method: "POST", body: { action: "setCoordinates", id: foreign.id, input: { coordinates: { latitude: 23, longitude: 90 } } } })).status, 404);
  assert.equal((await request("/api/profile", { method: "POST", body: { action: "setCoordinates", id: address.id, input: { coordinates: null } } })).status, 401);
});

test("map pins preserve zero and negative values and can be cleared", async () => {
  const donor = (await login()).cookie;
  const point = { latitude: 0, longitude: -73.125 };
  const address = await mapAddress(donor, "Map zero " + randomUUID(), point);
  assert.deepEqual(address.coordinates, point);
  const { coordinates: ignored, ...textAddress } = address;
  void ignored;
  const updated = await jsonResult("/api/profile", { cookie: donor, method: "POST", body: { action: "updateAddress", id: address.id, input: textAddress } });
  assert.deepEqual(updated.addresses.find((a) => a.id === address.id).coordinates, point);
  const zero = await saveMapPin(donor, address.id, { latitude: 0, longitude: 0 });
  assert.deepEqual(zero.addresses.find((a) => a.id === address.id).coordinates, { latitude: 0, longitude: 0 });
  const cleared = await saveMapPin(donor, address.id, null);
  assert.equal(cleared.addresses.find((a) => a.id === address.id).coordinates, undefined);
});

test("donation map exposes coarse pins before claim and immutable exact pins to owners", async () => {
  const donor = (await login()).cookie, ngo = (await login("NGO")).cookie;
  const point = { latitude: 23.784321, longitude: 90.425678 };
  const address = await mapAddress(donor, "Map privacy " + randomUUID(), point);
  const created = await mapDonation(donor, address);
  assert.equal(created.response.status, 201, JSON.stringify(created.body));
  const donation = created.body.donation;
  assert.deepEqual(donation.pickup.exactAddress.coordinates, point);
  assert.deepEqual(donation.pickup.approximateCoordinates, { latitude: 23.78, longitude: 90.43 });
  const publicView = (await jsonResult("/api/donations?id=" + donation.id, { cookie: ngo })).donation;
  assert.equal(publicView.pickup.exactAddress, undefined);
  assert.equal(publicView.pickup.contact, undefined);
  assert.equal(publicView.pickup.distanceKm, undefined, "Never trust a distance supplied by the donor");
  assert.deepEqual(publicView.pickup.approximateCoordinates, { latitude: 23.78, longitude: 90.43 });
  assert.equal(JSON.stringify(publicView).includes(String(point.latitude)), false);
  assert.equal(JSON.stringify(publicView).includes(String(point.longitude)), false);
  await saveMapPin(donor, address.id, { latitude: 24.1, longitude: 91.1 });
  const after = (await jsonResult("/api/donations?id=" + donation.id, { cookie: donor })).donation;
  assert.deepEqual(after.pickup.exactAddress.coordinates, point);
  assert.equal((await request("/api/profile", { cookie: donor, method: "POST", body: { action: "updateAddress", id: address.id, input: { ...address, coordinates: null } } })).status, 409);
});

test("unknown donation pins and legacy distances are never fabricated", async () => {
  const donor = (await login()).cookie, ngo = (await login("NGO")).cookie;
  const address = await mapAddress(donor, "Map unknown " + randomUUID(), null);
  const created = await mapDonation(donor, address);
  assert.equal(created.response.status, 201);
  const id = created.body.donation.id;
  await prisma.donation.update({ where: { id }, data: { distanceKm: 3.2 } });
  await saveMapPin(donor, address.id, { latitude: 23.8, longitude: 90.4 });
  for (const cookie of [donor, ngo]) {
    const donation = (await jsonResult("/api/donations?id=" + id, { cookie })).donation;
    assert.equal(donation.pickup.approximateCoordinates, undefined);
    assert.equal(donation.pickup.exactAddress?.coordinates, undefined);
    assert.equal(donation.pickup.distanceKm, undefined);
  }
});

test("claimed rescue freezes NGO delivery pin and exposes exact route only to assigned partners", async () => {
  const donor = (await login()).cookie, ngo = (await login("NGO")).cookie;
  const pickup = { latitude: 23.781234, longitude: 90.421234 }, dropoff = { latitude: 23.792345, longitude: 90.432345 };
  const from = await mapAddress(donor, "Map route pickup " + randomUUID(), pickup);
  const to = await mapAddress(ngo, "Map route dropoff " + randomUUID(), dropoff);
  await jsonResult("/api/profile", { cookie: ngo, method: "POST", body: { action: "setPrimaryAddress", id: to.id } });
  const food = await mapDonation(donor, from);
  assert.equal(food.response.status, 201);
  const { claim } = await jsonResult("/api/claims", { cookie: ngo, method: "POST", body: { donationId: food.body.donation.id } }, 201);
  await saveMapPin(ngo, to.id, { latitude: 24.5, longitude: 91.5 });
  const details = (await jsonResult("/api/claims?id=" + claim.id, { cookie: ngo })).details;
  assert.deepEqual(details.deliveryAddress.coordinates, dropoff);
  assert.deepEqual(details.donation.pickup.exactAddress.coordinates, pickup);
  const unique = randomUUID();
  const volunteerUser = await seedUser({ id: unique, email: unique + "@example.test", password: fixturePassword, displayName: "Map volunteer", role: "VOLUNTEER", phone: null, normalizedPhone: null });
  const loggedIn = await request("/api/auth/login", { method: "POST", body: { email: volunteerUser.email, password: fixturePassword } });
  const volunteer = loggedIn.headers.get("set-cookie").split(";")[0];
  assert.equal((await request("/api/missions?claimId=" + claim.id, { cookie: volunteer })).status, 404);
  const dispatch = await jsonResult("/api/dispatches", { cookie: volunteer });
  assert.equal(dispatch.dispatches.find((d) => d.id === claim.id).distanceKm, 0, "No private exact endpoint is inferred before assignment");
  await jsonResult("/api/dispatches", { cookie: volunteer, method: "POST", body: { claimId: claim.id } });
  const mission = (await jsonResult("/api/missions?claimId=" + claim.id, { cookie: volunteer })).mission;
  assert.deepEqual(mission.pickupCoordinates, pickup);
  assert.deepEqual(mission.dropoffCoordinates, dropoff);
  assert.ok(mission.distanceKm >= 1.5 && mission.distanceKm <= 1.8, String(mission.distanceKm));
  const { cookie: other } = await login("VOLUNTEER");
  assert.equal((await request("/api/missions?claimId=" + claim.id, { cookie: other })).status, 404);
});

test("food request delivery pin remains the published snapshot through claim and mission", async () => {
  const ngo = (await login("NGO")).cookie;
  const point = { latitude: 23.712345, longitude: 90.412345 };
  const to = await mapAddress(ngo, "Map request destination " + randomUUID(), point);
  const foodRequest = await publishedRequest(ngo, { deliveryAddressId: to.id, deliveryLocation: { coordinates: { latitude: 1, longitude: 2 } } });
  assert.deepEqual(foodRequest.deliveryLocation.coordinates, point);
  await saveMapPin(ngo, to.id, { latitude: 24.6, longitude: 91.6 });
  const r = await requestRescue(foodRequest, ngo);
  const details = (await jsonResult("/api/claims?id=" + r.claim.id, { cookie: ngo })).details;
  assert.deepEqual(details.deliveryAddress.coordinates, point);
  const mission = (await jsonResult("/api/missions?claimId=" + r.claim.id, { cookie: r.volunteer })).mission;
  assert.deepEqual(mission.dropoffCoordinates, point);
});

test("browser map pins nearby filters privacy navigation and failure states persist", { skip: process.env.RUN_MAP_BROWSER !== "1" }, async () => {
  const { chromium } = await import("playwright");
  const { mkdir } = await import("node:fs/promises");
  const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) });
  const screenshots = ".local-postgres/map-browser";
  await mkdir(screenshots, { recursive: true });
  let loadedTiles = 0;
  async function pageFor(cookie, mobile = false, gps = false) {
    const context = await englishBrowserContext(browser, { baseURL: base, serviceWorkers: "block", viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 900 },
      ...(gps ? { geolocation: { latitude: 23.781234, longitude: 90.421234 }, permissions: ["geolocation"] } : {}) });
    const [name, value] = cookie.split("=");
    await context.addCookies([{ name, value, url: base, httpOnly: true, sameSite: "Lax" }]);
    const page = await context.newPage();
    page.on("response", (response) => { if (response.url().startsWith("https://tile.openstreetmap.org/") && response.ok()) loadedTiles++; });
    return page;
  }
  try {
    const donorCookie = (await login()).cookie, ngoCookie = (await login("NGO")).cookie;
    const address = await mapAddress(donorCookie, "Browser pickup kitchen", null);
    const donor = await pageFor(donorCookie, true, true);
    await donor.goto("/donor/addresses", { waitUntil: "networkidle" });
    await donor.getByRole("heading", { name: address.label, exact: true }).locator("..").getByRole("button", { name: uiName("Set location pin"), exact: true }).click();
    const picker = donor.getByRole("region", { name: uiName("Choose handover location") });
    await picker.locator(".leaflet-tile-pane").waitFor({ state: "attached" });
    const bounds = await picker.boundingBox();
    await picker.click({ position: { x: bounds.width / 2, y: bounds.height / 2 } });
    assert.notEqual(await donor.getByLabel(/^Latitude/).inputValue(), "");
    await donor.getByRole("button", { name: uiName("Use device location"), exact: true }).click();
    await donor.getByText(uiName("Selected pin: 23.781234, 90.421234"), { exact: true }).waitFor();
    const saved = donor.waitForResponse((response) => response.url() === base + "/api/profile" && response.request().method() === "POST");
    await donor.getByRole("button", { name: uiName("Save location pin"), exact: true }).click();
    assert.equal((await saved).status(), 200);
    await donor.reload({ waitUntil: "networkidle" });
    await donor.getByText(uiName("Saved pin: 23.781234, 90.421234"), { exact: true }).waitFor();
    assert.deepEqual((await jsonResult("/api/profile", { cookie: donorCookie })).addresses.find((a) => a.id === address.id).coordinates, { latitude: 23.781234, longitude: 90.421234 });
    assert.equal(await donor.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await donor.screenshot({ path: screenshots + "/pickup-pin-mobile.png", fullPage: true });
    const origin = await mapAddress(ngoCookie, "Browser NGO centre", { latitude: 23.79, longitude: 90.42 });
    await jsonResult("/api/profile", { cookie: ngoCookie, method: "POST", body: { action: "setPrimaryAddress", id: origin.id } });
    const near = await mapDonation(donorCookie, address, { title: "Browser nearby meal" });
    const farAddress = await mapAddress(donorCookie, "Browser far pickup", { latitude: 24.101234, longitude: 90.421234 });
    const far = await mapDonation(donorCookie, farAddress, { title: "Browser far meal" });
    const unknownAddress = await mapAddress(donorCookie, "Browser unmapped pickup", null);
    const unknown = await mapDonation(donorCookie, unknownAddress, { title: "Browser meal without pin" });
    const attackTitle = "<img src=x onerror=window.mapXss=1>";
    const attackAddress = await mapAddress(donorCookie, "Browser escaped popup", { latitude: 23.774123, longitude: 90.434123 });
    const attack = await mapDonation(donorCookie, attackAddress, { title: attackTitle });
    for (const food of [near, far, unknown, attack]) assert.equal(food.response.status, 201, JSON.stringify(food.body));
    const ngo = await pageFor(ngoCookie);
    await ngo.goto("/ngo/discover/map", { waitUntil: "networkidle" });
    const map = ngo.getByRole("region", { name: uiName("Available donations map") });
    await map.locator(".sharebite-location-pin").first().waitFor();
    assert.equal(await map.locator(".sharebite-location-pin").count(), 3);
    assert.equal(await ngo.getByText(uiName("Browser meal without pin"), { exact: true }).count(), 1);
    await map.getByTitle(attackTitle, { exact: true }).click();
    await map.locator(".leaflet-popup-content").waitFor();
    assert.equal(await map.locator(".leaflet-popup-content img").count(), 0);
    assert.equal(await ngo.evaluate(() => window.mapXss), undefined);
    await ngo.getByRole("button", { name: /^5 (km|কিমি)$/ }).click();
    await ngo.waitForURL((url) => url.searchParams.get("radius") === "5");
    await ngo.getByText(uiName("Browser far meal"), { exact: true }).waitFor({ state: "hidden" });
    assert.equal(await ngo.getByText(uiName("Browser meal without pin"), { exact: true }).count(), 0);
    assert.equal(await map.locator(".sharebite-location-pin").count(), 2);
    assert.equal(await ngo.getByRole("button", { name: uiName("Browser nearby meal"), exact: false }).count(), 1);
    await ngo.screenshot({ path: screenshots + "/nearby-food-desktop.png", fullPage: true });
    assert.equal(await ngo.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, "Map page must fit the desktop viewport");
    await ngo.reload({ waitUntil: "networkidle" });
    assert.equal(new URL(ngo.url()).searchParams.get("radius"), "5");
    assert.equal(await map.locator(".sharebite-location-pin").count(), 2);
    await saveMapPin(ngoCookie, origin.id, null);
    await ngo.reload({ waitUntil: "networkidle" });
    await ngo.getByText(uiName("No donations match these filters."), { exact: false }).waitFor();
    await saveMapPin(ngoCookie, origin.id, { latitude: 23.79, longitude: 90.42 });
    const { claim } = await jsonResult("/api/claims", { cookie: ngoCookie, method: "POST", body: { donationId: near.body.donation.id } }, 201);
    await ngo.goto("/ngo/claims/" + claim.id, { waitUntil: "networkidle" });
    const directions = ngo.getByRole("link", { name: uiName("Pickup to delivery directions"), exact: false });
    await directions.waitFor();
    const link = new URL(await directions.getAttribute("href"));
    assert.equal(link.searchParams.get("origin"), "23.781234,90.421234");
    assert.equal(link.searchParams.get("destination"), "23.79,90.42");
    assert.equal(await ngo.getByRole("region", { name: uiName("Pickup and delivery map") }).locator(".sharebite-location-pin").count(), 2);
    await ngo.screenshot({ path: screenshots + "/claimed-navigation-desktop.png", fullPage: true });
    const denied = await pageFor(donorCookie);
    await denied.context().route("https://tile.openstreetmap.org/**", (route) => route.abort());
    await denied.goto("/donor/addresses", { waitUntil: "networkidle" });
    await denied.getByRole("heading", { name: unknownAddress.label, exact: true }).locator("..").getByRole("button", { name: uiName("Set location pin"), exact: true }).click();
    await denied.getByText(uiName("Map tiles could not load."), { exact: false }).waitFor();
    await denied.getByRole("button", { name: uiName("Use device location"), exact: true }).click();
    await denied.getByText(uiName("Device location unavailable or permission denied."), { exact: false }).waitFor({ timeout: 15000 });
    await denied.getByLabel(/^Latitude/).fill("23.770123");
    await denied.getByLabel(uiName("Longitude"), { exact: true }).fill("90.440123");
    await denied.getByRole("button", { name: uiName("Apply coordinates"), exact: true }).click();
    await denied.getByText(uiName("Selected pin: 23.770123, 90.440123"), { exact: true }).waitFor();
    const manualSave = denied.waitForResponse((response) => response.url() === base + "/api/profile" && response.request().method() === "POST");
    await denied.getByRole("button", { name: uiName("Save location pin"), exact: true }).click();
    assert.equal((await manualSave).status(), 200);
    assert.deepEqual((await jsonResult("/api/profile", { cookie: donorCookie })).addresses.find((a) => a.id === unknownAddress.id).coordinates, { latitude: 23.770123, longitude: 90.440123 });
    await denied.screenshot({ path: screenshots + "/manual-location-fallback.png", fullPage: true });
    console.log("Browser map verification: " + loadedTiles + " real OpenStreetMap tiles loaded; denied-provider fallback verified separately.");
  } finally { await browser.close(); }
});

test("cancelled missions revoke exact pins and legacy destinations retain honest text fallback", async () => {
  const r = await assignedRescue();
  const pinned = { latitude: 23.781234, longitude: 90.421234 };
  await prisma.donation.update({ where: { id: r.donation.id }, data: { pickupLatitude: pinned.latitude, pickupLongitude: pinned.longitude } });
  await prisma.$executeRaw`UPDATE claims SET "deliveryAddressSnapshot" = NULL WHERE id = ${r.claim.id}`;
  const legacy = (await jsonResult("/api/claims?id=" + r.claim.id, { cookie: r.ngo })).details;
  assert.ok(legacy.deliveryAddress.addressLine);
  assert.equal(legacy.deliveryAddress.coordinates, undefined);
  await jsonResult("/api/claims", { cookie: r.ngo, method: "PATCH", body: { id: r.claim.id, status: "CANCELLED" } });
  const mission = (await jsonResult("/api/missions?claimId=" + r.claim.id, { cookie: r.volunteer })).mission;
  assert.equal(mission.pickupCoordinates, undefined);
  assert.equal(mission.dropoffCoordinates, undefined);
  assert.equal(mission.donorPhone, "");
  const revoked = (await jsonResult("/api/claims?id=" + r.claim.id, { cookie: r.volunteer })).details;
  assert.equal(revoked.donation.pickup.exactAddress, undefined);
  assert.equal(revoked.deliveryAddress, undefined);
  const unclaimed = (await jsonResult("/api/donations?id=" + r.donation.id, { cookie: r.ngo })).donation;
  assert.equal(unclaimed.pickup.exactAddress, undefined);
  assert.deepEqual(unclaimed.pickup.approximateCoordinates, { latitude: 23.78, longitude: 90.42 });
});

test("volunteer counters separate verified handovers from actual meals distributed", async () => {
  const r = await deliveredRescue();
  const before = await jsonResult("/api/missions", { cookie: r.volunteer });
  assert.equal(before.completedRescues, 1);
  assert.equal(before.completedHistory.find((row) => row.id === r.claim.id).servings, 0);
  await saveReceipt(r);
  assert.equal((await distribute(r, await distributionInput(r, { beneficiariesServed: 17, mealsDistributed: 17, adultsServed: 17, childrenServed: 0 }))).status, 201);
  const after = await jsonResult("/api/missions", { cookie: r.volunteer });
  assert.equal(after.completedRescues, 1);
  assert.equal(after.completedHistory.find((row) => row.id === r.claim.id).servings, 17);
});

test("browser live icon interactions replay across roles respect reduced motion and preserve navigation", { skip: process.env.RUN_LIVE_MOTION_BROWSER !== "1",timeout:240_000 }, async () => {
  await runLiveMotionChecks({base,login,prisma,newDonation});
});

test("browser NGO dashboard localizes totals handles map pins and prioritizes actual active work", { skip: process.env.RUN_NGO_DASHBOARD_BROWSER !== "1" }, async () => {
  await runNgoDashboardBrowserChecks({ prisma, base, login, secondLogin, newDonation, assignedRescue, deliveredRescue, saveReceipt, distributionInput, distribute, jsonResult, handover, issue });
});

test("browser notification inbox popover and toast preserve read state and fit both languages", { skip: process.env.RUN_NOTIFICATION_BROWSER !== "1" }, async () => {
  await runNotificationBrowserChecks({ prisma, base, login });
});

test("browser demo cleanup uses real identity counts photos notifications language and honest pending pages", { skip: process.env.RUN_CLEANUP_BROWSER !== "1" }, async () => {
  const { chromium } = await import("playwright");
  const { mkdir } = await import("node:fs/promises");
  const screenshots = ".local-postgres/cleanup-browser";
  await mkdir(screenshots, { recursive: true });
  const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) });
  const errors = [];
  async function pageFor(cookie, mobile = false) {
    const context = await englishBrowserContext(browser, { baseURL: base, serviceWorkers: "block", viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 900 } });
    const [name, value] = cookie.split("=");
    await context.addCookies([{ name, value, url: base, httpOnly: true, sameSite: "Lax" }]);
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(error.message));
    return page;
  }
  try {
    const donorCookie = (await login()).cookie, ngoCookie = (await login("NGO")).cookie, volunteerCookie = (await login("VOLUNTEER")).cookie;
    const publicPage = await browser.newPage();
    await publicPage.addInitScript(() => localStorage.setItem("sharebite_preferred_lang", "en"));
    await publicPage.goto(base + "/", { waitUntil: "networkidle" });
    await publicPage.getByRole("heading", { name: uiName("সংরক্ষিত খাবার দেখতে sign in করুন"), exact: true }).waitFor();
    assert.equal(await publicPage.locator('a[href^="tel:"]').count(), 0, "No invented public hotline");
    assert.equal(await publicPage.getByText(uiName("4,340+"), { exact: true }).count(), 0);
    await publicPage.close();
    const created = await newDonation(donorCookie, { title: "Cleanup actual donation" });
    assert.equal(created.response.status, 201);
    const ownNotice = await prisma.notification.create({ data: { userId: "test-DONOR", type: "SYSTEM", title: "Actual owner notification", message: "Stored account update", href: "/donor/profile" } });
    await prisma.notification.create({ data: { userId: "second-DONOR", type: "SYSTEM", title: "Private foreign notification", message: "Other account", href: "/donor/profile" } });
    const donor = await pageFor(donorCookie);
    await donor.goto("/donor/dashboard", { waitUntil: "networkidle" });
    await donor.getByText(uiName("Meals distributed"), { exact: true }).waitFor();
    assert.equal(await donor.locator('img[src*="surplus-food-containers"]').count(), 0);
    const placeholder = donor.locator('img[src*="no-donation-photo.svg"]');
    await placeholder.first().waitFor();
    assert.ok(await placeholder.first().evaluate((img) => img.complete && img.naturalWidth > 0));
    await donor.getByRole("textbox", { name: uiName("Find a page"), exact: true }).fill("UIU");
    await donor.getByText(uiName("No pages found."), { exact: true }).waitFor();
    await donor.getByRole("textbox", { name: uiName("Find a page"), exact: true }).press("Escape");
    await donor.getByRole("button", { name: uiName("Open account menu"), exact: true }).click();
    const account = donor.getByRole("dialog", { name: uiName("User Account Settings"), exact: true });
    await account.getByText(uiName("01712345670"), { exact: true }).waitFor();
    assert.equal(await account.getByText(uiName("NID ও BFSA ভেরিফায়েড"), { exact: true }).count(), 0);
    await donor.keyboard.press("Escape");
    await donor.screenshot({ path: screenshots + "/donor-dashboard-desktop.png", fullPage: true });

    await donor.goto("/donor/settings", { waitUntil: "networkidle" });
    await donor.getByRole("heading", { name: uiName("Language on this browser"), exact: true }).waitFor();
    await donor.locator("header").getByRole("button", { name: uiName("EN"), exact: true }).click();
    assert.equal(await donor.evaluate(() => localStorage.getItem("sharebite_preferred_lang")), "en");
    await donor.reload({ waitUntil: "networkidle" });
    assert.equal(await donor.locator("header").getByRole("button", { name: uiName("EN"), exact: true }).getAttribute("aria-pressed"), "true");
    const sameBrowser = await donor.context().newPage();
    await sameBrowser.goto(base + "/donor/settings", { waitUntil: "networkidle" });
    await sameBrowser.locator("header").getByRole("button", { name: uiName("বাংলা"), exact: true }).click();
    await donor.waitForFunction(() => document.querySelector('header button[aria-pressed="true"]')?.textContent?.includes("বাংলা"));
    await sameBrowser.close();
    await donor.locator("header").getByRole("button", { name: "EN", exact: true }).click();

    await donor.goto("/donor/notifications", { waitUntil: "networkidle" });
    const main = donor.locator("main");
    await main.getByRole("heading", { name: ownNotice.title, exact: true }).waitFor();
    assert.equal(await main.getByText(uiName("Private foreign notification"), { exact: true }).count(), 0);
    await donor.context().route("**/api/notifications", async (route) => {
      if (route.request().method() === "PATCH") await route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: "Injected read failure" }) });
      else await route.continue();
    });
    const noticeCard = main.locator("article").filter({ has: donor.getByRole("heading", { name: ownNotice.title, exact: true }) });
    await noticeCard.getByRole("button", { name: uiName("Mark read"), exact: true }).click();
    await main.getByText(uiName("Read status could not be saved. Please retry."), { exact: true }).waitFor();
    assert.equal((await prisma.notification.findUnique({ where: { id: ownNotice.id } })).readAt, null);
    await donor.context().unroute("**/api/notifications");
    const mark = donor.waitForResponse((response) => response.url() === base + "/api/notifications" && response.request().method() === "PATCH");
    await noticeCard.getByRole("button", { name: uiName("Mark read"), exact: true }).click();
    assert.equal((await mark).status(), 200);
    await donor.reload({ waitUntil: "networkidle" });
    await main.getByRole("heading", { name: ownNotice.title, exact: true }).waitFor();
    assert.ok((await prisma.notification.findUnique({ where: { id: ownNotice.id } })).readAt);
    await donor.evaluate(() => window.dispatchEvent(new CustomEvent("sharebite:notification", { detail: { id: "fake-client-message", title: "Untrusted injected toast", message: "Not stored", type: "SYSTEM" } })));
    assert.equal(await donor.getByText(uiName("Untrusted injected toast"), { exact: true }).count(), 0);
    await donor.context().route("**/api/notifications", (route) => route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "Injected load failure" }) }));
    await donor.reload({ waitUntil: "networkidle" });
    await main.getByText(uiName("Notifications could not load. Please retry."), { exact: true }).waitFor();
    assert.equal(await main.getByText(uiName("No notifications match your filters."), { exact: true }).count(), 0);
    await donor.context().unroute("**/api/notifications");

    const ngo = await pageFor(ngoCookie, true);
    for (const [route, expected] of [["/ngo/team", "Team invitations are not available yet"], ["/ngo/settings", "Notification channels"], ["/ngo/support", "Report an issue with a rescue"], ["/ngo/verification", "Organization verification"]]) {
      await ngo.goto(route, { waitUntil: "networkidle" });
      await ngo.locator("main").getByRole("heading", { name: expected, exact: true }).waitFor();
      assert.equal(await ngo.locator('input[type="file"]').count(), 0);
      assert.equal(await ngo.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, route);
    }
    await ngo.screenshot({ path: screenshots + "/ngo-verification-mobile.png", fullPage: true });
    const volunteer = await pageFor(volunteerCookie, true);
    await volunteer.goto("/volunteer/id-card", { waitUntil: "networkidle" });
    await volunteer.getByText(uiName("Phone: 01712345672"), { exact: true }).waitFor();
    assert.equal(await volunteer.getByRole("button", { name: /certificate|সার্টিফিকেট|সনদ/i }).count(), 0);
    await volunteer.getByRole("button", { name: uiName("Open mobile navigation menu"), exact: true }).click();
    const navigation = volunteer.getByRole("dialog", { name: uiName("Account navigation"), exact: true });
    assert.equal(await navigation.locator('a[href*="mission-uiu-mastul"]').count(), 0);
    assert.equal(await navigation.getByRole("link", { name: uiName("বর্তমান মিশন"), exact: true }).getAttribute("href"), "/volunteer/dashboard#active-mission");
    await volunteer.getByRole("button", { name: uiName("Close navigation"), exact: true }).click();
    await volunteer.screenshot({ path: screenshots + "/volunteer-profile-mobile.png", fullPage: true });
    const dutyPanel = volunteer.getByTestId("volunteer-duty-panel");
    await dutyPanel.scrollIntoViewIfNeeded();
    assert.equal(await dutyPanel.evaluate(node => getComputedStyle(node).position), "static");
    const sessionBar = await dutyPanel.boundingBox();
    const bottomNav = await volunteer.getByRole("navigation", { name: uiName("Mobile Bottom App Navigation"), exact: true }).boundingBox();
    assert.ok(sessionBar.y + sessionBar.height <= bottomNav.y, "Volunteer duty controls must not cover mobile navigation");
    assert.deepEqual(errors, [], "Operational pages must not throw browser errors");
  } finally { await browser.close(); }
});

test("donation samples persist as illustrative metadata without evidence photos", async () => {
  const donor = (await login()).cookie, ngo = (await login("NGO")).cookie;
  const before = await prisma.photoAsset.count();
  for (const sampleImageId of ["packed-meals", "meal-trays"]) {
    const created = await newDonation(donor, { sampleImageId });
    assert.equal(created.response.status, 201, JSON.stringify(created.body));
    assert.equal(created.body.donation.sampleImageId, sampleImageId);
    assert.deepEqual(created.body.donation.photoUrls, []);
    const stored = await prisma.donation.findUnique({ where: { id: created.body.donation.id } });
    assert.equal(stored.sampleImageId, sampleImageId);
    const visible = (await jsonResult("/api/donations?id=" + stored.id, { cookie: ngo })).donation;
    assert.equal(visible.sampleImageId, sampleImageId);
    assert.deepEqual(visible.photoUrls, []);
  }
  assert.equal(await prisma.photoAsset.count(), before, "Samples do not become uploaded evidence or use upload quota");
});

test("sample choices reject arbitrary assets and cannot be mixed with uploaded photos", async () => {
  const donor = (await login()).cookie;
  for (const sampleImageId of ["unknown", "constructor", "/images/ngo-community-gallery.png", "https://example.com/food.jpg", "../secret"]) {
    assert.equal((await newDonation(donor, { sampleImageId })).response.status, 422);
  }
  const photo = await uploadedPhoto(donor);
  const rejected = await newDonation(donor, { sampleImageId: "packed-meals", photoUrls: [photo.url] });
  assert.equal(rejected.response.status, 422);
  assert.equal((await prisma.photoAsset.findUnique({ where: { id: photo.id } })).donationId, null);
  const real = await newDonation(donor, { photoUrls: [photo.url] });
  assert.equal(real.response.status, 201, JSON.stringify(real.body));
  assert.equal(real.body.donation.sampleImageId, undefined);
  assert.deepEqual(real.body.donation.photoUrls, [photo.url]);
});

test("browser donor publishing identifies actual errors and saves completed forms on mobile and desktop", { skip: process.env.RUN_DONATION_BROWSER !== "1" }, async () => {
  const { chromium } = await import("playwright");
  const { mkdir } = await import("node:fs/promises");
  const screenshots = ".local-postgres/donation-publishing";
  await mkdir(screenshots, { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL || undefined });
  const pageErrors = [];
  try {
    const { cookie } = await login();
    for (const mobile of [true, false]) {
      const context = await englishBrowserContext(browser, { baseURL: base, viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 } });
      const [name, value] = cookie.split("=");
      await context.addCookies([{ name, value, url: base, httpOnly: true, sameSite: "Lax" }]);
      const page = await context.newPage();
      page.on("pageerror", (error) => pageErrors.push(error.message));
      const postStatuses = [];
      page.on("response", (response) => { if (response.url() === base + "/api/donations" && response.request().method() === "POST") postStatuses.push(response.status()); });
      await page.goto("/donor/donations/new", { waitUntil: "networkidle" });
      const next = () => page.getByRole("button", { name: uiName("পরবর্তী ধাপ"), exact: true }).click();
      const publish = () => page.getByRole("button", { name: uiName("অনুদানের তালিকা প্রকাশ করুন"), exact: true }).click();
      await page.locator('[name="title"]').fill("Publishing regression " + (mobile ? "mobile" : "desktop"));
      await page.locator('[name="quantity"]').fill("20");
      await page.locator('[name="allergenInfo"]').fill("None known");
      await page.locator('textarea[name="description"]').fill("Covered freshly prepared meal boxes");
      // Enter in food details must never validate hidden safety boxes or publish.
      await page.locator('[name="title"]').press("Enter");
      assert.equal(await page.getByText(uiName("অসম্পূর্ণ চেকলিস্ট"), { exact: true }).count(), 0);
      await next();
      await goDonationStep(page, 4);
      await page.locator('[name="contactPerson"]').waitFor();
      const start = await page.locator('[name="pickupWindowStart"]').inputValue();
      await page.locator('[name="pickupWindowStart"]').fill("2000-01-01T00:00");
      await next();
      await page.getByText(uiName("Pickup cannot start before food preparation."), { exact: true }).waitFor();
      assert.equal(await page.locator('[name="pickupWindowStart"]').getAttribute("aria-invalid"), "true");
      await page.locator('[name="pickupWindowStart"]').fill(start);
      await next();
      await publish();
      assert.equal(await page.locator('form input[aria-invalid="true"]').count(), 7);
      assert.equal(await page.locator('form input[type="checkbox"]').evaluateAll((inputs) => inputs.every((input) => {
        const ids = (input.getAttribute("aria-describedby") || "").split(" ").filter(Boolean);
        return ids.length === 2 && ids.every((id) => document.getElementById(id));
      })), true, "Checklist instructions and errors must both have accessible descriptions");
      for (const checkbox of await page.locator('form input[type="checkbox"]').all()) await checkbox.check();
      assert.match(await page.getByTestId("safety-progress").innerText(), /7.*7/);
      // Reproduce a server validation failure after every safety box has been checked.
      await page.route("**/api/donations", async (route) => {
        if (route.request().method() !== "POST") return route.continue();
        await route.fulfill({ status: 422, contentType: "application/json", body: JSON.stringify({ error: "Check the food and pickup times.", fieldErrors: { pickupWindowEnd: "Check pickup times." } }) });
      }, { times: 1 });
      await publish();
      await page.locator('[name="pickupWindowEnd"][aria-invalid="true"]').waitFor();
      assert.equal(await page.getByText(uiName("অসম্পূর্ণ চেকলিস্ট"), { exact: true }).count(), 0);
      await page.screenshot({ path: `${screenshots}/pickup-error-${mobile ? "mobile" : "desktop"}.png`, fullPage: true });
      await next();
      await page.waitForLoadState("networkidle");
      assert.deepEqual(postStatuses, [422], "Returning to review must not submit the donation automatically");
      assert.equal(await page.locator('form input[type="checkbox"]:checked').count(), 7);
      assert.equal(await page.getByRole("button", { name: uiName("অনুদানের তালিকা প্রকাশ করুন"), exact: true }).count(), 1, await page.locator("form").innerText());
      await page.route("**/api/donations", async (route) => {
        if (route.request().method() !== "POST") return route.continue();
        await route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: "The request could not be completed. Please try again." }) });
      }, { times: 1 });
      await publish();
      await page.getByText(uiName("The request could not be completed. Please try again."), { exact: true }).waitFor();
      assert.equal(await page.getByText(uiName("অসম্পূর্ণ চেকলিস্ট"), { exact: true }).count(), 0);
      assert.equal(await page.locator('form input[type="checkbox"]:checked').count(), 7);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await page.screenshot({ path: `${screenshots}/review-${mobile ? "mobile" : "desktop"}.png`, fullPage: true });
      const responsePromise = page.waitForResponse((response) => response.url() === base + "/api/donations" && response.request().method() === "POST");
      await publish();
      const response = await responsePromise;
      assert.equal(response.status(), 201, await response.text());
      const donation = (await response.json()).donation;
      assert.equal(donation.quantity.value, 20);
      await page.getByRole("button", { name: uiName("ধন্যবাদ, সম্পন্ন"), exact: true }).click();
      await page.screenshot({ path: `${screenshots}/published-${mobile ? "mobile" : "desktop"}.png`, fullPage: true });
      await page.goto("/donor/donations/" + donation.id, { waitUntil: "networkidle" });
      await page.getByRole("heading", { name: donation.title, exact: true }).first().waitFor();
      if (mobile) {
        await page.goto("/donor/donations/new", { waitUntil: "networkidle" });
        await page.waitForFunction(() => Object.keys(sessionStorage).some((key) => key.startsWith("sharebite.donor.donation-draft")));
        await page.evaluate(() => {
          const key = Object.keys(sessionStorage).find((key) => key.startsWith("sharebite.donor.donation-draft"));
          const draft = JSON.parse(sessionStorage.getItem(key));
          Object.assign(draft, { preparationTime: "2000-01-01T12:00", safePickupDeadline: "2000-01-01T15:00", pickupWindowStart: "2000-01-01T13:00", pickupWindowEnd: "2000-01-01T14:00" });
          sessionStorage.setItem(key, JSON.stringify(draft));
        });
        await page.reload({ waitUntil: "networkidle" });
        assert.equal(await page.locator('[name="preparationTime"]').inputValue(), "2000-01-01T12:00");
        await page.getByText(uiName("This saved food draft has expired. Check the food condition and enter accurate times before posting."), { exact: true }).waitFor();
        await page.addInitScript(() => {
          for (const method of ["getItem", "setItem", "removeItem"]) {
            const original = Storage.prototype[method];
            Storage.prototype[method] = function (key, ...args) {
              if (key.startsWith("sharebite.donor.donation-draft")) throw new DOMException("Storage blocked", "SecurityError");
              return original.call(this, key, ...args);
            };
          }
        });
        await page.reload({ waitUntil: "networkidle" });
        await page.locator('[name="title"]').fill("Food without browser storage");
        await page.locator('[name="quantity"]').fill("20");
        await page.locator('[name="allergenInfo"]').fill("None known");
        await page.locator('textarea[name="description"]').fill("Food in covered containers");
        await next();
        await goDonationStep(page, 4);
      await page.locator('[name="contactPerson"]').waitFor();
      }
      await context.close();
    }
    assert.deepEqual(pageErrors, []);
  } finally { await browser.close(); }
});

test("browser demo reviews retain both languages pause control and responsive layout", { skip: process.env.RUN_DONATION_BROWSER !== "1" }, async () => {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL || undefined });
  const errors = [];
  try {
    const page = await browser.newPage({ baseURL: base });
    page.on("pageerror", (error) => errors.push(error.message));
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const lang of ["bn", "en"]) {
        await page.addInitScript((language) => localStorage.setItem("sharebite_preferred_lang", language), lang);
        await page.goto("/", { waitUntil: "networkidle" });
        const reviews = page.getByTestId("demo-reviews").filter({ visible: true });
        await reviews.scrollIntoViewIfNeeded();
        assert.equal(await reviews.locator('[data-demo-review="true"]').count(), 10);
        const pause = reviews.getByRole("button");
        await pause.click();
        assert.equal(await pause.getAttribute("aria-pressed"), "true");
        await pause.click();
        assert.equal(await pause.getAttribute("aria-pressed"), "false");
        assert.equal(await page.locator("html").getAttribute("lang"), lang);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Overflow at ${width}/${lang}`);
        await page.screenshot({ path: `.local-postgres/donation-publishing/reviews-${width}-${lang}.png` });
      }
    }
    await page.emulateMedia({ reducedMotion: "reduce" });
    assert.equal(await page.getByTestId("demo-reviews").filter({ visible: true }).getByRole("button").isVisible(), false);
    assert.deepEqual(errors, []);
  } finally { await browser.close(); }
});

test("browser sample image selection publish labels reload and real-photo switching work", { skip: process.env.RUN_SAMPLE_BROWSER !== "1" }, async () => {
  const { chromium } = await import("playwright");
  const { mkdir } = await import("node:fs/promises");
  const screenshots = ".local-postgres/sample-browser";
  await mkdir(screenshots, { recursive: true });
  const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) });
  async function pageFor(cookie, mobile = false) {
    const context = await englishBrowserContext(browser, { baseURL: base, serviceWorkers: "block", viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 900 } });
    const [name, value] = cookie.split("=");
    await context.addCookies([{ name, value, url: base, httpOnly: true, sameSite: "Lax" }]);
    return context.newPage();
  }
  try {
    const donorCookie = (await login()).cookie, ngoCookie = (await login("NGO")).cookie;
    const page = await pageFor(donorCookie, true);
    await page.goto("/donor/donations/new", { waitUntil: "networkidle" });
    const packed = page.getByRole("button", { name: uiName("Use sample image: Packed meals"), exact: true });
    const trays = page.getByRole("button", { name: uiName("Use sample image: Meal trays"), exact: true });
    await prepareDonationPhotos(page);
    await page.getByTestId("sample-image-picker").locator("summary").click();
    await packed.click();
    assert.equal(await packed.getAttribute("aria-pressed"), "true");
    await page.waitForFunction(() => Object.keys(sessionStorage).some((key) => key.startsWith("sharebite.donor.donation-draft.v1.") && JSON.parse(sessionStorage.getItem(key) || "{}").sampleImageId === "packed-meals"));
    await page.reload({ waitUntil: "networkidle" });
    await prepareDonationPhotos(page);
    await page.getByTestId("sample-image-picker").locator("summary").click();
    assert.equal(await packed.getAttribute("aria-pressed"), "true");
    await page.getByRole("button", { name: uiName("Remove sample image"), exact: true }).click();
    assert.equal(await packed.getAttribute("aria-pressed"), "false");
    await trays.click();
    await goDonationStep(page, 1);
    await page.locator('[name="title"]').fill("Donation with selected sample");
    await page.locator('[name="quantity"]').fill("20");
    await page.locator('[name="allergenInfo"]').fill("None known");
    await page.locator('textarea[name="description"]').fill("Prepared meal for sample image demonstration");
    await goDonationStep(page, 3);
    await page.screenshot({ path: screenshots + "/sample-picker-mobile.png", fullPage: true });
    await page.getByRole("button", { name: uiName("পরবর্তী ধাপ"), exact: true }).click();
    await page.locator('[name="contactPerson"]').waitFor();
    await page.getByRole("button", { name: uiName("পরবর্তী ধাপ"), exact: true }).click();
    await page.getByRole("button", { name: uiName("অনুদানের তালিকা প্রকাশ করুন"), exact: true }).waitFor();
    for (const checkbox of await page.locator('form input[type="checkbox"]').all()) await checkbox.check();
    const published = page.waitForResponse((response) => response.url() === base + "/api/donations" && response.request().method() === "POST");
    await page.getByRole("button", { name: uiName("অনুদানের তালিকা প্রকাশ করুন"), exact: true }).click();
    const response = await published;
    assert.equal(response.status(), 201, await response.text());
    const donation = (await response.json()).donation;
    assert.equal(donation.sampleImageId, "meal-trays");
    assert.deepEqual(donation.photoUrls, []);
    await page.goto("/donor/donations/" + donation.id, { waitUntil: "networkidle" });
    await page.getByText(uiName("Sample image · উদাহরণ ছবি"), { exact: true }).waitFor();
    const image = page.getByRole("img", { name: uiName("Sample image: Meal trays — illustrative, not an uploaded food photo"), exact: true });
    await image.scrollIntoViewIfNeeded();
    assert.ok(await image.evaluate((img) => img.complete && img.naturalWidth > 0));
    assert.equal(await page.getByRole("region", { name: uiName("Donor food photos"), exact: true }).count(), 0);
    await page.reload({ waitUntil: "networkidle" });
    await page.getByText(uiName("Sample image · উদাহরণ ছবি"), { exact: true }).waitFor();
    await page.screenshot({ path: screenshots + "/sample-donation-mobile.png", fullPage: true });
    const ngo = await pageFor(ngoCookie);
    await ngo.goto("/ngo/donations/" + donation.id, { waitUntil: "networkidle" });
    await ngo.getByText(uiName("Sample image · উদাহরণ ছবি"), { exact: true }).waitFor();
    const { claim } = await jsonResult("/api/claims", { cookie: ngoCookie, method: "POST", body: { donationId: donation.id } }, 201);
    await ngo.goto("/ngo/claims/" + claim.id, { waitUntil: "networkidle" });
    await ngo.getByText(uiName("Sample image · উদাহরণ ছবি"), { exact: true }).waitFor();
    await ngo.screenshot({ path: screenshots + "/sample-claim-desktop.png", fullPage: true });
    await page.goto("/donor/donations/new", { waitUntil: "networkidle" });
    await prepareDonationPhotos(page);
    await page.getByTestId("sample-image-picker").locator("summary").click();
    await packed.click();
    const upload = page.waitForResponse((result) => result.url() === base + "/api/photos" && result.request().method() === "POST");
    await page.locator('input[type="file"]').setInputFiles({ name: "real-food.png", mimeType: "image/png", buffer: await imageBytes() });
    assert.equal((await upload).status(), 201);
    await page.waitForFunction(() => document.querySelector('button[aria-label="Use sample image: Packed meals"]')?.getAttribute("aria-pressed") === "false");
    assert.equal(await packed.isDisabled(), true);
    await page.waitForFunction(() => Object.keys(sessionStorage).some((key) => key.startsWith("sharebite.donor.donation-draft.v1.") && JSON.parse(sessionStorage.getItem(key) || "{}").photoUrls?.length > 0));
    await page.reload({ waitUntil: "networkidle" });
    await prepareDonationPhotos(page);
    await page.getByTestId("sample-image-picker").locator("summary").click();
    assert.equal(await packed.getAttribute("aria-pressed"), "false");
    assert.equal(await packed.isDisabled(), true);
  } finally { await browser.close(); }
});




test("browser auth pages support responsive sign-in and complete role registrations", { skip: process.env.RUN_AUTH_PAGES_BROWSER !== "1" }, async () => {
  const { runAuthPageBrowserChecks } = await import("./auth-pages-browser.mjs");
  await runAuthPageBrowserChecks({ base, prisma });
});

test("admin dashboard API authorization, verification transactions and operational data", async () => {
  const { runAdminChecks } = await import("./admin.integration.mjs");
  await runAdminChecks({ prisma, request, login, seedUser, newDonation, fixturePassword });
});

test("browser admin dashboard responsive layouts and review workflows", { skip: process.env.RUN_ADMIN_BROWSER !== "1" }, async () => {
  const { runAdminBrowserChecks } = await import("./admin-browser.mjs");
  await runAdminBrowserChecks({ prisma, request, login, seedUser, newDonation, fixturePassword, base });
});

test("local admin bootstrap creates private credentials once without replacing accounts", async () => {
  const { runLocalAdminChecks } = await import("./local-admin.integration.mjs");
  await runLocalAdminChecks({ prisma });
});

test("browser donor and NGO dashboards share accessible responsive styling", { skip: process.env.RUN_PORTAL_CONSISTENCY_BROWSER !== "1" }, async () => {
  const { runPortalConsistencyChecks } = await import("./portal-consistency-browser.mjs");
  await runPortalConsistencyChecks({ prisma, base, login, request, newDonation, assignedRescue, deliveredRescue, saveReceipt, distribute, distributionInput, handover, issue });
});

test("admin username uses stored credentials and cannot authenticate ordinary or inactive accounts", async () => {
  const user = await prisma.user.create({ data: { email: "local-admin-login@example.test", username: "admin", password: "admin123", displayName: "Local Admin", role: "ADMIN" } });
  try {
    for (const [email, password] of [["admin", "wrong"], ["admin", "ADMIN123"], ["admin", "admin123 "], ["administrator", "admin123"]]) {
      assert.equal((await request("/api/auth/login", { method: "POST", body: { email, password } })).status, 401);
    }
    const response = await request("/api/auth/login", { method: "POST", body: { email: " ADMIN ", password: "admin123" } });
    assert.equal(response.status, 200);
    const data = await response.json(); assert.equal(data.session.role, "ADMIN"); assert.equal(data.session.id, user.id); assert.equal(data.user.password, undefined);
    const cookie = response.headers.get("set-cookie").split(";")[0];
    assert.equal((await request("/api/admin/overview", { cookie })).status, 200);
    assert.equal((await request("/admin/dashboard", { cookie })).status, 200);
    assert.equal((await request("/api/auth/login", { method: "POST", body: { email: user.email, password: "admin123" } })).status, 200);
    await prisma.user.update({ where: { id: user.id }, data: { isActive: false } });
    assert.equal((await request("/api/auth/login", { method: "POST", body: { email: "admin", password: "admin123" } })).status, 401);
    await prisma.user.update({ where: { id: user.id }, data: { isActive: true, role: "DONOR" } });
    assert.equal((await request("/api/auth/login", { method: "POST", body: { email: "admin", password: "admin123" } })).status, 401);
  } finally { await prisma.user.delete({ where: { id: user.id } }); }
});

test("browser admin username login works in both languages and screen sizes", { skip: process.env.RUN_ADMIN_USERNAME_BROWSER !== "1" }, async () => {
  const { runAdminUsernameBrowserChecks } = await import("./admin-username-browser.mjs");
  await runAdminUsernameBrowserChecks({ prisma, base });
});
