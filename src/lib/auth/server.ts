import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createSession, resolveSession, SESSION_COOKIE } from "@/lib/auth/session-store";
import type { AuthAccount } from "@/lib/db/accounts";
import { redirect } from "next/navigation";
import { UserRole } from "@/lib/constants/roles";

export async function currentAuth() {
  return resolveSession((await cookies()).get(SESSION_COOKIE)?.value);
}

export async function requirePortalRole(role: UserRole) {
  const auth = await currentAuth();
  if (!auth) redirect("/login");
  if (auth.user.role !== role) redirect("/unauthorized");
  return auth;
}

export async function authenticatedResponse(user: AuthAccount, remember: boolean, status = 200) {
  const jar = await cookies();
  const created = await createSession(user.id, remember, jar.get(SESSION_COOKIE)?.value);
  const auth = (await resolveSession(created.token))!;
  const response = NextResponse.json({ success: true, user: { ...auth.session, phone: user.phone, profile: user.profile }, session: auth.session }, { status });
  response.headers.set("Cache-Control", "no-store");
  response.cookies.set(SESSION_COOKIE, created.token, {
    httpOnly: true, sameSite: "lax", path: "/",
    secure: process.env.AUTH_COOKIE_SECURE === "true",
    ...(remember ? { maxAge: created.maxAge } : {}),
  });
  return response;
}

export async function readObjectBody(request: Request): Promise<Record<string, unknown> | undefined> {
  try {
    const value: unknown = await request.json();
    return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
  } catch { return undefined; }
}
