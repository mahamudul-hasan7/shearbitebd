"use client";

import { useState } from "react";
import { ClipboardList, HandHeart, PackageSearch, ShieldCheck, UsersRound } from "lucide-react";
import { ActiveClaimOverview } from "@/features/ngo-dashboard/active-claim-overview";
import { NGODashboardError, NGODashboardLoading, NoRecommendedDonation } from "@/features/ngo-dashboard/ngo-dashboard-states";
import { NGOQuickActions } from "@/features/ngo-dashboard/ngo-quick-actions";
import { NGORecentActivity } from "@/features/ngo-dashboard/ngo-recent-activity";
import { RecommendedDonationCard } from "@/features/ngo-dashboard/recommended-donation-card";
import { NGO_PROFILE_ID, NGO_VIEWER, useNgoDashboard } from "@/features/ngo-dashboard/use-ngo-dashboard";
import { PortalShell } from "@/components/layout/portal-shell";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { StatCard } from "@/components/ui/stat-card";
import { VerificationStatus } from "@/lib/constants/domain";
import { ROUTES } from "@/lib/routes";
import { claimService, toServiceError } from "@/services";

function getInitials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "NG";
}

export function NGODashboard() {
  const { state, retry } = useNgoDashboard();
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [claimError, setClaimError] = useState<string>();
  const data = state.data;
  const ngo = data?.profile.ngoProfile;
  const name = ngo?.organizationName ?? "Hope Foundation";

  async function claimRecommended() {
    if (!data?.recommendedDonation) return;
    setClaiming(true); setClaimError(undefined);
    try {
      await claimService.create({ donationId: data.recommendedDonation.id, ngoProfileId: NGO_PROFILE_ID, matchScore: data.recommendedMatchScore }, NGO_VIEWER);
      setClaimed(true);
      window.setTimeout(retry, 700);
    } catch (error: unknown) { setClaimError(toServiceError(error).message); }
    finally { setClaiming(false); }
  }

  return <PortalShell role="ngo" activeHref={ROUTES.ngo.dashboard} title={data ? `Assalamu Alaikum, ${name}` : "NGO Dashboard"} description="Find safe surplus food, coordinate active rescues, and keep your community impact moving." profileName={name} profileDescription={ngo?.verificationStatus === VerificationStatus.VERIFIED ? "Verified NGO" : "Verification pending"} avatarInitials={getInitials(name)} notificationHref={ROUTES.ngo.dashboard + "#recent-activity"} unreadNotifications={data?.notifications.filter((item) => !item.readAt).length ?? 0} actions={<ButtonLink href={ROUTES.ngo.newRequest} size="sm">Create demand request</ButtonLink>}>
    {state.status === "loading" && !data && <NGODashboardLoading />}
    {state.status === "error" && !data && <NGODashboardError message={state.error.message} onRetry={retry} />}
    {data && ngo && <div className="grid gap-8">
      <Card className="flex flex-wrap items-center justify-between gap-4 border-brand-200 bg-gradient-to-r from-brand-50 to-white p-5"><div className="flex items-start gap-3"><span className="grid size-12 place-items-center rounded-2xl bg-success-soft text-success-strong"><ShieldCheck className="size-6" /></span><div><div className="flex flex-wrap items-center gap-2"><p className="font-black text-ink-900">Organization status</p><Badge tone={ngo.verificationStatus === VerificationStatus.VERIFIED ? "success" : "warning"}>{ngo.verificationStatus.toLowerCase()}</Badge></div><p className="mt-1 text-sm text-muted-600">Registration {ngo.registrationNumber} · serving {ngo.serviceAreas.join(", ")}</p></div></div><p className="text-xs font-bold text-muted-500">Capacity: {ngo.capacityMealsPerDay} meals/day</p></Card>
      <section aria-labelledby="ngo-impact-heading"><SectionHeader title="Today at a glance" description="Live availability and your typed mock rescue history." /><span id="ngo-impact-heading" className="sr-only">NGO impact overview</span><div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Available nearby" value={String(data.stats.availableNearby)} icon={PackageSearch} helper="Within 15 km" /><StatCard label="Active claims" value={String(data.stats.activeClaims)} icon={ClipboardList} tone="info" helper="Needs coordination" /><StatCard label="Meals distributed" value={data.stats.mealsDistributed.toLocaleString()} icon={HandHeart} tone="accent" helper="Recorded estimates" /><StatCard label="Beneficiaries served" value={data.stats.beneficiariesServed.toLocaleString()} icon={UsersRound} tone="success" helper="Privacy-safe totals" /></div></section>
      <section aria-labelledby="recommended-heading"><div className="mb-4 flex flex-wrap items-end justify-between gap-3"><SectionHeader title="Recommended rescue" description="Ranked by accepted food category, service area, distance, and rescue urgency." /><Badge tone="neutral">Mock recommendation</Badge></div><span id="recommended-heading" className="sr-only">Recommended donation</span>{data.recommendedDonation ? <RecommendedDonationCard donation={data.recommendedDonation} matchScore={data.recommendedMatchScore} claiming={claiming} claimed={claimed} error={claimError} onClaim={claimRecommended} /> : <NoRecommendedDonation />}</section>
      <Alert tone="info" title="Safety and matching boundary" description="The rescue clock tracks the donor-declared pickup deadline, not freshness. Review the full declaration before claiming; match scores are frontend recommendations, not guarantees." />
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.65fr)]" aria-label="Active NGO claims and quick actions"><ActiveClaimOverview items={data.activeClaims} /><NGOQuickActions activeClaimId={data.activeClaims[0]?.claim.id} /></section>
      <NGORecentActivity activities={data.activities} />
    </div>}
  </PortalShell>;
}
