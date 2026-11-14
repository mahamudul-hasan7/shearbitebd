"use client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

import { UiText } from "@/lib/i18n/ui-text-node";
import { useUiText } from "@/lib/i18n/use-ui-text";

import { ClipboardCheck, ClipboardList, Clock3, Plus, RefreshCw, SearchX } from "lucide-react";
import { useMockAuth } from "@/features/auth/mock-auth";
import { PortalShell } from "@/components/layout/portal-shell";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { StatCard } from "@/components/ui/stat-card";
import { RequestCard } from "@/features/requests/request-card";
import { useNgoRequests } from "@/features/requests/use-ngo-requests";
import { RequestStatus, STATUS_META } from "@/lib/constants/statuses";
import { ROUTES } from "@/lib/routes";

const ACTIVE_STATUSES = new Set([RequestStatus.DRAFT, RequestStatus.PENDING_REVIEW, RequestStatus.FINDING_MATCH, RequestStatus.MATCHED]);

export function NGORequestList() {
  const tx = useUiText();
  const { session } = useMockAuth();
  const { state, filter, setFilter, search, setSearch, filteredRequests, stats, retry } = useNgoRequests();
  const active = filteredRequests.filter((request) => ACTIVE_STATUSES.has(request.status));
  const history = filteredRequests.filter((request) => !ACTIVE_STATUSES.has(request.status));

  return (
    <PortalShell role="ngo" activeHref={ROUTES.ngo.requests} title={tx("My food requests")} description={tx("Track verified community needs separately from donation claims and rescue coordination.")} profileName={session?.displayName || "NGO"} profileDescription={tx("Verified NGO")} avatarInitials={session?.displayName.slice(0, 2).toUpperCase() || "NG"} notificationHref={ROUTES.ngo.dashboard + "#recent-activity"} actions={<ButtonLink href={ROUTES.ngo.newRequest} leftIcon={<Plus className="size-4" />}><UiText source={"New request"} /></ButtonLink>}>
      <div className="grid gap-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={ClipboardList} label={tx("Total requests")} value={String(stats.total)} helper={tx("All NGO requests")} />
          <StatCard icon={Clock3} label={tx("Meals fulfilled")} value={String((state.data || []).reduce((sum, r) => sum + (r.mealsFulfilled || 0), 0))} helper={tx("From actual distribution")} tone="accent" />
          <StatCard icon={RefreshCw} label={tx("Matching")} value={String(stats.matching)} helper={tx("Finding or matched")} tone="info" />
          <StatCard icon={ClipboardCheck} label={tx("Fulfilled")} value={String(stats.fulfilled)} helper={tx("Completed needs")} tone="success" />
        </div>

        {state.data && <Card><CardContent className="grid gap-4 md:grid-cols-[minmax(0,1fr)_15rem]"><SearchInput label={tx("Search requests")} value={search} placeholder={tx("Title, purpose, recipient or ID")} onChange={(event) => setSearch(event.target.value)} /><Select label={tx("Status")} value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)}><option value="ALL">{tx("All statuses")}</option>{Object.values(RequestStatus).map((status) => <option key={status} value={status}>{tx(STATUS_META[status].label)}</option>)}</Select></CardContent></Card>}
        {state.status === "loading" && !state.data && <LoadingSpinner label={tx("Loading food requests")} />}
        {state.status === "error" && !state.data && <EmptyState icon={RefreshCw} title={tx("Requests could not load")} description={tx(state.error.message)} action={<Button onClick={retry}><UiText source={"Try again"} /></Button>} />}
        {state.data && filteredRequests.length === 0 && <EmptyState icon={SearchX} title={tx("No requests match this view")} description={tx("Clear the search or status filter, or publish a new verified community need.")} action={<div className="flex flex-wrap justify-center gap-2"><Button onClick={() => { setFilter("ALL"); setSearch(""); }}><UiText source={"Clear filters"} /></Button><ButtonLink href={ROUTES.ngo.newRequest} variant="outline"><UiText source={"Create request"} /></ButtonLink></div>} />}
        {active.length > 0 && <section aria-labelledby="active-requests-heading" className="grid gap-4"><h2 id="active-requests-heading" className="text-xl font-black text-brand-900">{tx("Active requests")}{" "}<span className="text-sm text-muted-500">({active.length})</span></h2>{active.map((request) => <RequestCard key={request.id} request={request} />)}</section>}
        {history.length > 0 && <section aria-labelledby="request-history-heading" className="grid gap-4"><h2 id="request-history-heading" className="text-xl font-black text-brand-900">{tx("Request history")}{" "}<span className="text-sm text-muted-500">({history.length})</span></h2>{history.map((request) => <RequestCard key={request.id} request={request} />)}</section>}
      </div>
    </PortalShell>
  );
}
