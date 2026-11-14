"use client";
import { useState } from "react";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { Button } from "@/components/ui/button";
import { RescueProgress } from "@/components/progress/rescue-progress";
import type { MissionStage, VolunteerMission } from "./volunteer-types";
export type { MissionStage } from "./volunteer-types";

export function DhakaRouteHud({ mission, onAdvanceStage, stale = false }: {
  mission: VolunteerMission; onAdvanceStage: (stage: MissionStage) => Promise<void> | void; onOpenSos: () => void; stale?: boolean;
}) {
  const tx = useUiText();
  const [busy, setBusy] = useState(false);
  const labels: Record<MissionStage, string> = { assigned: "Assigned", en_route_pickup: "Travelling to pickup", at_pickup: "At donor location", cargo_loaded: "Pickup verified", en_route_dropoff: "Travelling to NGO", completed: "Delivery verified" };
  const next: Partial<Record<MissionStage, MissionStage>> = { assigned: "en_route_pickup", en_route_pickup: "at_pickup", cargo_loaded: "en_route_dropoff" };
  const target = next[mission.currentStage];
  async function advance() {
    if (!target || busy) return;
    setBusy(true);
    try { await onAdvanceStage(target); } finally { setBusy(false); }
  }
  return <div className="grid min-w-0 gap-4">
    <RescueProgress scope="rider" status={mission.claimStatus ?? "ASSIGNED"} routeStage={mission.currentStage}
      assignedAt={mission.assignedAt} pickedUpAt={mission.pickedUpAt} deliveredAt={mission.deliveredAt} updatedAt={mission.updatedAt} stale={stale} />
    {target && !mission.incidentPaused && !["CANCELLED", "EXPIRED"].includes(mission.claimStatus ?? "") && <Button disabled={busy} onClick={() => void advance()}>{tx(labels[target])}</Button>}
    <p className="text-xs text-muted-600">{tx("Verify handover codes to confirm pickup and delivery.")}</p>
  </div>;
}
