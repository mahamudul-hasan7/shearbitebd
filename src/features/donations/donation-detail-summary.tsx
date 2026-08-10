"use client";

import { ArrowLeft, CalendarClock, CheckCircle2, MapPin, Phone, RefreshCw, ShieldCheck, Utensils } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { RescueClock } from "@/components/donor/rescue-clock";
import { PortalShell } from "@/components/layout/portal-shell";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { FOOD_CATEGORY_LABELS, STORAGE_CONDITION_LABELS } from "@/lib/constants/domain";
import { UserRole } from "@/lib/constants/roles";
import { ROUTES } from "@/lib/routes";
import { asyncState, donationService, toServiceError, type AsyncState } from "@/services";
import type { DonationView, ViewerContext } from "@/types/domain";

const DONOR_VIEWER: ViewerContext = {
  userId: "user-donor-uiu",
  donorProfileId: "donor-uiu",
  role: UserRole.DONOR,
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-BD", { dateStyle: "medium", timeStyle: "short" }).format(Date.parse(value));
}

function imageUrl(donation: DonationView) {
  const candidate = donation.photoUrls[0];
  return candidate?.startsWith("/images/") ? candidate : "/images/donor-active-meal.png";
}

function DonationDetailLoading() {
  return (
    <SkeletonGroup label="Loading donation details" className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <Card className="overflow-hidden"><Skeleton className="h-72 rounded-none" /><div className="grid gap-4 p-6"><Skeleton className="h-8 w-2/3" /><Skeleton className="h-20 w-full" /><Skeleton className="h-40 w-full" /></div></Card>
      <Card className="p-6"><Skeleton className="h-7 w-3/4" /><Skeleton className="mt-5 h-32 w-full" /><Skeleton className="mt-4 h-24 w-full" /></Card>
    </SkeletonGroup>
  );
}

export function DonationDetailSummary({ donationId }: { donationId: string }) {
  const [retryKey, setRetryKey] = useState(0);
  const [state, setState] = useState<AsyncState<DonationView>>(() => asyncState.loading());

  useEffect(() => {
    const controller = new AbortController();
    donationService.getById(donationId, DONOR_VIEWER, { signal: controller.signal }).then((donation) => {
      setState(asyncState.success(donation));
    }).catch((error: unknown) => {
      if (controller.signal.aborted) return;
      setState(asyncState.error(toServiceError(error)));
    });
    return () => controller.abort();
  }, [donationId, retryKey]);

  const donation = state.data;
  const declarations = donation ? Object.entries(donation.safetyDeclaration).filter(([key, value]) => key !== "declaredByUserId" && key !== "declaredAt" && value === true).length : 0;

  function retry() {
    setState((current) => asyncState.loading(current.data));
    setRetryKey((current) => current + 1);
  }

  return (
    <PortalShell
      role="donor"
      activeHref={ROUTES.donor.donations}
      title={donation?.title ?? "Donation details"}
      description="Phase 5 submission verification view. Full lifecycle controls and tracking arrive in Phase 6."
      actions={<ButtonLink href={ROUTES.donor.donations} variant="outline" leftIcon={<ArrowLeft className="size-4" />}>My Donations</ButtonLink>}
      profileName="UIU Cafeteria"
      profileDescription="Mock verified food donor"
      avatarInitials="UC"
      notificationHref={ROUTES.donor.notifications}
      unreadNotifications={1}
    >
      {state.status === "loading" && !donation && <DonationDetailLoading />}

      {state.status === "error" && !donation && (
        <Alert
          tone="danger"
          title="Donation details could not be loaded"
          description={state.error.message}
          action={<Button type="button" size="sm" variant="outline" leftIcon={<RefreshCw className="size-4" />} onClick={retry}>Retry</Button>}
        />
      )}

      {donation && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
          <Card className="overflow-hidden">
            <div className="relative h-64 bg-brand-100 sm:h-80">
              <Image src={imageUrl(donation)} alt="Prepared food donation ready for pickup" fill priority sizes="(max-width: 1280px) 100vw, 70vw" className="object-cover" />
              <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 bg-gradient-to-t from-brand-950/85 to-transparent p-5 pt-20 sm:p-7">
                <div><p className="text-xs font-black uppercase tracking-[0.18em] text-white/80">{FOOD_CATEGORY_LABELS[donation.category]}</p><p className="mt-1 text-2xl font-black text-white sm:text-3xl">{donation.title}</p></div>
                <StatusBadge status={donation.status} />
              </div>
            </div>

            <div className="p-5 sm:p-7">
              <p className="text-sm leading-7 text-muted-600">{donation.description}</p>
              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-brand-50 p-4"><dt className="flex items-center gap-2 text-xs font-bold text-muted-600"><Utensils className="size-4 text-brand-600" />Quantity</dt><dd className="mt-2 font-black text-ink-900">{donation.quantity.value} {donation.quantity.unit.toLowerCase().replaceAll("_", " ")} · approximately {donation.quantity.estimatedMeals} meals</dd></div>
                <div className="rounded-2xl bg-brand-50 p-4"><dt className="flex items-center gap-2 text-xs font-bold text-muted-600"><ShieldCheck className="size-4 text-brand-600" />Storage</dt><dd className="mt-2 font-black text-ink-900">{STORAGE_CONDITION_LABELS[donation.storageCondition]}</dd></div>
                <div className="rounded-2xl bg-brand-50 p-4"><dt className="flex items-center gap-2 text-xs font-bold text-muted-600"><CalendarClock className="size-4 text-brand-600" />Prepared</dt><dd className="mt-2 font-black text-ink-900">{formatDateTime(donation.preparationTime)}</dd></div>
                <div className="rounded-2xl bg-brand-50 p-4"><dt className="flex items-center gap-2 text-xs font-bold text-muted-600"><CalendarClock className="size-4 text-brand-600" />Pickup window</dt><dd className="mt-2 font-black text-ink-900">{formatDateTime(donation.pickup.windowStart)} – {formatDateTime(donation.pickup.windowEnd)}</dd></div>
              </dl>

              <div className="mt-6 rounded-2xl border border-line p-5">
                <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-black text-ink-900">Pickup details</h2><Badge tone={donation.pickup.sensitiveDetailsVisible ? "success" : "warning"}>{donation.pickup.sensitiveDetailsVisible ? "Owner access" : "Private"}</Badge></div>
                <div className="mt-4 grid gap-3 text-sm text-muted-600">
                  <p className="flex items-start gap-3"><MapPin className="mt-0.5 size-4 shrink-0 text-brand-600" /><span><strong className="text-ink-900">Public area:</strong> {donation.pickup.approximateArea}</span></p>
                  {donation.pickup.exactAddress && <p className="flex items-start gap-3"><MapPin className="mt-0.5 size-4 shrink-0 text-brand-600" /><span><strong className="text-ink-900">Exact address:</strong> {donation.pickup.exactAddress.addressLine}, {donation.pickup.exactAddress.area}, {donation.pickup.exactAddress.city}</span></p>}
                  {donation.pickup.contact && <p className="flex items-start gap-3"><Phone className="mt-0.5 size-4 shrink-0 text-brand-600" /><span><strong className="text-ink-900">Private contact:</strong> {donation.pickup.contact.name}, {donation.pickup.contact.phone}{donation.pickup.contact.email ? `, ${donation.pickup.contact.email}` : ""}</span></p>}
                </div>
              </div>
            </div>
          </Card>

          <div className="grid gap-5 xl:sticky xl:top-24">
            <Card className="p-5"><p className="text-xs font-black uppercase tracking-[0.16em] text-brand-600">Rescue clock</p><div className="mt-4"><RescueClock deadline={donation.safePickupDeadline} /></div><p className="mt-4 text-xs leading-5 text-muted-600">Time is calculated from the donor-declared safe pickup deadline and is not a medical freshness guarantee.</p></Card>
            <Card className="p-5"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-success-soft text-success-strong"><CheckCircle2 className="size-5" /></span><div><p className="font-black text-ink-900">Safety review</p><p className="text-xs text-muted-600">{declarations}/7 required declarations confirmed</p></div></div><p className="mt-4 text-xs leading-5 text-muted-600">Allergen information: <strong className="text-ink-900">{donation.allergens.length ? donation.allergens.join(", ") : "None known declared"}</strong></p></Card>
            <Card className="p-5"><p className="text-xs font-bold text-muted-400">Mock donation ID</p><p className="mt-2 break-all font-mono text-sm font-black text-brand-800">{donation.id}</p><p className="mt-4 text-xs leading-5 text-muted-600">This record is stored only in the current in-memory frontend session.</p></Card>
          </div>
        </div>
      )}
    </PortalShell>
  );
}
