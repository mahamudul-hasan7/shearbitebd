export enum PriorityLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export enum FoodCategory {
  COOKED_MEAL = "COOKED_MEAL",
  BAKERY = "BAKERY",
  PRODUCE = "PRODUCE",
  GROCERIES = "GROCERIES",
  DAIRY = "DAIRY",
  BEVERAGE = "BEVERAGE",
  OTHER = "OTHER",
}

export enum DietaryType {
  HALAL = "HALAL",
  VEGETARIAN = "VEGETARIAN",
  VEGAN = "VEGAN",
  CONTAINS_MEAT = "CONTAINS_MEAT",
  GLUTEN_FREE = "GLUTEN_FREE",
  OTHER = "OTHER",
}

export enum StorageCondition {
  AMBIENT = "AMBIENT",
  REFRIGERATED = "REFRIGERATED",
  FROZEN = "FROZEN",
  HOT_HOLDING = "HOT_HOLDING",
}

export enum IncidentType {
  DAMAGED_FOOD = "DAMAGED_FOOD",
  WRONG_QUANTITY = "WRONG_QUANTITY",
  LATE_DELIVERY = "LATE_DELIVERY",
  WRONG_ITEM = "WRONG_ITEM",
  SAFETY_CONCERN = "SAFETY_CONCERN",
  OTHER = "OTHER",
}

export enum VerificationStatus {
  NOT_SUBMITTED = "NOT_SUBMITTED",
  PENDING = "PENDING",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED",
}

export enum NotificationType {
  URGENT = "URGENT",
  CLAIM = "CLAIM",
  VOLUNTEER = "VOLUNTEER",
  PICKUP = "PICKUP",
  DELIVERY = "DELIVERY",
  NEARBY_DONATION = "NEARBY_DONATION",
  IMPACT = "IMPACT",
  SYSTEM = "SYSTEM",
}

export enum IncidentStatus {
  OPEN = "OPEN",
  UNDER_REVIEW = "UNDER_REVIEW",
  RESOLVED = "RESOLVED",
  DISMISSED = "DISMISSED",
}

export enum RequestType {
  ONE_TIME = "ONE_TIME",
  RECURRING = "RECURRING",
  EMERGENCY = "EMERGENCY",
}

export enum QuantityUnit {
  PORTIONS = "PORTIONS",
  MEALS = "MEALS",
  KILOGRAMS = "KILOGRAMS",
  PACKETS = "PACKETS",
  TRAYS = "TRAYS",
  LITRES = "LITRES",
}

export enum TransportMethod {
  BICYCLE = "BICYCLE",
  MOTORCYCLE = "MOTORCYCLE",
  CAR = "CAR",
  WALKING_OR_TRANSIT = "WALKING_OR_TRANSIT",
}

export const PRIORITY_META: Record<PriorityLevel, { label: string; weight: number }> = {
  [PriorityLevel.LOW]: { label: "Low", weight: 0 },
  [PriorityLevel.MEDIUM]: { label: "Medium", weight: 10 },
  [PriorityLevel.HIGH]: { label: "High", weight: 20 },
  [PriorityLevel.URGENT]: { label: "Urgent", weight: 30 },
};

export const FOOD_CATEGORY_LABELS: Record<FoodCategory, string> = {
  [FoodCategory.COOKED_MEAL]: "Cooked meal",
  [FoodCategory.BAKERY]: "Bakery",
  [FoodCategory.PRODUCE]: "Fresh produce",
  [FoodCategory.GROCERIES]: "Groceries",
  [FoodCategory.DAIRY]: "Dairy",
  [FoodCategory.BEVERAGE]: "Beverage",
  [FoodCategory.OTHER]: "Other",
};

export const DIETARY_TYPE_LABELS: Record<DietaryType, string> = {
  [DietaryType.HALAL]: "Halal",
  [DietaryType.VEGETARIAN]: "Vegetarian",
  [DietaryType.VEGAN]: "Vegan",
  [DietaryType.CONTAINS_MEAT]: "Contains meat",
  [DietaryType.GLUTEN_FREE]: "Gluten-free",
  [DietaryType.OTHER]: "Other",
};

export const STORAGE_CONDITION_LABELS: Record<StorageCondition, string> = {
  [StorageCondition.AMBIENT]: "Ambient",
  [StorageCondition.REFRIGERATED]: "Refrigerated",
  [StorageCondition.FROZEN]: "Frozen",
  [StorageCondition.HOT_HOLDING]: "Hot holding",
};
