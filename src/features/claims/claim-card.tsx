"use client";

import Image from "next/image";
import {
  ArrowRight,
  Bike,
  CheckCircle2,
  Clock3,
  MapPin,
  PackageCheck,
  PackageOpen,
  ShieldCheck,
  Sparkles,
  UserCheck2,
  UserRoundCheck,
} from "lucide-react";
import { RescueClock } from "@/components/donor/rescue-clock";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  claimEtaLabel,
  claimEtaLabelBn,
  formatClaimDateTime,
  formatClaimDateTimeBn,
} from "@/features/claims/claim-presentation";
import {
  donationImageUrl,
  formatDonationDateTimeBn,
  formatDonationQuantity,
  formatDonationQuantityBn,
  getDonationTitleBn,
  getDonorOrganizationBn,
} from "@/features/donations/donation-presentation";
import { ClaimStatus } from "@/lib/constants/statuses";
import { useLanguage } from "@/lib/i18n/language-context";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { ClaimCoordinationDetails } from "@/services";

export function ClaimCard({ item }: { item: ClaimCoordinationDetails }) {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const { claim, donation, donorOrganization, volunteer } = item;
  const showRescueClock = [ClaimStatus.RESERVED, ClaimStatus.ASSIGNED].includes(claim.status);
  const showEta = [ClaimStatus.ASSIGNED, ClaimStatus.PICKED_UP].includes(claim.status);

  const titleBn = getDonationTitleBn(donation.title);
  const donorBn = getDonorOrganizationBn(donorOrganization);

  const displayTitle = isBn ? titleBn || donation.title : donation.title;
  const displayDonor = isBn ? donorBn || donorOrganization : donorOrganization;

  return (
    <Card className="group overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs transition duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md">
      <div className="grid md:grid-cols-[14rem_minmax(0,1fr)] xl:grid-cols-[16rem_minmax(0,1fr)]">
        {/* Left Side: Food Image Thumbnail */}
        <div className="relative min-h-52 overflow-hidden bg-emerald-50 sm:min-h-56 md:min-h-full">
          <Image
            src={donationImageUrl(donation)}
            alt={displayTitle}
            fill
            sizes="(max-width: 768px) 100vw, 256px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* Match Score Badge */}
          <div className="absolute left-3 top-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/95 px-2.5 py-1 text-xs font-black text-white shadow-md backdrop-blur-xs">
              <Sparkles className="size-3 text-amber-300" />
              {isBn ? `${claim.matchScore}% ম্যাচ` : `${claim.matchScore}% match`}
            </span>
          </div>

          {/* ID Pill on bottom */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <span className="rounded-lg bg-black/60 px-2 py-0.5 font-mono text-[11px] font-bold text-white/90 backdrop-blur-xs">
              #{claim.id.replace("claim-", "")}
            </span>
            <span className="text-[11px] font-medium text-white/80">
              {donation.pickup.distanceKm ? `~${donation.pickup.distanceKm} km` : ""}
            </span>
          </div>
        </div>

        {/* Right Side: Main Logistics Body */}
        <div className="flex flex-col justify-between p-5 sm:p-6">
          <div>
            {/* Top Row: Status badge & Update timestamp */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <StatusBadge status={claim.status} />
                {[ClaimStatus.RESERVED, ClaimStatus.ASSIGNED, ClaimStatus.PICKED_UP].includes(claim.status) && (
                  <span className="relative flex size-2.5">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
                  </span>
                )}
              </div>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Clock3 className="size-3.5 text-slate-400" />
                {isBn ? `আপডেট: ${formatClaimDateTimeBn(claim.updatedAt)}` : `Updated ${formatClaimDateTime(claim.updatedAt)}`}
              </p>
            </div>

            {/* Title & Donor Line */}
            <div className="mt-3">
              <h3 className="text-lg font-black text-slate-900 sm:text-xl">{displayTitle}</h3>
              {isBn && titleBn !== donation.title && (
                <p className="text-xs text-slate-500">{donation.title}</p>
              )}
              <div className="mt-1 flex items-center gap-2">
                <span className="text-sm font-bold text-emerald-800">{displayDonor}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                  <ShieldCheck className="size-3 text-emerald-600" />
                  {isBn ? "ভেরিফায়েড খাদ্যদাতা" : "Verified donor"}
                </span>
              </div>
            </div>

            {/* 4 Logistics Metric Pills */}
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 text-xs text-slate-700">
                <MapPin className="size-4 shrink-0 text-emerald-600" />
                <div className="min-w-0">
                  <span className="block font-bold text-slate-900 truncate">
                    {donation.pickup.approximateArea}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {isBn ? "পিকআপ এলাকা" : "Pickup area"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 text-xs text-slate-700">
                <PackageOpen className="size-4 shrink-0 text-emerald-600" />
                <div className="min-w-0">
                  <span className="block font-bold text-slate-900 truncate">
                    {isBn ? formatDonationQuantityBn(donation) : formatDonationQuantity(donation)}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    ~{donation.quantity.estimatedMeals} {isBn ? "জনের খাবার" : "estimated meals"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 text-xs text-slate-700">
                {volunteer ? (
                  <UserRoundCheck className="size-4 shrink-0 text-blue-600" />
                ) : (
                  <Bike className="size-4 shrink-0 text-amber-500" />
                )}
                <div className="min-w-0">
                  <span className="block font-bold text-slate-900 truncate">
                    {volunteer ? volunteer.displayName : isBn ? "ভলান্টিয়ার বরাদ্দ অপেক্ষমাণ" : "Awaiting volunteer"}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {volunteer
                      ? isBn
                        ? "ভেরিফাইড রাইডার"
                        : "Assigned rider"
                      : isBn
                        ? "অটো-ম্যাচিং সক্রিয়"
                        : "Auto-matching"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 text-xs text-slate-700">
                <Clock3 className="size-4 shrink-0 text-emerald-600" />
                <div className="min-w-0">
                  <span className="block font-bold text-slate-900 truncate">
                    {formatDonationDateTimeBn(donation.preparationTime)}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {isBn ? "রান্নার সময়" : "Preparation time"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Telemetry Strip & Actions Footer */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            {/* Left side info */}
            <div className="flex flex-wrap items-center gap-3">
              {showRescueClock && (
                <RescueClock deadline={donation.safePickupDeadline} compact />
              )}
              {showEta && (
                <div className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-1.5 text-xs text-blue-900">
                  <Bike className="size-4 text-blue-600" />
                  <div>
                    <span className="font-semibold text-blue-700">
                      {claim.status === ClaimStatus.PICKED_UP
                        ? isBn
                          ? "শেল্টারে পৌঁছানোর সময়: "
                          : "ETA to shelter: "
                        : isBn
                          ? "পিকআপে পৌঁছানোর সময়: "
                          : "ETA to pickup: "}
                    </span>
                    <span className="font-black text-blue-950">
                      {isBn ? claimEtaLabelBn(claim) : claimEtaLabel(claim)}
                    </span>
                  </div>
                </div>
              )}
              {claim.status === ClaimStatus.DELIVERED && (
                <div className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  {isBn
                    ? "খাবার সফলভাবে পৌঁছেছে · বিতরণ রিপোর্ট দিন"
                    : "Delivered to NGO · Ready for distribution record"}
                </div>
              )}
              {claim.status === ClaimStatus.DISTRIBUTED && (
                <div className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">
                  <PackageCheck className="size-4 text-emerald-600" />
                  {isBn
                    ? "বিতরণ সম্পন্ন ও জাতীয় রেকর্ডে যুক্ত"
                    : "Distributed & added to impact records"}
                </div>
              )}
            </div>

            {/* Right side buttons */}
            <div className="flex items-center gap-2">
              {claim.status === ClaimStatus.DELIVERED && (
                <ButtonLink
                  href={ROUTES.ngo.distribution(claim.id)}
                  size="sm"
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  {isBn ? "বিতরণ রিপোর্ট দিন" : "Record distribution"}
                </ButtonLink>
              )}
              {claim.status === ClaimStatus.PICKED_UP && (
                <ButtonLink
                  href={ROUTES.ngo.confirmDelivery(claim.id)}
                  size="sm"
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  {isBn ? "ডেলিভারি নিশ্চিত করুন" : "Confirm delivery"}
                </ButtonLink>
              )}
              <ButtonLink
                href={ROUTES.ngo.claim(claim.id)}
                variant="outline"
                size="sm"
                rightIcon={<ArrowRight className="size-3.5" />}
              >
                {isBn ? "ক্লেইম বিবরণ ও ট্র্যাকিং" : "View claim"}
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
