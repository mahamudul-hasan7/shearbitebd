import type { DietaryType, FoodCategory, PriorityLevel, RequestType } from "@/lib/constants/domain";
import type { FoodRequest } from "@/types/domain";

export type RequestWizardStep = 1 | 2 | 3 | 4 | 5;
export type RequestTiming = "ASAP" | "TODAY" | "TOMORROW" | "CUSTOM";

export interface FoodRequestDraft {
  title: string;
  requestType: RequestType;
  priority: PriorityLevel;
  priorityReason: string;
  purpose: string;
  recipientType: string;
  supportingDocumentNames: string[];
  categories: FoodCategory[];
  dietaryTypes: DietaryType[];
  specificPreferences: string;
  allergensOrRestrictions: string;
  peopleToServe: string;
  mealsNeeded: string;
  neededWhen: RequestTiming;
  neededBy: string;
  preferredTimeSlot: string;
  notes: string;
  locationType: "SHELTER" | "COMMUNITY_CENTER" | "OTHER";
  addressLine: string;
  area: string;
  city: string;
  landmark: string;
  locationInstructions: string;
}

export type FoodRequestDraftField = keyof FoodRequestDraft;
export type FoodRequestDraftErrors = Partial<Record<FoodRequestDraftField | "form", string>>;
export type FoodRequestDraftUpdate = <K extends FoodRequestDraftField>(field: K, value: FoodRequestDraft[K]) => void;

export interface FoodRequestSubmission {
  request: FoodRequest;
  submittedAt: string;
}

export type RequestStatusFilter = "ALL" | FoodRequest["status"];
