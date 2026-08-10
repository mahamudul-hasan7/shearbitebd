"use client";

import { Award, Info, Plus } from "lucide-react";
import { ActiveDonationCard } from "@/components/donor/active-donation-card";
import { DonorDashboardError, DonorDashboardLoading, NoActiveDonation, NoDashboardContent } from "@/components/donor/donor-dashboard-states";
import { DonorImpactGrid } from "@/components/donor/donor-impact-grid";
import { DonorQuickActions } from "@/components/donor/donor-quick-actions";
import { RecentActivityCard } from "@/components/donor/recent-activity-card";
import { SupportedNgosCard } from "@/components/donor/supported-ngos-card";
import { PortalShell } from "@/components/layout/portal-shell";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { useDonorDashboard } from "@/features/donor-dashboard/use-donor-dashboard";
import { ROUTES } from "@/lib/routes";

export function DonorDashboard() {
  const { state, retry } = useDonorDashboard();
  const data = state.data;

  return (
    <PortalShell
      role="donor"
      activeHref={ROUTES.donor.dashboard}
      title={data ? `Welcome back, ${data.profile.name}` : "Food Donor Dashboard"}
      description="Track time-sensitive rescues, coordinate handovers, and review your contribution."
      actions={data ? <ButtonLink href={ROUTES.donor.newDonation} leftIcon={<Plus className="size-4" />}>Add Surplus Food</ButtonLink> : undefined}
      profileName={data?.profile.name}
      profileDescription={data?.profile.description}
      avatarInitials={data?.profile.initials}
      notificationHref={data ? ROUTES.donor.notifications : undefined}
      unreadNotifications={data?.unreadNotifications}
    >
      {state.status === "loading" && !data && <DonorDashboardLoading />}
      {state.status === "error" && !data && <DonorDashboardError message={state.error.message} onRetry={retry} />}

      {data && (
        <div className="grid gap-8">
          {data.donations.length === 0 ? (
            <NoDashboardContent />
          ) : (
            <>
              <section aria-labelledby="impact-overview-heading">
                <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
                  <SectionHeader title="Impact overview" description="A concise view of your mock rescue history and active work." />
                  <Card className="flex max-w-xl items-center gap-3 p-3.5 shadow-sm">
                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-accent-100 text-accent-600"><Award className="size-5" /></span>
                    <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-black text-ink-900">Donor score</p><Badge tone="accent">{data.stats.donorScore}/100</Badge></div><p className="mt-1 text-xs leading-5 text-muted-600">{data.stats.donorScoreDescription}</p></div>
                  </Card>
                </div>
                <span id="impact-overview-heading" className="sr-only">Impact overview statistics</span>
                <DonorImpactGrid stats={data.stats} />
              </section>

              <section className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(18rem,0.7fr)]" aria-label="Active donation and quick actions">
                {data.activeDonation ? <ActiveDonationCard donation={data.activeDonation} /> : <NoActiveDonation />}
                <DonorQuickActions activeDonationId={data.activeDonation?.id} />
              </section>

              <div className="rounded-3xl border border-info/20 bg-info-soft p-4 text-sm leading-6 text-info-strong">
                <div className="flex items-start gap-3"><Info className="mt-0.5 size-5 shrink-0" /><p><span className="font-black">Frontend demo boundary:</span> rescue times are calculated from mock deadlines. Food safety relies on declarations and traceability; this interface does not provide a medical freshness guarantee.</p></div>
              </div>

              <section className="grid gap-6 xl:grid-cols-2" aria-label="Recent donor activity and supported NGOs">
                <RecentActivityCard activities={data.activities} />
                <SupportedNgosCard ngos={data.supportedNgos} />
              </section>
            </>
          )}
        </div>
      )}
    </PortalShell>
  );
}
