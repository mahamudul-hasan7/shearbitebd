import { lockActiveAccount } from "@/lib/db/account-access";
import { coordinates, distanceKm } from "@/lib/locations";
import { legacyDeliveryAddress, requestAddress, savedDeliveryAddress } from "@/lib/db/locations";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/lib/constants/roles";
import { ApiError, apiError, object, requireAuth, textField } from "@/lib/api";
import type { AvailableDispatch } from "@/features/volunteer-dashboard/volunteer-types";
import { Prisma } from "@prisma/client";
import { activeVolunteerMission } from "@/lib/db/rescue-access";
import { volunteerDutyDto } from "@/lib/db/volunteer-duty";

const include = { donation: { include: { donor: { include: { user: true } }, pickupAddress: true } }, ngo: { include: { user: { include: { addresses: true } } } }, foodRequest: true } satisfies Prisma.ClaimInclude;
type DispatchRow = Prisma.ClaimGetPayload<{ include: typeof include }>;

function dispatchDto(row: DispatchRow, assigned = false): AvailableDispatch {
  const donation = row.donation;
  const delivery = savedDeliveryAddress(row.deliveryAddressSnapshot) || (row.foodRequest ? requestAddress(row.foodRequest) : legacyDeliveryAddress(row.ngo.user.addresses));
  const pickup = coordinates(donation.pickupLatitude, donation.pickupLongitude);
  const measuredDistance = assigned && pickup && delivery?.coordinates ? distanceKm(pickup, delivery.coordinates) : 0;
  const minutes = Math.max(0, Math.floor((donation.safePickupDeadline.getTime() - Date.now()) / 60000));
  return { id: row.id, claimId: row.id, donationId: donation.id, isRealDb: true,
    donorName: donation.donor.organizationName || donation.donor.user.displayName,
    donorArea: assigned ? donation.pickupAddress.addressLine : donation.approximateArea,
    donorPhone: assigned ? donation.contactPhone : "", donorContact: assigned ? donation.contactName : "",
    ngoName: row.ngo.organizationName, ngoArea: assigned ? delivery?.addressLine || row.ngo.serviceAreas.join(", ") : row.foodRequest?.deliveryArea || row.ngo.serviceAreas.join(", "),
    ngoPhone: assigned ? row.ngo.publicPhone : "", ngoContact: assigned ? row.ngo.user.displayName : "",
    foodType: donation.title, quantity: `${donation.quantityValue} ${donation.quantityUnit}`, servings: donation.estimatedMeals,
    expiresInMins: minutes, urgency: minutes <= 45 ? "critical" : minutes <= 90 ? "high" : "normal",
    distanceKm: measuredDistance, storageCondition: donation.storageCondition, dietary: donation.dietaryTypes.join(", "), specialNote: assigned ? donation.specialInstructions || undefined : undefined };
}

export async function GET() {
  try {
    const { user } = await requireAuth(UserRole.VOLUNTEER);
    if (!user.volunteerProfileId) throw new ApiError(403, "A volunteer profile is required.");
    const rows = await prisma.claim.findMany({ where: { status: "RESERVED", ngo:{user:{isActive:true,deletedAt:null}}, donation: { donor:{user:{isActive:true,deletedAt:null}}, status: "RESERVED", safePickupDeadline: { gt: new Date() } } }, include, orderBy: { reservedAt: "asc" } });
    const active = await prisma.claim.findFirst({ where: { volunteerProfileId: user.volunteerProfileId, ...activeVolunteerMission }, include });
    const profile = await prisma.volunteerProfile.findUniqueOrThrow({ where: { id: user.volunteerProfileId } });
    return NextResponse.json({ success: true, count: rows.length, dispatches: rows.map((row) => dispatchDto(row)), activeDispatch: active ? dispatchDto(active, true) : null, duty: volunteerDutyDto(profile, Boolean(active)) });
  } catch (error) { return apiError(error); }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireAuth(UserRole.VOLUNTEER);
    if (!user.volunteerProfileId) throw new ApiError(403, "A volunteer profile is required.");
    const body = object(await request.json());
    const id = textField(body.claimId, "claimId", 160);
    await prisma.$transaction(async (tx) => {
      // One volunteer can accept only one active mission; never trust supplied volunteerId.
      await lockActiveAccount(tx, user.id);
      const volunteer = await tx.volunteerProfile.findUniqueOrThrow({ where: { id: user.volunteerProfileId } });
      if (volunteer.verificationStatus !== "VERIFIED") throw new ApiError(403, "Volunteer verification is pending.");
      if (!volunteer.isOnDuty) throw new ApiError(409, "Turn duty ON before accepting a new mission.");
      if (await tx.claim.findFirst({ where: { volunteerProfileId: volunteer.id, ...activeVolunteerMission } })) throw new ApiError(409, "Complete your active mission first.");
      const previous = await tx.claim.findUnique({ where: { id } });
      if (!previous) throw new ApiError(404, "Dispatch not found.");
      await tx.$queryRaw`SELECT id FROM donations WHERE id = ${previous.donationId} FOR UPDATE`;
      const claim = await tx.claim.findUniqueOrThrow({ where: { id }, include: { donation: { include: { donor: true } }, ngo: true } });
      if (await tx.user.count({where:{id:{in:[claim.donation.donor.userId,claim.ngo.userId]},isActive:true,deletedAt:null}}) !== 2) throw new ApiError(409, "A rescue participant account is unavailable.");
      if (claim.status !== "RESERVED" || claim.donation.status !== "RESERVED" || claim.donation.safePickupDeadline.getTime() <= Date.now()) throw new ApiError(409, "Dispatch is already accepted or expired.");
      await tx.claim.update({ where: { id }, data: { status: "ASSIGNED", routeStage: "assigned", volunteerProfileId: volunteer.id, assignedAt: new Date() } });
      await tx.donation.update({ where: { id: claim.donationId }, data: { status: "ASSIGNED" } });
      await tx.notification.createMany({ data: [
        { userId: claim.donation.donor.userId, type: "VOLUNTEER", title: "Volunteer assigned", message: user.displayName, href: `/donor/donations/${claim.donationId}` },
        { userId: claim.ngo.userId, type: "VOLUNTEER", title: "Volunteer assigned", message: user.displayName, href: `/ngo/claims/${id}` },
        { userId: user.id, type: "VOLUNTEER", title: "Mission accepted", message: claim.donation.title, href: "/volunteer/dashboard" },
      ] });
    });
    const claim = await prisma.claim.findUniqueOrThrow({ where: { id }, include });
    return NextResponse.json({ success: true, claimId: id, dispatch: dispatchDto(claim, true) });
  } catch (error) { return apiError(error); }
}
