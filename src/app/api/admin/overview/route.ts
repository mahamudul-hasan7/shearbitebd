import { NextResponse } from "next/server";
import { apiError, requireAuth } from "@/lib/api";
import { UserRole } from "@/lib/constants/roles";
import { adminOverview } from "@/lib/db/admin";
import { expireOpenDonations } from "@/lib/db/rescue";
export async function GET() {
  try {
    await requireAuth(UserRole.ADMIN);
    await expireOpenDonations();
    return NextResponse.json(await adminOverview());
  } catch (error) {
    return apiError(error);
  }
}
