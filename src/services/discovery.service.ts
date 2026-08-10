import { VerificationStatus } from "@/lib/constants/domain";
import { UserRole } from "@/lib/constants/roles";
import { DonationStatus } from "@/lib/constants/statuses";
import { createDonationView } from "@/lib/permissions/permissions";
import { calculateUrgencyScore } from "@/lib/selectors/donation-selectors";
import { mockAppStore } from "@/store/mock-app-store";
import type { Donation, DonationView, ViewerContext } from "@/types/domain";
import { MockApiError, simulateRequest, type MockServiceOptions } from "@/services/shared";

export interface DonationEligibility {
  eligible: boolean;
  checks: Array<{ label: string; passed: boolean; description: string }>;
}

export interface NGODiscoveryItem {
  donation: DonationView;
  donorOrganization: string;
  matchScore: number;
  eligibility: DonationEligibility;
}

function requireVerifiedNgo(ngoProfileId: string, viewer: ViewerContext) {
  if (viewer.ngoProfileId !== ngoProfileId && viewer.role !== UserRole.ADMIN) {
    throw new MockApiError({ code: "FORBIDDEN", message: "You can browse food only for your signed-in NGO.", status: 403, retryable: false });
  }
  const ngo = mockAppStore.getSnapshot().ngoProfiles.find((profile) => profile.id === ngoProfileId);
  if (!ngo || ngo.verificationStatus !== VerificationStatus.VERIFIED) {
    throw new MockApiError({ code: "FORBIDDEN", message: "A verified NGO profile is required to discover and claim food.", status: 403, retryable: false });
  }
  return ngo;
}

function buildDiscoveryItem(donation: Donation, ngoProfileId: string, viewer: ViewerContext): NGODiscoveryItem {
  const state = mockAppStore.getSnapshot();
  const ngo = state.ngoProfiles.find((profile) => profile.id === ngoProfileId);
  if (!ngo) throw new MockApiError({ code: "NOT_FOUND", message: "NGO profile not found.", status: 404, retryable: false });
  const donor = state.donorProfiles.find((profile) => profile.id === donation.donorProfileId);
  const donorUser = donor ? state.users.find((user) => user.id === donor.userId) : undefined;
  const categoryAccepted = ngo.acceptedFoodCategories.includes(donation.category);
  const serviceAreaMatch = ngo.serviceAreas.some((area) => donation.pickup.approximateArea.toLowerCase().includes(area.toLowerCase()));
  const distanceKm = donation.pickup.distanceKm ?? 25;
  const distanceSuitable = distanceKm <= 15;
  const deadlineOpen = Date.parse(donation.safePickupDeadline) > Date.now();
  const isAvailable = donation.status === DonationStatus.AVAILABLE;
  const urgency = calculateUrgencyScore({ safePickupDeadline: donation.safePickupDeadline, priority: donation.priority });
  const matchScore = Math.min(99, Math.max(20,
    (categoryAccepted ? 35 : 5) +
    (serviceAreaMatch ? 25 : 12) +
    Math.max(4, 24 - Math.round(distanceKm * 1.7)) +
    Math.round(urgency * 0.16),
  ));
  return {
    donation: createDonationView(donation, viewer, state.claims, state.addresses),
    donorOrganization: donor?.organizationName ?? donorUser?.displayName ?? "Verified food donor",
    matchScore,
    eligibility: {
      eligible: categoryAccepted && distanceSuitable && deadlineOpen && isAvailable,
      checks: [
        { label: "Verified organization", passed: ngo.verificationStatus === VerificationStatus.VERIFIED, description: "Your NGO verification is active." },
        { label: "Accepted food category", passed: categoryAccepted, description: categoryAccepted ? "This category is on your accepted-food list." : "Update your accepted categories before claiming this food." },
        { label: "Service distance", passed: distanceSuitable, description: distanceSuitable ? `${distanceKm.toFixed(1)} km is inside the 15 km discovery radius.` : `${distanceKm.toFixed(1)} km is outside the recommended operating radius.` },
        { label: "Rescue window", passed: deadlineOpen && isAvailable, description: deadlineOpen && isAvailable ? "The donor-declared pickup window is still open." : "This listing is no longer available to claim." },
      ],
    },
  };
}

export const discoveryService = {
  listAvailable(ngoProfileId: string, viewer: ViewerContext, options?: MockServiceOptions): Promise<NGODiscoveryItem[]> {
    return simulateRequest(() => {
      requireVerifiedNgo(ngoProfileId, viewer);
      return mockAppStore.getSnapshot().donations
        .filter((donation) => donation.status === DonationStatus.AVAILABLE && Date.parse(donation.safePickupDeadline) > Date.now())
        .map((donation) => buildDiscoveryItem(donation, ngoProfileId, viewer))
        .sort((left, right) => right.matchScore - left.matchScore);
    }, options);
  },

  getById(id: string, ngoProfileId: string, viewer: ViewerContext, options?: MockServiceOptions): Promise<NGODiscoveryItem> {
    return simulateRequest(() => {
      requireVerifiedNgo(ngoProfileId, viewer);
      const state = mockAppStore.getSnapshot();
      const donation = state.donations.find((item) => item.id === id);
      if (!donation || donation.status === DonationStatus.DRAFT) {
        throw new MockApiError({ code: "NOT_FOUND", message: "Donation listing not found.", status: 404, retryable: false });
      }
      const ownsClaim = state.claims.some((claim) => claim.donationId === id && claim.ngoProfileId === ngoProfileId);
      if (donation.status !== DonationStatus.AVAILABLE && !ownsClaim) {
        throw new MockApiError({ code: "CONFLICT", message: "This donation is no longer available to your NGO.", status: 409, retryable: false });
      }
      return buildDiscoveryItem(donation, ngoProfileId, viewer);
    }, options);
  },
};
