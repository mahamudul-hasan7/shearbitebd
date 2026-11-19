import { NextResponse } from "next/server";
import { apiError, requireAuth } from "@/lib/api";
import { UserRole } from "@/lib/constants/roles";
import { adminReports, adminReport } from "@/lib/db/admin";
export async function GET(request: Request) {
  try {
    await requireAuth(UserRole.ADMIN);
    const params = new URL(request.url).searchParams;
    return NextResponse.json(
      await (params.get("id")
        ? adminReport(params.get("id")!)
        : adminReports(params)),
    );
  } catch (error) {
    return apiError(error);
  }
}
