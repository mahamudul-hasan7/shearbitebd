"use client";

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
  const { language } = useLanguage();
  const isBn = language === "bn";

  function countFor(value: ClaimFilter) {
    return value === "ALL" ? items.length : items.filter((item) => item.claim.status === value).length;
  }

  return (
    <div className="grid gap-3.5">
      {/* Modern Search Input with Clear Button */}
      <div className="relative flex items-center">
        <Search className="pointer-events-none absolute left-4 size-5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={
            isBn
              ? "খাদ্যের নাম, দাতা সংস্থা, এলাকা বা ক্লেইম আইডি দিয়ে খুঁজুন..."
              : "Search by food title, donor organization, area, volunteer, or claim ID..."
          }
          className="h-12 w-full rounded-2xl border border-slate-200/90 bg-white pl-11 pr-11 text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-xs transition hover:border-slate-300 focus:border-emerald-600 focus:outline-none focus:ring-3 focus:ring-emerald-500/15"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            title={isBn ? "সার্চ মুছুন" : "Clear search"}
            className="absolute right-3.5 grid size-6 place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {/* Status Filter Pill Row */}
      <div
        role="group"
        aria-label={isBn ? "স্ট্যাটাস অনুসারে ক্লেইম ফিল্টার করুন" : "Filter claims by status"}
        className="no-scrollbar flex gap-2 overflow-x-auto pb-1"
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
                "group inline-flex min-w-max cursor-pointer items-center gap-2 rounded-xl border-2 px-3.5 py-2 text-xs font-bold transition-all duration-200 select-none hover:-translate-y-0.5 active:translate-y-0 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 sm:text-sm",
                active
                  ? isException
                    ? "border-rose-600 bg-rose-600 text-white shadow-md shadow-rose-600/25"
                    : "border-emerald-700 bg-emerald-700 text-white shadow-md shadow-emerald-700/25"
                  : "border-slate-300 bg-white text-slate-700 shadow-2xs hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-900 hover:shadow-xs",
              )}
            >
              <span>{isBn ? item.labelBn : item.label}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-black transition",
                  active
                    ? "bg-white/25 text-white"
                    : "bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-900",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
