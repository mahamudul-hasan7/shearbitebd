"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Droplets, Leaf, PackageCheck, RefreshCw, Scale, UsersRound, Utensils } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { ImpactAreaList } from "@/features/impact/impact-area-list";
import { ImpactPeriodTabs } from "@/features/impact/impact-period-tabs";
import { ImpactTrendChart } from "@/features/impact/impact-trend-chart";
import { NGO_PROFILE_ID, NGO_USER_ID, NGO_VIEWER } from "@/features/ngo-dashboard/use-ngo-dashboard";
import { ROUTES } from "@/lib/routes";
import { impactService, notificationService, toServiceError, type NGOImpactAnalytics, type NGOImpactPeriod } from "@/services";

export function NGOImpact() {
  const [period, setPeriod] = useState<NGOImpactPeriod>("YEAR");
  const [overview, setOverview] = useState<NGOImpactAnalytics>();
  const [unread, setUnread] = useState(0);
  const [error, setError] = useState<string>();
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      impactService.getNgoAnalytics(NGO_PROFILE_ID, period, NGO_VIEWER, { signal: controller.signal }),
      notificationService.listForUser(NGO_USER_ID, NGO_VIEWER, { signal: controller.signal }),
    ]).then(([analytics, notifications]) => { setOverview(analytics); setUnread(notifications.filter((item) => !item.readAt).length); setError(undefined); })
      .catch((caught: unknown) => { if (!controller.signal.aborted) setError(toServiceError(caught).message); });
    return () => controller.abort();
  }, [period, retryKey]);

  return <PortalShell role="ngo" activeHref={ROUTES.ngo.impact} title="Impact analytics" description="Distribution-backed outcomes with clearly labelled environmental estimates." profileName="Hope Foundation" profileDescription="Verified NGO" avatarInitials="HF" notificationHref={ROUTES.ngo.notifications} unreadNotifications={unread} actions={<ImpactPeriodTabs value={period} onChange={(value) => { setOverview(undefined); setPeriod(value); }} />}>
    {!overview && !error && <SkeletonGroup label="Loading impact analytics" className="grid gap-5"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div><Skeleton className="h-80" /></SkeletonGroup>}
    {error && !overview && <EmptyState icon={RefreshCw} title="Impact analytics could not load" description={error} action={<Button onClick={() => { setError(undefined); setRetryKey((value) => value + 1); }}>Try again</Button>} />}
    {overview && <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><ImpactMetric icon={Utensils} label="Meals distributed" value={overview.mealsDistributed} /><ImpactMetric icon={UsersRound} label="People served" value={overview.beneficiariesServed} /><ImpactMetric icon={Scale} label="Food rescued" value={`${overview.foodWeightKg.toFixed(1)} kg`} /><ImpactMetric icon={Leaf} label="Estimated CO₂ prevented" value={`${overview.estimatedCo2PreventedKg.toFixed(1)} kg`} /></div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.65fr)]"><Card><CardHeader title="Distribution trend" description="Meals recorded across completed rescues in the selected period." /><CardContent><ImpactTrendChart points={overview.trend} /></CardContent></Card><Card><CardHeader title="Top impact areas" description="Ranked by aggregate beneficiaries served." /><CardContent><ImpactAreaList areas={overview.topAreas} /></CardContent></Card></div>
      <Card><CardHeader title="Recent impact activity" description="Every entry links to its source claim." action={<Droplets className="size-6 text-info-strong" />} /><CardContent>{overview.recentRecords.length === 0 ? <EmptyState icon={PackageCheck} title="No distributions in this range" description="Choose a wider period or complete a delivered claim." /> : <div className="divide-y divide-line">{overview.recentRecords.map((record) => <article key={record.id} className="grid gap-3 py-5 first:pt-0 last:pb-0 sm:grid-cols-[1fr_auto] sm:items-center"><div><p className="font-black text-ink-900">{record.mealsRescued} meals · {record.beneficiariesServed} people</p><p className="mt-1 text-sm text-muted-600">{record.foodWeightKg.toFixed(1)} kg food · estimated {record.estimatedCo2PreventedKg.toFixed(1)} kg CO₂e prevented</p><p className="mt-2 text-xs leading-5 text-muted-500">{record.estimateMethodology}</p></div>{record.claimId && <ButtonLink href={ROUTES.ngo.claim(record.claimId)} variant="ghost" size="sm" rightIcon={<ArrowRight className="size-4" />}>View claim</ButtonLink>}</article>)}</div>}</CardContent></Card>
      <Alert tone="info" title="How estimates work" description={`Environmental values are modelled, not measured. This period includes an estimated ${overview.estimatedWaterSavedLitres.toLocaleString()} litres of water saved. Each activity keeps its calculation methodology visible.`} />
    </div>}
  </PortalShell>;
}

function ImpactMetric({ icon: Icon, label, value }: { icon: typeof Utensils; label: string; value: string | number }) {
  return <Card><CardContent className="p-5"><span className="grid size-11 place-items-center rounded-2xl bg-brand-50 text-brand-700"><Icon className="size-5" /></span><p className="mt-4 text-2xl font-black text-ink-900">{value}</p><p className="mt-1 text-sm text-muted-600">{label}</p></CardContent></Card>;
}
