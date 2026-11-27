import { NextResponse } from "next/server";
import { NGOTeamRole } from "@prisma/client";
import { ApiError, apiError, object, requireAuth, textField } from "@/lib/api";
import { UserRole } from "@/lib/constants/roles";
import { prisma } from "@/lib/prisma";

const ASSIGNABLE_ROLES = [
  NGOTeamRole.COORDINATOR,
  NGOTeamRole.FIELD_STAFF,
  NGOTeamRole.VIEWER,
] as const;

export async function GET() {
  try {
    const { user } = await requireAuth(UserRole.NGO);
    if (!user.ngoProfileId) throw new ApiError(403, "NGO profile required.");
    const members = await prisma.nGOTeamMember.findMany({
      where: { ngoProfileId: user.ngoProfileId },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({
      members: members.map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        role: m.role,
        status: m.status,
        createdAt: m.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireAuth(UserRole.NGO);
    if (!user.ngoProfileId) throw new ApiError(403, "NGO profile required.");
    const body = object(await request.json());
    const name = textField(body.name, "name", 120);
    const email = textField(body.email, "email", 180).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ApiError(422, "Enter a valid email address.");
    }
    const role = ASSIGNABLE_ROLES.includes(body.role as (typeof ASSIGNABLE_ROLES)[number])
      ? (body.role as NGOTeamRole)
      : NGOTeamRole.COORDINATOR;

    const existing = await prisma.nGOTeamMember.findFirst({
      where: { ngoProfileId: user.ngoProfileId, email },
    });
    if (existing) {
      throw new ApiError(409, "This team member is already listed.");
    }

    const member = await prisma.nGOTeamMember.create({
      data: {
        ngoProfileId: user.ngoProfileId,
        name,
        email,
        role,
        status: "INVITED",
      },
    });
    return NextResponse.json(
      {
        member: {
          id: member.id,
          name: member.name,
          email: member.email,
          role: member.role,
          status: member.status,
          createdAt: member.createdAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const { user } = await requireAuth(UserRole.NGO);
    if (!user.ngoProfileId) throw new ApiError(403, "NGO profile required.");
    const id = textField(new URL(request.url).searchParams.get("id"), "id", 160);
    const target = await prisma.nGOTeamMember.findFirst({
      where: { id, ngoProfileId: user.ngoProfileId },
    });
    if (!target) throw new ApiError(404, "Team member not found.");
    await prisma.nGOTeamMember.delete({ where: { id: target.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error);
  }
}
