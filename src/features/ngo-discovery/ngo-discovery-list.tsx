"use client";

import { RefreshCw } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { DiscoveryControls } from "@/features/ngo-discovery/discovery-controls";
import { DiscoveryEmptyState } from "@/features/ngo-discovery/discovery-empty-state";
import { DiscoveryFilterFields } from "@/features/ngo-discovery/discovery-filters";
import { DonationDiscoveryCard } from "@/features/ngo-discovery/donation-discovery-card";
import { useNgoDiscovery } from "@/features/ngo-discovery/use-ngo-discovery";
import { useSavedDonations } from "@/features/ngo-discovery/use-saved-donations";
import { ROUTES } from "@/lib/routes";

export function NGODiscoveryList() {
  const discovery = useNgoDiscovery();
  const { savedIds, toggleSaved } = useSavedDonations();
  const { state, filters, filteredItems, activeFilterCount, updateFilter, resetFilters, retry, queryString } = discovery;
  return <PortalShell role="ngo" activeHref={ROUTES.ngo.discover} title="Discover food" description="Find safe surplus food that fits your service area, capacity, and community needs." profileName="Hope Foundation" profileDescription="Verified NGO" avatarInitials="HF" notificationHref={ROUTES.ngo.dashboard + "#recent-activity"}>
    <div className="grid gap-5"><DiscoveryControls mode="list" queryString={queryString} filters={filters} activeFilterCount={activeFilterCount} resultCount={filteredItems.length} updateFilter={updateFilter} resetFilters={resetFilters} />
      {state.status === "loading" && !state.data && <SkeletonGroup label="Loading available donations" className="grid gap-4"><Skeleton className="h-72" /><Skeleton className="h-72" /><Skeleton className="h-72" /></SkeletonGroup>}
      {state.status === "error" && !state.data && <EmptyState icon={RefreshCw} title="Available food could not load" description={state.error.message} action={<Button onClick={retry}>Try again</Button>} />}
      {state.data && <div className="grid items-start gap-5 lg:grid-cols-[17rem_minmax(0,1fr)]"><aside className="sticky top-24 hidden lg:block"><Card><CardHeader title="Filters" description="Shared with rescue map." /><CardContent><DiscoveryFilterFields filters={filters} updateFilter={updateFilter} resetFilters={resetFilters} /></CardContent></Card></aside><section aria-label="Available donations" className="grid gap-4">{filteredItems.length === 0 ? <DiscoveryEmptyState filters={filters} resetFilters={resetFilters} /> : filteredItems.map((item) => <DonationDiscoveryCard key={item.donation.id} item={item} saved={savedIds.includes(item.donation.id)} onToggleSaved={() => toggleSaved(item.donation.id)} />)}</section></div>}
    </div>
  </PortalShell>;
}
