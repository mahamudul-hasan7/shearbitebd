"use client";

import Image from "next/image";
import { ArrowLeft, Building2, CheckCircle2, Clock3, Mail, MapPin, MessageCircle, PackageOpen, Phone, RefreshCw, ShieldCheck, Truck, UserRoundCheck } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink, buttonClassNames } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { ClaimActionPanel } from "@/features/claims/claim-action-panel";
import { claimEtaLabel, claimProgressMessage, formatAddress, formatClaimDateTime } from "@/features/claims/claim-presentation";
import { ClaimRoutePreview } from "@/features/claims/claim-route-preview";
import { ClaimStatusTimeline } from "@/features/claims/claim-status-timeline";
import { ClaimVerificationPanel } from "@/features/claims/claim-verification-panel";
import { useNgoClaim } from "@/features/claims/use-ngo-claims";
import { donationImageUrl, formatDonationDateTime, formatDonationQuantity } from "@/features/donations/donation-presentation";
import { STORAGE_CONDITION_LABELS } from "@/lib/constants/domain";
import { ClaimStatus } from "@/lib/constants/statuses";
import { ROUTES } from "@/lib/routes";

export function NGOClaimDetail({ claimId }: { claimId: string }) {
  const claimState = useNgoClaim(claimId);
  const { state, busy, actionError, actionMessage } = claimState;
  const details = state.data;

  return (
    <PortalShell role="ngo" activeHref={ROUTES.ngo.claims} title="Claim details" description="Coordinate pickup, verification, volunteer tracking, and delivery for this rescue." profileName="Hope Foundation" profileDescription="Verified NGO" avatarInitials="HF" notificationHref={ROUTES.ngo.dashboard + "#recent-activity"} actions={<ButtonLink href={ROUTES.ngo.claims} variant="ghost" size="sm" leftIcon={<ArrowLeft className="size-4" />}>Back to claims</ButtonLink>}>
      {state.status === "loading" && !details && <SkeletonGroup label="Loading claim details" className="grid gap-5"><Skeleton className="h-80" /><Skeleton className="h-48" /><div className="grid gap-5 xl:grid-cols-2"><Skeleton className="h-80" /><Skeleton className="h-80" /></div></SkeletonGroup>}
      {state.status === "error" && !details && <EmptyState icon={RefreshCw} title="Claim could not load" description={state.error.message} action={<div className="flex flex-wrap justify-center gap-2"><Button onClick={claimState.retry}>Try again</Button><ButtonLink href={ROUTES.ngo.claims} variant="outline">Back to claims</ButtonLink></div>} />}
      {details && <div className="grid gap-6">
        <Card className="overflow-hidden">
          <div className="grid lg:grid-cols-[minmax(19rem,0.8fr)_minmax(0,1.2fr)]">
            <div className="relative min-h-72 bg-brand-50 lg:min-h-full"><Image src={donationImageUrl(details.donation)} alt="Prepared food for this rescue claim" fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" priority /><div className="absolute inset-x-0 top-0 flex items-center justify-between gap-2 p-4"><StatusBadge status={details.claim.status} /><Badge tone="success">{details.claim.matchScore}% match</Badge></div></div>
            <div className="p-5 sm:p-7">
              <div className="flex flex-wrap items-center gap-2"><Badge>{details.claim.id}</Badge>{details.donorVerified && <Badge tone="success"><CheckCircle2 className="size-3.5" />Verified donor</Badge>}</div>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-ink-900">{details.donation.title}</h2>
              <p className="mt-2 font-bold text-brand-800">{details.donorOrganization}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-brand-50 p-4"><PackageOpen className="size-5 text-brand-700" /><p className="mt-2 text-xs text-muted-600">Quantity</p><p className="mt-1 font-black text-ink-900">{formatDonationQuantity(details.donation)} · ~{details.donation.quantity.estimatedMeals} meals</p></div>
                <div className="rounded-2xl bg-brand-50 p-4"><Clock3 className="size-5 text-brand-700" /><p className="mt-2 text-xs text-muted-600">Prepared</p><p className="mt-1 font-black text-ink-900">{formatDonationDateTime(details.donation.preparationTime)}</p></div>
                <div className="rounded-2xl bg-brand-50 p-4"><MapPin className="size-5 text-brand-700" /><p className="mt-2 text-xs text-muted-600">Pickup</p><p className="mt-1 font-black text-ink-900">{details.donation.pickup.sensitiveDetailsVisible ? formatAddress(details.donation.pickup.exactAddress) : details.donation.pickup.approximateArea}</p></div>
                <div className="rounded-2xl bg-brand-50 p-4"><Truck className="size-5 text-brand-700" /><p className="mt-2 text-xs text-muted-600">Storage & timing</p><p className="mt-1 font-black text-ink-900">{STORAGE_CONDITION_LABELS[details.donation.storageCondition]} · {claimEtaLabel(details.claim)}</p></div>
              </div>
            </div>
          </div>
        </Card>

        <Card><CardHeader title="Rescue progress" description="Reserved → Assigned → Picked up → Delivered → Distributed" /><CardContent><ClaimStatusTimeline claim={details.claim} /></CardContent></Card>
        {actionError && <Alert tone="danger" title="Action could not be completed" description={actionError} />}
        {actionMessage && <Alert tone="success" title="Claim updated" description={actionMessage} />}

        <ClaimVerificationPanel claim={details.claim} />

        <div className="grid gap-5 xl:grid-cols-2">
          <Card><CardHeader title="Pickup coordination" description="Sensitive donor fields are visible only because this claim belongs to the signed-in NGO." action={<ShieldCheck className="size-5 text-success-strong" />} /><CardContent className="grid gap-4"><div className="rounded-2xl border border-line p-4"><div className="flex items-center gap-2 text-brand-800"><Building2 className="size-4" /><p className="font-black">{details.donorOrganization}</p></div><p className="mt-2 text-sm leading-6 text-muted-600">{formatAddress(details.donation.pickup.exactAddress)}</p>{details.donation.pickup.directions && <p className="mt-2 rounded-xl bg-canvas p-3 text-sm text-muted-600">{details.donation.pickup.directions}</p>}</div>{details.donation.pickup.contact ? <div className="grid gap-3 sm:grid-cols-2"><a className={buttonClassNames({ variant: "outline", size: "sm" })} href={`tel:${details.donation.pickup.contact.phone}`}><Phone className="size-4" />Call donor</a>{details.donation.pickup.contact.email ? <a className={buttonClassNames({ variant: "outline", size: "sm" })} href={`mailto:${details.donation.pickup.contact.email}`}><Mail className="size-4" />Email donor</a> : <a className={buttonClassNames({ variant: "outline", size: "sm" })} href={`sms:${details.donation.pickup.contact.phone}`}><MessageCircle className="size-4" />Message donor</a>}</div> : <Alert tone="warning" title="Contact details unavailable" description="Private contact information is withheld when the viewer is not authorized." />}</CardContent></Card>

          <Card><CardHeader title="Assigned volunteer" description={details.volunteer ? "Verified rescue partner and current ETA." : "A volunteer has not been assigned yet."} action={details.volunteer ? <Badge tone="success"><UserRoundCheck className="size-3.5" />Verified</Badge> : <Badge tone="warning">Waiting</Badge>} /><CardContent>{details.volunteer ? <div className="grid gap-4"><div className="flex items-center gap-4 rounded-2xl bg-info-soft p-4"><span className="grid size-14 place-items-center rounded-2xl bg-info text-xl font-black text-white">{details.volunteer.displayName.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><div><p className="text-lg font-black text-ink-900">{details.volunteer.displayName}</p><p className="mt-1 text-sm text-muted-600">{details.volunteer.transportMethod.toLowerCase().replaceAll("_", " ")} · {details.volunteer.completedRescues} completed rescues</p></div></div><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-line p-4"><p className="text-xs font-bold uppercase tracking-wide text-muted-500">Current ETA</p><p className="mt-2 text-2xl font-black text-info-strong">{claimEtaLabel(details.claim)}</p><p className="mt-1 text-xs text-muted-600">{details.claim.status === ClaimStatus.PICKED_UP ? "Estimated delivery" : "Estimated pickup"}: {formatClaimDateTime(details.claim.status === ClaimStatus.PICKED_UP ? details.claim.estimatedDeliveryAt : details.claim.estimatedPickupAt)}</p></div><div className="grid content-center gap-2">{details.volunteer.phone && <><a className={buttonClassNames({ variant: "primary", size: "sm" })} href={`tel:${details.volunteer.phone}`}><Phone className="size-4" />Call volunteer</a><a className={buttonClassNames({ variant: "outline", size: "sm" })} href={`sms:${details.volunteer.phone}`}><MessageCircle className="size-4" />Message</a></>}</div></div></div> : <div className="grid place-items-center rounded-2xl border border-dashed border-line bg-canvas p-8 text-center"><UserRoundCheck className="size-10 text-muted-400" /><p className="mt-3 font-black text-ink-900">Waiting for assignment</p><p className="mt-1 max-w-sm text-sm text-muted-600">Use the demo action below to assign the seeded verified volunteer and issue separate pickup and delivery tokens.</p></div>}</CardContent></Card>
        </div>

        <ClaimRoutePreview details={details} />
        <Alert tone="info" title="Frontend tracking demonstration" description="ETA, map route, QR blocks, fallback codes, calls, and messages are UI simulations. Real location, one-time tokens, expiry, and secure communication require backend services." />
        <ClaimActionPanel claim={details.claim} busy={busy} onAssignVolunteer={claimState.assignVolunteer} onRelease={claimState.releaseClaim} onMarkPickedUp={claimState.markPickedUp} onConfirmDelivered={claimState.confirmDelivered} onReportIssue={claimState.reportIssue} />
        <p className="text-center text-xs text-muted-500">Latest claim update: {formatClaimDateTime(details.claim.updatedAt)} · {claimProgressMessage(details.claim)}</p>
      </div>}
    </PortalShell>
  );
}
