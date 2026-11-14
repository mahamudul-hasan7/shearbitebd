import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, apiError, object, requireAuth } from "@/lib/api";
import { UserRole } from "@/lib/constants/roles";
import { volunteerDutyDto } from "@/lib/db/volunteer-duty";
import { activeVolunteerMission } from "@/lib/db/rescue-access";

export async function GET() {
  try {
    const { user } = await requireAuth(UserRole.VOLUNTEER);
    if (!user.volunteerProfileId) throw new ApiError(403, "A volunteer profile is required.");
    const profile = await prisma.volunteerProfile.findUniqueOrThrow({ where: { id: user.volunteerProfileId } });
    const active = await prisma.claim.findFirst({ where: { volunteerProfileId: profile.id, ...activeVolunteerMission }, select: { id: true } });
    return NextResponse.json({ duty: volunteerDutyDto(profile, Boolean(active)) });
  } catch (error) { return apiError(error); }
}

export async function PATCH(request: Request) {
  try {
    const { user } = await requireAuth(UserRole.VOLUNTEER);
    if (!user.volunteerProfileId) throw new ApiError(403, "A volunteer profile is required.");
    const body = object(await request.json());
    if (typeof body.isOnDuty !== "boolean") throw new ApiError(422, "Choose duty ON or OFF.");
    const isOnDuty = body.isOnDuty;
    const profile = await prisma.$transaction(async (tx) => {
      // The assignment endpoint locks this same row: OFF and accepting a mission cannot bypass each other.
      await tx.$queryRaw`SELECT id FROM users WHERE id = ${user.id} FOR UPDATE`;
      const current = await tx.volunteerProfile.findUniqueOrThrow({ where: { id: user.volunteerProfileId } });
      if (isOnDuty && current.verificationStatus !== "VERIFIED") throw new ApiError(403, "Volunteer verification is required before going on duty.");
      if (current.isOnDuty === isOnDuty) return current;
      return tx.volunteerProfile.update({ where: { id: current.id }, data: {
        isOnDuty, dutyStartedAt: isOnDuty ? new Date() : null, dutyVersion: { increment: 1 },
      } });
    });
    const active = await prisma.claim.findFirst({ where: { volunteerProfileId: profile.id, ...activeVolunteerMission }, select: { id: true } });
    return NextResponse.json({ duty: volunteerDutyDto(profile, Boolean(active)) });
  } catch (error) { return apiError(error); }
}
