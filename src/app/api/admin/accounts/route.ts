import { NextResponse } from "next/server";
import { apiError, requireAuth, object } from "@/lib/api";
import { UserRole } from "@/lib/constants/roles";
import { adminAccounts, adminAccount, reviewAccount } from "@/lib/db/admin";
export async function GET(request: Request) {
  try {
    await requireAuth(UserRole.ADMIN);
    const params = new URL(request.url).searchParams;
    return NextResponse.json(
      await (params.get("id")
        ? adminAccount(params.get("id")!)
        : adminAccounts(params)),
    );
  } catch (error) {
    return apiError(error);
  }
}
export async function PATCH(request: Request) {
  try {
    const { user } = await requireAuth(UserRole.ADMIN);
    return NextResponse.json(
      await reviewAccount(object(await request.json()), user),
    );
  } catch (error) {
    return apiError(error);
  }
}
