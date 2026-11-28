import assert from "node:assert/strict";
import { chromium } from "playwright";
import { uiName } from "./ui-labels.mjs";

export async function runLintRegressionChecks(h) {
  const { base, prisma, login, assignedRescue, deliveredRescue, newFoodRequest, handover, issue, jsonResult } = h;
  const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH });
  const errors = [];
  async function pageFor(cookie, width = 390) {
    const context = await browser.newContext({ baseURL: base, viewport: { width, height: 900 } });
    await context.addInitScript(() => localStorage.setItem("sharebite_preferred_lang", "en"));
    const [name, value] = cookie.split("=");
    await context.addCookies([{ name, value, url: base, httpOnly: true, sameSite: "Lax" }]);
    const page = await context.newPage();
    page.on("pageerror", error => errors.push(error.message));
    return page;
  }
  try {
    // Preferences hydrate from the correct role and still work when storage is full.
    const donor = (await login()).cookie, ngo = (await login("NGO")).cookie;
    const settings = await pageFor(donor);
    await settings.goto("/donor/settings", { waitUntil: "domcontentloaded" });
    const preference = settings.getByRole("switch", { name: uiName("Live in-app rescue updates"), exact: true });
    await preference.waitFor();
    await preference.click();
    assert.equal(await preference.getAttribute("aria-checked"), "false");
    await settings.reload({ waitUntil: "domcontentloaded" });
    await settings.getByRole("switch", { name: uiName("Live in-app rescue updates"), checked: false }).waitFor();
    await settings.evaluate(() => {
      const original = Storage.prototype.setItem;
      Storage.prototype.setItem = function(key, value) {
        if (key.startsWith("sharebite_alert_prefs_")) throw new DOMException("Full", "QuotaExceededError");
        return original.call(this, key, value);
      };
    });
    await preference.click();
    assert.equal(await preference.getAttribute("aria-checked"), "true");
    const [name, value] = ngo.split("=");
    await settings.context().addCookies([{ name, value, url: base, httpOnly: true, sameSite: "Lax" }]);
    await settings.goto("/ngo/settings", { waitUntil: "domcontentloaded" });
    await settings.getByRole("switch", { name: uiName("Live in-app rescue updates"), checked: true }).waitFor();
    await settings.context().close();

    // Team loading failure is recoverable on returning to the page.
    const n = await pageFor(ngo, 1280);
    await n.route("**/api/ngo/team", route => route.fulfill({ status: 503, json: { error: "Team list could not load." } }));
    await n.goto("/ngo/team", { waitUntil: "domcontentloaded" });
    await n.getByRole("alert").waitFor();
    await n.unroute("**/api/ngo/team");
    await n.reload({ waitUntil: "domcontentloaded" });
    await n.getByRole("textbox", { name: uiName("Full name"), exact: true }).fill("Lint review coordinator");
    await n.getByRole("textbox", { name: uiName("Email address"), exact: true }).fill("lint-coordinator@example.test");
    await n.locator('form button[type="submit"]').click();
    await n.getByText("Lint review coordinator", { exact: true }).waitFor();
    await n.getByRole("button", { name: uiName("Remove") + " Lint review coordinator", exact: true }).click();
    await n.getByText("Lint review coordinator", { exact: true }).waitFor({ state: "hidden" });

    const created = await newFoodRequest(ngo, { title: "Lint regression food request" });
    assert.equal(created.response.status, 201);
    await n.goto("/ngo/requests/submitted?id=" + created.body.request.id, { waitUntil: "domcontentloaded" });
    await n.getByRole("heading", { name: "Lint regression food request", exact: true }).waitFor();
    await n.goto("/ngo/requests/submitted?id=missing-request", { waitUntil: "domcontentloaded" });
    await n.getByText(uiName("Request details could not load"), { exact: true }).waitFor();
    assert.equal(await n.getByRole("heading", { name: "Lint regression food request", exact: true }).count(), 0);
    await n.goto("/ngo/requests/submitted", { waitUntil: "domcontentloaded" });
    await n.getByRole("heading", { name: uiName("Request reference"), exact: true }).waitFor();

    // An aborted road response must not restore a route after its destination disappears.
    await prisma.address.updateMany({ where: { ownerId: "test-DONOR" }, data: { latitude: 23.781, longitude: 90.421 } });
    await prisma.address.updateMany({ where: { ownerId: "test-NGO" }, data: { latitude: 23.79, longitude: 90.42 } });
    const mapped = await assignedRescue();
    let roadRequests = 0, releaseOldRoad;
    await n.route("https://tile.openstreetmap.org/**", route => route.abort());
    await n.route("https://router.project-osrm.org/**", async route => {
      roadRequests++;
      if (roadRequests === 2) await new Promise(resolve => { releaseOldRoad = resolve; });
      await route.fulfill({ json: { routes: [{ distance: 3200, duration: 480, geometry: { coordinates: [[90.421, 23.781], [90.422, 23.785], [90.42, 23.79]] } }] } }).catch(() => {});
    });
    await n.goto("/ngo/claims/" + mapped.claim.id, { waitUntil: "domcontentloaded" });
    await n.getByText("Map & saved handover locations", { exact: true }).click();
    const map = n.getByRole("region", { name: uiName("Rescue locations"), exact: true });
    await map.getByText(uiName("Road route (OSRM)"), { exact: false }).waitFor();
    await prisma.donation.update({ where: { id: mapped.donation.id }, data: { pickupLatitude: 23.78 } });
    await n.getByRole("button", { name: uiName("Refresh"), exact: true }).click();
    await map.getByText(uiName("Estimated route"), { exact: false }).waitFor();
    const claim = await prisma.claim.findUniqueOrThrow({ where: { id: mapped.claim.id } });
    const destination = { ...claim.deliveryAddressSnapshot };
    delete destination.coordinates;
    await prisma.claim.update({ where: { id: claim.id }, data: { deliveryAddressSnapshot: destination } });
    await n.getByRole("button", { name: uiName("Refresh"), exact: true }).click();
    await map.getByText(uiName("Estimated route"), { exact: false }).waitFor({ state: "hidden" });
    assert.equal(typeof releaseOldRoad, "function");
    releaseOldRoad();
    assert.equal(await map.getByText(uiName("Road route (OSRM)"), { exact: false }).count(), 0);

    // Camera callbacks must use the latest handover stage while the scanner stays open.
    const rescue = await assignedRescue();
    await prisma.claim.update({ where: { id: rescue.claim.id }, data: { routeStage: "at_pickup" } });
    const rider = await pageFor(rescue.volunteer);
    await rider.addInitScript(() => {
      Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: { getUserMedia: async () => new MediaStream() } });
      window.BarcodeDetector = class {
        async detect() {
          const code = window.lintScanCode;
          window.lintScanCode = undefined;
          return code ? [{ rawValue: code }] : [];
        }
      };
    });
    await rider.goto("/volunteer/missions/mission-" + rescue.claim.id, { waitUntil: "domcontentloaded" });
    await rider.getByRole("button", { name: uiName("Scan handover QR"), exact: true }).click();
    await rider.getByRole("dialog").getByText(uiName("Camera active. Point at Donor/NGO QR code or paste payload below."), { exact: true }).waitFor();
    assert.equal((await handover(rescue, rescue.volunteer, "verify", "PICKUP", await issue(rescue, "PICKUP"))).status, 200);
    await jsonResult("/api/missions", { cookie: rescue.volunteer, method: "PATCH", body: { claimId: rescue.claim.id, stage: "en_route_dropoff" } });
    await rider.getByTestId("mission-handover").getByRole("heading", { name: uiName("Verify delivery code"), exact: true }).waitFor({ timeout: 15000 });
    const code = await issue(rescue, "DELIVERY");
    await rider.evaluate(value => { window.lintScanCode = value; }, code);
    await rider.getByRole("dialog").waitFor({ state: "hidden" });
    assert.equal(await rider.getByLabel(uiName("Six-digit handover code"), { exact: true }).inputValue(), code);
    await rider.getByRole("button", { name: uiName("Confirm delivery"), exact: true }).click();
    await rider.locator('[data-testid="rescue-progress"][data-phase="completed"]').waitFor();
    await rider.context().close();

    // The expiry warning appears as time passes, without a refresh of receipt details.
    const delivered = await deliveredRescue();
    await prisma.donation.update({ where: { id: delivered.donation.id }, data: { safePickupDeadline: new Date(Date.now() + 8000) } });
    await n.goto("/ngo/claims/" + delivered.claim.id + "/confirm-delivery", { waitUntil: "domcontentloaded" });
    await n.getByRole("button", { name: uiName("Save receipt"), exact: true }).waitFor();
    const deadlineWarning = n.getByRole("status").filter({ hasText: uiName("Safe food deadline passed") });
    assert.equal(await deadlineWarning.count(), 0);
    await deadlineWarning.waitFor({ timeout: 15000 });
    assert.equal(await n.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    assert.deepEqual(errors, []);
    console.log("Lint regressions passed: role preferences, storage failure, team CRUD, request loading, stale road response, latest QR stage and live expiry.");
  } finally {
    await browser.close();
  }
}
