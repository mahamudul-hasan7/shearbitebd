import { FoodCategory } from "@/lib/constants/domain";
import { UserRole } from "@/lib/constants/roles";
import { DonationStatus } from "@/lib/constants/statuses";
import { createDonationView } from "@/lib/permissions/permissions";
import { canTransitionDonation } from "@/lib/status-transitions";
import { validateDonationTimes } from "@/lib/validators/date-time";
import { mockAppStore } from "@/store/mock-app-store";
import type { Donation, DonationView, ViewerContext } from "@/types/domain";
import { createMockId, MockApiError, simulateRequest, type MockServiceOptions } from "@/services/shared";

export interface DonationListQuery {
  viewer?: ViewerContext;
  donorProfileId?: string;
  statuses?: DonationStatus[];
  categories?: FoodCategory[];
  search?: string;
}

export type CreateDonationInput = Omit<Donation, "id" | "createdAt" | "updatedAt" | "status"> & {
  status?: DonationStatus;
};

function validateDonation(input: CreateDonationInput) {
  const fieldErrors: Record<string, string> = {};
  const status = input.status ?? DonationStatus.DRAFT;
  if (!input.title.trim()) fieldErrors.title = "Enter a food title.";
  if (input.quantity.value <= 0 || input.quantity.estimatedMeals <= 0) fieldErrors.quantity = "Quantity and estimated meals must be positive.";
  if (!input.pickup.addressId) fieldErrors.addressId = "Select a pickup address.";

  Object.assign(fieldErrors, validateDonationTimes({
    preparationTime: input.preparationTime,
    safePickupDeadline: input.safePickupDeadline,
    pickupWindowStart: input.pickup.windowStart,
    pickupWindowEnd: input.pickup.windowEnd,
    requireFutureDeadline: status !== DonationStatus.DRAFT,
  }));

  if (status !== DonationStatus.DRAFT) {
    const declarationComplete =
      input.safetyDeclaration.freshlyPrepared &&
      input.safetyDeclaration.properlyCovered &&
      input.safetyDeclaration.noVisibleSpoilage &&
      input.safetyDeclaration.storedAccordingToDeclaration &&
      input.safetyDeclaration.allergensDisclosed &&
      input.safetyDeclaration.pickupDeadlineConfirmed &&
      input.safetyDeclaration.donorAccuracyConfirmed;
    if (!declarationComplete) fieldErrors.safetyDeclaration = "Complete every required food safety declaration before publishing.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw new MockApiError({ code: "VALIDATION_ERROR", message: "Correct the donation details before continuing.", status: 422, retryable: false, fieldErrors });
  }
}

function toView(donation: Donation, viewer: ViewerContext = {}) {
  const state = mockAppStore.getSnapshot();
  return createDonationView(donation, viewer, state.claims, state.addresses);
}

export const donationService = {
  list(query: DonationListQuery = {}, options?: MockServiceOptions): Promise<DonationView[]> {
    return simulateRequest(() => {
      const state = mockAppStore.getSnapshot();
      const search = query.search?.trim().toLowerCase();

      return state.donations
        .filter((donation) => {
          const ownsDonation = query.viewer?.donorProfileId === donation.donorProfileId;
          if (donation.status === DonationStatus.DRAFT && !ownsDonation) return false;
          if (query.donorProfileId && donation.donorProfileId !== query.donorProfileId) return false;
          if (query.statuses?.length && !query.statuses.includes(donation.status)) return false;
          if (query.categories?.length && !query.categories.includes(donation.category)) return false;
          if (search && !`${donation.title} ${donation.description} ${donation.pickup.approximateArea}`.toLowerCase().includes(search)) return false;
          return true;
        })
        .sort((left, right) => Date.parse(left.safePickupDeadline) - Date.parse(right.safePickupDeadline))
        .map((donation) => createDonationView(donation, query.viewer ?? {}, state.claims, state.addresses));
    }, options);
  },

  getById(id: string, viewer: ViewerContext = {}, options?: MockServiceOptions): Promise<DonationView> {
    return simulateRequest(() => {
      const donation = mockAppStore.getSnapshot().donations.find((item) => item.id === id);
      if (!donation) throw new MockApiError({ code: "NOT_FOUND", message: "Donation not found.", status: 404, retryable: false });
      return toView(donation, viewer);
    }, options);
  },

  create(input: CreateDonationInput, viewer: ViewerContext, options?: MockServiceOptions): Promise<DonationView> {
    return simulateRequest(() => {
      if (!viewer.donorProfileId || viewer.donorProfileId !== input.donorProfileId) {
        throw new MockApiError({ code: "FORBIDDEN", message: "You can create donations only for your own donor profile.", status: 403, retryable: false });
      }
      validateDonation(input);
      const now = new Date().toISOString();
      const donation: Donation = { ...input, id: createMockId("donation"), status: input.status ?? DonationStatus.DRAFT, createdAt: now, updatedAt: now };
      mockAppStore.update((state) => ({ ...state, donations: [donation, ...state.donations] }));
      return toView(donation, viewer);
    }, options);
  },

  transitionStatus(id: string, nextStatus: DonationStatus, viewer: ViewerContext, options?: MockServiceOptions): Promise<DonationView> {
    return simulateRequest(() => {
      let updatedDonation: Donation | undefined;
      mockAppStore.update((state) => {
        const current = state.donations.find((donation) => donation.id === id);
        if (!current) throw new MockApiError({ code: "NOT_FOUND", message: "Donation not found.", status: 404, retryable: false });
        if (viewer.donorProfileId !== current.donorProfileId && viewer.role !== UserRole.ADMIN) {
          throw new MockApiError({ code: "FORBIDDEN", message: "This donation belongs to another donor.", status: 403, retryable: false });
        }
        if (!canTransitionDonation(current.status, nextStatus)) {
          throw new MockApiError({ code: "CONFLICT", message: `Donation cannot move from ${current.status} to ${nextStatus}.`, status: 409, retryable: false });
        }
        if (nextStatus === DonationStatus.PUBLISHED) validateDonation({ ...current, status: nextStatus });
        const now = new Date().toISOString();
        const nextDonation: Donation = { ...current, status: nextStatus, publishedAt: nextStatus === DonationStatus.PUBLISHED ? now : current.publishedAt, updatedAt: now };
        updatedDonation = nextDonation;
        return { ...state, donations: state.donations.map((donation) => donation.id === id ? nextDonation : donation) };
      });
      if (!updatedDonation) throw new MockApiError({ code: "NOT_FOUND", message: "Donation not found.", status: 404, retryable: false });
      return toView(updatedDonation, viewer);
    }, options);
  },
};
