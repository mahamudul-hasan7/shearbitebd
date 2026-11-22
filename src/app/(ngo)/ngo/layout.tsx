import { PortalTheme } from "@/components/portal/portal-theme";
import type { ReactNode } from "react";
import { MockRouteGuard } from "@/features/auth/mock-route-guard";
import { UserRole } from "@/lib/constants/roles";
import { requirePortalRole } from "@/lib/auth/server";

export default async function NgoLayout({ children }: { children: ReactNode }) {
  await requirePortalRole(UserRole.NGO);
  return <MockRouteGuard allowedRole={UserRole.NGO}><PortalTheme role="ngo">{children}</PortalTheme></MockRouteGuard>;
}
