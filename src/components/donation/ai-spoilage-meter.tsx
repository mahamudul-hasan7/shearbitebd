"use client";

import { useMemo } from "react";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock,
  Flame,
  Info,
  RotateCcw,
  ShieldCheck,
  Snowflake,
  Sparkles,
  ThermometerSun,
  Zap,
} from "lucide-react";
import { FoodCategory, StorageCondition } from "@/lib/constants/domain";
import { cn } from "@/lib/utils";

interface AiSpoilageMeterProps {
  category: FoodCategory;
  storageCondition: StorageCondition;
  foodCondition?: string;
  preparationTime?: string;
  safePickupDeadline?: string;
  onSyncCurrentTime?: (newPrepTime: string, newDeadline: string) => void;
  className?: string;
}

// Convert English numbers to Bengali digits
function toBengaliDigits(val: number | string): string {
  const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(val).replace(/[0-9]/g, (digit) => bnDigits[Number(digit)] || digit);
}

// Format local ISO datetime string (YYYY-MM-DDTHH:mm)
function formatLocalIso(date: Date): string {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function AiSpoilageMeter({
  category,
  storageCondition,
  foodCondition = "FRESHLY_PREPARED",
  preparationTime,
  safePickupDeadline,
  onSyncCurrentTime,
  className,
}: AiSpoilageMeterProps) {
  // Real-time dynamic freshness score, telemetry, and parameter evaluation
  const {
    freshnessScore,
    statusTone,
    statusLabel,
    tempLabel,
    conditionNote,
    remainingMinutes,
    isPastDeadline,
    windowDurationHours,
    maxSafeHours,
    advice,
  } = useMemo(() => {
    const now = Date.now();
    const prepTs = preparationTime ? Date.parse(preparationTime) : NaN;
    const deadlineTs = safePickupDeadline ? Date.parse(safePickupDeadline) : NaN;

    // 1. Food safety baseline depending on storage condition
    let safeLimitHours = 4;
    let temp = "২৫°সে - ৩০°সে (রুম টেম্পারেচার)";
    let conditionNoteText = "রুম তাপমাত্রায় ব্যাকটিরিয়া বৃদ্ধির ঝুঁকি বেশি (BFSA ডেঞ্জার জোন ৫°-৬০°সে)";
    let baseQuality = 80;

    switch (storageCondition) {
      case StorageCondition.HOT_HOLDING:
        safeLimitHours = 5.0;
        temp = ">৬৫°সে (হট-হোল্ডিং ফুড ওয়ার্মার)";
        conditionNoteText = "BFSA থার্মাল ফুড সেফটি অনুমোদিত (ব্যাকটেরিয়া বৃদ্ধি প্রতিরোধী)";
        baseQuality = 94;
        break;
      case StorageCondition.REFRIGERATED:
        safeLimitHours = 24.0;
        temp = "৪°সে (চিল্ড কোল্ড-চেইন)";
        conditionNoteText = "মাইক্রোবায়াল বিস্তার ধীরগতির ও হিমায়িত সংরক্ষিত";
        baseQuality = 96;
        break;
      case StorageCondition.FROZEN:
        safeLimitHours = 72.0;
        temp = "-১৮°সে (ডিপ ফ্রিজার)";
        conditionNoteText = "দীর্ঘমেয়াদী নিরাপদ ডিপ-হিমায়িত খাদ্য সংরক্ষণ";
        baseQuality = 98;
        break;
      case StorageCondition.AMBIENT:
      default:
        if (category === FoodCategory.COOKED_MEAL) {
          safeLimitHours = 3.5;
        } else if (category === FoodCategory.DAIRY) {
          safeLimitHours = 2.5;
        } else if (category === FoodCategory.BAKERY) {
          safeLimitHours = 8.0;
        } else if (category === FoodCategory.PRODUCE) {
          safeLimitHours = 12.0;
        } else {
          safeLimitHours = 4.0;
        }
        temp = "২৫°সে (সাধারণ কক্ষ তাপমাত্রা)";
        conditionNoteText = "BFSA সতর্কতা: রুম তাপমাত্রায় ৪ ঘণ্টার মধ্যে বিতরণ বাধ্যতামূলক";
        baseQuality = 76;
        break;
    }

    // 2. Packaging & Preparation Condition Bonus
    let conditionBonus = 0;
    if (foodCondition === "FRESHLY_PREPARED") conditionBonus = 4;
    else if (foodCondition === "PACKAGED") conditionBonus = 3;
    else if (foodCondition === "SAME_DAY") conditionBonus = 0;

    // 3. Planned Window between Preparation and Safe Deadline
    let plannedDurationHours = 2.0; // default assumption
    if (Number.isFinite(prepTs) && Number.isFinite(deadlineTs)) {
      plannedDurationHours = Math.max(0.2, (deadlineTs - prepTs) / 3600000);
    }

    // 4. Calculate Food Quality Preservation Index (0-100)
    const consumedRatio = plannedDurationHours / safeLimitHours;
    let score = baseQuality + conditionBonus;

    if (consumedRatio > 1.0) {
      // Exceeds safe holding time
      const overstay = consumedRatio - 1.0;
      score = Math.max(14, Math.round(score * Math.max(0.18, 1 - overstay * 0.9)));
    } else if (consumedRatio > 0.5) {
      // Moderate consumption of shelf life
      const drop = (consumedRatio - 0.5) * 0.45;
      score = Math.round(score * (1 - drop));
    }

    score = Math.min(99, Math.max(12, score));

    // 5. Real-Time Expiration Check
    let minutesLeft = 0;
    let pastDeadline = false;
    if (Number.isFinite(deadlineTs)) {
      minutesLeft = Math.round((deadlineTs - now) / 60000);
      if (minutesLeft <= 0) {
        pastDeadline = true;
      }
    } else {
      minutesLeft = Math.round(safeLimitHours * 60);
    }

    // 6. Status Tone and Actionable Advice
    let tone: "safe" | "warning" | "danger" = "safe";
    let label = "সর্বোচ্চ তাজা ও নিরাপদ (Peak Fresh)";
    let adv = "খাবারটি সর্বোচ্চ পুষ্টিমান ও ফ্রেশনেস বজায় রেখেছে। ভলান্টিয়ার দ্রুত সংগ্রহ করতে পারবে।";

    if (pastDeadline) {
      tone = "danger";
      label = "সময় অতিক্রান্ত (Time Elapsed)";
      adv = "পিকআপের নির্ধারিত মেয়াদ ইতিমধ্যে শেষ হয়েছে। খাবার বিতরণ সক্রিয় করতে ভবিষ্যৎ সময় নির্বাচন করুন।";
    } else if (score < 50 || (minutesLeft > 0 && minutesLeft <= 45)) {
      tone = "danger";
      label = "জরুরি রেসকিউ প্রয়োজন (Critical Window)";
      adv = "খাবারের নিরাপদ মেয়াদের শেষ প্রান্তে রয়েছে। অবিলম্বে নিকটস্থ ভলান্টিয়ার পাঠানো আবশ্যক।";
    } else if (score < 75 || (minutesLeft > 0 && minutesLeft <= 90)) {
      tone = "warning";
      label = "সতর্ক পিকআপ উইন্ডো (Moderate Fresh)";
      adv = "নিরাপদ মেয়াদের অর্ধেকের বেশি অতিবাহিত হয়েছে। অগ্রাধিকার ভিত্তিতে দ্রুত পিকআপ করুন।";
    } else {
      tone = "safe";
      label = "সর্বোচ্চ তাজা ও নিরাপদ (Peak Fresh)";
      adv = "খাবারটি চমৎকার ফ্রেশনেস বজায় রেখেছে। স্বাস্থ্যসম্মত পিকআপের জন্য সম্পূর্ণ উপযুক্ত।";
    }

    return {
      freshnessScore: score,
      statusTone: tone,
      statusLabel: label,
      tempLabel: temp,
      conditionNote: conditionNoteText,
      remainingMinutes: minutesLeft,
      isPastDeadline: pastDeadline,
      windowDurationHours: plannedDurationHours,
      maxSafeHours: safeLimitHours,
      advice: adv,
    };
  }, [category, storageCondition, foodCondition, preparationTime, safePickupDeadline]);

  // Convert minutes into human-friendly Bengali string
  const timeRemainingBn = useMemo(() => {
    if (isPastDeadline) return "সময় শেষ (০ মিনিট)";
    if (remainingMinutes <= 0) return "সময় শেষ (০ মিনিট)";
    const hours = Math.floor(remainingMinutes / 60);
    const mins = remainingMinutes % 60;
    if (hours === 0) return `${toBengaliDigits(mins)} মিনিট বাকি`;
    if (mins === 0) return `${toBengaliDigits(hours)} ঘণ্টা বাকি`;
    return `${toBengaliDigits(hours)} ঘণ্টা ${toBengaliDigits(mins)} মিনিট বাকি`;
  }, [remainingMinutes, isPastDeadline]);

  // Speedometer Needle Rotation (-90deg at 0% to +90deg at 100%)
  const needleRotation = -90 + (freshnessScore / 100) * 180;

  // Arc length for radius 85 is pi * 85 = 267.04
  const arcLength = 267.04;
  const strokeOffset = arcLength * (1 - Math.max(freshnessScore, 2) / 100);

  // Quick helper to sync current time (+3 hours window)
  const handleSyncToNow = () => {
    if (!onSyncCurrentTime) return;
    const now = new Date();
    const prep = formatLocalIso(now);
    const deadline = formatLocalIso(new Date(now.getTime() + 3 * 3600_000));
    onSyncCurrentTime(prep, deadline);
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border p-5 sm:p-6 transition-all duration-300 shadow-sm",
        statusTone === "safe"
          ? "border-emerald-200/90 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/40 shadow-emerald-500/5"
          : statusTone === "warning"
          ? "border-amber-200/90 bg-gradient-to-br from-amber-50/70 via-white to-orange-50/40 shadow-amber-500/5"
          : "border-rose-200/90 bg-gradient-to-br from-rose-50/70 via-white to-red-50/40 shadow-rose-500/5",
        className,
      )}
    >
      {/* Top Banner Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-200/70 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex size-8 items-center justify-center rounded-xl shadow-2xs transition-colors",
              statusTone === "safe"
                ? "bg-emerald-100 text-emerald-700"
                : statusTone === "warning"
                ? "bg-amber-100 text-amber-700"
                : "bg-rose-100 text-rose-700",
            )}
          >
            <Sparkles className="size-4 animate-icon-breathe" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 font-heading">
              AI Spoilage & Food Safety Meter
            </h4>
            <p className="text-[11px] text-slate-500 font-medium">
              রিয়েল-টাইম থার্মাল ও মাইক্রোবায়াল ফ্রেশনেস প্রেডিকশন
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black shadow-2xs transition-all",
              statusTone === "safe"
                ? "border border-emerald-300 bg-emerald-100/90 text-emerald-800"
                : statusTone === "warning"
                ? "border border-amber-300 bg-amber-100/90 text-amber-800"
                : "border border-rose-300 bg-rose-100/90 text-rose-800",
            )}
          >
            {statusTone === "safe" ? (
              <CheckCircle2 className="size-3.5 animate-pulse text-emerald-600" />
            ) : statusTone === "warning" ? (
              <AlertTriangle className="size-3.5 animate-icon-wiggle text-amber-600" />
            ) : (
              <AlertTriangle className="size-3.5 animate-bounce text-rose-600" />
            )}
            {toBengaliDigits(freshnessScore)}% স্কোর
          </span>
        </div>
      </div>

      {/* Past Deadline Alert Banner (with 1-click sync button) */}
      {isPastDeadline && (
        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-rose-300 bg-rose-50/90 p-3.5 text-xs text-rose-950">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="size-4.5 text-rose-600 shrink-0 mt-0.5 animate-bounce" />
            <div>
              <strong className="block font-bold text-rose-900">
                সতর্কতা: নির্বাচিত পিকআপ সময় পার হয়ে গেছে!
              </strong>
              <p className="text-[11px] text-rose-700 font-normal">
                ঘড়ির বর্তমান সময় অনুযায়ী ভবিষ্যৎ সময় নির্বাচন করুন যাতে এনজিও ও ভলান্টিয়ার খাবার সংগ্রহ করতে পারে।
              </p>
            </div>
          </div>
          {onSyncCurrentTime && (
            <button
              type="button"
              onClick={handleSyncToNow}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-2xs hover:bg-rose-700 active:scale-95 transition-all cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
              বর্তমান সময়ে আপডেট করুন
            </button>
          )}
        </div>
      )}

      {/* Speedometer & Live Telemetry Layout */}
      <div className="mt-5 grid items-center gap-6 md:grid-cols-[210px_minmax(0,1fr)]">
        {/* Semi-Circular Analog Speedometer Gauge */}
        <div className="relative mx-auto flex flex-col items-center justify-center">
          <div className="relative w-[200px] aspect-[240/130]">
            <svg
              className="w-full h-full select-none"
              viewBox="0 0 240 130"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Arc Spectrum Gradient */}
                <linearGradient id="spoilageArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="35%" stopColor="#f97316" />
                  <stop offset="65%" stopColor="#eab308" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>

                {/* Needle Drop Shadow */}
                <filter id="needleGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#0f172a" floodOpacity="0.25" />
                </filter>
              </defs>

              {/* Background Arc Track */}
              <path
                d="M 35 115 A 85 85 0 0 1 205 115"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="14"
                strokeLinecap="round"
              />

              {/* Active Animated Gradient Progress Arc */}
              <path
                d="M 35 115 A 85 85 0 0 1 205 115"
                fill="none"
                stroke="url(#spoilageArcGrad)"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={arcLength}
                strokeDashoffset={strokeOffset}
                style={{
                  transition: "stroke-dashoffset 0.85s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              />

              {/* Calibrated Ticks */}
              {/* 0% Tick */}
              <line x1="44" y1="115" x2="52" y2="115" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
              {/* 25% Tick */}
              <line x1="66.3" y1="61.3" x2="72" y2="67" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
              {/* 50% Tick */}
              <line x1="120" y1="39" x2="120" y2="47" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
              {/* 75% Tick */}
              <line x1="173.7" y1="61.3" x2="168" y2="67" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
              {/* 100% Tick */}
              <line x1="196" y1="115" x2="188" y2="115" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />

              {/* Tapered Mechanical Needle with Smooth Transition */}
              <g
                style={{
                  transform: `rotate(${needleRotation}deg)`,
                  transformOrigin: "120px 115px",
                  transition: "transform 0.85s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                {/* Needle Base Blade */}
                <polygon
                  points="116,115 118.8,42 121.2,42 124,115"
                  fill="#0f172a"
                  filter="url(#needleGlow)"
                />
                {/* 3D Highlight Edge */}
                <polygon
                  points="116,115 118.8,42 120,42 120,115"
                  fill="#334155"
                />
                {/* Needle Accent Jewel */}
                <circle
                  cx="120"
                  cy="43"
                  r="2"
                  fill={
                    statusTone === "safe"
                      ? "#10b981"
                      : statusTone === "warning"
                      ? "#f59e0b"
                      : "#ef4444"
                  }
                />
              </g>

              {/* Center Pivot Hub */}
              <circle cx="120" cy="115" r="9" fill="#0f172a" />
              <circle cx="120" cy="115" r="6" fill="#475569" />
              <circle
                cx="120"
                cy="115"
                r="3"
                fill={
                  statusTone === "safe"
                    ? "#10b981"
                    : statusTone === "warning"
                    ? "#f59e0b"
                    : "#ef4444"
                }
              />
            </svg>
          </div>

          {/* Under-Gauge Digital Scorecard */}
          <div className="mt-1 flex flex-col items-center text-center">
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-2xl font-black text-slate-900 tracking-tight">
                {toBengaliDigits(freshnessScore)}
              </span>
              <span className="font-mono text-xs font-bold text-slate-500">%</span>
              <span className="ml-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                ফ্রেশনেস সূচক
              </span>
            </div>
            <span
              className={cn(
                "mt-1 inline-block rounded-md px-2.5 py-0.5 font-heading text-xs font-black tracking-wide",
                statusTone === "safe"
                  ? "bg-emerald-100/80 text-emerald-900"
                  : statusTone === "warning"
                  ? "bg-amber-100/80 text-amber-900"
                  : "bg-rose-100/80 text-rose-900",
              )}
            >
              {statusLabel}
            </span>
          </div>
        </div>

        {/* Real-Time Telemetry Stats Cards */}
        <div className="space-y-2.5">
          {/* Card 1: Temperature & Storage */}
          <div className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/95 p-3 shadow-2xs transition-all hover:border-amber-300 hover:shadow-xs">
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-105",
                storageCondition === StorageCondition.HOT_HOLDING
                  ? "bg-orange-50 text-orange-600 group-hover:bg-orange-100"
                  : storageCondition === StorageCondition.REFRIGERATED ||
                    storageCondition === StorageCondition.FROZEN
                  ? "bg-sky-50 text-sky-600 group-hover:bg-sky-100"
                  : "bg-amber-50 text-amber-600 group-hover:bg-amber-100",
              )}
            >
              {storageCondition === StorageCondition.HOT_HOLDING ? (
                <Flame className="size-5 animate-icon-breathe" />
              ) : storageCondition === StorageCondition.REFRIGERATED ||
                storageCondition === StorageCondition.FROZEN ? (
                <Snowflake className="size-5 animate-icon-float" />
              ) : (
                <ThermometerSun className="size-5 animate-icon-breathe" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  খাদ্যের তাপমাত্রা ও অবস্থা
                </p>
                <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">
                  সর্বোচ্চ {toBengaliDigits(maxSafeHours)} ঘণ্টা
                </span>
              </div>
              <p className="font-heading text-sm font-black text-slate-900 truncate">
                {tempLabel}
              </p>
              <p className="text-[11px] text-slate-500 font-medium truncate">
                {conditionNote}
              </p>
            </div>
          </div>

          {/* Card 2: Safe Pickup Window Countdown */}
          <div className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/95 p-3 shadow-2xs transition-all hover:border-emerald-300 hover:shadow-xs">
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-105",
                statusTone === "safe"
                  ? "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100"
                  : statusTone === "warning"
                  ? "bg-amber-50 text-amber-600 group-hover:bg-amber-100"
                  : "bg-rose-50 text-rose-600 group-hover:bg-rose-100",
              )}
            >
              <Clock className="size-5 animate-icon-float" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  নিরাপদ পিকআপ উইন্ডো
                </p>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800">
                  BFSA অনুমোদিত
                </span>
              </div>
              <p className="font-heading text-sm font-black text-slate-900 flex items-center gap-2">
                <span>{timeRemainingBn}</span>
                {remainingMinutes > 0 && remainingMinutes <= 60 && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.2 text-[10px] font-bold text-amber-800 animate-pulse">
                    <Zap className="size-2.5" />
                    জরুরি
                  </span>
                )}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                পরিকল্পিত সময়কাল: {toBengaliDigits(windowDurationHours.toFixed(1))} ঘণ্টা (নিরাপদ মেয়াদের{" "}
                {toBengaliDigits(Math.round((windowDurationHours / maxSafeHours) * 100))}%)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Food Safety Quality Advice Banner */}
      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-white/90 p-3.5 text-xs leading-relaxed text-slate-600 transition-colors hover:bg-white">
        <div
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-xl mt-0.5 shadow-2xs",
            statusTone === "safe"
              ? "bg-emerald-100 text-emerald-700"
              : statusTone === "warning"
              ? "bg-amber-100 text-amber-700"
              : "bg-rose-100 text-rose-700",
          )}
        >
          <ShieldCheck className="size-4 animate-icon-breathe" />
        </div>
        <div className="min-w-0 flex-1">
          <p>
            <strong className="text-slate-900 font-bold">এআই কোয়ালিটি অ্যাডভাইস: </strong>
            {advice}
          </p>
        </div>
      </div>
    </div>
  );
}
