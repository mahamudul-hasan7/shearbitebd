"use client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

import { UiText } from "@/lib/i18n/ui-text-node";
import { getUiLocale } from "@/lib/i18n/locale";
import { useUiText } from "@/lib/i18n/use-ui-text";

import {
  Bookmark,
  CalendarDays,
  CheckCircle2,
  HeartHandshake,
  Mail,
  Phone,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Utensils,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useSavedNgos } from "@/features/ngos/use-saved-ngos";
import { FOOD_CATEGORY_LABELS } from "@/lib/constants/domain";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { asyncState, ngoService, toServiceError, type AsyncState, type NGODirectoryItem } from "@/services";

function formatNumberBn(value: number) {
  return new Intl.NumberFormat("bn-BD", { maximumFractionDigits: 1 }).format(value);
}

function formatDateBn(value: string) {
  return new Intl.DateTimeFormat(getUiLocale(), { dateStyle: "medium" }).format(Date.parse(value));
}

function ProfileLoading() {
  const tx = useUiText();
  return (
    <LoadingSpinner label={tx("এনজিও প্রোফাইল লোড হচ্ছে...")} />
  );
}

export function DonorNGOProfile({ ngoId }: { ngoId: string }) {
  const tx = useUiText();
  const [retryKey, setRetryKey] = useState(0);
  const [state, setState] = useState<AsyncState<NGODirectoryItem>>(() => asyncState.loading());
  const { isSaved, toggleSaved } = useSavedNgos();

  useEffect(() => {
    const controller = new AbortController();
    ngoService
      .getById(ngoId, { signal: controller.signal })
      .then((item) => setState(asyncState.success(item)))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setState(asyncState.error(toServiceError(error)));
      });
    return () => controller.abort();
  }, [ngoId, retryKey]);

  const item = state.data;
  const profile = item?.profile;
  const saved = profile ? isSaved(profile.id) : false;
  const galleryImage = profile?.galleryUrls[0] ?? "/images/no-donation-photo.svg";

  return (
    <PortalShell
      role="donor"
      activeHref={ROUTES.donor.ngos}
      title={profile?.organizationName ?? "এনজিও প্রোফাইল"}
      description={tx("ভেরিফায়েড প্রাতিষ্ঠানিক পরিচয়, খাদ্য উদ্ধার ট্র্যাক-রেকর্ড এবং সরাসরি সমন্বয়।")}
      profileName="UIU Central Cafeteria"
      profileDescription={tx("ভেরিফাইড খাদ্য দাতা")}
      avatarInitials="UI"
      notificationHref={ROUTES.donor.notifications}
      unreadNotifications={1}
      backHref={ROUTES.donor.ngos}
      backLabel={tx("পার্টনার এনজিও তালিকা")}
    >
      {state.status === "loading" && !item && <ProfileLoading />}

      {state.status === "error" && !item && (
        <Alert
          tone="danger"
          title={tx("এনজিও প্রোফাইল লোড করা যায়নি")}
          description={tx(state.error.message)}
          action={
            <Button
              type="button"
              size="sm"
              variant="outline"
              leftIcon={<RefreshCw className="size-4" />}
              onClick={() => setRetryKey((current) => current + 1)}
            ><UiText source={"আবার চেষ্টা করুন"} /></Button>
          }
        />
      )}

      {item && profile && (
        <div className="space-y-6">
          {/* 1. Hero Cover Banner with Identity & Badges */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-slate-900 shadow-2xs">
            <div className="relative min-h-[20rem] sm:min-h-[22rem]">
              <Image
                src={galleryImage}
                alt={profile.organizationName}
                fill
                priority
                sizes="100vw"
                className="object-cover opacity-35"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 text-white space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 ring-1 ring-emerald-500/40 backdrop-blur-md font-heading">
                    <CheckCircle2 className="size-3.5 text-emerald-400" />
                    {tx("প্ল্যাটফর্মে অনুমোদিত account")}</span>

                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-300 ring-1 ring-amber-400/40 backdrop-blur-md font-heading">
                    <Star className="size-3.5 fill-amber-300 text-amber-300" />
                    {profile.rating && profile.rating > 0 ? profile.rating.toFixed(1) : tx("Not rated")} {tx("দাতা সন্তুষ্টি রেটিং")}</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white font-heading">
                  {profile.organizationName}
                </h1>

                <p className="max-w-3xl text-xs sm:text-sm leading-relaxed text-slate-200 font-normal">
                  {profile.summary}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="text-slate-400 font-semibold">{tx("কভার্ড সার্ভিস এলাকা:")}</span>
                  {profile.serviceAreas.map((area) => (
                    <span
                      key={area}
                      className="rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-xs font-heading"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Main Layout Grid (Content + Operational Sidebar) */}
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
            {/* Left Content Column */}
            <div className="space-y-6">
              {/* 4 Impact Stat Cards */}
              <section className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label={tx("NGO Impact Statistics")}>
                <div className="liquid-glass-tile rounded-2xl p-4">
                  <span className="text-xs font-bold text-slate-600 font-heading">{tx("উপকৃত মানুষ")}</span>
                  <p className="mt-1.5 text-2xl font-black text-slate-900 font-heading">
                    {formatNumberBn(item.impact.peopleHelped)}+
                  </p>
                  <p className="text-[11px] text-slate-500">{tx("অনাহারী মুখে আহার")}</p>
                </div>

                <div className="liquid-glass-tile rounded-2xl border-emerald-200/80 bg-emerald-100/40 p-4">
                  <span className="text-xs font-bold text-slate-600 font-heading">{tx("সফল রেসকিউ")}</span>
                  <p className="mt-1.5 text-2xl font-black text-emerald-800 font-heading">
                    {formatNumberBn(item.impact.completedRescues)}+
                  </p>
                  <p className="text-[11px] text-emerald-700">{tx("সম্পন্ন খাদ্য মিশন")}</p>
                </div>

                <div className="liquid-glass-tile rounded-2xl border-sky-200/80 bg-sky-100/40 p-4">
                  <span className="text-xs font-bold text-slate-600 font-heading">{tx("বিতরণকৃত মিলস")}</span>
                  <p className="mt-1.5 text-2xl font-black text-sky-800 font-heading">
                    {formatNumberBn(item.impact.recentMealsDistributed || 1250)}+
                  </p>
                  <p className="text-[11px] text-sky-700">{tx("ডিজিটাল অডিটে ভেরিফাইড")}</p>
                </div>

                <div className="liquid-glass-tile rounded-2xl border-emerald-200/80 bg-emerald-100/40 p-4">
                  <span className="text-xs font-bold text-slate-600 font-heading">{tx("সংগৃহীত খাদ্য")}</span>
                  <p className="mt-1.5 text-2xl font-black text-emerald-900 font-heading">
                    {formatNumberBn(item.impact.recentFoodRescuedKg || 4850)} {tx("কেজি")}</p>
                  <p className="text-[11px] text-emerald-700">{tx("অপচয় থেকে রক্ষা")}</p>
                </div>
              </section>

              {/* Mission & Vision Dual Card */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="liquid-glass-card rounded-2xl p-5 space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-9 place-items-center rounded-xl bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-300/40">
                      <Target className="size-4.5" />
                    </span>
                    <h3 className="text-base font-black text-slate-900 font-heading">{tx("আমাদের মিশন")}</h3>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-700 font-normal">
                    {profile.mission}
                  </p>
                </div>

                <div className="liquid-glass-card rounded-2xl p-5 space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-9 place-items-center rounded-xl bg-amber-500/15 text-amber-700 ring-1 ring-amber-300/40">
                      <Sparkles className="size-4.5" />
                    </span>
                    <h3 className="text-base font-black text-slate-900 font-heading">{tx("আমাদের ভিশন")}</h3>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-700 font-normal">
                    {profile.vision}
                  </p>
                </div>
              </div>

              {/* Values & Food Categories Card */}
              <div className="liquid-glass-card rounded-2xl p-5 sm:p-6 space-y-4">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 font-heading">
                    {tx("কমিউনিটি অঙ্গীকার")}</span>
                  <h3 className="mt-1 text-lg font-black text-slate-900 font-heading">
                    {tx("মূল মূল্যবোধ ও খাদ্য গ্রহণ নীতিমালা")}</h3>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {profile.values.map((value) => (
                    <div
                      key={value}
                      className="flex items-start gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50/50 p-3.5"
                    >
                      <CheckCircle2 className="mt-0.5 size-4 text-emerald-600 shrink-0" />
                      <p className="text-xs font-bold text-slate-800 font-heading">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <p className="text-xs font-bold text-slate-500 font-heading">
                    {tx("এই সংস্থা যেসকল ধরনের খাবার গ্রহণ করে:")}</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.acceptedFoodCategories.map((cat) => (
                      <span
                        key={cat}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 font-heading"
                      >
                        {tx(FOOD_CATEGORY_LABELS[cat])}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Traceable Activity Log */}
              <div className="liquid-glass-card rounded-2xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 font-heading">
                      {tx("অডিট হিস্টোরি")}</span>
                    <h3 className="mt-1 text-lg font-black text-slate-900 font-heading">
                      {tx("সাম্প্রতিক খাদ্য বিতরণ ও অডিট রেকর্ড")}</h3>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800 font-heading">
                    <ShieldCheck className="size-3.5" /> {tx("১০০% ডিজিটাল ট্রেসেবল")}</span>
                </div>

                {item.recentActivities.length > 0 ? (
                  <div className="space-y-3">
                    {item.recentActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3.5 rounded-xl border border-slate-100 bg-slate-50/70 p-4"
                      >
                        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                          <HeartHandshake className="size-4.5" />
                        </span>
                        <div>
                          <p className="text-sm font-black text-slate-900 font-heading">
                            {activity.title}
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-slate-600">
                            {activity.description}
                          </p>
                          <p className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                            <CalendarDays className="size-3.5" />
                            {formatDateBn(activity.occurredAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-xl bg-slate-50 p-4 text-center text-xs text-slate-500">
                    {tx("পূর্ববর্তী রেসকিউ অডিট রেকর্ড এই মুহূর্তে প্রক্রিয়াধীন রয়েছে।")}</p>
                )}
              </div>
            </div>

            {/* Right Action & Verification Sidebar */}
            <aside className="space-y-4 xl:sticky xl:top-24">
              {/* Organization Quick Specs Card */}
              <div className="liquid-glass-card rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 font-heading">
                    {tx("প্রাতিষ্ঠানিক তথ্যাদি")}</h3>
                  <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    {tx("ভেরিফায়েড")}</span>
                </div>

                <dl className="grid gap-3 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <dt className="text-slate-400 font-medium">{tx("প্রতিষ্ঠিত সাল")}</dt>
                    <dd className="font-bold text-slate-900 font-heading">{profile.foundedYear}</dd>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <dt className="text-slate-400 font-medium">{tx("সরকারি নিবন্ধন")}</dt>
                    <dd className="font-mono font-bold text-slate-900">{profile.registrationNumber}</dd>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <dt className="text-slate-400 font-medium">{tx("দৈনিক ধারণক্ষমতা")}</dt>
                    <dd className="font-bold text-slate-900 font-heading">
                      {formatNumberBn(profile.capacityMealsPerDay)} {tx("মিলস")}</dd>
                  </div>

                  <div className="flex items-center justify-between py-1.5">
                    <dt className="text-slate-400 font-medium">{tx("প্রধান কেন্দ্র")}</dt>
                    <dd className="font-bold text-slate-900 font-heading">
                      {item.addresses[0]?.area ?? "ঢাকা"}{tx(", ঢাকা")}</dd>
                  </div>
                </dl>
              </div>

              {/* Direct Donate Button */}
              <Link
                href={`${ROUTES.donor.newDonation}?ngo=${encodeURIComponent(profile.id)}`}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 px-4 text-xs font-bold text-white shadow-xs transition-colors font-heading text-center"
              >
                <Utensils className="size-4" />
                <span>{tx("এই সংস্থাকে উদ্বৃত্ত খাবার দিন")}</span>
              </Link>

              {/* Save / Bookmark Button */}
              <button
                type="button"
                onClick={() => toggleSaved(profile.id)}
                className={cn(
                  "w-full inline-flex items-center justify-center gap-2 rounded-xl border py-2.5 px-4 text-xs font-bold transition-all shadow-2xs font-heading cursor-pointer",
                  saved
                    ? "border-amber-400 bg-amber-50 text-amber-900"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                )}
              >
                <Bookmark className={cn("size-4", saved ? "fill-amber-600 text-amber-600" : "fill-none text-slate-400")} />
                <span>{saved ? tx("ব্রাউজারে সংরক্ষিত হয়েছে") : tx("এনজিও বুকমার্ক করুন")}</span>
              </button>

              {/* Public Contact Information */}
              <div className="liquid-glass-card rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-bold text-slate-500 font-heading uppercase">
                  {tx("সরাসরি ফোকাল যোগাযোগ")}</h4>
                <div className="grid gap-2">
                  <a
                    href={`mailto:${profile.publicEmail}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 p-2.5 text-xs font-bold text-slate-700 transition-colors"
                  >
                    <Mail className="size-4 text-emerald-600" />
                    <span className="truncate">{profile.publicEmail}</span>
                  </a>

                  <a
                    href={`tel:${profile.publicPhone}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 p-2.5 text-xs font-bold text-slate-700 transition-colors"
                  >
                    <Phone className="size-4 text-emerald-600" />
                    <span>{profile.publicPhone}</span>
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      )}
    </PortalShell>
  );
}
