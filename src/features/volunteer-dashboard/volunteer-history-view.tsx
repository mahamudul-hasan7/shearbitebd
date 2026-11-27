"use client";
import { UiText } from "@/lib/i18n/ui-text-node";
import { getUiLocale } from "@/lib/i18n/locale";
import { useUiText } from "@/lib/i18n/use-ui-text";

import { useEffect, useState } from "react";
import { ExecutiveDialog } from "@/components/ui/executive-dialog";
import {
  ArrowRight,
  Ban,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  FileCheck2,
  MapPin,
  PackageOpen,
  Printer,
  Search,
  ShieldAlert,
  Star,
  Truck,
  UserRound,
  Utensils,
  X,
} from "lucide-react";
import { CollectionToolbar } from "@/components/portal/collection-toolbar";
import { ArchiveRowCard, type ArchiveRowTone } from "@/components/portal/archive-row-card";
import { DashboardMetrics, DashboardMetric } from "@/components/dashboard/dashboard-ui";
import ui from "@/components/dashboard/dashboard.module.css";
import { PortalShell } from "@/components/layout/portal-shell";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  formatDurationMinutes,
  localizeMissionFeedback,
  localizeQuantityText,
} from "@/features/donations/donation-presentation";
import { useVolunteerStore } from "@/features/volunteer-dashboard/volunteer-store";
import { useMockAuth } from "@/features/auth/mock-auth";
import type { CompletedMissionRecord } from "@/features/volunteer-dashboard/volunteer-types";
import { ROUTES } from "@/lib/routes";

export function VolunteerHistoryView() {
  const tx = useUiText();
  const { session } = useMockAuth();
  const { completedHistory, profile, syncWithUserSession } = useVolunteerStore();
  const [loadError, setLoadError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "delivered_verified" | "closed" | "disputed">("all");
  const [selectedReceipt, setSelectedReceipt] = useState<{ item: CompletedMissionRecord; number: number } | null>(null);

  useEffect(() => {
    if (session?.email) {
      void syncWithUserSession(session.email, session.displayName).catch((error: Error) => setLoadError(error.message));
    }
  }, [session?.email, session?.displayName, syncWithUserSession]);

  const filteredMissions = completedHistory.filter((item: CompletedMissionRecord) => {
    const matchesSearch =
      item.foodTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ngoName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.donorArea.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.missionNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesArea =
      selectedArea === "all" ||
      item.donorArea.toLowerCase().includes(selectedArea.toLowerCase()) ||
      item.ngoArea.toLowerCase().includes(selectedArea.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "closed" ? item.status === "cancelled" || item.status === "expired" : item.status === statusFilter);

    return matchesSearch && matchesArea && matchesStatus;
  });

  const deliveredCount = completedHistory.filter((item) => item.status === "delivered_verified").length;
  const closedCount = completedHistory.filter((item) => item.status === "cancelled" || item.status === "expired").length;
  const pausedCount = completedHistory.filter((item) => item.status === "disputed").length;

  function handlePrintSummary() {
    window.print();
  }

  return (
    <PortalShell
      role="volunteer"
      activeHref={ROUTES.volunteer.history}
      title={tx("সম্পন্ন খাদ্য উদ্ধার মিশন হিস্ট্রি ও অডিট লগ")}
      description={tx("Database-এ সংরক্ষিত verified delivery, সময় এবং NGO receipt-এর অবস্থা।")}
      profileName={profile.fullName}
      profileDescription={`${profile.squadRank} · ${profile.universityAffiliation}`}
      avatarInitials={profile.avatarInitials}
      backHref={ROUTES.volunteer.dashboard}
      backLabel={tx("কমান্ড হাবে ফিরুন")}
      actions={
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="primary"
            leftIcon={<Printer className="size-4" />}
            onClick={handlePrintSummary}
            className="font-bold shadow-md shadow-emerald-700/20"
          ><UiText source={"অডিট রিপোর্ট প্রিন্ট করুন"} /></Button>
        </div>
      }
    >
      <div className={ui.stack}>
        {loadError && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{loadError}</p>}
        {/* Impact from verified delivery and distribution records */}
        <DashboardMetrics columns={3}>
          <DashboardMetric label="Verified deliveries" value={deliveredCount.toLocaleString(getUiLocale())} icon={Truck}/>
          <DashboardMetric label="Cancelled / Expired" value={closedCount.toLocaleString(getUiLocale())} icon={Ban} tone="accent"/>
          <DashboardMetric label="Meals distributed" value={completedHistory.filter(item=>item.status==="delivered_verified").reduce((n,item)=>n+item.servings,0).toLocaleString(getUiLocale())} icon={Utensils}/>
        </DashboardMetrics>

        {/* Filter and Search Bar */}
        <CollectionToolbar label={tx("Mission history filters")}>
          <div className="mb-3 flex flex-wrap gap-1.5" role="group" aria-label={tx("Filter by outcome")}>
            {([
              { id: "all", label: tx("All records ({0})", completedHistory.length) },
              { id: "delivered_verified", label: tx("Completed ({0})", deliveredCount) },
              { id: "closed", label: tx("Cancelled / Expired ({0})", closedCount) },
              { id: "disputed", label: tx("Under review ({0})", pausedCount) },
            ] as const).map((tab) => (
              <button
                key={tab.id}
                type="button"
                aria-pressed={statusFilter === tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  statusFilter === tab.id
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "liquid-glass-pill text-slate-700 hover:bg-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-400" />
            <input
              type="text"
              placeholder={tx("খাবারের নাম, রেস্তোরাঁ, এলাকা বা এনজিও নাম দিয়ে খুঁজুন...")}
              aria-label={tx("Search mission history")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="liquid-glass-control h-10 w-full rounded-xl pl-10 pr-4 text-xs font-medium text-ink-900 placeholder:text-muted-400 focus:border-emerald-600 focus:outline-hidden"
            />
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <select
              aria-label={tx("Pickup area")}
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="liquid-glass-control h-11 min-w-0 max-w-full rounded-xl px-3 text-xs font-bold text-ink-900 focus:border-emerald-600 focus:outline-hidden"
            >
              <option value="all">{tx("সকল এলাকা (Dhaka Metro)")}</option>
              <option value="বাড্ডা">{tx("বাড্ডা / নতুন বাজার")}</option>
              <option value="গুলশান">{tx("গুলশান / বনানী")}</option>
              <option value="ধানমন্ডি">{tx("ধানমন্ডি ৩২")}</option>
              <option value="মিরপুর">{tx("মিরপুর ১২ ও ১০")}</option>
              <option value="ক্যান্টনমেন্ট">{tx("ঢাকা ক্যান্টনমেন্ট")}</option>
              <option value="লালবাগ">{tx("পুরান ঢাকা / লালবাগ")}</option>
            </select>

            <span className="liquid-glass-pill rounded-xl px-3 py-2 text-xs font-black text-emerald-900 shrink-0">
              {tx("রেকর্ড:")}{filteredMissions.length}{tx("টি")}</span>
          </div>
        </div></CollectionToolbar>

        {/* Compact Numbered Missions List */}
        {filteredMissions.length > 0 ? (
          <div className="grid gap-3">
            {filteredMissions.map((item: CompletedMissionRecord, index: number) => {
              const isCancelled = item.status === "cancelled";
              const isExpiredOrDisputed = item.status === "expired" || item.status === "disputed";
              const tone: ArchiveRowTone = isCancelled ? "rose" : isExpiredOrDisputed ? "amber" : "emerald";
              const total = item.totalSteps ?? item.progressSteps?.length ?? 6;
              const done = item.completedSteps ?? (item.status === "delivered_verified" ? total : 1);
              const shortRef = `#${item.missionNumber.replace(/^clm_/, "").slice(-6).toUpperCase()}`;

              return (
                <ArchiveRowCard
                  key={item.id}
                  number={index + 1}
                  tone={tone}
                  title={item.foodTitle}
                  referenceCode={shortRef}
                  statusBadge={
                    isCancelled ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50/95 px-2.5 py-0.5 text-[11px] font-bold text-rose-800">
                        <Ban className="size-3 text-rose-600" />
                        {tx("Rescue cancelled")}
                      </span>
                    ) : item.status === "expired" ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50/95 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                        <Clock className="size-3 text-amber-600" />
                        {tx("Food deadline passed")}
                      </span>
                    ) : item.status === "disputed" ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50/95 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                        <ShieldAlert className="size-3 text-amber-600" />
                        {tx("Incident / review history available")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50/95 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                        <CheckCircle2 className="size-3 text-emerald-600" />
                        {tx("Delivery OTP verified")}
                      </span>
                    )
                  }
                  metaItems={
                    <>
                      <span className="inline-flex items-center gap-1 text-slate-700 font-semibold">
                        <MapPin className="size-3 shrink-0 text-emerald-600" />
                        <span className="truncate max-w-[14rem] sm:max-w-[20rem]">
                          {item.donorName}
                        </span>
                        <ArrowRight className="size-3 shrink-0 text-slate-400" />
                        <span className="truncate max-w-[14rem] sm:max-w-[20rem]">
                          {item.ngoName}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <PackageOpen className="size-3 shrink-0 text-emerald-600" />
                        {localizeQuantityText(item.quantity)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="size-3 shrink-0 text-slate-400" />
                        {item.date} · {item.time}
                      </span>
                      {Number.isFinite(item.durationMins) && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3 shrink-0 text-sky-600" />
                          {formatDurationMinutes(item.durationMins)}
                        </span>
                      )}
                    </>
                  }
                  progress={{
                    state:
                      item.status === "delivered_verified"
                        ? "complete"
                        : item.status === "cancelled"
                          ? "cancelled"
                          : item.status === "expired"
                            ? "expired"
                            : "paused",
                    stoppedAtLabel: item.stoppedAtLabel ?? "Food deadline passed",
                    completedSteps: done,
                    steps: item.progressSteps ?? [],
                  }}
                  actionLabel={tx("Mission details")}
                  onOpen={() => setSelectedReceipt({ item, number: index + 1 })}
                />
              );
            })}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <CheckCircle2 className="size-12 text-emerald-600 mx-auto" />
            <h3 className="mt-4 text-xl font-black text-ink-900">{tx("কোনো হিস্ট্রি রেকর্ড নেই")}</h3>
            <p className="mt-1 text-xs text-muted-600 max-w-sm mx-auto">
              {tx("আপনি এখনো কোনো খাদ্য উদ্ধার মিশন সম্পন্ন করেননি। উন্মুক্ত ডিসপ্যাচ তালিকা হতে আপনার প্রথম মিশন সম্পন্ন করুন।")}</p>
            <div className="mt-5 flex justify-center">
              <ButtonLink href={ROUTES.volunteer.dispatches} variant="primary" className="font-bold shadow-md shadow-emerald-700/20">
                {tx("উন্মুক্ত ডিসপ্যাচ ফিড দেখুন ➔")}</ButtonLink>
            </div>
          </Card>
        )}

        {/* Full Mission Details & Progress Popup Modal */}
        {selectedReceipt &&
          (() => {
            const { item, number } = selectedReceipt;
            const isCancelled = item.status === "cancelled";
            const isExpired = item.status === "expired";
            const isDisputed = item.status === "disputed";
            const isStopped = isCancelled || isExpired || isDisputed;
            const steps = item.progressSteps ?? [];
            const total = item.totalSteps ?? steps.length ?? 6;
            const done = item.completedSteps ?? (item.status === "delivered_verified" ? total : 1);
            const pct = Math.min(100, Math.max(8, Math.round((done / Math.max(1, total)) * 100)));
            const badgeClass = isCancelled
              ? "bg-rose-500/20 text-rose-100 border-rose-300/30"
              : isExpired || isDisputed
                ? "bg-amber-500/20 text-amber-100 border-amber-300/30"
                : "bg-emerald-500/20 text-emerald-100 border-emerald-300/30";
            return (
              <ExecutiveDialog
                open
                onClose={() => setSelectedReceipt(null)}
                tone={isCancelled ? "rose" : isExpired || isDisputed ? "amber" : "emerald"}
                size="lg"
                title={item.foodTitle}
                leading={
                  <span className="font-black text-sm tabular-nums">
                    #{number.toLocaleString(getUiLocale())}
                  </span>
                }
                badge={
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${badgeClass}`}
                  >
                    {isCancelled ? (
                      <Ban className="size-3" />
                    ) : isExpired || isDisputed ? (
                      <Clock className="size-3" />
                    ) : (
                      <CheckCircle2 className="size-3" />
                    )}
                    {isCancelled
                      ? tx("Rescue cancelled")
                      : isExpired
                        ? tx("Food deadline passed")
                        : isDisputed
                          ? tx("Incident recorded")
                          : tx("Delivery OTP verified ✓")}
                  </span>
                }
                eyebrow={<span className="font-mono">{item.missionNumber}</span>}
                subtitle={
                  <>
                    <FileCheck2 className="size-3.5 shrink-0 text-emerald-300" />
                    <span>{tx("শেয়ারবাইট বিডি অফিসিয়াল অডিট ট্রেইল")}</span>
                    <span className="text-white/40">·</span>
                    <span>{item.date} · {item.time}</span>
                  </>
                }
                footer={
                  <>
                    <ButtonLink
                      href={ROUTES.volunteer.reportIssue(`mission-${item.id}`)}
                      variant="outline"
                      size="sm"
                      className="font-bold"
                    >
                      {tx("Report / review history")}
                    </ButtonLink>
                    <div className="flex items-center gap-2 ml-auto">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedReceipt(null)}
                        className="font-bold"
                      >
                        {tx("বন্ধ করুন")}
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => window.print()}
                        leftIcon={<Printer className="size-4" />}
                        className="font-bold shadow-md shadow-emerald-700/20"
                      >
                        {tx("রসিদ প্রিন্ট করুন")}
                      </Button>
                    </div>
                  </>
                }
              >
                <div className="space-y-4 text-xs">
                  {/* 6-Step Readable Progress Section */}
                  {steps.length > 0 && (
                    <div className="rounded-2xl border border-slate-200/85 bg-white p-4 shadow-2xs">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                          {tx("Rescue progress")}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            isCancelled
                              ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                              : isExpired || isDisputed
                                ? "bg-amber-50 text-amber-800 ring-1 ring-amber-200"
                                : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                          }`}
                        >
                          {item.status === "delivered_verified"
                            ? tx("All {0} steps completed", total)
                            : item.stoppedAtLabel
                              ? tx("Stopped at: {0}", tx(item.stoppedAtLabel))
                              : tx("Closed")}
                        </span>
                      </div>

                      <div className="mb-3.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCancelled
                              ? "bg-gradient-to-r from-emerald-500 via-rose-500 to-rose-600"
                              : isExpired || isDisputed
                                ? "bg-gradient-to-r from-emerald-500 to-amber-500"
                                : "bg-gradient-to-r from-emerald-400 to-emerald-600"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {steps.map((step, i) => {
                          const stoppedHere = isStopped && step.current;
                          const toneBox = stoppedHere
                            ? isCancelled
                              ? "border-rose-200 bg-rose-50/90 text-rose-900"
                              : "border-amber-200 bg-amber-50/90 text-amber-900"
                            : step.done
                              ? "border-emerald-200/80 bg-emerald-50/75 text-emerald-950"
                              : "border-slate-200/70 bg-slate-50/70 text-slate-400";
                          const toneDot = stoppedHere
                            ? isCancelled
                              ? "bg-rose-600 text-white"
                              : "bg-amber-500 text-white"
                            : step.done
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-200 text-slate-500";
                          return (
                            <div
                              key={step.id}
                              className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 ${toneBox}`}
                            >
                              <span
                                className={`grid size-5 shrink-0 place-items-center rounded-full text-[10px] font-black ${toneDot}`}
                              >
                                {stoppedHere ? (
                                  isCancelled ? (
                                    <Ban className="size-3" />
                                  ) : (
                                    <Clock className="size-3" />
                                  )
                                ) : step.done ? (
                                  <Check className="size-3 stroke-[2.75]" />
                                ) : (
                                  (i + 1).toLocaleString(getUiLocale())
                                )}
                              </span>
                              <span className="text-[11px] font-bold leading-snug">
                                {tx(step.label)}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {item.outcomeReason && (
                        <div className="mt-3 rounded-xl border border-rose-200/80 bg-rose-50/80 px-3 py-2 text-[11px] font-semibold text-rose-900">
                          {tx("Reason: {0}", item.outcomeReason)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Connected Route Corridor */}
                  <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-stretch gap-2.5">
                    <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/55 p-3.5">
                      <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                        <MapPin className="size-3.5 shrink-0" />
                        <span>{tx("উৎস (ডোনার):")}</span>
                      </div>
                      <p className="mt-1 text-sm font-black text-ink-900 leading-snug">
                        {item.donorName}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-600">
                        {item.donorArea}
                      </p>
                    </div>

                    <div className="hidden sm:grid place-items-center px-1 text-slate-400">
                      <span className="grid size-7 place-items-center rounded-full border border-slate-200 bg-white shadow-2xs">
                        <ArrowRight className="size-3.5 text-emerald-700" />
                      </span>
                    </div>

                    <div className="rounded-2xl border border-amber-200/80 bg-amber-50/55 p-3.5">
                      <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-wider text-amber-800">
                        <Building2 className="size-3.5 shrink-0" />
                        <span>{tx("গন্তব্য (এনজিও):")}</span>
                      </div>
                      <p className="mt-1 text-sm font-black text-ink-900 leading-snug">
                        {item.ngoName}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-600">
                        {item.ngoArea}
                      </p>
                    </div>
                  </div>

                  {/* Bento Metrics Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
                      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        <PackageOpen className="size-3.5 text-emerald-600" />
                        {tx("মোট পরিমাণ ও মিল:")}
                      </span>
                      <p className="mt-1.5 text-sm font-black text-ink-900">
                        {localizeQuantityText(item.quantity)}
                      </p>
                      <p className="text-[11px] text-muted-600">
                        ~{item.servings.toLocaleString(getUiLocale())} {tx("জনের খাবার")}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
                      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        <Clock className="size-3.5 text-sky-600" />
                        {tx("সময়:")}
                      </span>
                      <p className="mt-1.5 text-sm font-black text-ink-900">
                        {Number.isFinite(item.durationMins)
                          ? formatDurationMinutes(item.durationMins)
                          : item.deliverySpeedNote}
                      </p>
                      <p className="text-[11px] text-amber-700 font-medium">
                        {tx("হস্তান্তর তাপমাত্রা:")} {tx("Not measured")}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
                      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        <UserRound className="size-3.5 text-emerald-700" />
                        {tx("রাইডার পরিচয়:")}
                      </span>
                      <p className="mt-1.5 truncate text-sm font-black text-ink-900">
                        {profile.fullName}
                      </p>
                      <p className="truncate font-mono text-[10px] text-muted-500">
                        {profile.id}
                      </p>
                    </div>
                  </div>

                  {/* Outcome / Verification Footnote */}
                  <div
                    className={`rounded-2xl border p-3.5 text-[11px] leading-relaxed ${
                      isCancelled
                        ? "border-rose-200/80 bg-rose-50/75 text-rose-950"
                        : isExpired || isDisputed
                          ? "border-amber-200/80 bg-amber-50/75 text-amber-950"
                          : "border-emerald-200/80 bg-emerald-50/75 text-emerald-950"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="flex items-center gap-1.5 font-bold">
                        <Star className="size-3.5 text-amber-500 fill-amber-500" />
                        <span>{tx("NGO receipt status:")}</span>
                      </p>
                      <span className="rounded-lg bg-white/80 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-700 ring-1 ring-slate-200/70">
                        {tx("Verification record ID:")} {item.verificationToken || tx("Not verified")}
                      </span>
                    </div>
                    <p className="mt-1.5 italic opacity-90">
                      <UiText source={"&ldquo;"} />{localizeMissionFeedback(item.ngoFeedback, tx)}<UiText source={"&rdquo;"} />
                    </p>
                  </div>
                </div>
              </ExecutiveDialog>
            );
          })()}
      </div>
    </PortalShell>
  );
}
