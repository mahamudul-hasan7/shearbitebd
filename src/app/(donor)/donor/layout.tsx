import type { ReactNode } from "react";
import { MockRouteGuard } from "@/features/auth/mock-route-guard";
import { UserRole } from "@/lib/constants/roles";

export default function DonorLayout({ children }: { children: ReactNode }) {
  return <MockRouteGuard allowedRole={UserRole.DONOR}>{children}</MockRouteGuard>;
}
