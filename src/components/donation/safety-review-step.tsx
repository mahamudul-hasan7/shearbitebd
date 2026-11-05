"use client";

import { AlertTriangle, CalendarClock, CheckCircle2, MapPin, PackageCheck, ShieldCheck, Utensils, Zap } from "lucide-react";
import { RescueClock } from "@/components/donor/rescue-clock";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { DonationDraft, DonationDraftErrors, DonationDraftField, DonationWizardStep } from "@/features/donations/types";
import { FOOD_CATEGORY_LABELS, STORAGE_CONDITION_LABELS } from "@/lib/constants/domain";
import { calculateUrgencyScore, getUrgencyLabel } from "@/lib/selectors/donation-selectors";

const checklistBn: Array<{ field: DonationDraftField; label: string; description: string }> = [
  {
    field: "freshlyPrepared",
    label: "রান্নার সময় ও সতেজতার সত্যতা",
    description: "প্রদত্ত রান্নার সময় এবং খাদ্যের বর্তমান স্বাস্থ্যসম্মত অবস্থা সত্য ও সঠিক।",
  },
  {
    field: "properlyCovered",
    label: "ফুড-গ্রেড বক্সে সঠিকভাবে সিলযুক্ত",
    description: "খাবারটি ধুলোবালি ও বাহ্যিক দূষণ রোধে খাদ্যোপযোগী বক্সে বা ফয়েল পেপারে সিল করা হয়েছে।",
  },
  {
    field: "noVisibleSpoilage",
    label: "নষ্ট বা পচনের কোনো লক্ষণ নেই",
    description: "খাবারে গন্ধ, ছত্রাক, বাসি ভাব বা কোনো দৃশ্যমান খাদ্য নষ্টের লক্ষণ নেই।",
  },
  {
    field: "storedSafely",
    label: "নির্ধারিত তাপমাত্রায় সংরক্ষণ",
    description: "খাবারটি গরম (৬০°C+) বা কোল্ড স্টোরেজে স্বাস্থ্যবিধি মেনে সংরক্ষণ করা হয়েছে।",
  },
  {
    field: "allergensCompleted",
    label: "অ্যালার্জেন ও খাদ্য উপাদান তথ্য",
    description: "খাদ্যের প্রধান উপাদান ও সম্ভাব্য অ্যালার্জেন সম্পর্কে সঠিক তথ্য লিপিবদ্ধ করা হয়েছে।",
  },
  {
    field: "realisticDeadline",
    label: "বাস্তবসম্মত পিকআপ সময়সীমা",
    description: "খাদ্য গ্রহণের নির্ধারিত পিকআপ সময় ও নিরাপদ ব্যবহারের মেয়াদ বাস্তবানুগ।",
  },
  {
    field: "accuracyConfirmed",
    label: "দাতা প্রতিষ্ঠানের সত্যতা ঘোষণা",
    description: "আমি অঙ্গীকার করছি যে অভাবী মানুষের কল্যাণে প্রদত্ত এই খাবারটি সম্পূর্ণ স্বাস্থ্যসম্মত ও ভোজ্য।",
  },
];

function readableDateBn(value: string) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp)
    ? new Intl.DateTimeFormat("bn-BD", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      }).format(timestamp)
    : "নির্ধারিত নয়";
}

export function SafetyReviewStep({
  draft,
  errors,
  update,
  editStep,
}: {
  draft: DonationDraft;
  errors: DonationDraftErrors;
  update: (field: DonationDraftField, value: string | boolean | string[]) => void;
  editStep: (step: DonationWizardStep) => void;
}) {
  const urgencyScore = calculateUrgencyScore({ safePickupDeadline: draft.safePickupDeadline, priority: draft.priority });

  return (
    <div className="grid gap-6">
      <Alert
        tone="warning"
        title="খাদ্য নিরাপত্তা অঙ্গীকার (BFSA নির্দেশিকা)"
        description="ShareBite BD খাদ্য সুরক্ষা নীতি অনুযায়ী প্রতিটি খাবারকে অবশ্যই ভোজ্য ও স্বাস্থ্যসম্মত হতে হবে। মিথ্যা বা বিভ্রান্তিকর তথ্যের কারণে খাদ্য নিরাপত্তা ঝুঁকির সৃষ্টি হলে অ্যাকাউন্ট বাতিল হতে পারে।"
      />

      <div>
        <h3 className="text-lg font-black text-slate-900 font-heading">
          খাদ্য নিরাপত্তা চেকলিস্ট (বাধ্যতামূলক)
        </h3>
        <p className="mt-1 text-xs text-slate-600 font-normal">
          অনুদান তালিকাটি চূড়ান্তভাবে প্রকাশের পূর্বে প্রতিটি ঘোষণায় সম্মতি প্রদান করুন।
        </p>

        <div className="mt-4 grid gap-3">
          {checklistBn.map((item) => (
            <Checkbox
              key={item.field}
              name={item.field}
              checked={Boolean(draft[item.field])}
              onChange={(event) => update(item.field, event.target.checked)}
              error={errors[item.field]}
              label={item.label}
              description={item.description}
            />
          ))}
        </div>
      </div>

      {/* Review Summaries */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-2xs">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-emerald-700 font-heading">
                খাদ্যের বিবরণ
              </p>
              <h4 className="mt-1 text-lg font-black text-slate-900 font-heading">
                {draft.title || "শিরোনামহীন অনুদান"}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => editStep(1)}
              className="text-xs font-bold text-emerald-700 hover:underline font-heading"
            >
              পরিবর্তন করুন
            </button>
          </div>

          <div className="mt-4 space-y-2 text-xs text-slate-600">
            <p className="flex items-center gap-2">
              <Utensils className="size-4 text-emerald-600 shrink-0" />
              <span>{draft.quantity || "০"} {draft.quantityUnit} · {FOOD_CATEGORY_LABELS[draft.category]}</span>
            </p>
            <p className="flex items-center gap-2">
              <PackageCheck className="size-4 text-emerald-600 shrink-0" />
              <span>{STORAGE_CONDITION_LABELS[draft.storageCondition]} · {draft.foodCondition}</span>
            </p>
            <p className="flex items-start gap-2">
              <ShieldCheck className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>অ্যালার্জেন: {draft.allergenInfo || "উল্লেখ নেই"}</span>
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-2xs">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-emerald-700 font-heading">
                পিকআপ তথ্য
              </p>
              <h4 className="mt-1 text-lg font-black text-slate-900 font-heading">
                {draft.approximateArea}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => editStep(2)}
              className="text-xs font-bold text-emerald-700 hover:underline font-heading"
            >
              পরিবর্তন করুন
            </button>
          </div>

          <div className="mt-4 space-y-2 text-xs text-slate-600">
            <p className="flex items-start gap-2">
              <MapPin className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="truncate">{draft.pickupAddress}</span>
            </p>
            <p className="flex items-center gap-2">
              <CalendarClock className="size-4 text-emerald-600 shrink-0" />
              <span>{readableDateBn(draft.pickupWindowStart)} – {readableDateBn(draft.pickupWindowEnd)}</span>
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
              <span>দায়িত্বপ্রাপ্ত ব্যক্তি: {draft.contactPerson}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Urgency Score Card */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-amber-500/20 bg-amber-50/60 p-5">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="size-4 text-amber-600" />
            <h4 className="font-black text-sm text-slate-900 font-heading">
              আনুমানিক রেসকিউ জরুরি মাত্রা: {urgencyScore}/১০০
            </h4>
          </div>
          <p className="mt-1 text-xs text-slate-600 leading-relaxed max-w-lg">
            নিরাপদ পিকআপের সময়সীমার ওপর ভিত্তি করে এই স্কোর স্বয়ংক্রিয়ভাবে নির্ধারিত হয়, যা নিকটবর্তী ভলান্টিয়ারদের দ্রুত রেসপন্স করতে সহায়তা করে।
          </p>
        </div>
        <RescueClock deadline={draft.safePickupDeadline} compact />
      </div>

      {Object.values(errors).some(Boolean) && (
        <Alert
          tone="danger"
          title="অসম্পূর্ণ চেকলিস্ট"
          description="অনুগ্রহ করে উপরের সবগুলো চেকলিস্টের ঘরে টিক চিহ্ন দিয়ে সম্মতি প্রদান করুন।"
        />
      )}
    </div>
  );
}