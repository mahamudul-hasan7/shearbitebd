import { ProtectedPortalPlaceholder } from "@/components/auth/protected-portal-placeholder";
import { UserRole } from "@/lib/constants/roles";

export const metadata = { title: "Donor Access" };

export default function DonorDashboardPlaceholderPage() {
  return <ProtectedPortalPlaceholder role={UserRole.DONOR} />;
}
