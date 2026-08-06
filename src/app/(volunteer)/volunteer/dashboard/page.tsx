import { ProtectedPortalPlaceholder } from "@/components/auth/protected-portal-placeholder";
import { UserRole } from "@/lib/constants/roles";

export const metadata = { title: "Volunteer Access" };

export default function VolunteerDashboardPlaceholderPage() {
  return <ProtectedPortalPlaceholder role={UserRole.VOLUNTEER} />;
}
