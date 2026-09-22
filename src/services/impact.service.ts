import { UserRole } from "@/lib/constants/roles";
import { DonationStatus } from "@/lib/constants/statuses";
import { mockAppStore } from "@/store/mock-app-store";
import type { ImpactRecord, ViewerContext } from "@/types/domain";
import { MockApiError, simulateRequest, type MockServiceOptions } from "@/services/shared";

const ACTIVE_DONATION_STATUSES = new Set<DonationStatus>([
  DonationStatus.PUBLISHED,
  DonationStatus.AVAILABLE,
  DonationStatus.RESERVED,
  DonationStatus.ASSIGNED,
  DonationStatus.PICKED_UP,
  DonationStatus.DELIVERED,
]);

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

function periodDays(period: NGOImpactPeriod) {
  if (period === "WEEK") return 7;
  if (period === "MONTH") return 30;
  return 365;
}

export const impactService = {
  getDonorOverview(donorProfileId: string, viewer: ViewerContext, options?: MockServiceOptions): Promise<DonorImpactOverview> {
    return simulateRequest(() => {
      if (viewer.donorProfileId !== donorProfileId && viewer.role !== UserRole.ADMIN) {
        throw new MockApiError({ code: "FORBIDDEN", message: "This impact summary belongs to another donor.", status: 403, retryable: false });
      }
      const state = mockAppStore.getSnapshot();
      const profile = state.donorProfiles.find((item) => item.id === donorProfileId);
      if (!profile) throw new MockApiError({ code: "NOT_FOUND", message: "Donor profile not found.", status: 404, retryable: false });

      const donations = state.donations.filter((donation) => donation.donorProfileId === donorProfileId);
      const recentRecords = state.impactRecords
        .filter((record) => record.donorProfileId === donorProfileId)
        .sort((left, right) => Date.parse(right.recordedAt) - Date.parse(left.recordedAt));
      const ngoIds = new Set(recentRecords.map((record) => record.ngoProfileId).filter((id): id is string => Boolean(id)));
      const donorScore = Math.min(100, Math.round((profile.rating ?? 4) * 18 + Math.min(profile.totalDonations, 50) * 0.2));

      return {
        totalDonations: profile.totalDonations,
        activeDonations: donations.filter((donation) => ACTIVE_DONATION_STATUSES.has(donation.status)).length,
        mealsRescued: recentRecords.reduce((total, record) => total + record.mealsRescued, 0),
        ngosHelped: ngoIds.size,
        donorScore,
        donorScoreDescription: "Mock platform metric based on verification, rescue history, and feedback. It is not a food-safety certification.",
        recentRecords: recentRecords.map((record) => ({ ...record })),
      };
    }, options);
  },

  getNgoOverview(ngoProfileId: string, viewer: ViewerContext, options?: MockServiceOptions): Promise<NGOImpactOverview> {
    return simulateRequest(() => {
      if (viewer.ngoProfileId !== ngoProfileId && viewer.role !== UserRole.ADMIN) {
        throw new MockApiError({ code: "FORBIDDEN", message: "This impact summary belongs to another NGO.", status: 403, retryable: false });
      }
      const state = mockAppStore.getSnapshot();
      const profile = state.ngoProfiles.find((item) => item.id === ngoProfileId);
      if (!profile) throw new MockApiError({ code: "NOT_FOUND", message: "NGO profile not found.", status: 404, retryable: false });
      const recentRecords = state.impactRecords.filter((record) => record.ngoProfileId === ngoProfileId).sort((left, right) => Date.parse(right.recordedAt) - Date.parse(left.recordedAt));
      return {
        mealsDistributed: recentRecords.reduce((total, record) => total + record.mealsRescued, 0),
        beneficiariesServed: recentRecords.reduce((total, record) => total + record.beneficiariesServed, 0),
        foodWeightKg: recentRecords.reduce((total, record) => total + record.foodWeightKg, 0),
        completedRescues: profile.completedRescues,
        recentRecords: recentRecords.map((record) => ({ ...record })),
      };
    }, options);
  },

  getNgoAnalytics(ngoProfileId: string, period: NGOImpactPeriod, viewer: ViewerContext, options?: MockServiceOptions): Promise<NGOImpactAnalytics> {
    return simulateRequest(() => {
      if (viewer.ngoProfileId !== ngoProfileId && viewer.role !== UserRole.ADMIN) {
        throw new MockApiError({ code: "FORBIDDEN", message: "This impact summary belongs to another NGO.", status: 403, retryable: false });
      }
      const state = mockAppStore.getSnapshot();
      const profile = state.ngoProfiles.find((item) => item.id === ngoProfileId);
      if (!profile) throw new MockApiError({ code: "NOT_FOUND", message: "NGO profile not found.", status: 404, retryable: false });
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - periodDays(period));
      const recentRecords = state.impactRecords
        .filter((record) => record.ngoProfileId === ngoProfileId && Date.parse(record.recordedAt) >= cutoff.getTime())
        .sort((left, right) => Date.parse(left.recordedAt) - Date.parse(right.recordedAt));
      const trend = recentRecords.map((record) => ({
        label: new Intl.DateTimeFormat("en-BD", { month: "short", day: "numeric" }).format(new Date(record.recordedAt)),
        meals: record.mealsRescued,
        beneficiaries: record.beneficiariesServed,
      }));
      const areaMap = new Map<string, { distributions: number; beneficiaries: number }>();
      for (const record of recentRecords) {
        const distribution = state.distributionRecords.find((item) => item.claimId === record.claimId);
        const area = state.addresses.find((item) => item.id === distribution?.addressId)?.area ?? "Other service area";
        const current = areaMap.get(area) ?? { distributions: 0, beneficiaries: 0 };
        areaMap.set(area, { distributions: current.distributions + 1, beneficiaries: current.beneficiaries + record.beneficiariesServed });
      }
      return {
        period, periodStart: cutoff.toISOString(), completedRescues: profile.completedRescues,
        mealsDistributed: recentRecords.reduce((total, record) => total + record.mealsRescued, 0),
        beneficiariesServed: recentRecords.reduce((total, record) => total + record.beneficiariesServed, 0),
        foodWeightKg: recentRecords.reduce((total, record) => total + record.foodWeightKg, 0),
        estimatedCo2PreventedKg: recentRecords.reduce((total, record) => total + record.estimatedCo2PreventedKg, 0),
        estimatedWaterSavedLitres: recentRecords.reduce((total, record) => total + (record.estimatedWaterSavedLitres ?? 0), 0),
        trend, recentRecords: recentRecords.slice().reverse(),
        topAreas: [...areaMap.entries()].map(([area, value]) => ({ area, ...value })).sort((left, right) => right.beneficiaries - left.beneficiaries),
      };
    }, options);
  },
};
