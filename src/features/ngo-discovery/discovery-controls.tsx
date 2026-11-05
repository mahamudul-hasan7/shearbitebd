"use client";

import Link from "next/link";
import { List, Map, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DiscoveryFilterFields } from "@/features/ngo-discovery/discovery-filters";
import type { DiscoveryFilters, DiscoveryMode, DiscoverySort } from "@/features/ngo-discovery/types";
import { useLanguage } from "@/lib/i18n/language-context";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

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
  const { language } = useLanguage();
  const isBn = language === "bn";

  return (
    <div className="grid gap-4">
      {/* Controls Bar */}
      <div className="grid gap-3 rounded-2xl border border-slate-200/90 bg-surface p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_14rem_auto]">
        {/* Search Input */}
        <div>
          <label className="mb-1 block text-xs font-bold text-ink-900">
            {isBn ? "উদ্বৃত্ত খাবার বা এলাকা খুঁজুন" : "Search available surplus food"}
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-400" />
            <input
              type="text"
              value={filters.search}
              placeholder={
                isBn
                  ? "খাবার, দাতা প্রতিষ্ঠান বা এলাকা (যেমন: কাচ্চি, গুলশান, বাড্ডা)..."
                  : "Search food, donor, or area (e.g. Biryani, Gulshan, Badda)..."
              }
              onChange={(e) => updateFilter("search", e.target.value)}
              className="h-10 w-full rounded-xl border border-line bg-canvas/60 pl-9 pr-3 text-xs font-medium text-ink-900 placeholder:text-muted-400 focus:border-brand-500 focus:bg-white focus:outline-hidden"
            />
          </div>
        </div>

        {/* Sort Dropdown */}
        <div>
          <label className="mb-1 block text-xs font-bold text-ink-900">
            {isBn ? "সর্ট করার নিয়ম" : "Sort results"}
          </label>
          <select
            value={filters.sort}
            onChange={(e) => updateFilter("sort", e.target.value as DiscoverySort)}
            className="h-10 w-full rounded-xl border border-line bg-canvas/60 px-3 text-xs font-medium text-ink-900 focus:border-brand-500 focus:bg-white focus:outline-hidden"
          >
            <option value="RECOMMENDED">
              {isBn ? "সেরা প্রস্তাবনা (AI Match)" : "Best match (Recommended)"}
            </option>
            <option value="NEAREST">{isBn ? "নিকটবর্তী প্রথমে" : "Nearest first"}</option>
            <option value="DEADLINE">
              {isBn ? "সময়সীমা দ্রুত শেষ হচ্ছে" : "Deadline soonest"}
            </option>
            <option value="QUANTITY">{isBn ? "সর্বোচ্চ পরিমাণ" : "Largest quantity"}</option>
          </select>
        </div>

        {/* View Switcher & Mobile Filters */}
        <div className="flex items-end gap-2">
          <div className="lg:hidden">
            <Drawer
              triggerLabel={
                isBn
                  ? `ফিল্টার${activeFilterCount ? ` (${activeFilterCount})` : ""}`
                  : `Filters${activeFilterCount ? ` (${activeFilterCount})` : ""}`
              }
              title={isBn ? "উদ্ধার ফিল্টার" : "Discovery filters"}
              description={
                isBn
                  ? "তালিকা ও রাডার ম্যাপ উভয় স্থানে প্রযোজ্য"
                  : "Changes apply to both list and radar map views."
              }
            >
              <DiscoveryFilterFields
                filters={filters}
                updateFilter={updateFilter}
                resetFilters={resetFilters}
              />
            </Drawer>
          </div>

          <nav
            aria-label="Discovery view"
            className="flex h-10 items-center rounded-xl border border-line bg-canvas p-1"
          >
            <Link
              href={hrefFor("list", queryString)}
              aria-current={mode === "list" ? "page" : undefined}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
                mode === "list"
                  ? "bg-brand-600 text-white shadow-xs font-black"
                  : "text-muted-600 hover:text-ink-900"
              )}
              title="List view"
            >
              <List className="size-4" />
              <span className="hidden sm:inline">{isBn ? "তালিকা" : "List"}</span>
            </Link>
            <Link
              href={hrefFor("map", queryString)}
              aria-current={mode === "map" ? "page" : undefined}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
                mode === "map"
                  ? "bg-brand-600 text-white shadow-xs font-black"
                  : "text-muted-600 hover:text-ink-900"
              )}
              title="Radar Map view"
            >
              <Map className="size-4" />
              <span className="hidden sm:inline">{isBn ? "রাডার ম্যাপ" : "Radar Map"}</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* Result Counter & Active Filters Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        <p className="font-bold text-ink-700">
          <span className="font-heading font-black text-brand-700">{resultCount}</span>{" "}
          {isBn
            ? "টি অতিরিক্ত খাবারের প্যাকেজ আপনার এলাকার কাছাকাছি উন্মুক্ত"
            : `available surplus donation${resultCount === 1 ? "" : "s"} match your criteria`}
        </p>
        {activeFilterCount > 0 && (
          <p className="flex items-center gap-1.5 font-medium text-muted-600">
            <SlidersHorizontal className="size-3.5" />
            <span>
              {activeFilterCount} {isBn ? "টি ফিল্টার সক্রিয়" : "active filter(s)"}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}