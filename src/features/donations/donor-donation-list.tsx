"use client";

import { AlertTriangle, CheckCircle2, Clock3, PackageOpen, Plus, RefreshCw, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DonationManagementCard } from "@/components/donation/donation-management-card";
import { PortalShell } from "@/components/layout/portal-shell";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { DONATION_TABS, matchesDonationTab, type DonationTabKey } from "@/features/donations/donation-management";
import { FoodCategory, FOOD_CATEGORY_LABELS, PriorityLevel, PRIORITY_META } from "@/lib/constants/domain";
import { UserRole } from "@/lib/constants/roles";
import { DonationStatus } from "@/lib/constants/statuses";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { asyncState, donationService, toServiceError, type AsyncState } from "@/services";
import type { DonationView, ViewerContext } from "@/types/domain";

const DONOR_PROFILE_ID = "donor-uiu";
const DONOR_VIEWER: ViewerContext = { userId: "user-donor-uiu", donorProfileId: DONOR_PROFILE_ID, role: UserRole.DONOR };
type DonationSort = "deadline" | "updated" | "newest";

function DonationListLoading() {
  return <SkeletonGroup label="Loading your donations" className="grid gap-5">{[0, 1, 2].map((item) => <Card key={item} className="overflow-hidden"><div className="grid md:grid-cols-[13rem_1fr]"><Skeleton className="h-52 rounded-none md:h-full" /><div className="grid gap-4 p-6"><Skeleton className="h-7 w-2/3" /><Skeleton className="h-16 w-full" /><Skeleton className="h-20 w-full" /><Skeleton className="h-10 w-1/2" /></div></div></Card>)}</SkeletonGroup>;
}

export function DonorDonationList() {
  const [retryKey, setRetryKey] = useState(0);
  const [state, setState] = useState<AsyncState<DonationView[]>>(() => asyncState.loading());
  const [tab, setTab] = useState<DonationTabKey>("all");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<FoodCategory | "all">("all");
  const [priority, setPriority] = useState<PriorityLevel | "all">("all");
  const [sort, setSort] = useState<DonationSort>("deadline");

  useEffect(() => {
    const controller = new AbortController();
    donationService.list({ donorProfileId: DONOR_PROFILE_ID, viewer: DONOR_VIEWER }, { signal: controller.signal }).then((donations) => setState(asyncState.success(donations))).catch((error: unknown) => {
      if (!controller.signal.aborted) setState(asyncState.error(toServiceError(error)));
    });
    return () => controller.abort();
  }, [retryKey]);

  const donations = useMemo(() => state.data ?? [], [state.data]);
  const tabCounts = useMemo(() => Object.fromEntries(DONATION_TABS.map((item) => [item.key, donations.filter((donation) => matchesDonationTab(donation.status, item.key)).length])) as Record<DonationTabKey, number>, [donations]);
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return donations.filter((donation) => {
      if (!matchesDonationTab(donation.status, tab)) return false;
      if (category !== "all" && donation.category !== category) return false;
      if (priority !== "all" && donation.priority !== priority) return false;
      if (query && !`${donation.title} ${donation.description} ${donation.id} ${donation.pickup.approximateArea}`.toLowerCase().includes(query)) return false;
      return true;
    }).sort((left, right) => {
      if (sort === "updated") return Date.parse(right.updatedAt) - Date.parse(left.updatedAt);
      if (sort === "newest") return Date.parse(right.createdAt) - Date.parse(left.createdAt);
      return Date.parse(left.safePickupDeadline) - Date.parse(right.safePickupDeadline);
    });
  }, [category, donations, priority, search, sort, tab]);

  function resetFilters() {
    setSearch("");
    setCategory("all");
    setPriority("all");
    setTab("all");
    setSort("deadline");
  }

  const scheduledCount = donations.filter((item) => [DonationStatus.ASSIGNED, DonationStatus.PICKED_UP, DonationStatus.DELIVERED].includes(item.status)).length;
  const completedCount = donations.filter((item) => item.status === DonationStatus.DISTRIBUTED).length;
  const attentionCount = donations.filter((item) => [DonationStatus.DISPUTED, DonationStatus.EXPIRED].includes(item.status)).length;

  return (
    <PortalShell role="donor" activeHref={ROUTES.donor.donations} title="My Donations" description="Search, filter, manage, and track every food rescue from one responsive workspace." actions={<ButtonLink href={ROUTES.donor.newDonation} leftIcon={<Plus className="size-4" />}>Add Surplus Food</ButtonLink>} profileName="UIU Cafeteria" profileDescription="Mock verified food donor" avatarInitials="UC" notificationHref={ROUTES.donor.notifications} unreadNotifications={1}>
      {state.status === "loading" && !state.data && <DonationListLoading />}
      {state.status === "error" && !state.data && <Alert tone="danger" title="Your donations could not be loaded" description={state.error.message} action={<Button type="button" size="sm" variant="outline" leftIcon={<RefreshCw className="size-4" />} onClick={() => setRetryKey((current) => current + 1)}>Retry</Button>} />}

      {state.data && (
        <div className="grid gap-6">
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Donation status overview">
            {[
              { label: "All donations", value: donations.length, icon: PackageOpen, tone: "bg-brand-50 text-brand-700" },
              { label: "Scheduled rescues", value: scheduledCount, icon: Clock3, tone: "bg-info-soft text-info-strong" },
              { label: "Completed", value: completedCount, icon: CheckCircle2, tone: "bg-success-soft text-success-strong" },
              { label: "Needs attention", value: attentionCount, icon: AlertTriangle, tone: "bg-warning-soft text-warning-strong" },
            ].map((item) => <Card key={item.label} className="flex items-center gap-4 p-4"><span className={cn("grid size-12 place-items-center rounded-2xl", item.tone)}><item.icon className="size-6" /></span><div><p className="text-2xl font-black text-ink-900">{item.value}</p><p className="text-xs font-bold text-muted-600">{item.label}</p></div></Card>)}
          </section>

          <Card className="p-4 sm:p-5">
            <div className="grid gap-4 lg:grid-cols-[minmax(15rem,1fr)_repeat(3,minmax(10rem,0.55fr))]">
              <SearchInput label="Search donations" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Food, ID, or area" />
              <Select label="Category" value={category} onChange={(event) => setCategory(event.target.value as FoodCategory | "all")}><option value="all">All categories</option>{Object.values(FoodCategory).map((item) => <option key={item} value={item}>{FOOD_CATEGORY_LABELS[item]}</option>)}</Select>
              <Select label="Priority" value={priority} onChange={(event) => setPriority(event.target.value as PriorityLevel | "all")}><option value="all">All priorities</option>{Object.values(PriorityLevel).map((item) => <option key={item} value={item}>{PRIORITY_META[item].label}</option>)}</Select>
              <Select label="Sort by" value={sort} onChange={(event) => setSort(event.target.value as DonationSort)}><option value="deadline">Deadline soonest</option><option value="updated">Recently updated</option><option value="newest">Newest created</option></Select>
            </div>
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Donation status tabs">
              {DONATION_TABS.map((item) => <button key={item.key} type="button" role="tab" aria-selected={tab === item.key} onClick={() => setTab(item.key)} className={cn("inline-flex min-w-max items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition", tab === item.key ? "bg-brand-600 text-white" : "bg-brand-50 text-muted-600 hover:bg-brand-100 hover:text-brand-800")}>{item.label}<span className={cn("rounded-full px-2 py-0.5 text-xs", tab === item.key ? "bg-white/20" : "bg-white text-brand-800")}>{tabCounts[item.key]}</span></button>)}
            </div>
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-bold text-muted-600">Showing <span className="text-ink-900">{filtered.length}</span> of {donations.length} donations</p>{(search || category !== "all" || priority !== "all" || tab !== "all" || sort !== "deadline") && <Button type="button" size="sm" variant="ghost" leftIcon={<RotateCcw className="size-4" />} onClick={resetFilters}>Reset filters</Button>}</div>

          {donations.length === 0 ? <EmptyState icon={PackageOpen} title="No donations yet" description="Create your first surplus-food rescue listing and manage it here." action={<ButtonLink href={ROUTES.donor.newDonation} leftIcon={<Plus className="size-4" />}>Add Surplus Food</ButtonLink>} /> : filtered.length === 0 ? <EmptyState icon={PackageOpen} title="No donations match" description="Your current tab, search, and filter combination returned no results." action={<Button type="button" variant="outline" leftIcon={<RotateCcw className="size-4" />} onClick={resetFilters}>View all donations</Button>} /> : <section className="grid gap-5" aria-label="Filtered donations">{filtered.map((donation) => <DonationManagementCard key={donation.id} donation={donation} />)}</section>}
        </div>
      )}
    </PortalShell>
  );
}
