import type { DistributionRecord, ViewerContext } from "@/types/domain";
import type { MockServiceOptions } from "@/services/shared";
import { apiRequest } from "@/services/http";

export interface CreateDistributionInput {
  beneficiariesServed: number;
  mealsDistributed: number;
  adultsServed?: number;
  childrenServed?: number;
  distributedAt: string;
  addressId: string;
  notes?: string;
  photoNames: string[];
  photoUrls?: string[];
  beneficiaryConsentConfirmed: boolean;
}
export const distributionService = {
  async getContext(claimId: string, options?: MockServiceOptions): Promise<{ distribution: DistributionRecord | null; serverTime: string }> {
    return apiRequest(`/api/distributions?claimId=${encodeURIComponent(claimId)}`, { signal: options?.signal });
  },
  async getByClaimId(claimId: string, viewer: ViewerContext, options?: MockServiceOptions): Promise<DistributionRecord | undefined> {
    void viewer;
    return (await apiRequest<{ distribution: DistributionRecord | null }>(`/api/distributions?claimId=${encodeURIComponent(claimId)}`, { signal: options?.signal })).distribution || undefined;
  },
  async create(claimId: string, input: CreateDistributionInput, viewer: ViewerContext, options?: MockServiceOptions): Promise<DistributionRecord> {
    void viewer;
    return (await apiRequest<{ distribution: DistributionRecord }>("/api/distributions", { method: "POST", signal: options?.signal, body: JSON.stringify({ claimId, input }) })).distribution;
  },
};
