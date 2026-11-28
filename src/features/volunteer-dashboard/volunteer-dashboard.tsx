"use client";
import { useClock } from "@/lib/hooks/use-clock";
import { LiveIcon } from "@/components/motion/live-icon";
import { getUiLocale } from "@/lib/i18n/locale";
import { STORAGE_CONDITION_LABELS } from "@/lib/constants/domain";
import { useUiText } from "@/lib/i18n/use-ui-text";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Bike,
  CheckCircle2,
  Clock,
  MapPin,
  Navigation,
  PackageOpen,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import { RiderDashboardOverview } from "./rider-dashboard-overview";
import { DashboardFeedback } from "@/components/dashboard/dashboard-ui";
import ui from "@/components/dashboard/dashboard.module.css";
import { PortalShell } from "@/components/layout/portal-shell";
import { localizeQuantityText } from "@/features/donations/donation-presentation";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DhakaRouteHud } from "@/features/volunteer-dashboard/dhaka-route-hud";
import { SosModal } from "@/features/volunteer-dashboard/sos-modal";
import { VolunteerBadges } from "@/features/volunteer-dashboard/volunteer-badges";
import { useVolunteerStore } from "@/features/volunteer-dashboard/volunteer-store";
import { useMockAuth } from "@/features/auth/mock-auth";
import type { AvailableDispatch } from "@/features/volunteer-dashboard/volunteer-types";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

type CommandTab = "all" | "active" | "available" | "comms" | "badges";

export function VolunteerDashboard() {
  const tx = useUiText();
  const now = useClock();
  const { session } = useMockAuth();
  const {
    dutyStatus,
    dutyReady,
    dutySaving,
    canGoOnDuty,
    activeMission,
    dispatches,
    profile,
    completedHistory,
    sosDelayAlert,
    acceptDispatch,
    advanceStage,
    verifyOtp,
    broadcastSos,
    dismissSos,
    clearActiveMission,
    releaseMission,
    syncWithUserSession,
    fetchDispatches,
  } = useVolunteerStore();
  const acceptanceLock=useRef(false);
  const [progressStale, setProgressStale] = useState(false);
  const [releasingMission, setReleasingMission] = useState(false);

  useEffect(() => {
    if (!session?.email) return;
    const controller = new AbortController();
    let inFlight = true;
    void syncWithUserSession(session.email, session.displayName, controller.signal)
      .then(() => { if (!controller.signal.aborted) setProgressStale(false); })
      .catch(() => { if (!controller.signal.aborted) setProgressStale(true); })
      .finally(() => { inFlight = false; });
    const poll = async () => {
      if (inFlight || controller.signal.aborted || document.visibilityState !== "visible") return;
      inFlight = true;
      try { await fetchDispatches(controller.signal); if (!controller.signal.aborted) setProgressStale(false); }
      catch { if (!controller.signal.aborted) setProgressStale(true); }
      finally { inFlight = false; }
    };
    const timer = window.setInterval(() => { void poll(); }, 5_000);
    window.addEventListener("focus", poll);
    return () => { controller.abort(); window.clearInterval(timer); window.removeEventListener("focus", poll); };
  }, [session?.email, session?.displayName, syncWithUserSession, fetchDispatches]);

  const hasCurrentMission = Boolean(activeMission && activeMission.currentStage !== "completed");
  const volunteerName = session?.displayName || profile.fullName;
  const volunteerInitials = volunteerName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || profile.avatarInitials;

  const [activeTab, setActiveTab] = useState<CommandTab>("all");
  const [activePin, setActivePin] = useState("");
  const [pinNotice, setPinNotice] = useState<{ success: boolean; message: string } | null>(null);
  const [acceptedNotice, setAcceptedNotice] = useState<string | null>(null);
  const [acceptingDispatchId, setAcceptingDispatchId] = useState<string | null>(null);
  const [isSosOpen, setIsSosOpen] = useState(false);

  const isPickupPhase =
    activeMission?.currentStage === "assigned" ||
    activeMission?.currentStage === "en_route_pickup" ||
    activeMission?.currentStage === "at_pickup";
  const isDisputedHold = Boolean(
    activeMission && (activeMission.incidentPaused || activeMission.claimStatus === "DISPUTED"),
  );
  const isDeadlineElapsed = Boolean(
    now !== null && activeMission &&
      !isDisputedHold &&
      activeMission.currentStage !== "completed" &&
      new Date(activeMission.safeDeadline).getTime() <= now,
  );

  async function handleReleaseMission() {
    if (!activeMission || releasingMission || progressStale) return;
    setReleasingMission(true);
    setPinNotice(null);
    try {
      await releaseMission();
      setAcceptedNotice("মিশনটি সফলভাবে ডিসপ্যাচে ফিরিয়ে দেওয়া হয়েছে।");
      setTimeout(() => setAcceptedNotice(null), 4000);
    } catch (error) {
      setPinNotice({
        success: false,
        message: error instanceof Error ? error.message : "Could not release mission.",
      });
    } finally {
      setReleasingMission(false);
    }
  }

  async function handleVerifyPin() {
    if (!activePin.trim()) return;
    const result = await verifyOtp(activePin);
    setPinNotice(result);
    if (result.success) {
      setActivePin("");
    }
  }

  async function handleAcceptDispatch(id: string) {
    if (acceptanceLock.current || progressStale || acceptingDispatchId || !dutyReady || dutySaving || dutyStatus !== "online" || !canGoOnDuty || (activeMission && activeMission.currentStage !== "completed")) return;
    acceptanceLock.current=true;
    setAcceptingDispatchId(id);
    try {
      const mission = await acceptDispatch(id);
      setAcceptedNotice(`মিশন বরাদ্দ হয়েছে: ${mission.foodTitle}! এখন লাইভ রুটে প্রবেশ করুন।`);
      setTimeout(() => setAcceptedNotice(null), 4000);
    } catch (error) {
      setAcceptedNotice(error instanceof Error ? error.message : "Mission could not be assigned.");
    } finally { acceptanceLock.current=false; setAcceptingDispatchId(null); }
  }

  return (
    <PortalShell
      role="volunteer"
      titleClassName={ui.pageTitle}
      activeHref={ROUTES.volunteer.dashboard}
      title={tx("Welcome, {0}",volunteerName)}
      description={tx("Follow your saved missions, accept a dispatch and verify each handover.")}
      profileName={volunteerName}
      profileDescription={`${profile.squadRank} · ${profile.universityAffiliation}`}
      avatarInitials={volunteerInitials}
      compactHeader={hasCurrentMission}
    >
      <div className={ui.stack}>
        {/* SOS Delay Banner if Active */}
        {sosDelayAlert && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-500/40 bg-rose-50/90 p-4 text-rose-950 shadow-md">
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-xl bg-rose-600 text-white shrink-0">
                <AlertTriangle className="size-4.5" />
              </span>
              <p className="text-xs font-bold leading-relaxed">{tx(sosDelayAlert)}</p>
            </div>
            <button
              type="button"
              onClick={dismissSos}
              className="text-xs font-extrabold uppercase tracking-wider text-rose-700 hover:text-rose-900"
            >
              {tx("মুছে ফেলুন")}</button>
          </div>
        )}

        {/* Accepted Notice */}
        {acceptedNotice && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-50 p-4 text-emerald-950 shadow-md animate-in fade-in">
            <LiveIcon icon={CheckCircle2} motion="once" className="size-5 text-emerald-600 shrink-0" />
            <p className="text-sm font-bold">{tx(acceptedNotice)}</p>
          </div>
        )}

        {/* Contribution totals from saved delivery records. */}
        <RiderDashboardOverview history={completedHistory} completed={profile.completedMissions} available={dispatches.length}/>
        {progressStale && <DashboardFeedback stale message={tx("Saved mission details may be out of date. Refresh before taking action.")} onRetry={()=>void fetchDispatches().then(()=>setProgressStale(false)).catch(()=>setProgressStale(true))}/>}

        {/* Command View Switcher */}
        <div className="flex flex-col items-start gap-3 border-b border-white/55 pb-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="liquid-glass-pill flex min-w-0 w-full items-center gap-1.5 rounded-2xl p-1.5 overflow-x-auto max-w-full scrollbar-none snap-x sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={cn(
                "shrink-0 snap-start rounded-xl px-3.5 py-2 text-xs font-bold transition-all select-none touch-manipulation",
                activeTab === "all"
                  ? "bg-[var(--role-accent)] text-white shadow-sm font-semibold"
                  : "text-ink-700 hover:text-ink-900 hover:bg-white/60"
              )}
            >
              {tx("কমান্ড সেন্টার (সব)")}</button>
            <button
              type="button"
              onClick={() => setActiveTab("active")}
              className={cn(
                "shrink-0 snap-start rounded-xl px-3.5 py-2 text-xs font-bold transition-all select-none touch-manipulation",
                activeTab === "active"
                  ? "bg-[var(--role-accent)] text-white shadow-sm font-semibold"
                  : "text-ink-700 hover:text-ink-900 hover:bg-white/60"
              )}
            >
              {tx("Mission progress")}</button>
            <button
              type="button"
              onClick={() => setActiveTab("available")}
              className={cn(
                "shrink-0 snap-start flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all select-none touch-manipulation",
                activeTab === "available"
                  ? "bg-[var(--role-accent)] text-white shadow-sm font-semibold"
                  : "text-ink-700 hover:text-ink-900 hover:bg-white/60"
              )}
            >
              <span>{tx("উন্মুক্ত ডিসপ্যাচ")}</span>
              <span className="rounded-full bg-amber-400 px-1.5 py-0.2 text-[10px] font-black text-ink-950">
                {dispatches.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("comms")}
              className={cn(
                "shrink-0 snap-start rounded-xl px-3.5 py-2 text-xs font-bold transition-all select-none touch-manipulation",
                activeTab === "comms"
                  ? "bg-[var(--role-accent)] text-white shadow-sm font-semibold"
                  : "text-ink-700 hover:text-ink-900 hover:bg-white/60"
              )}
            >
              {tx("ওয়াকি-টকি ও রেডিও")}</button>
            <button
              type="button"
              onClick={() => setActiveTab("badges")}
              className={cn(
                "shrink-0 snap-start rounded-xl px-3.5 py-2 text-xs font-bold transition-all select-none touch-manipulation",
                activeTab === "badges"
                  ? "bg-[var(--role-accent)] text-white shadow-sm font-semibold"
                  : "text-ink-700 hover:text-ink-900 hover:bg-white/60"
              )}
            >
              {tx("অর্জিত ব্যাজ ও স্কোয়াড")}</button>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--role-ink)]">
              <span className="size-2 rounded-full bg-[var(--role-accent)]" />
              {tx("আপনার account-এর rescue কার্যক্রম")}</span>
          </div>
        </div>

        {/* Section 1: Active Mission Telemetry */}
        {(activeTab === "all" || activeTab === "active") && (
          <section id="active-mission" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex size-3 rounded-full bg-[var(--role-accent)]" />
                <h2 className="text-lg font-semibold text-ink-900 sm:text-xl">
                  {tx("চলমান rescue mission")}</h2>
              </div>
              {activeMission ? (
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  {activeMission.currentStage === "completed" ? (
                    <button
                      type="button"
                      onClick={clearActiveMission}
                      className="rounded-xl border border-slate-300/80 bg-white/70 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-white transition-colors cursor-pointer"
                    >
                      {tx("সম্পন্ন কার্ড লুকান")}
                    </button>
                  ) : isDisputedHold ? (
                    <ButtonLink
                      href={ROUTES.volunteer.reportIssue(activeMission.id)}
                      variant="outline"
                      className="text-xs font-bold text-amber-800"
                    >
                      {tx("সমস্যা ও রিপোর্ট দেখুন")}
                    </ButtonLink>
                  ) : activeMission.claimStatus === "ASSIGNED" ? (
                    <button
                      type="button"
                      disabled={releasingMission || progressStale}
                      onClick={() => void handleReleaseMission()}
                      className="rounded-xl border border-rose-300 bg-rose-50/85 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-60 transition-colors cursor-pointer"
                    >
                      {releasingMission ? tx("ছাড়া হচ্ছে…") : tx("দায়িত্ব ছেড়ে দিন")}
                    </button>
                  ) : null}
                  <ButtonLink
                    href={ROUTES.volunteer.mission(activeMission.id)}
                    variant="primary"
                    leftIcon={<LiveIcon icon={Navigation} motion="interaction" className="size-4" />}
                    className="font-semibold"
                  >
                    {tx("ফুলস্ক্রিন মিশন ককপিট")}</ButtonLink>
                </div>
              ) : (
                <ButtonLink
                  href={ROUTES.volunteer.dispatches}
                  variant="primary"
                  leftIcon={<LiveIcon icon={Navigation} motion="interaction" className="size-4" />}
                  className="font-semibold"
                >
                  {tx("উন্মুক্ত ডিসপ্যাচ ফিড দেখুন ➔")}</ButtonLink>
              )}
            </div>

            {/* Dhaka Route HUD Component */}
            {activeMission ? (
              <>
                <DhakaRouteHud
                  mission={activeMission}
                  stale={progressStale}
                  onAdvanceStage={async (st) => { try { await advanceStage(st); } catch (error) { setPinNotice({ success: false, message: error instanceof Error ? error.message : "Stage update failed." }); } }}
                  onOpenSos={() => setIsSosOpen(true)}
                />

                {/* Mission Details & Verification Card */}
                <Card className="shadow-sm">
                  <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-12 lg:gap-8">
                    {/* Mission Details */}
                    <div className="space-y-5 lg:col-span-7">
                      <div className="liquid-glass-tile rounded-2xl p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col items-center gap-1 pt-1">
                            <div className="size-3 rounded-full bg-emerald-600" />
                            <div className="h-10 w-0.5 border-l-2 border-dashed border-slate-400/60" />
                            <div className="size-3 rounded-full bg-amber-500" />
                          </div>

                          <div className="flex-1 space-y-4 text-xs sm:text-sm">
                            <div>
                              <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black uppercase tracking-wider text-[var(--role-ink)]">
                                  {tx("পিকআপ লোকেশন")}</p>
                                <span className="text-[11px] font-bold text-ink-600">
                                  {activeMission.pickupCoordinates && activeMission.dropoffCoordinates ? tx("{0} কিমি সরাসরি দূরত্ব", activeMission.distanceKm) : tx("দূরত্ব মাপা হয়নি")}
                                </span>
                              </div>
                              <p className="text-sm font-bold text-ink-900 sm:text-base">
                                {activeMission.donorName}
                              </p>
                              <p className="text-xs text-muted-600">{activeMission.donorAddress}</p>
                            </div>

                            <div>
                              <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black uppercase tracking-wider text-amber-700">
                                  {tx("গন্তব্য / হ্যান্ডওভার এনজিও")}</p>
                                <span className="text-[11px] font-bold text-amber-600">
                                  {tx("যাত্রার সময় navigation app-এ দেখুন")}</span>
                              </div>
                              <p className="text-sm font-bold text-ink-900 sm:text-base">
                                {activeMission.ngoName}
                              </p>
                              <p className="text-xs text-muted-600">{activeMission.ngoAddress}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Food Details & Image */}
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div aria-hidden="true" className="grid size-16 shrink-0 place-items-center rounded-2xl bg-[var(--role-soft)] text-[var(--role-accent)]"><PackageOpen className="size-7"/></div>
                        <div className="min-w-0 space-y-1">
                          <h3 className="break-words font-semibold text-ink-900">{activeMission.foodTitle}</h3>
                          <p className="text-base font-black text-ink-900">
                            {localizeQuantityText(activeMission.quantity)} (~{activeMission.servings.toLocaleString(getUiLocale())} {tx("জনের খাবার")})</p>
                          <p className="break-words text-xs text-muted-600">
                            {tx("নিরাপদ সময়সীমা:")} <strong>{new Intl.DateTimeFormat(getUiLocale(),{dateStyle:"medium",timeStyle:"short",timeZone:"Asia/Dhaka"}).format(new Date(activeMission.safeDeadline))}</strong> · {tx(STORAGE_CONDITION_LABELS[activeMission.storageCondition as keyof typeof STORAGE_CONDITION_LABELS] || activeMission.storageCondition)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Step Handover Verification Box */}
                    <div className="liquid-glass-tile flex flex-col justify-between rounded-2xl p-5 lg:col-span-5">
                      <div>
                        <div className="flex items-center gap-2">
                          <QrCode className="size-5 text-[var(--role-accent)]" />
                          <h3 className="text-sm font-black text-ink-900">
                            {tx("হ্যান্ডওভার ওটিপি যাচাইকরণ")}</h3>
                        </div>
                        {isDisputedHold ? (
                          <div className="mt-3 space-y-3 rounded-xl border border-amber-300/70 bg-amber-50/75 p-3.5 text-xs text-amber-950">
                            <p className="font-bold">
                              {tx("এই উদ্ধারকাজ সমস্যা যাচাইয়ের জন্য স্থগিত আছে। অ্যাডমিন সিদ্ধান্ত না দেওয়া পর্যন্ত কোড যাচাই বন্ধ থাকবে।")}
                            </p>
                            <ButtonLink
                              href={ROUTES.volunteer.reportIssue(activeMission.id)}
                              variant="outline"
                              size="sm"
                              className="w-full justify-center font-bold"
                            >
                              {tx("সমস্যা ও রিপোর্ট দেখুন")}
                            </ButtonLink>
                          </div>
                        ) : isDeadlineElapsed ? (
                          <div className="mt-3 space-y-3 rounded-xl border border-rose-300/70 bg-rose-50/75 p-3.5 text-xs text-rose-950">
                            <p className="font-bold">
                              {tx("দাতার নির্ধারিত নিরাপদ সময়সীমা পার হয়েছে। অনুগ্রহ করে অ্যাডমিন পর্যালোচনার জন্য ইস্যু রিপোর্ট জমা দিন।")}
                            </p>
                            <ButtonLink
                              href={ROUTES.volunteer.reportIssue(activeMission.id)}
                              variant="outline"
                              size="sm"
                              className="w-full justify-center font-bold"
                            >
                              {tx("সমস্যা ও রিপোর্ট দেখুন")}
                            </ButtonLink>
                          </div>
                        ) : (
                          <>
                            <p className="mt-1.5 text-xs text-muted-600">
                              {isPickupPhase ? tx("ডোনারের কাছ থেকে ৬-সংখ্যার pickup code নিয়ে প্রবেশ করান:") : tx("এনজিও প্রতিনিধির কাছ থেকে ৬-সংখ্যার delivery code নিয়ে প্রবেশ করান:")}
                            </p>

                            <div className="mt-4 space-y-2">
                              <div className="flex flex-col gap-2 sm:flex-row">
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  autoComplete="one-time-code"
                                  aria-label={tx("হ্যান্ডওভার ওটিপি যাচাইকরণ")}
                                  maxLength={6}
                                  placeholder={isPickupPhase ? tx("Donor-এর ৬-সংখ্যার code") : tx("NGO-এর ৬-সংখ্যার code")}
                                  value={activePin}
                                  onChange={(e) => setActivePin(e.target.value.replace(/\D/g, ""))}
                                  className="liquid-glass-control h-11 min-w-0 w-full rounded-xl px-3 font-mono text-center text-lg font-black tracking-widest text-ink-900 focus:border-emerald-600 focus:outline-hidden sm:flex-1"
                                />
                                <Button
                                  type="button"
                                  onClick={handleVerifyPin}
                                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 sm:w-auto"
                                >
                                  {tx("যাচাই")}</Button>
                              </div>

                              {pinNotice && (
                                <p
                                  className={cn(
                                    "text-xs font-bold",
                                    pinNotice.success ? "text-emerald-700" : "text-rose-600"
                                  )}
                                >
                                  {tx(pinNotice.message)}
                                </p>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      <div className="mt-6 flex flex-col gap-2 pt-4 border-t border-white/55">
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          leftIcon={<AlertTriangle className="size-4 shrink-0" />}
                          onClick={() => setIsSosOpen(true)}
                          className="h-auto min-h-9 w-full justify-center py-2 text-center leading-snug font-bold"
                        >
                          {tx("ট্রাফিক বা অনাকাঙ্ক্ষিত বিলম্ব SOS রিপোর্ট")}</Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </>
            ) : (
              <Card className="p-8 text-center">
                <LiveIcon icon={Bike} motion="interaction" className="size-12 text-[var(--role-accent)] mx-auto" />
                <h3 className="mt-3 text-lg font-black text-ink-900">{tx("বর্তমানে কোনো সক্রিয় মিশন নেই")}</h3>
                <p className="mt-1 text-xs text-muted-600 max-w-sm mx-auto">
                  {tx("নিচের উন্মুক্ত ডিসপ্যাচ তালিকা হতে একটি রেসকিউ গ্রহণ করুন এবং মানুষের মুখে খাবার পৌঁছে দিন।")}</p>
              </Card>
            )}
          </section>
        )}

        {/* Section 2: Incoming Available Dispatches */}
        {(activeTab === "all" || activeTab === "available") && (
          <section id="available-dispatches" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-ink-900 sm:text-xl">
                  {tx("উন্মুক্ত ডিসপ্যাচ ফিড (Incoming Rescue Feed)")}</h2>
                <p className="text-xs text-muted-600">
                  {tx("নিকটস্থ রেস্তোরাঁ ও ক্যাফেটেরিয়া হতে আসা তাজা অতিরিক্ত খাবারের অ্যালার্ট")}</p>
              </div>
              <ButtonLink
                href={ROUTES.volunteer.dispatches}
                variant="outline"
                size="sm"
                className="font-bold border-line hover:bg-emerald-50/50"
              >
                {tx("সব ডিসপ্যাচ পেজ খুলুন →")}</ButtonLink>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {dispatches.map((dispatch: AvailableDispatch) => (
                <Card
                  key={dispatch.id}
                  className="flex flex-col justify-between p-5 shadow-sm transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50/75 px-2.5 py-0.5 text-xs font-black text-rose-700 border border-rose-200/80 backdrop-blur-xs">
                        <Clock className="size-3 shrink-0" />
                        <span>{tx("বাকি")} {dispatch.expiresInMins} {tx("মিনিট")}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-muted-600">
                        <MapPin className="size-3.5 shrink-0" />
                        <span>{dispatch.distanceKm > 0 ? tx("{0} কিমি সরাসরি দূরত্ব", dispatch.distanceKm) : tx("দূরত্ব মাপা হয়নি")}</span>
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[var(--role-ink)]">
                        {dispatch.donorName}
                      </p>
                      <h3 className="mt-1 text-base font-black text-ink-900">{dispatch.foodType}</h3>
                      <p className="mt-0.5 text-xs text-muted-600">{localizeQuantityText(dispatch.quantity)}</p>
                    </div>

                    <div className="liquid-glass-tile rounded-xl p-3 text-xs leading-relaxed space-y-1">
                      <p>
                        <strong className="text-ink-800">{tx("পিকআপ:")}</strong> {dispatch.donorArea}
                      </p>
                      <p>
                        <strong className="text-ink-800">{tx("গন্তব্য:")}</strong> {dispatch.ngoName} (
                        {dispatch.ngoArea})
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/55 flex items-center justify-between gap-2">
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      leftIcon={<LiveIcon icon={Navigation} motion="interaction" className="size-4" />}
                      onClick={() => handleAcceptDispatch(dispatch.id)}
                      disabled={progressStale || !dutyReady || dutyStatus !== "online" || dutySaving || !canGoOnDuty || Boolean(acceptingDispatchId) || Boolean(activeMission && activeMission.currentStage !== "completed")}
                      className="w-full justify-center font-semibold"
                    >
                      {acceptingDispatchId === dispatch.id ? tx("Assigning…") : tx("মিশন গ্রহণ করুন (Accept Mission)")}</Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Section 3: Walkie-Talkie Radio Feed */}
        {(activeTab === "all" || activeTab === "comms") && (
          <section id="comms" className="space-y-4">
            <h2 className="text-lg font-semibold text-ink-900 sm:text-xl">
              {tx("যোগাযোগ")}</h2>
            <p className="liquid-glass-card rounded-2xl p-5 text-sm">{tx("Radio ও GPS integration এখনও যুক্ত করা হয়নি। Mission-এর donor/NGO contact number দিয়ে যোগাযোগ করুন।")}</p>
          </section>
        )}

        {/* Section 4: Badges & Leaderboard */}
        {(activeTab === "all" || activeTab === "badges") && (
          <section id="badges" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-ink-900 sm:text-xl">
                  {tx("সংরক্ষিত rescue অবদান")}</h2>
                <p className="text-xs text-muted-600">
                  {tx("সম্পন্ন handover ও NGO-এর distribution record থেকে হিসাব।")}</p>
              </div>
              <ButtonLink
                href={ROUTES.volunteer.idCard}
                variant="outline"
                size="sm"
                leftIcon={<ShieldCheck className="size-4" />}
                className="font-bold"
              >
                {tx("ভলান্টিয়ার প্রোফাইল দেখুন")}</ButtonLink>
            </div>
            <VolunteerBadges />
          </section>
        )}

        {/* SOS Modal */}
        <SosModal
          isOpen={isSosOpen}
          onClose={() => setIsSosOpen(false)}
          onSubmitReport={(reason, delayMins) => {
            broadcastSos(reason, delayMins);
            setIsSosOpen(false);
          }}
        />
      </div>
    </PortalShell>
  );
}
