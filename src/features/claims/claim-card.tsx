import Image from "next/image";
import { ArrowRight, Clock3, MapPin, PackageOpen, UserRoundCheck } from "lucide-react";
import { RescueClock } from "@/components/donor/rescue-clock";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { claimEtaLabel, formatClaimDateTime } from "@/features/claims/claim-presentation";
import { donationImageUrl, formatDonationQuantity } from "@/features/donations/donation-presentation";
import { ClaimStatus } from "@/lib/constants/statuses";
import { ROUTES } from "@/lib/routes";
import type { ClaimCoordinationDetails } from "@/services";

export function ClaimCard({ item }: { item: ClaimCoordinationDetails }) {
  const { claim, donation, donorOrganization, volunteer } = item;
  const showRescueClock = [ClaimStatus.RESERVED, ClaimStatus.ASSIGNED].includes(claim.status);
  const showEta = [ClaimStatus.ASSIGNED, ClaimStatus.PICKED_UP].includes(claim.status);

  return (
    <Card className="overflow-hidden transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg">
      <div className="grid sm:grid-cols-[12rem_minmax(0,1fr)] xl:grid-cols-[14rem_minmax(0,1fr)]">
        <div className="relative min-h-48 bg-brand-50 sm:min-h-full">
          <Image src={donationImageUrl(donation)} alt="Prepared food associated with this claim" fill sizes="(max-width: 640px) 100vw, 224px" className="object-cover" />
          <div className="absolute left-3 top-3"><Badge tone="success">{claim.matchScore}% match</Badge></div>
        </div>
        <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center sm:p-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2"><StatusBadge status={claim.status} /><span className="text-xs font-bold text-muted-600">{claim.id}</span></div>
            <h3 className="mt-3 text-xl font-black text-ink-900">{donation.title}</h3>
            <p className="mt-1 text-sm font-bold text-brand-700">{donorOrganization}</p>
            <div className="mt-4 grid gap-2 text-sm text-muted-600 sm:grid-cols-2">
              <p className="flex items-center gap-2"><MapPin className="size-4 text-brand-600" />{donation.pickup.approximateArea}</p>
              <p className="flex items-center gap-2"><PackageOpen className="size-4 text-brand-600" />{formatDonationQuantity(donation)} · ~{donation.quantity.estimatedMeals} meals</p>
              {volunteer && <p className="flex items-center gap-2"><UserRoundCheck className="size-4 text-info-strong" />{volunteer.displayName}</p>}
              <p className="flex items-center gap-2"><Clock3 className="size-4 text-brand-600" />Updated {formatClaimDateTime(claim.updatedAt)}</p>
            </div>
          </div>
          <div className="grid min-w-44 gap-3 lg:justify-items-end">
            {showRescueClock && <RescueClock deadline={donation.safePickupDeadline} compact />}
            {showEta && <div className="rounded-2xl bg-info-soft px-4 py-3 text-sm text-info-strong"><p className="font-bold">{claim.status === ClaimStatus.PICKED_UP ? "ETA to NGO" : "ETA to pickup"}</p><p className="mt-1 text-lg font-black">{claimEtaLabel(claim)}</p></div>}
            <ButtonLink href={ROUTES.ngo.claim(claim.id)} size="sm" rightIcon={<ArrowRight className="size-4" />}>View claim</ButtonLink>
          </div>
        </div>
      </div>
    </Card>
  );
}
