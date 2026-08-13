import type { DietaryType, FoodCategory, PriorityLevel, StorageCondition } from "@/lib/constants/domain";

export type DiscoverySort = "RECOMMENDED" | "NEAREST" | "DEADLINE" | "QUANTITY";
export type DiscoveryMode = "list" | "map";

export interface DiscoveryFilters {
  search: string;
  radiusKm: number;
  category: "ALL" | FoodCategory;
  dietary: "ALL" | DietaryType;
  minMeals: number;
  urgency: "ALL" | PriorityLevel;
  storage: "ALL" | StorageCondition;
  deadlineHours: number;
  sort: DiscoverySort;
}

export const DEFAULT_DISCOVERY_FILTERS: DiscoveryFilters = {
  search: "",
  radiusKm: 15,
  category: "ALL",
  dietary: "ALL",
  minMeals: 0,
  urgency: "ALL",
  storage: "ALL",
  deadlineHours: 0,
  sort: "RECOMMENDED",
};
