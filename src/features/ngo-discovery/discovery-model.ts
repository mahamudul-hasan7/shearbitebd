import {
  DietaryType,
  FoodCategory,
  PriorityLevel,
  StorageCondition,
} from "@/lib/constants/domain";
import type { DonationView } from "@/types/domain";
import type { NGODiscoveryItem } from "@/services/discovery.service";
import { DEFAULT_DISCOVERY_FILTERS, type DiscoveryFilters } from "./types";

export const DISCOVERY_QUERY_KEYS = {
  search: "q",
  radiusKm: "radius",
  category: "category",
  dietary: "dietary",
  minMeals: "quantity",
  urgency: "urgency",
  storage: "storage",
  deadlineHours: "deadline",
  sort: "sort",
} as const;
function choice<T extends string>(
  value: string | null,
  options: readonly T[],
  fallback: T,
): T {
  return options.includes(value as T) ? (value as T) : fallback;
}
function number(value: string | null, maximum: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= maximum
    ? parsed
    : 0;
}
export function parseDiscoveryFilters(
  params: URLSearchParams,
): DiscoveryFilters {
  return {
    search: (params.get("q") || "").trim().slice(0, 160),
    radiusKm: number(params.get("radius"), 250),
    category: choice(
      params.get("category"),
      ["ALL", ...Object.values(FoodCategory)],
      "ALL",
    ),
    dietary: choice(
      params.get("dietary"),
      ["ALL", ...Object.values(DietaryType)],
      "ALL",
    ),
    minMeals: number(params.get("quantity"), 1_000_000),
    urgency: choice(
      params.get("urgency"),
      ["ALL", ...Object.values(PriorityLevel)],
      "ALL",
    ),
    storage: choice(
      params.get("storage"),
      ["ALL", ...Object.values(StorageCondition)],
      "ALL",
    ),
    deadlineHours: number(params.get("deadline"), 720),
    sort: choice(
      params.get("sort"),
      ["RECOMMENDED", "NEAREST", "DEADLINE", "QUANTITY", "RECENT"],
      "RECOMMENDED",
    ),
  };
}
export function discoveryQuery(filters: DiscoveryFilters) {
  const params = new URLSearchParams();
  for (const key of Object.keys(
    DISCOVERY_QUERY_KEYS,
  ) as (keyof DiscoveryFilters)[])
    if (filters[key] !== DEFAULT_DISCOVERY_FILTERS[key])
      params.set(DISCOVERY_QUERY_KEYS[key], String(filters[key]));
  return params.toString();
}
export function pickupDeadline(donation: DonationView) {
  return Math.min(
    Date.parse(donation.safePickupDeadline),
    Date.parse(donation.pickup.windowEnd),
  );
}
export function availableForDiscovery(donation: DonationView, now: number) {
  return (
    donation.status === "AVAILABLE" &&
    Number.isFinite(pickupDeadline(donation)) &&
    pickupDeadline(donation) > now
  );
}
export function acceptedCategory(item: NGODiscoveryItem) {
  return item.eligibility.checks.some(
    (check) => check.label === "Food category" && check.passed,
  );
}
export function filterDiscovery(
  items: NGODiscoveryItem[],
  filters: DiscoveryFilters,
  now: number,
) {
  const search = filters.search.toLocaleLowerCase().normalize("NFKC");
  const results = items.filter(({ donation: d, donorOrganization }) => {
    if (!availableForDiscovery(d, now)) return false;
    if (
      search &&
      !`${d.title} ${d.description} ${d.pickup.approximateArea} ${donorOrganization}`
        .toLocaleLowerCase()
        .normalize("NFKC")
        .includes(search)
    )
      return false;
    if (
      filters.radiusKm > 0 &&
      (d.pickup.distanceKm === undefined ||
        d.pickup.distanceKm > filters.radiusKm)
    )
      return false;
    return (
      (filters.category === "ALL" || d.category === filters.category) &&
      (filters.dietary === "ALL" || d.dietaryTypes.includes(filters.dietary)) &&
      d.quantity.estimatedMeals >= filters.minMeals &&
      (filters.urgency === "ALL" || d.priority === filters.urgency) &&
      (filters.storage === "ALL" || d.storageCondition === filters.storage) &&
      (!filters.deadlineHours ||
        pickupDeadline(d) - now <= filters.deadlineHours * 3_600_000)
    );
  });
  const distance = (item: NGODiscoveryItem) =>
    item.donation.pickup.distanceKm ?? Infinity;
  const recent = (item: NGODiscoveryItem) =>
    Date.parse(item.donation.publishedAt || item.donation.createdAt) || 0;
  return results.sort((a, b) => {
    if (filters.sort === "NEAREST")
      return (
        distance(a) - distance(b) ||
        pickupDeadline(a.donation) - pickupDeadline(b.donation) ||
        a.donation.id.localeCompare(b.donation.id)
      );
    if (filters.sort === "DEADLINE")
      return (
        pickupDeadline(a.donation) - pickupDeadline(b.donation) ||
        distance(a) - distance(b) ||
        a.donation.id.localeCompare(b.donation.id)
      );
    if (filters.sort === "QUANTITY")
      return (
        b.donation.quantity.estimatedMeals -
          a.donation.quantity.estimatedMeals ||
        pickupDeadline(a.donation) - pickupDeadline(b.donation)
      );
    if (filters.sort === "RECENT")
      return (
        recent(b) - recent(a) || a.donation.id.localeCompare(b.donation.id)
      );
    const category = Number(acceptedCategory(b)) - Number(acceptedCategory(a));
    if (category) return category;
    const urgentA = pickupDeadline(a.donation) - now <= 7_200_000,
      urgentB = pickupDeadline(b.donation) - now <= 7_200_000;
    if (urgentA !== urgentB) return urgentA ? -1 : 1;
    if (urgentA)
      return (
        pickupDeadline(a.donation) - pickupDeadline(b.donation) ||
        distance(a) - distance(b)
      );
    return (
      distance(a) - distance(b) ||
      pickupDeadline(a.donation) - pickupDeadline(b.donation) ||
      recent(b) - recent(a) ||
      a.donation.id.localeCompare(b.donation.id)
    );
  });
}
