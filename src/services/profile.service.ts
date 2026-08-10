import { UserRole } from "@/lib/constants/roles";
import { mockAppStore } from "@/store/mock-app-store";
import type { Address, DonorProfile, NGOProfile, User, ViewerContext, VolunteerProfile } from "@/types/domain";
import { MockApiError, simulateRequest, type MockServiceOptions } from "@/services/shared";

export interface UpdateDonorProfileInput {
  displayName: string;
  email: string;
  phone: string;
  organizationName?: string;
  donorType: DonorProfile["donorType"];
}

export interface AddressInput {
  label: string;
  division: string;
  district: string;
  city: string;
  area: string;
  addressLine: string;
  postalCode?: string;
  landmark?: string;
}

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
    ngoProfile: ngoProfile ? { ...ngoProfile, addressIds: [...ngoProfile.addressIds], beneficiaryTypes: [...ngoProfile.beneficiaryTypes], acceptedFoodCategories: [...ngoProfile.acceptedFoodCategories], serviceAreas: [...ngoProfile.serviceAreas], values: [...ngoProfile.values], galleryUrls: [...ngoProfile.galleryUrls] } : undefined,
    volunteerProfile: volunteerProfile ? { ...volunteerProfile, serviceAreas: [...volunteerProfile.serviceAreas], availability: [...volunteerProfile.availability] } : undefined,
    addresses: state.addresses.filter((address) => addressIds.includes(address.id)).map((address) => ({ ...address, coordinates: address.coordinates ? { ...address.coordinates } : undefined })),
  };
}

function requireProfileOwner(userId: string, viewer: ViewerContext) {
  if (viewer.userId !== userId && viewer.role !== UserRole.ADMIN) {
    throw new MockApiError({ code: "FORBIDDEN", message: "You cannot edit this profile.", status: 403, retryable: false });
  }
}

function requireDonorProfile(userId: string) {
  const profile = mockAppStore.getSnapshot().donorProfiles.find((item) => item.userId === userId);
  if (!profile) throw new MockApiError({ code: "NOT_FOUND", message: "Donor profile not found.", status: 404, retryable: false });
  return profile;
}

function validateAddress(input: AddressInput) {
  const required: Array<keyof Pick<AddressInput, "label" | "division" | "district" | "city" | "area" | "addressLine">> = ["label", "division", "district", "city", "area", "addressLine"];
  const fieldErrors = Object.fromEntries(required.filter((field) => !input[field].trim()).map((field) => [field, "This field is required."]));
  if (Object.keys(fieldErrors).length > 0) {
    throw new MockApiError({ code: "VALIDATION_ERROR", message: "Complete the required address fields.", status: 422, retryable: false, fieldErrors });
  }
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

  updateDonorProfile(userId: string, input: UpdateDonorProfileInput, viewer: ViewerContext, options?: MockServiceOptions): Promise<ProfileBundle> {
    return simulateRequest(() => {
      requireProfileOwner(userId, viewer);
      const donorProfile = requireDonorProfile(userId);
      const email = input.email.trim().toLowerCase();
      const fieldErrors: Record<string, string> = {};
      if (!input.displayName.trim()) fieldErrors.displayName = "Enter a display name.";
      if (!/^\S+@\S+\.\S+$/.test(email)) fieldErrors.email = "Enter a valid email address.";
      if (!/^\+?[0-9]{10,15}$/.test(input.phone.replace(/[\s-]/g, ""))) fieldErrors.phone = "Enter a valid phone number.";
      if (Object.keys(fieldErrors).length > 0) {
        throw new MockApiError({ code: "VALIDATION_ERROR", message: "Review the highlighted profile fields.", status: 422, retryable: false, fieldErrors });
      }
      const emailTaken = mockAppStore.getSnapshot().users.some((user) => user.id !== userId && user.email.toLowerCase() === email);
      if (emailTaken) throw new MockApiError({ code: "CONFLICT", message: "This email is already in use.", status: 409, retryable: false, fieldErrors: { email: "This email is already in use." } });
      const updatedAt = new Date().toISOString();
      mockAppStore.update((state) => ({
        ...state,
        users: state.users.map((user) => user.id === userId ? { ...user, displayName: input.displayName.trim(), email, phone: input.phone.trim(), updatedAt } : user),
        donorProfiles: state.donorProfiles.map((profile) => profile.id === donorProfile.id ? { ...profile, donorType: input.donorType, organizationName: input.organizationName?.trim() || undefined, updatedAt } : profile),
      }));
      const user = mockAppStore.getSnapshot().users.find((item) => item.id === userId);
      if (!user) throw new MockApiError({ code: "NOT_FOUND", message: "User profile not found.", status: 404, retryable: false });
      return createProfileBundle(user);
    }, options);
  },

  addAddress(userId: string, input: AddressInput, viewer: ViewerContext, options?: MockServiceOptions): Promise<ProfileBundle> {
    return simulateRequest(() => {
      requireProfileOwner(userId, viewer);
      validateAddress(input);
      const donorProfile = requireDonorProfile(userId);
      const id = `address-${userId}-${Date.now()}`;
      const address: Address = {
        id,
        label: input.label.trim(),
        division: input.division.trim(),
        district: input.district.trim(),
        city: input.city.trim(),
        area: input.area.trim(),
        addressLine: input.addressLine.trim(),
        postalCode: input.postalCode?.trim() || undefined,
        landmark: input.landmark?.trim() || undefined,
        isPrimary: donorProfile.addressIds.length === 0,
      };
      mockAppStore.update((state) => ({
        ...state,
        addresses: [...state.addresses, address],
        donorProfiles: state.donorProfiles.map((profile) => profile.id === donorProfile.id ? { ...profile, addressIds: [...profile.addressIds, id], updatedAt: new Date().toISOString() } : profile),
      }));
      const user = mockAppStore.getSnapshot().users.find((item) => item.id === userId);
      if (!user) throw new MockApiError({ code: "NOT_FOUND", message: "User profile not found.", status: 404, retryable: false });
      return createProfileBundle(user);
    }, options);
  },

  updateAddress(userId: string, addressId: string, input: AddressInput, viewer: ViewerContext, options?: MockServiceOptions): Promise<ProfileBundle> {
    return simulateRequest(() => {
      requireProfileOwner(userId, viewer);
      validateAddress(input);
      const donorProfile = requireDonorProfile(userId);
      if (!donorProfile.addressIds.includes(addressId)) throw new MockApiError({ code: "FORBIDDEN", message: "This address does not belong to your donor profile.", status: 403, retryable: false });
      mockAppStore.update((state) => ({
        ...state,
        addresses: state.addresses.map((address) => address.id === addressId ? { ...address, ...input, label: input.label.trim(), division: input.division.trim(), district: input.district.trim(), city: input.city.trim(), area: input.area.trim(), addressLine: input.addressLine.trim(), postalCode: input.postalCode?.trim() || undefined, landmark: input.landmark?.trim() || undefined } : address),
      }));
      const user = mockAppStore.getSnapshot().users.find((item) => item.id === userId);
      if (!user) throw new MockApiError({ code: "NOT_FOUND", message: "User profile not found.", status: 404, retryable: false });
      return createProfileBundle(user);
    }, options);
  },

  setPrimaryAddress(userId: string, addressId: string, viewer: ViewerContext, options?: MockServiceOptions): Promise<ProfileBundle> {
    return simulateRequest(() => {
      requireProfileOwner(userId, viewer);
      const donorProfile = requireDonorProfile(userId);
      if (!donorProfile.addressIds.includes(addressId)) throw new MockApiError({ code: "FORBIDDEN", message: "This address does not belong to your donor profile.", status: 403, retryable: false });
      mockAppStore.update((state) => ({
        ...state,
        addresses: state.addresses.map((address) => donorProfile.addressIds.includes(address.id) ? { ...address, isPrimary: address.id === addressId } : address),
      }));
      const user = mockAppStore.getSnapshot().users.find((item) => item.id === userId);
      if (!user) throw new MockApiError({ code: "NOT_FOUND", message: "User profile not found.", status: 404, retryable: false });
      return createProfileBundle(user);
    }, options);
  },

  removeAddress(userId: string, addressId: string, viewer: ViewerContext, options?: MockServiceOptions): Promise<ProfileBundle> {
    return simulateRequest(() => {
      requireProfileOwner(userId, viewer);
      const donorProfile = requireDonorProfile(userId);
      if (!donorProfile.addressIds.includes(addressId)) throw new MockApiError({ code: "FORBIDDEN", message: "This address does not belong to your donor profile.", status: 403, retryable: false });
      const removed = mockAppStore.getSnapshot().addresses.find((address) => address.id === addressId);
      const remainingIds = donorProfile.addressIds.filter((id) => id !== addressId);
      mockAppStore.update((state) => ({
        ...state,
        addresses: state.addresses.filter((address) => address.id !== addressId).map((address) => removed?.isPrimary && address.id === remainingIds[0] ? { ...address, isPrimary: true } : address),
        donorProfiles: state.donorProfiles.map((profile) => profile.id === donorProfile.id ? { ...profile, addressIds: remainingIds, updatedAt: new Date().toISOString() } : profile),
      }));
      const user = mockAppStore.getSnapshot().users.find((item) => item.id === userId);
      if (!user) throw new MockApiError({ code: "NOT_FOUND", message: "User profile not found.", status: 404, retryable: false });
      return createProfileBundle(user);
    }, options);
  },
};
