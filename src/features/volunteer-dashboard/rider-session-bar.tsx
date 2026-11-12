"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Battery,
  Bike,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  Flame,
  Fuel,
  KeyRound,
  MapPin,
  Navigation,
  Phone,
  Power,
  Radio,
  ShieldAlert,
  ShieldCheck,
  Thermometer,
  Zap,
} from "lucide-react";
import { SosModal } from "@/features/volunteer-dashboard/sos-modal";
import { useVolunteerStore } from "@/features/volunteer-dashboard/volunteer-store";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

function formatSeconds(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");
  const toBn = (str: string) =>
    str.replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[parseInt(d, 10)]);

  return toBn(`${pad(hrs)}:${pad(mins)}:${pad(secs)}`);
}

export function RiderSessionBar() {
  const {
    dutyStatus,
    sessionStartTime,
    activeMission,
    telemetry,
    toggleDutyStatus,
    verifyOtp,
    broadcastSos,
  } = useVolunteerStore();

  const [elapsed, setElapsed] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [quickPin, setQuickPin] = useState("");
  const [pinNotice, setPinNotice] = useState<{ success: boolean; message: string } | null>(null);

  // Live timer tick every second when online
  useEffect(() => {
    if (dutyStatus !== "online") {
      setElapsed(0);
      return;
    }

    const start = sessionStartTime || Date.now();
    const updateElapsed = () => {
      const diff = Math.max(0, Math.floor((Date.now() - start) / 1000));
      setElapsed(diff);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [dutyStatus, sessionStartTime]);

  function triggerHaptic(type: "light" | "medium" | "heavy" = "light") {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        if (type === "heavy") navigator.vibrate([30, 50, 30]);
        else if (type === "medium") navigator.vibrate(25);
        else navigator.vibrate(12);
      } catch {
        // ignore
      }
    }
  }

  function handleVerifyQuickOtp() {
    if (!quickPin.trim()) return;
    triggerHaptic("medium");
    const result = verifyOtp(quickPin);
    setPinNotice(result);
    if (result.success) {
      setQuickPin("");
      setTimeout(() => setPinNotice(null), 4000);
    }
  }

  const stageBadge = useMemo(() => {
    if (!activeMission) return null;
    switch (activeMission.currentStage) {
      case "assigned":
        return { label: "মিশন বরাদ্দকৃত", color: "bg-sky-500/20 text-sky-300 border-sky-400/30" };
      case "en_route_pickup":
        return { label: "পিকআপের পথে ➔", color: "bg-amber-500/20 text-amber-300 border-amber-400/30" };
      case "at_pickup":
        return { label: "ক্যাফেটেরিয়ায় উপস্থিত", color: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30" };
      case "cargo_loaded":
        return { label: "খাবার সিল ও লোড", color: "bg-teal-500/20 text-teal-300 border-teal-400/30" };
      case "en_route_dropoff":
        return { label: "শেল্টারের পথে ➔", color: "bg-amber-500/20 text-amber-300 border-amber-400/30" };
      case "completed":
        return { label: "হস্তান্তর সম্পন্ন 🎉", color: "bg-purple-500/20 text-purple-300 border-purple-400/30" };
    }
  }, [activeMission]);

  const nextStop = useMemo(() => {
    if (!activeMission) return null;
    const isPickupPhase =
      activeMission.currentStage === "assigned" ||
      activeMission.currentStage === "en_route_pickup" ||
      activeMission.currentStage === "at_pickup";
    return {
      type: isPickupPhase ? "পিকআপ পয়েন্ট" : "ড্রপ-অফ শেল্টার",
      name: isPickupPhase ? activeMission.donorName : activeMission.ngoName,
      address: isPickupPhase ? activeMission.donorAddress : activeMission.ngoAddress,
      phone: isPickupPhase ? activeMission.donorPhone : activeMission.ngoPhone,
      contact: isPickupPhase ? activeMission.donorContact : activeMission.ngoContact,
      otp: isPickupPhase ? activeMission.pickupOtp : activeMission.dropoffOtp,
    };
  }, [activeMission]);

  return (
    <>
      {/* ========================================================= */}
      {/* DESKTOP VIEW: Sleek Floating Cyber Telemetry Bar (lg:flex) */}
      {/* ========================================================= */}
      <aside
        aria-label="রাইডার লাইভ সেশন ডক"
        className="hidden lg:flex fixed bottom-5 right-6 z-40 max-w-4xl select-none animate-in slide-in-from-bottom-3 duration-300"
      >
        <div className="flex items-center gap-3.5 rounded-2xl border border-emerald-500/30 bg-[#021b14]/95 px-4 py-2.5 text-white shadow-2xl backdrop-blur-xl ring-1 ring-emerald-500/20">
          {/* Duty Switch & Live Status Beacon */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic("medium");
              toggleDutyStatus();
            }}
            className={cn(
              "group flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-black transition-all border cursor-pointer active:scale-95",
              dutyStatus === "online"
                ? "bg-emerald-600/30 border-emerald-500/40 text-emerald-200 hover:bg-emerald-600/50"
                : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
            )}
            title="ডিউটি স্ট্যাটাস পরিবর্তন করুন"
          >
            <span className="relative flex size-2.5">
              <span
                className={cn(
                  "absolute inline-flex size-full rounded-full opacity-75",
                  dutyStatus === "online" ? "animate-ping bg-emerald-400" : "bg-slate-500"
                )}
              />
              <span
                className={cn(
                  "relative inline-flex size-2.5 rounded-full",
                  dutyStatus === "online" ? "bg-emerald-400" : "bg-slate-400"
                )}
              />
            </span>
            <span>{dutyStatus === "online" ? "অনলাইন" : "অফলাইন"}</span>
          </button>

          {/* Live Shift Timer */}
          <div className="flex items-center gap-1.5 border-r border-emerald-800/40 pr-3.5 font-mono text-xs font-bold text-emerald-300">
            <Clock className="size-3.5 text-emerald-400 animate-pulse" />
            <span>{dutyStatus === "online" ? formatSeconds(elapsed) : "০০:০০:০০"}</span>
          </div>

          {/* Active Mission Overview / Telemetry Gauges */}
          {dutyStatus === "online" && activeMission ? (
            <>
              {/* Mission Destination */}
              <div className="min-w-0 max-w-xs pr-2">
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "rounded-md px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider border",
                      stageBadge?.color
                    )}
                  >
                    {stageBadge?.label}
                  </span>
                  <span className="text-[10px] text-emerald-400/80 font-mono">
                    {activeMission.distanceKm} কিমি · {activeMission.estimatedTimeMins}মি
                  </span>
                </div>
                <p className="truncate text-xs font-bold text-white mt-0.5">
                  {nextStop?.type}: {nextStop?.name}
                </p>
              </div>

              {/* Handover OTP Pill */}
              <div className="flex items-center gap-1 rounded-xl bg-amber-400/15 border border-amber-400/30 px-2.5 py-1 text-xs font-mono font-black text-amber-300">
                <KeyRound className="size-3.5" />
                <span>OTP: {nextStop?.otp}</span>
              </div>

              {/* Telemetry Pill: Speed & Cargo Temp */}
              <div className="hidden xl:flex items-center gap-3 border-l border-emerald-800/40 pl-3 text-xs font-mono">
                <div className="flex items-center gap-1 text-emerald-300" title="লাইভ স্পিড">
                  <Activity className="size-3.5 text-emerald-400" />
                  <span>{telemetry.speed} km/h</span>
                </div>
                <div className="flex items-center gap-1 text-amber-300" title="ইনসুলেটেড কার্গো তাপমাত্রা">
                  <Thermometer className="size-3.5 text-amber-400" />
                  <span>{telemetry.cargoTemp}°C</span>
                </div>
              </div>

              {/* Direct Cockpit Link */}
              <Link
                href={ROUTES.volunteer.mission(activeMission.id)}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-1.5 text-xs font-black text-white shadow-md hover:from-emerald-500 hover:to-teal-500 transition-all cursor-pointer active:scale-95"
              >
                <Navigation className="size-3.5" />
                <span>ককপিট</span>
              </Link>
            </>
          ) : dutyStatus === "online" ? (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
              <Radio className="size-3.5 animate-pulse text-emerald-400" />
              <span>ডিসপ্যাচ রাডার সক্রিয় · নতুন মিশন খোঁজা হচ্ছে...</span>
              <Link
                href={ROUTES.volunteer.dispatches}
                className="rounded-lg bg-emerald-800/50 px-2 py-1 text-[11px] font-black text-white hover:bg-emerald-700"
              >
                ডিসপ্যাচ দেখুন
              </Link>
            </div>
          ) : (
            <div className="text-xs font-semibold text-slate-400">
              রাইডার বিরতিতে আছেন। ডিউটি শুরু করতে &apos;অনলাইন&apos; এ ক্লিক করুন।
            </div>
          )}

          {/* Quick SOS Trigger Button */}
          {dutyStatus === "online" && activeMission && (
            <button
              type="button"
              onClick={() => setIsSosOpen(true)}
              className="flex items-center gap-1 rounded-xl bg-rose-500/20 border border-rose-500/40 px-2 py-1.5 text-xs font-black text-rose-300 hover:bg-rose-500/30 transition-colors cursor-pointer"
              title="ট্রানজিট বিলম্ব বা SOS পাঠান"
            >
              <AlertTriangle className="size-3.5 text-rose-400" />
              <span>SOS</span>
            </button>
          )}
        </div>
      </aside>

      {/* ========================================================= */}
      {/* MOBILE VIEW: High-Impact Bottom Dock & Expandable Sheet  */}
      {/* ========================================================= */}
      <div className="lg:hidden fixed bottom-16 sm:bottom-0 inset-x-0 z-40 select-none pointer-events-auto">
        {/* Expanded Sheet Overlay Drawer */}
        {isExpanded && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity"
            onClick={() => setIsExpanded(false)}
          />
        )}

        {/* Floating/Sticky Mobile Container */}
        <div
          className={cn(
            "relative z-50 border-t border-emerald-500/30 bg-[#021812]/98 text-white shadow-2xl backdrop-blur-2xl transition-all duration-300",
            isExpanded ? "rounded-t-3xl max-h-[85vh] overflow-y-auto pb-4" : "rounded-t-2xl"
          )}
        >
          {/* Collapsed Mobile Bar (Always Tap to Expand) */}
          <div
            onClick={() => {
              triggerHaptic("light");
              setIsExpanded(!isExpanded);
            }}
            className="flex items-center justify-between px-4 py-2.5 cursor-pointer touch-manipulation active:bg-emerald-950/40"
          >
            {/* Left: Online Beacon & Shift Timer */}
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="relative flex size-2.5 shrink-0">
                <span
                  className={cn(
                    "absolute inline-flex size-full rounded-full opacity-75",
                    dutyStatus === "online" ? "animate-ping bg-emerald-400" : "bg-slate-500"
                  )}
                />
                <span
                  className={cn(
                    "relative inline-flex size-2.5 rounded-full",
                    dutyStatus === "online" ? "bg-emerald-400" : "bg-slate-400"
                  )}
                />
              </span>

              <div className="min-w-0 text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-black uppercase text-emerald-300">
                    {dutyStatus === "online" ? "অন-ডিউটি সক্রিয়" : "রাইডার অফলাইন"}
                  </span>
                  <span className="font-mono text-[11px] text-emerald-400/80">
                    {dutyStatus === "online" ? formatSeconds(elapsed) : ""}
                  </span>
                </div>

                {activeMission && (
                  <p className="truncate text-xs font-bold text-white max-w-[200px] sm:max-w-xs">
                    {nextStop?.type}: {nextStop?.name}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Quick Action & Expand Trigger */}
            <div className="flex items-center gap-2 shrink-0">
              {activeMission && (
                <span className="rounded-lg bg-amber-400/20 border border-amber-400/40 px-2 py-0.5 font-mono text-xs font-black text-amber-300">
                  OTP {nextStop?.otp}
                </span>
              )}

              <button
                type="button"
                className="grid size-8 place-items-center rounded-xl bg-emerald-900/60 text-emerald-300 border border-emerald-700/50"
                aria-label={isExpanded ? "সংক্ষিপ্ত করুন" : "বিস্তারিত দেখুন"}
              >
                {isExpanded ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
              </button>
            </div>
          </div>

          {/* Expanded Drawer Details (Mobile Road Command) */}
          {isExpanded && (
            <div className="border-t border-emerald-900/60 px-4 pt-4 pb-2 space-y-4 animate-in fade-in duration-200">
              {/* Duty Toggle and GPS Zone Row */}
              <div className="flex items-center justify-between gap-2 rounded-2xl bg-emerald-950/70 p-3 border border-emerald-800/40">
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className="size-4 text-emerald-400 shrink-0" />
                  <div className="min-w-0 text-left">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300/80">
                      বর্তমান সার্ভিস এলাকা
                    </p>
                    <p className="truncate text-xs font-bold text-white">
                      {telemetry.currentZone}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("heavy");
                    toggleDutyStatus();
                  }}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition-all border",
                    dutyStatus === "online"
                      ? "bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500/30"
                      : "bg-emerald-600 border-emerald-500 text-white"
                  )}
                >
                  <Power className="size-3.5" />
                  <span>{dutyStatus === "online" ? "অফলাইন যান" : "ডিউটি শুরু"}</span>
                </button>
              </div>

              {/* Active Mission Details if Present */}
              {activeMission ? (
                <>
                  {/* Mission Summary Card */}
                  <div className="rounded-2xl bg-gradient-to-br from-[#032a1e] to-[#011c14] p-3.5 border border-emerald-700/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border",
                          stageBadge?.color
                        )}
                      >
                        {stageBadge?.label}
                      </span>
                      <span className="font-mono text-xs font-bold text-emerald-300">
                        {activeMission.quantity} · {activeMission.servings} জন
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-white">{activeMission.foodTitle}</h4>
                      <p className="text-[11px] text-emerald-200/80 mt-0.5">{nextStop?.address}</p>
                    </div>

                    {/* Quick Call Direct Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <a
                        href={`tel:${nextStop?.phone}`}
                        onClick={() => triggerHaptic("medium")}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-700/50 border border-emerald-500/40 p-2 text-xs font-bold text-white hover:bg-emerald-600/60 active:scale-95"
                      >
                        <Phone className="size-3.5 text-emerald-300" />
                        <span className="truncate">কল: {nextStop?.contact?.split(" ")[0]}</span>
                      </a>

                      <Link
                        href={ROUTES.volunteer.mission(activeMission.id)}
                        onClick={() => setIsExpanded(false)}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 p-2 text-xs font-black text-white shadow-md active:scale-95"
                      >
                        <Navigation className="size-3.5" />
                        <span>ককপিট ভিউ</span>
                      </Link>
                    </div>
                  </div>

                  {/* 1-Tap Quick OTP Entry Keypad */}
                  <div className="rounded-2xl bg-emerald-950/60 p-3.5 border border-emerald-800/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                        <KeyRound className="size-3.5 text-amber-400" />
                        হ্যান্ডওভার ওটিপি যাচাই করুন
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400/80">
                        প্রয়োজনীয়: {nextStop?.otp}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        placeholder="৪-ডিজিট ওটিপি লিখুন"
                        value={quickPin}
                        onChange={(e) => setQuickPin(e.target.value)}
                        className="h-10 flex-1 rounded-xl border border-emerald-700/50 bg-[#01140e] px-3 font-mono text-base font-bold text-amber-300 text-center tracking-widest focus:border-emerald-400 focus:outline-hidden"
                      />

                      <button
                        type="button"
                        onClick={handleVerifyQuickOtp}
                        className="h-10 rounded-xl bg-emerald-600 px-4 text-xs font-black text-white hover:bg-emerald-500 active:scale-95"
                      >
                        যাচাই
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setQuickPin(nextStop?.otp || "7429");
                          triggerHaptic("light");
                        }}
                        className="h-10 rounded-xl bg-emerald-900/50 border border-emerald-700/40 px-2.5 text-[11px] font-bold text-emerald-300 active:scale-95"
                        title="অটো-ফিল"
                      >
                        অটো
                      </button>
                    </div>

                    {pinNotice && (
                      <p
                        className={cn(
                          "text-xs font-bold pt-1",
                          pinNotice.success ? "text-emerald-300" : "text-rose-400"
                        )}
                      >
                        {pinNotice.message}
                      </p>
                    )}
                  </div>

                  {/* Live Mobile Telemetry Bar */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-emerald-950/50 p-2 border border-emerald-800/30">
                      <span className="text-[10px] text-emerald-400 font-mono">স্পিড</span>
                      <p className="text-xs font-mono font-bold text-white">{telemetry.speed} km/h</p>
                    </div>
                    <div className="rounded-xl bg-emerald-950/50 p-2 border border-emerald-800/30">
                      <span className="text-[10px] text-amber-300 font-mono">কার্গো টেম্প</span>
                      <p className="text-xs font-mono font-bold text-amber-300">{telemetry.cargoTemp}°C</p>
                    </div>
                    <div className="rounded-xl bg-emerald-950/50 p-2 border border-emerald-800/30">
                      <span className="text-[10px] text-sky-300 font-mono">ব্যাটারি</span>
                      <p className="text-xs font-mono font-bold text-sky-200">{telemetry.batteryLevel}%</p>
                    </div>
                  </div>

                  {/* SOS Trigger */}
                  <button
                    type="button"
                    onClick={() => setIsSosOpen(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500/20 border border-rose-500/40 p-2.5 text-xs font-black text-rose-300 hover:bg-rose-500/30"
                  >
                    <AlertTriangle className="size-4 text-rose-400" />
                    <span>ট্রানজিট বিলম্ব বা জরুরি SOS রিপোর্ট করুন</span>
                  </button>
                </>
              ) : (
                <div className="py-6 text-center space-y-2">
                  <p className="text-xs text-emerald-200/80">বর্তমানে কোনো চলমান খাদ্য উদ্ধার মিশন নেই।</p>
                  <Link
                    href={ROUTES.volunteer.dispatches}
                    onClick={() => setIsExpanded(false)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white shadow-md"
                  >
                    <Navigation className="size-3.5" />
                    <span>উন্মুক্ত ডিসপ্যাচ তালিকা দেখুন</span>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Emergency SOS Modal Integration */}
      <SosModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
        onSubmitReport={(reason, delayMins) => {
          broadcastSos(reason, delayMins);
          setIsSosOpen(false);
        }}
      />
    </>
  );
}
