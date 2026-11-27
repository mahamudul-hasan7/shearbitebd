import type { TransportMethod, VerificationStatus } from "@/lib/constants/domain";
import type { ClaimStatus } from "@/lib/constants/statuses";
import type { Address, Claim, DonationView, ViewerContext } from "@/types/domain";
import type { MockServiceOptions } from "@/services/shared";
import { apiRequest } from "@/services/http";

export interface ClaimListQuery { ngoProfileId?: string; volunteerProfileId?: string; donationId?: string; statuses?: ClaimStatus[]; }
export interface CreateClaimInput { donationId: string; ngoProfileId: string; matchScore: number; }
export interface ClaimVolunteerSummary { id: string; displayName: string; phone?: string; verificationStatus: VerificationStatus; transportMethod: TransportMethod; completedRescues: number; }
export interface ClaimCoordinationDetails { receiverNgo?: {name: string; contactName?: string; contactPhone?: string}; receiptRecorded?: boolean; distributionBlocked?: boolean; distributionRecorded?: boolean; claim: Claim; donation: DonationView; donorOrganization: string; donorVerified: boolean; volunteer?: ClaimVolunteerSummary; deliveryAddress?: Address; }

export const claimService = {
  async list(query: ClaimListQuery = {}, options?: MockServiceOptions): Promise<Claim[]> {
    const suffix = query.donationId ? `?donationId=${encodeURIComponent(query.donationId)}` : "";
    const { claims } = await apiRequest<{ claims: Claim[] }>(`/api/claims${suffix}`, { signal: options?.signal });
    return claims.filter((c) => !query.statuses?.length || query.statuses.includes(c.status));
  },
  async getById(id: string, options?: MockServiceOptions): Promise<Claim> {
    return (await apiRequest<{ claim: Claim }>(`/api/claims?id=${encodeURIComponent(id)}`, { signal: options?.signal })).claim;
  },
  async getCoordinationDetails(id: string, viewer: ViewerContext, options?: MockServiceOptions): Promise<ClaimCoordinationDetails> {
    void viewer; return (await apiRequest<{ details: ClaimCoordinationDetails }>(`/api/claims?id=${encodeURIComponent(id)}`, { signal: options?.signal })).details;
  },
  async create(input: CreateClaimInput, viewer: ViewerContext, options?: MockServiceOptions): Promise<Claim> {
    void viewer; return (await apiRequest<{ claim: Claim }>("/api/claims", { method: "POST", signal: options?.signal, body: JSON.stringify({ donationId: input.donationId }) })).claim;
  },
  async transitionStatus(id: string, status: ClaimStatus, viewer: ViewerContext, options?: MockServiceOptions): Promise<Claim> {
    void viewer; return (await apiRequest<{ claim: Claim }>("/api/claims", { method: "PATCH", signal: options?.signal, body: JSON.stringify({ id, status }) })).claim;
  },
};
