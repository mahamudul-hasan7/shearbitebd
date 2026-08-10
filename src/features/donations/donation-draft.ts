import {
  DietaryType,
  FoodCategory,
  PriorityLevel,
  QuantityUnit,
  StorageCondition,
} from "@/lib/constants/domain";
import type { DonationDraft } from "@/features/donations/types";

export const DONATION_DRAFT_STORAGE_KEY = "sharebite.donor.donation-draft.v1";

function localDateTime(date: Date) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function createInitialDonationDraft(now = new Date()): DonationDraft {
  const preparation = new Date(now);
  preparation.setMinutes(Math.floor(preparation.getMinutes() / 5) * 5, 0, 0);
  const pickupStart = new Date(preparation.getTime() + 45 * 60_000);
  const pickupEnd = new Date(preparation.getTime() + 150 * 60_000);
  const deadline = new Date(preparation.getTime() + 180 * 60_000);

  return {
    title: "",
    category: FoodCategory.COOKED_MEAL,
    dietaryType: DietaryType.HALAL,
    quantity: "",
    quantityUnit: QuantityUnit.MEALS,
    preparationTime: localDateTime(preparation),
    safePickupDeadline: localDateTime(deadline),
    storageCondition: StorageCondition.HOT_HOLDING,
    foodCondition: "FRESHLY_PREPARED",
    allergenInfo: "",
    description: "",
    specialInstructions: "",
    photoNames: [],
    addressId: "address-uiu",
    pickupAddress: "Mock campus gate, United City, Badda, Dhaka",
    approximateArea: "Badda, Dhaka",
    contactPerson: "UIU Cafeteria Desk",
    phone: "+8801700000001",
    email: "donor@sharebite.demo",
    pickupWindowStart: localDateTime(pickupStart),
    pickupWindowEnd: localDateTime(pickupEnd),
    directions: "",
    freshlyPrepared: false,
    properlyCovered: false,
    noVisibleSpoilage: false,
    storedSafely: false,
    allergensCompleted: false,
    realisticDeadline: false,
    accuracyConfirmed: false,
    priority: PriorityLevel.MEDIUM,
  };
}

export function restoreDonationDraft(value: unknown, fallback = createInitialDonationDraft()): DonationDraft {
  if (!value || typeof value !== "object") return fallback;
  const candidate = value as Partial<DonationDraft>;
  const restored = { ...fallback };

  for (const key of Object.keys(fallback) as Array<keyof DonationDraft>) {
    const fallbackValue = fallback[key];
    const candidateValue = candidate[key];
    if (typeof fallbackValue === "string" && typeof candidateValue === "string") {
      Object.assign(restored, { [key]: candidateValue });
    } else if (typeof fallbackValue === "boolean" && typeof candidateValue === "boolean") {
      Object.assign(restored, { [key]: candidateValue });
    } else if (Array.isArray(fallbackValue) && Array.isArray(candidateValue) && candidateValue.every((item) => typeof item === "string")) {
      Object.assign(restored, { [key]: [...candidateValue] });
    }
  }

  if (!Object.values(FoodCategory).includes(restored.category)) restored.category = fallback.category;
  if (!Object.values(DietaryType).includes(restored.dietaryType)) restored.dietaryType = fallback.dietaryType;
  if (!Object.values(QuantityUnit).includes(restored.quantityUnit)) restored.quantityUnit = fallback.quantityUnit;
  if (!Object.values(StorageCondition).includes(restored.storageCondition)) restored.storageCondition = fallback.storageCondition;
  if (!Object.values(PriorityLevel).includes(restored.priority)) restored.priority = fallback.priority;
  if (!["FRESHLY_PREPARED", "SAME_DAY", "PACKAGED"].includes(restored.foodCondition)) restored.foodCondition = fallback.foodCondition;
  restored.photoNames = restored.photoNames.slice(0, 5);

  return restored;
}
