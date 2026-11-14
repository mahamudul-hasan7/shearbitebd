"use client";
import { UiText } from "@/lib/i18n/ui-text-node";
import { getUiLocale } from "@/lib/i18n/locale";
import { useUiText } from "@/lib/i18n/use-ui-text";

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
import { hasDonationDraftErrors, validateDonationDraft } from "@/features/donations/validation";
import {
  FOOD_CATEGORY_LABELS,
  QuantityUnit,
  STORAGE_CONDITION_LABELS,
} from "@/lib/constants/domain";

function shortDateBn(value: string) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp)
    ? new Intl.DateTimeFormat(getUiLocale(), {
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
  const tx = useUiText();
  const declarationCount = [
    draft.freshlyPrepared,
    draft.properlyCovered,
    draft.noVisibleSpoilage,
    draft.storedSafely,
    draft.allergensCompleted,
    draft.realisticDeadline,
    draft.accuracyConfirmed,
  ].filter(Boolean).length;

  const errorCount = Object.entries(errors).filter(([field, message]) => field !== "form" && Boolean(message)).length;
  const readyToPublish = !hasDonationDraftErrors(validateDonationDraft(draft));

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

  return (
    <Card className="xl:sticky xl:top-24 rounded-3xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
      <div className="border-b border-slate-100 bg-slate-50/70 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 font-heading">
              {tx("লাইভ প্রিভিউ")}</p>
            <h3 className="mt-1 text-lg font-black text-slate-900 font-heading">{tx("অনুদানের সারসংক্ষেপ")}</h3>
          </div>
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-black text-emerald-800 font-heading">
            {tx("Step {0} of {1}", currentStep, 6)}</span>
        </div>
      </div>

      <div className="grid gap-4 p-5 text-xs">
        <div>
          <p className="text-[11px] font-bold text-slate-400 font-heading uppercase">{tx("খাদ্যের নাম")}</p>
          <p className="mt-1 text-sm font-black text-slate-900 font-heading">
            {draft.title || tx("খাবারের শিরোনাম দিন")}
          </p>
          <p className="mt-0.5 text-slate-500 font-medium">
            {tx(FOOD_CATEGORY_LABELS[draft.category])} · {draft.quantity || "0"} {tx(draft.quantityUnit.toLowerCase())}
          </p>
        </div>

        {/* AI Freshness & Impact Quick Pills */}
        <div className="grid grid-cols-2 gap-2">
          <div className="group rounded-xl border border-emerald-200/80 bg-emerald-50/60 p-2 text-center hover:border-emerald-300 hover:shadow-xs transition-all">
            <span className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              <Sparkles className="size-3 animate-icon-breathe text-emerald-600 group-hover:scale-125 transition-transform" />
              {tx("Donor declaration")}</span>
            <p className="mt-0.5 text-sm font-black text-emerald-950 font-mono">
              {declarationCount}/7
            </p>
            <span className="text-[10px] text-emerald-700 font-medium">
              {tx("সেফটি পরীক্ষা করা হয়নি")}</span>
          </div>

          <div className="group rounded-xl border border-rose-200/80 bg-rose-50/50 p-2 text-center hover:border-rose-300 hover:shadow-xs transition-all">
            <span className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-700">
              <Heart className="size-3 text-rose-500 fill-rose-500 animate-heart-beat group-hover:scale-125 transition-transform" />
              {tx("সম্ভাব্য প্রভাব")}</span>
            <p className="mt-0.5 text-sm font-black text-rose-950 font-mono">
              {tx(estimatedImpact ?? "0 জন")}
            </p>
            <span className="text-[10px] text-rose-700 font-medium">
              {tx("আহার পাবে")}</span>
          </div>
        </div>

        <div className="space-y-2.5 rounded-2xl bg-emerald-50/40 p-4 border border-emerald-100/80 font-heading text-slate-700">
          <p className="flex items-center gap-2">
            <Utensils className="size-4 text-emerald-600 shrink-0 animate-icon-breathe" />
            <span className="font-bold">{tx(STORAGE_CONDITION_LABELS[draft.storageCondition])}</span>
          </p>
          <p className="flex items-start gap-2">
            <CalendarClock className="mt-0.5 size-4 shrink-0 text-emerald-600 animate-icon-float" />
            <span>{tx("নিরাপদ মেয়াদ:")}{" "}<strong className="text-slate-900">{shortDateBn(draft.safePickupDeadline)}</strong></span>
          </p>
          <p className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0 text-emerald-600 animate-icon-breathe" />
            <span className="truncate">{draft.approximateArea || "পিকআপ এলাকা নির্ধারিত হয়নি"}</span>
          </p>
          <p className="flex items-center gap-2">
            <ImageIcon className="size-4 text-emerald-600 shrink-0 animate-icon-float" />
            <span>{draft.sampleImageId ? tx("Sample image selected · উদাহরণ ছবি") : tx("{0}/৫টি নিজের ছবি সংযুক্ত", draft.photoUrls.length)}</span>
          </p>
          <p className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-600 shrink-0 animate-pulse" />
            <span>{declarationCount}<UiText source={"/৭টি স্বাস্থ্যবিধি ঘোষণা"} /></span>
          </p>
        </div>

        {errorCount > 0 ? (
          <p role="status" className="rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-700 border border-rose-200">
            {errorCount}{tx("টি তথ্যে সংশোধন প্রয়োজন।")}</p>
        ) : errors.form ? (
          <p role="status" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs leading-5 text-rose-700">
            {tx("The post was not saved. Review the message above and try again.")}</p>
        ) : (
          <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-700">
            {readyToPublish ? tx("Food details and declarations are ready to publish.") : tx("Fill in the details and confirm all seven declarations before publishing.")}</p>
        )}

        <p className="text-[11px] leading-relaxed text-slate-500 font-normal">
          {tx("তথ্যসমূহ শুধুমাত্র অনুমোদিত এনজিও ও নির্ধারিত ভলান্টিয়ারের কাছে যাচাইকরণের উদ্দেশ্যে দৃশ্যমান হবে।")}</p>
      </div>
    </Card>
  );
}
