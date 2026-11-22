import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { goDonationStep } from "./donation-browser.mjs";
import { uiName } from "./ui-labels.mjs";
export async function startRescueThroughUi(h) {
  const { base, prisma, request, login, seedUser, fixturePassword } = h;
  const artifacts = ".local-postgres/journey-browser";
  await mkdir(artifacts, { recursive: true });
  const donor = (await login()).cookie,
    ngo = (await login("NGO")).cookie;
  for (const [cookie, point] of [
    [donor, { latitude: 23.781234, longitude: 90.421234 }],
    [ngo, { latitude: 23.79, longitude: 90.42 }],
  ]) {
    const profile = await (await request("/api/profile", { cookie })).json();
    assert.equal(
      (
        await request("/api/profile", {
          cookie,
          method: "POST",
          body: {
            action: "setCoordinates",
            id: profile.addresses[0].id,
            input: { coordinates: point },
          },
        })
      ).status,
      200,
    );
  }
  const unique = randomUUID(),
    volunteerUser = await seedUser({
      id: unique,
      email: unique + "@example.test",
      password: fixturePassword,
      displayName: "Journey volunteer",
      role: "VOLUNTEER",
      phone: null,
      normalizedPhone: null,
    });
  await prisma.volunteerProfile.update({
    where: { userId: unique },
    data: { isOnDuty: false },
  });
  const signedIn = await request("/api/auth/login", {
    method: "POST",
    body: { email: volunteerUser.email, password: fixturePassword },
  });
  assert.equal(signedIn.status, 200);
  const volunteer = signedIn.headers.get("set-cookie").split(";")[0];
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
      : { channel: process.env.PLAYWRIGHT_CHANNEL || undefined }),
  });
  const pages = {},
    layouts = [],
    errors = [];
  async function contextFor(role, cookie) {
    const context = await browser.newContext({
      baseURL: base,
      viewport: { width: 390, height: 1000 },
      timezoneId: "Asia/Dhaka",
    });
    await context.addInitScript(() =>
      localStorage.setItem("sharebite_preferred_lang", "en"),
    );
    const [name, value] = cookie.split("=");
    await context.addCookies([
      { name, value, url: base, httpOnly: true, sameSite: "Lax" },
    ]);
    const page = await context.newPage();
    pages[role] = page;
    page.on("pageerror", (e) => errors.push(e.message));
    return page;
  }
  async function snapshot(page, stage) {
    for (const language of ["en", "bn"]) {
      await page
        .getByRole("button", {
          name: language === "en" ? "EN" : "বাংলা",
          exact: true,
        })
        .filter({ visible: true })
        .click();
      for (const width of [320, 390, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.evaluate(() => document.fonts.ready);
        await page.evaluate(() =>
          window.scrollTo({ top: 0, behavior: "instant" }),
        );
        await page.evaluate(
          () =>
            new Promise((resolve) =>
              requestAnimationFrame(() => requestAnimationFrame(resolve)),
            ),
        );
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
          stage + " " + language + " " + width,
        );
        layouts.push({ stage, language, width });
        if (width === 390 || width === 1440)
          await page.screenshot({
            path: `${artifacts}/${stage}-${language}-${width}.png`,
            fullPage: true,
            animations: "disabled",
            style: "* { content-visibility: visible !important; }",
          });
      }
    }
    await page
      .getByRole("button", { name: "EN", exact: true })
      .filter({ visible: true })
      .click();
    await page.setViewportSize({ width: 390, height: 1000 });
  }
  try {
    const d = await contextFor("donor", donor),
      title = "Journey meal boxes " + unique.slice(0, 8);
    await d.goto("/donor/donations/new", { waitUntil: "networkidle" });
    await d.getByTestId("donation-next").click();
    await d.locator('[name="title"][aria-invalid="true"]').waitFor();
    assert.equal(
      await d
        .locator('[name="title"]')
        .evaluate((el) => el === document.activeElement),
      true,
    );
    await d.locator('[name="title"]').fill(title);
    await d.locator('[name="quantity"]').fill("20");
    await d.locator('[name="allergenInfo"]').fill("None known");
    await d
      .locator('textarea[name="description"]')
      .fill("Fresh covered meal boxes prepared for community collection.");
    await d.getByRole("button", { name: uiName("খসড়া"), exact: true }).click();
    await d.reload({ waitUntil: "networkidle" });
    assert.equal(await d.locator('[name="title"]').inputValue(), title);
    await snapshot(d, "food-details");
    await goDonationStep(d, 2);
    const local = (offset) =>
      new Date(Date.now() + offset + 6 * 3600000).toISOString().slice(0, 16);
    await d.locator('[name="preparationTime"]').fill(local(-30 * 60000));
    await d.locator('[name="safePickupDeadline"]').fill(local(150 * 60000));
    await snapshot(d, "time-storage");
    await goDonationStep(d, 3);
    await snapshot(d, "optional-photos");
    await goDonationStep(d, 4);
    await d.locator('[name="pickupWindowStart"]').fill(local(-15 * 60000));
    await d.locator('[name="pickupWindowEnd"]').fill(local(120 * 60000));
    await snapshot(d, "pickup-details");
    await goDonationStep(d, 5);
    for (const checkbox of await d.locator('form input[type="checkbox"]').all())
      await checkbox.check();
    await snapshot(d, "publish-review");
    await d.route(
      "**/api/donations",
      async (route) => {
        if (route.request().method() !== "POST") return route.continue();
        await route.fulfill({
          status: 503,
          contentType: "application/json",
          body: JSON.stringify({
            error: "The request could not be completed. Please try again.",
          }),
        });
      },
      { times: 1 },
    );
    const publish = d.getByRole("button", {
      name: uiName("অনুদানের তালিকা প্রকাশ করুন"),
      exact: true,
    });
    await publish.click();
    await d
      .getByText(
        uiName("The request could not be completed. Please try again."),
        { exact: true },
      )
      .waitFor();
    assert.equal(
      await d.locator('form input[type="checkbox"]:checked').count(),
      7,
    );
    let posts = 0;
    d.on("request", (req) => {
      if (req.url() === base + "/api/donations" && req.method() === "POST")
        posts++;
    });
    const posted = d.waitForResponse(
      (res) =>
        res.url() === base + "/api/donations" &&
        res.request().method() === "POST",
    );
    await publish.evaluate((button) => {
      button.click();
      button.click();
    });
    const response = await posted;
    assert.equal(response.status(), 201, await response.text());
    const donation = (await response.json()).donation;
    assert.equal(posts, 1);
    assert.equal(await prisma.donation.count({ where: { title } }), 1);
    await d
      .getByRole("button", { name: uiName("ধন্যবাদ, সম্পন্ন"), exact: true })
      .click();
    await d
      .getByText("Post saved", { exact: true })
      .waitFor({ state: "hidden" });
    await snapshot(d, "post-published");
    assert.equal((await d.locator("main").innerText()).includes("SMS"), false);
    await d
      .getByRole("link", { name: uiName("লাইভ ট্র্যাকিং পেজে যান"), exact: true })
      .click();
    await d.getByTestId("rescue-next-action").waitFor();
    const n = await contextFor("ngo", ngo);
    await n.goto("/ngo/discover?q=" + encodeURIComponent(title), {
      waitUntil: "networkidle",
    });
    const card = n.locator(`[data-donation-id="${donation.id}"]`);
    await card.waitFor();
    await card.getByRole("link").first().click();
    await n
      .getByRole("button", { name: "Claim donation", exact: true })
      .waitFor();
    await snapshot(n, "ngo-donation");
    await n
      .getByRole("button", { name: "Claim donation", exact: true })
      .click();
    const dialog = n.getByRole("dialog");
    await dialog
      .getByRole("button", { name: "Keep browsing", exact: true })
      .click();
    assert.equal(
      await prisma.claim.count({ where: { donationId: donation.id } }),
      0,
    );
    await n
      .getByRole("button", { name: "Claim donation", exact: true })
      .click();
    await dialog
      .getByRole("button", { name: "Confirm claim", exact: true })
      .evaluate((button) => {
        button.click();
        button.click();
      });
    await dialog.waitFor({ state: "hidden" });
    const claim = await prisma.claim.findFirstOrThrow({
      where: { donationId: donation.id },
    });
    assert.equal(
      await prisma.claim.count({ where: { donationId: donation.id } }),
      1,
    );
    await n.reload({ waitUntil: "networkidle" });
    await n
      .getByRole("link", { name: "Continue to claim", exact: true })
      .click();
    await n.getByTestId("rescue-next-action").waitFor();
    await snapshot(n, "ngo-claimed");
    const v = await contextFor("volunteer", volunteer);
    await v.goto("/volunteer/dispatches", { waitUntil: "networkidle" });
    const dispatch = v.locator(`[data-dispatch-id="${claim.id}"]`);
    await dispatch
      .getByRole("button", { name: "Accept mission", exact: true })
      .waitFor();
    assert.equal(
      await dispatch
        .getByRole("button", { name: "Accept mission", exact: true })
        .isDisabled(),
      true,
    );
    await snapshot(v, "dispatch-duty-off");
    await v.getByRole("switch").click();
    await v.getByRole("switch", { checked: true }).waitFor();
    await v.route(
      "**/api/dispatches",
      async (route) => {
        if (route.request().method() !== "POST") return route.continue();
        const assigned = await route.fetch();
        assert.equal(assigned.status(), 200);
        await route.abort("failed");
      },
      { times: 1 },
    );
    let assignments = 0;
    v.on("request", (req) => {
      if (req.url() === base + "/api/dispatches" && req.method() === "POST")
        assignments++;
    });
    await dispatch
      .getByRole("button", { name: "Accept mission", exact: true })
      .evaluate((button) => {
        button.click();
        button.click();
      });
    await v.waitForURL(`**/volunteer/missions/mission-${claim.id}`);
    await v.getByTestId("rescue-next-action").waitFor();
    assert.equal(assignments, 1);
    assert.equal(
      (await prisma.claim.findUniqueOrThrow({ where: { id: claim.id } }))
        .volunteerProfileId,
      (
        await prisma.volunteerProfile.findUniqueOrThrow({
          where: { userId: unique },
        })
      ).id,
    );
    assert.deepEqual(errors, []);
    await writeFile(
      artifacts + "/start-results.json",
      JSON.stringify(
        {
          layouts,
          errors,
          checks: [
            "draft restore",
            "publish retry",
            "one publish",
            "claim confirmation",
            "duty gate",
            "lost assignment response recovery",
          ],
        },
        null,
        2,
      ),
    );
    return { donor, ngo, volunteer, claim, donation, volunteerUser };
  } catch (error) {
    for (const [role, page] of Object.entries(pages))
      if (!page.isClosed()) {
        await page
          .screenshot({
            path: `${artifacts}/failure-${role}.png`,
            fullPage: true,
          })
          .catch(() => {});
        await writeFile(
          `${artifacts}/failure-${role}.txt`,
          (await page.locator("body").innerText()) + "\n" + page.url(),
        ).catch(() => {});
      }
    throw error;
  } finally {
    await browser.close();
  }
}
