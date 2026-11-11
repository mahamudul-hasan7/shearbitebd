"use client";

import { Compass, List, RefreshCw } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { DiscoveryControls } from "@/features/ngo-discovery/discovery-controls";
import { DiscoveryFilterFields } from "@/features/ngo-discovery/discovery-filters";
import { RescueMap } from "@/features/ngo-discovery/rescue-map";
import { useNgoDiscovery } from "@/features/ngo-discovery/use-ngo-discovery";
import { useLanguage } from "@/lib/i18n/language-context";
import { ROUTES } from "@/lib/routes";

export function NGORescueMap() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const {
    state,
    filters,
    filteredItems,
    activeFilterCount,
    updateFilter,
    resetFilters,
    retry,
    queryString,
  } = useNgoDiscovery();

  return (
    <PortalShell
      role="ngo"
      activeHref={ROUTES.ngo.discoverMap}
      title={isBn ? "উদ্ধার রাডার ম্যাপ" : "Dhaka Rescue Radar Map"}
      description={
        isBn
          ? "ঢাকা মেট্রোপলিটন এলাকার উদ্বৃত্ত খাবার, দাতা জোন ও রিয়েল-টাইম সময়সীমা পর্যবেক্ষণ"
          : "Explore approximate surplus food clusters and live countdowns across Dhaka Metro without compromising donor privacy."
      }
      profileName="Hope Foundation"
      profileDescription={isBn ? "নিবন্ধিত এনজিও পার্টনার" : "Verified NGO Partner"}
      avatarInitials="HF"
      notificationHref={ROUTES.ngo.notifications}
    >
      <div className="grid gap-6">
        {/* Top Search, Sort & Switcher Controls */}
        <DiscoveryControls
          mode="map"
          queryString={queryString}
          filters={filters}
          activeFilterCount={activeFilterCount}
          resultCount={filteredItems.length}
          updateFilter={updateFilter}
          resetFilters={resetFilters}
        />

        {/* Loading State */}
        {state.status === "loading" && !state.data && (
          <Skeleton className="h-[42rem] rounded-2xl" />
        )}

        {/* Error State */}
        {state.status === "error" && !state.data && (
          <EmptyState
            icon={RefreshCw}
            title={isBn ? "রাডার ম্যাপ লোড করা যায়নি" : "Rescue map could not load"}
            description={state.error.message}
            action={
              <Button onClick={retry} variant="primary">
                {isBn ? "পুনরায় চেষ্টা করুন" : "Try again"}
              </Button>
            }
          />
        )}

        {/* Main Content Layout */}
        {state.data && (
          <div className="grid items-start gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
            {/* Desktop Filters Sidebar */}
            <aside className="sticky top-24 hidden lg:block">
              <Card className="border border-slate-200/90 shadow-sm">
                <CardHeader
                  title={isBn ? "ফিল্টার সমূহ" : "Rescue Filters"}
                  description={
                    isBn
                      ? "দূরত্ব, খাদ্য ধরন ও অগ্রাধিকার"
                      : "Distance radius, food types & urgency"
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

            {/* Radar Map Canvas & Item Details */}
            <RescueMap items={filteredItems} />
          </div>
        )}

        {/* Mobile Floating View Switcher FAB (< lg) */}
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30 lg:hidden pointer-events-auto">
          <ButtonLink
            href={ROUTES.ngo.discover}
            variant="primary"
            size="sm"
            className="rounded-full bg-slate-900/95 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/35 px-5 py-2.5 text-xs font-black backdrop-blur-md border border-slate-700/60 active:scale-95 transition-all flex items-center gap-2"
          >
            <List className="size-4 text-emerald-400" />
            <span>{isBn ? "তালিকা ভিউ" : "List View"}</span>
          </ButtonLink>
        </div>
      </div>
    </PortalShell>
  );
}