"use client";

import { ClipboardCheck, ClipboardList, Clock3, Plus, RefreshCw, SearchX } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { RequestCard } from "@/features/requests/request-card";
import { useNgoRequests } from "@/features/requests/use-ngo-requests";
import { RequestStatus, STATUS_META } from "@/lib/constants/statuses";
import { ROUTES } from "@/lib/routes";

const ACTIVE_STATUSES = new Set([RequestStatus.DRAFT, RequestStatus.PENDING_REVIEW, RequestStatus.FINDING_MATCH, RequestStatus.MATCHED]);

export function NGORequestList() {
  const { state, filter, setFilter, search, setSearch, filteredRequests, stats, retry } = useNgoRequests();
  const active = filteredRequests.filter((request) => ACTIVE_STATUSES.has(request.status));
  const history = filteredRequests.filter((request) => !ACTIVE_STATUSES.has(request.status));

  return (
    <PortalShell role="ngo" activeHref={ROUTES.ngo.newRequest} title="My food requests" description="Track verified community needs separately from donation claims and rescue coordination." profileName="Hope Foundation" profileDescription="Verified NGO" avatarInitials="HF" notificationHref={ROUTES.ngo.dashboard + "#recent-activity"} actions={<ButtonLink href={ROUTES.ngo.newRequest} leftIcon={<Plus className="size-4" />}>New request</ButtonLink>}>
      <div className="grid gap-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={ClipboardList} label="Total requests" value={String(stats.total)} helper="All NGO requests" />
          <StatCard icon={Clock3} label="Pending review" value={String(stats.review)} helper="Awaiting mock review" tone="accent" />
          <StatCard icon={RefreshCw} label="Matching" value={String(stats.matching)} helper="Finding or matched" tone="info" />
          <StatCard icon={ClipboardCheck} label="Fulfilled" value={String(stats.fulfilled)} helper="Completed needs" tone="success" />
        </div>

        {state.data && <Card><CardContent className="grid gap-4 md:grid-cols-[minmax(0,1fr)_15rem]"><SearchInput label="Search requests" value={search} placeholder="Title, purpose, recipient or ID" onChange={(event) => setSearch(event.target.value)} /><Select label="Status" value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)}><option value="ALL">All statuses</option>{Object.values(RequestStatus).map((status) => <option key={status} value={status}>{STATUS_META[status].label}</option>)}</Select></CardContent></Card>}
        {state.status === "loading" && !state.data && <SkeletonGroup label="Loading food requests" className="grid gap-4"><Skeleton className="h-32" /><Skeleton className="h-52" /><Skeleton className="h-52" /></SkeletonGroup>}
        {state.status === "error" && !state.data && <EmptyState icon={RefreshCw} title="Requests could not load" description={state.error.message} action={<Button onClick={retry}>Try again</Button>} />}
        {state.data && filteredRequests.length === 0 && <EmptyState icon={SearchX} title="No requests match this view" description="Clear the search or status filter, or publish a new verified community need." action={<div className="flex flex-wrap justify-center gap-2"><Button onClick={() => { setFilter("ALL"); setSearch(""); }}>Clear filters</Button><ButtonLink href={ROUTES.ngo.newRequest} variant="outline">Create request</ButtonLink></div>} />}
        {active.length > 0 && <section aria-labelledby="active-requests-heading" className="grid gap-4"><h2 id="active-requests-heading" className="text-xl font-black text-brand-900">Active requests <span className="text-sm text-muted-500">({active.length})</span></h2>{active.map((request) => <RequestCard key={request.id} request={request} />)}</section>}
        {history.length > 0 && <section aria-labelledby="request-history-heading" className="grid gap-4"><h2 id="request-history-heading" className="text-xl font-black text-brand-900">Request history <span className="text-sm text-muted-500">({history.length})</span></h2>{history.map((request) => <RequestCard key={request.id} request={request} />)}</section>}
      </div>
    </PortalShell>
  );
}
