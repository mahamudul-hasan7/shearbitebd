"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Ban,
  CalendarClock,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck2,
  MapPin,
  ShieldCheck,
  Utensils,
} from "lucide-react";
import { DonationStatusTimeline } from "@/components/donation/donation-status-timeline";
import { ArchiveRowCard, type ArchiveRowTone } from "@/components/portal/archive-row-card";
import { Button, ButtonLink } from "@/components/ui/button";
import { ExecutiveDialog } from "@/components/ui/executive-dialog";
import {
  donationImageUrl,
  formatDonationDateTime,
  formatDonationQuantity,
} from "@/features/donations/donation-presentation";
import {
  FOOD_CATEGORY_LABELS,
  STORAGE_CONDITION_LABELS,
} from "@/lib/constants/domain";
import { DonationStatus } from "@/lib/constants/statuses";
import { getUiLocale } from "@/lib/i18n/locale";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { buildRescueProgress } from "@/lib/rescue-progress";
import { ROUTES } from "@/lib/routes";
import type { DonationView } from "@/types/domain";
import { cn } from "@/lib/utils";

function donationArchiveTone(status: DonationStatus): ArchiveRowTone {
  if (status === DonationStatus.CANCELLED) return "rose";
  if (status === DonationStatus.EXPIRED || status === DonationStatus.DISPUTED) return "amber";
  return "emerald";
}

function donationOutcomeBadge(status: DonationStatus, tx: ReturnType<typeof useUiText>, dark = false) {
  if (status === DonationStatus.CANCELLED) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold",
          dark
            ? "border-rose-400/35 bg-rose-500/20 text-rose-100"
            : "border-rose-200 bg-rose-100/85 text-rose-900",
        )}
      >
        <Ban className={cn("size-3", dark ? "text-rose-200" : "text-rose-700")} />
        {tx("বাতিলকৃত")}
      </span>
    );
  }
  if (status === DonationStatus.EXPIRED) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold",
          dark
            ? "border-amber-400/35 bg-amber-500/20 text-amber-100"
            : "border-amber-200 bg-amber-100/85 text-amber-900",
        )}
      >
        <Clock className={cn("size-3", dark ? "text-amber-200" : "text-amber-700")} />
        {tx("মেয়াদোত্তীর্ণ")}
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold",
        dark
          ? "border-emerald-400/35 bg-emerald-500/20 text-emerald-100"
          : "border-emerald-200 bg-emerald-100/80 text-emerald-900",
      )}
    >
      <CheckCircle2 className={cn("size-3", dark ? "text-emerald-200" : "text-emerald-600")} />
      {tx("সফল বিতরণ সম্পন্ন")}
    </span>
  );
}

function progressForDonation(donation: DonationView) {
  const currentClaim =
    donation.status === DonationStatus.AVAILABLE &&
    donation.latestClaim?.status === "CANCELLED"
      ? undefined
      : donation.latestClaim;
  const claimIsNewer =
    currentClaim &&
    (!donation.updatedAt || Date.parse(currentClaim.updatedAt) >= Date.parse(donation.updatedAt));
  return buildRescueProgress({
    scope: "donation",
    status: claimIsNewer ? currentClaim.status : donation.status,
    routeStage: currentClaim?.routeStage,
    publishedAt: donation.publishedAt,
    reservedAt: currentClaim?.reservedAt,
    assignedAt: currentClaim?.assignedAt,
    pickedUpAt: currentClaim?.pickedUpAt,
    deliveredAt: currentClaim?.deliveredAt,
    distributedAt: currentClaim?.distributedAt,
    updatedAt: claimIsNewer ? currentClaim.updatedAt : donation.updatedAt,
    cancellationReason: donation.cancellationReason,
  });
}

export function DonorDonationArchiveList({ donations }: { donations: DonationView[] }) {
  const tx = useUiText();
  const locale = getUiLocale();
  const [selected, setSelected] = useState<{ donation: DonationView; number: number } | null>(null);

  if (donations.length === 0) return null;

  const activeDialogDonation = selected?.donation;
  const activeDialogTone = activeDialogDonation
    ? donationArchiveTone(activeDialogDonation.status)
    : "emerald";

  return (
    <>
      <div className="grid gap-2.5">
        {donations.map((donation, index) => {
          const tone = donationArchiveTone(donation.status);
          const progress = progressForDonation(donation);

          return (
            <ArchiveRowCard
              key={donation.id}
              number={index + 1}
              tone={tone}
              title={donation.title}
              statusBadge={donationOutcomeBadge(donation.status, tx)}
              referenceCode={tx("Reference #{0}", donation.id.slice(-6).toUpperCase())}
              metaItems={
                <>
                  <span className="inline-flex items-center gap-1">
                    <Utensils className="size-3 shrink-0 text-emerald-600" />
                    {formatDonationQuantity(donation)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3 shrink-0 text-slate-400" />
                    {donation.pickup.approximateArea}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CalendarClock className="size-3 shrink-0 text-slate-400" />
                    {formatDonationDateTime(donation.updatedAt)}
                  </span>
                </>
              }
              progress={progress}
              onOpen={() => setSelected({ donation, number: index + 1 })}
            />
          );
        })}
      </div>

      <ExecutiveDialog
        open={Boolean(activeDialogDonation)}
        onClose={() => setSelected(null)}
        tone={activeDialogTone}
        size="lg"
        title={activeDialogDonation?.title ?? ""}
        leading={
          <span className="text-sm font-black tabular-nums">
            #{selected?.number.toLocaleString(locale)}
          </span>
        }
        badge={activeDialogDonation ? donationOutcomeBadge(activeDialogDonation.status, tx, true) : null}
        eyebrow={
          activeDialogDonation ? (
            <span className="font-mono">
              {tx("Reference #{0}", activeDialogDonation.id.slice(-6).toUpperCase())} ·{" "}
              {tx(FOOD_CATEGORY_LABELS[activeDialogDonation.category])}
            </span>
          ) : null
        }
        subtitle={
          activeDialogDonation ? (
            <>
              <ShieldCheck className="size-3.5 shrink-0 text-emerald-300" />
              <span>{tx("ShareBite BD donation audit trail")}</span>
              <span className="text-white/40">·</span>
              <span>{formatDonationDateTime(activeDialogDonation.updatedAt)}</span>
            </>
          ) : null
        }
        footer={
          activeDialogDonation && (
            <>
              <ButtonLink
                href={ROUTES.donor.donation(activeDialogDonation.id)}
                variant="outline"
                size="sm"
                leftIcon={<ExternalLink className="size-3.5" />}
                className="font-bold"
              >
                {tx("Open full page")}
              </ButtonLink>
              {activeDialogDonation.status === DonationStatus.DISTRIBUTED && (
                <a
                  href={`/api/certificates/${encodeURIComponent(activeDialogDonation.id)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-extrabold text-amber-900 shadow-2xs transition hover:bg-amber-100"
                >
                  <FileCheck2 className="size-3.5 text-amber-700" />
                  <span>{tx("Download CSR Certificate (PDF)")}</span>
                </a>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelected(null)}
                className="ml-auto font-bold"
              >
                {tx("বন্ধ করুন")}
              </Button>
            </>
          )
        }
      >
        {activeDialogDonation && (
          <div className="space-y-4">
            <DonationStatusTimeline
              status={activeDialogDonation.status}
              claim={activeDialogDonation.latestClaim}
              publishedAt={activeDialogDonation.publishedAt}
              updatedAt={activeDialogDonation.updatedAt}
              cancellationReason={activeDialogDonation.cancellationReason}
            />

            <div className="grid gap-3 rounded-2xl border border-slate-200/85 bg-white p-4 shadow-2xs sm:grid-cols-[7.5rem_minmax(0,1fr)]">
              <div className="relative h-28 overflow-hidden rounded-xl bg-slate-100 sm:h-full">
                <Image
                  src={donationImageUrl(activeDialogDonation)}
                  unoptimized={donationImageUrl(activeDialogDonation).startsWith("/api/photos/")}
                  alt={activeDialogDonation.title}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {tx("Food description")}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-700">
                    {activeDialogDonation.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2.5">
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-400">
                      <Utensils className="size-3 text-emerald-600" />
                      {tx("Food quantity")}
                    </span>
                    <p className="mt-0.5 text-xs font-black text-slate-900">
                      {formatDonationQuantity(activeDialogDonation)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2.5">
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-400">
                      <MapPin className="size-3 text-emerald-600" />
                      {tx("Pickup area")}
                    </span>
                    <p className="mt-0.5 text-xs font-black text-slate-900">
                      {activeDialogDonation.pickup.approximateArea}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2.5">
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-400">
                      <CalendarClock className="size-3 text-emerald-600" />
                      {tx("Safe eat deadline")}
                    </span>
                    <p className="mt-0.5 text-xs font-black text-slate-900">
                      {formatDonationDateTime(activeDialogDonation.safePickupDeadline)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2.5">
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-400">
                      <ShieldCheck className="size-3 text-emerald-600" />
                      {tx("Storage & condition")}
                    </span>
                    <p className="mt-0.5 text-xs font-bold text-slate-800">
                      {tx(STORAGE_CONDITION_LABELS[activeDialogDonation.storageCondition])}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </ExecutiveDialog>
    </>
  );
}
