"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Bike,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  HelpCircle,
  History,
  MapPin,
  Navigation,
  PackageCheck,
  PhoneCall,
  Power,
  QrCode,
  Radio,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Timer,
  TrendingUp,
  Trophy,
  Truck,
  UserCheck,
  Zap,
} from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DhakaRouteHud } from "@/features/volunteer-dashboard/dhaka-route-hud";
import { DispatchRadioTicker } from "@/features/volunteer-dashboard/dispatch-radio-ticker";
import { SosModal } from "@/features/volunteer-dashboard/sos-modal";
import { VolunteerBadges } from "@/features/volunteer-dashboard/volunteer-badges";
import { useVolunteerStore } from "@/features/volunteer-dashboard/volunteer-store";
import type { AvailableDispatch } from "@/features/volunteer-dashboard/volunteer-types";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

type CommandTab = "all" | "active" | "available" | "comms" | "badges";

export function VolunteerDashboard() {
  const {
    dutyStatus,
    activeMission,
    dispatches,
    profile,
    sosDelayAlert,
    toggleDutyStatus,
    acceptDispatch,
    advanceStage,
    verifyOtp,
    broadcastSos,
    dismissSos,
  } = useVolunteerStore();

  const [activeTab, setActiveTab] = useState<CommandTab>("all");
  const [activePin, setActivePin] = useState("");
  const [pinNotice, setPinNotice] = useState<{ success: boolean; message: string } | null>(null);
  const [acceptedNotice, setAcceptedNotice] = useState<string | null>(null);
  const [isSosOpen, setIsSosOpen] = useState(false);

  function handleVerifyPin() {
    if (!activePin.trim()) return;
    const result = verifyOtp(activePin);
    setPinNotice(result);
    if (result.success) {
      setActivePin("");
    }
  }

  function handleAcceptDispatch(id: string) {
    try {
      const mission = acceptDispatch(id);
      setAcceptedNotice(`মিশন বরাদ্দ হয়েছে: ${mission.foodTitle}! এখন লাইভ রুটে প্রবেশ করুন।`);
      setTimeout(() => setAcceptedNotice(null), 4000);
    } catch {
      // ignore
    }
  }

  return (
    <PortalShell
      role="volunteer"
      activeHref={ROUTES.volunteer.dashboard}
      title="স্বেচ্ছাসেবক লাইভ কমান্ড হাব"
      description="ঢাকা মেট্রোর রিয়েল-টাইম খাদ্য উদ্ধার, পরিবহন টেলিমেট্রি, ওয়াকি-টকি ও ওটিপি ভেরিফিকেশন।"
      profileName={profile.fullName}
      profileDescription={`${profile.squadRank} · ${profile.universityAffiliation}`}
      avatarInitials={profile.avatarInitials}
      actions={
        <div className="flex items-center gap-2">
          <ButtonLink
            href={ROUTES.volunteer.history}
            variant="outline"
            leftIcon={<History className="size-4 text-emerald-600" />}
            className="border-line font-bold hover:bg-emerald-50/60"
          >
            মিশন হিস্ট্রি ({profile.completedMissions})
          </ButtonLink>
          <ButtonLink
            href={ROUTES.volunteer.idCard}
            variant="outline"
            leftIcon={<ShieldCheck className="size-4 text-emerald-600" />}
            className="border-line font-bold hover:bg-emerald-50/60 hidden sm:inline-flex"
          >
            ডিজিটাল আইডি
          </ButtonLink>
          <ButtonLink
            href={ROUTES.volunteer.dispatches}
            variant="primary"
            leftIcon={<Navigation className="size-4" />}
            className="font-black shadow-md shadow-emerald-700/20"
          >
            উন্মুক্ত ডিসপ্যাচ ({dispatches.length})
          </ButtonLink>
        </div>
      }
    >
      <div className="space-y-7">
        {/* SOS Delay Banner if Active */}
        {sosDelayAlert && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-500/40 bg-rose-50/90 p-4 text-rose-950 shadow-md">
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-xl bg-rose-600 text-white shrink-0">
                <AlertTriangle className="size-4.5" />
              </span>
              <p className="text-xs font-bold leading-relaxed">{sosDelayAlert}</p>
            </div>
            <button
              type="button"
              onClick={dismissSos}
              className="text-xs font-extrabold uppercase tracking-wider text-rose-700 hover:text-rose-900"
            >
              মুছে ফেলুন
            </button>
          </div>
        )}

        {/* Accepted Notice */}
        {acceptedNotice && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-50 p-4 text-emerald-950 shadow-md animate-in fade-in">
            <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
            <p className="text-sm font-bold">{acceptedNotice}</p>
          </div>
        )}

        {/* Duty Status Ribbon & Hero Banner */}
        <section className="relative overflow-hidden rounded-3xl border border-emerald-900/60 bg-gradient-to-br from-[#02241b] via-[#033629] to-[#011812] p-6 text-white shadow-xl sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 size-80 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-1/4 size-60 rounded-full bg-amber-500/10 blur-2xl" />

          <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-2xl space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={toggleDutyStatus}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-black uppercase tracking-wider transition-all border shadow-sm",
                    dutyStatus === "online"
                      ? "bg-emerald-600/90 border-emerald-400/50 text-white shadow-emerald-700/30"
                      : "bg-slate-800/90 border-slate-600 text-slate-300"
                  )}
                  title="ডিউটি স্ট্যাটাস টগল করুন"
                >
                  <Power className="size-3.5" />
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      dutyStatus === "online" ? "bg-emerald-300 animate-pulse" : "bg-slate-500"
                    )}
                  />
                  <span>{dutyStatus === "online" ? "অন-ডিউটি সক্রিয়" : "অফ-ডিউটি (বিরতি)"}</span>
                </button>

                <span className="rounded-full bg-amber-400/20 px-3 py-0.5 text-xs font-black text-amber-300 border border-amber-400/30">
                  {profile.squadRank}
                </span>

                <span className="rounded-full bg-indigo-500/20 px-3 py-0.5 text-xs font-bold text-indigo-200 border border-indigo-400/20">
                  {profile.bfsaCertificationId}
                </span>
              </div>

              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
                স্বাগতম, {profile.fullName}!
              </h1>

              <p className="text-sm font-medium leading-relaxed text-emerald-100/80 sm:text-base">
                ঢাকা মেট্রো এলাকার খাদ্য অপচয় রোধে এবং অনাহারি মানুষের পাতে গরম পুষ্টিকর খাবার পৌঁছে দিতে আপনি অগ্রণী সিভিক হিরো হিসেবে দায়িত্ব পালন করছেন।
              </p>
            </div>

            {/* Quick Handover PIN Card */}
            <div className="flex shrink-0 flex-col gap-2.5 rounded-2xl border border-emerald-700/40 bg-emerald-950/70 p-4 backdrop-blur-md sm:min-w-[270px]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                  বর্তমান হ্যান্ডওভার সিকিউরিটি কোড
                </span>
                <span className="rounded bg-emerald-400/20 px-1.5 py-0.5 font-mono text-[10px] font-black text-emerald-200">
                  OTP
                </span>
              </div>
              <p className="font-mono text-3xl font-black tracking-widest text-amber-300">
                {activeMission?.pickupOtp ?? "7429"}
              </p>
              <p className="text-[11px] text-emerald-200/70">
                খাবার গ্রহণের পর ডোনার বা এনজিও প্রতিনিধির সাথে শেয়ার করুন
              </p>
              {activeMission && (
                <Link
                  href={ROUTES.volunteer.mission(activeMission.id)}
                  className="mt-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black text-white hover:bg-emerald-700 shadow-md transition-all"
                >
                  <Navigation className="size-3.5" />
                  ফুলস্ক্রিন মিশন ককপিট খুলুন
                </Link>
              )}
            </div>
          </div>

          {/* 4 Scorecard KPI Tiles */}
          <div className="relative z-10 mt-6 grid grid-cols-2 gap-3 border-t border-emerald-800/40 pt-5 sm:grid-cols-4 sm:gap-4">
            <div className="rounded-xl bg-emerald-950/40 p-3.5 border border-emerald-800/30">
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-300/80">
                মোট খাবার উদ্ধার
              </p>
              <p className="mt-1 text-2xl font-black text-white">
                {profile.totalRescuedMeals.toLocaleString()}টি
              </p>
              <span className="text-[10px] text-emerald-400 font-semibold">+১৪৫টি এই সপ্তাহে</span>
            </div>

            <Link
              href={ROUTES.volunteer.history}
              className="rounded-xl bg-emerald-950/40 p-3.5 border border-emerald-800/30 hover:border-emerald-500/60 transition-all block group"
              title="সম্পূর্ণ মিশন হিস্ট্রি লগ দেখুন"
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-300/80">
                  সফল মিশন
                </p>
                <ArrowRight className="size-3 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="mt-1 text-2xl font-black text-white">{profile.completedMissions}টি</p>
              <span className="text-[10px] text-emerald-400 font-semibold">বিস্তারিত হিস্ট্রি দেখুন →</span>
            </Link>

            <div className="rounded-xl bg-emerald-950/40 p-3.5 border border-emerald-800/30">
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-300/80">
                সময়নিষ্ঠ ডেলিভারি
              </p>
              <p className="mt-1 text-2xl font-black text-amber-300">{profile.onTimeRate}%</p>
              <span className="text-[10px] text-emerald-400 font-semibold">গড় সময় &lt; ৩২ মিনিট</span>
            </div>

            <div className="rounded-xl bg-emerald-950/40 p-3.5 border border-emerald-800/30">
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-300/80">
                কমিউনিটি রেটিং
              </p>
              <p className="mt-1 text-2xl font-black text-white">{profile.rating} ★</p>
              <span className="text-[10px] text-amber-300 font-semibold">{profile.reviewsCount}টি পজিটিভ রিভিউ</span>
            </div>
          </div>
        </section>

        {/* Command View Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div className="flex items-center gap-1.5 rounded-2xl bg-canvas p-1.5 border border-line">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={cn(
                "rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all",
                activeTab === "all"
                  ? "bg-emerald-600 text-white shadow-xs font-black"
                  : "text-ink-700 hover:text-ink-900 hover:bg-slate-100"
              )}
            >
              কমান্ড সেন্টার (সব)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("active")}
              className={cn(
                "rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all",
                activeTab === "active"
                  ? "bg-emerald-600 text-white shadow-xs font-black"
                  : "text-ink-700 hover:text-ink-900 hover:bg-slate-100"
              )}
            >
              লাইভ রুট ও জিপিএস
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("available")}
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all",
                activeTab === "available"
                  ? "bg-emerald-600 text-white shadow-xs font-black"
                  : "text-ink-700 hover:text-ink-900 hover:bg-slate-100"
              )}
            >
              <span>উন্মুক্ত ডিসপ্যাচ</span>
              <span className="rounded-full bg-amber-400 px-1.5 py-0.2 text-[10px] font-black text-ink-950">
                {dispatches.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("comms")}
              className={cn(
                "rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all",
                activeTab === "comms"
                  ? "bg-emerald-600 text-white shadow-xs font-black"
                  : "text-ink-700 hover:text-ink-900 hover:bg-slate-100"
              )}
            >
              ওয়াকি-টকি ও রেডিও
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("badges")}
              className={cn(
                "rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all",
                activeTab === "badges"
                  ? "bg-emerald-600 text-white shadow-xs font-black"
                  : "text-ink-700 hover:text-ink-900 hover:bg-slate-100"
              )}
            >
              অর্জিত ব্যাজ ও স্কোয়াড
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
              <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
              ঢাকা মেট্রো রেসকিউ নেটওয়ার্ক সক্রিয়
            </span>
          </div>
        </div>

        {/* Section 1: Active Mission Telemetry */}
        {(activeTab === "all" || activeTab === "active") && (
          <section id="active-mission" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex size-3 rounded-full bg-emerald-500 animate-ping" />
                <h2 className="text-xl font-black text-ink-900 sm:text-2xl">
                  লাইভ রেসকিউ মিশন ও জিপিএস ট্র্যাকিং
                </h2>
              </div>
              {activeMission && (
                <ButtonLink
                  href={ROUTES.volunteer.mission(activeMission.id)}
                  variant="primary"
                  leftIcon={<Navigation className="size-4" />}
                  className="font-bold shadow-md shadow-emerald-700/20"
                >
                  ফুলস্ক্রিন মিশন ককপিট 🛵
                </ButtonLink>
              )}
            </div>

            {/* Dhaka Route HUD Component */}
            {activeMission ? (
              <>
                <DhakaRouteHud
                  currentStage={activeMission.currentStage}
                  onAdvanceStage={(st) => advanceStage(st)}
                  onOpenSos={() => setIsSosOpen(true)}
                />

                {/* Mission Details & Verification Card */}
                <Card className="overflow-hidden border-2 border-emerald-500/30 shadow-md">
                  <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-12 lg:gap-8">
                    {/* Mission Details */}
                    <div className="space-y-5 lg:col-span-7">
                      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col items-center gap-1 pt-1">
                            <div className="size-3 rounded-full bg-emerald-600" />
                            <div className="h-10 w-0.5 border-l-2 border-dashed border-slate-300" />
                            <div className="size-3 rounded-full bg-amber-500" />
                          </div>

                          <div className="flex-1 space-y-4 text-xs sm:text-sm">
                            <div>
                              <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
                                  পিকআপ লোকেশন
                                </p>
                                <span className="text-[11px] font-bold text-ink-600">
                                  {activeMission.distanceKm} কিমি পথ
                                </span>
                              </div>
                              <p className="text-sm font-bold text-ink-900 sm:text-base">
                                {activeMission.donorName}
                              </p>
                              <p className="text-xs text-muted-600">{activeMission.donorAddress}</p>
                            </div>

                            <div>
                              <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black uppercase tracking-wider text-amber-700">
                                  গন্তব্য / হ্যান্ডওভার এনজিও
                                </p>
                                <span className="text-[11px] font-bold text-amber-600">
                                  আনুমানিক {activeMission.estimatedTimeMins} মিনিট
                                </span>
                              </div>
                              <p className="text-sm font-bold text-ink-900 sm:text-base">
                                {activeMission.ngoName}
                              </p>
                              <p className="text-xs text-muted-600">{activeMission.ngoAddress}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Food Details & Image */}
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl border border-line shadow-xs">
                          <Image
                            src="/images/surplus-food-containers.jpg"
                            alt="Surplus Food Rescue"
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                        </div>
                        <div className="space-y-1">
                          <Badge tone="warning">{activeMission.foodTitle}</Badge>
                          <p className="text-base font-black text-ink-900">
                            {activeMission.quantity} (~{activeMission.servings} জনের খাবার)
                          </p>
                          <p className="text-xs text-muted-600">
                            নিরাপদ সময়সীমা: <strong>{activeMission.safeDeadline}</strong> · {activeMission.storageCondition}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Step Handover Verification Box */}
                    <div className="flex flex-col justify-between rounded-2xl border border-line bg-canvas p-5 lg:col-span-5">
                      <div>
                        <div className="flex items-center gap-2">
                          <QrCode className="size-5 text-emerald-600" />
                          <h3 className="text-sm font-black text-ink-900">
                            হ্যান্ডওভার ওটিপি যাচাইকরণ
                          </h3>
                        </div>
                        <p className="mt-1.5 text-xs text-muted-600">
                          {activeMission.currentStage === "at_pickup" || activeMission.currentStage === "en_route_pickup"
                            ? "ডোনারের কাছ থেকে ৪-সংখ্যার ওটিপি কোডটি গ্রহণ করে এখানে প্রবেশ করান:"
                            : "এনজিও প্রতিনিধির টার্মিনালের সাথে ৪-সংখ্যার পিন মিলিয়ে বিতরণ নিশ্চিত করুন:"}
                        </p>

                        <div className="mt-4 space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              maxLength={6}
                              placeholder="ওটিপি পিন (যেমন: 7429)"
                              value={activePin}
                              onChange={(e) => setActivePin(e.target.value)}
                              className="h-11 flex-1 rounded-xl border border-line bg-white px-3 font-mono text-center text-lg font-black tracking-widest text-ink-900 focus:border-emerald-600 focus:outline-hidden"
                            />
                            <Button
                              type="button"
                              onClick={handleVerifyPin}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4"
                            >
                              যাচাই
                            </Button>
                          </div>

                          {pinNotice && (
                            <p
                              className={cn(
                                "text-xs font-bold",
                                pinNotice.success ? "text-emerald-700" : "text-rose-600"
                              )}
                            >
                              {pinNotice.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 flex flex-col gap-2 pt-4 border-t border-line">
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          leftIcon={<AlertTriangle className="size-4" />}
                          onClick={() => setIsSosOpen(true)}
                          className="w-full justify-center font-bold"
                        >
                          🚨 ট্রাফিক বা অনাকাঙ্ক্ষিত বিলম্ব SOS রিপোর্ট
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </>
            ) : (
              <Card className="p-8 text-center border-line">
                <Bike className="size-12 text-emerald-600 mx-auto" />
                <h3 className="mt-3 text-lg font-black text-ink-900">বর্তমানে কোনো সক্রিয় মিশন নেই</h3>
                <p className="mt-1 text-xs text-muted-600 max-w-sm mx-auto">
                  নিচের উন্মুক্ত ডিসপ্যাচ তালিকা হতে একটি রেসকিউ গ্রহণ করুন এবং মানুষের মুখে খাবার পৌঁছে দিন।
                </p>
              </Card>
            )}
          </section>
        )}

        {/* Section 2: Incoming Available Dispatches */}
        {(activeTab === "all" || activeTab === "available") && (
          <section id="available-dispatches" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-ink-900 sm:text-2xl">
                  উন্মুক্ত ডিসপ্যাচ ফিড (Incoming Rescue Feed)
                </h2>
                <p className="text-xs text-muted-600">
                  নিকটস্থ রেস্তোরাঁ ও ক্যাফেটেরিয়া হতে আসা তাজা অতিরিক্ত খাবারের অ্যালার্ট
                </p>
              </div>
              <ButtonLink
                href={ROUTES.volunteer.dispatches}
                variant="outline"
                size="sm"
                className="font-bold border-line hover:bg-emerald-50/50"
              >
                সব ডিসপ্যাচ পেজ খুলুন →
              </ButtonLink>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {dispatches.map((dispatch: AvailableDispatch) => (
                <Card
                  key={dispatch.id}
                  className="flex flex-col justify-between border-line p-5 shadow-sm hover:border-emerald-500/40 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-black text-rose-700 border border-rose-200">
                        ⏳ বাকি {dispatch.expiresInMins} মিনিট
                      </span>
                      <span className="text-xs font-bold text-muted-600">
                        📍 {dispatch.distanceKm} কিমি দূরত্ব
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                        {dispatch.donorName}
                      </p>
                      <h3 className="mt-1 text-base font-black text-ink-900">{dispatch.foodType}</h3>
                      <p className="mt-0.5 text-xs text-muted-600">{dispatch.quantity}</p>
                    </div>

                    <div className="rounded-xl bg-canvas p-3 text-xs leading-relaxed space-y-1 border border-line">
                      <p>
                        <strong className="text-ink-800">পিকআপ:</strong> {dispatch.donorArea}
                      </p>
                      <p>
                        <strong className="text-ink-800">গন্তব্য:</strong> {dispatch.ngoName} (
                        {dispatch.ngoArea})
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-line flex items-center justify-between gap-2">
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      leftIcon={<Navigation className="size-4" />}
                      onClick={() => handleAcceptDispatch(dispatch.id)}
                      className="w-full justify-center font-bold shadow-md shadow-emerald-700/20"
                    >
                      মিশন গ্রহণ করুন (Accept Mission 🛵)
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Section 3: Walkie-Talkie Radio Feed */}
        {(activeTab === "all" || activeTab === "comms") && (
          <section id="comms" className="space-y-4">
            <h2 className="text-xl font-black text-ink-900 sm:text-2xl">
              লাইভ রেসকিউ ওয়াকি-টকি ও রেডিও ফিড
            </h2>
            <DispatchRadioTicker />
          </section>
        )}

        {/* Section 4: Badges & Leaderboard */}
        {(activeTab === "all" || activeTab === "badges") && (
          <section id="badges" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-ink-900 sm:text-2xl">
                  অর্জিত সিভিক ব্যাজ ও স্কোয়াড র‍্যাঙ্ক
                </h2>
                <p className="text-xs text-muted-600">
                  আপনার অর্জিত স্বীকৃতিসমূহ বিশ্ববিদ্যালয় ক্রেডিট ও ক্যারিয়ারে ব্যবহারযোগ্য
                </p>
              </div>
              <ButtonLink
                href={ROUTES.volunteer.idCard}
                variant="outline"
                size="sm"
                leftIcon={<ShieldCheck className="size-4" />}
                className="font-bold border-line"
              >
                ডিজিটাল আইডি ও সার্টিফিকেট প্রিন্ট
              </ButtonLink>
            </div>
            <VolunteerBadges />
          </section>
        )}

        {/* SOS Modal */}
        <SosModal
          isOpen={isSosOpen}
          onClose={() => setIsSosOpen(false)}
          onSubmitReport={(reason, delayMins) => {
            broadcastSos(reason, delayMins);
            setIsSosOpen(false);
          }}
        />
      </div>
    </PortalShell>
  );
}
