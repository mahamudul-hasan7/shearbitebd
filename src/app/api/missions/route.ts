import { NextResponse } from "next/server";
import { MissionRouteStage } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/lib/constants/roles";
import { apiError, ApiError, object, requireAuth, textField } from "@/lib/api";
import { missionDto, missionHistoryDto, missionInclude } from "@/lib/db/missions";
import { withClaimLock } from "@/lib/db/handover";
import { enumField } from "@/lib/db/rescue";

export async function GET(request: Request) {
  try {
    const { user } = await requireAuth(UserRole.VOLUNTEER);
    if (!user.volunteerProfileId) throw new ApiError(403, "A volunteer profile is required.");
    const id = new URL(request.url).searchParams.get("claimId");
    if (id) {
      const row = await prisma.claim.findFirst({ where: { id, volunteerProfileId: user.volunteerProfileId }, include: missionInclude });
      if (!row) throw new ApiError(404, "Mission not found for your account.");
      return NextResponse.json({ mission: missionDto(row) });
    }
    const rows = await prisma.claim.findMany({ where: { volunteerProfileId: user.volunteerProfileId, status: { in: ["ASSIGNED", "PICKED_UP", "DELIVERED", "DISTRIBUTED", "DISPUTED", "CANCELLED"] } }, include: missionInclude, orderBy: { updatedAt: "desc" }, take: 100 });
    const active = rows.find((r) => r.status === "ASSIGNED" || r.status === "PICKED_UP" || (r.status === "DISPUTED" && ["ASSIGNED", "PICKED_UP"].includes(r.incidentHoldStatus || "")));
    const completed = rows.filter((r) => ["DELIVERED", "DISTRIBUTED", "DISPUTED", "CANCELLED"].includes(r.status) && r.challenges.some((c) => c.kind === "DELIVERY" && c.consumedAt));
    const volunteer = await prisma.volunteerProfile.findUniqueOrThrow({ where: { id: user.volunteerProfileId }, select: { completedRescues: true } });
    return NextResponse.json({ activeMission: active ? missionDto(active) : null, completedHistory: completed.map(missionHistoryDto), completedRescues: volunteer.completedRescues });
  } catch (error) { return apiError(error); }
}

export async function PATCH(request: Request) {
  try {
    const { user } = await requireAuth(UserRole.VOLUNTEER);
    const body = object(await request.json());
    const stage = enumField(body.stage, Object.values(MissionRouteStage), "mission stage");
    const id = textField(body.claimId, "claimId", 160);
    await withClaimLock(id, user, async (tx, claim) => {
      if (!user.volunteerProfileId || claim.volunteerProfileId !== user.volunteerProfileId || claim.volunteer?.verificationStatus !== "VERIFIED") throw new ApiError(403, "Only the assigned volunteer can update this mission.");
      const next = claim.status === "ASSIGNED" ? { assigned: "en_route_pickup", en_route_pickup: "at_pickup" }[claim.routeStage as "assigned" | "en_route_pickup"] : claim.status === "PICKED_UP" && claim.routeStage === "cargo_loaded" ? "en_route_dropoff" : undefined;
      if (!next || stage !== next) throw new ApiError(409, "Follow the mission sequence. Pickup and completion require OTP verification.");
      await tx.claim.update({ where: { id }, data: { routeStage: stage } });
    });
    return NextResponse.json({ success: true });
  } catch (error) { return apiError(error); }
}
