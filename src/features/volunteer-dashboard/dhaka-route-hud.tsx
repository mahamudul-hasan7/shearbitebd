"use client";

import { useState } from "react";
import {
  Activity,
  ArrowRight,
  Bike,
  CheckCircle2,
  Clock,
  Compass,
  Flame,
  Fuel,
  MapPin,
  Navigation2,
  Radio,
  ShieldCheck,
  Thermometer,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

export type MissionStage =
  | "assigned"
  | "en_route_pickup"
  | "at_pickup"
  | "cargo_loaded"
  | "en_route_dropoff"
  | "completed";

interface DhakaRouteHudProps {
  currentStage: MissionStage;
  onAdvanceStage: (stage: MissionStage) => void;
  onOpenSos: () => void;
}

export function DhakaRouteHud({
  currentStage,
  onAdvanceStage,
  onOpenSos,
}: DhakaRouteHudProps) {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const stages: { key: MissionStage; labelEn: string; labelBn: string; time: string }[] = [
    { key: "assigned", labelEn: "Mission Assigned", labelBn: "মিশন বরাদ্দ", time: "10:15 PM" },
    { key: "en_route_pickup", labelEn: "Heading to UIU", labelBn: "UIU এর পথে", time: "10:22 PM" },
    { key: "at_pickup", labelEn: "At UIU Cafeteria", labelBn: "UIU ক্যাফেটেরিয়ায়", time: "10:35 PM" },
    { key: "cargo_loaded", labelEn: "Sealed & Insulated", labelBn: "খাবার সিল ও লোড", time: "10:42 PM" },
    { key: "en_route_dropoff", labelEn: "En Route to Dhanmondi", labelBn: "ধানমন্ডির পথে", time: "10:48 PM" },
    { key: "completed", labelEn: "Handover Done", labelBn: "হস্তান্তর সম্পন্ন", time: "11:10 PM" },
  ];

  const currentStageIndex = stages.findIndex((s) => s.key === currentStage);

  return (
    <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-[#0a4f3d] bg-gradient-to-b from-[#021f17] via-[#032a20] to-[#01140e] text-white shadow-2xl">
      {/* Top HUD Telemetry Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#0a4f3d]/70 bg-[#021912]/80 px-5 py-3.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="relative flex size-3">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-3 rounded-full bg-emerald-500" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-xs font-black uppercase tracking-widest text-emerald-300">
                {isBn ? "লাইভ টেলিমেট্রি ও জিপিএস হাব" : "Live GPS Telemetry HUD"}
              </span>
              <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 font-mono text-[10px] font-bold text-emerald-300 border border-emerald-400/30">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-emerald-200/70">
              {isBn
                ? "বাড্ডা ➔ হাতিরঝিল ➔ পান্থপথ ➔ ধানমন্ডি ৩২"
                : "Badda ➔ Hatirjheel Expressway ➔ Dhanmondi 32"}
            </p>
          </div>
        </div>

        {/* Live Gauges */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 rounded-xl bg-emerald-950/70 px-3 py-1.5 border border-emerald-800/40">
            <Activity className="size-3.5 text-emerald-400 animate-pulse" />
            <span className="text-emerald-300/80">SPEED:</span>
            <span className="font-bold text-white">28 km/h</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl bg-emerald-950/70 px-3 py-1.5 border border-emerald-800/40">
            <Thermometer className="size-3.5 text-amber-400" />
            <span className="text-emerald-300/80">CARGO:</span>
            <span className="font-bold text-amber-300">64°C (Hot)</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 rounded-xl bg-emerald-950/70 px-3 py-1.5 border border-emerald-800/40">
            <Fuel className="size-3.5 text-sky-400" />
            <span className="text-emerald-300/80">EST. ARRIVAL:</span>
            <span className="font-bold text-sky-300">18 mins</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Dhaka Vector Route Canvas */}
      <div className="relative p-6 sm:p-8">
        {/* Background Cyber Grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Visual Route Schematic SVG */}
        <div className="relative z-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Origin Card */}
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-700/40 bg-emerald-950/60 p-4 backdrop-blur-md sm:min-w-[260px]">
              <span className="grid size-10 place-items-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <MapPin className="size-5" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
                    {isBn ? "পিকআপ পয়েন্ট (দাতা)" : "Pickup (Donor)"}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">10:35 PM</span>
                </div>
                <h4 className="font-heading text-sm font-bold text-white truncate">
                  UIU Cafeteria & Food Court
                </h4>
                <p className="text-[11px] text-emerald-200/70 truncate">
                  Madani Avenue, Badda, Dhaka
                </p>
                <div className="mt-1.5 flex items-center gap-1 text-[10px] text-amber-300 font-semibold">
                  <Flame className="size-3" />
                  <span>85 Trays Kacchi & Roast</span>
                </div>
              </div>
            </div>

            {/* Middle Route Indicator with Hatirjheel Waypoint */}
            <div className="relative flex flex-1 flex-col items-center justify-center px-4">
              <div className="flex items-center justify-between w-full text-[11px] font-mono text-emerald-300/80 mb-2">
                <span className="flex items-center gap-1">
                  <Navigation2 className="size-3 rotate-45 text-emerald-400" />
                  {isBn ? "প্রগতি সরণি ➔ রামপুরা ব্রিজ" : "Pragati Sarani ➔ Rampura Bridge"}
                </span>
                <span className="font-bold text-amber-300">
                  {isBn ? "৪.২ কিমি বাকি" : "4.2 km remaining"}
                </span>
              </div>

              {/* Progress Line */}
              <div className="relative h-3 w-full rounded-full bg-emerald-950/90 border border-emerald-800/60 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 transition-all duration-500"
                  style={{
                    width: `${Math.max(15, ((currentStageIndex + 1) / stages.length) * 100)}%`,
                  }}
                />
              </div>

              {/* Route Waypoints */}
              <div className="mt-2.5 flex w-full items-center justify-between text-[10px] font-semibold text-emerald-400/80">
                <span className="flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  UIU Madani
                </span>
                <span className="flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-amber-400 animate-ping" />
                  Hatirjheel Loop (Rider Live)
                </span>
                <span className="flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-sky-400" />
                  Panthapath
                </span>
                <span className="flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  Dhanmondi 32
                </span>
              </div>
            </div>

            {/* Destination Card */}
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-700/40 bg-emerald-950/60 p-4 backdrop-blur-md sm:min-w-[260px]">
              <span className="grid size-10 place-items-center rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <ShieldCheck className="size-5" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                    {isBn ? "গন্তব্য শেল্টার (এনজিও)" : "Dropoff (NGO)"}
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono">ETA 11:10 PM</span>
                </div>
                <h4 className="font-heading text-sm font-bold text-white truncate">
                  Mastul Foundation Shelter
                </h4>
                <p className="text-[11px] text-emerald-200/70 truncate">
                  House 14, Road 32, Dhanmondi
                </p>
                <div className="mt-1.5 flex items-center gap-1 text-[10px] text-emerald-300 font-semibold">
                  <CheckCircle2 className="size-3 text-emerald-400" />
                  <span>Shelter Team On Standby</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Stage Stepper */}
          <div className="mt-8 rounded-2xl border border-emerald-800/40 bg-emerald-950/40 p-4 sm:p-5">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-800/40">
              <p className="font-heading text-xs font-black uppercase tracking-wider text-emerald-300">
                {isBn ? "মিশন স্ট্যাটাস কন্ট্রোল" : "Live Mission Stage Control"}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onOpenSos}
                  className="border-rose-500/50 text-rose-300 hover:bg-rose-950/50 text-xs"
                >
                  {isBn ? "ট্রানজিট ডিলে / এসওএস" : "Report Delay / SOS"}
                </Button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {stages.map((stage, idx) => {
                const isPassed = idx < currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                return (
                  <button
                    key={stage.key}
                    type="button"
                    onClick={() => onAdvanceStage(stage.key)}
                    className={cn(
                      "flex flex-col items-start gap-1 rounded-xl p-2.5 text-left transition-all",
                      isCurrent
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-900/50 ring-2 ring-emerald-300"
                        : isPassed
                        ? "bg-emerald-900/40 text-emerald-300 hover:bg-emerald-900/60"
                        : "bg-emerald-950/30 text-emerald-500/60 hover:text-emerald-300"
                    )}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="text-[9px] font-mono font-bold">STEP 0{idx + 1}</span>
                      {isPassed && <CheckCircle2 className="size-3 text-emerald-400" />}
                      {isCurrent && <span className="size-1.5 rounded-full bg-white animate-ping" />}
                    </div>
                    <span className="text-xs font-bold leading-tight">
                      {isBn ? stage.labelBn : stage.labelEn}
                    </span>
                    <span className="text-[10px] opacity-75 font-mono">{stage.time}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}