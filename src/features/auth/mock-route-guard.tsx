"use client";

import { ShieldCheck } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useMockAuth } from "@/features/auth/mock-auth";
import type { UserRole } from "@/lib/constants/roles";
import { ROUTES } from "@/lib/routes";

export function MockRouteGuard({ allowedRole, children }: { allowedRole: UserRole; children: ReactNode }) {
  const { status, session } = useMockAuth();
  const pathname = usePathname();
  const router = useRouter();
  const authorized = status === "authenticated" && session?.role === allowedRole;

  useEffect(() => {
    if (status === "anonymous") {
      router.replace(`${ROUTES.auth.login}?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (status === "authenticated" && session?.role !== allowedRole) {
      router.replace(ROUTES.auth.unauthorized);
    }
  }, [allowedRole, pathname, router, session?.role, status]);

  if (!authorized) {
    return (
      <main className="grid min-h-screen place-items-center px-4">
        <div role="status" className="rounded-panel border border-brand-100 bg-white p-8 text-center shadow-card">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-700"><ShieldCheck className="size-7" /></span>
          <p className="mt-4 font-black text-brand-900">Checking mock access…</p>
          <p className="mt-1 text-sm text-muted-600">No production authorization is performed in this frontend demo.</p>
        </div>
      </main>
    );
  }

  return children;
}
