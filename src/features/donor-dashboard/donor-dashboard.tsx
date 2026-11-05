"use client";

import { useState } from "react";
import {
  ArrowRight,
  Bike,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck2,
  HelpCircle,
  History,
  Info,
  MapPin,
  PackageOpen,
  PackageSearch,
  PhoneCall,
  Plus,
  ShieldCheck,
  Sparkles,
  Utensils,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { ActiveDonationCard } from "@/components/donor/active-donation-card";
import {
  DonorDashboardError,
  DonorDashboardLoading,
  NoActiveDonation,
  NoDashboardContent,
} from "@/components/donor/donor-dashboard-states";
import { DonorImpactGrid } from "@/components/donor/donor-impact-grid";
import { RecentActivityCard } from "@/components/donor/recent-activity-card";
import { SupportedNgosCard } from "@/components/donor/supported-ngos-card";
import { PortalShell } from "@/components/layout/portal-shell";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { useDonorDashboard } from "@/features/donor-dashboard/use-donor-dashboard";
import { DonationStatus } from "@/lib/constants/statuses";
import { ROUTES } from "@/lib/routes";

export function DonorDashboard() {
  const { state, retry } = useDonorDashboard();
  const data = state.data;
  const [activeTab, setActiveTab] = useState<"today" | "history">("today");

  const completedDonations = data?.donations.filter(
    (d) => d.status === DonationStatus.DISTRIBUTED || d.status === DonationStatus.DELIVERED
  ) ?? [];

  return (
    <PortalShell
      role="donor"
      activeHref={ROUTES.donor.dashboard}
      title={data ? `স্বাগতম, ${data.profile.name}` : "ডোনার ওভারভিউ হাব"}
      description="উদ্বৃত্ত খাবার উদ্ধার কার্যক্রম পর্যবেক্ষণ, পিকআপ সমন্বয় এবং কমিউনিটি ইমপ্যাক্ট পরিচালনা করুন।"
      actions={
        data ? (
          <ButtonLink
            href={ROUTES.donor.newDonation}
            leftIcon={<Plus className="size-4" />}
            variant="primary"
            className="font-bold shadow-xs text-xs"
          >
            উদ্বৃত্ত খাবার পোস্ট করুন
          </ButtonLink>
        ) : undefined
      }
      profileName={data?.profile.name}
      profileDescription={data?.profile.description}
      avatarInitials={data?.profile.initials}
      notificationHref={data ? ROUTES.donor.notifications : undefined}
      unreadNotifications={data?.unreadNotifications}
    >
      {state.status === "loading" && !data && <DonorDashboardLoading />}
      {state.status === "error" && !data && <DonorDashboardError message={state.error.message} onRetry={retry} />}

      {data && (
        <div className="space-y-8">
          {data.donations.length === 0 ? (
            <NoDashboardContent />
          ) : (
            <>
              {/* 1. Zero-Friction Institution Header Bar */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div className="flex items-start gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200/60 shadow-2xs">
                    <Building2 className="size-6" />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                        {data.profile.name}
                      </h2>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200 font-heading">
                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        আজকের কিচেন পিকআপ উইন্ডো চালু
                      </span>
                    </div>
                    <p className="mt-1 text-xs sm:text-sm text-slate-500 flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3.5 text-emerald-600" /> মাদানী এভিনিউ, ১০০ ফিট রোড, বাড্ডা
                      </span>
                      <span>·</span>
                      <span className="font-mono text-slate-400">আইডি: DONOR-DH-UIU</span>
                    </p>
                  </div>
                </div>

                {/* Instant Post Button */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <Link
                    href={ROUTES.donor.newDonation}
                    className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 px-5 py-3 text-xs font-black uppercase tracking-wider text-white shadow-xs transition-all active:scale-95 font-heading cursor-pointer"
                  >
                    <Plus className="size-4 stroke-[2.5]" />
                    <span>আজকের উদ্বৃত্ত খাবার পোস্ট করুন</span>
                  </Link>
                </div>
              </div>

              {/* 2. Three High-Impact KPI Metrics */}
              <DonorImpactGrid stats={data.stats} />

              {/* 3. Primary Operational Focus: Active Rescue Cockpit */}
              <section className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-slate-900 font-heading">
                      লাইভ পিকআপ ও ট্র্যাকিং ককপিট
                    </h2>
                    {data.activeDonation && (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200 font-mono">
                        ১টি সক্রিয় ব্যাচ
                      </span>
                    )}
                  </div>

                  {data.activeDonation && (
                    <Link
                      href={ROUTES.donor.donation(data.activeDonation.id)}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 font-heading hover:underline"
                    >
                      সম্পূর্ণ ট্র্যাকিং পেজ দেখুন →
                    </Link>
                  )}
                </div>

                {data.activeDonation ? (
                  <ActiveDonationCard donation={data.activeDonation} />
                ) : (
                  <NoActiveDonation />
                )}
              </section>

              {/* 4. Two Clean Operational Tabs: Today's Listings vs. Audit History */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
                  {/* Segmented Tab Switcher */}
                  <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-bold font-heading">
                    <button
                      type="button"
                      onClick={() => setActiveTab("today")}
                      className={`cursor-pointer rounded-lg px-4 py-2 transition-all ${
                        activeTab === "today"
                          ? "bg-white text-emerald-950 shadow-2xs font-black"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      আজকের কার্যক্রম ও তালিকা ({data.donations.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("history")}
                      className={`cursor-pointer rounded-lg px-4 py-2 transition-all ${
                        activeTab === "history"
                          ? "bg-white text-emerald-950 shadow-2xs font-black"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      অতীতের অডিট ও রসিদ ({completedDonations.length})
                    </button>
                  </div>

                  <Link
                    href={ROUTES.donor.donations}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 font-heading hover:underline"
                  >
                    সকল অনুদান দেখুন →
                  </Link>
                </div>

                {/* Tab 1 Content: Today's Active / Available Listings */}
                {activeTab === "today" && (
                  <div className="divide-y divide-slate-100">
                    {data.donations.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4 group hover:bg-slate-50/70 -mx-3 px-3 rounded-2xl transition-colors"
                      >
                        <div className="flex items-start gap-3.5 min-w-0">
                          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 mt-0.5">
                            <Utensils className="size-5" />
                          </span>
                          <div className="min-w-0">
                            <Link
                              href={ROUTES.donor.donation(item.id)}
                              className="font-bold text-sm sm:text-base text-slate-900 hover:text-emerald-700 font-heading truncate block"
                            >
                              {item.title}
                            </Link>
                            <p className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-slate-700">
                                {item.quantity.value} {item.quantity.unit.toLowerCase()}
                              </span>
                              <span>·</span>
                              <span>{item.pickup.approximateArea}</span>
                              <span>·</span>
                              <span className="font-mono text-slate-400">আইডি: {item.id}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 self-end sm:self-center">
                          <StatusBadge status={item.status} />
                          <ButtonLink
                            href={ROUTES.donor.donation(item.id)}
                            size="sm"
                            variant="outline"
                            className="text-xs font-bold"
                          >
                            বিস্তারিত দেখুন
                          </ButtonLink>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab 2 Content: Past Completed Rescues & Distribution Receipts */}
                {activeTab === "history" && (
                  <div className="divide-y divide-slate-100">
                    {completedDonations.length === 0 ? (
                      <div className="py-8 text-center text-slate-500 text-xs">
                        <FileCheck2 className="size-8 text-slate-400 mx-auto mb-2" />
                        এখনো কোনো সম্পন্ন অনুদানের অডিট রসিদ সংরক্ষিত হয়নি।
                      </div>
                    ) : (
                      completedDonations.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4 -mx-3 px-3 rounded-2xl hover:bg-slate-50/70 transition-colors"
                        >
                          <div className="flex items-start gap-3.5 min-w-0">
                            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700 border border-teal-200/60 mt-0.5">
                              <CheckCircle2 className="size-5" />
                            </span>
                            <div className="min-w-0">
                              <p className="font-bold text-sm text-slate-900 font-heading">
                                {item.title}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                সফল বিতরণ: {item.quantity.value} {item.quantity.unit.toLowerCase()} · গ্রহণকারী এনজিও: মাস্তুল ফাউন্ডেশন
                              </p>
                            </div>
                          </div>

                          <ButtonLink
                            href={ROUTES.donor.donation(item.id)}
                            size="sm"
                            variant="outline"
                            className="text-xs font-bold text-slate-700 shrink-0 self-end sm:self-center"
                          >
                            ডিজিটাল রসিদ ডাউনলোড
                          </ButtonLink>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* 5. Bottom Two Columns: Chronological Activity + Verified Partner NGOs */}
              <div className="grid gap-6 lg:grid-cols-2">
                <RecentActivityCard activities={data.activities} />
                <SupportedNgosCard ngos={data.supportedNgos} />
              </div>
            </>
          )}
        </div>
      )}
    </PortalShell>
  );
}
