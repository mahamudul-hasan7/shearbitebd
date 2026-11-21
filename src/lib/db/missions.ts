import { coordinates, distanceKm } from "@/lib/locations";
import { legacyDeliveryAddress, requestAddress, savedDeliveryAddress } from "@/lib/db/locations";
import { Prisma } from "@prisma/client";
import type { VolunteerMission, CompletedMissionRecord } from "@/features/volunteer-dashboard/volunteer-types";

export const missionInclude = { donation: { include: { donor: { include: { user: true } }, pickupAddress: true } }, ngo: { include: { user: { include: { addresses: true } } } }, foodRequest: true, deliveryReceipt: true, distributionRecord: true, challenges: { select: { id: true, kind: true, consumedAt: true } } } satisfies Prisma.ClaimInclude;
export type MissionRow = Prisma.ClaimGetPayload<{ include: typeof missionInclude }>;

export function missionDto(row: MissionRow): VolunteerMission {
  const donation = row.donation;
  const dropoff = savedDeliveryAddress(row.deliveryAddressSnapshot) || (row.foodRequest ? requestAddress(row.foodRequest) : legacyDeliveryAddress(row.ngo.user.addresses));
  const locationVisible = !["CANCELLED", "EXPIRED"].includes(row.status);
  const pickupCoordinates = locationVisible ? coordinates(donation.pickupLatitude, donation.pickupLongitude) : undefined;
  const dropoffCoordinates = locationVisible ? dropoff?.coordinates : undefined;
  return { volunteerProfileId: row.volunteerProfileId || undefined, pickupWindowStart: donation.windowStart.toISOString(), pickupWindowEnd: donation.windowEnd.toISOString(), id: `mission-${row.id}`, claimId: row.id, updatedAt: row.updatedAt.toISOString(), pickedUpAt: row.pickedUpAt?.toISOString(), deliveredAt: row.deliveredAt?.toISOString(), pickupCoordinates, dropoffCoordinates, claimStatus: row.status, incidentPaused: row.status === "DISPUTED", donorName: donation.donor.organizationName || donation.donor.user.displayName,
    donorAddress: locationVisible ? donation.pickupAddress.addressLine : donation.approximateArea, donorArea: donation.approximateArea, donorPhone: locationVisible ? donation.contactPhone : "", donorContact: locationVisible ? donation.contactName : "",
    ngoName: row.ngo.organizationName, ngoAddress: locationVisible ? dropoff?.addressLine || "" : "", ngoArea: dropoff?.area || row.ngo.serviceAreas.join(", "), ngoPhone: locationVisible ? row.ngo.publicPhone : "", ngoContact: locationVisible ? row.ngo.user.displayName : "",
    foodTitle: donation.title, quantity: `${row.deliveryReceipt?.actualQuantity ?? donation.quantityValue} ${donation.quantityUnit}`, servings: donation.estimatedMeals,
    storageCondition: donation.storageCondition, safeDeadline: donation.safePickupDeadline.toISOString(), distanceKm: pickupCoordinates && dropoffCoordinates ? distanceKm(pickupCoordinates, dropoffCoordinates) : 0,
    estimatedTimeMins: 0, currentStage: row.routeStage, pickupOtp: "", dropoffOtp: "", cargoTemp: 0, riderSpeed: 0,
    urgency: donation.safePickupDeadline.getTime() - Date.now() <= 45 * 60_000 ? "critical" : "normal", assignedAt: (row.assignedAt || row.createdAt).toISOString(),
    routeStops: { pickup: locationVisible ? donation.pickupAddress.addressLine : donation.approximateArea, expressway: "Route not measured", dropoff: locationVisible ? dropoff?.addressLine || "" : "" } };
}

export function missionHistoryDto(row: MissionRow): CompletedMissionRecord {
  const mission = missionDto(row);
  const at = row.deliveredAt || row.updatedAt;
  const duration = row.assignedAt ? Math.max(0, Math.round((at.getTime() - row.assignedAt.getTime()) / 60_000)) : 0;
  return { id: row.id, missionNumber: row.id, date: new Intl.DateTimeFormat("bn-BD", { timeZone: "Asia/Dhaka", dateStyle: "medium" }).format(at),
    time: new Intl.DateTimeFormat("bn-BD", { timeZone: "Asia/Dhaka", timeStyle: "short" }).format(at),
    donorName: mission.donorName, donorArea: mission.donorArea, ngoName: mission.ngoName, ngoArea: mission.ngoArea,
    foodTitle: mission.foodTitle, quantity: mission.quantity, servings: row.distributionRecord?.mealsDistributed ?? 0,
    distanceKm: mission.distanceKm, durationMins: duration, deliverySpeedNote: `${duration} minutes`, cargoTempHandover: 0,
    foodValueSavedEstimated: 0, verificationToken: row.challenges.find((c) => c.kind === "DELIVERY" && c.consumedAt)?.id || "",
    status: ["DISPUTED", "CANCELLED"].includes(row.status) ? "disputed" : "delivered_verified", ngoRating: 0, ngoFeedback: row.status === "DISPUTED" ? "Incident review pending" : row.status === "CANCELLED" ? "Batch rejected after incident review" : row.deliveryReceipt ? `Receipt recorded: ${row.deliveryReceipt.foodCondition}` : "NGO receipt pending" };
}
