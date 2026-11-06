"use client";

import { useEffect, useState } from "react";
import { Activity, Flame, ShieldCheck, Truck, Utensils } from "lucide-react";

interface HeroTickerProps {
  lang: "bn" | "en";
}

export function HeroTicker({ lang }: HeroTickerProps) {
  const isBn = lang === "bn";

  // Animated counters state
  const [meals, setMeals] = useState(4820);
  const [volunteers, setVolunteers] = useState(42);
  const [avgMinutes] = useState(28);
  const [safetyScore] = useState(99.4);

  // Subtle live ticking effect to feel alive
  useEffect(() => {
    const interval = setInterval(() => {
      setMeals((prev) => prev + Math.floor(Math.random() * 2));
      if (Math.random() > 0.7) {
        setVolunteers((prev) => (Math.random() > 0.5 ? prev + 1 : Math.max(40, prev - 1)));
      }
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-2 gap-3.5 border-t border-emerald-500/20 pt-6 sm:grid-cols-4 sm:gap-4">
      {/* Stat 1: Meals Rescued */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-950/60 to-black/40 p-3.5 shadow-lg backdrop-blur-md transition hover:border-emerald-400/50">
        <div className="flex items-center justify-between">
          <span className="grid size-7 place-items-center rounded-lg bg-emerald-500/20 text-emerald-300">
            <Utensils className="size-3.5" />
          </span>
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
        </div>
        <p className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl font-heading">
          {meals.toLocaleString("en-US")}+
        </p>
        <p className="mt-0.5 text-xs font-semibold text-emerald-200/90 truncate">
          {isBn ? "আজকের উদ্ধারকৃত মিল" : "Meals Rescued Today"}
        </p>
      </div>

      {/* Stat 2: Active Volunteers */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-500/25 bg-gradient-to-br from-blue-950/50 to-black/40 p-3.5 shadow-lg backdrop-blur-md transition hover:border-blue-400/50">
        <div className="flex items-center justify-between">
          <span className="grid size-7 place-items-center rounded-lg bg-blue-500/20 text-blue-300">
            <Truck className="size-3.5" />
          </span>
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-blue-500" />
          </span>
        </div>
        <p className="mt-2 text-2xl font-black tracking-tight text-blue-300 sm:text-3xl font-heading">
          {volunteers} {isBn ? "জন" : "Riders"}
        </p>
        <p className="mt-0.5 text-xs font-semibold text-blue-200/90 truncate">
          {isBn ? "সক্রিয় ভলান্টিয়ার রাইডার" : "Active Metro Volunteers"}
        </p>
      </div>

      {/* Stat 3: Average Rescue Time */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-950/50 to-black/40 p-3.5 shadow-lg backdrop-blur-md transition hover:border-amber-400/50">
        <div className="flex items-center justify-between">
          <span className="grid size-7 place-items-center rounded-lg bg-amber-500/20 text-amber-300">
            <Flame className="size-3.5" />
          </span>
          <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
            {isBn ? "গরম" : "Hot"}
          </span>
        </div>
        <p className="mt-2 text-2xl font-black tracking-tight text-amber-300 sm:text-3xl font-heading">
          {avgMinutes} {isBn ? "মিনিট" : "Mins"}
        </p>
        <p className="mt-0.5 text-xs font-semibold text-amber-200/90 truncate">
          {isBn ? "গড় ডেলিভারি সম্পন্ন সময়" : "Avg. Delivery Speed"}
        </p>
      </div>

      {/* Stat 4: Safety & BFSA Compliance */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-teal-950/50 to-black/40 p-3.5 shadow-lg backdrop-blur-md transition hover:border-teal-400/50">
        <div className="flex items-center justify-between">
          <span className="grid size-7 place-items-center rounded-lg bg-teal-500/20 text-teal-300">
            <ShieldCheck className="size-3.5" />
          </span>
          <span className="rounded-full bg-teal-500/20 px-1.5 py-0.5 text-[10px] font-bold text-teal-300">
            BFSA
          </span>
        </div>
        <p className="mt-2 text-2xl font-black tracking-tight text-teal-300 sm:text-3xl font-heading">
          {safetyScore}%
        </p>
        <p className="mt-0.5 text-xs font-semibold text-teal-200/90 truncate">
          {isBn ? "খাদ্য সুরক্ষা কমপ্লায়েন্স" : "Safe Food Quality"}
        </p>
      </div>
    </div>
  );
}
