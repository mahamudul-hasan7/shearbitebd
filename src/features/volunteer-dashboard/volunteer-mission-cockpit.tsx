"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Bike,
  Building2,
  Camera,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  Fuel,
  Gauge,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  QrCode,
  Radio,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Thermometer,
  Timer,
  Truck,
  Zap,
} from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SosModal } from "@/features/volunteer-dashboard/sos-modal";
import { useVolunteerStore } from "@/features/volunteer-dashboard/volunteer-store";
import type { MissionStage } from "@/features/volunteer-dashboard/volunteer-types";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

const STAGES: { key: MissionStage; titleBn: string; subtitleBn: string }[] = [
  { key: "assigned", titleBn: "মিশন বরাদ্দ", subtitleBn: "১০:১৫ PM" },
  { key: "en_route_pickup", titleBn: "পিকআপের পথে", subtitleBn: "১০:২২ PM" },
  { key: "at_pickup", titleBn: "ক্যাফেটেরিয়ায় উপস্থিত", subtitleBn: "১০:৩৫ PM" },
  { key: "cargo_loaded", titleBn: "খাবার সিল ও লোড", subtitleBn: "১০:৪২ PM" },
  { key: "en_route_dropoff", titleBn: "শেল্টারের পথে", subtitleBn: "১০:৪৮ PM" },
  { key: "completed", titleBn: "হস্তান্তর সম্পন্ন", subtitleBn: "১১:০৫ PM" },
];

export function VolunteerMissionCockpit({ missionId }: { missionId: string }) {
  const { activeMission, profile, advanceStage, verifyOtp, broadcastSos } = useVolunteerStore();
  const [pin, setPin] = useState("");
  const [pinResult, setPinResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [safetyChecks, setSafetyChecks] = useState({
    sealIntact: true,
    tempVerified: true,
    spillProtected: true,
  });

  const mission = activeMission;
  const currentStageIndex = mission
    ? STAGES.findIndex((s) => s.key === mission.currentStage)
    : 0;

  function handleNumClick(digit: string) {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(12);
      } catch {}
    }
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setPinResult(null);
      // Auto-trigger verification as soon as 4th digit is keyed in!
      if (nextPin.length === 4) {
        setTimeout(() => {
          const res = verifyOtp(nextPin);
          setPinResult(res);
          if (res.success) {
            setPin("");
          }
        }, 150);
      }
    }
  }

  function handleQuickFillOtp(targetOtp: string) {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(20);
      } catch {}
    }
    setPin(targetOtp);
    setTimeout(() => {
      const res = verifyOtp(targetOtp);
      setPinResult(res);
      if (res.success) {
        setPin("");
      }
    }, 150);
  }

  function handleBackspace() {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(8);
      } catch {}
    }
    setPin((prev) => prev.slice(0, -1));
    setPinResult(null);
  }

  function handleVerifySubmit() {
    if (pin.length !== 4) {
      setPinResult({ success: false, message: "অনুগ্রহ করে পূর্ণাঙ্গ ৪-ডিজিটের পিন প্রবেশ করান।" });
      return;
    }
    const res = verifyOtp(pin);
    setPinResult(res);
    if (res.success) {
      setPin("");
    }
  }

  function simulateQrScan() {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      const targetPin =
        mission?.currentStage === "at_pickup" || mission?.currentStage === "en_route_pickup"
          ? mission?.pickupOtp ?? "7429"
          : mission?.dropoffOtp ?? "9814";
      const res = verifyOtp(targetPin);
      setPinResult(res);
    }, 1200);
  }

  if (!mission) {
    return (
      <PortalShell
        role="volunteer"
        activeHref={ROUTES.volunteer.mission(missionId)}
        title="মিশন ককপিট"
        profileName={profile.fullName}
        profileDescription={profile.squadRank}
        avatarInitials={profile.avatarInitials}
      >
        <Card className="p-12 text-center border-line">
          <Bike className="size-12 text-emerald-600 mx-auto" />
          <h2 className="mt-4 text-xl font-black text-ink-900">কোনো সক্রিয় মিশন পাওয়া যায়নি</h2>
          <p className="mt-2 text-xs text-muted-600">
            ডিসপ্যাচ ফিড হতে একটি মিশন গ্রহণ করুন।
          </p>
          <ButtonLink href={ROUTES.volunteer.dispatches} variant="primary" className="mt-5 font-bold">
            উন্মুক্ত ডিসপ্যাচ ফিড দেখুন →
          </ButtonLink>
        </Card>
      </PortalShell>
    );
  }

  const isCompleted = mission.currentStage === "completed";

  return (
    <PortalShell
      role="volunteer"
      activeHref={ROUTES.volunteer.mission(missionId)}
      title="ট্যাকটিক্যাল রেসকিউ ককপিট 🛵"
      description="টার্ন-বাই-টার্ন ঢাকা মেট্রো রুট, টেলিমেট্রি এবং কিউআর/ওটিপি ডিজিটাল হ্যান্ডওভার।"
      profileName={profile.fullName}
      profileDescription={`${profile.squadRank} · ${profile.universityAffiliation}`}
      avatarInitials={profile.avatarInitials}
      backHref={ROUTES.volunteer.dashboard}
      backLabel="কমান্ড হাবে ফিরুন"
    >
      <div className="space-y-6">
        {/* Top Mission Telemetry Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-emerald-900/50 bg-gradient-to-r from-[#021f17] via-[#022e23] to-[#01140e] p-5 text-white shadow-xl">
          <div className="flex items-center gap-3">
            <span className="relative flex size-3">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-3 rounded-full bg-emerald-500" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
                  মিশন আইডি: {mission.id}
                </span>
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-300 border border-emerald-400/30">
                  {isCompleted ? "COMPLETED" : "EN ROUTE"}
                </span>
              </div>
              <h1 className="mt-1 text-lg font-black text-white sm:text-xl">
                {mission.foodTitle}
              </h1>
            </div>
          </div>

          {/* Real-time telemetry indicators */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5 border border-white/15 backdrop-blur-sm">
              <Activity className="size-4 text-emerald-400 animate-pulse" />
              <span>গতি:</span>
              <strong className="text-white">{mission.riderSpeed} km/h</strong>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5 border border-white/15 backdrop-blur-sm">
              <Thermometer className="size-4 text-amber-400" />
              <span>কার্গো:</span>
              <strong className="text-amber-300">{mission.cargoTemp}°C (হট)</strong>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5 border border-white/15 backdrop-blur-sm">
              <Clock className="size-4 text-sky-400" />
              <span>ইটিএ:</span>
              <strong className="text-white">~{mission.estimatedTimeMins} মিনিট</strong>
            </div>
          </div>
        </div>

        {/* Checkpoints Stepper */}
        <Card className="p-5 sm:p-6 border-line shadow-sm">
          <p className="text-xs font-black uppercase tracking-wider text-emerald-700 mb-3">
            লাইভ রেসকিউ অগ্রগতি চেকলিস্ট
          </p>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {STAGES.map((st, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              return (
                <button
                  key={st.key}
                  type="button"
                  onClick={() => advanceStage(st.key)}
                  className={cn(
                    "flex flex-col rounded-2xl border p-3 text-left transition-all",
                    isCurrent
                      ? "border-emerald-500 bg-emerald-50 shadow-sm ring-2 ring-emerald-500/20"
                      : isPast
                      ? "border-emerald-200 bg-emerald-50/50 text-emerald-900"
                      : "border-line bg-canvas/60 text-muted-500 hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "grid size-6 place-items-center rounded-xl text-[11px] font-black",
                        isCurrent
                          ? "bg-emerald-600 text-white"
                          : isPast
                          ? "bg-emerald-600 text-white"
                          : "bg-white text-muted-600 ring-1 ring-line"
                      )}
                    >
                      {isPast ? <CheckCircle2 className="size-3.5" /> : idx + 1}
                    </span>
                    <span className="text-[10px] font-mono text-muted-500">{st.subtitleBn}</span>
                  </div>
                  <p className="mt-2 text-xs font-black truncate text-ink-900">{st.titleBn}</p>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Main Grid: Live Radar Route & Quick Comm (Left) + Doorstep Verification (Right) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left: Route Radar & Contact details */}
          <div className="space-y-6 lg:col-span-7">
            {/* Radar Visual HUD */}
            <Card className="overflow-hidden border-line shadow-sm">
              <div className="border-b border-line bg-gradient-to-r from-emerald-950 to-[#02241b] p-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Navigation className="size-4 text-emerald-400 rotate-45" />
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
                    টার্ন-বাই-টার্ন ঢাকা মেট্রো করিডোর
                  </span>
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&origin=23.7976,90.4496&destination=23.7516,90.3776`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 rounded-xl bg-white/10 px-3 py-1 text-xs font-bold text-white hover:bg-white/20 transition-all border border-white/20"
                >
                  <span>গুগল ম্যাপসে খুলুন</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>

              {/* Graphic Route Map Visual */}
              <div className="relative min-h-[22rem] bg-gradient-to-b from-[#021d16] via-[#022920] to-[#01140e] p-6 text-white overflow-hidden">
                <div
                  className="absolute inset-0 opacity-15"
                  style={{
                    backgroundImage: `radial-gradient(circle at 50% 50%, #10b981 1px, transparent 1px)`,
                    backgroundSize: `30px 30px`,
                  }}
                />

                {/* Checkpoint 1 */}
                <div className="relative z-10 flex items-start gap-4">
                  <div className="grid size-10 place-items-center rounded-2xl bg-emerald-600 text-white shadow-lg shrink-0">
                    <MapPin className="size-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                      পিকআপ পয়েন্ট (Donor)
                    </span>
                    <p className="text-base font-black text-white">{mission.donorName}</p>
                    <p className="text-xs text-emerald-100/70">{mission.donorAddress}</p>
                  </div>
                </div>

                {/* Dotted Expressway line with rider icon */}
                <div className="relative my-6 ml-5 pl-8 border-l-2 border-dashed border-emerald-500/50 space-y-3">
                  <div className="flex items-center gap-3 bg-emerald-950/80 p-3 rounded-xl border border-emerald-800/60 max-w-sm">
                    <Bike className="size-5 text-amber-400 animate-bounce" />
                    <div>
                      <p className="text-xs font-black text-amber-300">
                        {mission.routeStops.expressway}
                      </p>
                      <p className="text-[11px] text-emerald-200/70">
                        লাইভ স্পিড: {mission.riderSpeed} কিমি/ঘণ্টা · দূরত্ব: {mission.distanceKm} কিমি
                      </p>
                    </div>
                  </div>
                </div>

                {/* Checkpoint 2 */}
                <div className="relative z-10 flex items-start gap-4">
                  <div className="grid size-10 place-items-center rounded-2xl bg-amber-500 text-brand-950 shadow-lg shrink-0">
                    <Building2 className="size-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                      গন্তব্য আশ্রয়কেন্দ্র (NGO)
                    </span>
                    <p className="text-base font-black text-white">{mission.ngoName}</p>
                    <p className="text-xs text-amber-100/70">{mission.ngoAddress}</p>
                  </div>
                </div>
              </div>

              {/* Fast Communication Bar */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-canvas border-t border-line sm:grid-cols-3">
                <a
                  href={`tel:${mission.donorPhone}`}
                  className="flex items-center justify-center gap-2 rounded-xl bg-white border border-line p-2.5 text-xs font-bold text-ink-900 hover:bg-slate-50 transition-all shadow-xs"
                >
                  <Phone className="size-3.5 text-emerald-600" />
                  <span>কল: {mission.donorContact.split(" ")[0]}</span>
                </a>

                <a
                  href={`sms:${mission.donorPhone}`}
                  className="flex items-center justify-center gap-2 rounded-xl bg-white border border-line p-2.5 text-xs font-bold text-ink-900 hover:bg-slate-50 transition-all shadow-xs"
                >
                  <MessageCircle className="size-3.5 text-emerald-600" />
                  <span>এসএমএস পাঠান</span>
                </a>

                <a
                  href={`tel:${mission.ngoPhone}`}
                  className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 rounded-xl bg-white border border-line p-2.5 text-xs font-bold text-ink-900 hover:bg-slate-50 transition-all shadow-xs"
                >
                  <Phone className="size-3.5 text-amber-600" />
                  <span>এনজিও ফোকাল কল</span>
                </a>
              </div>
            </Card>

            {/* Food Safety & Hygiene Checklist */}
            <Card className="p-5 border-line shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-emerald-600" />
                <h3 className="text-sm font-black text-ink-900">
                  বিএফএসএ (BFSA) ফুড সেফটি ইন্সপেকশন চেকলিস্ট
                </h3>
              </div>

              <div className="grid gap-2 text-xs">
                <label className="flex items-center gap-3 p-2.5 rounded-xl border border-line bg-canvas/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={safetyChecks.sealIntact}
                    onChange={(e) =>
                      setSafetyChecks((prev) => ({ ...prev, sealIntact: e.target.checked }))
                    }
                    className="size-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>খাবারের ফয়েল কন্টেইনার সিল অক্ষত ও কোনো লিকেজ নেই।</span>
                </label>

                <label className="flex items-center gap-3 p-2.5 rounded-xl border border-line bg-canvas/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={safetyChecks.tempVerified}
                    onChange={(e) =>
                      setSafetyChecks((prev) => ({ ...prev, tempVerified: e.target.checked }))
                    }
                    className="size-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>থার্মাল ইনসুলেটেড ব্যাগের তাপমাত্রা ৬০°সে বা তার বেশি বজায় আছে।</span>
                </label>

                <label className="flex items-center gap-3 p-2.5 rounded-xl border border-line bg-canvas/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={safetyChecks.spillProtected}
                    onChange={(e) =>
                      setSafetyChecks((prev) => ({ ...prev, spillProtected: e.target.checked }))
                    }
                    className="size-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>বাইকের কার্গো ক্যারিয়ারে খাবার উল্টে যাওয়া থেকে সুরক্ষিত।</span>
                </label>
              </div>
            </Card>
          </div>

          {/* Right: Doorstep Verification Station (QR Scanner & OTP Numpad) */}
          <div className="space-y-6 lg:col-span-5">
            {isCompleted ? (
              <Card className="p-8 text-center border-2 border-emerald-500 bg-gradient-to-b from-emerald-50 to-white shadow-xl space-y-4">
                <div className="grid size-16 place-items-center rounded-3xl bg-emerald-600 text-white mx-auto shadow-lg shadow-emerald-700/30">
                  <CheckCircle2 className="size-8" />
                </div>
                <h2 className="text-2xl font-black text-ink-900">মিশন সফলভাবে সম্পন্ন!</h2>
                <p className="text-xs text-muted-600 leading-relaxed max-w-xs mx-auto">
                  অভিনন্দন {profile.fullName}! আপনি {mission.servings} জন এতিম ও দুস্থ মানুষের মুখে গরম পুষ্টিকর আহার তুলে দিয়েছেন।
                </p>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-100/60 p-3 text-xs font-bold text-emerald-950">
                  🎉 আপনার স্কোয়াড স্কোরে +{mission.servings} পয়েন্ট যুক্ত হয়েছে!
                </div>
                <ButtonLink
                  href={ROUTES.volunteer.dashboard}
                  variant="primary"
                  className="w-full justify-center font-black py-3 shadow-md"
                >
                  কমান্ড হাবে ফিরে যান 🏠
                </ButtonLink>
              </Card>
            ) : (
              <Card className="overflow-hidden border-2 border-emerald-500/40 shadow-xl">
                {/* Station Header */}
                <div className="border-b border-line bg-gradient-to-r from-emerald-50 to-teal-50 p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="grid size-9 place-items-center rounded-xl bg-emerald-600 text-white">
                        <QrCode className="size-5" />
                      </span>
                      <div>
                        <h3 className="text-sm font-black text-ink-900">
                          {mission.currentStage === "at_pickup" || mission.currentStage === "en_route_pickup"
                            ? "ডোনার হ্যান্ডওভার স্টেশন"
                            : "এনজিও বিতরণ হ্যান্ডওভার"}
                        </h3>
                        <p className="text-[11px] text-muted-600">
                          {mission.currentStage === "at_pickup" || mission.currentStage === "en_route_pickup"
                            ? "ডোনারের কাছ থেকে ওটিপি বা কিউআর কোড নিন"
                            : "এনজিও প্রতিনিধির টার্মিনালের ওটিপি যাচাই করুন"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  {/* Camera Scanner Simulation */}
                  <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-emerald-500/40 bg-slate-950 p-6 text-center text-white">
                    {isScanning && (
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />
                    )}

                    <div className="relative mx-auto size-28 border-2 border-emerald-400/60 rounded-xl grid place-items-center">
                      <Camera className="size-8 text-emerald-400" />
                      <div className="absolute top-0 left-0 size-3 border-t-2 border-l-2 border-emerald-400" />
                      <div className="absolute top-0 right-0 size-3 border-t-2 border-r-2 border-emerald-400" />
                      <div className="absolute bottom-0 left-0 size-3 border-b-2 border-l-2 border-emerald-400" />
                      <div className="absolute bottom-0 right-0 size-3 border-b-2 border-r-2 border-emerald-400" />
                    </div>

                    <p className="mt-3 text-xs font-bold text-emerald-300">
                      {isScanning ? "স্ক্যান হচ্ছে..." : "ডোনারের কিউআর কোড স্ক্যান করুন"}
                    </p>

                    <Button
                      type="button"
                      size="sm"
                      onClick={simulateQrScan}
                      disabled={isScanning}
                      className="mt-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                    >
                      {isScanning ? "যাচাই হচ্ছে..." : "📷 ক্যামেরা স্ক্যান সিমুলেট"}
                    </Button>
                  </div>

                  {/* 4-Digit OTP Pad */}
                  <div className="space-y-3">
                    <p className="text-center text-xs font-bold text-ink-800">
                      অথবা সরাসরি ৪-সংখ্যার ওটিপি পিন দিন:
                    </p>

                    {/* Display box */}
                    <div className="flex justify-center gap-3">
                      {[0, 1, 2, 3].map((idx) => {
                        const digit = pin[idx];
                        return (
                          <div
                            key={idx}
                            className={cn(
                              "grid size-14 place-items-center rounded-2xl border-2 text-2xl font-mono font-black transition-all select-none shadow-xs",
                              digit
                                ? "border-emerald-600 bg-emerald-50 text-emerald-950 scale-105 shadow-emerald-600/10"
                                : "border-line bg-canvas text-muted-400"
                            )}
                          >
                            {digit ?? "•"}
                          </div>
                        );
                      })}
                    </div>

                    {pinResult && (
                      <p
                        className={cn(
                          "text-center text-xs font-bold animate-in fade-in zoom-in-95",
                          pinResult.success ? "text-emerald-700" : "text-rose-600"
                        )}
                      >
                        {pinResult.message}
                      </p>
                    )}

                    {/* Numpad with Mobile Ergonomics */}
                    <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto pt-2">
                      {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleNumClick(num)}
                          className="h-14 rounded-2xl bg-white hover:bg-slate-100 active:bg-emerald-50 text-xl font-mono font-black text-ink-900 border border-line shadow-xs active:scale-95 transition-all select-none touch-manipulation"
                        >
                          {num}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={handleBackspace}
                        className="h-14 rounded-2xl bg-canvas hover:bg-slate-200 active:bg-rose-50 text-xs font-bold text-muted-700 border border-line shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1 select-none touch-manipulation"
                        aria-label="মুছুন"
                      >
                        <span className="text-base font-mono">⌫</span>
                        <span>মুছুন</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNumClick("0")}
                        className="h-14 rounded-2xl bg-white hover:bg-slate-100 active:bg-emerald-50 text-xl font-mono font-black text-ink-900 border border-line shadow-xs active:scale-95 transition-all select-none touch-manipulation"
                      >
                        0
                      </button>
                      <button
                        type="button"
                        onClick={handleVerifySubmit}
                        className="h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-xs font-black text-white shadow-md shadow-emerald-700/20 active:scale-95 transition-all select-none touch-manipulation"
                      >
                        যাচাই ✓
                      </button>
                    </div>

                    {/* Quick Test Fill Shortcuts for 1-Tap Mobile Testing */}
                    <div className="pt-2 text-center space-y-1.5">
                      <p className="text-[11px] font-semibold text-muted-500">
                        ল্যাব ডিফেন্স বা টেস্ট করতে এক ট্যাপে ওটিপি দিন:
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleQuickFillOtp("7429")}
                          className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 border border-emerald-200 hover:bg-emerald-100 active:scale-95 transition-all"
                        >
                          <Zap className="size-3 text-emerald-600" />
                          <span>⚡ 7429 (পিকআপ)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickFillOtp("9814")}
                          className="inline-flex items-center gap-1 rounded-xl bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800 border border-teal-200 hover:bg-teal-100 active:scale-95 transition-all"
                        >
                          <Zap className="size-3 text-teal-600" />
                          <span>⚡ 9814 (বিতরণ)</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* SOS Trigger */}
                  <div className="pt-3 border-t border-line">
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      leftIcon={<AlertTriangle className="size-4" />}
                      onClick={() => setIsSosOpen(true)}
                      className="w-full justify-center font-bold"
                    >
                      🚨 জরুরি ট্রাফিক বা দুর্ঘটনা SOS অ্যালার্ট
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

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
