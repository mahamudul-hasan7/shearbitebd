import { VerificationStatus } from "@/lib/constants/domain";
import { UserRole } from "@/lib/constants/roles";
import { ClaimStatus, DonationStatus } from "@/lib/constants/statuses";
import type { Address, Claim, Donation, DonationView, NGOProfile, ViewerContext } from "@/types/domain";

export enum AppPermission {
  CREATE_DONATION = "CREATE_DONATION",
  MANAGE_OWN_DONATION = "MANAGE_OWN_DONATION",
  DISCOVER_DONATION = "DISCOVER_DONATION",
  CLAIM_DONATION = "CLAIM_DONATION",
  HANDLE_ASSIGNED_RESCUE = "HANDLE_ASSIGNED_RESCUE",
  MODERATE_PLATFORM = "MODERATE_PLATFORM",
}

const ROLE_PERMISSIONS: Record<UserRole, readonly AppPermission[]> = {
  [UserRole.DONOR]: [AppPermission.CREATE_DONATION, AppPermission.MANAGE_OWN_DONATION],
  [UserRole.NGO]: [AppPermission.DISCOVER_DONATION, AppPermission.CLAIM_DONATION],
  [UserRole.VOLUNTEER]: [AppPermission.HANDLE_ASSIGNED_RESCUE],
  [UserRole.ADMIN]: Object.values(AppPermission),
};

const AUTHORIZED_NGO_CLAIM_STATUSES = new Set<ClaimStatus>([
  ClaimStatus.RESERVED,
  ClaimStatus.ASSIGNED,
  ClaimStatus.PICKED_UP,
  ClaimStatus.DELIVERED,
  ClaimStatus.DISTRIBUTED,
  ClaimStatus.DISPUTED,
]);

const AUTHORIZED_VOLUNTEER_CLAIM_STATUSES = new Set<ClaimStatus>([
  ClaimStatus.ASSIGNED,
  ClaimStatus.PICKED_UP,
  ClaimStatus.DELIVERED,
  ClaimStatus.DISTRIBUTED,
  ClaimStatus.DISPUTED,
]);

export function hasPermission(role: UserRole | undefined, permission: AppPermission) {
  return role ? ROLE_PERMISSIONS[role].includes(permission) : false;
}

export function canClaimDonation(viewer: ViewerContext, ngo: NGOProfile | undefined, donation: Donation) {
  return (
    hasPermission(viewer.role, AppPermission.CLAIM_DONATION) &&
    ngo !== undefined &&
    viewer.ngoProfileId === ngo.id &&
    ngo.verificationStatus === VerificationStatus.VERIFIED &&
    donation.status === DonationStatus.AVAILABLE
  );
}

export function canViewSensitiveDonationFields(viewer: ViewerContext, donation: Donation, claims: readonly Claim[]) {
  if (viewer.role === UserRole.ADMIN) return true;
  if (viewer.role === UserRole.DONOR && viewer.donorProfileId === donation.donorProfileId) return true;

  return claims.some((claim) => {
    if (claim.donationId !== donation.id) return false;
    if (viewer.role === UserRole.NGO && viewer.ngoProfileId === claim.ngoProfileId) {
      return AUTHORIZED_NGO_CLAIM_STATUSES.has(claim.status);
    }
    if (viewer.role === UserRole.VOLUNTEER && viewer.volunteerProfileId === claim.volunteerProfileId) {
      return AUTHORIZED_VOLUNTEER_CLAIM_STATUSES.has(claim.status);
    }
    return false;
  });
}

export function createDonationView(
  donation: Donation,
  viewer: ViewerContext,
  claims: readonly Claim[],
  addresses: readonly Address[],
): DonationView {
  const sensitiveDetailsVisible = canViewSensitiveDonationFields(viewer, donation, claims);
  const exactAddress = sensitiveDetailsVisible ? addresses.find((address) => address.id === donation.pickup.addressId) : undefined;

  return {
    ...donation,
    dietaryTypes: [...donation.dietaryTypes],
    allergens: [...donation.allergens],
    photoUrls: [...donation.photoUrls],
    pickup: {
      approximateArea: donation.pickup.approximateArea,
      distanceKm: donation.pickup.distanceKm,
      windowStart: donation.pickup.windowStart,
      windowEnd: donation.pickup.windowEnd,
      sensitiveDetailsVisible,
      exactAddress: exactAddress ? { ...exactAddress, coordinates: exactAddress.coordinates ? { ...exactAddress.coordinates } : undefined } : undefined,
      contact: sensitiveDetailsVisible ? { ...donation.pickup.contact } : undefined,
      directions: sensitiveDetailsVisible ? donation.pickup.directions : undefined,
    },
    safetyDeclaration: { ...donation.safetyDeclaration },
    quantity: { ...donation.quantity },
  };
}
