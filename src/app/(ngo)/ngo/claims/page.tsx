import { NGOModuleHandoff } from "@/features/ngo-dashboard/ngo-module-handoff";
import { ROUTES } from "@/lib/routes";

export const metadata = { title: "NGO Claims | ShareBite BD" };

export default function NGOClaimsHandoffPage() {
  return <NGOModuleHandoff title="My claims" description="Manage reserved and active food rescues." moduleName="Claims management arrives in Phase 12" activeHref={ROUTES.ngo.claims} />;
}
