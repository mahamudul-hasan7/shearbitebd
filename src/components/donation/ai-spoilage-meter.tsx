"use client";

import { useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Flame,
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
  preparationTime?: string;
  safePickupDeadline?: string;
  className?: string;
}

// Convert English numbers to Bengali digits
function toBengaliDigits(val: number | string): string {
  const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(val).replace(/[0-9]/g, (digit) => bnDigits[Number(digit)] || digit);
}

export function AiSpoilageMeter({
  category,
  storageCondition,
  preparationTime,
  safePickupDeadline,
  className,
}: AiSpoilageMeterProps) {
  // Real-time dynamic freshness score and telemetry
  const {
    remainingMinutes,
    freshnessScore,
    statusTone,
    statusLabel,
    tempLabel,
    conditionNote,
    advice,
  } = useMemo(() => {
    const now = Date.now();
    const deadlineTs = safePickupDeadline ? Date.parse(safePickupDeadline) : NaN;
    const prepTs = preparationTime ? Date.parse(preparationTime) : NaN;

    // Shelf-life window depending on storage condition
    let maxSafeHours = 4;
    let temp = "২৫°সে - ৩০°সে (রুম টেম্পারেচার)";
    let conditionNoteText = "রুম তাপমাত্রায় ব্যাকটিরিয়া বৃদ্ধির ঝুঁকি বেশি";
    let baseQualityScore = 80;

    switch (storageCondition) {
      case StorageCondition.HOT_HOLDING:
        maxSafeHours = 4.5;
        temp = ">৬৫°সে (হট-হোল্ডিং ফুড ওয়ার্মার)";
        conditionNoteText = "BFSA থার্মাল ফুড সেফটি অনুমোদিত (গরম সংরক্ষণ)";
        baseQualityScore = 92;
        break;
      case StorageCondition.REFRIGERATED:
        maxSafeHours = 24;
        temp = "৪°সে (চিল্ড কোল্ড-চেইন)";
        conditionNoteText = "মাইক্রোবিয়াল গ্রোথ হ্রাসকৃত ও হিমায়িত";
        baseQualityScore = 96;
        break;
      case StorageCondition.FROZEN:
        maxSafeHours = 72;
        temp = "-১৮°সে (ডিপ ফ্রিজার)";
        conditionNoteText = "দীর্ঘমেয়াদী নিরাপদ ডিপ-হিমায়িত খাদ্য";
        baseQualityScore = 98;
        break;
      case StorageCondition.AMBIENT:
      default:
        if (category === FoodCategory.COOKED_MEAL) maxSafeHours = 3.5;
        else if (category === FoodCategory.DAIRY) maxSafeHours = 2.5;
        else if (category === FoodCategory.BAKERY) maxSafeHours = 8;
        else maxSafeHours = 4;
        temp = "২৫°সে (সাধারণ কক্ষ তাপমাত্রা)";
        conditionNoteText = "BFSA সুপারিশ: ৪ ঘণ্টার মধ্যে বিতরণ বাধ্যতামূলক";
        baseQualityScore = 82;
        break;
    }

    // Determine remaining minutes
    let minutes = Math.round(maxSafeHours * 60);
    if (Number.isFinite(deadlineTs)) {
      minutes = Math.round((deadlineTs - now) / 60000);
    } else if (Number.isFinite(prepTs)) {
      minutes = Math.round((prepTs + maxSafeHours * 3600000 - now) / 60000);
    }

    // Determine tone, score and advice
    let tone: "safe" | "warning" | "danger" = "safe";
    let label = "সর্বোচ্চ তাজা ও নিরাপদ (Peak Fresh)";
    let adv = "খাবারটি সর্বোচ্চ পুষ্টিমান ও ফ্রেশনেস বজায় রেখেছে। এনজিও বা ভলান্টিয়ার দ্রুত সংগ্রহ করতে পারবে।";
    let score = baseQualityScore;

    if (minutes <= 0) {
      tone = "danger";
      label = "মেয়াদোত্তীর্ণ (Spoilage Expired)";
      adv = "খাদ্য নিরাপত্তার স্বার্থে এই সময়ের পর খাবার বিতরণ নিষিদ্ধ। পুনরায় ফ্রেশ খাবার তালিকাভুক্ত করুন।";
      score = 8;
    } else {
      const maxMinutes = maxSafeHours * 60;
      const ratio = Math.max(0, Math.min(1, minutes / maxMinutes));
      score = Math.round(score * (0.35 + 0.65 * ratio));

      if (minutes <= 45 || score < 45) {
        tone = "danger";
        label = "জরুরি রেসকিউ প্রয়োজন (Critical Window)";
        adv = "নিরাপদ পিকআপ সময় দ্রুত ফুরিয়ে আসছে। খাদ্য অপচয় রোধে অবিলম্বে নিকটস্থ ভলান্টিয়ার পাঠানো আবশ্যক।";
        score = Math.max(15, Math.min(score, 45));
      } else if (minutes <= 90 || score < 72) {
        tone = "warning";
        label = "সতর্ক পিকআপ উইন্ডো (Moderate Fresh)";
        adv = "খাদ্যের নিরাপদ মেয়াদের অর্ধেকের বেশি অতিবাহিত হয়েছে। অগ্রাধিকার ভিত্তিতে দ্রুত পিকআপ করুন।";
        score = Math.max(46, Math.min(score, 71));
      } else {
        tone = "safe";
        label = "সর্বোচ্চ তাজা ও নিরাপদ (Peak Fresh)";
        adv = "খাবারটি চমৎকার ফ্রেশনেস বজায় রেখেছে। ভলান্টিয়ার পিকআপ করার জন্য সম্পূর্ণ উপযুক্ত।";
        score = Math.max(72, Math.min(score, 99));
      }
    }

    return {
      remainingMinutes: minutes,
      freshnessScore: score,
      statusTone: tone,
      statusLabel: label,
      tempLabel: temp,
      conditionNote: conditionNoteText,
      advice: adv,
    };
  }, [category, storageCondition, preparationTime, safePickupDeadline]);

  // Convert minutes into human-friendly Bengali string
  const timeRemainingBn = useMemo(() => {
    if (remainingMinutes <= 0) return "সময় শেষ (০ মিনিট)";
    const hours = Math.floor(remainingMinutes / 60);
    const mins = remainingMinutes % 60;
    if (hours === 0) return `${toBengaliDigits(mins)} মিনিট বাকি`;
    if (mins === 0) return `${toBengaliDigits(hours)} ঘণ্টা বাকি`;
    return `${toBengaliDigits(hours)} ঘণ্টা ${toBengaliDigits(mins)} মিনিট বাকি`;
  }, [remainingMinutes]);

  // Speedometer Needle Rotation (-90deg at 0% to +90deg at 100%)
  const needleRotation = -90 + (freshnessScore / 100) * 180;

  // Arc length for radius 85 is pi * 85 = 267.04
  const arcLength = 267.04;
  const strokeOffset = arcLength * (1 - Math.max(freshnessScore, 2) / 100);

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
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex size-7 items-center justify-center rounded-lg shadow-2xs transition-colors",
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
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
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

      {/* Speedometer & Live Telemetry Layout */}
      <div className="mt-5 grid items-center gap-6 md:grid-cols-[220px_minmax(0,1fr)]">
        {/* Semi-Circular Analog Speedometer Gauge */}
        <div className="relative mx-auto flex flex-col items-center justify-center">
          <div className="relative w-[210px] sm:w-[220px] aspect-[240/140]">
            <svg
              className="w-full h-full select-none"
              viewBox="0 0 240 140"
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
              <circle cx="120" cy="115" r="10" fill="#0f172a" />
              <circle cx="120" cy="115" r="6.5" fill="#475569" />
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

            {/* In-Gauge Digital Readout */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
              <div className="flex items-baseline gap-0.5">
                <span className="font-mono text-xl font-black text-slate-900 tracking-tight">
                  {toBengaliDigits(freshnessScore)}
                </span>
                <span className="font-mono text-xs font-bold text-slate-500">%</span>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                ফ্রেশনেস সূচক
              </span>
            </div>
          </div>

          {/* Under-Gauge Status Label */}
          <div className="mt-2 text-center">
            <span
              className={cn(
                "inline-block rounded-md px-2.5 py-0.5 font-heading text-xs font-black tracking-wide",
                statusTone === "safe"
                  ? "bg-emerald-100/70 text-emerald-900"
                  : statusTone === "warning"
                  ? "bg-amber-100/70 text-amber-900"
                  : "bg-rose-100/70 text-rose-900",
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
                  সেন্সর ভেরিফাইড
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
                খাদ্য নিরাপত্তা নিশ্চিতকরণে পিকআপ এই সময়ের আগেই সম্পন্ন করতে হবে।
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
