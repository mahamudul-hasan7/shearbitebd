import { ProtectedPortalPlaceholder } from "@/components/auth/protected-portal-placeholder";
import { UserRole } from "@/lib/constants/roles";

export const metadata = { title: "NGO Access" };

export default function NgoDashboardPlaceholderPage() {
  return <ProtectedPortalPlaceholder role={UserRole.NGO} />;
}
