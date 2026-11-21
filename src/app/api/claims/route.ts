import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/lib/constants/roles";
import { ApiError, apiError, object, requireAuth, textField } from "@/lib/api";
import { claimDto, claimVisibility, donationDto, donationInclude, reserveDonation } from "@/lib/db/rescue";
import { legacyDeliveryAddress, requestAddress, savedDeliveryAddress } from "@/lib/db/locations";
import { refreshRequestProgress } from "@/lib/db/request-progress";

const include = { donation: { include: donationInclude }, ngo: { include: { user: { include: { addresses: true } } } }, volunteer: { include: { user: true } }, foodRequest: true, deliveryReceipt: { select: { id: true } }, distributionRecord: { select: { id: true } } } as const;

export async function GET(request: Request) {
  try {
    const { user } = await requireAuth();
    const params = new URL(request.url).searchParams;
    const id = params.get("id");
    const rows = await prisma.claim.findMany({ where: { AND: [claimVisibility(user), ...(id ? [{ id }] : []), ...(params.get("donationId") ? [{ donationId: params.get("donationId")! }] : [])] }, include, orderBy: { updatedAt: "desc" }, take: 200 });
    if (id) {
      const row = rows[0];
      if (!row) throw new ApiError(404, "Claim not found for your account.");
      const destinationVisible = user.role !== "VOLUNTEER" || !["CANCELLED", "EXPIRED"].includes(row.status);
      const details = {
        receiptRecorded: Boolean(row.deliveryReceipt),
        distributionRecorded: Boolean(row.distributionRecord),
        claim: claimDto(row),
        donation: donationDto(row.donation, user),
        donorOrganization: row.donation.donor.organizationName || row.donation.donor.user.displayName,
        donorVerified: row.donation.donor.verificationStatus === "VERIFIED",
        receiverNgo: { id: row.ngo.id, name: row.ngo.organizationName, rating: row.ngo.rating, completedRescues: row.ngo.completedRescues, serviceAreas: row.ngo.serviceAreas, contactName: row.ngo.user.displayName, contactPhone: row.ngo.publicPhone },
        volunteer: row.volunteer ? { id: row.volunteer.id, displayName: row.volunteer.user.displayName, phone: row.volunteer.user.phone, verificationStatus: row.volunteer.verificationStatus, transportMethod: row.volunteer.transportMethod, completedRescues: row.volunteer.completedRescues } : undefined,
        deliveryAddress: destinationVisible ? savedDeliveryAddress(row.deliveryAddressSnapshot) || (row.foodRequest ? requestAddress(row.foodRequest) : legacyDeliveryAddress(row.ngo.user.addresses)) : undefined,
      };
      return NextResponse.json({ claim: claimDto(row), details });
    }
    return NextResponse.json({ success: true, count: rows.length, claims: rows.map(claimDto) });
  } catch (error) { return apiError(error); }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireAuth(UserRole.NGO);
    const body = object(await request.json());
    const id = await reserveDonation(textField(body.donationId, "donationId", 160), user, textField(body.foodRequestId, "foodRequestId", 160, true) || undefined, body.allergenReviewAcknowledged === true);
    const row = await prisma.claim.findUniqueOrThrow({ where: { id }, include: { ngo: { include: { user: true } }, volunteer: { include: { user: true } } } });
    return NextResponse.json({ success: true, claim: claimDto(row) }, { status: 201 });
  } catch (error) { return apiError(error); }
}

export async function PATCH(request: Request) {
  try {
    const { user } = await requireAuth(UserRole.NGO);
    const body = object(await request.json());
    if (body.status !== "CANCELLED") throw new ApiError(422, "Pickup and delivery require their dedicated verification workflow.");
    const id = textField(body.id, "id", 160);
    const existing = await prisma.claim.findFirst({ where: { id, ngoProfileId: user.ngoProfileId } });
    if (!existing) throw new ApiError(404, "Claim not found for your account.");
    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM donations WHERE id = ${existing.donationId} FOR UPDATE`;
      const claim = await tx.claim.findUniqueOrThrow({ where: { id } });
      if (!["RESERVED", "ASSIGNED"].includes(claim.status)) throw new ApiError(409, "This claim can no longer be released.");
      await tx.claim.update({ where: { id }, data: { status: "CANCELLED" } });
      const donation = await tx.donation.findUniqueOrThrow({ where: { id: claim.donationId } });
      await tx.donation.update({ where: { id: donation.id }, data: { status: donation.safePickupDeadline.getTime() > Date.now() ? "AVAILABLE" : "EXPIRED" } });
      if (claim.foodRequestId) await refreshRequestProgress(tx, claim.foodRequestId);
    });
    const row = await prisma.claim.findUniqueOrThrow({ where: { id }, include: { ngo: { include: { user: true } }, volunteer: { include: { user: true } } } });
    return NextResponse.json({ claim: claimDto(row) });
  } catch (error) { return apiError(error); }
}
