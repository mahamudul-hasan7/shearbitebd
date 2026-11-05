"use client";

import { CalendarClock, ImageIcon, MapPin, ShieldCheck, Utensils } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { DonationDraft, DonationDraftErrors, DonationWizardStep } from "@/features/donations/types";
import { FOOD_CATEGORY_LABELS, STORAGE_CONDITION_LABELS } from "@/lib/constants/domain";

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

        <div className="space-y-2.5 rounded-2xl bg-emerald-50/50 p-4 border border-emerald-100/80 font-heading text-slate-700">
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