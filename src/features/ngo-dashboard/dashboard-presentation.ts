import { ClaimStatus } from "@/lib/constants/statuses";
import { distanceKm, isCoordinates } from "@/lib/locations";
import type { ProfileBundle } from "@/services/profile.service";
import type { DonationView } from "@/types/domain";
import type { NGOActiveClaim } from "./types";

export const NEARBY_RADIUS_KM = 15;
const priority: Partial<Record<ClaimStatus,number>> = { DISPUTED:0, DELIVERED:1, PICKED_UP:2, ASSIGNED:3, RESERVED:4 };

export function orderActiveClaims(items: NGOActiveClaim[]) {
  return [...items].sort((a,b) => (priority[a.claim.status] ?? 99) - (priority[b.claim.status] ?? 99) || Date.parse(a.donation.safePickupDeadline) - Date.parse(b.donation.safePickupDeadline) || a.claim.id.localeCompare(b.claim.id));
}

export function nearbyOverview(profile: ProfileBundle, donations: DonationView[]) {
  const saved = profile.addresses.find(address => address.isPrimary) || profile.addresses[0];
  const origin = isCoordinates(saved?.coordinates) ? saved.coordinates : undefined;
  const located = donations.map(donation => ({...donation,pickup:{...donation.pickup,distanceKm:origin && isCoordinates(donation.pickup.approximateCoordinates) ? distanceKm(origin,donation.pickup.approximateCoordinates) : undefined}}));
  const unmappedDonations = donations.filter(donation => !isCoordinates(donation.pickup.approximateCoordinates)).length;
  const measuredNearby = located.filter(donation => donation.pickup.distanceKm !== undefined && donation.pickup.distanceKm <= NEARBY_RADIUS_KM).length;
  return { donations:located, hasLocation:Boolean(origin), unmappedDonations, availableNearby:!origin || (unmappedDonations > 0 && measuredNearby === 0) ? null : measuredNearby };
}

export function claimNextStep(status: ClaimStatus) {
  return ({
    RESERVED:{label:"Arrange food collection",description:"A rider needs to accept this delivery."},
    ASSIGNED:{label:"Follow the pickup",description:"The rider has been assigned to collect the food."},
    PICKED_UP:{label:"Prepare to receive the food",description:"The food has been collected and is on its way."},
    DELIVERED:{label:"Continue receipt and distribution",description:"Delivery is verified. Check the receipt and distribution record."},
    DISPUTED:{label:"Review the reported issue",description:"This rescue is paused while the issue is reviewed."},
  } as Partial<Record<ClaimStatus,{label:string;description:string}>>)[status] || {label:"View rescue details",description:"Check the saved status before continuing."};
}
