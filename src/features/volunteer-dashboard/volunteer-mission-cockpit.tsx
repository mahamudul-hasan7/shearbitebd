"use client";
import { getUiLocale } from "@/lib/i18n/locale";
import { useUiText } from "@/lib/i18n/use-ui-text";

import { useEffect, useState, type FormEvent } from "react";
import { RescueLocationMap } from "@/components/maps/rescue-location-map";
import { RescueProgress } from "@/components/progress/rescue-progress";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { PortalShell } from "@/components/layout/portal-shell";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useVolunteerStore } from "@/features/volunteer-dashboard/volunteer-store";
import type { MissionStage } from "@/features/volunteer-dashboard/volunteer-types";
import { IncidentPanel } from "@/features/incidents/incident-panel";
import { ROUTES } from "@/lib/routes";

const LABELS: Record<MissionStage, string> = {
  assigned: "Mission assigned", en_route_pickup: "Travelling to pickup", at_pickup: "At donor location",
  cargo_loaded: "Pickup verified", en_route_dropoff: "Travelling to NGO", completed: "Delivery verified",
};
export function VolunteerMissionCockpit({ missionId }: { missionId: string }) {
  const tx = useUiText();
  const { activeMission, profile, syncWithUserSession, loadMission, advanceStage, verifyOtp } = useVolunteerStore();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [stale, setStale] = useState(false);
  const [pin, setPin] = useState("");
  const [notice, setNotice] = useState<{ success: boolean; message: string }>();
  useEffect(() => {
    const controller = new AbortController();
    let inFlight = true;
    syncWithUserSession(undefined, undefined, controller.signal).then(() => loadMission(missionId, controller.signal))
      .then(() => { if (!controller.signal.aborted) setStale(false); })
      .catch((error: Error) => { if (!controller.signal.aborted) { setStale(true); setNotice({ success: false, message: error.message }); } })
      .finally(() => { inFlight = false; if (!controller.signal.aborted) setLoading(false); });
    const poll = async () => {
      if (inFlight || controller.signal.aborted || document.visibilityState !== "visible") return;
      inFlight = true;
      try { await loadMission(missionId, controller.signal); if (!controller.signal.aborted) setStale(false); }
      catch { if (!controller.signal.aborted) setStale(true); }
      finally { inFlight = false; }
    };
    const timer = window.setInterval(() => { void poll(); }, 5_000);
    window.addEventListener("focus", poll);
    return () => { controller.abort(); window.clearInterval(timer); window.removeEventListener("focus", poll); };
  }, [missionId, syncWithUserSession, loadMission]);
  const mission = activeMission?.id === missionId || activeMission?.claimId === missionId ? activeMission : null;
  const pickup = mission ? ["assigned", "en_route_pickup", "at_pickup"].includes(mission.currentStage) : false;
  const next: Partial<Record<MissionStage, MissionStage>> = { assigned: "en_route_pickup", en_route_pickup: "at_pickup", cargo_loaded: "en_route_dropoff" };
  async function progress(stage: MissionStage) {
    setBusy(true); setNotice(undefined);
    try { await advanceStage(stage); }
    catch (error) { setNotice({ success: false, message: error instanceof Error ? error.message : "Stage update failed." }); }
    finally { setBusy(false); }
  }
  async function verify(event: FormEvent) {
    event.preventDefault(); setBusy(true);
    try {
      const result = await verifyOtp(pin); setNotice(result);
      if (result.success) setPin("");
    } finally { setBusy(false); }
  }
  return <PortalShell role="volunteer" activeHref={ROUTES.volunteer.dispatches} title={tx("Rescue mission")} description={tx("Pickup ও delivery-এর প্রতিটি handover server-এ যাচাই করুন।")} profileName={profile.fullName} profileDescription={profile.role} avatarInitials={profile.avatarInitials}>
    <div className="mx-auto grid max-w-4xl gap-6">
      {loading && <LoadingSpinner label={tx("Loading assigned mission…")} />}
      {notice && <p role="status" className={`rounded-2xl border p-4 ${notice.success ? "border-emerald-300 bg-emerald-50" : "border-red-300 bg-red-50"}`}>{tx(notice.message)}</p>}
      {!loading && !mission && <ButtonLink href={ROUTES.volunteer.dispatches}>{tx("Return to dispatches")}</ButtonLink>}
      {!loading && mission && <>
        <ButtonLink href={ROUTES.volunteer.reportIssue(mission.id)} variant="outline">{tx("Report an issue / history")}</ButtonLink>
        {mission.incidentPaused && <p className="rounded-xl bg-amber-50 p-4 font-semibold text-amber-900">{tx("Incident hold: mission progression ও handover থামানো আছে। Admin/operator review প্রয়োজন।")}</p>}
        {mission.claimId && <IncidentPanel claimId={mission.claimId} />}
        <Card><CardHeader title={mission.foodTitle} description={tx(LABELS[mission.currentStage])} /><CardContent className="grid gap-4">
          <p className="font-semibold">{mission.quantity} · {mission.servings} {" "}{tx("declared meals")}</p>
          <p>{tx("Donor-declared safe deadline:")}{" "}{new Date(mission.safeDeadline).toLocaleString(getUiLocale())}</p>
          <RescueProgress scope="rider" status={mission.claimStatus ?? "ASSIGNED"} routeStage={mission.currentStage} assignedAt={mission.assignedAt} pickedUpAt={mission.pickedUpAt} deliveredAt={mission.deliveredAt} updatedAt={mission.updatedAt} stale={stale} />
          {!mission.incidentPaused && !["CANCELLED", "EXPIRED"].includes(mission.claimStatus || "") && next[mission.currentStage] && <Button disabled={busy} onClick={() => void progress(next[mission.currentStage]!)}>{tx(LABELS[next[mission.currentStage]!])}</Button>}
        </CardContent></Card>
        <Card><CardHeader title={tx("Mission map & navigation")} /><CardContent><RescueLocationMap pickup={mission.pickupCoordinates} delivery={mission.dropoffCoordinates} pickupLabel={`${mission.donorAddress}, ${mission.donorArea}`} deliveryLabel={`${mission.ngoAddress}, ${mission.ngoArea}`} /></CardContent></Card>
        <div className="grid gap-5 sm:grid-cols-2">
          <Card><CardHeader title={tx("Pickup from donor")} description={mission.donorName} /><CardContent className="grid gap-3"><p>{mission.donorAddress}</p><p>{mission.donorContact}</p>{mission.donorPhone && <a href={`tel:${mission.donorPhone}`} className="font-bold text-emerald-700">{mission.donorPhone}</a>}</CardContent></Card>
          <Card><CardHeader title={tx("Deliver to NGO")} description={mission.ngoName} /><CardContent className="grid gap-3"><p>{mission.ngoAddress || mission.ngoArea}</p><p>{mission.ngoContact}</p>{mission.ngoPhone && <a href={`tel:${mission.ngoPhone}`} className="font-bold text-emerald-700">{mission.ngoPhone}</a>}</CardContent></Card>
        </div>
        {mission.incidentPaused || ["CANCELLED", "EXPIRED"].includes(mission.claimStatus || "") ? null : mission.currentStage === "completed" ? <Card><CardHeader title={tx("Delivery verified")} description={tx("এই handover database-এ সংরক্ষিত। NGO এখন receipt ও distribution record জমা দিতে পারবেন।")} /><CardContent><ButtonLink href={ROUTES.volunteer.history}>{tx("View mission history")}</ButtonLink></CardContent></Card> : <Card><CardHeader title={pickup ? tx("Verify pickup code") : tx("Verify delivery code")} description={pickup ? tx("খাবার হাতে নেওয়ার সময় donor-এর কাছ থেকে ছয় সংখ্যার code নিন।") : tx("খাবার পৌঁছে দেওয়ার সময় NGO-এর কাছ থেকে ছয় সংখ্যার code নিন।")} /><CardContent>
          <form onSubmit={verify} className="grid gap-4">
            <Input label={tx("Six-digit handover code")} autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} />
            <Button type="submit" disabled={busy || pin.length !== 6}>{busy ? tx("Verifying…") : pickup ? tx("Confirm pickup") : tx("Confirm delivery")}</Button>
            <p className="text-xs text-muted-600">{tx("Code একবার ব্যবহারযোগ্য। Expired বা attempt limit পূর্ণ হলে donor/NGO-এর কাছ থেকে replacement নিন।")}</p>
          </form>
        </CardContent></Card>}
      </>}
    </div>
  </PortalShell>;
}
