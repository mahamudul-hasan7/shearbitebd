"use client";
import { UiText } from "@/lib/i18n/ui-text-node";
import { getUiLocale } from "@/lib/i18n/locale";
import { useUiText } from "@/lib/i18n/use-ui-text";

import { CalendarClock, CheckCircle2, Edit3, MapPin, PackageCheck, ShieldCheck, Utensils, Zap } from "lucide-react";
import { RescueClock } from "@/components/donor/rescue-clock";
import { Alert } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import type { DonationDraft, DonationDraftErrors, DonationDraftField, DonationWizardStep } from "@/features/donations/types";
import { FOOD_CATEGORY_LABELS, STORAGE_CONDITION_LABELS } from "@/lib/constants/domain";
import { calculateUrgencyScore } from "@/lib/selectors/donation-selectors";

const checklistBn: Array<{ field: DonationDraftField; label: string; description: string }> = [
  {
    field: "freshlyPrepared",
    label: "রান্নার সময় ও সতেজতার সত্যতা",
    description: "The preparation time and food condition I entered are accurate.",
  },
  {
    field: "properlyCovered",
    label: "ফুড-গ্রেড বক্সে সঠিকভাবে সিলযুক্ত",
    description: "The food is covered in food-safe packaging to protect it from contamination.",
  },
  {
    field: "noVisibleSpoilage",
    label: "নষ্ট বা পচনের কোনো লক্ষণ নেই",
    description: "I have checked that the food has no unusual smell, mould or visible spoilage.",
  },
  {
    field: "storedSafely",
    label: "নির্ধারিত তাপমাত্রায় সংরক্ষণ",
    description: "I stored the food according to the storage condition I selected.",
  },
  {
    field: "allergensCompleted",
    label: "অ্যালার্জেন ও খাদ্য উপাদান তথ্য",
    description: "I have listed the ingredients that could cause allergies, or stated that none are known.",
  },
  {
    field: "realisticDeadline",
    label: "বাস্তবসম্মত পিকআপ সময়সীমা",
    description: "The pickup window and safe food deadline allow enough time to collect the food.",
  },
  {
    field: "accuracyConfirmed",
    label: "দাতা প্রতিষ্ঠানের সত্যতা ঘোষণা",
    description: "I confirm that the information I provided is accurate.",
  },
];

function readableDateBn(value: string) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp)
    ? new Intl.DateTimeFormat(getUiLocale(), {
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
  const tx = useUiText();
  const confirmed = checklistBn.filter((item) => draft[item.field] === true).length;
  const hasChecklistErrors = checklistBn.some((item) => errors[item.field]);
  const urgencyScore = calculateUrgencyScore({ safePickupDeadline: draft.safePickupDeadline, priority: draft.priority });

  return (
    <div className="grid gap-6">
      <Alert
        tone="warning"
        title={tx("খাদ্য নিরাপত্তা অঙ্গীকার (BFSA নির্দেশিকা)")}
        description={tx("ShareBite BD খাদ্য সুরক্ষা নীতি অনুযায়ী প্রতিটি খাবারকে অবশ্যই ভোজ্য ও স্বাস্থ্যসম্মত হতে হবে। মিথ্যা বা বিভ্রান্তিকর তথ্যের কারণে খাদ্য নিরাপত্তা ঝুঁকির সৃষ্টি হলে অ্যাকাউন্ট বাতিল হতে পারে।")}
      />

      <div>
        <h3 className="text-lg font-black text-slate-900 font-heading">
          {tx("খাদ্য নিরাপত্তা চেকলিস্ট (বাধ্যতামূলক)")}</h3>
        <p className="mt-1 text-xs text-slate-600 font-normal">
          {tx("অনুদান তালিকাটি চূড়ান্তভাবে প্রকাশের পূর্বে প্রতিটি ঘোষণায় সম্মতি প্রদান করুন।")}</p>
        <div className="mt-3 flex items-center gap-3" role="status" data-testid="safety-progress">
          <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
            <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${confirmed / checklistBn.length * 100}%` }} />
          </div>
          <span className="shrink-0 text-xs font-bold text-emerald-800">{tx("{0} of {1} declarations confirmed", confirmed, checklistBn.length)}</span>
        </div>

        <div className="mt-4 grid gap-3">
          {checklistBn.map((item) => (
            <Checkbox
              key={item.field}
              name={item.field}
              checked={Boolean(draft[item.field])}
              onChange={(event) => update(item.field, event.target.checked)}
              error={errors[item.field]}
              label={tx(item.label)}
              description={tx(item.description)}
              containerClassName={errors[item.field] ? "[&_label]:border-rose-300 [&_label]:bg-rose-50" : draft[item.field] ? "[&_label]:border-emerald-200 [&_label]:bg-emerald-50/50" : undefined}
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
                {tx("খাদ্যের বিবরণ")}</p>
              <h4 className="mt-1 text-lg font-black text-slate-900 font-heading">
                {draft.title || "শিরোনামহীন অনুদান"}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => editStep(1)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border-2 border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 shadow-2xs transition-all hover:border-emerald-600 hover:bg-emerald-600 hover:text-white hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0 font-heading"
            >
              <Edit3 className="size-3.5" />
              <span>{tx("পরিবর্তন করুন")}</span>
            </button>
          </div>

          <div className="mt-4 space-y-2 text-xs text-slate-600">
            <p className="flex items-center gap-2">
              <Utensils className="size-4 text-emerald-600 shrink-0" />
              <span>{draft.quantity || "0"} {tx(draft.quantityUnit)} · {tx(FOOD_CATEGORY_LABELS[draft.category])}</span>
            </p>
            <p className="flex items-center gap-2">
              <PackageCheck className="size-4 text-emerald-600 shrink-0" />
              <span>{tx(STORAGE_CONDITION_LABELS[draft.storageCondition])} · {tx(draft.foodCondition)}</span>
            </p>
            <p className="flex items-start gap-2">
              <ShieldCheck className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{tx("অ্যালার্জেন:")}{" "}{draft.allergenInfo || "উল্লেখ নেই"}</span>
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-2xs">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-emerald-700 font-heading">
                {tx("পিকআপ তথ্য")}</p>
              <h4 className="mt-1 text-lg font-black text-slate-900 font-heading">
                {draft.approximateArea}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => editStep(4)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border-2 border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 shadow-2xs transition-all hover:border-emerald-600 hover:bg-emerald-600 hover:text-white hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0 font-heading"
            >
              <Edit3 className="size-3.5" />
              <span>{tx("পরিবর্তন করুন")}</span>
            </button>
          </div>

          <div className="mt-4 space-y-2 text-xs text-slate-600">
            <p className="flex items-start gap-2">
              <MapPin className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="min-w-0 break-words">{draft.pickupAddress}</span>
            </p>
            <p className="flex items-center gap-2">
              <CalendarClock className="size-4 text-emerald-600 shrink-0" />
              <span>{readableDateBn(draft.pickupWindowStart)} – {readableDateBn(draft.pickupWindowEnd)}</span>
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
              <span>{tx("দায়িত্বপ্রাপ্ত ব্যক্তি:")}{" "}{draft.contactPerson}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => editStep(2)} className="min-h-11 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-emerald-800">{tx("Edit time and storage")}</button>
        <button type="button" onClick={() => editStep(3)} className="min-h-11 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-emerald-800">{tx("Edit photos")}</button>
      </div>

      {/* Urgency Score Card */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-amber-500/20 bg-amber-50/60 p-5">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="size-4 text-amber-600" />
            <h4 className="font-black text-sm text-slate-900 font-heading">
              {tx("আনুমানিক রেসকিউ জরুরি মাত্রা:")}{urgencyScore}<UiText source={"/১০০"} /></h4>
          </div>
          <p className="mt-1 text-xs text-slate-600 leading-relaxed max-w-lg">
            {tx("নিরাপদ পিকআপের সময়সীমার ওপর ভিত্তি করে এই স্কোর স্বয়ংক্রিয়ভাবে নির্ধারিত হয়, যা নিকটবর্তী ভলান্টিয়ারদের দ্রুত রেসপন্স করতে সহায়তা করে।")}</p>
        </div>
        <RescueClock deadline={draft.safePickupDeadline} compact />
      </div>

      {hasChecklistErrors && (
        <Alert
          tone="danger"
          title={tx("অসম্পূর্ণ চেকলিস্ট")}
          description={tx("অনুগ্রহ করে উপরের সবগুলো চেকলিস্টের ঘরে টিক চিহ্ন দিয়ে সম্মতি প্রদান করুন।")}
        />
      )}
    </div>
  );
}
