import { DietaryType, FoodCategory, PriorityLevel, RequestType } from "@/lib/constants/domain";
import type { FoodRequestDraft } from "@/features/requests/types";

export const FOOD_REQUEST_DRAFT_STORAGE_KEY = "sharebite.ngo.food-request-draft.v1";

function localDateTime(date: Date) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function createInitialFoodRequestDraft(now = new Date()): FoodRequestDraft {
  const neededBy = new Date(now.getTime() + 4 * 60 * 60_000);
  neededBy.setMinutes(Math.ceil(neededBy.getMinutes() / 15) * 15, 0, 0);

  return {
    title: "",
    requestType: RequestType.ONE_TIME,
    priority: PriorityLevel.MEDIUM,
    priorityReason: "",
    purpose: "",
    recipientType: "",
    supportingDocumentNames: [],
    categories: [FoodCategory.COOKED_MEAL],
    dietaryTypes: [DietaryType.HALAL],
    specificPreferences: "",
    allergensOrRestrictions: "",
    peopleToServe: "",
    mealsNeeded: "",
    neededWhen: "TODAY",
    neededBy: localDateTime(neededBy),
    preferredTimeSlot: "",
    notes: "",
    locationType: "SHELTER",
    addressLine: "House 12, Road 4",
    area: "Badda",
    city: "Dhaka",
    landmark: "Near the community clinic",
    locationInstructions: "",
  };
}

export function restoreFoodRequestDraft(value: unknown, fallback = createInitialFoodRequestDraft()): FoodRequestDraft {
  if (!value || typeof value !== "object") return fallback;
  const candidate = value as Partial<FoodRequestDraft>;
  const restored = { ...fallback };

  for (const key of Object.keys(fallback) as Array<keyof FoodRequestDraft>) {
    const fallbackValue = fallback[key];
    const candidateValue = candidate[key];
    if (typeof fallbackValue === "string" && typeof candidateValue === "string") {
      Object.assign(restored, { [key]: candidateValue });
    } else if (Array.isArray(fallbackValue) && Array.isArray(candidateValue) && candidateValue.every((item) => typeof item === "string")) {
      Object.assign(restored, { [key]: [...candidateValue] });
    }
  }

  if (!Object.values(RequestType).includes(restored.requestType)) restored.requestType = fallback.requestType;
  if (!Object.values(PriorityLevel).includes(restored.priority)) restored.priority = fallback.priority;
  if (!restored.categories.every((item) => Object.values(FoodCategory).includes(item))) restored.categories = fallback.categories;
  if (!restored.dietaryTypes.every((item) => Object.values(DietaryType).includes(item))) restored.dietaryTypes = fallback.dietaryTypes;
  if (!["ASAP", "TODAY", "TOMORROW", "CUSTOM"].includes(restored.neededWhen)) restored.neededWhen = fallback.neededWhen;
  if (!["SHELTER", "COMMUNITY_CENTER", "OTHER"].includes(restored.locationType)) restored.locationType = fallback.locationType;
  restored.supportingDocumentNames = restored.supportingDocumentNames.slice(0, 3);
  return restored;
}
