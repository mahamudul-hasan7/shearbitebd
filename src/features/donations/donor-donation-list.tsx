"use client";

import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Filter,
  PackageOpen,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Utensils,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DonationManagementCard } from "@/components/donation/donation-management-card";
import { PortalShell } from "@/components/layout/portal-shell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { DONATION_TABS, matchesDonationTab, type DonationTabKey } from "@/features/donations/donation-management";
import { FoodCategory, FOOD_CATEGORY_LABELS, PriorityLevel } from "@/lib/constants/domain";
import { UserRole } from "@/lib/constants/roles";
import { DonationStatus } from "@/lib/constants/statuses";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { asyncState, donationService, toServiceError, type AsyncState } from "@/services";
import type { DonationView, ViewerContext } from "@/types/domain";

const DONOR_PROFILE_ID = "donor-uiu";
const DONOR_VIEWER: ViewerContext = { userId: "user-donor-uiu", donorProfileId: DONOR_PROFILE_ID, role: UserRole.DONOR };
type DonationSort = "deadline" | "updated" | "newest";

const BENGALI_TAB_LABELS: Record<DonationTabKey, string> = {
  all: "সকল অনুদান",
  active: "চলমান ও পিকআপ",
  completed: "বিতরণ সম্পন্ন",
  archived: "আর্কাইভ / অন্যান্য",
  matched: "এনজিও ক্লেইমকৃত",
  scheduled: "রাইডার নির্ধারিত",
  cancelled: "বাতিলকৃত",
  expired: "মেয়াদোত্তীর্ণ",
};

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
    donationService
      .list({ donorProfileId: DONOR_PROFILE_ID, viewer: DONOR_VIEWER }, { signal: controller.signal })
      .then((donations) => setState(asyncState.success(donations)))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setState(asyncState.error(toServiceError(error)));
      });
    return () => controller.abort();
  }, [retryKey]);

  const donations = useMemo(() => state.data ?? [], [state.data]);

  const tabCounts = useMemo(
    () =>
      Object.fromEntries(
        DONATION_TABS.map((item) => [
          item.key,
          donations.filter((donation) => matchesDonationTab(donation.status, item.key)).length,
        ])
      ) as Record<DonationTabKey, number>,
    [donations]
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return donations
      .filter((donation) => {
        if (!matchesDonationTab(donation.status, tab)) return false;
        if (category !== "all" && donation.category !== category) return false;
        if (priority !== "all" && donation.priority !== priority) return false;
        if (
          query &&
          !`${donation.title} ${donation.description} ${donation.id} ${donation.pickup.approximateArea}`
            .toLowerCase()
            .includes(query)
        )
          return false;
        return true;
      })
      .sort((left, right) => {
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

  const activeRescuesCount = donations.filter((item) =>
    [
      DonationStatus.AVAILABLE,
      DonationStatus.PUBLISHED,
      DonationStatus.DRAFT,
      DonationStatus.RESERVED,
      DonationStatus.ASSIGNED,
      DonationStatus.PICKED_UP,
      DonationStatus.DELIVERED,
    ].includes(item.status)
  ).length;

  const completedCount = donations.filter((item) => item.status === DonationStatus.DISTRIBUTED).length;

  return (
    <PortalShell
      role="donor"
      activeHref={ROUTES.donor.donations}
      title="আমার খাদ্য অনুদানসমূহ"
      description="ক্যাফেটেরিয়া ও রেস্তোরাঁর উদ্বৃত্ত খাবারের তালিকা তৈরি, লাইভ স্ট্যাটাস মনিটরিং এবং ভলান্টিয়ার হ্যান্ডওভার ট্র্যাকিং।"
      actions={
        <Link
          href={ROUTES.donor.newDonation}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-colors font-heading"
        >
          <Plus className="size-4 stroke-[2.5]" />
          <span>নতুন খাবার পোস্ট করুন</span>
        </Link>
      }
      profileName="UIU Central Cafeteria"
      profileDescription="ভেরিফাইড খাদ্য দাতা"
      avatarInitials="UI"
      notificationHref={ROUTES.donor.notifications}
      unreadNotifications={1}
    >
      {state.status === "loading" && !state.data && (
        <SkeletonGroup label="খাদ্য অনুদান লোড হচ্ছে..." className="grid gap-5">
          {[0, 1, 2].map((item) => (
            <Card key={item} className="overflow-hidden p-6">
              <Skeleton className="h-40 w-full rounded-2xl" />
            </Card>
          ))}
        </SkeletonGroup>
      )}

      {state.status === "error" && !state.data && (
        <Alert
          tone="danger"
          title="খাদ্য তালিকা লোড করা যায়নি"
          description={state.error.message}
          action={
            <Button
              type="button"
              size="sm"
              variant="outline"
              leftIcon={<RefreshCw className="size-4" />}
              onClick={() => setRetryKey((current) => current + 1)}
            >
              আবার চেষ্টা করুন
            </Button>
          }
        />
      )}

      {state.data && (
        <div className="space-y-6">
          {/* 1. Clear Operational KPI Summary Cards */}
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Donation overview">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 font-heading">মোট অনুদান পোস্ট</span>
                <span className="grid size-8 place-items-center rounded-xl bg-slate-100 text-slate-700">
                  <PackageOpen className="size-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-black text-slate-900 font-heading">
                {donations.length}টি
              </p>
              <p className="text-[11px] text-slate-400 font-medium">ক্যাফেটেরিয়ার তালিকা</p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 font-heading">চলমান রেসকিউ</span>
                <span className="grid size-8 place-items-center rounded-xl bg-sky-50 text-sky-700">
                  <Clock3 className="size-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-black text-sky-700 font-heading">
                {activeRescuesCount}টি
              </p>
              <p className="text-[11px] text-sky-600 font-medium">পিকআপ ও ডেলিভারি সক্রিয়</p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 font-heading">সফল বিতরণ সম্পন্ন</span>
                <span className="grid size-8 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                  <CheckCircle2 className="size-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-black text-emerald-700 font-heading">
                {completedCount > 0 ? `${completedCount}টি` : "১টি ব্যাচ"}
              </p>
              <p className="text-[11px] text-emerald-600 font-medium">৮৫০+ মানুষের পাতে পৌঁছেছে</p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 font-heading">খাদ্য সুরক্ষা স্কোর</span>
                <span className="grid size-8 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                  <ShieldCheck className="size-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-black text-emerald-800 font-heading">
                ১০০%
              </p>
              <p className="text-[11px] text-emerald-600 font-medium">নিরাপদ কোল্ড-চেইন মান</p>
            </div>
          </section>

          {/* 2. Streamlined Navigation Tabs & Filters Bar */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-2xs space-y-3.5">
            {/* Top Row: 4 Consolidated Purposeful Tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs font-bold font-heading">
              {DONATION_TABS.map((item) => {
                const isActive = tab === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setTab(item.key)}
                    className={cn(
                      "shrink-0 inline-flex items-center gap-2 rounded-xl px-4 py-2 transition-all cursor-pointer",
                      isActive
                        ? "bg-emerald-600 text-white font-black shadow-xs"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <span>{BENGALI_TAB_LABELS[item.key] ?? item.label}</span>
                    <span
                      className={cn(
                        "rounded-md px-1.5 py-0.5 text-[10px]",
                        isActive ? "bg-emerald-700 text-white" : "bg-white text-slate-700 shadow-2xs"
                      )}
                    >
                      {tabCounts[item.key] ?? 0}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Row: Search & Filters */}
            <div className="grid gap-2.5 sm:grid-cols-12 items-center pt-2 border-t border-slate-100">
              {/* Search Bar */}
              <div className="relative sm:col-span-6">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="খাবারের নাম, রেফারেন্স কোড বা এলাকা দিয়ে খুঁজুন..."
                  className="h-9.5 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9.5 pr-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-hidden transition-all"
                />
              </div>

              {/* Category Dropdown */}
              <div className="sm:col-span-3">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as FoodCategory | "all")}
                  className="h-9.5 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-xs font-semibold text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                >
                  <option value="all">সব ধরনের খাবার</option>
                  {Object.values(FoodCategory).map((item) => (
                    <option key={item} value={item}>
                      {FOOD_CATEGORY_LABELS[item]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Dropdown */}
              <div className="sm:col-span-3">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as DonationSort)}
                  className="h-9.5 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-xs font-semibold text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                >
                  <option value="deadline">নিরাপদ মেয়াদ (জরুরি আগে)</option>
                  <option value="updated">সম্প্রতি আপডেট</option>
                  <option value="newest">নতুন পোস্টকৃত</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Summary & Reset Filter */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs font-heading">
            <p className="font-bold text-slate-500">
              প্রদর্শিত হচ্ছে <span className="text-slate-900 font-black">{filtered.length}টি</span> অনুদান (সর্বমোট {donations.length}টির মধ্যে)
            </p>
            {(search || category !== "all" || priority !== "all" || tab !== "all" || sort !== "deadline") && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 font-bold text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
                <span>সব ফিল্টার মুছুন</span>
              </button>
            )}
          </div>

          {/* 3. Donations Cards Stream */}
          {donations.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-14 text-center shadow-2xs">
              <PackageOpen className="mx-auto size-12 stroke-[1.5] text-slate-300" />
              <h3 className="mt-4 text-lg font-black text-slate-900 font-heading">
                এখনও কোনো খাদ্য অনুদান তালিকাভুক্ত হয়নি
              </h3>
              <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
                আপনার ক্যাফেটেরিয়া বা রেস্তোরাঁর উদ্বৃত্ত খাবারের প্রথম পোস্ট দিয়ে খাদ্য উদ্ধার কার্যক্রমে অংশ নিন।
              </p>
              <Link
                href={ROUTES.donor.newDonation}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors font-heading"
              >
                <Plus className="size-4" /> নতুন খাবার পোস্ট করুন
              </Link>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-2xs">
              <PackageOpen className="mx-auto size-10 text-slate-400" />
              <h3 className="mt-3 text-base font-black text-slate-900 font-heading">
                এই ফিল্টারে কোনো অনুদান পাওয়া যায়নি
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                অনুগ্রহ করে সার্চ কীওয়ার্ড পরিবর্তন করুন অথবা ফিল্টার রিসেট করুন।
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 font-heading cursor-pointer"
              >
                সব অনুদান দেখুন
              </button>
            </div>
          ) : (
            <section className="grid gap-4 sm:gap-5" aria-label="Donations list">
              {filtered.map((donation) => (
                <DonationManagementCard key={donation.id} donation={donation} />
              ))}
            </section>
          )}
        </div>
      )}
    </PortalShell>
  );
}
