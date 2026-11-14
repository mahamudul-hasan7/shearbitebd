import { apiRequest } from "@/services/http";

export type HandoverKind = "PICKUP" | "DELIVERY";
export interface HandoverChallengeState {
  kind: HandoverKind;
  canIssue: boolean;
  issuedAt?: string;
  expiresAt?: string;
  consumedAt?: string;
  attemptsRemaining: number;
  reissueAfter: string | null;
}
export const handoverService = {
  state: (claimId: string) => apiRequest<{ challenges: HandoverChallengeState[] }>(`/api/handovers?claimId=${encodeURIComponent(claimId)}`),
  issue: (claimId: string, kind: HandoverKind) => apiRequest<{ code: string; expiresAt: string; reissueAfter: string }>("/api/handovers", { method: "POST", body: JSON.stringify({ action: "issue", claimId, kind }) }),
  verify: (claimId: string, kind: HandoverKind, code: string) => apiRequest<{ status: string }>("/api/handovers", { method: "POST", body: JSON.stringify({ action: "verify", claimId, kind, code }) }),
};
