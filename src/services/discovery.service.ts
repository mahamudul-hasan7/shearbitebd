import { availableForDiscovery } from "@/features/ngo-discovery/discovery-model";
import { distanceKm } from "@/lib/locations";
import type { DonationView, ViewerContext } from "@/types/domain";
import { MockApiError, type MockServiceOptions } from "@/services/shared";
import { donationService } from "@/services/donation.service";
import { profileService, type ProfileBundle } from "@/services/profile.service";

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

function build(
  donation: DonationView,
  profile: ProfileBundle,
): NGODiscoveryItem {
  const ngo = profile.ngoProfile;
  const origin = (
    profile.addresses.find((a) => a.isPrimary) || profile.addresses[0]
  )?.coordinates;
  const point = donation.pickup.approximateCoordinates;
  donation = {
    ...donation,
    pickup: {
      ...donation.pickup,
      distanceKm: origin && point ? distanceKm(origin, point) : undefined,
    },
  };
  const verified = ngo?.verificationStatus === "VERIFIED";
  const category = Boolean(
    ngo?.acceptedFoodCategories.includes(donation.category),
  );
  const open = availableForDiscovery(donation, Date.now());
  const extra = donation as DonationView & { donorOrganization?: string };
  return {
    donation,
    donorOrganization: extra.donorOrganization || "Food donor",
    matchScore: 0,
    eligibility: {
      eligible: verified && category && open,
      checks: [
        {
          label: "Organization verification",
          passed: verified,
          description: verified
            ? "Organization verified."
            : "Verification is pending. Contact the project administrator.",
        },
        {
          label: "Food category",
          passed: category,
          description: category
            ? "This category is accepted."
            : "Category is not accepted by your organization.",
        },
        {
          label: "Rescue window",
          passed: open,
          description: open
            ? "Food is available within its pickup deadline."
            : "This food is no longer available.",
        },
      ],
    },
  };
}

export const discoveryService = {
  async listAvailable(
    id: string,
    viewer: ViewerContext,
    options?: MockServiceOptions,
  ): Promise<NGODiscoveryItem[]> {
    const [profile, donations] = await Promise.all([
      profileService.getOwnProfile(id, viewer, options),
      donationService.list({}, options),
    ]);
    if (!profile.ngoProfile)
      throw new MockApiError({
        code: "FORBIDDEN",
        message: "An NGO account is required.",
        status: 403,
        retryable: false,
      });
    return donations
      .filter((d) => availableForDiscovery(d, Date.now()))
      .map((d) => build(d, profile));
  },
  async getById(
    id: string,
    ngoId: string,
    viewer: ViewerContext,
    options?: MockServiceOptions,
  ): Promise<NGODiscoveryItem> {
    const [profile, donation] = await Promise.all([
      profileService.getOwnProfile(ngoId, viewer, options),
      donationService.getById(id, viewer, options),
    ]);
    return build(donation, profile);
  },
};
