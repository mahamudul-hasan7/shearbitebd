"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Leaf, PackageCheck, RefreshCw, Scale, UsersRound, Utensils } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { NGO_PROFILE_ID, NGO_VIEWER } from "@/features/ngo-dashboard/use-ngo-dashboard";
import { ROUTES } from "@/lib/routes";
import { impactService, toServiceError, type NGOImpactOverview } from "@/services";

export function NGOImpact() {
  const [overview, setOverview] = useState<NGOImpactOverview>();
  const [error, setError] = useState<string>();
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    impactService.getNgoOverview(NGO_PROFILE_ID, NGO_VIEWER, { signal: controller.signal })
      .then(setOverview)
      .catch((caught: unknown) => { if (!controller.signal.aborted) setError(toServiceError(caught).message); });
    return () => controller.abort();
  }, [retryKey]);

  return (
    <PortalShell role="ngo" activeHref={ROUTES.ngo.impact} title="Impact" description="Transparent rescue outcomes generated from completed distribution records." profileName="Hope Foundation" profileDescription="Verified NGO" avatarInitials="HF" actions={<ButtonLink href={ROUTES.ngo.claims} variant="outline" size="sm">View claims</ButtonLink>}>
      {!overview && !error && <SkeletonGroup label="Loading impact history" className="grid gap-5"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div><Skeleton className="h-80" /></SkeletonGroup>}
      {error && !overview && <EmptyState icon={RefreshCw} title="Impact history could not load" description={error} action={<Button onClick={() => { setError(undefined); setRetryKey((value) => value + 1); }}>Try again</Button>} />}
      {overview && <div className="grid gap-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><ImpactMetric icon={Utensils} label="Meals distributed" value={overview.mealsDistributed} /><ImpactMetric icon={UsersRound} label="People served" value={overview.beneficiariesServed} /><ImpactMetric icon={Scale} label="Food rescued" value={`${overview.foodWeightKg.toFixed(1)} kg`} /><ImpactMetric icon={PackageCheck} label="Completed rescues" value={overview.completedRescues} /></div>
        <Alert tone="info" title="Impact values are transparent estimates" description="People and meal counts come from NGO distribution records. Environmental equivalents use the methodology shown on each record and are not measured scientific results." />
        <Card><CardHeader title="Recent distributions" description="Every entry links back to the source claim for an auditable frontend trail." action={<Leaf className="size-6 text-success-strong" />} /><CardContent>{overview.recentRecords.length === 0 ? <EmptyState icon={PackageCheck} title="No completed distributions yet" description="Impact appears after a delivered claim is distributed with consent-aware aggregate counts." action={<ButtonLink href={ROUTES.ngo.claims}>Open claims</ButtonLink>} /> : <div className="divide-y divide-line">{overview.recentRecords.map((record) => <article key={record.id} className="grid gap-3 py-5 first:pt-0 last:pb-0 sm:grid-cols-[1fr_auto] sm:items-center"><div><p className="font-black text-ink-900">{record.mealsRescued} meals · {record.beneficiariesServed} people</p><p className="mt-1 text-sm text-muted-600">{record.foodWeightKg.toFixed(1)} kg rescued · {new Intl.DateTimeFormat("en-BD", { dateStyle: "medium" }).format(new Date(record.recordedAt))}</p><p className="mt-2 text-xs leading-5 text-muted-500">{record.estimateMethodology}</p></div>{record.claimId && <ButtonLink href={ROUTES.ngo.claim(record.claimId)} variant="ghost" size="sm" rightIcon={<ArrowRight className="size-4" />}>View claim</ButtonLink>}</article>)}</div>}</CardContent></Card>
      </div>}
    </PortalShell>
  );
}

function ImpactMetric({ icon: Icon, label, value }: { icon: typeof Utensils; label: string; value: string | number }) {
  return <Card><CardContent className="p-5"><span className="grid size-11 place-items-center rounded-2xl bg-brand-50 text-brand-700"><Icon className="size-5" /></span><p className="mt-4 text-2xl font-black text-ink-900">{value}</p><p className="mt-1 text-sm text-muted-600">{label}</p></CardContent></Card>;
}
