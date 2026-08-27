import { ProtectedPortalPlaceholder } from "@/components/auth/protected-portal-placeholder";
import { UserRole } from "@/lib/constants/roles";

export const metadata = { title: "Volunteer Access", description: "Open the guarded ShareBite BD volunteer dashboard demonstration." };

export default function VolunteerDashboardPlaceholderPage() {
  return <ProtectedPortalPlaceholder role={UserRole.VOLUNTEER} />;
}
