"use client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useMockAuth } from "@/features/auth/mock-auth";
import { UserRole } from "@/lib/constants/roles";
import { ROUTES } from "@/lib/routes";

export function MockRouteGuard({ allowedRole, children }: { allowedRole: UserRole; children: ReactNode }) {
  const { status, session } = useMockAuth();
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    if (status === "anonymous") router.replace(`${ROUTES.auth.login}?next=${encodeURIComponent(pathname)}`);
    else if (status === "authenticated" && session?.role !== allowedRole) router.replace(ROUTES.auth.unauthorized);
  }, [status, session?.role, allowedRole, pathname, router]);
  if (status !== "authenticated" || session?.role !== allowedRole) {
    return <main className="min-h-svh bg-canvas"><LoadingSpinner fullPage /></main>;
  }
  return children;
}
