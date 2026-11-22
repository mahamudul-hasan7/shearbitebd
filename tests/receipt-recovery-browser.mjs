import assert from "node:assert/strict";
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { uiLabel } from "./ui-labels.mjs";
export async function receiptRecoveryChecks({ base, prisma, deliveredRescue }) {
  const browser = await chromium.launch({
    headless: true,
    args: process.env.RUN_LAN_BROWSER === "1" ? ["--proxy-server=direct://", "--proxy-bypass-list=*"] : [],
    ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
      : { channel: process.env.PLAYWRIGHT_CHANNEL || undefined }),
  });
  const artifacts = ".local-postgres/receipt-recovery";
  await mkdir(artifacts, { recursive: true });
  const errors = [],
    checks = [];
  try {
    for (const [language, width, damaged] of [
      ["en", 390, false],
      ["bn", 320, true],
      ["en", 1440, false],
    ]) {
      const rescue = await deliveredRescue(),
        context = await browser.newContext({
          baseURL: base,
          viewport: { width, height: 1000 },
          timezoneId: "Asia/Dhaka",
        });
      await context.addInitScript(
        (lang) => localStorage.setItem("sharebite_preferred_lang", lang),
        language,
      );
      const [name, value] = rescue.ngo.split("=");
      await context.addCookies([
        { name, value, url: base, httpOnly: true, sameSite: "Lax" },
      ]);
      const page = await context.newPage();
      page.on("pageerror", (e) => errors.push(e.message));
      const t = (source) => uiLabel(source, language);
      const path = `/ngo/claims/${rescue.claim.id}/confirm-delivery`;
      await page.route(
        "**/api/deliveries?*",
        (route) =>
          route.fulfill({
            status: 503,
            contentType: "application/json",
            body: JSON.stringify({
              error: "The request could not be completed. Please try again.",
            }),
          }),
        { times: 1 },
      );
      await page.goto(path, { waitUntil: "networkidle" });
      await page
        .getByText(t("Receipt details could not load"), { exact: true })
        .waitFor();
      assert.equal(
        await page
          .getByRole("button", { name: t("Save receipt"), exact: true })
          .count(),
        0,
      );
      await page
        .getByRole("button", { name: t("Try again"), exact: true })
        .click();
      const save = page.getByRole("button", {
        name: t("Save receipt"),
        exact: true,
      });
      await save.waitFor();
      const quantity = page.locator('[name="actualQuantity"]');
      await quantity.fill("0");
      await save.click();
      assert.equal(await quantity.getAttribute("aria-invalid"), "true");
      assert.equal(
        await quantity.evaluate((el) => el === document.activeElement),
        true,
      );
      await quantity.fill("18");
      await save.click();
      const mismatch = page.locator('[name="quantityMismatchConfirmed"]');
      assert.equal(await mismatch.getAttribute("aria-invalid"), "true");
      await mismatch.check();
      if (damaged) {
        await page
          .getByRole("combobox", { name: new RegExp(t("Food condition")) })
          .selectOption("DAMAGED_POOR");
        await save.click();
        assert.equal(
          await page.locator('[name="notes"]').getAttribute("aria-invalid"),
          "true",
        );
        await page
          .locator('[name="notes"]')
          .fill(
            "Packaging damaged; food appears spoiled and must not be distributed.",
          );
      }
      await page.route(
        "**/api/deliveries",
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
      await save.click();
      await page
        .getByText(t("The request could not be completed. Please try again."), {
          exact: true,
        })
        .waitFor();
      assert.equal(await quantity.inputValue(), "18");
      assert.equal(await mismatch.isChecked(), true);
      let writes = 0;
      page.on("request", (req) => {
        if (req.url() === base + "/api/deliveries" && req.method() === "POST")
          writes++;
      });
      await page.route(
        "**/api/deliveries",
        async (route) => {
          if (route.request().method() !== "POST") return route.continue();
          const result = await route.fetch();
          assert.equal(result.status(), 201);
          await route.abort("failed");
        },
        { times: 1 },
      );
      await save.evaluate((button) => {
        button.click();
        button.click();
      });
      await page
        .getByRole("heading", { name: t("Receipt saved"), exact: true })
        .waitFor();
      assert.equal(writes, 1);
      assert.equal(
        await prisma.deliveryReceipt.count({
          where: { claimId: rescue.claim.id },
        }),
        1,
      );
      assert.equal(
        await prisma.impactRecord.count({
          where: { claimId: rescue.claim.id },
        }),
        0,
      );
      const distribution = page.getByRole("link", {
        name: t("Record distribution"),
        exact: true,
      });
      if (damaged) {
        assert.equal(await distribution.count(), 0);
        await page
          .getByRole("link", {
            name: t("Report a food safety concern"),
            exact: true,
          })
          .waitFor();
      } else await distribution.waitFor();
      await page.reload({ waitUntil: "networkidle" });
      await page
        .getByRole("heading", { name: t("Receipt saved"), exact: true })
        .waitFor();
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
      await page.screenshot({
        path: `${artifacts}/saved-${language}-${width}.png`,
        fullPage: true,
      });
      checks.push({ language, width, damaged });
      await context.close();
    }
    assert.deepEqual(errors, []);
    await writeFile(
      artifacts + "/results.json",
      JSON.stringify({ checks, errors }, null, 2),
    );
  } finally {
    await browser.close();
  }
}
