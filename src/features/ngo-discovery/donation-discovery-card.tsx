"use client";

import Image from "next/image";
import {
  AlertTriangle,
  Bookmark,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock3,
  MapPin,
  PackageOpen,
  Refrigerator,
  ShieldCheck,
  Sparkles,
  Utensils,
} from "lucide-react";
import { RescueClock } from "@/components/donor/rescue-clock";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  CATEGORY_LABELS_BN,
  DIETARY_LABELS_BN,
  PRIORITY_LABELS_BN,
  STORAGE_LABELS_BN,
  UNIT_LABELS_BN,
  donationImageUrl,
  formatDonationDateTimeBn,
} from "@/features/donations/donation-presentation";
import { FOOD_CATEGORY_LABELS, PriorityLevel } from "@/lib/constants/domain";
import { useLanguage } from "@/lib/i18n/language-context";
import { ROUTES } from "@/lib/routes";
import type { NGODiscoveryItem } from "@/services";

const TITLE_TRANSLATIONS: Record<string, string> = {
  "Rice, chicken curry, and vegetables": "ভাত, মুরগির মাংসের তরকারি ও তাজা সবজি",
  "Packaged bread and snack boxes": "প্যাকেটজাত রুটি ও নিরামিষ স্ন্যাক্স বক্স",
  "Seasonal fruit and vegetables": "তাজা মৌসুমি ফলমূল ও কাঁচা শাকসবজি",
  "Warm vegetable biryani with egg": "গরম ভেজিটেবল বিরিয়ানি ও সিদ্ধ ডিম",
  "Fresh bakery buns and rolls": "তাজা বেকারি বান ও সুস্বাদু রোলস",
  "Sealed pantry rescue packs": "সিল্ড খাদ্যশস্য, চাল, মসুর ডাল ও তেল প্যাক",
  "Fresh fruit and vegetable crates": "তাজা ফলমূল ও মৌসুমী শাকসবজির ক্র্যাট",
  "Chilled yoghurt cups": "হিমায়িত মিষ্টি ও টক দইয়ের কাপ",
  "Fresh buffet meal boxes": "বুফে লাঞ্চ মিল বক্স (চিকেন, রাইস ও ডাল)",
  "Mutton kacchi biryani and chicken roast portions": "খাসির ঐতিহ্যবাহী কাচ্চি বিরিয়ানি ও চিকেন রোস্ট",
  "Bhuna khichuri, boiled eggs, and vegetable curry": "গরম ভুনা খিচুড়ি, ডিম ভুনা ও মিক্সড সবজি",
  "Fresh chicken patties, vegetable rolls, and sweet buns": "তাজা চিকেন প্যাটিস, ভেজিটেবল রোল ও মিষ্টি বান",
  "Farm fresh carrots, potatoes, tomatoes, and ripe bananas": "তাজা গাজর, আলু, টমেটো ও পাকা কলার ক্র্যাট",
  "Steamed aromatic rice, lentils, and fresh fish curry": "সুগন্ধি ভাত, ঘন মসুর ডাল ও তাজা রুই মাছের ঝোল",
};

const DESCRIPTION_TRANSLATIONS: Record<string, string> = {
  "Freshly prepared lunch portions remaining after the campus service window.":
    "ক্যাম্পাস সার্ভিসের পর স্বাস্থ্যসম্মত হট-বক্সে সংরক্ষিত তাজা দুপুরের খাবার। শতভাগ পুষ্টিকর ও হালাল।",
  "Individually packed buns, sliced bread, and vegetarian snack boxes from a campus event.":
    "ক্যাম্পাস ইভেন্ট শেষে উদ্বৃত্ত অক্ষত প্যাকেটজাত রুটি ও নিরামিষ স্ন্যাক্স। দ্রুত পিকআপের জন্য প্রস্তুত।",
  "Uncut produce sorted into reusable crates for community distribution.":
    "রি-ইউজেবল ক্র্যাটে সংরক্ষিত তাজা শাকসবজি ও ফল, যা সুবিধাবঞ্চিতদের মাঝে বিতরণের জন্য আদর্শ।",
  "Sealed rice, lentils, cooking oil, and spice packs prepared for community meal programs.":
    "কমিউনিটি মিলের জন্য প্রস্তুতকৃত অক্ষত চাল, ডাল, ভোজ্যতেল ও মশলার সিল্ড খাদ্যপ্যাক।",
  "Sorted uncut seasonal produce in reusable crates for same-day community distribution.":
    "একই দিনে বিতরণের জন্য পুনঃব্যবহারযোগ্য ক্র্যাটে সংরক্ষিত তাজা মৌসুমি ফলমূল ও শাকসবজি।",
  "Factory-sealed yoghurt cups held under refrigeration and ready for quick collection.":
    "রেফ্রিজারেশনে সংরক্ষিত ফ্যাক্টরি-সিল্ড তাজা দইয়ের কাপ, কোল্ড ক্যারিয়ারে দ্রুত সংগ্রহের জন্য প্রস্তুত।",
  "Covered rice, grilled chicken, lentils, and mixed vegetables packed after a corporate lunch service.":
    "করপোরেট লাঞ্চ সার্ভিসের পর হট-হোল্ডিং কন্টেইনারে সিল্ড সুস্বাদু গ্রিল্ড চিকেন, পোলাও ও সবজি।",
  "Freshly prepared wedding reception surplus. Kept in food-grade insulated hot boxes at >65°C. Complete meals with boiled eggs.":
    "বিবাহোত্তর সংবর্ধনা অনুষ্ঠানের পর ৬৫°C এর অধিক তাপে ইনসুলেটেড হট-বক্সে সংরক্ষিত প্রিমিয়াম কাচ্চি বিরিয়ানি ও রোস্ট।",
  "Surplus lunch from university seminar hall. Sealed in high-grade catering trays, warm and fresh.":
    "সেমিনার হল থেকে উদ্বৃত্ত গরম ও তাজা ভুনা খিচুড়ি ও ডিমের ক্যাটারিং ট্রে। সম্পূর্ণ স্বাস্থ্যসম্মত ও সিল্ড।",
  "Evening batch bakery products packaged in individual food-grade wrapping from today's afternoon baking.":
    "আজ বিকেলের বেকিং সেশন থেকে প্রস্তুত তাজা চিকেন প্যাটিস ও রোল। ফুড-গ্রেড র্যাপিংয়ে সিল করা।",
  "Wholesale farm surplus produce crates suitable for direct distribution to orphanage meal programs.":
    "এতিমখানা ও আশ্রয়কেন্দ্রের রান্নাঘরের জন্য সরাসরি খামার থেকে সংগৃহীত তাজা শাকসবজি ও ফলমূল।",
  "Hygienically covered dinner meal portions remaining after cafeteria service window.":
    "ক্যাফেটেরিয়া ডিনার সার্ভিসের পর স্বাস্থ্যসম্মত উপায়ে সংরক্ষিত গরম ভাত, ডাল ও তাজা মাছের তরকারি।",
};

function priorityBadgeConfig(priority: PriorityLevel, isBn: boolean): { tone: BadgeTone; label: string } {
  if (priority === PriorityLevel.URGENT) {
    return { tone: "danger", label: isBn ? "🚨 অতি জরুরি (<২ ঘণ্টা)" : "🚨 Urgent" };
  }
  if (priority === PriorityLevel.HIGH) {
    return { tone: "warning", label: isBn ? "⚡ উচ্চ অগ্রাধিকার" : "⚡ High priority" };
  }
  if (priority === PriorityLevel.MEDIUM) {
    return { tone: "info", label: isBn ? "উপলব্ধ উদ্ধার" : "Available" };
  }
  return { tone: "neutral", label: isBn ? "সাধারণ লট" : "Standard" };
}

export function DonationDiscoveryCard({
  item,
  saved,
  onToggleSaved,
}: {
  item: NGODiscoveryItem;
  saved: boolean;
  onToggleSaved: () => void;
}) {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const donation = item.donation;

  const title = isBn ? TITLE_TRANSLATIONS[donation.title] || donation.title : donation.title;
  const description = isBn
    ? DESCRIPTION_TRANSLATIONS[donation.description] || donation.description
    : donation.description;
  const categoryLabel = isBn
    ? CATEGORY_LABELS_BN[donation.category] || FOOD_CATEGORY_LABELS[donation.category]
    : FOOD_CATEGORY_LABELS[donation.category];
  const priorityInfo = priorityBadgeConfig(donation.priority, isBn);
  const distanceFormatted = donation.pickup.distanceKm !== undefined ? donation.pickup.distanceKm.toFixed(1) : "৩.২";

  return (
    <Card className="group overflow-hidden border-slate-200/90 shadow-xs transition hover:border-emerald-300 hover:shadow-md">
      <div className="grid lg:grid-cols-[18rem_minmax(0,1fr)]">
        {/* Left Side: Visual Image & Floating Badges */}
        <div className="relative min-h-[15rem] overflow-hidden bg-slate-900 lg:min-h-full">
          <Image
            src={donationImageUrl(donation)}
            alt={donation.title}
            fill
            sizes="(max-width: 1024px) 100vw, 288px"
            className="object-cover transition duration-300 group-hover:scale-105"
          />

          {/* Top Overlays */}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-2 p-3.5">
            <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-slate-900/80 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs backdrop-blur-md">
              {priorityInfo.label}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-950/85 px-2.5 py-1 text-[11px] font-black text-emerald-300 shadow-xs backdrop-blur-md">
              <Sparkles className="size-3 text-emerald-400" />
              {item.matchScore}% {isBn ? "ম্যাচ" : "fit"}
            </span>
          </div>

          {/* Bottom Gradient with Donor Name */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-transparent p-4 pt-12 text-white">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-emerald-400" />
              <p className="text-sm font-black tracking-tight">{item.donorOrganization}</p>
            </div>
            <p className="mt-0.5 text-[11px] font-semibold text-slate-300">
              {isBn ? "বিএফএসএ ভেরিফায়েড খাদ্য পার্টনার" : "BFSA Verified Food Donor"}
            </p>
          </div>
        </div>

        {/* Right Side: Information & Action Strip */}
        <div className="flex flex-col justify-between p-5 sm:p-6">
          <div>
            {/* Category, Dietary & Eligibility Badges Header */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 ring-1 ring-inset ring-emerald-600/20">
                  <Utensils className="mr-1.5 size-3.5" />
                  {categoryLabel}
                </span>

                {donation.dietaryTypes.slice(0, 2).map((diet) => (
                  <span
                    key={diet}
                    className="inline-flex items-center rounded-lg bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-800 ring-1 ring-inset ring-amber-600/20"
                  >
                    {isBn ? DIETARY_LABELS_BN[diet] || diet : diet}
                  </span>
                ))}

                {item.eligibility.eligible ? (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-teal-800 ring-1 ring-inset ring-teal-600/20">
                    <CheckCircle2 className="size-3 text-teal-600" />
                    {isBn ? "রেসকিউয়ের জন্য প্রস্তুত" : "Eligible"}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-800 ring-1 ring-inset ring-rose-600/20">
                    <AlertTriangle className="size-3 text-rose-600" />
                    {isBn ? "যোগ্যতা যাচাই আবশ্যক" : "Review eligibility"}
                  </span>
                )}
              </div>

              {/* Bookmark Button */}
              <button
                type="button"
                onClick={onToggleSaved}
                aria-label={saved ? "সংরক্ষণ তালিকা থেকে সরান" : "সংরক্ষণ করুন"}
                className={`grid size-9 place-items-center rounded-xl border transition ${
                  saved
                    ? "border-amber-300 bg-amber-50 text-amber-700"
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <Bookmark className={`size-4.5 ${saved ? "fill-amber-500 text-amber-600" : ""}`} />
              </button>
            </div>

            {/* Title & Description */}
            <div className="mt-3 flex flex-col gap-1.5">
              <h3 className="text-xl font-black tracking-tight text-slate-900 group-hover:text-emerald-950 sm:text-2xl">
                {title}
              </h3>
              <p className="line-clamp-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                {description}
              </p>
            </div>

            {/* 4 Key Logistics / Operational Metrics */}
            <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {/* Metric 1: Location & Distance */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <MapPin className="size-3.5 text-emerald-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {isBn ? "দূরত্ব ও জোন" : "Distance"}
                  </span>
                </div>
                <p className="mt-1 text-xs font-black text-slate-900">
                  {distanceFormatted} {isBn ? "কিমি" : "km"} · {donation.pickup.approximateArea}
                </p>
              </div>

              {/* Metric 2: Quantity & Meals */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <PackageOpen className="size-3.5 text-teal-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {isBn ? "পরিমাণ ও আহার" : "Quantity"}
                  </span>
                </div>
                <p className="mt-1 text-xs font-black text-slate-900">
                  {donation.quantity.estimatedMeals} {isBn ? "মিলস" : "meals"} ({donation.quantity.value}{" "}
                  {isBn ? UNIT_LABELS_BN[donation.quantity.unit] || donation.quantity.unit : donation.quantity.unit})
                </p>
              </div>

              {/* Metric 3: Storage Condition */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Refrigerator className="size-3.5 text-blue-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {isBn ? "সংরক্ষণ তাপমাত্রা" : "Storage"}
                  </span>
                </div>
                <p className="mt-1 truncate text-xs font-black text-slate-900" title={STORAGE_LABELS_BN[donation.storageCondition]}>
                  {isBn ? STORAGE_LABELS_BN[donation.storageCondition] : donation.storageCondition}
                </p>
              </div>

              {/* Metric 4: Preparation Time */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Clock3 className="size-3.5 text-amber-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {isBn ? "প্রস্তুতির সময়" : "Prepared"}
                  </span>
                </div>
                <p className="mt-1 text-xs font-black text-slate-900">
                  {formatDonationDateTimeBn(donation.preparationTime)}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Bar: Safe Countdown & Claim CTA */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            {/* Live Rescue Clock / Deadline */}
            <div className="flex items-center gap-2">
              <RescueClock deadline={donation.safePickupDeadline} compact />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <ButtonLink
                href={ROUTES.ngo.donation(donation.id)}
                variant="primary"
                size="md"
                leftIcon={<ShieldCheck className="size-4" />}
              >
                <span>{isBn ? "বিস্তারিত ও ক্লেইম করুন" : "View & Claim"}</span>
                <ChevronRight className="ml-1 size-4" />
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
