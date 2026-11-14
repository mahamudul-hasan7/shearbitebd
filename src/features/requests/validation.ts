import { PriorityLevel } from "@/lib/constants/domain";
import type { FoodRequestDraft, FoodRequestDraftErrors, RequestWizardStep } from "@/features/requests/types";

function required(value: string, message: string) {
  return value.trim() ? undefined : message;
}

function clean(errors: FoodRequestDraftErrors) {
  return Object.fromEntries(Object.entries(errors).filter(([, value]) => Boolean(value))) as FoodRequestDraftErrors;
}

const stepFields: Record<RequestWizardStep, Array<keyof FoodRequestDraft>> = {
  1: ["title", "requestType", "priority", "priorityReason", "purpose", "recipientType"],
  2: ["categories", "dietaryTypes", "specificPreferences", "allergensOrRestrictions"],
  3: ["peopleToServe", "mealsNeeded", "neededWhen", "neededBy", "preferredTimeSlot", "notes"],
  4: ["deliveryAddressId", "locationType", "addressLine", "area", "city", "landmark", "locationInstructions"],
  5: [],
};
const textLimits: Partial<Record<keyof FoodRequestDraft, number>> = {
  title: 160, priorityReason: 1000, purpose: 2000, recipientType: 200,
  specificPreferences: 1000, preferredTimeSlot: 200, notes: 2000, locationInstructions: 1000,
};

export function foodRequestErrorStep(errors: FoodRequestDraftErrors) {
  return ([1, 2, 3, 4] as const).find((step) => stepFields[step].some((field) => errors[field]));
}

export function validateFoodRequestStep(step: RequestWizardStep, draft: FoodRequestDraft): FoodRequestDraftErrors {
  const errors: FoodRequestDraftErrors = {};

  if (step === 1) {
    errors.title = required(draft.title, "Enter a request title.");
    errors.purpose = required(draft.purpose, "Explain how the food will be used.");
    errors.recipientType = required(draft.recipientType, "Enter the intended recipient group.");
    if ((draft.priority === PriorityLevel.HIGH || draft.priority === PriorityLevel.URGENT) && draft.priorityReason.trim().length < 12) {
      errors.priorityReason = "Explain the high priority in at least twelve characters.";
    }
  }

  if (step === 2) {
    if (draft.categories.length === 0) errors.categories = "Select at least one food category.";
    if (draft.dietaryTypes.length === 0) errors.dietaryTypes = "Select at least one dietary preference.";
  }

  if (step === 3) {
    const people = Number(draft.peopleToServe);
    const meals = Number(draft.mealsNeeded);
    if (!draft.peopleToServe.trim() || !Number.isInteger(people) || people <= 0) errors.peopleToServe = "Enter a positive whole number.";
    if (!draft.mealsNeeded.trim() || !Number.isInteger(meals) || meals <= 0) errors.mealsNeeded = "Enter a positive whole number.";
    const neededBy = Date.parse(draft.neededBy);
    if (!Number.isFinite(neededBy)) errors.neededBy = "Enter a valid requested date and time.";
    else if (neededBy <= Date.now()) errors.neededBy = "Requested time must be in the future.";
    else if (neededBy > Date.now() + 90 * 86_400_000) errors.neededBy = "Choose a requested time within 90 days.";
    if (people > meals) errors.mealsNeeded = "Record at least one requested meal per person.";
  }

  if (step === 4) {
    errors.deliveryAddressId = required(draft.deliveryAddressId, "Select an owned saved address.");
    errors.addressLine = required(draft.addressLine, "Enter the full delivery address.");
    errors.area = required(draft.area, "Enter the delivery area.");
    errors.city = required(draft.city, "Enter the city.");
  }

  for (const field of stepFields[step]) {
    const max = textLimits[field], value = draft[field];
    if (max && typeof value === "string" && value.length > max) errors[field] = `Use ${max} characters or fewer.`;
  }
  return clean(errors);
}

export function validateCompleteFoodRequest(draft: FoodRequestDraft) {
  return ([1, 2, 3, 4] as RequestWizardStep[]).reduce<FoodRequestDraftErrors>(
    (allErrors, step) => ({ ...allErrors, ...validateFoodRequestStep(step, draft) }),
    {},
  );
}

export function hasFoodRequestErrors(errors: FoodRequestDraftErrors) {
  return Object.values(errors).some(Boolean);
}
