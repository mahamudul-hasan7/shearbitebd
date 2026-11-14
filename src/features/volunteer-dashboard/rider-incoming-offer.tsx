"use client";
import { LiveIcon } from "@/components/motion/live-icon";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Bike, Check, Clock3, MapPin, PackageOpen, RefreshCw, X } from "lucide-react";
import { useMockAuth } from "@/features/auth/mock-auth";
import { getClientSession } from "@/features/auth/client-session";
import { useLanguage } from "@/lib/i18n/language-context";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { apiRequest } from "@/services/http";
import { ROUTES } from "@/lib/routes";
import { useVolunteerStore } from "./volunteer-store";
import type { AvailableDispatch, VolunteerMission } from "./volunteer-types";
import type { VolunteerDuty } from "./volunteer-duty";
import styles from "./rider-incoming-offer.module.css";

type Offer = { owner: string; item: AvailableDispatch; available: boolean };
type DispatchResponse = { dispatches: AvailableDispatch[]; duty: VolunteerDuty };
const storageKey = (owner: string) => `sharebite.rider-offers.${owner}`;

export function RiderIncomingOffer() {
  const tx = useUiText();
  const router = useRouter();
  const { language } = useLanguage();
  const locale = language === "bn" ? "bn-BD" : "en-BD";
  const { session } = useMockAuth();
  const { dutyReady, dutyStatus, dutySaving, canGoOnDuty, dutyHasActiveMission, activeMission, fetchDispatches } = useVolunteerStore();
  const owner = session?.role === "VOLUNTEER" ? session.id : undefined;
  const eligible = Boolean(owner && dutyReady && dutyStatus === "online" && canGoOnDuty && !dutySaving && !dutyHasActiveMission && (!activeMission || activeMission.currentStage === "completed"));
  const [offer, setOffer] = useState<Offer>();
  const [accepting, setAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState("");
  const [refreshError, setRefreshError] = useState("");
  const currentOffer = useRef<Offer | undefined>(undefined);
  const dismissed = useRef(new Set<string>());
  const busy = useRef(false);
  const closing = useRef(false);
  const alive = useRef(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLButtonElement>(null);
  const animations = useRef<Animation[]>([]);
  const visible = offer?.owner === owner && eligible ? offer : undefined;
  const offerId = visible?.item.id;

  function updateOffer(value?: Offer) { currentOffer.current = value; setOffer(value); }
  function refresh() { window.dispatchEvent(new Event("sharebite:rider-offers-refresh")); }
  async function close(force = false) {
    const current = dialog.current;
    if (!current?.open || closing.current || (busy.current && !force)) return false;
    closing.current = true;
    const elements = [backdrop.current,panel.current].filter((e): e is HTMLButtonElement | HTMLDivElement => Boolean(e));
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const starts = elements.map(e => ({ opacity:getComputedStyle(e).opacity, transform:getComputedStyle(e).transform }));
      animations.current.forEach(a => a.cancel());
      animations.current = elements.map((e,index) => e.animate([starts[index],{opacity:0,transform:index === 1 ? "translateY(18px)" : "none"}],{duration:160,easing:"ease-in",fill:"forwards"}));
      await Promise.allSettled(animations.current.map(a => a.finished));
    }
    if (dialog.current !== current || !current.open) return false;
    current.close(); return true;
  }
  async function dismiss() {
    const current = currentOffer.current;
    if (!current || !await close()) return;
    dismissed.current.add(current.item.id);
    try { sessionStorage.setItem(storageKey(current.owner),JSON.stringify([...dismissed.current].slice(-100))); } catch {}
    updateOffer(undefined); setAcceptError(""); setRefreshError("");
  }
  async function finishAssignment(claimId: string, userId: string) {
    if (!alive.current || getClientSession()?.id !== userId) return;
    // Assignment is already committed. A failed background refresh must not undo it.
    void fetchDispatches().catch(() => {});
    await close(true);
    if (!alive.current || getClientSession()?.id !== userId) return;
    updateOffer(undefined);
    router.push(ROUTES.volunteer.mission(`mission-${claimId}`));
  }
  async function accept() {
    const current = currentOffer.current;
    if (!current?.available || !current.item.claimId || busy.current || !eligible || refreshError) return;
    busy.current = true; setAccepting(true); setAcceptError("");
    try {
      const result = await apiRequest<{claimId:string}>("/api/dispatches",{method:"POST",body:JSON.stringify({claimId:current.item.claimId})});
      await finishAssignment(result.claimId,current.owner);
    } catch (error) {
      // Recover a committed assignment if the response was interrupted.
      const own = await apiRequest<{activeMission:VolunteerMission | null}>("/api/missions").catch(() => undefined);
      if (own?.activeMission?.claimId === current.item.claimId) await finishAssignment(current.item.claimId,current.owner);
      else if (alive.current && getClientSession()?.id === current.owner) {
        setAcceptError(error instanceof Error ? error.message : "Mission could not be assigned.");
        refresh();
      }
    } finally { busy.current = false; if (alive.current) setAccepting(false); }
  }

  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useEffect(() => {
    if (!owner || !eligible) { updateOffer(undefined); return; }
    const userId = owner;
    const controller = new AbortController();
    let inFlight = false;
    try { const saved: unknown = JSON.parse(sessionStorage.getItem(storageKey(owner)) || "[]"); dismissed.current = new Set(Array.isArray(saved) ? saved.filter((id): id is string => typeof id === "string") : []); } catch { dismissed.current = new Set(); }
    async function load() {
      if (inFlight || controller.signal.aborted || document.visibilityState !== "visible") return;
      inFlight = true;
      try {
        const result = await apiRequest<DispatchResponse>("/api/dispatches",{signal:controller.signal});
        if (controller.signal.aborted || getClientSession()?.id !== userId || busy.current || closing.current) return;
        const duty = result.duty;
        if (duty.volunteerProfileId !== getClientSession()?.volunteerProfileId || !duty.isOnDuty || !duty.canGoOnDuty || duty.hasActiveMission) { updateOffer(undefined); return; }
        setRefreshError("");
        const current = currentOffer.current;
        if (current && current.owner === userId) {
          const live = result.dispatches.find(item => item.id === current.item.id && item.claimId);
          updateOffer({owner:userId,item:live || current.item,available:Boolean(live)});
        } else {
          if (document.querySelector('dialog[open], [role="dialog"][aria-modal="true"]')) return;
          const next = result.dispatches.find(item => item.claimId && !dismissed.current.has(item.id));
          if (next) { setAcceptError(""); updateOffer({owner:userId,item:next,available:true}); }
        }
      } catch {
        if (!controller.signal.aborted && currentOffer.current?.owner === userId && !busy.current) setRefreshError("The job could not be refreshed. Check again before accepting.");
      } finally { inFlight = false; }
    }
    void load();
    const timer = window.setInterval(() => { void load(); },5000);
    const onRefresh = () => { void load(); };
    window.addEventListener("focus",onRefresh); window.addEventListener("sharebite:rider-offers-refresh",onRefresh); document.addEventListener("visibilitychange",onRefresh);
    return () => { controller.abort(); window.clearInterval(timer); window.removeEventListener("focus",onRefresh); window.removeEventListener("sharebite:rider-offers-refresh",onRefresh); document.removeEventListener("visibilitychange",onRefresh); };
  }, [owner,eligible]);

  useEffect(() => {
    if (!offerId) return;
    const current = dialog.current;
    const focused = document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
    const previous = document.body.style.overflow;
    closing.current = false;
    current?.showModal(); document.body.style.overflow = "hidden";
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (panel.current) animations.current.push(panel.current.animate([{opacity:0,transform:"translateY(28px) scale(.98)"},{opacity:1,transform:"translateY(0) scale(1)"}],{duration:240,easing:"cubic-bezier(.16,1,.3,1)",fill:"both"}));
      if (backdrop.current) animations.current.push(backdrop.current.animate([{opacity:0},{opacity:1}],{duration:180,fill:"both"}));
    }
    return () => { animations.current.forEach(a => a.cancel()); animations.current = []; current?.close(); document.body.style.overflow = previous; closing.current = false; focused?.focus({preventScroll:true}); };
  }, [offerId]);

  if (!visible) return null;
  const { item, available } = visible;
  return <dialog ref={dialog} className={styles.dialog} aria-labelledby="rider-offer-title" aria-describedby="rider-offer-description" data-testid="rider-incoming-offer" data-dispatch-id={item.id} onCancel={event => { event.preventDefault(); void dismiss(); }}>
    <button ref={backdrop} type="button" tabIndex={-1} className={styles.backdrop} aria-label={tx("Dismiss delivery offer")} disabled={accepting} onClick={() => {void dismiss();}} />
    <div ref={panel} className={styles.panel}>
      <div className={styles.header}><span className={styles.bike}><LiveIcon icon={Bike} motion="once" size={26} strokeWidth={1.7} aria-hidden="true" /></span><div><p>{tx("Rider delivery offer")}</p><h2 id="rider-offer-title">{tx(available ? "A food delivery needs you" : "This job is no longer available")}</h2></div><button type="button" autoFocus className={styles.close} aria-label={tx("Dismiss delivery offer")} disabled={accepting} onClick={() => {void dismiss();}}><X size={20} aria-hidden="true" /></button></div>
      <div className={styles.content}>
        <div className={styles.food}><PackageOpen size={21} aria-hidden="true" /><div><h3>{item.foodType}</h3><p>{tx("{0} meals declared by the donor",item.servings.toLocaleString(locale))}</p></div></div>
        <ol className={styles.route}><li><span className={styles.pickupDot} aria-hidden="true" /><div><span>{tx("Collect from")}</span><strong>{item.donorName}</strong><p>{item.donorArea}</p></div></li><li><span className={styles.dropoffDot} aria-hidden="true"><MapPin size={13} /></span><div><span>{tx("Deliver to NGO")}</span><strong>{item.ngoName}</strong><p>{item.ngoArea}</p></div></li></ol>
        <div className={styles.deadline}><Clock3 size={16} aria-hidden="true" />{tx(item.expiresInMins > 0 ? "Pickup window: about {0} minutes left" : "Pickup window: less than a minute left",item.expiresInMins.toLocaleString(locale))}</div>
        <p id="rider-offer-description" className={styles.note}>{tx("Exact addresses and contact details open after you accept. Other riders can also take this job.")}</p>
        {(acceptError || refreshError) && <div role="alert" className={styles.error}><span>{tx(acceptError || refreshError)}</span>{refreshError && <button type="button" onClick={refresh}><RefreshCw size={15} aria-hidden="true" />{tx("Retry")}</button>}</div>}
      </div>
      <div className={styles.actions}><button type="button" className={styles.accept} aria-busy={accepting} disabled={accepting || !available || Boolean(refreshError)} onClick={() => {void accept();}}>{accepting ? <><span className={styles.spinner} aria-hidden="true" />{tx("Confirming your delivery job…")}</> : <>{tx("Take this delivery")}<ArrowRight size={19} aria-hidden="true" /></>}</button><button type="button" className={styles.later} disabled={accepting} onClick={() => {void dismiss();}}>{available ? tx("Not now; keep it in the list") : <><Check size={16} aria-hidden="true" />{tx("Got it")}</>}</button></div>
    </div>
  </dialog>;
}
