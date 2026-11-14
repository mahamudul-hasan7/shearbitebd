import { NextResponse } from "next/server";
import { apiError, object, requireAuth, textField, ApiError } from "@/lib/api";
import { UserRole } from "@/lib/constants/roles";
import { prisma } from "@/lib/prisma";
import { claimVisibility } from "@/lib/db/rescue-access";
import { createIncident, listIncidents, reviewIncident } from "@/lib/db/incidents";

export async function GET(request: Request) {
  try { const { user } = await requireAuth(); return NextResponse.json({ incidents: await listIncidents(new URL(request.url).searchParams, user) }); }
  catch (error) { return apiError(error); }
}
export async function POST(request: Request) {
  try {
    const { user } = await requireAuth();
    const body = object(await request.json());
    let claimId = textField(body.claimId, "claimId", 160, true);
    if (!claimId) {
      const donationId = textField(body.donationId, "donationId", 160);
      const claim = await prisma.claim.findFirst({ where: { AND: [{ donationId }, claimVisibility(user)] }, orderBy: { createdAt: "desc" } });
      if (!claim) throw new ApiError(404, "Claim not found for your account.");
      claimId = claim.id;
    }
    const result = await createIncident(claimId, object(body.input), user);
    return NextResponse.json(result, { status: result.created ? 201 : 200 });
  } catch (error) { return apiError(error); }
}
export async function PATCH(request: Request) {
  try {
    const { user } = await requireAuth(UserRole.ADMIN);
    const body = object(await request.json());
    return NextResponse.json({ incident: await reviewIncident(textField(body.id, "incident id", 160), body, { userId: user.id, label: user.displayName }) });
  } catch (error) { return apiError(error); }
}
