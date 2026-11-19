import type { ReactNode } from "react";
import { requirePortalRole } from "@/lib/auth/server";
import { UserRole } from "@/lib/constants/roles";
import { MockRouteGuard } from "@/features/auth/mock-route-guard";
import { AdminShell } from "@/features/admin/admin-shell";
export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requirePortalRole(UserRole.ADMIN);
  return (
    <MockRouteGuard allowedRole={UserRole.ADMIN}>
      <AdminShell date={new Date().toISOString()}>{children}</AdminShell>
    </MockRouteGuard>
  );
}
