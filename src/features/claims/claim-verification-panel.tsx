"use client";
import { HandoverCodePanel } from "@/components/donation/handover-code-panel";
import type { Claim } from "@/types/domain";
export function ClaimVerificationPanel({ claim }: { claim: Claim }) {
  return <HandoverCodePanel claimId={claim.id} kind="DELIVERY" />;
}
