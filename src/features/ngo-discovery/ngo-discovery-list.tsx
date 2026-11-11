"use client";

import { useMemo } from "react";
import {
  Compass,
  Flame,
  Map,
  MapPin,
  PackageOpen,
  Plus,
  RefreshCw,
  ShieldCheck,
  Soup,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { DiscoveryControls } from "@/features/ngo-discovery/discovery-controls";
import { DiscoveryEmptyState } from "@/features/ngo-discovery/discovery-empty-state";
import { DiscoveryFilterFields } from "@/features/ngo-discovery/discovery-filters";
import { DonationDiscoveryCard } from "@/features/ngo-discovery/donation-discovery-card";
import { useNgoDiscovery } from "@/features/ngo-discovery/use-ngo-discovery";
import { useSavedDonations } from "@/features/ngo-discovery/use-saved-donations";
import { PriorityLevel } from "@/lib/constants/domain";
import { useLanguage } from "@/lib/i18n/language-context";
import { ROUTES } from "@/lib/routes";

export function NGODiscoveryList() {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const discovery = useNgoDiscovery();
  const { savedIds, toggleSaved } = useSavedDonations();

  const {
    state,
    filters,
    filteredItems,
    activeFilterCount,
    updateFilter,
    resetFilters,
    retry,
    queryString,
  } = discovery;

  // Compute operational overview stats
  const stats = useMemo(() => {
    const items = state.data ?? [];
    const totalMeals = items.reduce(
      (sum, item) => sum + (item.donation.quantity.estimatedMeals || 0),
      0
    );
    const urgentLots = items.filter(
      (item) =>
        item.donation.priority === PriorityLevel.URGENT ||
        Date.parse(item.donation.safePickupDeadline) - Date.now() < 2 * 3600 * 1000
    ).length;
    const distances = items
      .map((item) => item.donation.pickup.distanceKm)
      .filter((d): d is number => d !== undefined);
    const minDistance = distances.length > 0 ? Math.min(...distances).toFixed(1) : "৩.২";

    return {
      totalMeals,
      urgentLots,
      minDistance,
      totalCount: items.length,
    };
  }, [state.data]);

  return (
    <PortalShell
      role="ngo"
      activeHref={ROUTES.ngo.discover}
      title={isBn ? "উদ্বৃত্ত খাদ্য অনুসন্ধান ও উদ্ধার" : "Discover Surplus Food"}
      description={
        isBn
          ? "আপনার সেবামূলক এলাকার কাছাকাছি নিরাপদ উদ্বৃত্ত খাবার খুঁজুন, ফিল্টার করুন এবং তাৎক্ষণিক ক্লেইম করুন।"
          : "Browse, filter, and claim privacy-protected surplus food donations across Dhaka Metro."
      }
      profileName="Hope Foundation"
      profileDescription={isBn ? "ভেরিফায়েড এনজিও পার্টনার" : "Verified NGO Partner"}
      avatarInitials="HF"
      notificationHref={ROUTES.ngo.notifications}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <ButtonLink
            href={ROUTES.ngo.discoverMap}
            variant="outline"
            size="sm"
            leftIcon={<Map className="size-4 text-emerald-700" />}
          >
            {isBn ? "রাডার ম্যাপ ভিউ" : "Radar Map View"}
          </ButtonLink>
          <ButtonLink
            href={ROUTES.ngo.newRequest}
            variant="primary"
            size="sm"
            leftIcon={<Plus className="size-4" />}
          >
            {isBn ? "খাদ্য চাহিদা দাখিল" : "Submit Food Need"}
          </ButtonLink>
        </div>
      }
    >
      <div className="grid gap-6">
        {/* 1. TOP LIVE RESCUE METRIC COCKPIT */}
        {state.data && (
          <section
            aria-label="উদ্ধার লাইভ ওভারভিউ"
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          >
            <Card className="border-slate-200/90 p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>{isBn ? "উপলব্ধ খাদ্য লট" : "Available Food Lots"}</span>
                <span className="grid size-8 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Soup className="size-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-black text-slate-900">
                {stats.totalCount} {isBn ? "টি ব্যাচ" : "batches"}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-emerald-700">
                {isBn ? "ক্যাফেটেরিয়া ও হোটেল থেকে সংগৃহীত" : "From verified donors"}
              </p>
            </Card>

            <Card className="border-slate-200/90 p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>{isBn ? "মোট সম্ভাব্য আহার" : "Total Potential Meals"}</span>
                <span className="grid size-8 place-items-center rounded-xl bg-teal-50 text-teal-700">
                  <UsersRound className="size-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-black text-teal-900">
                {stats.totalMeals.toLocaleString()} {isBn ? "প্লেট / মিলস" : "meals"}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-teal-700">
                {isBn ? "সুবিধাবঞ্চিতদের মাঝে বিতরণযোগ্য" : "Ready for immediate rescue"}
              </p>
            </Card>

            <Card className="border-slate-200/90 p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>{isBn ? "অতি জরুরি উদ্ধার" : "Urgent Rescues (<2h)"}</span>
                <span className="grid size-8 place-items-center rounded-xl bg-rose-50 text-rose-700">
                  <Flame className="size-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-black text-rose-900">
                {stats.urgentLots} {isBn ? "টি ব্যাচ" : "batches"}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-rose-700">
                {isBn ? "২ ঘণ্টার কম সময় বাকি" : "Expiring soon"}
              </p>
            </Card>

            <Card className="border-slate-200/90 p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>{isBn ? "নিকটবর্তী দূরত্ব" : "Nearest Pickup"}</span>
                <span className="grid size-8 place-items-center rounded-xl bg-blue-50 text-blue-700">
                  <MapPin className="size-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-black text-blue-900">
                ~{stats.minDistance} {isBn ? "কিমি" : "km"}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-blue-700">
                {isBn ? "বাড্ডা ও গুলশান জোন" : "Short transit radius"}
              </p>
            </Card>
          </section>
        )}

        {/* 2. SEARCH & CONTROLS RIBBON */}
        <DiscoveryControls
          mode="list"
          queryString={queryString}
          filters={filters}
          activeFilterCount={activeFilterCount}
          resultCount={filteredItems.length}
          updateFilter={updateFilter}
          resetFilters={resetFilters}
        />

        {/* 3. LOADING SKELETON */}
        {state.status === "loading" && !state.data && (
          <SkeletonGroup label="Loading available donations" className="grid gap-5">
            <Skeleton className="h-44 rounded-2xl" />
            <Skeleton className="h-44 rounded-2xl" />
            <Skeleton className="h-44 rounded-2xl" />
          </SkeletonGroup>
        )}

        {/* 4. ERROR STATE */}
        {state.status === "error" && !state.data && (
          <EmptyState
            icon={RefreshCw}
            title={isBn ? "উদ্বৃত্ত খাবার লোড করা যায়নি" : "Available food could not load"}
            description={state.error.message}
            action={
              <Button onClick={retry} variant="primary">
                {isBn ? "পুনরায় চেষ্টা করুন" : "Try again"}
              </Button>
            }
          />
        )}

        {/* 5. MAIN RESULTS WITH SIDEBAR FILTERS */}
        {state.data && (
          <div className="grid items-start gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
            {/* Desktop Filters Sidebar */}
            <aside className="sticky top-24 hidden lg:block">
              <Card className="border border-slate-200/90 shadow-xs">
                <CardHeader
                  title={isBn ? "ফিল্টার সমূহ" : "Filters"}
                  description={
                    isBn
                      ? "পিকআপের পরিধি, খাদ্যের ধরণ ও পরিমাণ অনুযায়ী ফিল্টার করুন।"
                      : "Shared with rescue map."
                  }
                />
                <CardContent>
                  <DiscoveryFilterFields
                    filters={filters}
                    updateFilter={updateFilter}
                    resetFilters={resetFilters}
                  />
                </CardContent>
              </Card>
            </aside>

            {/* Main Donation Cards Feed */}
            <section aria-label="উপলব্ধ খাদ্য তালিকা" className="grid gap-4">
              {filteredItems.length === 0 ? (
                <DiscoveryEmptyState filters={filters} resetFilters={resetFilters} />
              ) : (
                filteredItems.map((item) => (
                  <DonationDiscoveryCard
                    key={item.donation.id}
                    item={item}
                    saved={savedIds.includes(item.donation.id)}
                    onToggleSaved={() => toggleSaved(item.donation.id)}
                  />
                ))
              )}
            </section>
          </div>
        )}

        {/* Mobile Floating View Switcher FAB (< lg) */}
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30 lg:hidden pointer-events-auto">
          <ButtonLink
            href={ROUTES.ngo.discoverMap}
            variant="primary"
            size="sm"
            className="rounded-full bg-slate-900/95 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/35 px-5 py-2.5 text-xs font-black backdrop-blur-md border border-slate-700/60 active:scale-95 transition-all flex items-center gap-2"
          >
            <Map className="size-4 text-emerald-400" />
            <span>{isBn ? "রাডার ম্যাপ ভিউ" : "Radar Map View"}</span>
          </ButtonLink>
        </div>
      </div>
    </PortalShell>
  );
}
