import { NextResponse } from "next/server";
import { apiError, object, requireAuth } from "@/lib/api";
import { UserRole } from "@/lib/constants/roles";
import { adminRescues, discardRescue } from "@/lib/db/admin";
import { expireOpenDonations } from "@/lib/db/rescue";
import { emitRescueEvent } from "@/lib/realtime/rescue-events";
export async function GET(request: Request) {
  try {
    await requireAuth(UserRole.ADMIN);
    await expireOpenDonations();
    const params = new URL(request.url).searchParams;
    return NextResponse.json(await adminRescues(params));
  } catch (error) {
    return apiError(error);
  }
}
export async function POST(request: Request) {
  try {
    const { user } = await requireAuth(UserRole.ADMIN);
    const result = await discardRescue(object(await request.json()), user);
    emitRescueEvent("rescue.closed", `Admin closed rescue ${result.title}`);
    return NextResponse.json({ success: true, rescue: result });
  } catch (error) {
    return apiError(error);
  }
}
