"use client";
import { useUiText } from "@/lib/i18n/use-ui-text";

import Link from "next/link";
import {
  Flame,
  List,
  Map,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { DiscoveryFilterFields } from "@/features/ngo-discovery/discovery-filters";
import type { DiscoveryFilters, DiscoveryMode, DiscoverySort } from "@/features/ngo-discovery/types";
import { FoodCategory, PriorityLevel } from "@/lib/constants/domain";
import { useLanguage } from "@/lib/i18n/language-context";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

const QUICK_CATEGORIES: Array<{ key: "ALL" | FoodCategory; labelBn: string; labelEn: string }> = [
  { key: "ALL", labelBn: "সকল খাদ্য লট", labelEn: "All Food" },
  { key: FoodCategory.COOKED_MEAL, labelBn: "রান্না করা গরম খাবার", labelEn: "Cooked Meals" },
  { key: FoodCategory.BAKERY, labelBn: "বেকারি ও রুটি", labelEn: "Bakery & Bread" },
  { key: FoodCategory.PRODUCE, labelBn: "তাজা শাকসবজি ও ফল", labelEn: "Fresh Produce" },
  { key: FoodCategory.GROCERIES, labelBn: "প্যাকেটজাত খাদ্য", labelEn: "Packaged Groceries" },
  { key: FoodCategory.DAIRY, labelBn: "দুগ্ধজাত পণ্য", labelEn: "Dairy Products" },
];

function hrefFor(mode: DiscoveryMode, queryString: string) {
  const route = mode === "map" ? ROUTES.ngo.discoverMap : ROUTES.ngo.discover;
  return `${route}${queryString ? `?${queryString}` : ""}`;
}

export function DiscoveryControls({
  mode,
  queryString,
  filters,
  activeFilterCount,
  resultCount,
  updateFilter,
  resetFilters,
}: {
  mode: DiscoveryMode;
  queryString: string;
  filters: DiscoveryFilters;
  activeFilterCount: number;
  resultCount: number;
  updateFilter: <K extends keyof DiscoveryFilters>(key: K, value: DiscoveryFilters[K]) => void;
  resetFilters: () => void;
}) {
  const tx = useUiText();
  const { language } = useLanguage();
  const isBn = language === "bn";

  return (
    <div className="grid min-w-0 gap-3.5">
      {/* 1. TOP SEARCH, SORT & VIEW SWITCHER BAR */}
      <div className="min-w-0 rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xs sm:p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.3fr)_14rem_auto]">
          {/* Search Input with Clear Button */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              value={filters.search}
              placeholder={
                isBn ? tx("খাবারের নাম, দাতা প্রতিষ্ঠান অথবা এলাকা (যেমন: কাচ্চি, বাড্ডা, বনানী)...") : tx("Search food title, donor cafeteria, or pickup area...")
              }
              onChange={(e) => updateFilter("search", e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-9 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-hidden"
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => updateFilter("search", "")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selection */}
          <div className="flex items-center gap-2">
            <select
              value={filters.sort}
              onChange={(e) => updateFilter("sort", e.target.value as DiscoverySort)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 text-xs font-bold text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-hidden"
            >
              <option value="RECOMMENDED">
                {isBn ? tx("সাম্প্রতিক অনুদান") : tx("Recently published")}
              </option>
              <option value="NEAREST">{isBn ? tx("📍 নিকটবর্তী প্রথমে (Nearest first)") : tx("📍 Nearest first")}</option>
              <option value="DEADLINE">
                {isBn ? tx("⏰ সময় দ্রুত শেষ হচ্ছে (Urgent first)") : tx("⏰ Deadline soonest")}
              </option>
              <option value="QUANTITY">
                {isBn ? tx("🍱 সর্বোচ্চ খাবার (Largest quantity)") : tx("🍱 Largest quantity")}
              </option>
            </select>
          </div>

          {/* View Switcher & Mobile Filter Drawer */}
          <div className="flex items-center justify-between gap-2 sm:justify-end">
            {/* Mobile Filter Drawer */}
            <div className="lg:hidden">
              <Drawer
                triggerLabel={
                  isBn
                    ? `ফিল্টার${activeFilterCount ? ` (${activeFilterCount})` : ""}`
                    : `Filters${activeFilterCount ? ` (${activeFilterCount})` : ""}`
                }
                title={isBn ? tx("উদ্ধার ফিল্টার") : tx("Discovery filters")}
                description={
                  isBn ? tx("দূরত্ব, খাদ্যের ধরণ, পরিমাণ ও সময়সীমা অনুযায়ী ফিল্টার করুন।") : tx("Changes apply to both list and map views.")
                }
              >
                <DiscoveryFilterFields
                  filters={filters}
                  updateFilter={updateFilter}
                  resetFilters={resetFilters}
                />
              </Drawer>
            </div>

            {/* List / Radar Map View Switcher */}
            <nav
              aria-label={tx("ভিউ মোড পরিবর্তন")}
              className="flex h-10 items-center rounded-xl border border-slate-200 bg-slate-100/90 p-1"
            >
              <Link
                href={hrefFor("list", queryString)}
                aria-current={mode === "list" ? "page" : undefined}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
                  mode === "list"
                    ? "bg-white text-emerald-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                )}
                title={tx("তালিকা ভিউ")}
              >
                <List className="size-3.5" />
                <span className="hidden sm:inline">{isBn ? tx("তালিকা") : tx("List")}</span>
              </Link>

              <Link
                href={hrefFor("map", queryString)}
                aria-current={mode === "map" ? "page" : undefined}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
                  mode === "map"
                    ? "bg-white text-emerald-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                )}
                title={tx("ম্যাপ ভিউ")}
              >
                <Map className="size-3.5" />
                <span className="hidden sm:inline">{isBn ? tx("ম্যাপ") : tx("Map")}</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* 2. QUICK CATEGORY PILLS BAR (Mobile Smooth Horizontal Carousel) */}
        <div className="mt-3.5 flex min-w-0 max-w-full items-center gap-2 border-t border-slate-100 pt-3 overflow-x-auto no-scrollbar pb-0.5">
          <span className="shrink-0 text-[11px] font-bold text-slate-500">
            {isBn ? tx("ক্যাটাগরি:") : tx("Category:")}
          </span>
          <div className="flex shrink-0 items-center gap-1.5">
            {QUICK_CATEGORIES.map((cat) => {
              const active = filters.category === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => updateFilter("category", cat.key)}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition whitespace-nowrap active:scale-95 cursor-pointer ${
                    active
                      ? "bg-emerald-600 text-white shadow-xs font-black"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {isBn ? cat.labelBn : cat.labelEn}
                </button>
              );
            })}
          </div>

          {/* Quick Urgency / Distance Shortcut Pills */}
          <div className="hidden items-center gap-1.5 border-l border-slate-200 pl-2 xl:flex">
            <button
              type="button"
              onClick={() =>
                updateFilter(
                  "urgency",
                  filters.urgency === PriorityLevel.URGENT ? "ALL" : PriorityLevel.URGENT
                )
              }
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold transition ${
                filters.urgency === PriorityLevel.URGENT
                  ? "bg-rose-600 text-white shadow-xs"
                  : "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
              }`}
            >
              <Flame className="size-3" />
              <span>{isBn ? tx("অতি জরুরি") : tx("Urgent")}</span>
            </button>

            <button
              type="button"
              onClick={() => updateFilter("radiusKm", filters.radiusKm === 5 ? 0 : 5)}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold transition ${
                filters.radiusKm === 5
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
              }`}
            >
              <MapPin className="size-3" />
              <span>{isBn ? tx("৫ কিমি রেডিয়াস") : tx("Within 5 km")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. ACTIVE STATUS & RESULT SUMMARY STRIP */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        <p className="font-bold text-slate-800">
          <span className="font-mono text-base font-black text-emerald-700">{resultCount}</span>{" "}
          {isBn ? tx("টি অতিরিক্ত খাবারের ব্যাচ আপনার এলাকার কাছাকাছি উন্মুক্ত") : tx("available surplus donation{0} match your criteria", resultCount === 1 ? "" : "s")}
        </p>

        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-800 ring-1 ring-inset ring-amber-600/20">
              <SlidersHorizontal className="size-3" />
              <span>{activeFilterCount} {isBn ? tx("টি ফিল্টার সক্রিয়") : tx("active filters")}</span>
            </span>

            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold text-slate-600 hover:text-emerald-700"
            >
              <RotateCcw className="size-3" />
              <span>{isBn ? tx("সব মুছুন") : tx("Reset")}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
