"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Compass,
  HandHeart,
  MapPin,
  PackageSearch,
  Plus,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { ActiveClaimOverview } from "@/features/ngo-dashboard/active-claim-overview";
import { NGODashboardError, NGODashboardLoading, NoRecommendedDonation } from "@/features/ngo-dashboard/ngo-dashboard-states";
import { NGOQuickActions } from "@/features/ngo-dashboard/ngo-quick-actions";
import { NGORecentActivity } from "@/features/ngo-dashboard/ngo-recent-activity";
import { RecommendedDonationCard } from "@/features/ngo-dashboard/recommended-donation-card";
import { NGO_PROFILE_ID, NGO_VIEWER, useNgoDashboard } from "@/features/ngo-dashboard/use-ngo-dashboard";
import { PortalShell } from "@/components/layout/portal-shell";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { StatCard } from "@/components/ui/stat-card";
import { VerificationStatus } from "@/lib/constants/domain";
import { useMockAuth } from "@/features/auth/mock-auth";
import { ROUTES } from "@/lib/routes";
import { claimService, toServiceError } from "@/services";

function getInitials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "NG";
}

export function NGODashboard() {
  const { session } = useMockAuth();
  const { state, retry } = useNgoDashboard();
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [claimError, setClaimError] = useState<string>();
  const data = state.data;
  const ngo = data?.profile.ngoProfile;
  const name = session?.displayName || (ngo?.organizationName ?? "Hope Foundation");

  async function claimRecommended() {
    if (!data?.recommendedDonation) return;
    setClaiming(true);
    setClaimError(undefined);
    try {
      await claimService.create(
        { donationId: data.recommendedDonation.id, ngoProfileId: NGO_PROFILE_ID, matchScore: data.recommendedMatchScore },
        NGO_VIEWER
      );
      setClaimed(true);
      window.setTimeout(retry, 700);
    } catch (error: unknown) {
      setClaimError(toServiceError(error).message);
    } finally {
      setClaiming(false);
    }
  }

  return (
    <PortalShell
      role="ngo"
      activeHref={ROUTES.ngo.dashboard}
      title={data ? `আসসালামু আলাইকুম, ${name}` : "NGO Dashboard"}
      description="কাছাকাছি নিরাপদ উদ্বৃত্ত খাবার খুঁজুন, খাদ্য উদ্ধার টিম সমন্বয় করুন এবং সমাজের মানুষের পাশে দাঁড়ান।"
      profileName={name}
      profileDescription={ngo?.verificationStatus === VerificationStatus.VERIFIED ? "ভেরিফাইড চ্যারিটি" : "অনুমোদন প্রক্রিয়াধীন"}
      avatarInitials={getInitials(name)}
      notificationHref={ROUTES.ngo.notifications}
      unreadNotifications={data?.notifications.filter((item) => !item.readAt).length ?? 0}
      actions={
        <ButtonLink href={ROUTES.ngo.newRequest} leftIcon={<Plus className="size-4" />}>
          খাদ্য চাহিদা পোস্ট করুন
        </ButtonLink>
      }
    >
      {state.status === "loading" && !data && <NGODashboardLoading />}
      {state.status === "error" && !data && <NGODashboardError message={state.error.message} onRetry={retry} />}

      {data && ngo && (
        <div className="grid gap-8">
          {/* Executive NGO Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl border border-emerald-900/20 bg-gradient-to-br from-[#02241b] via-[#043325] to-[#011a13] p-6 text-white shadow-xl lg:p-8">
            <div className="absolute inset-0 dark-surface-grid opacity-25 pointer-events-none" />
            <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-900/50 px-3 py-1 text-xs font-bold text-emerald-300 font-heading">
                  <ShieldCheck className="size-3.5 text-emerald-400" />
                  সরকারি নিবন্ধিত চ্যারিটি অংশীদার · ঢাকা মেট্রো
                </div>
                <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl font-heading">
                  {name}
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-emerald-100/80 font-normal max-w-xl">
                  রেজিস্ট্রেশন নম্বর: {ngo.registrationNumber} · সেবা এলাকা: {ngo.serviceAreas.join(", ")}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-emerald-300/80 font-mono">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-emerald-400" /> সক্রিয় বিতরণ জোন (ঢাকা ও পার্শ্ববর্তী এলাকা)
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1.5 text-amber-300">
                    <Sparkles className="size-3.5" /> ধারণক্ষমতা: {ngo.capacityMealsPerDay} মিল/প্রতিদিন
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <Link
                  href={ROUTES.ngo.discover}
                  className="w-full sm:w-auto justify-center inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-3 text-xs font-extrabold text-white shadow-lg shadow-emerald-950/60 hover:from-emerald-400 hover:to-teal-500 transition-all font-heading active:scale-95 text-center"
                >
                  <PackageSearch className="size-4" />
                  <span>উপলব্ধ খাবার ব্রাউজ করুন</span>
                </Link>
                <Link
                  href={ROUTES.ngo.discoverMap}
                  className="w-full sm:w-auto justify-center inline-flex items-center gap-2 rounded-xl border border-emerald-600/40 bg-emerald-950/50 px-4 py-3 text-xs font-bold text-emerald-200 hover:bg-emerald-900/50 transition-colors font-heading active:scale-95 text-center"
                >
                  <Compass className="size-4" />
                  <span>রেসকিউ রেডার ম্যাপ</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Today at a Glance Stats */}
          <section aria-labelledby="ngo-impact-heading">
            <SectionHeader
              title="আজকের সংক্ষিপ্ত চিত্র ও ইমপ্যাক্ট"
              description="আপনার নিকটস্থ খাবার প্রাপ্যতা ও সম্পন্নকৃত খাদ্য বিতরণ রেকর্ড।"
            />
            <span id="ngo-impact-heading" className="sr-only">NGO impact overview</span>
            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="নিকটস্থ উপলব্ধ খাবার" value={String(data.stats.availableNearby)} icon={PackageSearch} helper="১৫ কিমির ভেতরে" />
              <StatCard label="চলমান ক্লেইম" value={String(data.stats.activeClaims)} icon={ClipboardList} tone="info" helper="পিকআপ প্রয়োজন" />
              <StatCard label="বিতরণকৃত মোট মিল" value={data.stats.mealsDistributed.toLocaleString()} icon={HandHeart} tone="accent" helper="নিবন্ধিত রেকর্ড" />
              <StatCard label="উপকৃত মোট মানুষ" value={data.stats.beneficiariesServed.toLocaleString()} icon={UsersRound} tone="success" helper="যাচাইকৃত পরিবার" />
            </div>
          </section>

          {/* Recommended Rescue */}
          <section aria-labelledby="recommended-heading">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <SectionHeader
                title="প্রস্তাবিত জরুরি রেসকিউ"
                description="দূরত্ব, খাদ্যের ধরণ ও সময়ের জরুরি ভিত্তিতে স্মার্ট অ্যালগরিদমে সাজানো।"
              />
              <Badge tone="accent">স্মার্ট রেকমেন্ডেশন</Badge>
            </div>
            <span id="recommended-heading" className="sr-only">Recommended donation</span>
            {data.recommendedDonation ? (
              <RecommendedDonationCard
                donation={data.recommendedDonation}
                matchScore={data.recommendedMatchScore}
                claiming={claiming}
                claimed={claimed}
                error={claimError}
                onClaim={claimRecommended}
              />
            ) : (
              <NoRecommendedDonation />
            )}
          </section>

          {/* Safety Notice */}
          <Alert
            tone="info"
            title="খাদ্য নিরাপত্তা ও পিকআপ উইন্ডো"
            description="রেসকিউ ঘড়ির সময়সীমা দাতার উল্লিখিত এক্সপায়ারি ডেডলাইনের ওপর ভিত্তি করে পরিচালিত। খাবার গ্রহণের পূর্বে ডিক্লারেশন ও তাপমাত্রা যাচাই করে নিন।"
          />

          {/* Active Claims & Quick Actions */}
          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.65fr)]" aria-label="Active NGO claims and quick actions">
            <ActiveClaimOverview items={data.activeClaims} />
            <NGOQuickActions activeClaimId={data.activeClaims[0]?.claim.id} />
          </section>

          {/* Recent Activity */}
          <NGORecentActivity activities={data.activities} />
        </div>
      )}
    </PortalShell>
  );
}
