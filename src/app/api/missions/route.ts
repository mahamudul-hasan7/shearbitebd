import { NextResponse } from "next/server";
import { MissionRouteStage } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/lib/constants/roles";
import { apiError, ApiError, object, requireAuth, textField } from "@/lib/api";
import { missionDto, missionHistoryDto, missionInclude } from "@/lib/db/missions";
import { withClaimLock } from "@/lib/db/handover";
import { enumField, expireOpenDonations } from "@/lib/db/rescue";
import { emitRescueEvent } from "@/lib/realtime/rescue-events";

export async function GET(request: Request) {
  try {
    const { user } = await requireAuth(UserRole.VOLUNTEER);
    if (!user.volunteerProfileId) throw new ApiError(403, "A volunteer profile is required.");
    await expireOpenDonations();
    const id = new URL(request.url).searchParams.get("claimId");
    if (id) {
      const row = await prisma.claim.findFirst({ where: { id, volunteerProfileId: user.volunteerProfileId }, include: missionInclude });
      if (!row) throw new ApiError(404, "Mission not found for your account.");
      return NextResponse.json({ mission: missionDto(row) });
    }
    const rows = await prisma.claim.findMany({ where: { volunteerProfileId: user.volunteerProfileId, status: { in: ["ASSIGNED", "PICKED_UP", "DELIVERED", "DISTRIBUTED", "DISPUTED", "CANCELLED", "EXPIRED"] } }, include: missionInclude, orderBy: { updatedAt: "desc" }, take: 100 });
    const active = rows.find((r) => r.status === "ASSIGNED" || r.status === "PICKED_UP" || (r.status === "DISPUTED" && ["ASSIGNED", "PICKED_UP"].includes(r.incidentHoldStatus || "")));
    const completed = rows.filter((r) => ["DELIVERED", "DISTRIBUTED", "DISPUTED", "CANCELLED", "EXPIRED"].includes(r.status));
    const volunteer = await prisma.volunteerProfile.findUniqueOrThrow({ where: { id: user.volunteerProfileId }, select: { completedRescues: true } });
    return NextResponse.json({ activeMission: active ? missionDto(active) : null, completedHistory: completed.map(missionHistoryDto), completedRescues: volunteer.completedRescues });
  } catch (error) { return apiError(error); }
}

export async function PATCH(request: Request) {
  try {
    const { user } = await requireAuth(UserRole.VOLUNTEER);
    const body = object(await request.json());
    const id = textField(body.claimId, "claimId", 160);
    if (body.action === "release") {
      let releasedTitle = "";
      await withClaimLock(id, user, async (tx, claim) => {
        if (!user.volunteerProfileId || claim.volunteerProfileId !== user.volunteerProfileId || claim.volunteer?.verificationStatus !== "VERIFIED") {
          throw new ApiError(403, "Only the assigned volunteer can release this mission.");
        }
        if (claim.status !== "ASSIGNED" || claim.donation.status !== "ASSIGNED") {
          throw new ApiError(409, "Only missions before pickup can be released back to dispatch.");
        }
        const now = new Date();
        releasedTitle = claim.donation.title;
        await tx.claim.update({
          where: { id },
          data: { status: "RESERVED", volunteerProfileId: null, assignedAt: null, routeStage: "assigned" },
        });
        await tx.donation.update({ where: { id: claim.donationId }, data: { status: "RESERVED" } });
        await tx.handoverChallenge.updateMany({ where: { claimId: id, consumedAt: null }, data: { expiresAt: now } });
        await tx.notification.createMany({
          data: [
            { userId: claim.donation.donor.userId, type: "VOLUNTEER", title: "Volunteer released mission", message: `${user.displayName} released ${claim.donation.title}. Returned to dispatch.`, href: `/donor/donations/${claim.donationId}` },
            { userId: claim.ngo.userId, type: "VOLUNTEER", title: "Volunteer released mission", message: `${user.displayName} released ${claim.donation.title}. Finding another rider.`, href: `/ngo/claims/${id}` },
          ],
        });
      });
      emitRescueEvent("mission.released", `${user.displayName} released ${releasedTitle || "rescue mission"}`);
      return NextResponse.json({ success: true, released: true });
    }
    const stage = enumField(body.stage, Object.values(MissionRouteStage), "mission stage");
    await withClaimLock(id, user, async (tx, claim) => {
      if (!user.volunteerProfileId || claim.volunteerProfileId !== user.volunteerProfileId || claim.volunteer?.verificationStatus !== "VERIFIED") throw new ApiError(403, "Only the assigned volunteer can update this mission.");
      const next = claim.status === "ASSIGNED" ? { assigned: "en_route_pickup", en_route_pickup: "at_pickup" }[claim.routeStage as "assigned" | "en_route_pickup"] : claim.status === "PICKED_UP" && claim.routeStage === "cargo_loaded" ? "en_route_dropoff" : undefined;
      if (!next || stage !== next) throw new ApiError(409, "Follow the mission sequence. Pickup and completion require OTP verification.");
      await tx.claim.update({ where: { id }, data: { routeStage: stage } });
    });
    return NextResponse.json({ success: true });
  } catch (error) { return apiError(error); }
}
