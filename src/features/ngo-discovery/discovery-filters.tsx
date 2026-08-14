"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { DIETARY_TYPE_LABELS, DietaryType, FOOD_CATEGORY_LABELS, FoodCategory, PRIORITY_META, PriorityLevel, STORAGE_CONDITION_LABELS, StorageCondition } from "@/lib/constants/domain";
import type { DiscoveryFilters } from "@/features/ngo-discovery/types";

export function DiscoveryFilterFields({ filters, updateFilter, resetFilters }: { filters: DiscoveryFilters; updateFilter: <K extends keyof DiscoveryFilters>(key: K, value: DiscoveryFilters[K]) => void; resetFilters: () => void }) {
  return <div className="grid gap-4">
    <Select label="Distance radius" value={filters.radiusKm} onChange={(event) => updateFilter("radiusKm", Number(event.target.value))}><option value={3}>Within 3 km</option><option value={5}>Within 5 km</option><option value={10}>Within 10 km</option><option value={15}>Within 15 km</option><option value={25}>Within 25 km</option></Select>
    <Select label="Food category" value={filters.category} onChange={(event) => updateFilter("category", event.target.value as DiscoveryFilters["category"])}><option value="ALL">All categories</option>{Object.values(FoodCategory).map((value) => <option key={value} value={value}>{FOOD_CATEGORY_LABELS[value]}</option>)}</Select>
    <Select label="Dietary compatibility" value={filters.dietary} onChange={(event) => updateFilter("dietary", event.target.value as DiscoveryFilters["dietary"])}><option value="ALL">Any dietary type</option>{Object.values(DietaryType).map((value) => <option key={value} value={value}>{DIETARY_TYPE_LABELS[value]}</option>)}</Select>
    <Select label="Minimum quantity" value={filters.minMeals} onChange={(event) => updateFilter("minMeals", Number(event.target.value))}><option value={0}>Any quantity</option><option value={20}>20+ meals</option><option value={40}>40+ meals</option><option value={60}>60+ meals</option><option value={100}>100+ meals</option></Select>
    <Select label="Urgency" value={filters.urgency} onChange={(event) => updateFilter("urgency", event.target.value as DiscoveryFilters["urgency"])}><option value="ALL">Any priority</option>{Object.values(PriorityLevel).map((value) => <option key={value} value={value}>{PRIORITY_META[value].label}</option>)}</Select>
    <Select label="Storage condition" value={filters.storage} onChange={(event) => updateFilter("storage", event.target.value as DiscoveryFilters["storage"])}><option value="ALL">Any storage</option>{Object.values(StorageCondition).map((value) => <option key={value} value={value}>{STORAGE_CONDITION_LABELS[value]}</option>)}</Select>
    <Select label="Pickup deadline" value={filters.deadlineHours} onChange={(event) => updateFilter("deadlineHours", Number(event.target.value))}><option value={0}>Any open deadline</option><option value={2}>Within 2 hours</option><option value={4}>Within 4 hours</option><option value={8}>Within 8 hours</option><option value={24}>Within 24 hours</option></Select>
    <Button variant="ghost" fullWidth leftIcon={<RotateCcw className="size-4" />} onClick={resetFilters}>Reset filters</Button>
  </div>;
}
