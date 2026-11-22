"use client";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PortalShell } from "@/components/layout/portal-shell";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useVolunteerStore } from "@/features/volunteer-dashboard/volunteer-store";
import { ROUTES } from "@/lib/routes";

export function VolunteerDispatchesView() {
  const tx = useUiText();
  const router = useRouter();
  const { dispatches, activeMission, profile, dutyReady, dutyStatus, dutySaving, canGoOnDuty, acceptDispatch, syncWithUserSession, fetchDispatches } = useVolunteerStore();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState("");
  const acceptingRef = useRef(false);
  useEffect(() => {
    let cancelled = false;
    syncWithUserSession().catch((e: Error) => { if (!cancelled) setError(e.message); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [syncWithUserSession]);
  async function refresh() {
    setLoading(true); setError("");
    try { await fetchDispatches(); } catch (e) { setError(e instanceof Error ? e.message : "Dispatches could not load."); }
    finally { setLoading(false); }
  }
  async function accept(id: string) {
    if (acceptingRef.current || loading || error) return;
    acceptingRef.current = true;
    setAccepting(id); setError("");
    try { const mission = await acceptDispatch(id); router.push(ROUTES.volunteer.mission(mission.id)); }
    catch (e) { setError(e instanceof Error ? e.message : "Assignment failed."); setAccepting(""); }
    finally { acceptingRef.current = false; }
  }
  return <PortalShell role="volunteer" activeHref={ROUTES.volunteer.dispatches} title={tx("Available dispatches")} description={tx("NGO-claimed খাবার পৌঁছে দেওয়ার জন্য mission গ্রহণ করুন।")} profileName={profile.fullName} profileDescription={profile.role} avatarInitials={profile.avatarInitials}>
    <div className="grid gap-6">
      <div><Button variant="outline" disabled={loading} onClick={() => void refresh()}>{loading ? tx("Loading…") : tx("Refresh dispatches")}</Button></div>
      {error && <p role="alert" className="rounded-2xl bg-red-50 p-4 text-red-700">{tx(error)}</p>}
      {dutyReady && dutyStatus === "offline" && <p role="status" className="rounded-xl bg-slate-100 p-4 text-sm text-slate-700">{tx("Turn duty ON before accepting a new mission.")}</p>}
      {activeMission && activeMission.currentStage !== "completed" && <Card><CardHeader title={tx("Your assigned mission")} description={activeMission.foodTitle} /><CardContent><ButtonLink href={ROUTES.volunteer.mission(activeMission.id)}>{tx("Continue mission")}</ButtonLink></CardContent></Card>}
      {!loading && !dispatches.length && <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">{tx("এখন কোনো available dispatch নেই। NGO claim করলে এখানে দেখা যাবে।")}</p>}
      <div className="grid gap-5 sm:grid-cols-2">
        {dispatches.map((dispatch) => <Card key={dispatch.id} data-dispatch-id={dispatch.id}><CardHeader title={dispatch.foodType} description={dispatch.donorName} /><CardContent className="grid gap-4">
          <p className="font-semibold">{dispatch.quantity} · {dispatch.servings} {" "}{tx("declared meals")}</p>
          <p className="text-sm">{tx("Pickup:")}{" "}{dispatch.donorArea}<br />{tx("Deliver to:")}{" "}{dispatch.ngoName} · {dispatch.ngoArea}</p>
          <p className="text-sm">{tx("Safe deadline remaining:")}{" "}{dispatch.expiresInMins} {" "}{tx("minutes")}</p>
          <Button disabled={loading || Boolean(error) || !dutyReady || dutyStatus !== "online" || dutySaving || !canGoOnDuty || Boolean(accepting) || Boolean(activeMission && activeMission.currentStage !== "completed")} onClick={() => void accept(dispatch.id)}>{accepting === dispatch.id ? tx("Assigning…") : tx("Accept mission")}</Button>
        </CardContent></Card>)}
      </div>
    </div>
  </PortalShell>;
}
