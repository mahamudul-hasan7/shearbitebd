import { NGOModuleHandoff } from "@/features/ngo-dashboard/ngo-module-handoff";
import { ROUTES } from "@/lib/routes";

export const metadata = { title: "Create Demand Request | ShareBite BD" };

export default function NGONewRequestHandoffPage() {
  return <NGOModuleHandoff title="Create demand request" description="Publish a verified food need for your community program." moduleName="Demand requests arrive in Phase 13" activeHref={ROUTES.ngo.newRequest} />;
}
