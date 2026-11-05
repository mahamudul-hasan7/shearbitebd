"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Activity,
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock,
  Compass,
  Filter,
  Flame,
  LocateFixed,
  MapPin,
  Navigation,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Utensils,
  Zap,
} from "lucide-react";
import { RescueClock } from "@/components/donor/rescue-clock";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FOOD_CATEGORY_LABELS, PriorityLevel } from "@/lib/constants/domain";
import { useLanguage } from "@/lib/i18n/language-context";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { NGODiscoveryItem } from "@/services";

const DHAKA_ZONES = [
  { id: "all", name: "All Dhaka", left: "50%", top: "50%" },
  { id: "gulshan", name: "Gulshan-2", left: "62%", top: "28%" },
  { id: "banani", name: "Banani", left: "44%", top: "34%" },
  { id: "badda", name: "Madani Ave (Badda)", left: "74%", top: "48%" },
  { id: "dhanmondi", name: "Dhanmondi", left: "32%", top: "66%" },
  { id: "mirpur", name: "Mirpur-12", left: "26%", top: "20%" },
  { id: "uttara", name: "Uttara Sector 7", left: "50%", top: "12%" },
];

const PIN_POSITIONS: Record<string, { left: string; top: string; zone: string; zoneId: string }> = {
  "donation-badda-pantry": { left: "74%", top: "52%", zone: "Badda", zoneId: "badda" },
  "donation-uiu-bakery-snacks": { left: "76%", top: "44%", zone: "UIU Campus", zoneId: "badda" },
  "donation-banani-produce": { left: "42%", top: "32%", zone: "Banani", zoneId: "banani" },
  "donation-banani-dairy": { left: "48%", top: "38%", zone: "Banani", zoneId: "banani" },
  "donation-gulshan-buffet": { left: "64%", top: "26%", zone: "Gulshan-2", zoneId: "gulshan" },
};

function fallbackPosition(index: number) {
  return {
    left: `${25 + ((index * 19) % 55)}%`,
    top: `${22 + ((index * 23) % 54)}%`,
    zone: "Dhaka Metro",
    zoneId: "all",
  };
}

export function RescueMap({ items }: { items: NGODiscoveryItem[] }) {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [selectedId, setSelectedId] = useState<string>(items[0]?.donation?.id ?? "");
  const [filterMode, setFilterMode] = useState<"all" | "urgent" | "high_match">("all");
  const [selectedZone, setSelectedZone] = useState<string>("all");

  const filteredItems = useMemo(() => {
    let list = items;
    if (filterMode === "urgent") {
      list = list.filter((item) => item.donation.priority === PriorityLevel.URGENT);
    } else if (filterMode === "high_match") {
      list = list.filter((item) => item.matchScore >= 80);
    }
    if (selectedZone !== "all") {
      list = list.filter((item) => {
        const pos = PIN_POSITIONS[item.donation.id];
        return pos?.zoneId === selectedZone;
      });
    }
    return list;
  }, [items, filterMode, selectedZone]);

  const selected = items.find((item) => item.donation.id === selectedId) ?? filteredItems[0] ?? items[0];

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_24rem]">
      {/* Interactive Cyber-Emerald Radar Map */}
      <Card className="overflow-hidden border border-emerald-950/60 bg-[#021812] shadow-2xl">
        {/* Radar Map Header Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#0a4f3d]/60 bg-[#02241b] p-4 text-white">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-emerald-500/20 text-emerald-300">
              <Compass className="size-5" />
            </span>
            <div>
              <p className="font-heading text-sm font-black text-white sm:text-base">
                {isBn ? "ঢাকা রেসকিউ রাডার ম্যাপ · লাইভ" : "Dhaka Metro Rescue Radar · Live"}
              </p>
              <p className="text-[11px] text-emerald-200/70">
                {isBn
                  ? "উদ্বৃত্ত খাবারের নিকটবর্তী অবস্থান ও সময়সীমা পর্যবেক্ষণ"
                  : "Approximate neighborhood clusters with live expiration countdown"}
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 rounded-xl bg-emerald-950/70 p-1 border border-emerald-800/40 text-xs">
            <button
              type="button"
              onClick={() => setFilterMode("all")}
              className={cn(
                "rounded-lg px-2.5 py-1 font-bold transition-all",
                filterMode === "all"
                  ? "bg-emerald-500 text-white shadow-xs"
                  : "text-emerald-300/70 hover:text-white"
              )}
            >
              {isBn ? "সব খাবার" : "All"} ({items.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("urgent")}
              className={cn(
                "rounded-lg px-2.5 py-1 font-bold transition-all",
                filterMode === "urgent"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-rose-300/80 hover:text-white"
              )}
            >
              {isBn ? "জরুরি" : "Urgent"}
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("high_match")}
              className={cn(
                "rounded-lg px-2.5 py-1 font-bold transition-all",
                filterMode === "high_match"
                  ? "bg-amber-500 text-ink-950 shadow-xs"
                  : "text-amber-300/80 hover:text-white"
              )}
            >
              {isBn ? "সেরা মিল" : "Top Match"}
            </button>
          </div>
        </div>

        {/* Zone Fast-Select Bar */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-emerald-900/60 bg-[#021f17] px-4 py-2 text-xs">
          <span className="shrink-0 text-[10px] font-black uppercase tracking-wider text-emerald-400/80">
            {isBn ? "এলাকা নির্বাচন:" : "Zone Focus:"}
          </span>
          {DHAKA_ZONES.map((zone) => (
            <button
              key={zone.id}
              type="button"
              onClick={() => setSelectedZone(zone.id)}
              className={cn(
                "shrink-0 rounded-lg px-2.5 py-0.5 text-[11px] font-bold transition-all",
                selectedZone === zone.id
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                  : "text-slate-400 hover:text-white hover:bg-emerald-900/30"
              )}
            >
              {zone.name}
            </button>
          ))}
        </div>

        {/* Radar Map Canvas */}
        <div
          className="relative h-[34rem] overflow-hidden bg-gradient-to-br from-[#011611] via-[#022a20] to-[#01140e] sm:h-[40rem]"
          aria-label="Dhaka Rescue Radar Map"
        >
          {/* Subtle Grid Pattern */}
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                "linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)",
              backgroundSize: "36px 36px",
            }}
          />

          {/* Concentric Radar Rings Centered on Hope Hub */}
          <div className="pointer-events-none absolute left-[52%] top-[45%] -translate-x-1/2 -translate-y-1/2">
            <div className="size-48 rounded-full border border-emerald-500/20" />
            <div className="absolute inset-0 -m-16 rounded-full border border-emerald-500/15" />
            <div className="absolute inset-0 -m-36 rounded-full border border-emerald-500/10" />
            <div className="absolute inset-0 -m-56 rounded-full border border-emerald-500/5" />
          </div>

          {/* Dhaka Arterial Road Network Vectors */}
          <svg className="pointer-events-none absolute inset-0 size-full opacity-35" aria-hidden="true">
            {/* Airport Road / Pragati Sarani */}
            <path
              d="M 50% 5% Q 54% 25% 60% 40% T 70% 70%"
              fill="none"
              stroke="#34d399"
              strokeWidth="2.5"
              strokeDasharray="4 4"
            />
            {/* Mirpur to Dhanmondi Route */}
            <path
              d="M 25% 15% Q 30% 40% 34% 65% T 36% 85%"
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
            />
            {/* Hatirjheel Expressway Connector */}
            <path
              d="M 40% 38% Q 55% 42% 72% 48%"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="2.5"
              strokeDasharray="6 3"
            />
            {/* Gulshan Lake Boundary */}
            <ellipse cx="60%" cy="32%" rx="35" ry="15" fill="none" stroke="#065f46" strokeWidth="2" />
          </svg>

          {/* Labeled Neighborhood Markers */}
          {DHAKA_ZONES.filter((z) => z.id !== "all").map((zone) => (
            <div
              key={zone.name}
              className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2 text-center"
              style={{ left: zone.left, top: zone.top }}
            >
              <span className="rounded-full bg-emerald-950/80 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-300/80 border border-emerald-800/40 backdrop-blur-xs">
                {zone.name}
              </span>
            </div>
          ))}

          {/* Central NGO Service Hub (Hope Foundation) */}
          <div className="absolute left-[52%] top-[45%] z-20 -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="relative">
              <span className="absolute -inset-2 rounded-full bg-emerald-400/30 animate-ping" />
              <span className="relative grid size-12 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-xl ring-4 ring-emerald-950">
                <LocateFixed className="size-6 text-white" />
              </span>
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-700/60 bg-emerald-950/95 px-3 py-1 text-[11px] font-black text-emerald-200 shadow-md">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Hope Foundation Hub · Gulshan
            </div>
          </div>

          {/* Interactive Food Donation Radar Pins */}
          {filteredItems.map((item, index) => {
            const pos = PIN_POSITIONS[item.donation.id] ?? fallbackPosition(index);
            const urgent = item.donation.priority === PriorityLevel.URGENT;
            const active = selected?.donation.id === item.donation.id;

            return (
              <button
                key={item.donation.id}
                type="button"
                onClick={() => setSelectedId(item.donation.id)}
                aria-label={`Select ${item.donation.title}`}
                aria-pressed={active}
                className="group absolute z-30 -translate-x-1/2 -translate-y-1/2 focus:outline-hidden"
                style={{ left: pos.left, top: pos.top }}
              >
                <div className="relative flex flex-col items-center">
                  {/* Glowing Radar Halo */}
                  <span
                    className={cn(
                      "absolute -inset-2 rounded-full opacity-75 blur-xs transition-all",
                      urgent
                        ? "bg-rose-500 animate-ping"
                        : "bg-emerald-400 animate-pulse",
                      active && "scale-150 opacity-100"
                    )}
                  />

                  {/* Pin Body */}
                  <span
                    className={cn(
                      "relative grid size-10 place-items-center rounded-full text-white shadow-xl transition-all duration-200",
                      urgent
                        ? "bg-gradient-to-br from-rose-500 to-red-700 ring-4 ring-rose-950"
                        : "bg-gradient-to-br from-emerald-400 to-teal-600 ring-4 ring-emerald-950",
                      active && "scale-125 ring-amber-400"
                    )}
                  >
                    {urgent ? (
                      <Flame className="size-5 text-white" />
                    ) : (
                      <Utensils className="size-4.5 text-white" />
                    )}
                  </span>

                  {/* Label Pill */}
                  <span
                    className={cn(
                      "mt-1.5 max-w-32 truncate rounded-lg px-2 py-0.5 text-[10px] font-bold tracking-tight shadow-md transition-colors",
                      active
                        ? "bg-amber-400 text-ink-950 font-black shadow-amber-400/30"
                        : "bg-emerald-950/90 text-emerald-200 border border-emerald-800/60"
                    )}
                  >
                    {item.donation.quantity.estimatedMeals} meals · {pos.zone}
                  </span>
                </div>
              </button>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="absolute inset-0 grid place-items-center p-6 text-center text-white">
              <div>
                <MapPin className="mx-auto size-10 text-emerald-400/50" />
                <p className="mt-3 font-heading font-black text-lg">
                  {isBn ? "কোনো অনুদান পাওয়া যায়নি" : "No active pins in this filter"}
                </p>
                <p className="mt-1 text-xs text-emerald-300/70">
                  {isBn ? "সব ফিল্টার দেখতে 'সব খাবার' চাপুন" : "Switch back to 'All' to see all Dhaka rescues"}
                </p>
              </div>
            </div>
          )}

          {/* Privacy Disclaimer Footer Pill */}
          <div className="absolute bottom-4 left-4 right-4 z-30 flex items-center justify-between gap-3 rounded-2xl border border-emerald-800/40 bg-emerald-950/90 p-3 text-xs text-emerald-200 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 shrink-0 text-emerald-400" />
              <p className="text-[11px] leading-relaxed">
                <span className="font-bold text-white">
                  {isBn ? "গোপনীয়তা সংরক্ষিত:" : "Privacy Protected:"}
                </span>{" "}
                {isBn
                  ? "দাতার সঠিক ঠিকানা ও যোগাযোগ নম্বর এনজিও ক্লেইম অনুমোদনের পরেই উন্মুক্ত হবে।"
                  : "Precise building address and direct phone unlock after NGO verification."}
              </p>
            </div>
            <span className="hidden sm:inline-block rounded-md bg-emerald-900/80 px-2 py-1 text-[10px] font-mono font-bold text-emerald-300">
              BFSA Verified
            </span>
          </div>
        </div>
      </Card>

      {/* Selected Item Drawer & Quick List */}
      <div className="space-y-4">
        {selected ? (
          <Card className="overflow-hidden border border-slate-200 shadow-lg">
            {/* Header Image */}
            <div className="relative h-44 w-full overflow-hidden bg-slate-900">
              <Image
                src="/images/surplus-food-containers.jpg"
                alt={selected.donation.title}
                fill
                className="object-cover opacity-90 transition-transform duration-500 hover:scale-105"
                sizes="(max-width: 1280px) 100vw, 400px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                <Badge tone="success" className="font-heading font-black">
                  {selected.matchScore}% Match
                </Badge>
                <Badge
                  tone={
                    selected.donation.priority === PriorityLevel.URGENT ? "danger" : "info"
                  }
                >
                  {FOOD_CATEGORY_LABELS[selected.donation.category]}
                </Badge>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <h3 className="font-heading text-lg font-black text-ink-900 sm:text-xl">
                  {selected.donation.title}
                </h3>
                <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-brand-700">
                  <Building2 className="size-3.5" />
                  {selected.donorOrganization}
                </p>
              </div>

              {/* Match Score AI Breakdown Pill */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-[11px] text-emerald-900">
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1">
                    <Sparkles className="size-3.5 text-emerald-600" />
                    {isBn ? "স্মার্ট ম্যাচিং বিশ্লেষণ" : "Smart Matching Score Breakdown"}
                  </span>
                  <span className="font-black text-emerald-800">{selected.matchScore}%</span>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-1.5 text-center text-[10px]">
                  <div className="rounded-lg bg-white/80 p-1 border border-emerald-100">
                    <p className="text-muted-500">Distance</p>
                    <p className="font-bold text-emerald-800">96%</p>
                  </div>
                  <div className="rounded-lg bg-white/80 p-1 border border-emerald-100">
                    <p className="text-muted-500">Capacity</p>
                    <p className="font-bold text-emerald-800">100%</p>
                  </div>
                  <div className="rounded-lg bg-white/80 p-1 border border-emerald-100">
                    <p className="text-muted-500">Halal / BFSA</p>
                    <p className="font-bold text-emerald-800">100%</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-500">
                    {isBn ? "দূরত্ব ও আনুমানিক সময়" : "Distance & Courier ETA"}
                  </p>
                  <p className="font-heading mt-0.5 text-sm font-bold text-ink-900">
                    {selected.donation.pickup.distanceKm?.toFixed(1)} km · ~18m
                  </p>
                  <p className="text-[10px] text-muted-500 truncate">
                    {selected.donation.pickup.approximateArea.split(",")[0]}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-500">
                    {isBn ? "পরিমাণ" : "Estimated Meals"}
                  </p>
                  <p className="font-heading mt-0.5 text-sm font-bold text-brand-700">
                    {selected.donation.quantity.estimatedMeals} meals
                  </p>
                  <p className="text-[10px] text-muted-500">Catering Foil Packs</p>
                </div>
              </div>

              {/* Countdown Clock */}
              <div className="rounded-xl border border-line bg-canvas/70 p-3">
                <RescueClock deadline={selected.donation.safePickupDeadline} compact />
              </div>

              <ButtonLink
                href={ROUTES.ngo.donation(selected.donation.id)}
                variant="primary"
                fullWidth
                size="lg"
                className="w-full shadow-md shadow-brand-900/20"
              >
                {isBn ? "অনুদানের বিস্তারিত দেখুন ও ক্লেইম করুন" : "Inspect & Claim Rescue"}
              </ButtonLink>
            </div>
          </Card>
        ) : null}

        {/* Nearby List */}
        <Card className="overflow-hidden border border-slate-200">
          <div className="border-b border-line bg-slate-50/80 px-4 py-3">
            <p className="font-heading text-xs font-black uppercase tracking-wider text-ink-900">
              {isBn ? "নিকটবর্তী খাদ্য তালিকা" : "Nearby Surplus Feeds"} ({items.length})
            </p>
          </div>
          <div className="max-h-72 divide-y divide-line overflow-y-auto">
            {items.map((item) => {
              const isSelected = selected?.donation.id === item.donation.id;
              return (
                <button
                  key={item.donation.id}
                  type="button"
                  onClick={() => setSelectedId(item.donation.id)}
                  className={cn(
                    "flex w-full items-start gap-3 p-3.5 text-left transition-all",
                    isSelected
                      ? "bg-brand-50/80 border-l-4 border-l-brand-600"
                      : "hover:bg-slate-50"
                  )}
                >
                  <span
                    className={cn(
                      "grid size-8 shrink-0 place-items-center rounded-xl",
                      isSelected
                        ? "bg-brand-600 text-white"
                        : "bg-slate-100 text-slate-700"
                    )}
                  >
                    <Utensils className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-ink-900">
                      {item.donation.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-600">
                      {item.donation.pickup.distanceKm?.toFixed(1)} km · {item.matchScore}% match · {item.donation.quantity.estimatedMeals} meals
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}