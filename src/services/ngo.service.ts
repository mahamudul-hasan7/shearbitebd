import { VerificationStatus } from "@/lib/constants/domain";
import { MockApiError, simulateRequest, type MockServiceOptions } from "@/services/shared";
import { mockAppStore } from "@/store/mock-app-store";
import type { Address, NGOProfile } from "@/types/domain";

export interface NGOImpactSummary {
  peopleHelped: number;
  completedRescues: number;
  recentMealsDistributed: number;
  recentFoodRescuedKg: number;
  estimatedCo2PreventedKg: number;
}

export interface NGORecentActivity {
  id: string;
  title: string;
  description: string;
  occurredAt: string;
}

export interface NGODirectoryItem {
  profile: NGOProfile;
  addresses: Address[];
  impact: NGOImpactSummary;
  recentActivities: NGORecentActivity[];
}

function cloneProfile(profile: NGOProfile): NGOProfile {
  return {
    ...profile,
    values: [...profile.values],
    beneficiaryTypes: [...profile.beneficiaryTypes],
    acceptedFoodCategories: [...profile.acceptedFoodCategories],
    addressIds: [...profile.addressIds],
    serviceAreas: [...profile.serviceAreas],
    galleryUrls: [...profile.galleryUrls],
  };
}

function createDirectoryItem(profile: NGOProfile): NGODirectoryItem {
  const state = mockAppStore.getSnapshot();
  const impactRecords = state.impactRecords.filter((record) => record.ngoProfileId === profile.id).sort((left, right) => Date.parse(right.recordedAt) - Date.parse(left.recordedAt));
  const impact = impactRecords.reduce<NGOImpactSummary>((summary, record) => ({
    ...summary,
    recentMealsDistributed: summary.recentMealsDistributed + record.mealsRescued,
    recentFoodRescuedKg: summary.recentFoodRescuedKg + record.foodWeightKg,
    estimatedCo2PreventedKg: summary.estimatedCo2PreventedKg + record.estimatedCo2PreventedKg,
  }), { peopleHelped: profile.peopleHelped, completedRescues: profile.completedRescues, recentMealsDistributed: 0, recentFoodRescuedKg: 0, estimatedCo2PreventedKg: 0 });

  return {
    profile: cloneProfile(profile),
    addresses: state.addresses.filter((address) => profile.addressIds.includes(address.id)).map((address) => ({ ...address, coordinates: address.coordinates ? { ...address.coordinates } : undefined })),
    impact,
    recentActivities: impactRecords.slice(0, 4).map((record) => ({
      id: `ngo-activity-${record.id}`,
      title: `${record.mealsRescued} meals added to the rescue record`,
      description: `${record.beneficiariesServed} people served and ${record.foodWeightKg} kg of food recorded as rescued. Environmental values remain estimated.`,
      occurredAt: record.recordedAt,
    })),
  };
}

export const ngoService = {
  listVerified(options?: MockServiceOptions): Promise<NGODirectoryItem[]> {
    return simulateRequest(() => mockAppStore.getSnapshot().ngoProfiles.filter((profile) => profile.verificationStatus === VerificationStatus.VERIFIED).sort((left, right) => right.completedRescues - left.completedRescues).map(createDirectoryItem), options);
  },

  getById(id: string, options?: MockServiceOptions): Promise<NGODirectoryItem> {
    return simulateRequest(() => {
      const profile = mockAppStore.getSnapshot().ngoProfiles.find((item) => item.id === id);
      if (!profile) throw new MockApiError({ code: "NOT_FOUND", message: "NGO profile not found.", status: 404, retryable: false });
      if (profile.verificationStatus !== VerificationStatus.VERIFIED) throw new MockApiError({ code: "FORBIDDEN", message: "This NGO profile is not available in the verified donor directory.", status: 403, retryable: false });
      return createDirectoryItem(profile);
    }, options);
  },
};
