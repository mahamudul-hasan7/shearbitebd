import { VerificationStatus } from "@/lib/constants/domain";
import { mockAppStore } from "@/store/mock-app-store";
import type { Address, NGOProfile } from "@/types/domain";
import { MockApiError, simulateRequest, type MockServiceOptions } from "@/services/shared";

export interface NGODirectoryItem {
  profile: NGOProfile;
  addresses: Address[];
}

function createDirectoryItem(profile: NGOProfile): NGODirectoryItem {
  const state = mockAppStore.getSnapshot();
  return {
    profile: { ...profile, beneficiaryTypes: [...profile.beneficiaryTypes], addressIds: [...profile.addressIds], serviceAreas: [...profile.serviceAreas] },
    addresses: state.addresses.filter((address) => profile.addressIds.includes(address.id)).map((address) => ({ ...address, coordinates: address.coordinates ? { ...address.coordinates } : undefined })),
  };
}

export const ngoService = {
  listVerified(options?: MockServiceOptions): Promise<NGODirectoryItem[]> {
    return simulateRequest(() => mockAppStore.getSnapshot().ngoProfiles
      .filter((profile) => profile.verificationStatus === VerificationStatus.VERIFIED)
      .sort((left, right) => right.completedRescues - left.completedRescues)
      .map(createDirectoryItem), options);
  },

  getById(id: string, options?: MockServiceOptions): Promise<NGODirectoryItem> {
    return simulateRequest(() => {
      const profile = mockAppStore.getSnapshot().ngoProfiles.find((item) => item.id === id);
      if (!profile) throw new MockApiError({ code: "NOT_FOUND", message: "NGO profile not found.", status: 404, retryable: false });
      return createDirectoryItem(profile);
    }, options);
  },
};
