import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

export async function runDiscoveryBrowserChecks({
  prisma,
  request,
  login,
  mapAddress,
  mapDonation,
  seedUser,
  fixturePassword,
  base,
}) {
  const artifacts = ".local-postgres/discovery-browser";
  await mkdir(artifacts, { recursive: true });
  const id = "discovery-owner",
    email = id + "@example.test";
  await seedUser({
    id,
    email,
    role: "NGO",
    password: fixturePassword,
    displayName: "Community Care Foundation",
    phone: null,
    normalizedPhone: null,
  });
  await prisma.nGOProfile.update({
    where: { userId: id },
    data: { acceptedFoodCategories: ["COOKED_MEAL", "BAKERY"] },
  });
  const response = await request("/api/auth/login", {
    method: "POST",
    body: { email, password: fixturePassword },
  });
  assert.equal(response.status, 200);
  const cookie = response.headers.get("set-cookie").split(";")[0],
    donor = (await login()).cookie;
  const origin = await mapAddress(cookie, "Community centre", {
    latitude: 23.79,
    longitude: 90.42,
  });
  assert.equal(
    (
      await request("/api/profile", {
        cookie,
        method: "POST",
        body: { action: "setPrimaryAddress", id: origin.id },
      })
    ).status,
    200,
  );
  const nearAddress = await mapAddress(donor, "Private pickup", {
    latitude: 23.781234,
    longitude: 90.421234,
  });
  const farAddress = await mapAddress(donor, "Other area pickup", {
    latitude: 23.85,
    longitude: 90.45,
  });
  const unknownAddress = await mapAddress(donor, "No pin pickup", null);
  async function food(title, address, category = "COOKED_MEAL", minutes = 240) {
    const result = await mapDonation(donor, address, {
      title,
      description: "Donor notes remain unchanged across languages.",
      category,
      quantity: { value: 60, unit: "MEALS", estimatedMeals: 60 },
      safePickupDeadline: new Date(Date.now() + 6 * 3_600_000).toISOString(),
      pickup: {
        windowEnd: new Date(Date.now() + minutes * 60_000).toISOString(),
      },
      allergens: ["Milk", "Egg"],
      sampleImageId: "meal-trays",
    });
    assert.equal(result.response.status, 201, JSON.stringify(result.body));
    return result.body.donation;
  }
  const near = await food("Rice, chicken curry, and vegetables", nearAddress),
    urgent = await food("Community lunch boxes", farAddress, "COOKED_MEAL", 90),
    bakery = await food(
      "Bread for tomorrow's community table",
      nearAddress,
      "BAKERY",
    ),
    unknown = await food("Meals without a location pin", unknownAddress),
    incompatible = await food(
      "Fresh fruit donation",
      nearAddress,
      "PRODUCE",
      30,
    );
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
      : { channel: process.env.PLAYWRIGHT_CHANNEL || undefined }),
  });
  const errors = [],
    layouts = [];
  let current;
  async function context(width = 1440, language = "en") {
    const ctx = await browser.newContext({
      baseURL: base,
      viewport: { width, height: 1000 },
    });
    const [name, value] = cookie.split("=");
    await ctx.addCookies([
      { name, value, url: base, httpOnly: true, sameSite: "Lax" },
    ]);
    await ctx.addInitScript(
      (lang) => localStorage.setItem("sharebite_preferred_lang", lang),
      language,
    );
    return ctx;
  }
  try {
    const ctx = await context();
    const page = await ctx.newPage();
    current = page;
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/ngo/discover", { waitUntil: "networkidle" });
    await page.getByTestId("discovery-card").first().waitFor();
    assert.equal(await page.getByTestId("discovery-card").count(), 5);
    assert.equal(
      await page
        .getByTestId("discovery-card")
        .first()
        .getAttribute("data-donation-id"),
      urgent.id,
      "Real deadlines should prioritize urgent accepted food",
    );
    assert.equal(
      await page
        .getByTestId("discovery-card")
        .last()
        .getAttribute("data-donation-id"),
      incompatible.id,
    );
    const nearCard = page.locator(`[data-donation-id="${near.id}"]`);
    await nearCard.getByText("Why this food fits", { exact: true }).click();
    await nearCard
      .getByText("This category is accepted.", { exact: false })
      .waitFor();
    const search = page.getByRole("search");
    await search.getByRole("searchbox").fill("missing-food");
    await search.getByRole("button", { name: "Search", exact: true }).click();
    await page
      .getByRole("heading", {
        name: "No food matches these filters",
        exact: true,
      })
      .waitFor();
    await page
      .getByRole("button", { name: "Clear search", exact: true })
      .click();
    await nearCard.waitFor();
    // Rapid changes must compose in the URL without dropping the first filter.
    await page.evaluate(() => {
      document
        .querySelector(
          '[aria-label="Quick food categories"] button:nth-child(3)',
        )
        .click();
      document
        .querySelector(
          'aside[aria-label="Desktop food filters"] button:nth-child(3)',
        )
        .click();
    });
    await page.waitForURL(
      (url) =>
        url.searchParams.get("category") === "BAKERY" &&
        url.searchParams.get("radius") === "5",
    );
    await page.locator(`[data-donation-id="${bakery.id}"]`).waitFor();
    assert.equal(await page.getByTestId("discovery-card").count(), 1);
    await page.getByRole("link", { name: "Map view", exact: true }).click();
    await page.waitForURL("**/ngo/discover/map?**");
    assert.equal(new URL(page.url()).searchParams.get("radius"), "5");
    await page
      .getByRole("region", {
        name: "Choose a donation on the map",
        exact: true,
      })
      .getByRole("button")
      .first()
      .waitFor();
    await page.getByRole("link", { name: "List view", exact: true }).click();
    await page.waitForURL((url) => url.pathname === "/ngo/discover");
    await page.reload({ waitUntil: "networkidle" });
    assert.equal(await page.getByTestId("discovery-card").count(), 1);
    await page
      .locator("aside")
      .getByRole("button", { name: "Reset filters", exact: true })
      .click();
    await page.locator(`[data-donation-id="${unknown.id}"]`).waitFor();
    // Keep original donor content intact when the interface language changes.
    await page.getByRole("button", { name: "বাংলা", exact: true }).click();
    await nearCard
      .getByRole("heading", { name: near.title, exact: true })
      .waitFor();
    await page.getByRole("button", { name: "EN", exact: true }).click();
    await nearCard
      .getByRole("button", {
        name: `Save donation: ${near.title}`,
        exact: true,
      })
      .click();
    await page.reload({ waitUntil: "networkidle" });
    assert.equal(
      await nearCard
        .getByRole("button", {
          name: `Remove saved donation: ${near.title}`,
          exact: true,
        })
        .getAttribute("aria-pressed"),
      "true",
    );
    for (const language of ["en", "bn"]) {
      await page
        .getByRole("button", {
          name: language === "en" ? "EN" : "বাংলা",
          exact: true,
        })
        .click();
      for (const width of [320, 390, 768, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        for (const mode of ["list", "map"]) {
          await page
            .getByRole("link", {
              name:
                language === "en"
                  ? mode === "list"
                    ? "List view"
                    : "Map view"
                  : mode === "list"
                    ? "তালিকা দেখুন"
                    : "ম্যাপ দেখুন",
              exact: true,
            })
            .click();
          await page.waitForURL(
            (url) =>
              url.pathname ===
              (mode === "list" ? "/ngo/discover" : "/ngo/discover/map"),
          );
          await page.getByTestId("discovery-card").first().waitFor();
          await page.evaluate(() => document.fonts.ready);
          assert.equal(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
            true,
            `${language} ${width} ${mode}`,
          );
          const small = await page
            .locator("main button, main a, main select")
            .evaluateAll((elements) =>
              elements
                .filter((el) => {
                  const r = el.getBoundingClientRect();
                  return (
                    r.width > 0 &&
                    r.height > 0 &&
                    r.height < 43 &&
                    !el.closest('[data-testid="location-map"]')
                  );
                })
                .map((el) => ({
                  text: el.textContent,
                  height: el.getBoundingClientRect().height,
                })),
            );
          assert.deepEqual(small, [], "Discovery actions must be easy to tap");
          layouts.push({ language, width, mode });
          if (width === 390 || width === 1440)
            await page.screenshot({
              path: `${artifacts}/${mode}-${language}-${width}.png`,
              fullPage: true,
              animations: "disabled",
            });
        }
      }
    }
    await page.getByRole("button", { name: "EN", exact: true }).click();
    await page.setViewportSize({ width: 390, height: 1000 });
    await page.getByRole("link", { name: "List view", exact: true }).click();
    await page.getByRole("button", { name: "Filters", exact: true }).click();
    const filterDialog = page.getByRole("dialog", {
      name: "Filter available food",
      exact: true,
    });
    await filterDialog
      .getByRole("button", { name: "5 km", exact: true })
      .click();
    await filterDialog
      .getByRole("button", { name: "Show 3 donations", exact: true })
      .waitFor();
    await page.screenshot({
      path: `${artifacts}/mobile-filters.png`,
      animations: "disabled",
    });
    await page.keyboard.press("Escape");
    await filterDialog.waitFor({ state: "hidden" });
    assert.equal(await page.getByTestId("discovery-card").count(), 3);
    await page
      .getByRole("button", { name: "Clear filters", exact: true })
      .click();
    await page
      .locator(`[data-donation-id="${near.id}"]`)
      .getByRole("link", { name: "View details & claim", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Claim donation", exact: true })
      .waitFor();
    assert.equal(
      await page.getByRole("timer").count(),
      1,
      "One clear collection clock per detail page",
    );
    let posts = 0;
    page.on("request", (r) => {
      if (r.url() === base + "/api/claims" && r.method() === "POST") posts++;
    });
    await page
      .getByRole("button", { name: "Claim donation", exact: true })
      .click();
    const confirmation = page.getByRole("dialog", {
      name: "Confirm your food claim",
      exact: true,
    });
    await confirmation.waitFor();
    assert.equal(posts, 0, "Opening a summary does not reserve food");
    await confirmation.getByText("Milk, Egg", { exact: true }).waitFor();
    await page.screenshot({
      path: `${artifacts}/mobile-claim-confirmation.png`,
      animations: "disabled",
    });
    await confirmation
      .getByRole("button", { name: "Keep browsing", exact: true })
      .click();
    assert.equal(posts, 0);
    await page
      .getByRole("button", { name: "Claim donation", exact: true })
      .click();
    let lostResponse = false;
    await page.route("**/api/claims", async (route) => {
      if (route.request().method() === "POST" && !lostResponse) {
        lostResponse = true;
        const response = await route.fetch();
        assert.equal(response.status(), 201);
        await route.abort("failed");
      } else await route.continue();
    });
    await confirmation
      .getByRole("button", { name: "Confirm claim", exact: true })
      .evaluate((button) => {
        button.click();
        button.click();
      });
    await confirmation.waitFor({ state: "hidden" });
    assert.equal(posts, 1);
    assert.equal(lostResponse, true);
    await page.unroute("**/api/claims");
    assert.equal(
      await prisma.claim.count({ where: { donationId: near.id } }),
      1,
    );
    const claim = await prisma.claim.findFirstOrThrow({
      where: { donationId: near.id },
    });
    await page
      .getByRole("link", { name: "Go to reservation", exact: true })
      .first()
      .click();
    await page.waitForURL(`**/ngo/claims/${claim.id}`);
    // A race is decided by the server and the UI keeps the actual error visible.
    await page.goto(`/ngo/donations/${urgent.id}`, {
      waitUntil: "networkidle",
    });
    await page
      .getByRole("button", { name: "Claim donation", exact: true })
      .click();
    await prisma.donation.update({
      where: { id: urgent.id },
      data: { windowEnd: new Date(Date.now() - 1000) },
    });
    await confirmation
      .getByRole("button", { name: "Confirm claim", exact: true })
      .click();
    await confirmation.getByRole("alert").waitFor();
    assert.equal(
      await prisma.claim.count({ where: { donationId: urgent.id } }),
      0,
    );
    await page.keyboard.press("Escape");
    await page.goto("/ngo/discover", { waitUntil: "networkidle" });
    assert.equal(
      await page.locator(`[data-donation-id="${urgent.id}"]`).count(),
      0,
    );
    // Feed expiry is driven by the real collection window without a page reload.
    const ending = await food("Collection ending now", nearAddress);
    await prisma.donation.update({
      where: { id: ending.id },
      data: { windowEnd: new Date(Date.now() + 6000) },
    });
    await page.reload({ waitUntil: "networkidle" });
    const endingCard = page.locator(`[data-donation-id="${ending.id}"]`);
    await endingCard.waitFor();
    await endingCard.waitFor({ state: "hidden", timeout: 12000 });
    // Last good results survive a refresh failure, with an explicit retry notice.
    await page.route("**/api/donations", (route) =>
      route.fulfill({
        status: 503,
        contentType: "application/json",
        body: '{"error":"Temporary outage"}',
      }),
    );
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await page
      .getByRole("alert")
      .filter({ hasText: "Could not refresh food" })
      .waitFor();
    assert.ok((await page.getByTestId("discovery-card").count()) > 0);
    await page.unroute("**/api/donations");
    await page.getByRole("button", { name: "Try again", exact: true }).click();
    await page
      .getByRole("alert")
      .filter({ hasText: "Could not refresh food" })
      .waitFor({ state: "hidden" });
    assert.equal(layouts.length, 16);
    assert.deepEqual(errors, []);
    console.log(
      "Discovery browser: 16 bilingual list/map layouts; filtering, URL persistence, real matching reasons, private pins, confirmation, single claim, expired-window rejection and refresh recovery passed.",
    );
    await ctx.close();
  } catch (error) {
    if (current && !current.isClosed()) {
      await current
        .screenshot({ path: `${artifacts}/failure.png`, fullPage: true })
        .catch(() => {});
      await writeFile(
        `${artifacts}/failure.txt`,
        (await current.locator("body").innerText()) + "\n" + current.url(),
      ).catch(() => {});
    }
    throw error;
  } finally {
    await browser.close();
  }
}
