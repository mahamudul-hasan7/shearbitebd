import { TransportMethod, VerificationStatus } from "@/lib/constants/domain";
import { UserRole } from "@/lib/constants/roles";
import { ClaimStatus, DonationStatus } from "@/lib/constants/statuses";
import { canClaimDonation, createDonationView } from "@/lib/permissions/permissions";
import { canTransitionClaim } from "@/lib/status-transitions";
import { mockAppStore } from "@/store/mock-app-store";
import type { Address, Claim, DonationView, ViewerContext } from "@/types/domain";
import { createMockId, MockApiError, simulateRequest, type MockServiceOptions } from "@/services/shared";

const CLAIM_DONATION_STATUS: Partial<Record<ClaimStatus, DonationStatus>> = {
  [ClaimStatus.RESERVED]: DonationStatus.RESERVED,
  [ClaimStatus.ASSIGNED]: DonationStatus.ASSIGNED,
  [ClaimStatus.PICKED_UP]: DonationStatus.PICKED_UP,
  [ClaimStatus.DELIVERED]: DonationStatus.DELIVERED,
  [ClaimStatus.DISTRIBUTED]: DonationStatus.DISTRIBUTED,
  [ClaimStatus.EXPIRED]: DonationStatus.EXPIRED,
  [ClaimStatus.DISPUTED]: DonationStatus.DISPUTED,
};

const INACTIVE_CLAIM_STATUSES = new Set<ClaimStatus>([ClaimStatus.CANCELLED, ClaimStatus.EXPIRED]);

export interface ClaimListQuery {
  ngoProfileId?: string;
  volunteerProfileId?: string;
  donationId?: string;
  statuses?: ClaimStatus[];
}

export interface CreateClaimInput {
  donationId: string;
  ngoProfileId: string;
  matchScore: number;
}

export interface ClaimVolunteerSummary {
  id: string;
  displayName: string;
  phone?: string;
  verificationStatus: VerificationStatus;
  transportMethod: TransportMethod;
  completedRescues: number;
}

export interface ClaimCoordinationDetails {
  claim: Claim;
  donation: DonationView;
  donorOrganization: string;
  donorVerified: boolean;
  volunteer?: ClaimVolunteerSummary;
  deliveryAddress?: Address;
}

function cloneClaim(claim: Claim) {
  return { ...claim };
}

function canAccessClaim(viewer: ViewerContext, claim: Claim, donorProfileId: string) {
  return viewer.role === UserRole.ADMIN ||
    viewer.ngoProfileId === claim.ngoProfileId ||
    viewer.volunteerProfileId === claim.volunteerProfileId ||
    viewer.donorProfileId === donorProfileId;
}

function mockVerificationToken(kind: "PICKUP" | "DELIVERY", seed: number) {
  const code = String((seed % 900_000) + 100_000).padStart(6, "0");
  return `MOCK-${kind}-${code}`;
}

export const claimService = {
  list(query: ClaimListQuery = {}, options?: MockServiceOptions): Promise<Claim[]> {
    return simulateRequest(() => mockAppStore.getSnapshot().claims
      .filter((claim) => {
        if (query.ngoProfileId && claim.ngoProfileId !== query.ngoProfileId) return false;
        if (query.volunteerProfileId && claim.volunteerProfileId !== query.volunteerProfileId) return false;
        if (query.donationId && claim.donationId !== query.donationId) return false;
        if (query.statuses?.length && !query.statuses.includes(claim.status)) return false;
        return true;
      })
      .sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt))
      .map(cloneClaim), options);
  },

  getById(id: string, options?: MockServiceOptions): Promise<Claim> {
    return simulateRequest(() => {
      const claim = mockAppStore.getSnapshot().claims.find((item) => item.id === id);
      if (!claim) throw new MockApiError({ code: "NOT_FOUND", message: "Claim not found.", status: 404, retryable: false });
      return cloneClaim(claim);
    }, options);
  },

  getCoordinationDetails(id: string, viewer: ViewerContext, options?: MockServiceOptions): Promise<ClaimCoordinationDetails> {
    return simulateRequest(() => {
      const state = mockAppStore.getSnapshot();
      const claim = state.claims.find((item) => item.id === id);
      if (!claim) throw new MockApiError({ code: "NOT_FOUND", message: "Claim not found.", status: 404, retryable: false });
      const donation = state.donations.find((item) => item.id === claim.donationId);
      if (!donation) throw new MockApiError({ code: "NOT_FOUND", message: "Claim donation not found.", status: 404, retryable: false });
      if (!canAccessClaim(viewer, claim, donation.donorProfileId)) {
        throw new MockApiError({ code: "FORBIDDEN", message: "You are not authorized to coordinate this rescue.", status: 403, retryable: false });
      }

      const donor = state.donorProfiles.find((item) => item.id === donation.donorProfileId);
      const donorUser = donor ? state.users.find((item) => item.id === donor.userId) : undefined;
      const ngo = state.ngoProfiles.find((item) => item.id === claim.ngoProfileId);
      const deliveryAddress = ngo ? state.addresses.find((item) => ngo.addressIds.includes(item.id) && item.isPrimary) ?? state.addresses.find((item) => ngo.addressIds.includes(item.id)) : undefined;
      const volunteerProfile = claim.volunteerProfileId ? state.volunteerProfiles.find((item) => item.id === claim.volunteerProfileId) : undefined;
      const volunteerUser = volunteerProfile ? state.users.find((item) => item.id === volunteerProfile.userId) : undefined;

      return {
        claim: cloneClaim(claim),
        donation: createDonationView(donation, viewer, state.claims, state.addresses),
        donorOrganization: donor?.organizationName ?? donorUser?.displayName ?? "Verified food donor",
        donorVerified: donor?.verificationStatus === VerificationStatus.VERIFIED,
        volunteer: volunteerProfile && volunteerUser ? {
          id: volunteerProfile.id,
          displayName: volunteerUser.displayName,
          phone: volunteerUser.phone,
          verificationStatus: volunteerProfile.verificationStatus,
          transportMethod: volunteerProfile.transportMethod,
          completedRescues: volunteerProfile.completedRescues,
        } : undefined,
        deliveryAddress: deliveryAddress ? { ...deliveryAddress, coordinates: deliveryAddress.coordinates ? { ...deliveryAddress.coordinates } : undefined } : undefined,
      };
    }, options);
  },

  create(input: CreateClaimInput, viewer: ViewerContext, options?: MockServiceOptions): Promise<Claim> {
    return simulateRequest(() => {
      const state = mockAppStore.getSnapshot();
      const donation = state.donations.find((item) => item.id === input.donationId);
      const ngo = state.ngoProfiles.find((item) => item.id === input.ngoProfileId);
      if (!donation) throw new MockApiError({ code: "NOT_FOUND", message: "Donation not found.", status: 404, retryable: false });
      if (!ngo || ngo.verificationStatus !== VerificationStatus.VERIFIED || !canClaimDonation(viewer, ngo, donation)) {
        throw new MockApiError({ code: "FORBIDDEN", message: "Only the signed-in verified NGO can claim this available donation.", status: 403, retryable: false });
      }
      if (!ngo.acceptedFoodCategories.includes(donation.category)) {
        throw new MockApiError({ code: "FORBIDDEN", message: "This food category is not currently accepted by your NGO profile.", status: 403, retryable: false });
      }
      if (state.claims.some((claim) => claim.donationId === donation.id && !INACTIVE_CLAIM_STATUSES.has(claim.status))) {
        throw new MockApiError({ code: "CONFLICT", message: "This donation already has an active claim.", status: 409, retryable: false });
      }

      const now = new Date().toISOString();
      const claim: Claim = {
        id: createMockId("claim"),
        donationId: donation.id,
        ngoProfileId: ngo.id,
        status: ClaimStatus.RESERVED,
        matchScore: Math.min(100, Math.max(0, Math.round(input.matchScore))),
        reservedAt: now,
        updatedAt: now,
      };
      mockAppStore.update((current) => ({
        ...current,
        claims: [claim, ...current.claims],
        donations: current.donations.map((item) => item.id === donation.id ? { ...item, status: DonationStatus.RESERVED, updatedAt: now } : item),
      }));
      return cloneClaim(claim);
    }, options);
  },

  assignDemoVolunteer(id: string, volunteerProfileId: string, viewer: ViewerContext, options?: MockServiceOptions): Promise<Claim> {
    return simulateRequest(() => {
      let result: Claim | undefined;
      mockAppStore.update((state) => {
        const claim = state.claims.find((item) => item.id === id);
        if (!claim) throw new MockApiError({ code: "NOT_FOUND", message: "Claim not found.", status: 404, retryable: false });
        if (viewer.role !== UserRole.ADMIN && viewer.ngoProfileId !== claim.ngoProfileId) {
          throw new MockApiError({ code: "FORBIDDEN", message: "Only the claiming NGO can start this demo assignment.", status: 403, retryable: false });
        }
        if (!canTransitionClaim(claim.status, ClaimStatus.ASSIGNED)) {
          throw new MockApiError({ code: "CONFLICT", message: "This claim is not waiting for assignment.", status: 409, retryable: false });
        }
        const volunteer = state.volunteerProfiles.find((item) => item.id === volunteerProfileId);
        if (!volunteer || volunteer.verificationStatus !== VerificationStatus.VERIFIED) {
          throw new MockApiError({ code: "VALIDATION_ERROR", message: "Select a verified demo volunteer.", status: 422, retryable: false });
        }

        const now = new Date();
        const seed = now.getTime();
        const nextClaim: Claim = {
          ...claim,
          volunteerProfileId,
          status: ClaimStatus.ASSIGNED,
          assignedAt: now.toISOString(),
          estimatedPickupAt: new Date(seed + 45 * 60_000).toISOString(),
          estimatedDeliveryAt: new Date(seed + 95 * 60_000).toISOString(),
          pickupVerificationToken: mockVerificationToken("PICKUP", seed),
          deliveryVerificationToken: mockVerificationToken("DELIVERY", seed + 137),
          updatedAt: now.toISOString(),
        };
        result = nextClaim;
        return {
          ...state,
          claims: state.claims.map((item) => item.id === id ? nextClaim : item),
          donations: state.donations.map((item) => item.id === claim.donationId ? { ...item, status: DonationStatus.ASSIGNED, updatedAt: now.toISOString() } : item),
        };
      });
      if (!result) throw new MockApiError({ code: "MOCK_FAILURE", message: "The mock volunteer assignment was not created.", status: 500, retryable: true });
      return cloneClaim(result);
    }, options);
  },

  transitionStatus(id: string, nextStatus: ClaimStatus, viewer: ViewerContext, options?: MockServiceOptions): Promise<Claim> {
    return simulateRequest(() => {
      let result: Claim | undefined;
      mockAppStore.update((state) => {
        const claim = state.claims.find((item) => item.id === id);
        if (!claim) throw new MockApiError({ code: "NOT_FOUND", message: "Claim not found.", status: 404, retryable: false });
        const canManage = viewer.role === UserRole.ADMIN || viewer.ngoProfileId === claim.ngoProfileId || viewer.volunteerProfileId === claim.volunteerProfileId;
        if (!canManage) throw new MockApiError({ code: "FORBIDDEN", message: "You cannot update this claim.", status: 403, retryable: false });
        if (!canTransitionClaim(claim.status, nextStatus)) {
          throw new MockApiError({ code: "CONFLICT", message: `Claim cannot move from ${claim.status} to ${nextStatus}.`, status: 409, retryable: false });
        }
        const now = new Date().toISOString();
        const nextClaim: Claim = {
          ...claim,
          status: nextStatus,
          assignedAt: nextStatus === ClaimStatus.ASSIGNED ? now : claim.assignedAt,
          pickedUpAt: nextStatus === ClaimStatus.PICKED_UP ? now : claim.pickedUpAt,
          deliveredAt: nextStatus === ClaimStatus.DELIVERED ? now : claim.deliveredAt,
          distributedAt: nextStatus === ClaimStatus.DISTRIBUTED ? now : claim.distributedAt,
          updatedAt: now,
        };
        result = nextClaim;
        const donationStatus = nextStatus === ClaimStatus.CANCELLED ? DonationStatus.AVAILABLE : CLAIM_DONATION_STATUS[nextStatus];
        return {
          ...state,
          claims: state.claims.map((item) => item.id === id ? nextClaim : item),
          donations: donationStatus ? state.donations.map((item) => item.id === claim.donationId ? { ...item, status: donationStatus, updatedAt: now } : item) : state.donations,
        };
      });
      if (!result) throw new MockApiError({ code: "NOT_FOUND", message: "Claim not found.", status: 404, retryable: false });
      return cloneClaim(result);
    }, options);
  },
};
