"use client";

import { useState } from "react";
import { Activity, Building2, CheckCircle2, Compass, MapPin, Sparkles, Utensils } from "lucide-react";

export interface DivisionData {
  id: string;
  name: string;
  bengaliName: string;
  x: number; // percentage in SVG viewBox
  y: number;
  activeRescues: number;
  mealsToday: number;
  partnerNgos: number;
  keyPartners: string[];
  status: "high-activity" | "active" | "standby";
  coordinates: string;
}

export const BANGLADESH_DIVISIONS: DivisionData[] = [
  {
    id: "dhaka",
    name: "Dhaka Metro",
    bengaliName: "ঢাকা মেট্রো",
    x: 52,
    y: 52,
    activeRescues: 14,
    mealsToday: 1450,
    partnerNgos: 28,
    keyPartners: ["Mastul Foundation", "Bidyanondo", "Jaago Foundation", "Food For All"],
    status: "high-activity",
    coordinates: "23.8103° N, 90.4125° E",
  },
  {
    id: "chattogram",
    name: "Chattogram",
    bengaliName: "চট্টগ্রাম",
    x: 74,
    y: 72,
    activeRescues: 8,
    mealsToday: 780,
    partnerNgos: 16,
    keyPartners: ["Chittagong Relief", "Al-Khidmat", "Ghashful"],
    status: "active",
    coordinates: "22.3569° N, 91.7832° E",
  },
  {
    id: "sylhet",
    name: "Sylhet",
    bengaliName: "সিলেট",
    x: 76,
    y: 35,
    activeRescues: 5,
    mealsToday: 420,
    partnerNgos: 9,
    keyPartners: ["Surma Food Rescue", "Sylhet Seba"],
    status: "active",
    coordinates: "24.8949° N, 91.8687° E",
  },
  {
    id: "rajshahi",
    name: "Rajshahi",
    bengaliName: "রাজশাহী",
    x: 28,
    y: 42,
    activeRescues: 4,
    mealsToday: 350,
    partnerNgos: 11,
    keyPartners: ["Padma Welfare", "Rajshahi Shishu Shurokkha"],
    status: "active",
    coordinates: "24.3636° N, 88.6241° E",
  },
  {
    id: "khulna",
    name: "Khulna",
    bengaliName: "খুলনা",
    x: 34,
    y: 75,
    activeRescues: 6,
    mealsToday: 490,
    partnerNgos: 12,
    keyPartners: ["Sundarban Relief", "Rupantar NGO"],
    status: "active",
    coordinates: "22.8456° N, 89.5403° E",
  },
  {
    id: "barishal",
    name: "Barishal",
    bengaliName: "বরিশাল",
    x: 50,
    y: 78,
    activeRescues: 3,
    mealsToday: 260,
    partnerNgos: 7,
    keyPartners: ["Kirtankhola Foundation"],
    status: "standby",
    coordinates: "22.7010° N, 90.3535° E",
  },
  {
    id: "rangpur",
    name: "Rangpur",
    bengaliName: "রংপুর",
    x: 29,
    y: 20,
    activeRescues: 4,
    mealsToday: 310,
    partnerNgos: 8,
    keyPartners: ["Teesta Seba Songstha"],
    status: "standby",
    coordinates: "25.7439° N, 89.2752° E",
  },
  {
    id: "mymensingh",
    name: "Mymensingh",
    bengaliName: "ময়মনসিংহ",
    x: 54,
    y: 33,
    activeRescues: 3,
    mealsToday: 280,
    partnerNgos: 6,
    keyPartners: ["Brahmaputra Food Rescue"],
    status: "standby",
    coordinates: "24.7471° N, 90.4203° E",
  },
];

export function BangladeshRadarMap({
  variant = "full",
}: {
  variant?: "hero" | "full";
}) {
  const [selectedDivision, setSelectedDivision] = useState<DivisionData>(
    BANGLADESH_DIVISIONS[0]
  );

  if (variant === "hero") {
    return (
      <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-emerald-900/15 bg-gradient-to-br from-[#02241b] via-[#043325] to-[#011a13] p-5 text-white shadow-2xl shadow-emerald-950/20 lg:p-7">
        {/* Atmospheric Backdrops */}
        <div className="absolute inset-0 dark-surface-grid opacity-30 pointer-events-none" />
        <div className="absolute -top-20 -right-20 size-72 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 size-72 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

        {/* Floating Chip 1: Dhaka Live Rescues (Top Left) */}
        <div className="absolute top-4 left-4 z-20 hidden sm:flex items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-[#02241b]/90 px-3.5 py-2 shadow-xl backdrop-blur-md animate-float-subtle">
          <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
          <div className="text-left">
            <p className="text-[11px] font-black text-white font-heading">ঢাকা মেট্রো সক্রিয় মিশন</p>
            <p className="text-[10px] text-emerald-300 font-semibold">১৪টি টিম মাঠে রয়েছে</p>
          </div>
        </div>

        {/* Floating Chip 2: UIU Food Rescue (Top Right) */}
        <div className="absolute top-4 right-4 z-20 hidden sm:flex items-center gap-2 rounded-2xl border border-amber-500/30 bg-[#02241b]/90 px-3.5 py-2 shadow-xl backdrop-blur-md">
          <Utensils className="size-3.5 text-amber-400" />
          <div className="text-right">
            <p className="text-[11px] font-black text-white font-heading">ইউআইইউ ক্যাফেটেরিয়া</p>
            <p className="text-[10px] text-amber-300 font-semibold">৭৫ বক্স কাচ্চি উদ্ধার</p>
          </div>
        </div>

        {/* Floating Chip 3: Verified Handover (Bottom Left) */}
        <div className="absolute bottom-4 left-4 z-20 hidden sm:flex items-center gap-2 rounded-2xl border border-teal-500/30 bg-[#02241b]/90 px-3.5 py-2 shadow-xl backdrop-blur-md">
          <CheckCircle2 className="size-3.5 text-teal-400" />
          <div className="text-left">
            <p className="text-[11px] font-black text-white font-heading">মাস্তুল ও বিদ্যানন্দ</p>
            <p className="text-[10px] text-teal-300 font-semibold">কিউআর হ্যান্ডওভার কনফার্মড</p>
          </div>
        </div>

        {/* Central Geographic Map */}
        <div className="relative my-4 flex h-[340px] sm:h-[400px] w-full items-center justify-center">
          <svg
            viewBox="0 0 100 100"
            className="h-full w-full drop-shadow-[0_0_35px_rgba(16,185,129,0.3)]"
            aria-label="Bangladesh Live Food Rescue Radar Map"
          >
            {/* Iconic Delta Boundary of Bangladesh */}
            <path
              d="M 28 10 
                 Q 36 12, 42 16 
                 T 56 22 
                 T 70 20 
                 Q 82 25, 80 38 
                 T 75 48 
                 Q 85 58, 82 72 
                 T 70 85 
                 Q 58 92, 50 84 
                 T 38 88 
                 Q 30 85, 28 72 
                 T 22 55 
                 Q 18 42, 24 25 
                 Z"
              fill="rgba(4, 53, 37, 0.45)"
              stroke="rgba(52, 211, 153, 0.65)"
              strokeWidth="0.9"
            />

            {/* Glowing Rivers Outline (Padma - Meghna - Jamuna delta flow) */}
            <path
              d="M 32 32 Q 45 42, 52 52 T 62 76"
              fill="none"
              stroke="rgba(56, 189, 248, 0.35)"
              strokeWidth="0.7"
              strokeDasharray="1 1"
            />
            <path
              d="M 54 22 Q 53 38, 52 52"
              fill="none"
              stroke="rgba(56, 189, 248, 0.35)"
              strokeWidth="0.6"
              strokeDasharray="1 1"
            />

            {/* Logistics Route Lines between Dhaka and other divisions */}
            {BANGLADESH_DIVISIONS.filter((d) => d.id !== "dhaka").map((div) => (
              <line
                key={`route-hero-${div.id}`}
                x1={BANGLADESH_DIVISIONS[0].x}
                y1={BANGLADESH_DIVISIONS[0].y}
                x2={div.x}
                y2={div.y}
                stroke={selectedDivision.id === div.id ? "rgba(245, 158, 11, 0.9)" : "rgba(16, 185, 129, 0.3)"}
                strokeWidth={selectedDivision.id === div.id ? "1" : "0.5"}
                strokeDasharray={selectedDivision.id === div.id ? "none" : "2 1"}
              />
            ))}

            {/* Division Nodes with Bengali Names */}
            {BANGLADESH_DIVISIONS.map((div) => {
              const isSelected = selectedDivision.id === div.id;
              const isDhaka = div.id === "dhaka";

              return (
                <g
                  key={`hero-node-${div.id}`}
                  className="cursor-pointer transition-transform duration-200"
                  onClick={() => setSelectedDivision(div)}
                >
                  {/* Ping Animation on Dhaka & active divisions */}
                  {(isDhaka || div.status === "high-activity") && (
                    <circle
                      cx={div.x}
                      cy={div.y}
                      r="4.8"
                      fill="none"
                      stroke="rgba(16, 185, 129, 0.8)"
                      strokeWidth="0.6"
                      className="animate-ping"
                    />
                  )}
                  {isSelected && (
                    <circle
                      cx={div.x}
                      cy={div.y}
                      r="5.5"
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="0.8"
                    />
                  )}

                  {/* Division Node Pin */}
                  <circle
                    cx={div.x}
                    cy={div.y}
                    r={isDhaka ? "3.2" : isSelected ? "2.8" : "2.2"}
                    fill={isDhaka ? "#10b981" : isSelected ? "#f59e0b" : "#34d399"}
                    stroke="#02241b"
                    strokeWidth="0.8"
                  />

                  {/* Bengali Division Name */}
                  <text
                    x={div.x}
                    y={div.y - 4}
                    textAnchor="middle"
                    fill={isSelected ? "#fef08a" : "#e2e8f0"}
                    fontSize="3.2"
                    fontWeight={isSelected || isDhaka ? "bold" : "600"}
                    className="select-none font-sans drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
                  >
                    {div.bengaliName}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Hub Live Strip */}
        <div className="z-10 mt-1 flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-700/40 bg-[#021f17]/90 px-4 py-2.5 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400" />
            <p className="text-xs font-bold text-white font-heading">
              {selectedDivision.bengaliName} ({selectedDivision.name})
            </p>
            <span className="text-[10px] text-emerald-300 font-mono">
              {selectedDivision.coordinates}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-emerald-300 font-bold">
              উদ্ধার: <strong className="text-white">{selectedDivision.mealsToday.toLocaleString()} মিল</strong>
            </span>
            <span className="text-amber-300 font-bold">
              সক্রিয় মিশন: <strong className="text-white">{selectedDivision.activeRescues}</strong>
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Full Radar Variant
  return (
    <div className="relative overflow-hidden rounded-3xl border border-emerald-900/20 bg-gradient-to-br from-slate-950 via-[#03271d] to-[#011a13] p-6 text-white shadow-2xl lg:p-8">
      {/* Background cyber grid */}
      <div className="absolute inset-0 dark-surface-grid opacity-30 pointer-events-none" />
      <div className="absolute -top-32 -right-32 size-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 size-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col justify-between gap-4 border-b border-emerald-800/40 pb-6 sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/60 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-300">
            <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
            জাতীয় উদ্বৃত্ত খাদ্য উদ্ধার রেডার · বাংলাদেশ
          </div>
          <h3 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl font-heading">
            সারাদেশে রিয়েল-টাইম খাদ্য উদ্ধার ও বণ্টন নেটওয়ার্ক
          </h3>
          <p className="mt-1 text-sm text-emerald-200/70 font-normal">
            বিশ্ববিদ্যালয়, রেস্তোরাঁ ও বিয়ের অনুষ্ঠানের উদ্বৃত্ত খাবার ৮টি বিভাগে নিবন্ধিত এনজিওদের মাধ্যমে বণ্টন।
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-emerald-700/30 bg-emerald-900/40 px-4 py-2 text-center backdrop-blur-md">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300/80">সক্রিয় উদ্ধার মিশন</p>
            <p className="text-xl font-extrabold text-white font-heading">৪৭টি লাইভ</p>
          </div>
          <div className="rounded-2xl border border-amber-600/30 bg-amber-950/40 px-4 py-2 text-center backdrop-blur-md">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300/80">আজকের উদ্ধার</p>
            <p className="text-xl font-extrabold text-amber-400 font-heading">৪,৩৪০+ মিল</p>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="relative z-10 mt-6 grid items-center gap-8 lg:grid-cols-12">
        {/* Left Map View */}
        <div className="relative flex min-h-[380px] items-center justify-center rounded-2xl border border-emerald-800/30 bg-slate-950/40 p-4 backdrop-blur-sm lg:col-span-7">
          <svg
            viewBox="0 0 100 100"
            className="h-full max-h-[460px] w-full drop-shadow-[0_0_25px_rgba(16,185,129,0.2)]"
            aria-label="Interactive Map of Bangladesh"
          >
            {/* Outline Path */}
            <path
              d="M 28 10 
                 Q 36 12, 42 16 
                 T 56 22 
                 T 70 20 
                 Q 82 25, 80 38 
                 T 75 48 
                 Q 85 58, 82 72 
                 T 70 85 
                 Q 58 92, 50 84 
                 T 38 88 
                 Q 30 85, 28 72 
                 T 22 55 
                 Q 18 42, 24 25 
                 Z"
              fill="rgba(4, 53, 37, 0.35)"
              stroke="rgba(52, 211, 153, 0.45)"
              strokeWidth="0.8"
              strokeDasharray="2 1"
            />

            {/* Inner Route Lines */}
            {BANGLADESH_DIVISIONS.filter((d) => d.id !== "dhaka").map((div) => (
              <line
                key={`route-${div.id}`}
                x1={BANGLADESH_DIVISIONS[0].x}
                y1={BANGLADESH_DIVISIONS[0].y}
                x2={div.x}
                y2={div.y}
                stroke={selectedDivision.id === div.id ? "rgba(245, 158, 11, 0.8)" : "rgba(16, 185, 129, 0.25)"}
                strokeWidth={selectedDivision.id === div.id ? "0.9" : "0.5"}
                strokeDasharray={selectedDivision.id === div.id ? "none" : "1.5 1"}
              />
            ))}

            {/* Division Nodes */}
            {BANGLADESH_DIVISIONS.map((div) => {
              const isSelected = selectedDivision.id === div.id;
              const isDhaka = div.id === "dhaka";

              return (
                <g
                  key={div.id}
                  className="cursor-pointer transition-all duration-200"
                  onClick={() => setSelectedDivision(div)}
                >
                  {div.status === "high-activity" && (
                    <circle
                      cx={div.x}
                      cy={div.y}
                      r="4.5"
                      fill="none"
                      stroke="rgba(16, 185, 129, 0.7)"
                      strokeWidth="0.5"
                      className="animate-ping"
                    />
                  )}
                  {isSelected && (
                    <circle
                      cx={div.x}
                      cy={div.y}
                      r="5.5"
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="0.8"
                    />
                  )}

                  <circle
                    cx={div.x}
                    cy={div.y}
                    r={isDhaka ? "3" : isSelected ? "2.6" : "2"}
                    fill={isDhaka ? "#10b981" : isSelected ? "#f59e0b" : "#34d399"}
                    stroke="#02271d"
                    strokeWidth="0.8"
                  />

                  <text
                    x={div.x}
                    y={div.y - 3.8}
                    textAnchor="middle"
                    fill={isSelected ? "#fef08a" : "#e2e8f0"}
                    fontSize="3"
                    fontWeight={isSelected ? "bold" : "normal"}
                    className="select-none font-sans drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                  >
                    {div.bengaliName}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Right Active Division Details Card */}
        <div className="flex flex-col gap-4 lg:col-span-5">
          <div className="rounded-2xl border border-emerald-700/40 bg-gradient-to-br from-emerald-950/70 to-slate-900/90 p-5 backdrop-blur-md shadow-lg">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-emerald-400">
                  <MapPin className="size-3.5" /> আঞ্চলিক হাবের বিবরণ
                </span>
                <h4 className="mt-1 text-xl font-black text-white font-heading">{selectedDivision.bengaliName} ({selectedDivision.name})</h4>
                <p className="text-xs text-emerald-200/70">
                  স্থানীয় ক্যাফেটেরিয়া, রেস্তোরাঁ ও রেজিস্টার্ড চ্যারিটি কিচেন।
                </p>
              </div>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-900/50 px-2.5 py-1 text-xs font-bold text-emerald-300">
                {selectedDivision.status === "high-activity" ? "⚡ শীর্ষ চাহিদা" : "সক্রিয় রুট"}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2.5 text-center">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <Utensils className="mx-auto size-4 text-emerald-400 mb-1" />
                <p className="text-lg font-black text-white font-heading">{selectedDivision.mealsToday.toLocaleString()}</p>
                <p className="text-[10px] text-emerald-200/60 uppercase font-bold tracking-tight">আজকের মিল</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <Activity className="mx-auto size-4 text-amber-400 mb-1" />
                <p className="text-lg font-black text-amber-400 font-heading">{selectedDivision.activeRescues}</p>
                <p className="text-[10px] text-amber-200/60 uppercase font-bold tracking-tight">সক্রিয় রেসকিউ</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <Building2 className="mx-auto size-4 text-sky-400 mb-1" />
                <p className="text-lg font-black text-white font-heading">{selectedDivision.partnerNgos}</p>
                <p className="text-[10px] text-sky-200/60 uppercase font-bold tracking-tight">এনজিও পার্টনার</p>
              </div>
            </div>

            <div className="mt-5 border-t border-emerald-800/40 pt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-300/80 mb-2">
                নিবন্ধিত স্থানীয় চ্যারিটি পার্টনার:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selectedDivision.keyPartners.map((partner) => (
                  <span
                    key={partner}
                    className="inline-flex items-center gap-1 rounded-lg border border-emerald-600/30 bg-emerald-900/30 px-2.5 py-1 text-xs font-semibold text-emerald-100"
                  >
                    <Sparkles className="size-3 text-amber-400" />
                    {partner}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Division Selector Buttons */}
          <div className="rounded-2xl border border-emerald-900/40 bg-slate-950/40 p-4 backdrop-blur-xs">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-400/80 mb-2.5 font-heading">
              বিভাগ নির্বাচন করুন:
            </p>
            <div className="flex flex-wrap gap-2">
              {BANGLADESH_DIVISIONS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedDivision(d)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    selectedDivision.id === d.id
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-700/40"
                      : "border border-emerald-800/30 bg-emerald-950/30 text-emerald-200/80 hover:border-emerald-700 hover:text-white"
                  }`}
                >
                  {d.bengaliName}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
