"use client";

import {
  Award,
  Bookmark,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  HeartHandshake,
  MapPin,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  UsersRound,
  Utensils,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { useSavedNgos } from "@/features/ngos/use-saved-ngos";
import { FoodCategory, FOOD_CATEGORY_LABELS } from "@/lib/constants/domain";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { asyncState, ngoService, toServiceError, type AsyncState, type NGODirectoryItem } from "@/services";

function formatNumberBn(value: number) {
  return new Intl.NumberFormat("bn-BD").format(value);
}

function DirectoryLoading() {
  return (
    <SkeletonGroup label="ভেরিফায়েড এনজিও তালিকা লোড হচ্ছে..." className="grid gap-6 lg:grid-cols-2">
      {[0, 1].map((item) => (
        <Card key={item} className="overflow-hidden rounded-3xl p-6">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <div className="mt-5 space-y-3">
            <Skeleton className="h-6 w-1/2 rounded-lg" />
            <Skeleton className="h-4 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        </Card>
      ))}
    </SkeletonGroup>
  );
}

export function NGODirectory() {
  const [retryKey, setRetryKey] = useState(0);
  const [state, setState] = useState<AsyncState<NGODirectoryItem[]>>(() => asyncState.loading());
  const [search, setSearch] = useState("");
  const [cause, setCause] = useState("all");
  const [category, setCategory] = useState<FoodCategory | "all">("all");
  const [location, setLocation] = useState("all");
  const [savedOnly, setSavedOnly] = useState(false);
  const { savedNgoIds, isSaved, toggleSaved } = useSavedNgos();

  useEffect(() => {
    const controller = new AbortController();
    ngoService
      .listVerified({ signal: controller.signal })
      .then((items) => setState(asyncState.success(items)))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setState(asyncState.error(toServiceError(error)));
      });
    return () => controller.abort();
  }, [retryKey]);

  const ngos = useMemo(() => state.data ?? [], [state.data]);
  const causes = useMemo(() => [...new Set(ngos.flatMap((item) => item.profile.beneficiaryTypes))].sort(), [ngos]);
  const locations = useMemo(() => [...new Set(ngos.flatMap((item) => item.profile.serviceAreas))].sort(), [ngos]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return ngos.filter((item) => {
      if (
        query &&
        !`${item.profile.organizationName} ${item.profile.summary} ${item.profile.serviceAreas.join(" ")}`
          .toLowerCase()
          .includes(query)
      )
        return false;
      if (cause !== "all" && !item.profile.beneficiaryTypes.includes(cause)) return false;
      if (category !== "all" && !item.profile.acceptedFoodCategories.includes(category)) return false;
      if (location !== "all" && !item.profile.serviceAreas.includes(location)) return false;
      if (savedOnly && !savedNgoIds.has(item.profile.id)) return false;
      return true;
    });
  }, [category, cause, location, ngos, savedNgoIds, savedOnly, search]);

  function resetFilters() {
    setSearch("");
    setCause("all");
    setCategory("all");
    setLocation("all");
    setSavedOnly(false);
  }

  const areaCount = new Set(ngos.flatMap((item) => item.profile.serviceAreas)).size;
  const totalPeopleHelped = ngos.reduce((total, item) => total + item.impact.peopleHelped, 0);
  const totalCompletedRescues = ngos.reduce((total, item) => total + item.impact.completedRescues, 0);

  return (
    <PortalShell
      role="donor"
      activeHref={ROUTES.donor.ngos}
      title="ভেরিফায়েড পার্টনার এনজিও নেটওয়ার্ক"
      description="ঢাকা মেট্রোর সার্টিফাইড দাতব্য সংস্থাসমূহ—যাদের মাধ্যমে আপনার উদ্বৃত্ত খাদ্য অভাবী মানুষের কাছে নিরাপদ ও মর্যাদাপূর্ণ উপায়ে পৌঁছায়।"
      actions={
        <Link
          href={ROUTES.donor.newDonation}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-colors font-heading"
        >
          <Plus className="size-4 stroke-[2.5]" />
          <span>উদ্বৃত্ত খাবার পোস্ট করুন</span>
        </Link>
      }
      profileName="UIU Central Cafeteria"
      profileDescription="ভেরিফাইড খাদ্য দাতা"
      avatarInitials="UI"
      notificationHref={ROUTES.donor.notifications}
      unreadNotifications={1}
    >
      {state.status === "loading" && !state.data && <DirectoryLoading />}

      {state.status === "error" && !state.data && (
        <Alert
          tone="danger"
          title="এনজিও তালিকা লোড করা যায়নি"
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
          {/* 1. High-Impact Network Overview Metric Tiles */}
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="NGO Network Overview">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 font-heading">নিবন্ধিত সংস্থা</span>
                <span className="grid size-8 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                  <ShieldCheck className="size-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-black text-slate-900 font-heading">
                {ngos.length}টি সংস্থা
              </p>
              <p className="text-[11px] text-emerald-600 font-medium">১০০% সরকার ও BFSA নিবন্ধিত</p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 font-heading">মেট্রো সার্ভিস জোন</span>
                <span className="grid size-8 place-items-center rounded-xl bg-sky-50 text-sky-700">
                  <MapPin className="size-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-black text-sky-700 font-heading">
                {areaCount}টি এলাকা
              </p>
              <p className="text-[11px] text-sky-600 font-medium">ঢাকা উত্তর ও দক্ষিণ জুড়ে বিস্তৃত</p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 font-heading">উপকৃত সুবিধাবঞ্চিত</span>
                <span className="grid size-8 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                  <UsersRound className="size-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-black text-emerald-800 font-heading">
                {formatNumberBn(totalPeopleHelped)}+ জন
              </p>
              <p className="text-[11px] text-emerald-600 font-medium">অভাবী মানুষের মুখে আহার</p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 font-heading">সফল রেসকিউ মিশন</span>
                <span className="grid size-8 place-items-center rounded-xl bg-amber-50 text-amber-700">
                  <HeartHandshake className="size-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-black text-amber-700 font-heading">
                {formatNumberBn(totalCompletedRescues)}+ বার
              </p>
              <p className="text-[11px] text-amber-600 font-medium">ডিজিটাল অডিটে ভেরিফাইড</p>
            </div>
          </section>

          {/* 2. Cohesive Search & Smart Filter Ribbon */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-4.5 shadow-2xs space-y-3.5">
            <div className="grid gap-2.5 sm:grid-cols-12 items-center">
              {/* Search Bar */}
              <div className="relative sm:col-span-4">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="সংস্থার নাম, এলাকা বা মিশন দিয়ে খুঁজুন..."
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9.5 pr-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-hidden transition-all"
                />
              </div>

              {/* Service Area Dropdown */}
              <div className="sm:col-span-3">
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-xs font-semibold text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                >
                  <option value="all">সকল মেট্রো সার্ভিস এলাকা</option>
                  {locations.map((area) => (
                    <option key={area} value={area}>
                      📍 {area}
                    </option>
                  ))}
                </select>
              </div>

              {/* Food Category Dropdown */}
              <div className="sm:col-span-3">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as FoodCategory | "all")}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-xs font-semibold text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                >
                  <option value="all">সকল গ্রহণযোগ্য খাদ্য ধরন</option>
                  {Object.values(FoodCategory).map((cat) => (
                    <option key={cat} value={cat}>
                      {FOOD_CATEGORY_LABELS[cat]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Beneficiary Type Dropdown */}
              <div className="sm:col-span-2">
                <select
                  value={cause}
                  onChange={(e) => setCause(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-xs font-semibold text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                >
                  <option value="all">সব সুবিধাভোগী</option>
                  {causes.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bottom Row: Bookmark toggle + Count and Reset */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs font-heading">
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none text-slate-700 font-bold hover:text-emerald-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={savedOnly}
                    onChange={(e) => setSavedOnly(e.target.checked)}
                    className="size-4 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="flex items-center gap-1.5">
                    <Bookmark className="size-3.5 text-emerald-600" />
                    শুধুমাত্র সংরক্ষিত এনজিও ({savedNgoIds.size}টি সেভ করা)
                  </span>
                </label>
              </div>

              <div className="flex items-center gap-3">
                <p className="font-bold text-slate-500">
                  মোট <span className="text-slate-900 font-black">{filtered.length}টি</span> ভেরিফায়েড সংস্থা প্রদর্শিত হচ্ছে
                </p>
                {(search || cause !== "all" || category !== "all" || location !== "all" || savedOnly) && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer"
                  >
                    <RotateCcw className="size-3.5" />
                    <span>ফিল্টার রিসেট করুন</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 3. NGO Cards Stream */}
          {ngos.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-14 text-center shadow-2xs">
              <Building2 className="mx-auto size-12 stroke-[1.5] text-slate-300" />
              <h3 className="mt-4 text-lg font-black text-slate-900 font-heading">
                কোনো ভেরিফায়েড এনজিও পাওয়া যায়নি
              </h3>
              <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
                শীঘ্রই নতুন সার্টিফাইড দাতব্য সংস্থা এই প্ল্যাটফর্মে যুক্ত হবে।
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-2xs">
              <Building2 className="mx-auto size-10 text-slate-400" />
              <h3 className="mt-3 text-base font-black text-slate-900 font-heading">
                আপনার অনুসন্ধানের সাথে কোনো এনজিও মেলেনি
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                অন্য এলাকা বা ভিন্ন ফিল্টার নির্বাচন করে পুনরায় চেষ্টা করুন।
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 font-heading cursor-pointer"
              >
                সকল এনজিও দেখুন
              </button>
            </div>
          ) : (
            <section className="grid gap-6 lg:grid-cols-2" aria-label="Verified NGOs List">
              {filtered.map((item, index) => {
                const profile = item.profile;
                const saved = isSaved(profile.id);
                return (
                  <div
                    key={profile.id}
                    className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xs hover:border-emerald-500/70 hover:shadow-xl hover:shadow-emerald-950/5 transition-all duration-300"
                  >
                    <div>
                      {/* NGO Cover Image & Badges */}
                      <div className="relative h-48 overflow-hidden bg-slate-100">
                        <Image
                          src={profile.galleryUrls[0] ?? "/images/ngo-community-gallery.png"}
                          alt={profile.organizationName}
                          fill
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="object-cover transition duration-500 group-hover:scale-105"
                          style={{ objectPosition: index % 2 === 0 ? "left center" : "right center" }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-slate-950/20" />

                        {/* Top Badges */}
                        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3.5">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/80 px-3 py-1 text-[11px] font-bold text-emerald-300 backdrop-blur-md ring-1 ring-emerald-500/40 shadow-xs font-heading">
                            <CheckCircle2 className="size-3.5 text-emerald-400" />
                            সরকারি ও BFSA ভেরিফায়েড
                          </span>

                          <button
                            type="button"
                            onClick={() => toggleSaved(profile.id)}
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition-all shadow-xs backdrop-blur-md cursor-pointer font-heading",
                              saved
                                ? "bg-amber-400 text-slate-950 ring-1 ring-amber-500"
                                : "bg-black/50 text-white hover:bg-black/70 ring-1 ring-white/20"
                            )}
                          >
                            <Bookmark className={cn("size-3.5", saved ? "fill-slate-950" : "fill-none")} />
                            <span>{saved ? "সংরক্ষিত" : "সেভ করুন"}</span>
                          </button>
                        </div>

                        {/* Bottom Overlay Title on Image */}
                        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-mono font-bold text-emerald-300">
                              রেজিস্ট্রেশন: {profile.registrationNumber} · প্রতিষ্ঠিত {profile.foundedYear}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-md bg-white/20 px-2 py-0.5 text-[11px] font-bold text-amber-300 backdrop-blur-xs">
                              <Star className="size-3 fill-amber-300 text-amber-300" />
                              {profile.rating?.toFixed(1) ?? "৪.৯"} রেটিং
                            </span>
                          </div>
                          <h2 className="mt-1 text-xl sm:text-2xl font-black tracking-tight text-white font-heading">
                            {profile.organizationName}
                          </h2>
                        </div>
                      </div>

                      {/* Card Body & Information */}
                      <div className="p-5 sm:p-6 space-y-4">
                        <p className="text-xs leading-relaxed text-slate-600 font-normal line-clamp-2">
                          {profile.summary}
                        </p>

                        {/* Beneficiary Tags */}
                        <div className="flex flex-wrap gap-1.5">
                          {profile.beneficiaryTypes.map((beneficiary) => (
                            <span
                              key={beneficiary}
                              className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800 font-heading"
                            >
                              {beneficiary}
                            </span>
                          ))}
                        </div>

                        {/* 3 Core Stats Grid */}
                        <div className="grid grid-cols-3 gap-2 text-center text-xs font-heading">
                          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5">
                            <span className="block text-[10px] font-bold text-slate-400 uppercase">
                              দৈনিক ধারণক্ষমতা
                            </span>
                            <p className="mt-1 text-sm font-black text-slate-900">
                              {formatNumberBn(profile.capacityMealsPerDay)} মিলস
                            </p>
                          </div>

                          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5">
                            <span className="block text-[10px] font-bold text-slate-400 uppercase">
                              সফল রেসকিউ
                            </span>
                            <p className="mt-1 text-sm font-black text-emerald-700">
                              {formatNumberBn(item.impact.completedRescues)}+ বার
                            </p>
                          </div>

                          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5">
                            <span className="block text-[10px] font-bold text-slate-400 uppercase">
                              উপকৃত মানুষ
                            </span>
                            <p className="mt-1 text-sm font-black text-sky-700">
                              {formatNumberBn(item.impact.peopleHelped)}+ জন
                            </p>
                          </div>
                        </div>

                        {/* Service Areas & Accepted Food Badges */}
                        <div className="space-y-2 text-xs pt-1">
                          <div className="flex items-start gap-1.5 text-slate-600">
                            <MapPin className="size-3.5 shrink-0 text-emerald-600 mt-0.5" />
                            <span className="font-semibold text-slate-500">সার্ভিস জোন:</span>
                            <span className="font-bold text-slate-800">{profile.serviceAreas.join(" · ")}</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <Utensils className="size-3.5 text-slate-400" />
                            <span className="text-[11px] font-medium text-slate-400">গ্রহণযোগ্য:</span>
                            {profile.acceptedFoodCategories.map((cat) => (
                              <span
                                key={cat}
                                className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 font-heading"
                              >
                                {FOOD_CATEGORY_LABELS[cat]}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="p-5 sm:p-6 pt-0 border-t border-slate-100 mt-4 flex flex-col sm:flex-row gap-2.5">
                      <Link
                        href={`${ROUTES.donor.newDonation}?ngo=${encodeURIComponent(profile.id)}`}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2.5 px-4 text-xs font-bold text-white shadow-xs transition-colors font-heading text-center"
                      >
                        <Utensils className="size-3.5" />
                        <span>এই সংস্থাকে খাবার দিন</span>
                      </Link>

                      <Link
                        href={ROUTES.donor.ngoProfile(profile.id)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 py-2.5 px-4 text-xs font-bold text-slate-700 transition-colors font-heading shadow-2xs text-center"
                      >
                        <span>প্রোফাইল ও অডিট</span>
                        <ExternalLink className="size-3.5 text-slate-400" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </section>
          )}
        </div>
      )}
    </PortalShell>
  );
}
