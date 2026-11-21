import { NextResponse, type NextRequest } from "next/server";
import { resolveSession, SESSION_COOKIE } from "@/lib/auth/session-store";
import { UserRole } from "@/lib/constants/roles";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isApi = path.startsWith("/api/");
  if (isApi && !["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    const origin = request.headers.get("origin");
    let crossOrigin = request.headers.get("sec-fetch-site") === "cross-site";
    if (origin) {
      try { crossOrigin ||= new URL(origin).host !== request.headers.get("host"); }
      catch { crossOrigin = true; }
    }
    if (crossOrigin) return NextResponse.json({ error: "Cross-site request rejected." }, { status: 403 });
  }
  const publicAuth = ["/api/auth/login", "/api/auth/register", "/api/auth/logout", "/api/auth/session"];
  if (publicAuth.includes(path)) return NextResponse.next();
  try {
    const auth = await resolveSession(request.cookies.get(SESSION_COOKIE)?.value);
    if (!auth) {
      if (isApi) return NextResponse.json({ error: "Please log in to continue." }, { status: 401 });
      const login = new URL("/login", request.url);
      login.searchParams.set("next", path + request.nextUrl.search);
      return NextResponse.redirect(login);
    }
    const requiredRole = path.startsWith("/donor") ? UserRole.DONOR
      : path.startsWith("/ngo") ? UserRole.NGO
      : path.startsWith("/volunteer") ? UserRole.VOLUNTEER
      : path.startsWith("/admin") || path.startsWith("/api/admin/") || path === "/api/auth/users" ? UserRole.ADMIN : undefined;
    if (requiredRole && auth.user.role !== requiredRole) {
      if (isApi) return NextResponse.json({ error: "Access denied." }, { status: 403 });
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
    const operationRole = request.method === "POST" ? {
      "/api/donations": UserRole.DONOR,
      "/api/claims": UserRole.NGO,
      "/api/dispatches": UserRole.VOLUNTEER,
    }[path] : undefined;
    if (operationRole && auth.user.role !== operationRole) {
      return NextResponse.json({ error: "Your account role cannot perform this action." }, { status: 403 });
    }
    const response = NextResponse.next();
    response.headers.set("Cache-Control", (path.startsWith("/api/photos/") || path.startsWith("/api/verification")) ? "private, no-store" : "no-store");
    return response;
  } catch {
    return isApi
      ? NextResponse.json({ error: "Session service unavailable." }, { status: 503 })
      : NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/donor/:path*", "/ngo/:path*", "/volunteer/:path*", "/api/:path*"],
};
