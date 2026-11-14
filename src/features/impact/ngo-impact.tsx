"use client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

import { UiText } from "@/lib/i18n/ui-text-node";
import { getUiLocale } from "@/lib/i18n/locale";
import { useUiText } from "@/lib/i18n/use-ui-text";

import { useEffect, useState } from "react";
import { ArrowRight, Droplets, Leaf, PackageCheck, RefreshCw, Scale, UsersRound, Utensils } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ImpactAreaList } from "@/features/impact/impact-area-list";
import { ImpactPeriodTabs } from "@/features/impact/impact-period-tabs";
import { ImpactTrendChart } from "@/features/impact/impact-trend-chart";
import { NGO_PROFILE_ID, NGO_USER_ID, NGO_VIEWER } from "@/features/ngo-dashboard/use-ngo-dashboard";
import { ROUTES } from "@/lib/routes";
import { impactService, notificationService, toServiceError, type NGOImpactAnalytics, type NGOImpactPeriod } from "@/services";

export function NGOImpact() {
  const tx = useUiText();
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

  return <PortalShell role="ngo" activeHref={ROUTES.ngo.impact} title={tx("Impact analytics")} description={tx("Distribution-backed outcomes with clearly labelled environmental estimates.")} profileName="Hope Foundation" profileDescription={tx("Verified NGO")} avatarInitials="HF" notificationHref={ROUTES.ngo.notifications} unreadNotifications={unread} actions={<ImpactPeriodTabs value={period} onChange={(value) => { setOverview(undefined); setPeriod(value); }} />}>
    {!overview && !error && <LoadingSpinner label={tx("Loading impact analytics")} />}
    {error && !overview && <EmptyState icon={RefreshCw} title={tx("Impact analytics could not load")} description={tx(error)} action={<Button onClick={() => { setError(undefined); setRetryKey((value) => value + 1); }}><UiText source={"Try again"} /></Button>} />}
    {overview && <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><ImpactMetric icon={Utensils} label={tx("Meals distributed")} value={overview.mealsDistributed} /><ImpactMetric icon={UsersRound} label={tx("People served")} value={overview.beneficiariesServed} /><ImpactMetric icon={Scale} label={tx("Food rescued")} value={`${overview.foodWeightKg.toFixed(1)} kg`} /><ImpactMetric icon={Leaf} label={tx("Estimated CO₂ prevented")} value={`${overview.estimatedCo2PreventedKg.toFixed(1)} kg`} /></div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.65fr)]"><Card><CardHeader title={tx("Distribution trend")} description={tx("Meals recorded across completed rescues in the selected period.")} /><CardContent><ImpactTrendChart points={overview.trend} /></CardContent></Card><Card><CardHeader title={tx("Top impact areas")} description={tx("Ranked by aggregate beneficiaries served.")} /><CardContent><ImpactAreaList areas={overview.topAreas} /></CardContent></Card></div>
      <Card><CardHeader title={tx("Recent impact activity")} description={tx("Every entry links to its source claim.")} action={<Droplets className="size-6 text-info-strong" />} /><CardContent>{overview.recentRecords.length === 0 ? <EmptyState icon={PackageCheck} title={tx("No distributions in this range")} description={tx("Choose a wider period or complete a delivered claim.")} /> : <div className="divide-y divide-line">{overview.recentRecords.map((record) => <article key={record.id} className="grid gap-3 py-5 first:pt-0 last:pb-0 sm:grid-cols-[1fr_auto] sm:items-center"><div><p className="font-black text-ink-900">{record.mealsRescued} {" "}{tx("meals ·")}{" "}{record.beneficiariesServed} {" "}{tx("people")}</p><p className="mt-1 text-sm text-muted-600">{record.foodWeightKg.toFixed(1)} {" "}{tx("kg food · estimated")}{" "}{record.estimatedCo2PreventedKg.toFixed(1)} {" "}{tx("kg CO₂e prevented")}</p><p className="mt-2 text-xs leading-5 text-muted-500">{record.estimateMethodology}</p></div>{record.claimId && <ButtonLink href={ROUTES.ngo.claim(record.claimId)} variant="ghost" size="sm" rightIcon={<ArrowRight className="size-4" />}>{tx("View claim")}</ButtonLink>}</article>)}</div>}</CardContent></Card>
      <Alert tone="info" title={tx("How estimates work")} description={tx("Environmental values are modelled, not measured. This period includes an estimated {0} litres of water saved. Each activity keeps its calculation methodology visible.", overview.estimatedWaterSavedLitres.toLocaleString(getUiLocale()))} />
    </div>}
  </PortalShell>;
}

function ImpactMetric({ icon: Icon, label, value }: { icon: typeof Utensils; label: string; value: string | number }) {
  const tx = useUiText();
  return <Card><CardContent className="p-5"><span className="grid size-11 place-items-center rounded-2xl bg-brand-50 text-brand-700"><Icon className="size-5" /></span><p className="mt-4 text-2xl font-black text-ink-900">{value}</p><p className="mt-1 text-sm text-muted-600">{tx(label)}</p></CardContent></Card>;
}
