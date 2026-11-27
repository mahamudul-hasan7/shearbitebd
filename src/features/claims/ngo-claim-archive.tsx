"use client";

import { useState } from "react";
import {
  Ban,
  Bike,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck2,
  MapPin,
  PackageOpen,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { ArchiveRowCard, type ArchiveRowTone } from "@/components/portal/archive-row-card";
import { Button, ButtonLink } from "@/components/ui/button";
import { ExecutiveDialog } from "@/components/ui/executive-dialog";
import {
  formatClaimDateTime,
  formatClaimDateTimeBn,
} from "@/features/claims/claim-presentation";
import { ClaimStatusTimeline } from "@/features/claims/claim-status-timeline";
import {
  formatDonationQuantity,
  formatDonationQuantityBn,
  getDonationTitleBn,
  getDonorOrganizationBn,
} from "@/features/donations/donation-presentation";
import { ClaimStatus } from "@/lib/constants/statuses";
import { useLanguage } from "@/lib/i18n/language-context";
import { getUiLocale } from "@/lib/i18n/locale";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { buildRescueProgress } from "@/lib/rescue-progress";
import { ROUTES } from "@/lib/routes";
import type { ClaimCoordinationDetails } from "@/services";
import { cn } from "@/lib/utils";

function claimArchiveTone(status: ClaimStatus): ArchiveRowTone {
  if (status === ClaimStatus.CANCELLED) return "rose";
  if (status === ClaimStatus.EXPIRED || status === ClaimStatus.DISPUTED) return "amber";
  return "emerald";
}

function claimOutcomeBadge(status: ClaimStatus, tx: ReturnType<typeof useUiText>, dark = false) {
  if (status === ClaimStatus.CANCELLED) {
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
        {tx("Rescue cancelled")}
      </span>
    );
  }
  if (status === ClaimStatus.EXPIRED) {
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
        {tx("Food expired")}
      </span>
    );
  }
  if (status === ClaimStatus.DISPUTED) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold",
          dark
            ? "border-amber-400/35 bg-amber-500/20 text-amber-100"
            : "border-amber-200 bg-amber-100/85 text-amber-900",
        )}
      >
        <ShieldAlert className={cn("size-3", dark ? "text-amber-200" : "text-amber-700")} />
        {tx("Under review")}
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
      {tx("Completed distribution")}
    </span>
  );
}

export function NgoClaimArchiveList({ items }: { items: ClaimCoordinationDetails[] }) {
  const tx = useUiText();
  const { language } = useLanguage();
  const isBn = language === "bn";
  const locale = getUiLocale();
  const [selected, setSelected] = useState<{ item: ClaimCoordinationDetails; number: number } | null>(
    null,
  );

  if (items.length === 0) return null;

  const activeItem = selected?.item;
  const activeTone = activeItem ? claimArchiveTone(activeItem.claim.status) : "emerald";
  const activeTitle = activeItem
    ? isBn
      ? getDonationTitleBn(activeItem.donation.title) || activeItem.donation.title
      : activeItem.donation.title
    : "";
  const activeDonor = activeItem
    ? isBn
      ? getDonorOrganizationBn(activeItem.donorOrganization) || activeItem.donorOrganization
      : activeItem.donorOrganization
    : "";

  return (
    <>
      <div className="grid gap-2.5">
        {items.map((item, index) => {
          const { claim, donation, donorOrganization, volunteer } = item;
          const tone = claimArchiveTone(claim.status);
          const displayTitle = isBn
            ? getDonationTitleBn(donation.title) || donation.title
            : donation.title;
          const displayDonor = isBn
            ? getDonorOrganizationBn(donorOrganization) || donorOrganization
            : donorOrganization;
          const shortId = claim.id.replace("claim-", "");
          const progress = buildRescueProgress({
            scope: "claim",
            status: claim.status,
            routeStage: claim.routeStage,
            reservedAt: claim.reservedAt,
            assignedAt: claim.assignedAt,
            pickedUpAt: claim.pickedUpAt,
            deliveredAt: claim.deliveredAt,
            distributedAt: claim.distributedAt,
            updatedAt: claim.updatedAt,
            cancellationReason: donation.cancellationReason,
          });

          return (
            <ArchiveRowCard
              key={claim.id}
              number={index + 1}
              tone={tone}
              title={displayTitle}
              statusBadge={claimOutcomeBadge(claim.status, tx)}
              referenceCode={tx("Claim #{0}", shortId.slice(-6).toUpperCase())}
              metaItems={
                <>
                  <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                    <Building2 className="size-3 shrink-0 text-sky-600" />
                    {displayDonor}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <PackageOpen className="size-3 shrink-0 text-emerald-600" />
                    {isBn ? formatDonationQuantityBn(donation) : formatDonationQuantity(donation)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3 shrink-0 text-slate-400" />
                    {donation.pickup.approximateArea}
                  </span>
                  {volunteer && (
                    <span className="inline-flex items-center gap-1">
                      <Bike className="size-3 shrink-0 text-emerald-600" />
                      {volunteer.displayName}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3 shrink-0 text-slate-400" />
                    {isBn ? formatClaimDateTimeBn(claim.updatedAt) : formatClaimDateTime(claim.updatedAt)}
                  </span>
                </>
              }
              progress={progress}
              onOpen={() => setSelected({ item, number: index + 1 })}
            />
          );
        })}
      </div>

      <ExecutiveDialog
        open={Boolean(activeItem)}
        onClose={() => setSelected(null)}
        tone={activeTone}
        size="lg"
        title={activeTitle}
        leading={
          <span className="text-sm font-black tabular-nums">
            #{selected?.number.toLocaleString(locale)}
          </span>
        }
        badge={activeItem ? claimOutcomeBadge(activeItem.claim.status, tx, true) : null}
        eyebrow={
          activeItem ? (
            <span className="font-mono">
              {tx("Claim #{0}", activeItem.claim.id.replace("claim-", ""))}
            </span>
          ) : null
        }
        subtitle={
          activeItem ? (
            <>
              <ShieldCheck className="size-3.5 shrink-0 text-emerald-300" />
              <span>{activeDonor}</span>
              <span className="text-white/40">·</span>
              <span>
                {isBn
                  ? formatClaimDateTimeBn(activeItem.claim.updatedAt)
                  : formatClaimDateTime(activeItem.claim.updatedAt)}
              </span>
            </>
          ) : null
        }
        footer={
          activeItem && (
            <>
              <ButtonLink
                href={ROUTES.ngo.claim(activeItem.claim.id)}
                variant="outline"
                size="sm"
                leftIcon={<ExternalLink className="size-3.5" />}
                className="font-bold"
              >
                {tx("Open full page")}
              </ButtonLink>
              {activeItem.claim.status === ClaimStatus.DISTRIBUTED && (
                <a
                  href={`/api/certificates/${encodeURIComponent(activeItem.donation.id)}`}
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
        {activeItem && (
          <div className="space-y-4">
            <ClaimStatusTimeline
              claim={activeItem.claim}
              cancellationReason={activeItem.donation.cancellationReason}
            />

            <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200/85 bg-white p-4 shadow-2xs sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-400">
                  <PackageOpen className="size-3 text-emerald-600" />
                  {tx("Food quantity")}
                </span>
                <p className="mt-1 text-xs font-black text-slate-900">
                  {isBn
                    ? formatDonationQuantityBn(activeItem.donation)
                    : formatDonationQuantity(activeItem.donation)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-400">
                  <Building2 className="size-3 text-emerald-600" />
                  {tx("Donor organization")}
                </span>
                <p className="mt-1 text-xs font-black text-slate-900">{activeDonor}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-400">
                  <Bike className="size-3 text-emerald-600" />
                  {tx("Assigned rider")}
                </span>
                <p className="mt-1 text-xs font-black text-slate-900">
                  {activeItem.volunteer ? activeItem.volunteer.displayName : tx("Unassigned")}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-400">
                  <MapPin className="size-3 text-emerald-600" />
                  {tx("Pickup area")}
                </span>
                <p className="mt-1 text-xs font-black text-slate-900">
                  {activeItem.donation.pickup.approximateArea}
                </p>
              </div>
            </div>
          </div>
        )}
      </ExecutiveDialog>
    </>
  );
}
