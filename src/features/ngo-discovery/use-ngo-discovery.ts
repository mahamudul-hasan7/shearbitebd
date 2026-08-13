"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DietaryType, FoodCategory, PriorityLevel, StorageCondition } from "@/lib/constants/domain";
import { asyncState, discoveryService, toServiceError, type AsyncState, type NGODiscoveryItem } from "@/services";
import { NGO_PROFILE_ID, NGO_VIEWER } from "@/features/ngo-dashboard/use-ngo-dashboard";
import { DEFAULT_DISCOVERY_FILTERS, type DiscoveryFilters, type DiscoverySort } from "@/features/ngo-discovery/types";

function enumValue<T extends string>(value: string | null, values: readonly T[], fallback: T): T {
  return value && values.includes(value as T) ? value as T : fallback;
}

function positiveNumber(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function parseFilters(params: URLSearchParams): DiscoveryFilters {
  return {
    search: params.get("q")?.trim() ?? "",
    radiusKm: positiveNumber(params.get("radius"), DEFAULT_DISCOVERY_FILTERS.radiusKm),
    category: enumValue(params.get("category"), ["ALL", ...Object.values(FoodCategory)], "ALL"),
    dietary: enumValue(params.get("dietary"), ["ALL", ...Object.values(DietaryType)], "ALL"),
    minMeals: positiveNumber(params.get("quantity"), 0),
    urgency: enumValue(params.get("urgency"), ["ALL", ...Object.values(PriorityLevel)], "ALL"),
    storage: enumValue(params.get("storage"), ["ALL", ...Object.values(StorageCondition)], "ALL"),
    deadlineHours: positiveNumber(params.get("deadline"), 0),
    sort: enumValue(params.get("sort"), ["RECOMMENDED", "NEAREST", "DEADLINE", "QUANTITY"] as DiscoverySort[], "RECOMMENDED"),
  };
}

function applyFilters(items: NGODiscoveryItem[], filters: DiscoveryFilters) {
  const search = filters.search.toLowerCase();
  return items.filter(({ donation, donorOrganization }) => {
    if (search && !`${donation.title} ${donation.description} ${donation.pickup.approximateArea} ${donorOrganization}`.toLowerCase().includes(search)) return false;
    if ((donation.pickup.distanceKm ?? Number.POSITIVE_INFINITY) > filters.radiusKm) return false;
    if (filters.category !== "ALL" && donation.category !== filters.category) return false;
    if (filters.dietary !== "ALL" && !donation.dietaryTypes.includes(filters.dietary)) return false;
    if (donation.quantity.estimatedMeals < filters.minMeals) return false;
    if (filters.urgency !== "ALL" && donation.priority !== filters.urgency) return false;
    if (filters.storage !== "ALL" && donation.storageCondition !== filters.storage) return false;
    if (filters.deadlineHours > 0 && Date.parse(donation.safePickupDeadline) - Date.now() > filters.deadlineHours * 3_600_000) return false;
    return true;
  }).sort((left, right) => {
    if (filters.sort === "NEAREST") return (left.donation.pickup.distanceKm ?? 999) - (right.donation.pickup.distanceKm ?? 999);
    if (filters.sort === "DEADLINE") return Date.parse(left.donation.safePickupDeadline) - Date.parse(right.donation.safePickupDeadline);
    if (filters.sort === "QUANTITY") return right.donation.quantity.estimatedMeals - left.donation.quantity.estimatedMeals;
    return right.matchScore - left.matchScore;
  });
}

export function useNgoDiscovery() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [state, setState] = useState<AsyncState<NGODiscoveryItem[]>>(() => asyncState.loading());
  const [retryKey, setRetryKey] = useState(0);
  const filters = useMemo(() => parseFilters(new URLSearchParams(searchParams.toString())), [searchParams]);

  useEffect(() => {
    const controller = new AbortController();
    discoveryService.listAvailable(NGO_PROFILE_ID, NGO_VIEWER, { signal: controller.signal }).then((items) => setState(asyncState.success(items))).catch((error: unknown) => { if (!controller.signal.aborted) setState(asyncState.error(toServiceError(error))); });
    return () => controller.abort();
  }, [retryKey]);

  const filteredItems = useMemo(() => applyFilters(state.data ?? [], filters), [filters, state.data]);
  const activeFilterCount = [filters.search, filters.radiusKm !== 15, filters.category !== "ALL", filters.dietary !== "ALL", filters.minMeals > 0, filters.urgency !== "ALL", filters.storage !== "ALL", filters.deadlineHours > 0].filter(Boolean).length;

  function updateFilter<K extends keyof DiscoveryFilters>(key: K, value: DiscoveryFilters[K]) {
    const next = new URLSearchParams(searchParams.toString());
    const keys: Record<keyof DiscoveryFilters, string> = { search: "q", radiusKm: "radius", category: "category", dietary: "dietary", minMeals: "quantity", urgency: "urgency", storage: "storage", deadlineHours: "deadline", sort: "sort" };
    const queryKey = keys[key];
    const defaultValue = DEFAULT_DISCOVERY_FILTERS[key];
    if (value === defaultValue || value === "") next.delete(queryKey);
    else next.set(queryKey, String(value));
    router.replace(`${pathname}${next.size ? `?${next.toString()}` : ""}`, { scroll: false });
  }

  function resetFilters() {
    const next = new URLSearchParams();
    if (filters.sort !== DEFAULT_DISCOVERY_FILTERS.sort) next.set("sort", filters.sort);
    router.replace(`${pathname}${next.size ? `?${next.toString()}` : ""}`, { scroll: false });
  }

  function retry() { setState((current) => asyncState.loading(current.data)); setRetryKey((value) => value + 1); }

  return { state, filters, filteredItems, activeFilterCount, updateFilter, resetFilters, retry, queryString: searchParams.toString() };
}
