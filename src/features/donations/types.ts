import type { DietaryType, FoodCategory, PriorityLevel, QuantityUnit, StorageCondition } from "@/lib/constants/domain";
import type { DonationView } from "@/types/domain";

export type DonationWizardStep = 1 | 2 | 3 | 4;

export interface DonationDraft {
  title: string;
  category: FoodCategory;
  dietaryType: DietaryType;
  quantity: string;
  quantityUnit: QuantityUnit;
  preparationTime: string;
  safePickupDeadline: string;
  storageCondition: StorageCondition;
  foodCondition: "FRESHLY_PREPARED" | "SAME_DAY" | "PACKAGED";
  allergenInfo: string;
  description: string;
  specialInstructions: string;
  photoNames: string[];
  addressId: string;
  pickupAddress: string;
  approximateArea: string;
  contactPerson: string;
  phone: string;
  email: string;
  pickupWindowStart: string;
  pickupWindowEnd: string;
  directions: string;
  freshlyPrepared: boolean;
  properlyCovered: boolean;
  noVisibleSpoilage: boolean;
  storedSafely: boolean;
  allergensCompleted: boolean;
  realisticDeadline: boolean;
  accuracyConfirmed: boolean;
  priority: PriorityLevel;
}

export type DonationDraftField = keyof DonationDraft;
export type DonationDraftErrors = Partial<Record<DonationDraftField | "form", string>>;

export interface DonationWizardResult {
  donation: DonationView;
  submittedAt: string;
}
