"use client";

import { Check, RotateCcw, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  DIETARY_TYPE_LABELS,
  DietaryType,
  FOOD_CATEGORY_LABELS,
  FoodCategory,
  PRIORITY_META,
  PriorityLevel,
  STORAGE_CONDITION_LABELS,
  StorageCondition,
} from "@/lib/constants/domain";
import {
  CATEGORY_LABELS_BN,
  DIETARY_LABELS_BN,
  PRIORITY_LABELS_BN,
  STORAGE_LABELS_BN,
} from "@/features/donations/donation-presentation";
import type { DiscoveryFilters } from "@/features/ngo-discovery/types";
import { useLanguage } from "@/lib/i18n/language-context";

const RADIUS_OPTIONS = [3, 5, 10, 15, 25];
const QUANTITY_OPTIONS = [
  { value: 0, labelBn: "যেকোনো পরিমাণ", labelEn: "Any quantity" },
  { value: 20, labelBn: "২০+ মিলস", labelEn: "20+ meals" },
  { value: 40, labelBn: "৪০+ মিলস", labelEn: "40+ meals" },
  { value: 60, labelBn: "৬০+ মিলস", labelEn: "60+ meals" },
  { value: 100, labelBn: "১০০+ মিলস", labelEn: "100+ meals" },
];

export function DiscoveryFilterFields({
  filters,
  updateFilter,
  resetFilters,
}: {
  filters: DiscoveryFilters;
  updateFilter: <K extends keyof DiscoveryFilters>(key: K, value: DiscoveryFilters[K]) => void;
  resetFilters: () => void;
}) {
  const { language } = useLanguage();
  const isBn = language === "bn";

  return (
    <div className="grid gap-5">
      {/* 1. Distance Radius Chips */}
      <div>
        <label className="mb-2 block text-xs font-bold text-slate-800">
          {isBn ? "সর্বোচ্চ দূরত্বের পরিধি" : "Distance radius"}
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {RADIUS_OPTIONS.map((km) => {
            const active = filters.radiusKm === km;
            return (
              <button
                key={km}
                type="button"
                onClick={() => updateFilter("radiusKm", km)}
                className={`flex h-9 items-center justify-center rounded-xl text-xs font-bold transition ${
                  active
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/50"
                }`}
              >
                {km} {isBn ? "কিমি" : "km"}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Food Category */}
      <div>
        <Select
          label={isBn ? "খাদ্য বিভাগ" : "Food category"}
          value={filters.category}
          onChange={(event) =>
            updateFilter("category", event.target.value as DiscoveryFilters["category"])
          }
        >
          <option value="ALL">{isBn ? "সকল প্রকার খাদ্য" : "All food categories"}</option>
          {Object.values(FoodCategory).map((value) => (
            <option key={value} value={value}>
              {isBn ? CATEGORY_LABELS_BN[value] || FOOD_CATEGORY_LABELS[value] : FOOD_CATEGORY_LABELS[value]}
            </option>
          ))}
        </Select>
      </div>

      {/* 3. Dietary Compatibility */}
      <div>
        <Select
          label={isBn ? "খাদ্যের ধরন ও উপযুক্ততা" : "Dietary compatibility"}
          value={filters.dietary}
          onChange={(event) =>
            updateFilter("dietary", event.target.value as DiscoveryFilters["dietary"])
          }
        >
          <option value="ALL">{isBn ? "যেকোনো ডায়েট" : "Any dietary type"}</option>
          {Object.values(DietaryType).map((value) => (
            <option key={value} value={value}>
              {isBn ? DIETARY_LABELS_BN[value] || DIETARY_TYPE_LABELS[value] : DIETARY_TYPE_LABELS[value]}
            </option>
          ))}
        </Select>
      </div>

      {/* 4. Minimum Quantity Chips */}
      <div>
        <label className="mb-2 block text-xs font-bold text-slate-800">
          {isBn ? "ন্যূনতম আহারের পরিমাণ" : "Minimum quantity"}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {QUANTITY_OPTIONS.map((opt) => {
            const active = filters.minMeals === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateFilter("minMeals", opt.value)}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                  active
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50"
                }`}
              >
                {isBn ? opt.labelBn : opt.labelEn}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Urgency / Priority */}
      <div>
        <Select
          label={isBn ? "অগ্রাধিকার ও জরুরি অবস্থা" : "Urgency level"}
          value={filters.urgency}
          onChange={(event) =>
            updateFilter("urgency", event.target.value as DiscoveryFilters["urgency"])
          }
        >
          <option value="ALL">{isBn ? "যেকোনো অগ্রাধিকার" : "Any priority level"}</option>
          {Object.values(PriorityLevel).map((value) => (
            <option key={value} value={value}>
              {isBn ? PRIORITY_LABELS_BN[value] || PRIORITY_META[value].label : PRIORITY_META[value].label}
            </option>
          ))}
        </Select>
      </div>

      {/* 6. Storage Condition */}
      <div>
        <Select
          label={isBn ? "সংরক্ষণ তাপমাত্রা ও অবস্থা" : "Storage condition"}
          value={filters.storage}
          onChange={(event) =>
            updateFilter("storage", event.target.value as DiscoveryFilters["storage"])
          }
        >
          <option value="ALL">{isBn ? "যেকোনো সংরক্ষণ শর্ত" : "Any storage condition"}</option>
          {Object.values(StorageCondition).map((value) => (
            <option key={value} value={value}>
              {isBn ? STORAGE_LABELS_BN[value] || STORAGE_CONDITION_LABELS[value] : STORAGE_CONDITION_LABELS[value]}
            </option>
          ))}
        </Select>
      </div>

      {/* 7. Pickup Deadline */}
      <div>
        <Select
          label={isBn ? "পিকআপের সময়সীমা" : "Pickup deadline"}
          value={filters.deadlineHours}
          onChange={(event) => updateFilter("deadlineHours", Number(event.target.value))}
        >
          <option value={0}>{isBn ? "যেকোনো সময়সীমা" : "Any open deadline"}</option>
          <option value={2}>{isBn ? "২ ঘণ্টার মধ্যে সংগ্রহ আবশ্যক" : "Within 2 hours"}</option>
          <option value={4}>{isBn ? "৪ ঘণ্টার মধ্যে সংগ্রহ" : "Within 4 hours"}</option>
          <option value={8}>{isBn ? "৮ ঘণ্টার মধ্যে সংগ্রহ" : "Within 8 hours"}</option>
          <option value={24}>{isBn ? "২৪ ঘণ্টার মধ্যে সংগ্রহ" : "Within 24 hours"}</option>
        </Select>
      </div>

      {/* Reset Action */}
      <div className="pt-2">
        <Button
          variant="outline"
          fullWidth
          size="sm"
          leftIcon={<RotateCcw className="size-3.5" />}
          onClick={resetFilters}
        >
          {isBn ? "ফিল্টার রিসেট করুন" : "Reset filters"}
        </Button>
      </div>
    </div>
  );
}
