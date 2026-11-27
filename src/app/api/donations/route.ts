import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/lib/constants/roles";
import { ApiError, apiError, object, requireAuth, textField } from "@/lib/api";
import { donationDto, donationInclude, expireOpenDonations, findVisibleDonation, positiveNumber, publishDonation, visibleDonations } from "@/lib/db/rescue";
import { refreshRequestProgress } from "@/lib/db/request-progress";
import { emitRescueEvent } from "@/lib/realtime/rescue-events";
import { validateDonationTimes } from "@/lib/validators/date-time";

export async function GET(request: Request) {
  try {
    const { user } = await requireAuth();
    await expireOpenDonations();
    const params = new URL(request.url).searchParams;
    const id = params.get("id");
    if (id) {
      const row = await findVisibleDonation(id, user);
      return NextResponse.json({ donation: donationDto(row, user) });
    }
    const donations = await prisma.donation.findMany({ where: visibleDonations(user), include: donationInclude, orderBy: { createdAt: "desc" }, take: 200 });
    return NextResponse.json({ success: true, count: donations.length, donations: donations.map((row) => donationDto(row, user)) });
  } catch (error) { return apiError(error); }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireAuth(UserRole.DONOR);
    const donation = await publishDonation(object(await request.json()), user);
    emitRescueEvent("donation.created", `${donation.title} (${donation.estimatedMeals} meals) posted`);
    return NextResponse.json({ success: true, donation: donationDto(donation, user) }, { status: 201 });
  } catch (error) { return apiError(error); }
}

export async function PATCH(request: Request) {
  try {
    const { user } = await requireAuth(UserRole.DONOR);
    if (!user.donorProfileId) throw new ApiError(403, "A donor profile is required.");
    const body = object(await request.json());
    const id = textField(body.id, "id", 160);
    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM donations WHERE id = ${id} FOR UPDATE`;
      const current = await tx.donation.findFirst({ where: { id, donorProfileId: user.donorProfileId } });
      if (!current) throw new ApiError(404, "Donation not found for your account.");
      if (body.action === "cancel") {
        if (!["DRAFT", "PUBLISHED", "AVAILABLE", "RESERVED", "ASSIGNED"].includes(current.status)) throw new ApiError(409, "This donation can no longer be cancelled.");
        const cancellationReason = textField(body.reason, "cancellationReason", 1000);
        const activeClaims = await tx.claim.findMany({
          where: { donationId: id, status: { in: ["RESERVED", "ASSIGNED"] } },
          include: { ngo: true, volunteer: true },
        });
        const activeClaimIds = activeClaims.map((claim) => claim.id);
        await tx.claim.updateMany({ where: { donationId: id, status: { in: ["RESERVED", "ASSIGNED"] } }, data: { status: "CANCELLED" } });
        if (activeClaimIds.length) {
          await tx.handoverChallenge.updateMany({ where: { claimId: { in: activeClaimIds }, consumedAt: null }, data: { expiresAt: new Date() } });
        }
        await tx.donation.update({ where: { id }, data: { status: "CANCELLED", cancelledAt: new Date(), cancellationReason } });
        const notifyRows = activeClaims.flatMap((claim) => {
          const targets = [
            { userId: claim.ngo.userId, href: `/ngo/claims/${claim.id}` },
            ...(claim.volunteer ? [{ userId: claim.volunteer.userId, href: "/volunteer/dashboard" }] : []),
          ];
          return targets.map((t) => ({
            userId: t.userId,
            type: "CLAIM" as const,
            title: "Donation cancelled by donor",
            message: `${current.title}: ${cancellationReason}`,
            href: t.href,
          }));
        });
        if (notifyRows.length) await tx.notification.createMany({ data: notifyRows });
        for (const requestId of [...new Set(activeClaims.map((claim) => claim.foodRequestId).filter((value): value is string => Boolean(value)))].sort()) await refreshRequestProgress(tx, requestId);
      } else if (body.action === "update") {
        if (!["DRAFT", "PUBLISHED", "AVAILABLE"].includes(current.status)) throw new ApiError(409, "Claimed or closed donations cannot be edited.");
        const input = object(body.input), quantity = object(input.quantity);
        const safePickupDeadline = textField(input.safePickupDeadline, "safePickupDeadline", 100);
        const windowStart = textField(input.pickupWindowStart, "pickupWindowStart", 100);
        const windowEnd = textField(input.pickupWindowEnd, "pickupWindowEnd", 100);
        const errors = validateDonationTimes({ preparationTime: current.preparationTime.toISOString(), safePickupDeadline, pickupWindowStart: windowStart, pickupWindowEnd: windowEnd });
        if (Object.keys(errors).length) throw new ApiError(422, "Check pickup times.", errors as Record<string, string>);
        await tx.donation.update({ where: { id }, data: { title: textField(input.title, "title", 160), description: textField(input.description, "description", 2000, true), quantityValue: positiveNumber(quantity.value, "quantity"), estimatedMeals: positiveNumber(quantity.estimatedMeals, "estimated meals", true), safePickupDeadline: new Date(safePickupDeadline), windowStart: new Date(windowStart), windowEnd: new Date(windowEnd), specialInstructions: textField(input.specialInstructions, "specialInstructions", 1000, true) } });
      } else if (body.action === "publish") {
        if (current.status !== "DRAFT") throw new ApiError(409, "Only saved drafts can be published.");
        const donor = await tx.donorProfile.findUniqueOrThrow({ where: { id: user.donorProfileId! } });
        if (donor.verificationStatus !== "VERIFIED") {
          throw new ApiError(
            403,
            donor.verificationStatus === "REJECTED"
              ? "Donor verification was rejected. Contact the project administrator."
              : "Donor verification is pending. Contact the project administrator.",
          );
        }
        const errors = validateDonationTimes({
          preparationTime: current.preparationTime.toISOString(),
          safePickupDeadline: current.safePickupDeadline.toISOString(),
          pickupWindowStart: current.windowStart.toISOString(),
          pickupWindowEnd: current.windowEnd.toISOString(),
          requireFutureDeadline: true,
        });
        if (Object.keys(errors).length) throw new ApiError(422, "Check the food and pickup times before publishing.", errors as Record<string, string>);
        await tx.donation.update({ where: { id }, data: { status: "AVAILABLE", publishedAt: new Date() } });
        await tx.donorProfile.update({ where: { id: user.donorProfileId! }, data: { totalDonations: { increment: 1 } } });
        await tx.notification.create({ data: { userId: user.id, type: "SYSTEM", title: "Donation published", message: current.title, href: `/donor/donations/${id}` } });
      } else throw new ApiError(422, "Use a supported donation operation.");
    });
    if (body.action === "cancel") emitRescueEvent("donation.cancelled", `Donation ${id} cancelled by donor`);
    if (body.action === "publish") emitRescueEvent("donation.created", `Draft donation ${id} published by donor`);
    return NextResponse.json({ donation: donationDto(await findVisibleDonation(id, user), user) });
  } catch (error) { return apiError(error); }
}
