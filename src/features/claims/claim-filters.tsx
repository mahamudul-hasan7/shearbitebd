"use client";
import { CollectionToolbar } from "@/components/portal/collection-toolbar";
import { useUiText } from "@/lib/i18n/use-ui-text";

import { Search, X } from "lucide-react";
import { ClaimStatus } from "@/lib/constants/statuses";
import { CLAIM_FILTERS, type ClaimFilter } from "@/features/claims/types";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";
import type { ClaimCoordinationDetails } from "@/services";

export function ClaimFilters({
  items,
  filter,
  search,
  onFilterChange,
  onSearchChange,
}: {
  items: ClaimCoordinationDetails[];
  filter: ClaimFilter;
  search: string;
  onFilterChange: (filter: ClaimFilter) => void;
  onSearchChange: (search: string) => void;
}) {
  const tx = useUiText();
  const { language } = useLanguage();
  const isBn = language === "bn";

  function countFor(value: ClaimFilter) {
    return value === "ALL"
      ? items.length
      : items.filter((item) => item.claim.status === value).length;
  }

  return (
    <CollectionToolbar label={tx("Claim filters")}>
      {/* Modern Search Input with Clear Button */}
      <div className="relative flex items-center">
        <Search className="pointer-events-none absolute left-4 size-5 text-slate-400" />
        <input
          type="search"
          aria-label={tx("Search claims")}
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={
            isBn
              ? tx("খাদ্যের নাম, দাতা সংস্থা, এলাকা বা ক্লেইম আইডি দিয়ে খুঁজুন...")
              : tx(
                  "Search by food title, donor organization, area, volunteer, or claim ID...",
                )
          }
          className="liquid-glass-control h-12 w-full rounded-2xl border border-white/80 pl-11 pr-11 text-sm font-medium text-slate-900 placeholder:text-slate-500 transition hover:border-white focus:border-emerald-600 focus:outline-none focus:ring-3 focus:ring-emerald-500/15"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            title={isBn ? tx("সার্চ মুছুন") : tx("Clear search")}
            className="absolute right-1 grid size-11 place-items-center rounded-full bg-white/70 text-slate-600 transition hover:bg-white hover:text-slate-900"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {/* Status Filter Pill Row */}
      <div
        role="group"
        aria-label={
          isBn
            ? tx("স্ট্যাটাস অনুসারে ক্লেইম ফিল্টার করুন")
            : tx("Filter claims by status")
        }
        className="flex flex-wrap gap-2"
      >
        {CLAIM_FILTERS.map((item) => {
          const active = filter === item.value;
          const isException = item.value === ClaimStatus.EXPIRED;
          const count = countFor(item.value);

          return (
            <button
              key={item.value}
              type="button"
              aria-pressed={active}
              onClick={() => onFilterChange(item.value)}
              className={cn(
                "group inline-flex min-w-max cursor-pointer items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold transition-all duration-200 select-none hover:-translate-y-0.5 active:translate-y-0 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 sm:text-sm",
                active
                  ? isException
                    ? "border-rose-500 bg-rose-600/90 text-white shadow-md shadow-rose-600/25 backdrop-blur-md"
                    : "border-emerald-600 bg-emerald-700/90 text-white shadow-md shadow-emerald-700/25 backdrop-blur-md"
                  : "liquid-glass-pill text-slate-800 hover:bg-white/80 hover:text-emerald-900",
              )}
            >
              <span>{isBn ? item.labelBn : item.label}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-black transition",
                  active
                    ? "bg-white/25 text-white"
                    : "bg-white/75 text-slate-700 group-hover:bg-emerald-100 group-hover:text-emerald-900",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </CollectionToolbar>
  );
}
