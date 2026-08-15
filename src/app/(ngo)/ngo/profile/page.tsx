import { NGOModuleHandoff } from "@/features/ngo-dashboard/ngo-module-handoff";
import { ROUTES } from "@/lib/routes";

export const metadata = { title: "NGO Profile | ShareBite BD" };

export default function NGOProfileHandoffPage() {
  return <NGOModuleHandoff title="Organization profile" description="Manage identity, verification, service areas, and team access." moduleName="NGO account management arrives in Phase 14" activeHref={ROUTES.ngo.profile} />;
}
