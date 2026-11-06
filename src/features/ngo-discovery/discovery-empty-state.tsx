"use client";

import { useEffect, useMemo, useState } from "react";
import { BellRing, Plus, RotateCcw, SearchX, SlidersHorizontal } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  DIETARY_TYPE_LABELS,
  FOOD_CATEGORY_LABELS,
  PRIORITY_META,
  STORAGE_CONDITION_LABELS,
} from "@/lib/constants/domain";
import {
  CATEGORY_LABELS_BN,
  DIETARY_LABELS_BN,
  PRIORITY_LABELS_BN,
  STORAGE_LABELS_BN,
} from "@/features/donations/donation-presentation";
import type { DiscoveryFilters } from "@/features/ngo-discovery/types";
import { useLanguage } from "@/lib/i18n/language-context";
import { ROUTES } from "@/lib/routes";

const NOTIFY_KEY = "sharebite.ngo.discovery-notify";

export function DiscoveryEmptyState({
  filters,
  resetFilters,
}: {
  filters: DiscoveryFilters;
  resetFilters: () => void;
}) {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const [notify, setNotify] = useState(false);

  useEffect(() => {
    const hydrationTimer = window.setTimeout(
      () => setNotify(window.sessionStorage.getItem(NOTIFY_KEY) === "true"),
      0
    );
    return () => window.clearTimeout(hydrationTimer);
  }, []);

  const criteria = useMemo(() => {
    const values: string[] = [];
    if (filters.radiusKm) values.push(isBn ? `${filters.radiusKm} কিমির মধ্যে` : `Within ${filters.radiusKm} km`);
    if (filters.search) values.push(isBn ? `অনুসন্ধান: “${filters.search}”` : `Search: “${filters.search}”`);
    if (filters.category !== "ALL") {
      values.push(isBn ? CATEGORY_LABELS_BN[filters.category] || FOOD_CATEGORY_LABELS[filters.category] : FOOD_CATEGORY_LABELS[filters.category]);
    }
    if (filters.dietary !== "ALL") {
      values.push(isBn ? DIETARY_LABELS_BN[filters.dietary] || DIETARY_TYPE_LABELS[filters.dietary] : DIETARY_TYPE_LABELS[filters.dietary]);
    }
    if (filters.minMeals) {
      values.push(isBn ? `${filters.minMeals}+ মিলস` : `${filters.minMeals}+ meals`);
    }
    if (filters.urgency !== "ALL") {
      values.push(isBn ? PRIORITY_LABELS_BN[filters.urgency] || PRIORITY_META[filters.urgency].label : `${PRIORITY_META[filters.urgency].label} priority`);
    }
    if (filters.storage !== "ALL") {
      values.push(isBn ? STORAGE_LABELS_BN[filters.storage] || STORAGE_CONDITION_LABELS[filters.storage] : STORAGE_CONDITION_LABELS[filters.storage]);
    }
    if (filters.deadlineHours) {
      values.push(isBn ? `${filters.deadlineHours} ঘণ্টার মধ্যে মেয়াদ` : `Deadline within ${filters.deadlineHours}h`);
    }
    return values;
  }, [filters, isBn]);

  function updateNotify(value: boolean) {
    setNotify(value);
    window.sessionStorage.setItem(NOTIFY_KEY, String(value));
  }

  return (
    <Card className="flex flex-col items-center justify-center border-slate-200/90 p-8 text-center sm:p-12">
      <div className="grid size-16 place-items-center rounded-3xl bg-amber-50 text-amber-700 shadow-xs ring-1 ring-amber-200/60">
        <SearchX className="size-8 text-amber-600" />
      </div>

      <h3 className="mt-5 text-xl font-black text-slate-900 sm:text-2xl">
        {isBn ? "আপনার ফিল্টারের সাথে মিলে এমন কোনো খাবার পাওয়া যায়নি" : "No surplus food matches right now"}
      </h3>
      <p className="mt-2 max-w-md text-xs leading-relaxed text-slate-600 sm:text-sm">
        {isBn
          ? "অনুগ্রহ করে দূরত্বের পরিধি বাড়ান বা ক্যাটাগরি ফিল্টার পরিবর্তন করুন, অথবা সকল উপলব্ধ খাবার দেখতে ফিল্টার রিসেট করুন।"
          : "Adjust your search radius or category criteria, view all available food donations, or submit an urgent food request."}
      </p>

      {/* Applied Criteria Chips */}
      {criteria.length > 0 && (
        <div className="mt-5 flex max-w-xl flex-wrap justify-center gap-1.5">
          {criteria.map((value) => (
            <span
              key={value}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200"
            >
              {value}
            </span>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button
          onClick={resetFilters}
          variant="primary"
          size="md"
          leftIcon={<RotateCcw className="size-4" />}
        >
          {isBn ? "সকল উপলব্ধ খাবার দেখুন (ফিল্টার রিসেট)" : "View all available food"}
        </Button>
        <ButtonLink
          href={ROUTES.ngo.newRequest}
          variant="outline"
          size="md"
          leftIcon={<Plus className="size-4" />}
        >
          {isBn ? "জরুরি খাদ্য চাহিদাপত্র দাখিল করুন" : "Submit food need request"}
        </ButtonLink>
      </div>

      {/* Realtime Notification Switch */}
      <div className="mt-8 w-full max-w-md border-t border-slate-100 pt-5 text-left">
        <Switch
          label={isBn ? "এই ধরনের খাবার পাওয়া গেলে নোটিফিকেশন দিন" : "Notify me when matching food is available"}
          description={
            isBn
              ? "নতুন খাবার পোস্ট হওয়ামাত্রই আপনার এনজিও প্যানেলে তাৎক্ষণিক পুশ অ্যালার্ট পাঠানো হবে।"
              : "Frontend notification preference for matching donations in your selected radius."
          }
          checked={notify}
          onCheckedChange={updateNotify}
        />
      </div>
    </Card>
  );
}
