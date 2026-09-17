import { PriorityLevel } from "@/lib/constants/domain";
import type { FoodRequestDraft, FoodRequestDraftErrors, RequestWizardStep } from "@/features/requests/types";

function required(value: string, message: string) {
  return value.trim() ? undefined : message;
}

function clean(errors: FoodRequestDraftErrors) {
  return Object.fromEntries(Object.entries(errors).filter(([, value]) => Boolean(value))) as FoodRequestDraftErrors;
}

export function validateFoodRequestStep(step: RequestWizardStep, draft: FoodRequestDraft): FoodRequestDraftErrors {
  const errors: FoodRequestDraftErrors = {};

  if (step === 1) {
    errors.title = required(draft.title, "Enter a request title.");
    errors.purpose = required(draft.purpose, "Explain how the food will be used.");
    errors.recipientType = required(draft.recipientType, "Enter the intended recipient group.");
    if ((draft.priority === PriorityLevel.HIGH || draft.priority === PriorityLevel.URGENT) && !draft.priorityReason.trim()) {
      errors.priorityReason = "Explain why this request has high priority.";
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
    errors.preferredTimeSlot = required(draft.preferredTimeSlot, "Enter a preferred delivery time slot.");
  }

  if (step === 4) {
    errors.addressLine = required(draft.addressLine, "Enter the full delivery address.");
    errors.area = required(draft.area, "Enter the delivery area.");
    errors.city = required(draft.city, "Enter the city.");
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
