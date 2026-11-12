import type { ReactNode } from "react";
import { MockRouteGuard } from "@/features/auth/mock-route-guard";
import { UserRole } from "@/lib/constants/roles";
import { RiderSessionBar } from "@/features/volunteer-dashboard/rider-session-bar";

export default function VolunteerLayout({ children }: { children: ReactNode }) {
  return (
    <MockRouteGuard allowedRole={UserRole.VOLUNTEER}>
      {children}
      <RiderSessionBar />
    </MockRouteGuard>
  );
}
