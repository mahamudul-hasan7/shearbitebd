import type { Address, Coordinates, DonorProfile, NGOProfile, User, ViewerContext, VolunteerProfile } from "@/types/domain";
import type { MockServiceOptions } from "@/services/shared";
import { apiRequest } from "@/services/http";

export interface UpdateDonorProfileInput { displayName: string; email: string; phone: string; organizationName?: string; donorType: DonorProfile["donorType"]; }
export interface UpdateNGOProfileInput { organizationName: string; summary: string; mission: string; vision: string; serviceAreas: string[]; beneficiaryTypes: string[]; capacityMealsPerDay: number; publicEmail: string; publicPhone: string; }
export interface AddressInput { coordinates?: Coordinates | null; label: string; division: string; district: string; city: string; area: string; addressLine: string; postalCode?: string; landmark?: string; }
export interface ProfileBundle { user: User; donorProfile?: DonorProfile; ngoProfile?: NGOProfile; volunteerProfile?: VolunteerProfile; addresses: Address[]; }

async function mutate(method: string, action: string, input: unknown, id?: string, options?: MockServiceOptions) {
  const result = await apiRequest<ProfileBundle>("/api/profile", { method, signal: options?.signal, body: JSON.stringify({ action, input, id }) });
  if (typeof window !== "undefined") window.dispatchEvent(new Event("sharebite:auth-changed"));
  return result;
}

// Compatibility parameters no longer select identity. /api/profile always uses the server session.
export const profileService = {
  getOwnProfile(userId: string, viewer: ViewerContext, options?: MockServiceOptions): Promise<ProfileBundle> {
    void userId; void viewer; return apiRequest("/api/profile", { signal: options?.signal });
  },
  updateDisplayName(userId: string, displayName: string, viewer: ViewerContext, options?: MockServiceOptions) {
    void userId; void viewer; return mutate("PATCH", "displayName", { displayName }, undefined, options);
  },
  updateDonorProfile(userId: string, input: UpdateDonorProfileInput, viewer: ViewerContext, options?: MockServiceOptions) {
    void userId; void viewer; return mutate("PATCH", "donor", input, undefined, options);
  },
  updateNGOProfile(userId: string, input: UpdateNGOProfileInput, viewer: ViewerContext, options?: MockServiceOptions) {
    void userId; void viewer; return mutate("PATCH", "ngo", input, undefined, options);
  },
  addAddress(userId: string, input: AddressInput, viewer: ViewerContext, options?: MockServiceOptions) {
    void userId; void viewer; return mutate("POST", "addAddress", input, undefined, options);
  },
  updateAddress(userId: string, id: string, input: AddressInput, viewer: ViewerContext, options?: MockServiceOptions) {
    void userId; void viewer; return mutate("POST", "updateAddress", input, id, options);
  },
  setAddressCoordinates(userId: string, id: string, coordinates: Coordinates | null, viewer: ViewerContext, options?: MockServiceOptions) {
    void userId; void viewer; return mutate("POST", "setCoordinates", { coordinates }, id, options);
  },
  setPrimaryAddress(userId: string, id: string, viewer: ViewerContext, options?: MockServiceOptions) {
    void userId; void viewer; return mutate("POST", "setPrimaryAddress", undefined, id, options);
  },
  removeAddress(userId: string, id: string, viewer: ViewerContext, options?: MockServiceOptions) {
    void userId; void viewer; return mutate("POST", "removeAddress", undefined, id, options);
  },
};
