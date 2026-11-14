import type { DonationDraft, DonationDraftErrors, DonationWizardStep } from "@/features/donations/types";
import { validateBangladeshPhone, validateEmail } from "@/features/auth/validation";
import { validateDonationTimes } from "@/lib/validators/date-time";

function required(value: string, message: string) {
  return value.trim() ? undefined : message;
}

function clean(errors: DonationDraftErrors) {
  return Object.fromEntries(Object.entries(errors).filter(([, value]) => Boolean(value))) as DonationDraftErrors;
}

const textLimits: Partial<Record<keyof DonationDraft, number>> = {
  title: 160, description: 2000, specialInstructions: 1000,
  approximateArea: 200, contactPerson: 120, phone: 30, directions: 1000,
};

export function validateDonationWizardStep(step: DonationWizardStep, draft: DonationDraft): DonationDraftErrors {
  const errors: DonationDraftErrors = {};

  if (step === 1) {
    errors.title = required(draft.title, "Enter a food title.");
    const quantity = Number(draft.quantity);
    if (!draft.quantity.trim() || !Number.isFinite(quantity) || quantity <= 0) errors.quantity = "Enter a positive quantity.";
    errors.allergenInfo = required(draft.allergenInfo, "List allergens or enter ‘None known’.");
    errors.description = required(draft.description, "Describe the food and packaging condition.");
  }

  if (step === 2) {
    errors.preparationTime = required(draft.preparationTime, "Enter the preparation date and time.");
    errors.safePickupDeadline = required(draft.safePickupDeadline, "Enter the safe pickup deadline.");
    const preparation = Date.parse(draft.preparationTime);
    const deadline = Date.parse(draft.safePickupDeadline);
    if (!Number.isFinite(preparation)) errors.preparationTime = "Enter a valid preparation date and time.";
    if (!Number.isFinite(deadline)) errors.safePickupDeadline = "Enter a valid safe pickup deadline.";
    if (Number.isFinite(preparation) && Number.isFinite(deadline) && preparation >= deadline) errors.safePickupDeadline = "Safe pickup deadline must be after preparation time.";
    if (Number.isFinite(deadline) && deadline <= Date.now()) errors.safePickupDeadline = "Safe pickup deadline must be in the future.";
  }

  if (step === 4) {
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

  if (step === 5) {
    if (!draft.freshlyPrepared) errors.freshlyPrepared = "Confirm how the food was prepared.";
    if (!draft.properlyCovered) errors.properlyCovered = "Confirm that the food is properly covered.";
    if (!draft.noVisibleSpoilage) errors.noVisibleSpoilage = "Confirm that there are no visible signs of spoilage.";
    if (!draft.storedSafely) errors.storedSafely = "Confirm the declared storage condition.";
    if (!draft.allergensCompleted) errors.allergensCompleted = "Confirm that allergen information is complete.";
    if (!draft.realisticDeadline) errors.realisticDeadline = "Confirm that the pickup deadline is realistic.";
    if (!draft.accuracyConfirmed) errors.accuracyConfirmed = "Confirm that the submitted information is accurate.";
  }

  for (const field of stepFields[step === 6 ? 5 : step]) {
    const max = textLimits[field];
    const value = draft[field];
    if (max && typeof value === "string" && value.length > max) errors[field] = `Use ${max} characters or fewer.`;
  }

  return clean(errors);
}

export function hasDonationDraftErrors(errors: DonationDraftErrors) {
  return Object.values(errors).some(Boolean);
}

const stepFields: Record<1 | 2 | 3 | 4 | 5, Array<keyof DonationDraft>> = {
  1: ["title", "category", "dietaryType", "quantity", "quantityUnit", "allergenInfo", "description"],
  2: ["preparationTime", "safePickupDeadline", "storageCondition", "foodCondition"],
  3: ["photoUrls", "sampleImageId"],
  4: ["addressId", "pickupAddress", "approximateArea", "contactPerson", "phone", "email", "pickupWindowStart", "pickupWindowEnd", "directions", "specialInstructions"],
  5: ["freshlyPrepared", "properlyCovered", "noVisibleSpoilage", "storedSafely", "allergensCompleted", "realisticDeadline", "accuracyConfirmed"],
};

export function donationErrorStep(errors: DonationDraftErrors): 1 | 2 | 3 | 4 | 5 | undefined {
  return ([1, 2, 3, 4, 5] as const).find((step) => stepFields[step].some((field) => errors[field]));
}

export function validateDonationDraft(draft: DonationDraft): DonationDraftErrors {
  return Object.assign({}, ...([1, 2, 3, 4, 5] as const).map((step) => validateDonationWizardStep(step, draft)));
}
