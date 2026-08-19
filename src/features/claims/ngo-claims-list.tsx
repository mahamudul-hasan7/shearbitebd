"use client";

import { Box, Clock3, PackageCheck, RefreshCw, Truck } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { ClaimCard } from "@/features/claims/claim-card";
import { ClaimFilters } from "@/features/claims/claim-filters";
import { ACTIVE_CLAIM_STATUSES } from "@/features/claims/types";
import { useNgoClaims } from "@/features/claims/use-ngo-claims";
import { ROUTES } from "@/lib/routes";
import type { ClaimCoordinationDetails } from "@/services";

function ClaimSection({ title, count, items }: { title: string; count: number; items: ClaimCoordinationDetails[] }) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby={`${title.toLowerCase().replaceAll(" ", "-")}-heading`} className="grid gap-4">
      <div className="flex items-center gap-3"><h2 id={`${title.toLowerCase().replaceAll(" ", "-")}-heading`} className="text-xl font-black text-brand-900">{title}</h2><span className="grid min-w-7 place-items-center rounded-full bg-brand-100 px-2 py-1 text-xs font-black text-brand-800">{count}</span></div>
      <div className="grid gap-4">{items.map((item) => <ClaimCard key={item.claim.id} item={item} />)}</div>
    </section>
  );
}

export function NGOClaimsList() {
  const { state, filter, setFilter, search, setSearch, filteredItems, stats, retry } = useNgoClaims();
  const activeItems = filteredItems.filter((item) => ACTIVE_CLAIM_STATUSES.has(item.claim.status));
  const historyItems = filteredItems.filter((item) => !ACTIVE_CLAIM_STATUSES.has(item.claim.status));

  return (
    <PortalShell role="ngo" activeHref={ROUTES.ngo.claims} title="My claims" description="Track reserved food, volunteer assignment, pickup, delivery, and completed rescue history." profileName="Hope Foundation" profileDescription="Verified NGO" avatarInitials="HF" notificationHref={ROUTES.ngo.dashboard + "#recent-activity"} actions={<ButtonLink href={ROUTES.ngo.discover} variant="outline">Discover food</ButtonLink>}>
      <div className="grid gap-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Box} label="Total claims" value={String(stats.total)} helper="All visible rescue claims" />
          <StatCard icon={Clock3} label="Reserved" value={String(stats.reserved)} helper="Awaiting assignment" tone="accent" />
          <StatCard icon={Truck} label="In progress" value={String(stats.inProgress)} helper="Pickup or delivery" tone="info" />
          <StatCard icon={PackageCheck} label="Completed" value={String(stats.completed)} helper="Distribution recorded" tone="success" />
        </div>

        {state.data && <ClaimFilters items={state.data} filter={filter} search={search} onFilterChange={setFilter} onSearchChange={setSearch} />}
        {state.status === "loading" && !state.data && <SkeletonGroup label="Loading NGO claims" className="grid gap-4"><Skeleton className="h-40" /><Skeleton className="h-64" /><Skeleton className="h-64" /></SkeletonGroup>}
        {state.status === "error" && !state.data && <EmptyState icon={RefreshCw} title="Claims could not load" description={state.error.message} action={<Button onClick={retry}>Try again</Button>} />}
        {state.data && filteredItems.length === 0 && <EmptyState icon={Box} title="No claims match this view" description="Try another status or clear the search. New claims appear here after reserving an eligible donation." action={<div className="flex flex-wrap justify-center gap-2"><Button onClick={() => { setFilter("ALL"); setSearch(""); }}>Clear filters</Button><ButtonLink href={ROUTES.ngo.discover} variant="outline">Browse donations</ButtonLink></div>} />}
        {filteredItems.length > 0 && <div className="grid gap-8"><ClaimSection title="Active claims" count={activeItems.length} items={activeItems} /><ClaimSection title="Claim history" count={historyItems.length} items={historyItems} /></div>}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-brand-100 bg-brand-50 p-5"><div><p className="font-black text-brand-900">Thank you for rescuing food responsibly.</p><p className="mt-1 text-sm text-muted-600">Every completed distribution can contribute to transparent impact reporting.</p></div><ButtonLink href={ROUTES.ngo.impact} variant="outline">View impact</ButtonLink></div>
      </div>
    </PortalShell>
  );
}
