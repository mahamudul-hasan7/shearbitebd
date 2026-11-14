import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { accountInclude, toAuthAccount } from "@/lib/db/accounts";
import { UserRole } from "@/lib/constants/roles";
import { currentAuth } from "@/lib/auth/server";
import { publicUser } from "@/lib/auth/session-store";

export async function GET(request: Request) {
  const auth = await currentAuth();
  if (!auth) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  if (auth.user.role !== UserRole.ADMIN) return NextResponse.json({ error: "Access denied." }, { status: 403 });
  const { searchParams } = new URL(request.url);
  const roleParam = searchParams.get("role");

  let filterRole: UserRole | undefined;
  if (roleParam) {
    const upper = roleParam.toUpperCase();
    if (upper in UserRole) {
      filterRole = upper as UserRole;
    }
  }

  const users = await prisma.user.findMany({ where: { role: filterRole }, include: accountInclude });
  return NextResponse.json({
    success: true,
    count: users.length,
    users: users.map((user) => publicUser(toAuthAccount(user))),
  });
}
