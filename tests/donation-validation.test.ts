import assert from "node:assert/strict";
import { test } from "node:test";
import { createInitialDonationDraft, restoreDonationDraft } from "../src/features/donations/donation-draft";
import { donationErrorStep, validateDonationDraft, validateDonationWizardStep } from "../src/features/donations/validation";
import { validateDonationTimes } from "../src/lib/validators/date-time";

function completedDraft() {
  return {
    ...createInitialDonationDraft(), title: "Fresh rice", quantity: "20", description: "Covered meal boxes",
    allergenInfo: "None known", addressId: "owned-address", pickupAddress: "Pickup address", approximateArea: "Badda",
    contactPerson: "Food donor", phone: "01712345678", email: "donor@example.test",
    freshlyPrepared: true, properlyCovered: true, noVisibleSpoilage: true, storedSafely: true,
    allergensCompleted: true, realisticDeadline: true, accuracyConfirmed: true,
  };
}

test("a completed donation passes every step and final validation", () => {
  assert.deepEqual(validateDonationDraft(completedDraft()), {});
});

test("final submission sends an expired deadline back to time and storage, even with all declarations checked", () => {
  const draft = completedDraft();
  draft.safePickupDeadline = new Date(Date.now() - 60_000).toISOString();
  const errors = validateDonationDraft(draft);
  assert.ok(errors.safePickupDeadline);
  assert.equal(donationErrorStep(errors), 2);
  assert.deepEqual(validateDonationWizardStep(5, draft), {});
});

test("client and server identify pickup before preparation in the pickup field", () => {
  const draft = completedDraft();
  draft.pickupWindowStart = new Date(Date.parse(draft.preparationTime) - 60_000).toISOString();
  assert.equal(validateDonationTimes(draft).pickupWindowStart, "Pickup cannot start before food preparation.");
  assert.equal(donationErrorStep(validateDonationDraft(draft)), 4);
});

test("server field errors open the correct step, while a form error is not a checklist error", () => {
  assert.equal(donationErrorStep({ title: "Too long" }), 1);
  assert.equal(donationErrorStep({ pickupWindowEnd: "Too late", form: "Check pickup times" }), 4);
  assert.equal(donationErrorStep({ storedSafely: "Confirm storage" }), 5);
  assert.equal(donationErrorStep({ form: "Network failure" }), undefined);
});

test("server text limits are checked before publishing without rejecting the maximum", () => {
  const draft = completedDraft();
  draft.title = "x".repeat(161);
  assert.equal(donationErrorStep(validateDonationDraft(draft)), 1);
  draft.title = "x".repeat(160);
  assert.deepEqual(validateDonationDraft(draft), {});
});

test("restoring an expired food draft preserves the donor's preparation time and deadline", () => {
  const draft = { ...completedDraft(), ...createInitialDonationDraft(new Date("2020-01-01T06:00:00Z")) };
  const restored = restoreDonationDraft(draft);
  for (const field of ["preparationTime", "safePickupDeadline", "pickupWindowStart", "pickupWindowEnd"] as const) {
    assert.equal(restored[field], draft[field], `Restoring a draft must not silently change ${field}`);
  }
  assert.ok(validateDonationDraft(restored).safePickupDeadline);
});

test("short steps validate their own inputs and optional photos never block progress", () => {
  const draft = completedDraft();
  draft.safePickupDeadline = "invalid";
  assert.deepEqual(validateDonationWizardStep(1, draft), {});
  assert.ok(validateDonationWizardStep(2, draft).safePickupDeadline);
  assert.deepEqual(validateDonationWizardStep(3, draft), {});
  assert.equal(donationErrorStep({ photoUrls: "Invalid photo" }), 3);
  assert.equal(donationErrorStep({ safePickupDeadline: "Expired", accuracyConfirmed: "Confirm" }), 2);
});
