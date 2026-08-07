import { UserRole } from "@/lib/constants/roles";
import { mockAppStore } from "@/store/mock-app-store";
import type { Address, DonorProfile, NGOProfile, User, ViewerContext, VolunteerProfile } from "@/types/domain";
import { MockApiError, simulateRequest, type MockServiceOptions } from "@/services/shared";

export interface ProfileBundle {
  user: User;
  donorProfile?: DonorProfile;
  ngoProfile?: NGOProfile;
  volunteerProfile?: VolunteerProfile;
  addresses: Address[];
}

function createProfileBundle(user: User): ProfileBundle {
  const state = mockAppStore.getSnapshot();
  const donorProfile = state.donorProfiles.find((profile) => profile.userId === user.id);
  const ngoProfile = state.ngoProfiles.find((profile) => profile.userId === user.id);
  const volunteerProfile = state.volunteerProfiles.find((profile) => profile.userId === user.id);
  const addressIds = donorProfile?.addressIds ?? ngoProfile?.addressIds ?? (volunteerProfile ? [volunteerProfile.addressId] : []);
  return {
    user: { ...user },
    donorProfile: donorProfile ? { ...donorProfile, addressIds: [...donorProfile.addressIds] } : undefined,
    ngoProfile: ngoProfile ? { ...ngoProfile, addressIds: [...ngoProfile.addressIds], beneficiaryTypes: [...ngoProfile.beneficiaryTypes], serviceAreas: [...ngoProfile.serviceAreas] } : undefined,
    volunteerProfile: volunteerProfile ? { ...volunteerProfile, serviceAreas: [...volunteerProfile.serviceAreas], availability: [...volunteerProfile.availability] } : undefined,
    addresses: state.addresses.filter((address) => addressIds.includes(address.id)).map((address) => ({ ...address, coordinates: address.coordinates ? { ...address.coordinates } : undefined })),
  };
}

export const profileService = {
  getOwnProfile(userId: string, viewer: ViewerContext, options?: MockServiceOptions): Promise<ProfileBundle> {
    return simulateRequest(() => {
      if (viewer.userId !== userId && viewer.role !== UserRole.ADMIN) {
        throw new MockApiError({ code: "FORBIDDEN", message: "Private profile details are available only to the profile owner or an administrator.", status: 403, retryable: false });
      }
      const user = mockAppStore.getSnapshot().users.find((item) => item.id === userId);
      if (!user) throw new MockApiError({ code: "NOT_FOUND", message: "User profile not found.", status: 404, retryable: false });
      return createProfileBundle(user);
    }, options);
  },

  updateDisplayName(userId: string, displayName: string, viewer: ViewerContext, options?: MockServiceOptions): Promise<ProfileBundle> {
    return simulateRequest(() => {
      if (viewer.userId !== userId && viewer.role !== UserRole.ADMIN) {
        throw new MockApiError({ code: "FORBIDDEN", message: "You cannot edit this profile.", status: 403, retryable: false });
      }
      if (!displayName.trim()) {
        throw new MockApiError({ code: "VALIDATION_ERROR", message: "Enter a display name.", status: 422, retryable: false, fieldErrors: { displayName: "Enter a display name." } });
      }
      mockAppStore.update((state) => ({
        ...state,
        users: state.users.map((user) => user.id === userId ? { ...user, displayName: displayName.trim(), updatedAt: new Date().toISOString() } : user),
      }));
      const updatedUser = mockAppStore.getSnapshot().users.find((user) => user.id === userId);
      if (!updatedUser) throw new MockApiError({ code: "NOT_FOUND", message: "User profile not found.", status: 404, retryable: false });
      return createProfileBundle(updatedUser);
    }, options);
  },
};
