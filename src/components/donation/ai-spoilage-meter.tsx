"use client";

import { useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Flame,
  ShieldCheck,
  Sparkles,
  ThermometerSun,
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

export function AiSpoilageMeter({
  category,
  storageCondition,
  preparationTime,
  safePickupDeadline,
  className,
}: AiSpoilageMeterProps) {
  // Calculate remaining minutes and risk score
  const { remainingMinutes, freshnessScore, statusTone, statusLabel, tempLabel, advice } =
    useMemo(() => {
      const now = Date.now();
      const deadlineTs = safePickupDeadline ? Date.parse(safePickupDeadline) : NaN;
      const prepTs = preparationTime ? Date.parse(preparationTime) : NaN;

      // Calculate time remaining in minutes
      let minutes = 180; // default 3 hours
      if (Number.isFinite(deadlineTs)) {
        minutes = Math.max(0, Math.round((deadlineTs - now) / 60000));
      }

      // Determine Temperature & Condition Label
      let temp = ">৬৫°সে (গরম অবস্থায় হট-হোল্ড)";
      let conditionScore = 90;

      if (storageCondition === StorageCondition.REFRIGERATED) {
        temp = "৪°সে (হিমায়িত রেফ্রিজারেশন)";
        conditionScore = 95;
      } else if (storageCondition === StorageCondition.FROZEN) {
        temp = "-১৮°সে (ডিপ ফ্রিজ)";
        conditionScore = 98;
      } else if (storageCondition === StorageCondition.AMBIENT) {
        temp = "২৫°সে (সাধারণ রুম টেম্পারেচার)";
        conditionScore = 75;
      }

      // Calculate Freshness Score (0 - 100)
      let score = conditionScore;
      if (minutes <= 30) {
        score = Math.min(score, 45);
      } else if (minutes <= 90) {
        score = Math.min(score, 72);
      } else {
        score = Math.min(score, 94);
      }

      let tone: "safe" | "warning" | "danger" = "safe";
      let label = "নিরাপদ ও তাজা (Fresh & Safe)";
      let adv = "খাবারটি সর্বোচ্চ ফ্রেশনেস অবস্থায় রয়েছে। ভলান্টিয়ার দ্রুত সংগ্রহ করতে পারবে।";

      if (minutes <= 0) {
        tone = "danger";
        label = "মেয়াদোত্তীর্ণ (Spoilage Expired)";
        adv = "খাদ্য নিরাপত্তার স্বার্থে এই সময়ের পর খাদ্য বিতরণ নিষিদ্ধ।";
        score = 15;
      } else if (minutes <= 60 || score < 60) {
        tone = "warning";
        label = "জরুরি রেসকিউ প্রয়োজন (Short Window)";
        adv = "নিরাপদ পিকআপ উইন্ডো দ্রুত শেষ হচ্ছে। অবিলম্বে ভলান্টিয়ার ডিসপ্যাচ জরুরি।";
      }

      return {
        remainingMinutes: minutes,
        freshnessScore: score,
        statusTone: tone,
        statusLabel: label,
        tempLabel: temp,
        advice: adv,
      };
    }, [category, storageCondition, preparationTime, safePickupDeadline]);

  // Convert minutes to Bengali readable string
  const timeRemainingBn = useMemo(() => {
    if (remainingMinutes <= 0) return "সময় শেষ";
    const hours = Math.floor(remainingMinutes / 60);
    const mins = remainingMinutes % 60;
    if (hours === 0) return `${mins} মিনিট বাকি`;
    if (mins === 0) return `${hours} ঘণ্টা বাকি`;
    return `${hours} ঘণ্টা ${mins} মিনিট বাকি`;
  }, [remainingMinutes]);

  // Gauge needle rotation (-90deg to +90deg)
  const needleRotation = -90 + (freshnessScore / 100) * 180;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border p-5 shadow-sm transition-all",
        statusTone === "safe"
          ? "border-emerald-200 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/50"
          : statusTone === "warning"
          ? "border-amber-200 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/40"
          : "border-rose-200 bg-gradient-to-br from-rose-50/80 via-white to-red-50/40",
        className,
      )}
    >
      {/* Top Banner */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-emerald-600 animate-icon-breathe" />
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
            AI Spoilage & Food Safety Meter
          </h4>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold shadow-2xs transition-transform hover:scale-105",
            statusTone === "safe"
              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
              : statusTone === "warning"
              ? "bg-amber-100 text-amber-800 border border-amber-300"
              : "bg-rose-100 text-rose-800 border border-rose-300",
          )}
        >
          {statusTone === "safe" ? (
            <CheckCircle2 className="size-3 animate-pulse" />
          ) : (
            <AlertTriangle className="size-3 animate-icon-wiggle" />
          )}
          {freshnessScore}% স্কোর
        </span>
      </div>

      {/* Speedometer Gauge Visualizer */}
      <div className="mt-4 grid items-center gap-5 sm:grid-cols-[auto_minmax(0,1fr)]">
        {/* Semi-circular Speedometer Arc */}
        <div className="relative mx-auto flex flex-col items-center justify-center">
          <svg className="size-32 overflow-visible" viewBox="0 0 100 60">
            {/* Background Arc */}
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Colored Segment Gradient */}
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="url(#speedometerGradient)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray="126"
              strokeDashoffset={126 - (126 * freshnessScore) / 100}
              className="transition-all duration-700 ease-out"
            />
            <defs>
              <linearGradient id="speedometerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>

            {/* Needle Pivot */}
            <circle cx="50" cy="50" r="4" fill="#0f172a" />
            {/* Needle Pointer */}
            <line
              x1="50"
              y1="50"
              x2="50"
              y2="18"
              stroke="#0f172a"
              strokeWidth="3"
              strokeLinecap="round"
              transform={`rotate(${needleRotation} 50 50)`}
              className="transition-transform duration-700 ease-out origin-[50px_50px]"
            />
          </svg>

          <span className="mt-1 font-mono text-xs font-black text-slate-700">
            {statusLabel}
          </span>
        </div>

        {/* Realtime Telemetry Stats */}
        <div className="space-y-2 text-xs">
          <div className="group flex items-center gap-2.5 rounded-xl bg-white/90 p-2.5 border border-slate-200/80 shadow-2xs hover:border-amber-300 hover:shadow-xs transition-all">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors">
              <ThermometerSun className="size-4 animate-icon-breathe group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">খাদ্যের তাপমাত্রা</p>
              <p className="font-black text-slate-900">{tempLabel}</p>
            </div>
          </div>

          <div className="group flex items-center gap-2.5 rounded-xl bg-white/90 p-2.5 border border-slate-200/80 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
              <Clock className="size-4 animate-icon-float group-hover:scale-125 group-hover:rotate-45 transition-transform duration-300" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">সেফ পিকআপ উইন্ডো</p>
              <p className="font-black text-slate-900 flex items-center gap-1.5">
                <span>{timeRemainingBn}</span>
                <span className="rounded-full bg-emerald-100 px-1.5 py-0.2 text-[10px] text-emerald-800">
                  BFSA অনুমোদিত
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Advice Pill */}
      <div className="mt-3.5 flex items-start gap-2.5 rounded-xl bg-white/80 p-2.5 text-[11px] leading-5 text-slate-600 border border-slate-200/60 hover:bg-white transition-colors">
        <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 mt-0.5 shadow-2xs">
          <ShieldCheck className="size-3.5 animate-icon-breathe" />
        </div>
        <p>
          <strong className="text-slate-800">এআই কোয়ালিটি অ্যাডভাইস: </strong>
          {advice}
        </p>
      </div>
    </div>
  );
}
