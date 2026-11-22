import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { PDFDocument } from "pdf-lib";
import {
  sampleVerificationPdf,
  sampleVerificationImage,
} from "./verification-fixtures.mjs";

export async function runVerificationBrowserChecks({ prisma, login, base }) {
  const artifacts = ".local-postgres/verification-browser";
  await mkdir(artifacts, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    args: process.env.RUN_LAN_BROWSER === "1" ? ["--proxy-server=direct://", "--proxy-bypass-list=*"] : [],
    ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
      : { channel: process.env.PLAYWRIGHT_CHANNEL || undefined }),
  });
  const errors = [],
    layouts = [];
  const sample = await PDFDocument.load(await sampleVerificationPdf());
  sample
    .addPage([600, 420])
    .drawText("DEMO / SAMPLE - Second page", { x: 45, y: 330 });
  const pdf = Buffer.from(await sample.save()),
    png = await sampleVerificationImage();
  async function context(width = 1440) {
    const ctx = await browser.newContext({
      baseURL: base,
      viewport: { width, height: 1000 },
    });
    await ctx.addInitScript(() =>
      localStorage.setItem("sharebite_preferred_lang", "en"),
    );
    return ctx;
  }
  function watch(page) {
    page.on("pageerror", (error) => errors.push(error.message));
  }
  async function preview(page, kind, label) {
    const dialog = page.getByTestId("verification-preview");
    await dialog.waitFor();
    const content =
      kind === "pdf"
        ? dialog.locator('canvas[data-rendered="true"]')
        : dialog.getByRole("img", { name: "Uploaded verification document" });
    await content.waitFor();
    if (kind === "image") await content.evaluate((img) => img.decode());
    if (kind === "pdf") {
      await dialog
        .getByRole("button", { name: "Next document page", exact: true })
        .click();
      await dialog
        .getByRole("img", { name: "Verification document page 2", exact: true })
        .waitFor();
      await dialog
        .getByRole("button", { name: "Previous document page", exact: true })
        .click();
      await dialog
        .getByRole("img", { name: "Verification document page 1", exact: true })
        .waitFor();
    }
    assert.equal(await dialog.getByRole("alert").count(), 0);
    assert.equal(
      await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth),
      true,
    );
    await page.screenshot({
      path: `${artifacts}/${label}.png`,
      animations: "disabled",
    });
    const download = page.waitForEvent("download");
    await dialog
      .getByRole("link", { name: "Download document", exact: true })
      .click();
    assert.equal(await (await download).failure(), null);
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden" });
  }
  try {
    const adminContext = await context(390);
    const { cookie } = await login("ADMIN");
    const [name, value] = cookie.split("=");
    await adminContext.addCookies([
      { name, value, url: base, httpOnly: true, sameSite: "Lax" },
    ]);
    const admin = await adminContext.newPage();
    watch(admin);
    for (const [index, role] of ["ngo", "volunteer"].entries()) {
      const ctx = await context(role === "ngo" ? 390 : 1440);
      const page = await ctx.newPage();
      watch(page);
      await page.goto(`/register?role=${role}`, { waitUntil: "networkidle" });
      await page
        .getByText("Try sample registration details", { exact: true })
        .click();
      await page
        .getByRole("button", { name: "Fill sample details", exact: true })
        .click();
      const email = `document-browser-${role}@example.test`;
      const form = page.locator("form");
      await form.locator('[name="email"]').fill(email);
      await form.locator('[name="phone"]').fill(`0189900000${index}`);
      await form.getByRole("button", { name: "Continue", exact: true }).click();
      await form.locator('[name="address"]').waitFor();
      await form.getByRole("button", { name: "Continue", exact: true }).click();
      await form.locator('[name="terms"]').check();
      await form
        .getByRole("button", { name: "Create account", exact: true })
        .click();
      const panel = page.getByTestId("verification-panel");
      await panel
        .getByRole("button", { name: "Choose document", exact: true })
        .waitFor();
      assert.equal(
        await panel.getByText("Document needed", { exact: true }).count(),
        1,
      );
      const user = await prisma.user.findUniqueOrThrow({ where: { email } });
      const route = role === "ngo" ? "/ngo/verification" : "/volunteer/id-card";
      await panel
        .getByLabel("Choose verification document", { exact: true })
        .setInputFiles({
          name: "bad.txt",
          mimeType: "text/plain",
          buffer: Buffer.from("bad"),
        });
      await panel.getByRole("alert").waitFor();
      await panel
        .getByLabel("Choose verification document", { exact: true })
        .setInputFiles({
          name: "DEMO.pdf",
          mimeType: "application/pdf",
          buffer: pdf,
        });
      // A failed upload retains the selection and can be retried once.
      await page.route("**/api/verification", (route) =>
        route.request().method() === "POST"
          ? route.fulfill({
              status: 500,
              contentType: "application/json",
              body: JSON.stringify({
                error: "Could not save document. Please try again.",
              }),
            })
          : route.continue(),
      );
      await panel
        .getByRole("button", { name: "Submit document", exact: true })
        .click();
      await panel.getByRole("alert").waitFor();
      await page.unroute("**/api/verification");
      await panel
        .getByRole("button", { name: "Submit document", exact: true })
        .click();
      await panel
        .getByText("Document submitted. An administrator will review it.", {
          exact: true,
        })
        .waitFor();
      await panel
        .getByRole("button", { name: "Preview document", exact: true })
        .click();
      await preview(
        page,
        "pdf",
        `${role}-pdf-${role === "ngo" ? "mobile" : "desktop"}`,
      );
      await page.goto(route, { waitUntil: "networkidle" });
      for (const language of ["en", "bn"]) {
        await page
          .getByRole("button", {
            name: language === "en" ? "EN" : "বাংলা",
            exact: true,
          })
          .click();
        await page.waitForFunction(
          (lang) => document.documentElement.lang === lang,
          language,
        );
        for (const width of [320, 390, 768, 1440]) {
          await page.setViewportSize({ width, height: 1000 });
          await page.evaluate(() => document.fonts.ready);
          assert.equal(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
            true,
            `${role} ${language} ${width}`,
          );
          const small = await panel
            .locator("button")
            .evaluateAll((buttons) =>
              buttons
                .filter(
                  (b) =>
                    !b.disabled &&
                    b.getBoundingClientRect().height > 0 &&
                    b.getBoundingClientRect().height < 43,
                )
                .map((b) => b.textContent),
            );
          assert.deepEqual(
            small,
            [],
            "Verification controls need comfortable touch targets",
          );
          layouts.push({ role, language, width });
          if (width === 390 || width === 1440)
            await page.screenshot({
              path: `${artifacts}/${role}-${language}-${width}.png`,
              fullPage: true,
              animations: "disabled",
            });
        }
      }
      await page.getByRole("button", { name: "EN", exact: true }).click();
      await page.setViewportSize({ width: 390, height: 1000 });
      await admin.goto("/admin/accounts", { waitUntil: "networkidle" });
      const search = admin.getByRole("textbox", {
        name: "Search",
        exact: true,
      });
      await search.fill(email);
      await admin.getByRole("button", { name: "Search", exact: true }).click();
      await admin
        .getByRole("button", {
          name: `Review ${user.displayName}`,
          exact: true,
        })
        .click();
      const review = admin.getByRole("dialog", {
        name: "Account verification",
        exact: true,
      });
      await review
        .getByRole("button", { name: "Preview document", exact: true })
        .click();
      await preview(admin, "pdf", `${role}-admin-private-preview`);
      await review.getByLabel("Reject account", { exact: true }).check();
      await review
        .getByLabel("Review note", { exact: true })
        .fill("Please submit a clearer sample image.");
      await review
        .getByRole("button", { name: "Save review", exact: true })
        .click();
      await review.waitFor({ state: "hidden" });
      await panel
        .getByRole("button", {
          name: "Refresh verification status",
          exact: true,
        })
        .click();
      await panel
        .getByText("Please submit a clearer sample image.", { exact: true })
        .waitFor();
      await panel
        .getByLabel("Choose verification document", { exact: true })
        .setInputFiles({
          name: "DEMO-v2.png",
          mimeType: "image/png",
          buffer: png,
        });
      await panel
        .getByRole("img", { name: "Selected document preview", exact: true })
        .waitFor();
      await panel
        .getByRole("button", { name: "Submit updated document", exact: true })
        .click();
      await panel
        .getByText("Document submitted. An administrator will review it.", {
          exact: true,
        })
        .waitFor();
      await panel
        .getByRole("button", { name: "Preview document", exact: true })
        .click();
      await preview(page, "image", `${role}-image-mobile`);
      await admin.reload({ waitUntil: "networkidle" });
      await search.fill(email);
      await admin.getByRole("button", { name: "Search", exact: true }).click();
      await admin
        .getByRole("button", {
          name: `Review ${user.displayName}`,
          exact: true,
        })
        .click();
      await review
        .getByRole("button", { name: "Preview document", exact: true })
        .click();
      await preview(admin, "image", `${role}-admin-image-mobile`);
      await review
        .getByLabel("Review note", { exact: true })
        .fill(
          "Reviewed the replacement sample document for this project demo.",
        );
      await review
        .getByRole("button", { name: "Save review", exact: true })
        .click();
      await review.waitFor({ state: "hidden" });
      await panel
        .getByRole("button", {
          name: "Refresh verification status",
          exact: true,
        })
        .click();
      await panel
        .getByText(
          "Your account is verified. Your approved document is saved with the review.",
          { exact: true },
        )
        .waitFor();
      assert.equal(
        await panel
          .getByRole("button", { name: "Choose document", exact: true })
          .count(),
        0,
      );
      if (role === "volunteer") {
        await page.getByText(/^Account verification:\s*Verified$/).waitFor();
        await page.waitForFunction(
          () => !document.querySelector('[role="switch"]').disabled,
        );
        assert.equal(
          await page
            .getByText(
              "Volunteer verification is required before going on duty.",
              { exact: true },
            )
            .count(),
          0,
        );
      }
      const history = await prisma.accountReview.findMany({
        where: { targetUserId: user.id },
        orderBy: { createdAt: "asc" },
      });
      assert.equal(history.length, 2);
      assert.notEqual(
        history[0].verificationDocumentId,
        history[1].verificationDocumentId,
      );
      // A failed private preview displays a recoverable error, not a broken frame.
      await page.route("**/api/verification/documents/*", (route) =>
        route.fulfill({ status: 404 }),
      );
      await panel
        .getByRole("button", { name: "Preview document", exact: true })
        .click();
      await page
        .getByTestId("verification-preview")
        .getByRole("alert")
        .waitFor();
      await page.keyboard.press("Escape");
      await page.unroute("**/api/verification/documents/*");
      await page.screenshot({
        path: `${artifacts}/${role}-verified-mobile.png`,
        fullPage: true,
        animations: "disabled",
      });
      await ctx.close();
    }
    assert.deepEqual(errors, []);
    assert.equal(layouts.length, 16);
    console.log(
      "Verification browser: 16 responsive bilingual layouts; both registrations, PDF/image previews, downloads, retry, rejection, resubmission and approval passed.",
    );
  } finally {
    await browser.close();
  }
}
