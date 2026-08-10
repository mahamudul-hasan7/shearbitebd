"use client";

import { ArrowRight, CalendarClock, MapPin, PackageOpen, Plus, RefreshCw, Utensils } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { FOOD_CATEGORY_LABELS } from "@/lib/constants/domain";
import { UserRole } from "@/lib/constants/roles";
import { ROUTES } from "@/lib/routes";
import { asyncState, donationService, toServiceError, type AsyncState } from "@/services";
import type { DonationView, ViewerContext } from "@/types/domain";

const DONOR_PROFILE_ID = "donor-uiu";
const DONOR_VIEWER: ViewerContext = {
  userId: "user-donor-uiu",
  donorProfileId: DONOR_PROFILE_ID,
  role: UserRole.DONOR,
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(Date.parse(value));
}

function quantityLabel(donation: DonationView) {
  return `${donation.quantity.value} ${donation.quantity.unit.toLowerCase().replaceAll("_", " ")}`;
}

function imageUrl(donation: DonationView) {
  const candidate = donation.photoUrls[0];
  return candidate?.startsWith("/images/") ? candidate : "/images/donor-active-meal.png";
}

function DonationListLoading() {
  return (
    <SkeletonGroup label="Loading your donations" className="grid gap-5 lg:grid-cols-2">
      {[0, 1, 2, 3].map((item) => (
        <Card key={item} className="overflow-hidden">
          <Skeleton className="h-44 rounded-none" />
          <div className="grid gap-3 p-5">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </Card>
      ))}
    </SkeletonGroup>
  );
}

export function DonorDonationList() {
  const [retryKey, setRetryKey] = useState(0);
  const [state, setState] = useState<AsyncState<DonationView[]>>(() => asyncState.loading());

  useEffect(() => {
    const controller = new AbortController();
    donationService.list(
      { donorProfileId: DONOR_PROFILE_ID, viewer: DONOR_VIEWER },
      { signal: controller.signal },
    ).then((donations) => {
      setState(asyncState.success(donations));
    }).catch((error: unknown) => {
      if (controller.signal.aborted) return;
      setState(asyncState.error(toServiceError(error)));
    });
    return () => controller.abort();
  }, [retryKey]);

  function retry() {
    setState((current) => asyncState.loading(current.data));
    setRetryKey((current) => current + 1);
  }

  return (
    <PortalShell
      role="donor"
      activeHref={ROUTES.donor.donations}
      title="My Donations"
      description="Review the food listings created by your mock donor profile. Full tracking and status management arrive in Phase 6."
      actions={<ButtonLink href={ROUTES.donor.newDonation} leftIcon={<Plus className="size-4" />}>Add Surplus Food</ButtonLink>}
      profileName="UIU Cafeteria"
      profileDescription="Mock verified food donor"
      avatarInitials="UC"
      notificationHref={ROUTES.donor.notifications}
      unreadNotifications={1}
    >
      {state.status === "loading" && !state.data && <DonationListLoading />}

      {state.status === "error" && !state.data && (
        <Alert
          tone="danger"
          title="Your donations could not be loaded"
          description={state.error.message}
          action={<Button type="button" size="sm" variant="outline" leftIcon={<RefreshCw className="size-4" />} onClick={retry}>Retry</Button>}
        />
      )}

      {state.data && state.data.length === 0 && (
        <EmptyState
          icon={PackageOpen}
          title="No donations yet"
          description="Start a food rescue listing and it will appear here during this browser session."
          action={<ButtonLink href={ROUTES.donor.newDonation} leftIcon={<Plus className="size-4" />}>Add Surplus Food</ButtonLink>}
        />
      )}

      {state.data && state.data.length > 0 && (
        <div className="grid gap-5 lg:grid-cols-2">
          {state.data.map((donation) => (
            <Card key={donation.id} className="group overflow-hidden">
              <div className="relative h-44 overflow-hidden bg-brand-100">
                <Image
                  src={imageUrl(donation)}
                  alt="Prepared food listing ready for pickup"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 bg-gradient-to-b from-brand-950/70 to-transparent p-4 pb-12">
                  <StatusBadge status={donation.status} />
                  <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-black text-brand-800">{donation.priority.toLowerCase()} priority</span>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-600">{FOOD_CATEGORY_LABELS[donation.category]}</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-ink-900">{donation.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-600">{donation.description}</p>

                <dl className="mt-5 grid gap-3 rounded-2xl bg-brand-50 p-4 text-sm sm:grid-cols-2">
                  <div><dt className="flex items-center gap-2 text-xs font-bold text-muted-600"><Utensils className="size-4 text-brand-600" />Quantity</dt><dd className="mt-1 font-black text-ink-900">{quantityLabel(donation)}</dd></div>
                  <div><dt className="flex items-center gap-2 text-xs font-bold text-muted-600"><MapPin className="size-4 text-brand-600" />Public area</dt><dd className="mt-1 font-black text-ink-900">{donation.pickup.approximateArea}</dd></div>
                  <div className="sm:col-span-2"><dt className="flex items-center gap-2 text-xs font-bold text-muted-600"><CalendarClock className="size-4 text-brand-600" />Safe pickup deadline</dt><dd className="mt-1 font-black text-ink-900">{formatDateTime(donation.safePickupDeadline)}</dd></div>
                </dl>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-muted-600">ID: <span className="font-mono font-bold text-ink-700">{donation.id}</span></p>
                  <ButtonLink href={ROUTES.donor.donation(donation.id)} size="sm" variant="outline" rightIcon={<ArrowRight className="size-4" />}>View details</ButtonLink>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PortalShell>
  );
}
