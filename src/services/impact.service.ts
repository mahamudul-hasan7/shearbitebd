import { apiRequest } from "@/services/http";
import type { ImpactRecord, ViewerContext } from "@/types/domain";
import { type MockServiceOptions } from "@/services/shared";

export interface DonorImpactOverview {
  totalDonations: number;
  activeDonations: number;
  mealsRescued: number;
  ngosHelped: number;
  donorScore: number;
  donorScoreDescription: string;
  recentRecords: ImpactRecord[];
}

export interface NGOImpactOverview {
  mealsDistributed: number;
  beneficiariesServed: number;
  foodWeightKg: number;
  completedRescues: number;
  recentRecords: ImpactRecord[];
}

export type NGOImpactPeriod = "WEEK" | "MONTH" | "YEAR";

export interface NGOImpactAnalytics extends NGOImpactOverview {
  period: NGOImpactPeriod;
  periodStart: string;
  estimatedCo2PreventedKg: number;
  estimatedWaterSavedLitres: number;
  trend: Array<{ label: string; meals: number; beneficiaries: number }>;
  topAreas: Array<{ area: string; distributions: number; beneficiaries: number }>;
}

export const impactService = {
  getDonorOverview(id: string, viewer: ViewerContext, options?: MockServiceOptions): Promise<DonorImpactOverview> {
    void id; void viewer; return apiRequest("/api/impact", { signal: options?.signal });
  },
  getNgoOverview(id: string, viewer: ViewerContext, options?: MockServiceOptions): Promise<NGOImpactOverview> {
    void id; void viewer; return apiRequest("/api/impact", { signal: options?.signal });
  },
  getNgoAnalytics(id: string, period: NGOImpactPeriod, viewer: ViewerContext, options?: MockServiceOptions): Promise<NGOImpactAnalytics> {
    void id; void viewer; return apiRequest(`/api/impact?period=${period}`, { signal: options?.signal });
  },
};
