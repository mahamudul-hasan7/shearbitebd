"use client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

import { getUiLocale } from "@/lib/i18n/locale";
import { useUiText } from "@/lib/i18n/use-ui-text";

import { useMemo } from "react";
import {
  Flame,
  Map,
  MapPin,
  Plus,
  RefreshCw,
  Soup,
  UsersRound,
} from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
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
  const tx = useUiText();
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
        item.donation.priority === PriorityLevel.URGENT
    ).length;
    const distances = items
      .map((item) => item.donation.pickup.distanceKm)
      .filter((d): d is number => d !== undefined);
    const minDistance = distances.length > 0 ? Math.min(...distances).toFixed(1) : undefined;

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
      title={isBn ? tx("উদ্বৃত্ত খাদ্য অনুসন্ধান ও উদ্ধার") : tx("Discover Surplus Food")}
      description={
        isBn ? tx("আপনার সেবামূলক এলাকার কাছাকাছি নিরাপদ উদ্বৃত্ত খাবার খুঁজুন, ফিল্টার করুন এবং তাৎক্ষণিক ক্লেইম করুন।") : tx("Browse, filter, and claim privacy-protected surplus food donations across Dhaka Metro.")
      }
      profileName="NGO account"
      profileDescription={isBn ? tx("ভেরিফায়েড এনজিও পার্টনার") : tx("Verified NGO Partner")}
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
      <div className="grid gap-6"><p className="text-sm text-muted-600">{tx("Nearby search uses your saved primary NGO location.")}{" "}<a href={ROUTES.ngo.addresses} className="font-bold text-emerald-700 underline">{tx("Manage address pins")}</a>{tx(". Choose All to include donations with unknown distance.")}</p>
        {/* 1. TOP LIVE RESCUE METRIC COCKPIT */}
        {state.data && (
          <section
            aria-label={tx("উদ্ধার লাইভ ওভারভিউ")}
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          >
            <Card className="border-slate-200/90 p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>{isBn ? tx("উপলব্ধ খাদ্য লট") : tx("Available Food Lots")}</span>
                <span className="grid size-8 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Soup className="size-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-black text-slate-900">
                {stats.totalCount} {isBn ? tx("টি ব্যাচ") : tx("batches")}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-emerald-700">
                {isBn ? tx("ক্যাফেটেরিয়া ও হোটেল থেকে সংগৃহীত") : tx("From verified donors")}
              </p>
            </Card>

            <Card className="border-slate-200/90 p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>{isBn ? tx("মোট সম্ভাব্য আহার") : tx("Total Potential Meals")}</span>
                <span className="grid size-8 place-items-center rounded-xl bg-teal-50 text-teal-700">
                  <UsersRound className="size-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-black text-teal-900">
                {stats.totalMeals.toLocaleString(getUiLocale())} {isBn ? tx("প্লেট / মিলস") : tx("meals")}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-teal-700">
                {isBn ? tx("সুবিধাবঞ্চিতদের মাঝে বিতরণযোগ্য") : tx("Ready for immediate rescue")}
              </p>
            </Card>

            <Card className="border-slate-200/90 p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>{isBn ? tx("অতি জরুরি উদ্ধার") : tx("Urgent Rescues (<2h)")}</span>
                <span className="grid size-8 place-items-center rounded-xl bg-rose-50 text-rose-700">
                  <Flame className="size-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-black text-rose-900">
                {stats.urgentLots} {isBn ? tx("টি ব্যাচ") : tx("batches")}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-rose-700">
                {isBn ? tx("২ ঘণ্টার কম সময় বাকি") : tx("Expiring soon")}
              </p>
            </Card>

            <Card className="border-slate-200/90 p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>{isBn ? tx("নিকটবর্তী দূরত্ব") : tx("Nearest Pickup")}</span>
                <span className="grid size-8 place-items-center rounded-xl bg-blue-50 text-blue-700">
                  <MapPin className="size-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-black text-blue-900">
                {stats.minDistance === undefined ? "—" : tx("~{0} km", stats.minDistance)}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-blue-700">
                {isBn ? tx("সরাসরি দূরত্বের হিসাব") : tx("Approximate straight-line distance")}
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
          <LoadingSpinner label={tx("Loading available donations")} />
        )}

        {/* 4. ERROR STATE */}
        {state.status === "error" && !state.data && (
          <EmptyState
            icon={RefreshCw}
            title={isBn ? tx("উদ্বৃত্ত খাবার লোড করা যায়নি") : tx("Available food could not load")}
            description={tx(state.error.message)}
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
                  title={isBn ? tx("ফিল্টার সমূহ") : tx("Filters")}
                  description={
                    isBn ? tx("পিকআপের পরিধি, খাদ্যের ধরণ ও পরিমাণ অনুযায়ী ফিল্টার করুন।") : tx("Shared with rescue map.")
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
            <section aria-label={tx("উপলব্ধ খাদ্য তালিকা")} className="grid gap-4">
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
            <span>{isBn ? tx("রাডার ম্যাপ ভিউ") : tx("Radar Map View")}</span>
          </ButtonLink>
        </div>
      </div>
    </PortalShell>
  );
}
