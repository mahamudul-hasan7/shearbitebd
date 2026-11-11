import { NextResponse } from "next/server";
import { db } from "@/lib/db/database";
import { UserRole } from "@/lib/constants/roles";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roleParam = searchParams.get("role");

  let filterRole: UserRole | undefined;
  if (roleParam) {
    const upper = roleParam.toUpperCase();
    if (upper in UserRole) {
      filterRole = upper as UserRole;
    }
  }

  const users = db.users.findMany(filterRole);
  return NextResponse.json({
    success: true,
    count: users.length,
    users: users.map(({ password, ...u }) => u),
  });
}
