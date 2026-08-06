import type { ReactNode } from "react";
import { MockRouteGuard } from "@/features/auth/mock-route-guard";
import { UserRole } from "@/lib/constants/roles";

export default function NgoLayout({ children }: { children: ReactNode }) {
  return <MockRouteGuard allowedRole={UserRole.NGO}>{children}</MockRouteGuard>;
}
