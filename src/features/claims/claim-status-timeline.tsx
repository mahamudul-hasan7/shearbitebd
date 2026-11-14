"use client";
import { RescueProgress } from "@/components/progress/rescue-progress";
import type { Claim } from "@/types/domain";

export function ClaimStatusTimeline({ claim, stale = false }: { claim: Claim; stale?: boolean }) {
  return <RescueProgress scope="claim" status={claim.status} routeStage={claim.routeStage} reservedAt={claim.reservedAt}
    assignedAt={claim.assignedAt} pickedUpAt={claim.pickedUpAt} deliveredAt={claim.deliveredAt}
    distributedAt={claim.distributedAt} updatedAt={claim.updatedAt} stale={stale} label="Claim progress" />;
}
