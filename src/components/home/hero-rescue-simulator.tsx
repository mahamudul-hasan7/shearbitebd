"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bike,
  Building2,
  CheckCircle2,
  Clock,
  Compass,
  MapPin,
  ShieldCheck,
  Sparkles,
  ThermometerSun,
  Utensils,
} from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

interface HeroRescueSimulatorProps {
  lang: "bn" | "en";
}

const MISSIONS = [
  {
    id: "m1",
    labelBn: "বাড্ডা UIU ➔ মাস্তুল",
    labelEn: "Badda UIU ➔ Mastul",
    donorBn: "UIU সেন্ট্রাল ক্যাফেটেরিয়া",
    donorEn: "UIU Central Cafeteria",
    donorAreaBn: "মাদানী এভিনিউ, বাড্ডা",
    donorAreaEn: "Madani Avenue, Badda",
    foodTitleBn: "১১০ প্লেট কাচ্চি বিরিয়ানি ও ডিম",
    foodTitleEn: "110 Meals Kacchi Biryani & Eggs",
    tempBn: ">৬৫°সে ইনসুলেটেড হট-বক্স",
    tempEn: ">65°C Insulated Hot-Box",
    riderNameBn: "তানভীর আহমেদ (ভেরিফায়েড রাইডার)",
    riderNameEn: "Tanveer Ahmed (Verified Rider)",
    riderVehicleBn: "মোটরসাইকেল · থার্মাল ব্যাগ",
    riderVehicleEn: "Motorbike · Thermal Bag",
    speed: "২৮ কিমি/ঘণ্টা",
    remainingDistance: "১.৬ কিমি বাকি",
    otpCode: "#৬২৪৮১৯",
    ngoNameBn: "মাস্তুল ফাউন্ডেশন শেল্টার",
    ngoNameEn: "Mastul Foundation Shelter",
    ngoAreaBn: "রামপুরা চিলড্রেন শেল্টার",
    ngoAreaEn: "Rampura Children Shelter",
    beneficiaryBn: "১১০ জন সুবিধাবঞ্চিত শিশু",
    beneficiaryEn: "110 Orphan Children",
    progressPercent: 68,
    minutesLeft: 34,
  },
  {
    id: "m2",
    labelBn: "ধানমন্ডি ২৭ ➔ বিদ্যানন্দ",
    labelEn: "Dhanmondi ➔ Bidyanondo",
    donorBn: "ধানমন্ডি মেজবান ও কনভেনশন",
    donorEn: "Dhanmondi Catering & Convention",
    donorAreaBn: "রোড ২৭, ধানমন্ডি",
    donorAreaEn: "Road 27, Dhanmondi",
    foodTitleBn: "১৮০ প্যাকেট ফ্রেশ পোলাও ও চিকেন রোস্ট",
    foodTitleEn: "180 Packs Pulao & Chicken Roast",
    tempBn: "স্বাস্থ্যসম্মত হাইজিন সিলযুক্ত",
    tempEn: "Hygienic Sealed Packs",
    riderNameBn: "রফিকুল ইসলাম (ইকো-সাইকেল রাইডার)",
    riderNameEn: "Rafiqul Islam (Eco-Cycle Rider)",
    riderVehicleBn: "রেসকিউ কার্গো বাইসাইকেল",
    riderVehicleEn: "Rescue Cargo Bicycle",
    speed: "১৮ কিমি/ঘণ্টা",
    remainingDistance: "০.৮ কিমি বাকি",
    otpCode: "#৭৮৩৯১২",
    ngoNameBn: "বিদ্যানন্দ চ্যারিটি কিচেন",
    ngoNameEn: "Bidyanondo 1 Taka Meal Kitchen",
    ngoAreaBn: "মোহাম্মদপুর টাউন হল কেন্দ্র",
    ngoAreaEn: "Mohammadpur Town Hall Center",
    beneficiaryBn: "১৮০ জন ভাসমান ও অনাহারী মানুষ",
    beneficiaryEn: "180 Street Beneficiaries",
    progressPercent: 84,
    minutesLeft: 18,
  },
];

export function HeroRescueSimulator({ lang }: HeroRescueSimulatorProps) {
  const isBn = lang === "bn";
  const [selectedMissionIndex, setSelectedMissionIndex] = useState(0);
  const [animatedProgress, setAnimatedProgress] = useState(68);

  const mission = MISSIONS[selectedMissionIndex];

  // Dynamic rider telemetry pulse
  useEffect(() => {
    setAnimatedProgress(mission.progressPercent);
    const interval = setInterval(() => {
      setAnimatedProgress((prev) => (prev >= 92 ? mission.progressPercent : prev + 2));
    }, 2500);
    return () => clearInterval(interval);
  }, [selectedMissionIndex, mission.progressPercent]);

  return (
    <div className="relative mx-auto w-full max-w-lg overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-b from-white/15 via-[#022119]/85 to-black/90 p-5 shadow-2xl backdrop-blur-xl text-white transition-all hover:border-emerald-400/50">
      {/* Top Banner: Mission Selector & Live Pulsing Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3.5">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[11px] font-extrabold tracking-wider uppercase text-emerald-300">
            {isBn ? "লাইভ রেসকিউ মিশন সিমুলেশন" : "Live Rescue Telemetry"}
          </span>
        </div>

        {/* Mission Toggle Pills */}
        <div className="inline-flex rounded-xl bg-black/40 p-1 border border-white/10 text-[11px] font-bold">
          {MISSIONS.map((m, idx) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelectedMissionIndex(idx)}
              className={cn(
                "rounded-lg px-2.5 py-1 transition-all cursor-pointer",
                selectedMissionIndex === idx
                  ? "bg-emerald-600 text-white shadow-xs font-black"
                  : "text-white/70 hover:text-white",
              )}
            >
              {isBn ? m.labelBn : m.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Main Mission Details */}
      <div className="mt-4 space-y-4">
        {/* Urgent Pickup Window Chip */}
        <div className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-950/40 px-3.5 py-2 text-xs">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-amber-400 animate-pulse" />
            <span className="font-bold text-amber-200">
              {isBn ? "নিরাপদ পিকআপ উইন্ডো:" : "Safe Rescue Window:"}{" "}
              <strong className="text-white">{mission.minutesLeft} {isBn ? "মিনিট বাকি" : "mins left"}</strong>
            </span>
          </div>
          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
            {isBn ? "BFSA সনদপ্রাপ্ত" : "BFSA Certified"}
          </span>
        </div>

        {/* 3-Point Connected Telemetry Flow */}
        <div className="relative space-y-3 rounded-2xl border border-white/10 bg-black/30 p-3.5">
          {/* Node 1: Donor */}
          <div className="flex items-start gap-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-600/80 text-white shadow-md">
              <Utensils className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                  {isBn ? "১. খাদ্যদাতা (পিকআপ সম্পন্ন)" : "1. Donor Handover"}
                </span>
                <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-mono text-emerald-200">
                  {mission.tempBn}
                </span>
              </div>
              <p className="mt-0.5 text-sm font-black text-white truncate">
                {isBn ? mission.donorBn : mission.donorEn}
              </p>
              <p className="text-xs font-semibold text-emerald-100/90 truncate">
                🍱 {isBn ? mission.foodTitleBn : mission.foodTitleEn}
              </p>
            </div>
          </div>

          {/* Animated Connecting Route Track with Rider */}
          <div className="relative my-2 px-3 py-2 rounded-xl bg-emerald-950/40 border border-emerald-500/20">
            <div className="flex items-center justify-between text-[11px] text-white/80 font-bold mb-1.5">
              <span className="flex items-center gap-1.5 text-blue-300">
                <Bike className="size-3.5 text-blue-400" />
                <span>{isBn ? mission.riderNameBn : mission.riderNameEn}</span>
              </span>
              <span className="text-emerald-300 font-mono">
                {mission.speed} · {mission.remainingDistance}
              </span>
            </div>

            {/* Glowing progress line */}
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-black/60">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-400 transition-all duration-700 shadow-sm shadow-emerald-400/50"
                style={{ width: `${animatedProgress}%` }}
              />
            </div>

            <div className="mt-1.5 flex items-center justify-between text-[10px] text-white/70">
              <span>{isBn ? "পিকআপ ওটিপি যাচাই সম্পন্ন" : "Pickup Verified"}</span>
              <span className="font-mono font-bold text-amber-300">OTP: {mission.otpCode}</span>
            </div>
          </div>

          {/* Node 2: NGO Destination */}
          <div className="flex items-start gap-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-600/80 text-white shadow-md">
              <Building2 className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                  {isBn ? "২. এনজিও গন্তব্য (শেল্টার হোম)" : "2. NGO Destination"}
                </span>
                <span className="rounded-md bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-200">
                  {isBn ? "ডেলিভারি পথে" : "Arriving Soon"}
                </span>
              </div>
              <p className="mt-0.5 text-sm font-black text-white truncate">
                {isBn ? mission.ngoNameBn : mission.ngoNameEn}
              </p>
              <p className="text-xs text-white/75 truncate">
                ❤️ {isBn ? mission.beneficiaryBn : mission.beneficiaryEn}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons to View Live Map or Claims */}
        <div className="flex items-center gap-2 pt-1">
          <Link
            href={ROUTES.ngo.discoverMap}
            className="flex-1 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 text-xs font-bold text-white shadow-lg transition-all active:scale-98"
          >
            <Compass className="size-4 text-emerald-200" />
            <span>{isBn ? "লাইভ জিপিএস ম্যাপ খুলুন" : "Open Live Map"}</span>
          </Link>
          <Link
            href={ROUTES.ngo.claims}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 px-3.5 text-xs font-bold text-white transition-all active:scale-98"
          >
            <span>{isBn ? "ক্লেইম বিবরণ" : "View Claims"}</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
