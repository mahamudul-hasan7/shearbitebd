"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock,
  Compass,
  Flame,
  Info,
  MapPin,
  Navigation,
  Phone,
  Radio,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Timer,
  Utensils,
  Zap,
} from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useVolunteerStore } from "@/features/volunteer-dashboard/volunteer-store";
import type { AvailableDispatch } from "@/features/volunteer-dashboard/volunteer-types";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

type FilterUrgency = "all" | "critical" | "high" | "nearby";

export function VolunteerDispatchesView() {
  const router = useRouter();
  const { dispatches, profile, acceptDispatch } = useVolunteerStore();
  const [filter, setFilter] = useState<FilterUrgency>("all");
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const filteredDispatches = dispatches.filter((d: AvailableDispatch) => {
    if (filter === "critical") return d.urgency === "critical" || d.expiresInMins <= 45;
    if (filter === "high") return d.urgency === "high" || d.urgency === "critical";
    if (filter === "nearby") return d.distanceKm <= 5.0;
    return true;
  });

  function handleAccept(id: string) {
    setAcceptingId(id);
    setTimeout(() => {
      try {
        const newMission = acceptDispatch(id);
        router.push(ROUTES.volunteer.mission(newMission.id));
      } catch {
        setAcceptingId(null);
      }
    }, 700);
  }

  return (
    <PortalShell
      role="volunteer"
      activeHref={ROUTES.volunteer.dispatches}
      title="উন্মুক্ত ডিসপ্যাচ ফিড (Incoming Rescue Feed)"
      description="নিকটস্থ রেস্তোরাঁ ও ক্যাফেটেরিয়ার তাজা উদ্বৃত্ত খাবারের সরাসরি উদ্ধার রিকুয়েস্ট।"
      profileName={profile.fullName}
      profileDescription={`${profile.squadRank} · ${profile.universityAffiliation}`}
      avatarInitials={profile.avatarInitials}
      backHref={ROUTES.volunteer.dashboard}
      backLabel="কমান্ড হাবে ফিরুন"
    >
      <div className="space-y-6">
        {/* Top Radar Status Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-900/40 bg-gradient-to-r from-[#02241b] via-[#033428] to-[#011812] p-5 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <span className="relative flex size-3">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-3 rounded-full bg-emerald-500" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-emerald-300">
                ঢাকা মেট্রো ডিসপ্যাচ রাডার সক্রিয়
              </p>
              <p className="text-sm font-bold text-white mt-0.5">
                আপনার ৫ কিমি ব্যাসার্ধে মোট {dispatches.length}টি খাদ্য উদ্ধার মিশন উপলব্ধ রয়েছে
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-xl bg-white/10 px-3 py-1.5 text-xs font-mono font-bold text-emerald-300 backdrop-blur-sm border border-white/15">
              স্যাটেলাইট সিঙ্ক: লাইভ 🟢
            </span>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 border-b border-line pb-4">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "rounded-xl px-4 py-2 text-xs font-bold transition-all border",
              filter === "all"
                ? "bg-emerald-600 text-white border-emerald-500 shadow-sm font-black"
                : "border-line bg-white text-ink-700 hover:bg-slate-50"
            )}
          >
            সকল ডিসপ্যাচ ({dispatches.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("critical")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all border",
              filter === "critical"
                ? "bg-rose-600 text-white border-rose-500 shadow-sm font-black"
                : "border-line bg-white text-ink-700 hover:bg-slate-50"
            )}
          >
            <Flame className="size-3.5 text-rose-500" />
            <span>অতি জরুরি (&lt; ৪৫ মিনিট)</span>
          </button>
          <button
            type="button"
            onClick={() => setFilter("nearby")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all border",
              filter === "nearby"
                ? "bg-emerald-600 text-white border-emerald-500 shadow-sm font-black"
                : "border-line bg-white text-ink-700 hover:bg-slate-50"
            )}
          >
            <Compass className="size-3.5 text-emerald-500" />
            <span>নিকটবর্তী (&lt; ৫ কিমি)</span>
          </button>
          <button
            type="button"
            onClick={() => setFilter("high")}
            className={cn(
              "rounded-xl px-4 py-2 text-xs font-bold transition-all border",
              filter === "high"
                ? "bg-amber-600 text-white border-amber-500 shadow-sm font-black"
                : "border-line bg-white text-ink-700 hover:bg-slate-50"
            )}
          >
            উচ্চ অগ্রাধিকার
          </button>
        </div>

        {/* Dispatch Grid */}
        {filteredDispatches.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {filteredDispatches.map((dispatch: AvailableDispatch) => {
              const isUrgent = dispatch.urgency === "critical" || dispatch.expiresInMins <= 45;
              const isBusy = acceptingId === dispatch.id;

              return (
                <Card
                  key={dispatch.id}
                  className="flex flex-col justify-between overflow-hidden border-line shadow-sm hover:border-emerald-500/50 hover:shadow-md transition-all duration-200"
                >
                  <div className="p-6 space-y-4">
                    {/* Header: Urgency badge & distance */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black shadow-xs",
                          isUrgent
                            ? "bg-rose-50 text-rose-700 border border-rose-200 animate-pulse"
                            : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        )}
                      >
                        <Timer className="size-3.5" />
                        নিরাপদ মেয়াদ বাকি: {dispatch.expiresInMins} মিনিট
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-xl bg-canvas px-2.5 py-1 text-xs font-bold text-ink-800 border border-line">
                        <MapPin className="size-3 text-emerald-600" />
                        {dispatch.distanceKm} কিমি দূরত্ব
                      </span>
                    </div>

                    {/* Food Info */}
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                        {dispatch.donorName}
                      </span>
                      <h3 className="mt-1 text-xl font-black text-ink-900">{dispatch.foodType}</h3>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-900 border border-emerald-200">
                          🍱 {dispatch.quantity}
                        </span>
                        <span className="rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-900 border border-teal-200">
                          👥 ~{dispatch.servings} জনের আহার
                        </span>
                        <span className="rounded-lg bg-canvas px-2.5 py-1 text-xs font-medium text-muted-600 border border-line">
                          {dispatch.storageCondition}
                        </span>
                      </div>
                    </div>

                    {/* Route Details Box */}
                    <div className="rounded-2xl border border-line bg-canvas/70 p-4 text-xs space-y-3">
                      <div className="flex items-start gap-2.5">
                        <div className="grid size-6 place-items-center rounded-lg bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
                          <MapPin className="size-3.5" />
                        </div>
                        <div>
                          <p className="font-bold text-ink-900">পিকআপ লোকেশন:</p>
                          <p className="text-muted-600">{dispatch.donorArea}</p>
                          <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                            যোগাযোগ: {dispatch.donorContact} ({dispatch.donorPhone})
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-line/60 pt-2.5 flex items-start gap-2.5">
                        <div className="grid size-6 place-items-center rounded-lg bg-amber-100 text-amber-700 shrink-0 mt-0.5">
                          <Building2 className="size-3.5" />
                        </div>
                        <div>
                          <p className="font-bold text-ink-900">গন্তব্য এনজিও আশ্রয়কেন্দ্র:</p>
                          <p className="text-muted-600">
                            {dispatch.ngoName} · {dispatch.ngoArea}
                          </p>
                          <p className="text-[11px] text-amber-800 font-semibold mt-0.5">
                            যোগাযোগ: {dispatch.ngoContact} ({dispatch.ngoPhone})
                          </p>
                        </div>
                      </div>

                      {dispatch.specialNote && (
                        <p className="rounded-xl border border-amber-200 bg-amber-50/80 p-2.5 text-[11px] font-medium text-amber-900">
                          💡 <strong>রাইডার নোট:</strong> {dispatch.specialNote}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Accept Button Bar */}
                  <div className="border-t border-line bg-canvas/40 p-5">
                    <Button
                      type="button"
                      variant="primary"
                      disabled={isBusy}
                      leftIcon={<Navigation className="size-4" />}
                      onClick={() => handleAccept(dispatch.id)}
                      className="w-full justify-center font-black py-3 shadow-lg shadow-emerald-700/20 text-sm"
                    >
                      {isBusy ? "মিশন বরাদ্দ হচ্ছে..." : "মিশন গ্রহণ করুন (Accept Mission 🛵)"}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-12 text-center border-line">
            <CheckCircle2 className="size-12 text-emerald-600 mx-auto" />
            <h3 className="mt-4 text-xl font-black text-ink-900">এই ফিল্টারে কোনো ডিসপ্যাচ পাওয়া যায়নি</h3>
            <p className="mt-1.5 text-xs text-muted-600 max-w-sm mx-auto">
              সব ক্যাটাগরি দেখতে 'সকল ডিসপ্যাচ' অপশন সিলেক্ট করুন।
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFilter("all")}
              className="mt-4 font-bold border-line"
            >
              সকল ডিসপ্যাচ দেখুন
            </Button>
          </Card>
        )}
      </div>
    </PortalShell>
  );
}
