"use client";

import { RefreshCw } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { DiscoveryControls } from "@/features/ngo-discovery/discovery-controls";
import { DiscoveryFilterFields } from "@/features/ngo-discovery/discovery-filters";
import { RescueMap } from "@/features/ngo-discovery/rescue-map";
import { useNgoDiscovery } from "@/features/ngo-discovery/use-ngo-discovery";
import { ROUTES } from "@/lib/routes";

export function NGORescueMap() {
  const { state, filters, filteredItems, activeFilterCount, updateFilter, resetFilters, retry, queryString } = useNgoDiscovery();
  return <PortalShell role="ngo" activeHref={ROUTES.ngo.discover} title="Rescue map" description="Compare approximate food-rescue areas without exposing private donor locations." profileName="Hope Foundation" profileDescription="Verified NGO" avatarInitials="HF" notificationHref={ROUTES.ngo.dashboard + "#recent-activity"}>
    <div className="grid gap-5"><DiscoveryControls mode="map" queryString={queryString} filters={filters} activeFilterCount={activeFilterCount} resultCount={filteredItems.length} updateFilter={updateFilter} resetFilters={resetFilters} />
      {state.status === "loading" && !state.data && <Skeleton className="h-[42rem]" />}
      {state.status === "error" && !state.data && <EmptyState icon={RefreshCw} title="Rescue map could not load" description={state.error.message} action={<Button onClick={retry}>Try again</Button>} />}
      {state.data && <div className="grid items-start gap-5 lg:grid-cols-[17rem_minmax(0,1fr)]"><aside className="sticky top-24 hidden lg:block"><Card><CardHeader title="Filters" description="Shared with list view." /><CardContent><DiscoveryFilterFields filters={filters} updateFilter={updateFilter} resetFilters={resetFilters} /></CardContent></Card></aside><RescueMap items={filteredItems} /></div>}
    </div>
  </PortalShell>;
}
