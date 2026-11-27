"use client";
import { RescueProgress } from "@/components/progress/rescue-progress";
import type { DonationStatus } from "@/lib/constants/statuses";
import type { Claim } from "@/types/domain";

export function DonationStatusTimeline({ status, claim, publishedAt, updatedAt, cancellationReason, stale = false, compact = false }: {
  status: DonationStatus; claim?: Claim; publishedAt?: string; updatedAt?: string; cancellationReason?: string; stale?: boolean; compact?: boolean;
}) {
  // Releasing a claim reopens the food; its cancelled journey belongs to NGO history.
  const currentClaim = status === "AVAILABLE" && claim?.status === "CANCELLED" ? undefined : claim;
  const claimIsNewer = currentClaim && (!updatedAt || Date.parse(currentClaim.updatedAt) >= Date.parse(updatedAt));
  return <RescueProgress scope="donation" status={claimIsNewer ? currentClaim.status : status} routeStage={currentClaim?.routeStage}
    publishedAt={publishedAt} reservedAt={currentClaim?.reservedAt} assignedAt={currentClaim?.assignedAt} pickedUpAt={currentClaim?.pickedUpAt}
    deliveredAt={currentClaim?.deliveredAt} distributedAt={currentClaim?.distributedAt} updatedAt={claimIsNewer ? currentClaim.updatedAt : updatedAt}
    cancellationReason={cancellationReason} stale={stale} compact={compact} label="Donation lifecycle progress" />;
}
