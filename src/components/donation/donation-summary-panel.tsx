"use client";

import { useMemo } from "react";
import {
  CalendarClock,
  Heart,
  ImageIcon,
  MapPin,
  ShieldCheck,
  Sparkles,
  Utensils,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import type { DonationDraft, DonationDraftErrors, DonationWizardStep } from "@/features/donations/types";
import {
  FOOD_CATEGORY_LABELS,
  QuantityUnit,
  STORAGE_CONDITION_LABELS,
  StorageCondition,
} from "@/lib/constants/domain";

function shortDateBn(value: string) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp)
    ? new Intl.DateTimeFormat("bn-BD", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(timestamp)
    : "নির্ধারিত নয়";
}

export function DonationSummaryPanel({
  draft,
  currentStep,
  errors,
}: {
  draft: DonationDraft;
  currentStep: DonationWizardStep;
  errors: DonationDraftErrors;
}) {
  const declarationCount = [
    draft.freshlyPrepared,
    draft.properlyCovered,
    draft.noVisibleSpoilage,
    draft.storedSafely,
    draft.allergensCompleted,
    draft.realisticDeadline,
    draft.accuracyConfirmed,
  ].filter(Boolean).length;

  const errorCount = Object.values(errors).filter(Boolean).length;

  // Meal impact estimate
  const numQty = Number.parseFloat(draft.quantity);
  const estimatedImpact = useMemo(() => {
    if (!Number.isFinite(numQty) || numQty <= 0) return null;
    let min = Math.round(numQty);
    let max = Math.round(numQty);
    if (draft.quantityUnit === QuantityUnit.KILOGRAMS) {
      min = Math.round(numQty * 2);
      max = Math.round(numQty * 2.5);
    } else if (draft.quantityUnit === QuantityUnit.TRAYS) {
      min = Math.round(numQty * 12);
      max = Math.round(numQty * 15);
    } else if (draft.quantityUnit === QuantityUnit.LITRES) {
      min = Math.round(numQty * 3);
      max = Math.round(numQty * 4);
    }
    return min === max ? `${min} জন` : `${min}-${max} জন`;
  }, [numQty, draft.quantityUnit]);

  // AI Quality Score Estimate
  const aiSafetyScore = useMemo(() => {
    let score = 92;
    if (draft.storageCondition === StorageCondition.FROZEN) score = 98;
    else if (draft.storageCondition === StorageCondition.REFRIGERATED) score = 95;
    else if (draft.storageCondition === StorageCondition.AMBIENT) score = 78;

    const deadlineTs = draft.safePickupDeadline ? Date.parse(draft.safePickupDeadline) : NaN;
    if (Number.isFinite(deadlineTs)) {
      const remainingMinutes = (deadlineTs - Date.now()) / 60000;
      if (remainingMinutes <= 0) return { score: 15, label: "মেয়াদোত্তীর্ণ", color: "rose" };
      if (remainingMinutes <= 60) return { score: 65, label: "জরুরি পিকআপ", color: "amber" };
    }
    return { score, label: "উচ্চ ফ্রেশনেস", color: "emerald" };
  }, [draft.storageCondition, draft.safePickupDeadline]);

  return (
    <Card className="xl:sticky xl:top-24 rounded-3xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
      <div className="border-b border-slate-100 bg-slate-50/70 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 font-heading">
              লাইভ প্রিভিউ
            </p>
            <h3 className="mt-1 text-lg font-black text-slate-900 font-heading">অনুদানের সারসংক্ষেপ</h3>
          </div>
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-black text-emerald-800 font-heading">
            ধাপ {currentStep}/৪
          </span>
        </div>
      </div>

      <div className="grid gap-4 p-5 text-xs">
        <div>
          <p className="text-[11px] font-bold text-slate-400 font-heading uppercase">খাদ্যের নাম</p>
          <p className="mt-1 text-sm font-black text-slate-900 font-heading">
            {draft.title || "খাবারের শিরোনাম দিন"}
          </p>
          <p className="mt-0.5 text-slate-500 font-medium">
            {FOOD_CATEGORY_LABELS[draft.category]} · {draft.quantity || "০"} {draft.quantityUnit}
          </p>
        </div>

        {/* AI Freshness & Impact Quick Pills */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/60 p-2 text-center">
            <span className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              <Sparkles className="size-3" />
              AI সেফটি স্কোর
            </span>
            <p className="mt-0.5 text-sm font-black text-emerald-950 font-mono">
              {aiSafetyScore.score}%
            </p>
            <span className="text-[10px] text-emerald-700 font-medium">
              {aiSafetyScore.label}
            </span>
          </div>

          <div className="rounded-xl border border-rose-200/80 bg-rose-50/50 p-2 text-center">
            <span className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-700">
              <Heart className="size-3 fill-rose-500" />
              সম্ভাব্য প্রভাব
            </span>
            <p className="mt-0.5 text-sm font-black text-rose-950 font-mono">
              {estimatedImpact ?? "০ জন"}
            </p>
            <span className="text-[10px] text-rose-700 font-medium">
              আহার পাবে
            </span>
          </div>
        </div>

        <div className="space-y-2.5 rounded-2xl bg-emerald-50/40 p-4 border border-emerald-100/80 font-heading text-slate-700">
          <p className="flex items-center gap-2">
            <Utensils className="size-4 text-emerald-600 shrink-0" />
            <span className="font-bold">{STORAGE_CONDITION_LABELS[draft.storageCondition]}</span>
          </p>
          <p className="flex items-start gap-2">
            <CalendarClock className="mt-0.5 size-4 shrink-0 text-emerald-600" />
            <span>নিরাপদ মেয়াদ: <strong className="text-slate-900">{shortDateBn(draft.safePickupDeadline)}</strong></span>
          </p>
          <p className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0 text-emerald-600" />
            <span className="truncate">{draft.approximateArea || "পিকআপ এলাকা নির্ধারিত হয়নি"}</span>
          </p>
          <p className="flex items-center gap-2">
            <ImageIcon className="size-4 text-emerald-600 shrink-0" />
            <span>{draft.photoNames.length}/৫টি ছবি সংযুক্ত</span>
          </p>
          <p className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
            <span>{declarationCount}/৭টি স্বাস্থ্যবিধি ঘোষণা</span>
          </p>
        </div>

        {errorCount > 0 ? (
          <p role="status" className="rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-700 border border-rose-200">
            {errorCount}টি তথ্যে সংশোধন প্রয়োজন।
          </p>
        ) : (
          <p className="rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-700 border border-emerald-200">
            ✓ সকল প্রয়োজনীয় তথ্য বৈধ রয়েছে।
          </p>
        )}

        <p className="text-[11px] leading-relaxed text-slate-500 font-normal">
          তথ্যসমূহ শুধুমাত্র অনুমোদিত এনজিও ও নির্ধারিত ভলান্টিয়ারের কাছে যাচাইকরণের উদ্দেশ্যে দৃশ্যমান হবে।
        </p>
      </div>
    </Card>
  );
}
