import type { ReactNode } from "react";
import { MockRouteGuard } from "@/features/auth/mock-route-guard";
import { UserRole } from "@/lib/constants/roles";
import { requirePortalRole } from "@/lib/auth/server";

export default async function DonorLayout({ children }: { children: ReactNode }) {
  await requirePortalRole(UserRole.DONOR);
  return <MockRouteGuard allowedRole={UserRole.DONOR}>{children}</MockRouteGuard>;
}
