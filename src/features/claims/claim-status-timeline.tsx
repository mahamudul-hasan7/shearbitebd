"use client";
import { RescueProgress } from "@/components/progress/rescue-progress";
import type { Claim } from "@/types/domain";

export function ClaimStatusTimeline({ claim, cancellationReason, stale = false }: { claim: Claim; cancellationReason?: string; stale?: boolean }) {
  return <RescueProgress scope="claim" status={claim.status} routeStage={claim.routeStage} reservedAt={claim.reservedAt}
    assignedAt={claim.assignedAt} pickedUpAt={claim.pickedUpAt} deliveredAt={claim.deliveredAt}
    distributedAt={claim.distributedAt} updatedAt={claim.updatedAt} cancellationReason={cancellationReason} stale={stale} label="Claim progress" />;
}
