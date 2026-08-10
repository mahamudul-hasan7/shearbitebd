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
};
