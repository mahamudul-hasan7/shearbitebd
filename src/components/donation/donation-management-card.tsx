"use client";

import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileCheck2,
  KeyRound,
  MapPin,
  Navigation,
  PackageCheck,
  ShieldCheck,
  Truck,
  Users,
  Utensils,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { RescueClock } from "@/components/donor/rescue-clock";
import { donationLifecycleProgress, isClosedDonation } from "@/features/donations/donation-management";
import { donationImageUrl, formatDonationDateTime, formatDonationQuantity } from "@/features/donations/donation-presentation";
import { FOOD_CATEGORY_LABELS } from "@/lib/constants/domain";
import { DonationStatus } from "@/lib/constants/statuses";
import { ROUTES } from "@/lib/routes";
import type { DonationView } from "@/types/domain";
import { cn } from "@/lib/utils";

const CLOCK_STATUSES = new Set<DonationStatus>([
  DonationStatus.PUBLISHED,
  DonationStatus.AVAILABLE,
  DonationStatus.RESERVED,
  DonationStatus.ASSIGNED,
]);

const STATUS_BADGE_CONFIG: Record<
  DonationStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  [DonationStatus.DRAFT]: {
    label: "খসড়া তালিকা",
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
    dot: "bg-slate-400",
  },
  [DonationStatus.PUBLISHED]: {
    label: "উদ্বৃত্ত খাবার প্রস্তুত",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  [DonationStatus.AVAILABLE]: {
    label: "উদ্ধারের অপেক্ষায়",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  [DonationStatus.RESERVED]: {
    label: "এনজিও ক্লেইম করেছে",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  [DonationStatus.ASSIGNED]: {
    label: "রাইডার নির্ধারিত · পথে",
    bg: "bg-sky-50",
    text: "text-sky-800",
    border: "border-sky-200",
    dot: "bg-sky-500 animate-pulse",
  },
  [DonationStatus.PICKED_UP]: {
    label: "পিকআপ সম্পন্ন · ট্রানজিটে",
    bg: "bg-indigo-50",
    text: "text-indigo-800",
    border: "border-indigo-200",
    dot: "bg-indigo-500 animate-pulse",
  },
  [DonationStatus.DELIVERED]: {
    label: "শেল্টারে পৌঁছেছে",
    bg: "bg-teal-50",
    text: "text-teal-800",
    border: "border-teal-200",
    dot: "bg-teal-500",
  },
  [DonationStatus.DISTRIBUTED]: {
    label: "সফল বিতরণ সম্পন্ন",
    bg: "bg-emerald-100/80",
    text: "text-emerald-900",
    border: "border-emerald-300",
    dot: "bg-emerald-600",
  },
  [DonationStatus.CANCELLED]: {
    label: "বাতিলকৃত",
    bg: "bg-slate-100",
    text: "text-slate-600",
    border: "border-slate-200",
    dot: "bg-slate-400",
  },
  [DonationStatus.EXPIRED]: {
    label: "মেয়াদোত্তীর্ণ",
    bg: "bg-rose-50",
    text: "text-rose-800",
    border: "border-rose-200",
    dot: "bg-rose-500",
  },
  [DonationStatus.DISPUTED]: {
    label: "পর্যালোচনায়",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
};

const RESCUE_STAGES = [
  { key: "posted", label: "পোস্টকৃত" },
  { key: "claimed", label: "এনজিও ক্লেইম" },
  { key: "picked_up", label: "হ্যান্ডওভার ও পিকআপ" },
  { key: "distributed", label: "বিতরণ সম্পন্ন" },
] as const;

function getStageIndex(status: DonationStatus): number {
  switch (status) {
    case DonationStatus.DRAFT:
    case DonationStatus.PUBLISHED:
    case DonationStatus.AVAILABLE:
      return 0;
    case DonationStatus.RESERVED:
      return 1;
    case DonationStatus.ASSIGNED:
    case DonationStatus.PICKED_UP:
    case DonationStatus.DELIVERED:
      return 2;
    case DonationStatus.DISTRIBUTED:
      return 3;
    default:
      return -1;
  }
}

export function DonationManagementCard({ donation }: { donation: DonationView }) {
  const isUrgent = donation.priority === "URGENT" || donation.priority === "HIGH";
  const badgeConfig = STATUS_BADGE_CONFIG[donation.status] ?? {
    label: donation.status,
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
    dot: "bg-slate-400",
  };
  const currentStageIndex = getStageIndex(donation.status);
  const isInRescue = [
    DonationStatus.RESERVED,
    DonationStatus.ASSIGNED,
    DonationStatus.PICKED_UP,
    DonationStatus.DELIVERED,
  ].includes(donation.status);
  const isCompleted = donation.status === DonationStatus.DISTRIBUTED;

  return (
    <div className="group overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white shadow-2xs hover:border-emerald-500/70 hover:shadow-xl hover:shadow-emerald-950/5 transition-all duration-300">
      <div className="grid lg:grid-cols-[16rem_minmax(0,1fr)]">
        {/* 1. Food Visual Thumbnail */}
        <div className="relative min-h-52 overflow-hidden bg-slate-100 lg:min-h-full">
          <Image
            src={donationImageUrl(donation)}
            alt={donation.title}
            fill
            sizes="(max-width: 1024px) 100vw, 16rem"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

          {/* Status Badge Tag */}
          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold backdrop-blur-md shadow-xs font-heading",
                badgeConfig.bg,
                badgeConfig.text,
                "border",
                badgeConfig.border
              )}
            >
              <span className={cn("size-2 rounded-full", badgeConfig.dot)} />
              <span>{badgeConfig.label}</span>
            </span>

            {isUrgent && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black text-slate-950 shadow-xs font-heading">
                <Zap className="size-3 fill-slate-950" />
                জরুরি
              </span>
            )}
          </div>

          {/* Reference ID Pill */}
          <div className="absolute bottom-3 left-3 text-white">
            <span className="rounded-lg bg-black/50 px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider backdrop-blur-xs">
              রেফারেন্স: #{donation.id.slice(-6).toUpperCase()}
            </span>
          </div>
        </div>

        {/* 2. Main Details & Status Body */}
        <div className="p-5 sm:p-6 flex flex-col justify-between space-y-4">
          <div>
            {/* Top Category & Rescue Countdown */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <span className="inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-black text-emerald-800 font-heading">
                  {FOOD_CATEGORY_LABELS[donation.category]}
                </span>
                <h3 className="mt-1.5 text-lg sm:text-xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors font-heading leading-snug">
                  {donation.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600 font-normal">
                  {donation.description}
                </p>
              </div>

              {CLOCK_STATUSES.has(donation.status) && (
                <div className="shrink-0 self-start sm:self-auto">
                  <RescueClock deadline={donation.safePickupDeadline} compact />
                </div>
              )}
            </div>

            {/* 3 Core Info Badges */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-heading">
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                  <Utensils className="size-3.5 text-emerald-600" /> খাবারের পরিমাণ
                </span>
                <p className="mt-1 text-sm font-black text-slate-900">
                  {formatDonationQuantity(donation)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                  <MapPin className="size-3.5 text-emerald-600" /> পিকআপ অবস্থান
                </span>
                <p className="mt-1 text-xs font-black text-slate-800 truncate">
                  {donation.pickup.approximateArea}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                  <CalendarClock className="size-3.5 text-emerald-600" /> নিরাপদ খাওয়ার সময়
                </span>
                <p className="mt-1 text-xs font-black text-slate-800 truncate">
                  {formatDonationDateTime(donation.safePickupDeadline)}
                </p>
              </div>
            </div>

            {/* 4-Step Rescue Journey Milestone Tracker */}
            {currentStageIndex >= 0 && (
              <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                <div className="flex items-center justify-between text-[11px] font-heading mb-2">
                  <span className="font-bold text-slate-500 flex items-center gap-1">
                    <ShieldCheck className="size-3.5 text-emerald-600" />
                    রেসকিউ প্রসেস ট্র্যাকার
                  </span>
                  <span className="font-bold text-emerald-700">
                    {isCompleted
                      ? "বিতরণ সফলভাবে সম্পন্ন"
                      : isInRescue
                      ? "উদ্ধার ও ডেলিভারি চলমান"
                      : "ক্লেইমের অপেক্ষায়"}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1 sm:gap-2">
                  {RESCUE_STAGES.map((stage, idx) => {
                    const isPassed = idx < currentStageIndex;
                    const isCurrent = idx === currentStageIndex;
                    return (
                      <div key={stage.key} className="text-center">
                        <div
                          className={cn(
                            "h-1.5 rounded-full transition-all duration-300",
                            isPassed || (isCurrent && isCompleted)
                              ? "bg-emerald-600"
                              : isCurrent
                              ? "bg-emerald-500 animate-pulse"
                              : "bg-slate-200"
                          )}
                        />
                        <span
                          className={cn(
                            "mt-1.5 block text-[10px] font-bold truncate",
                            isPassed || isCurrent
                              ? "text-emerald-800"
                              : "text-slate-400"
                          )}
                        >
                          {stage.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 3. Action Buttons & Operational Footer */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {isInRescue ? (
                <>
                  <Link
                    href={ROUTES.donor.donationTracking(donation.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-colors font-heading"
                  >
                    <Navigation className="size-3.5" />
                    <span>লাইভ উদ্ধার ট্র্যাকিং</span>
                  </Link>
                  <Link
                    href={ROUTES.donor.donation(donation.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors font-heading shadow-2xs"
                  >
                    <KeyRound className="size-3.5 text-emerald-600" />
                    <span>হ্যান্ডওভার ওটিপি পিন</span>
                  </Link>
                </>
              ) : isCompleted ? (
                <>
                  <Link
                    href={ROUTES.donor.donation(donation.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-colors font-heading"
                  >
                    <FileCheck2 className="size-3.5" />
                    <span>বিতরণ অডিট রসিদ ও ফটো</span>
                  </Link>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                    <CheckCircle2 className="size-3.5" /> ১০০% নিরাপদ বিতরণ
                  </span>
                </>
              ) : (
                <>
                  <Link
                    href={ROUTES.donor.donation(donation.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-colors font-heading"
                  >
                    <Eye className="size-3.5" />
                    <span>বিস্তারিত দেখুন ও পরিচালনা</span>
                  </Link>
                </>
              )}
            </div>

            <span className="text-[11px] text-slate-400 font-medium">
              আপডেট:{" "}
              {new Date(donation.updatedAt).toLocaleTimeString("bn-BD", {
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
