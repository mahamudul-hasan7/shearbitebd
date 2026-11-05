import {
  ArrowRight,
  Bike,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  PackageOpen,
  Phone,
  QrCode,
  Radio,
  Refrigerator,
  ShieldCheck,
  Thermometer,
  Utensils,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { RescueClock } from "@/components/donor/rescue-clock";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  FOOD_CATEGORY_LABELS,
  PriorityLevel,
  STORAGE_CONDITION_LABELS,
} from "@/lib/constants/domain";
import { DonationStatus, STATUS_META } from "@/lib/constants/statuses";
import { ROUTES } from "@/lib/routes";
import type { DonationView } from "@/types/domain";

const priorityLabelBn: Record<PriorityLevel, string> = {
  [PriorityLevel.LOW]: "স্বাভাবিক অগ্রাধিকার",
  [PriorityLevel.MEDIUM]: "সাধারণ অগ্রাধিকার",
  [PriorityLevel.HIGH]: "জরুরি অগ্রাধিকার",
  [PriorityLevel.URGENT]: "অতীব জরুরি",
};

// 4 Clear Logical Macro Stages for Clean Experience
const STEPS = [
  { key: "posted", label: "১. খাবার পোস্ট সম্পন্ন" },
  { key: "claimed", label: "২. মাস্তুল ক্লেইম করেছে" },
  { key: "transit", label: "৩. রাইডার পথে আছে" },
  { key: "delivered", label: "৪. সুবিধাবঞ্চিতদের মাঝে বিতরণ" },
];

function getStageIndex(status: DonationStatus): number {
  if (status === DonationStatus.DRAFT || status === DonationStatus.PUBLISHED || status === DonationStatus.AVAILABLE) {
    return 0;
  }
  if (status === DonationStatus.RESERVED) {
    return 1;
  }
  if (status === DonationStatus.ASSIGNED || status === DonationStatus.PICKED_UP || status === DonationStatus.DELIVERED) {
    return 2;
  }
  return 3;
}

function quantityLabel(donation: DonationView) {
  return `${donation.quantity.value} ${donation.quantity.unit.toLowerCase().replaceAll("_", " ")}`;
}

export function ActiveDonationCard({ donation }: { donation: DonationView }) {
  const currentStep = getStageIndex(donation.status);
  const rawImageUrl = donation.photoUrls[0];
  const imageUrl = (!rawImageUrl || rawImageUrl === "/images/donor-active-meal.png")
    ? "/images/surplus-food-containers.jpg"
    : rawImageUrl;

  const isRiderActive =
    donation.status === DonationStatus.ASSIGNED ||
    donation.status === DonationStatus.PICKED_UP;

  return (
    <div className="overflow-hidden rounded-3xl border border-emerald-500/30 bg-white p-6 sm:p-7 shadow-sm hover:border-emerald-500/50 transition-all">
      {/* Top Header: Title, Live Signal & Countdown Window */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between pb-6 border-b border-slate-100">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-800 border border-emerald-300/60 font-heading">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-2 bg-emerald-600" />
              </span>
              পিকআপ ও উদ্ধার কার্যক্রম চলমান
            </span>
            <span className="text-xs font-bold text-slate-500">
              {priorityLabelBn[donation.priority]}
            </span>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-mono text-slate-600">
              আইডি: {donation.id}
            </span>
          </div>

          <h3 className="mt-3 text-xl sm:text-2xl font-black text-slate-900 font-heading">
            {donation.title}
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
            {donation.description}
          </p>
        </div>

        <RescueClock deadline={donation.safePickupDeadline} compact />
      </div>

      {/* Middle Grid: 3 Logical Columns (Food Specs, Assigned Rider, Handover PIN) */}
      <div className="py-6 grid gap-6 md:grid-cols-12 items-center">
        {/* Col 1 (4 cols): Food & Pickup Specs */}
        <div className="md:col-span-4 space-y-3">
          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <Utensils className="size-4.5" />
            </span>
            <div>
              <p className="text-[11px] font-bold text-slate-500 font-heading">খাবারের পরিমাণ ও বিভাগ</p>
              <p className="text-xs font-black text-slate-900 font-heading mt-0.5">
                {quantityLabel(donation)} · {FOOD_CATEGORY_LABELS[donation.category]}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <MapPin className="size-4.5" />
            </span>
            <div>
              <p className="text-[11px] font-bold text-slate-500 font-heading">পিকআপ পয়েন্ট</p>
              <p className="text-xs font-black text-slate-900 font-heading mt-0.5">
                UIU ক্যাফেটেরিয়া গেট-২ ({donation.pickup.approximateArea})
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <Refrigerator className="size-4.5" />
            </span>
            <div>
              <p className="text-[11px] font-bold text-slate-500 font-heading">তাপমাত্রা ও নিরাপত্তা</p>
              <p className="text-xs font-black text-slate-900 font-heading mt-0.5">
                {STORAGE_CONDITION_LABELS[donation.storageCondition]} (থার্মাল ফয়েল বক্স)
              </p>
            </div>
          </div>
        </div>

        {/* Col 2 (5 cols): Assigned Volunteer Rider Telemetry */}
        <div className="md:col-span-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/70">
            <span className="text-[11px] font-black uppercase text-slate-500 font-heading">
              নির্ধারিত ভলান্টিয়ার রাইডার
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
              <span className="size-1.5 rounded-full bg-emerald-600 animate-pulse" />
              অন-রুট (৮ মিনিট বাকি)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-emerald-600 text-white shadow-xs">
              <Bike className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-slate-900 font-heading">
                তানভীর আহমেদ
              </p>
              <p className="text-xs text-slate-600 font-mono mt-0.5 truncate">
                যান: পালসার ১৫০ (ঢাকা মেট্রো-হ-১২-৩৪৫৬)
              </p>
            </div>
            <a
              href="tel:+8801712345678"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-emerald-800 transition-colors shadow-2xs shrink-0"
              title="ভলান্টিয়ারকে কল দিন"
            >
              <Phone className="size-3.5 text-emerald-600" />
              <span>কল দিন</span>
            </a>
          </div>

          <p className="mt-2.5 text-[11px] text-slate-500 flex items-center gap-1.5">
            <Radio className="size-3 text-emerald-600 animate-pulse" />
            লাইভ রুট: <strong>মাদানী এভিনিউ অতিক্রম করছেন</strong>
          </p>
        </div>

        {/* Col 3 (3 cols): Prominent Handover OTP PIN Box */}
        <div className="md:col-span-3 rounded-2xl border border-emerald-300/80 bg-gradient-to-b from-emerald-50/80 to-white p-4 text-center shadow-2xs">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-900 font-heading">
            হ্যান্ডওভার পিন (OTP)
          </p>
          <p className="text-[10px] text-emerald-700 mt-0.5">
            রাইডারকে দেখানোর কোড
          </p>
          <div className="mt-2 inline-block rounded-xl bg-white px-4 py-1.5 border border-emerald-300 shadow-xs">
            <span className="font-mono text-2xl font-black tracking-widest text-emerald-950">
              ৭৪২৯
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Step Bar & Action Link */}
      <div className="pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* 4 Step Progress Indicators */}
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-4 gap-2">
            {STEPS.map((step, idx) => {
              const isDone = idx < currentStep;
              const isCurrent = idx === currentStep;
              return (
                <div key={step.key} className="space-y-1.5">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      isCurrent
                        ? "bg-emerald-600 shadow-xs"
                        : isDone
                        ? "bg-emerald-400"
                        : "bg-slate-200"
                    }`}
                  />
                  <p
                    className={`text-[11px] font-heading truncate ${
                      isCurrent
                        ? "font-black text-emerald-900"
                        : isDone
                        ? "font-bold text-slate-700"
                        : "font-medium text-slate-400"
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <ButtonLink
          href={ROUTES.donor.donationTracking(donation.id)}
          size="sm"
          variant="primary"
          rightIcon={<ArrowRight className="size-4" />}
          className="font-bold text-xs shrink-0 shadow-xs"
        >
          লাইভ ম্যাপ ট্র্যাকিং দেখুন
        </ButtonLink>
      </div>
    </div>
  );
}
