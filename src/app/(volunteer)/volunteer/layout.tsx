import { PortalFrame } from "@/components/layout/portal-frame";
import { PortalTheme } from "@/components/portal/portal-theme";
import type { ReactNode } from "react";
import { MockRouteGuard } from "@/features/auth/mock-route-guard";
import { UserRole } from "@/lib/constants/roles";
import { requirePortalRole } from "@/lib/auth/server";
import { VolunteerDutySync } from "@/features/volunteer-dashboard/volunteer-duty-sync";
import { RiderIncomingOffer } from "@/features/volunteer-dashboard/rider-incoming-offer";

export default async function VolunteerLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requirePortalRole(UserRole.VOLUNTEER);
  return (
    <MockRouteGuard allowedRole={UserRole.VOLUNTEER}>
      <PortalTheme role="volunteer">
        <PortalFrame role="volunteer">{children}</PortalFrame>
        <VolunteerDutySync />
        <RiderIncomingOffer />
      </PortalTheme>
    </MockRouteGuard>
  );
}
