import type { DonationDraft, DonationDraftErrors, DonationWizardStep } from "@/features/donations/types";
import { validateBangladeshPhone, validateEmail } from "@/features/auth/validation";
import { validateDonationTimes } from "@/lib/validators/date-time";

function required(value: string, message: string) {
  return value.trim() ? undefined : message;
}

function clean(errors: DonationDraftErrors) {
  return Object.fromEntries(Object.entries(errors).filter(([, value]) => Boolean(value))) as DonationDraftErrors;
}

export function validateDonationWizardStep(step: DonationWizardStep, draft: DonationDraft): DonationDraftErrors {
  const errors: DonationDraftErrors = {};

  if (step === 1) {
    errors.title = required(draft.title, "Enter a food title.");
    const quantity = Number(draft.quantity);
    if (!draft.quantity.trim() || !Number.isFinite(quantity) || quantity <= 0) errors.quantity = "Enter a positive quantity.";
    errors.preparationTime = required(draft.preparationTime, "Enter the preparation date and time.");
    errors.safePickupDeadline = required(draft.safePickupDeadline, "Enter the safe pickup deadline.");
    errors.allergenInfo = required(draft.allergenInfo, "List allergens or enter ‘None known’.");
    errors.description = required(draft.description, "Describe the food and packaging condition.");

    const preparation = Date.parse(draft.preparationTime);
    const deadline = Date.parse(draft.safePickupDeadline);
    if (!Number.isFinite(preparation)) errors.preparationTime = "Enter a valid preparation date and time.";
    if (!Number.isFinite(deadline)) errors.safePickupDeadline = "Enter a valid safe pickup deadline.";
    if (Number.isFinite(preparation) && Number.isFinite(deadline) && preparation > deadline) errors.safePickupDeadline = "Safe pickup deadline must be after preparation time.";
    if (Number.isFinite(deadline) && deadline <= Date.now()) errors.safePickupDeadline = "Safe pickup deadline must be in the future.";
  }

  if (step === 2) {
    errors.addressId = required(draft.addressId, "Select a saved pickup address.");
    errors.pickupAddress = required(draft.pickupAddress, "Enter a pickup address.");
    errors.approximateArea = required(draft.approximateArea, "Enter the approximate public pickup area.");
    errors.contactPerson = required(draft.contactPerson, "Enter the pickup contact person.");
    errors.phone = validateBangladeshPhone(draft.phone);
    if (draft.email.trim()) errors.email = validateEmail(draft.email);

    const timeErrors = validateDonationTimes({
      preparationTime: draft.preparationTime,
      safePickupDeadline: draft.safePickupDeadline,
      pickupWindowStart: draft.pickupWindowStart,
      pickupWindowEnd: draft.pickupWindowEnd,
    });
    errors.preparationTime = timeErrors.preparationTime;
    errors.safePickupDeadline = timeErrors.safePickupDeadline;
    errors.pickupWindowStart = timeErrors.pickupWindowStart;
    errors.pickupWindowEnd = timeErrors.pickupWindowEnd;
  }

  if (step === 3) {
    if (!draft.freshlyPrepared) errors.freshlyPrepared = "Confirm how the food was prepared.";
    if (!draft.properlyCovered) errors.properlyCovered = "Confirm that the food is properly covered.";
    if (!draft.noVisibleSpoilage) errors.noVisibleSpoilage = "Confirm that there are no visible signs of spoilage.";
    if (!draft.storedSafely) errors.storedSafely = "Confirm the declared storage condition.";
    if (!draft.allergensCompleted) errors.allergensCompleted = "Confirm that allergen information is complete.";
    if (!draft.realisticDeadline) errors.realisticDeadline = "Confirm that the pickup deadline is realistic.";
    if (!draft.accuracyConfirmed) errors.accuracyConfirmed = "Confirm that the submitted information is accurate.";
  }

  return clean(errors);
}

export function hasDonationDraftErrors(errors: DonationDraftErrors) {
  return Object.values(errors).some(Boolean);
}
