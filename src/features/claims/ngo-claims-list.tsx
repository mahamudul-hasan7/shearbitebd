"use client";

import {
  Activity,
  Box,
  CheckCircle2,
  Clock3,
  Compass,
  HeartHandshake,
  PackageCheck,
  RefreshCw,
  Sparkles,
  Truck,
} from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { ClaimCard } from "@/features/claims/claim-card";
import { ClaimFilters } from "@/features/claims/claim-filters";
import { ACTIVE_CLAIM_STATUSES } from "@/features/claims/types";
import { useNgoClaims } from "@/features/claims/use-ngo-claims";
import { useLanguage } from "@/lib/i18n/language-context";
import { ROUTES } from "@/lib/routes";
import type { ClaimCoordinationDetails } from "@/services";

function ClaimSection({
  title,
  subtitle,
  count,
  items,
  badgeTone = "brand",
}: {
  title: string;
  subtitle?: string;
  count: number;
  items: ClaimCoordinationDetails[];
  badgeTone?: "brand" | "success" | "accent";
}) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby={`${title.toLowerCase().replaceAll(" ", "-")}-heading`} className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 id={`${title.toLowerCase().replaceAll(" ", "-")}-heading`} className="text-xl font-black text-slate-900">
              {title}
            </h2>
            <span className="grid min-w-7 place-items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-black text-emerald-800">
              {count}
            </span>
          </div>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
      <div className="grid gap-4">
        {items.map((item) => (
          <ClaimCard key={item.claim.id} item={item} />
        ))}
      </div>
    </section>
  );
}

export function NGOClaimsList() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const { state, filter, setFilter, search, setSearch, filteredItems, stats, retry } = useNgoClaims();
  const activeItems = filteredItems.filter((item) => ACTIVE_CLAIM_STATUSES.has(item.claim.status));
  const historyItems = filteredItems.filter((item) => !ACTIVE_CLAIM_STATUSES.has(item.claim.status));

  return (
    <PortalShell
      role="ngo"
      activeHref={ROUTES.ngo.claims}
      title={isBn ? "ক্লেইমকৃত খাদ্য উদ্ধারসমূহ" : "My claims"}
      description={
        isBn
          ? "সংরক্ষিত খাদ্য লট, ভলান্টিয়ার ট্র্যাকিং, হ্যান্ডওভার ও সফল বিতরণ রেকর্ড পরিচালনা করুন।"
          : "Track reserved food, volunteer assignment, pickup, delivery, and completed rescue history."
      }
      profileName={isBn ? "মাস্তুল ফাউন্ডেশন" : "Hope Foundation"}
      profileDescription={isBn ? "অনুমোদিত ও ভেরিফায়েড এনজিও" : "Verified NGO"}
      avatarInitials="HF"
      notificationHref={ROUTES.ngo.notifications}
      actions={
        <ButtonLink
          href={ROUTES.ngo.discover}
          leftIcon={<Compass className="size-4" />}
          className="bg-emerald-600 text-white hover:bg-emerald-700"
        >
          {isBn ? "উদ্বৃত্ত খাদ্য খুঁজুন" : "Discover food"}
        </ButtonLink>
      }
    >
      <div className="grid gap-6">
        {/* 4 Enterprise Logistics KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Box}
            label={isBn ? "মোট উদ্ধার ক্লেইম" : "Total claims"}
            value={String(stats.total)}
            helper={isBn ? "সকল সক্রিয় ও সম্পন্ন লট" : "All visible rescue claims"}
          />
          <StatCard
            icon={Clock3}
            label={isBn ? "অপেক্ষমাণ লট" : "Reserved"}
            value={String(stats.reserved)}
            helper={isBn ? "ভলান্টিয়ার বরাদ্দের অপেক্ষায়" : "Awaiting volunteer"}
            tone="accent"
          />
          <StatCard
            icon={Truck}
            label={isBn ? "চলমান পিকআপ ও ট্রানজিট" : "In progress"}
            value={String(stats.inProgress)}
            helper={isBn ? "সংগ্রহ বা শেল্টারের পথে" : "Pickup or delivery"}
            tone="info"
          />
          <StatCard
            icon={PackageCheck}
            label={isBn ? "সফল বিতরণ সম্পন্ন" : "Completed"}
            value={String(stats.completed)}
            helper={isBn ? "ইমপ্যাক্ট রেকর্ডে অন্তর্ভুক্ত" : "Distribution recorded"}
            tone="success"
          />
        </div>

        {/* Search & Filters */}
        {state.data && (
          <ClaimFilters
            items={state.data}
            filter={filter}
            search={search}
            onFilterChange={setFilter}
            onSearchChange={setSearch}
          />
        )}

        {/* Loading Skeletons */}
        {state.status === "loading" && !state.data && (
          <SkeletonGroup label="Loading NGO claims" className="grid gap-4">
            <Skeleton className="h-12 rounded-2xl" />
            <Skeleton className="h-56 rounded-3xl" />
            <Skeleton className="h-56 rounded-3xl" />
          </SkeletonGroup>
        )}

        {/* Error State */}
        {state.status === "error" && !state.data && (
          <EmptyState
            icon={RefreshCw}
            title={isBn ? "ক্লেইম তালিকা লোড করা যায়নি" : "Claims could not load"}
            description={state.error.message}
            action={<Button onClick={retry}>{isBn ? "পুনরায় চেষ্টা করুন" : "Try again"}</Button>}
          />
        )}

        {/* No Results Filter State */}
        {state.data && filteredItems.length === 0 && (
          <EmptyState
            icon={Box}
            title={isBn ? "এই ফিল্টারে কোনো ক্লেইম পাওয়া যায়নি" : "No claims match this view"}
            description={
              isBn
                ? "অন্য কোনো স্ট্যাটাস ফিল্টার নির্বাচন করুন অথবা সার্চ বক্সে নতুন নাম দিয়ে চেষ্টা করুন।"
                : "Try another status or clear the search. New claims appear here after reserving an eligible donation."
            }
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  onClick={() => {
                    setFilter("ALL");
                    setSearch("");
                  }}
                >
                  {isBn ? "সকল ফিল্টার মুছুন" : "Clear filters"}
                </Button>
                <ButtonLink href={ROUTES.ngo.discover} variant="outline">
                  {isBn ? "উদ্বৃত্ত খাদ্য ব্রাউজ করুন" : "Browse donations"}
                </ButtonLink>
              </div>
            }
          />
        )}

        {/* Structured Sections */}
        {filteredItems.length > 0 && (
          <div className="grid gap-8">
            <ClaimSection
              title={isBn ? "চলমান ও লাইভ রেসকিউ কার্যক্রম" : "Active claims"}
              subtitle={
                isBn
                  ? "খাদ্য সংগ্রহ, ভলান্টিয়ার ট্র্যাকিং এবং ডেলিভারি প্রাপ্তির অপেক্ষায় থাকা সক্রিয় ক্লেইমসমূহ"
                  : "Live food rescues in progress or awaiting handovers"
              }
              count={activeItems.length}
              items={activeItems}
              badgeTone="brand"
            />
            <ClaimSection
              title={isBn ? "সম্পন্ন ও পূর্ববর্তী রেসকিউ হিস্ট্রি" : "Claim history"}
              subtitle={
                isBn
                  ? "সফলভাবে বিতরণকৃত এবং জাতীয় প্রভাব রেকর্ডে অন্তর্ভুক্ত খাদ্য উদ্ধারসমূহ"
                  : "Completed distributions contributing to transparent impact reporting"
              }
              count={historyItems.length}
              items={historyItems}
              badgeTone="success"
            />
          </div>
        )}

        {/* Bottom Impact Callout */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white p-6 shadow-xs">
          <div className="flex items-start gap-3.5">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-emerald-600 text-white shadow-xs">
              <HeartHandshake className="size-6" />
            </span>
            <div>
              <p className="font-black text-slate-900">
                {isBn
                  ? "দায়িত্বশীল খাদ্য উদ্ধারে আপনার ভূমিকার জন্য আন্তরিক ধন্যবাদ।"
                  : "Thank you for rescuing food responsibly."}
              </p>
              <p className="mt-1 text-xs text-slate-600">
                {isBn
                  ? "প্রতিটি সফল বিতরণ শেয়ারবাইট বিডি-র স্বচ্ছ ইমপ্যাক্ট মেট্রিক্সে সংরক্ষিত হয় এবং সুবিধাবঞ্চিত মানুষের মুখে হাসি ফোটায়।"
                  : "Every completed distribution contributes to transparent impact reporting across Bangladesh."}
              </p>
            </div>
          </div>
          <ButtonLink
            href={ROUTES.ngo.impact}
            variant="outline"
            className="border-emerald-300 text-emerald-800 hover:bg-emerald-100/60"
          >
            {isBn ? "জাতীয় প্রভাব মেট্রিক্স দেখুন" : "View impact"}
          </ButtonLink>
        </div>
      </div>
    </PortalShell>
  );
}
