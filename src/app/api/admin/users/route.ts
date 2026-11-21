import { NextResponse } from "next/server";
import { apiError, requireAuth, object } from "@/lib/api";
import { UserRole } from "@/lib/constants/roles";
import { adminUsers, adminUser, changeUserAccess } from "@/lib/db/admin-users";
export async function GET(request: Request) {
  try {
    await requireAuth(UserRole.ADMIN);
    const params = new URL(request.url).searchParams;
    return NextResponse.json(
      await (params.get("id")
        ? adminUser(params.get("id")!)
        : adminUsers(params)),
    );
  } catch (error) {
    return apiError(error);
  }
}
export async function PATCH(request: Request) {
  try {
    const { user } = await requireAuth(UserRole.ADMIN);
    return NextResponse.json(
      await changeUserAccess(object(await request.json()), user),
    );
  } catch (error) {
    return apiError(error);
  }
}
