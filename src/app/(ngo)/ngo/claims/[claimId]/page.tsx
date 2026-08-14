import { NGOModuleHandoff } from "@/features/ngo-dashboard/ngo-module-handoff";
import { ROUTES } from "@/lib/routes";

export const metadata = { title: "Claim Details | ShareBite BD" };

export default async function NGOClaimHandoffPage({ params }: { params: Promise<{ claimId: string }> }) {
  const { claimId } = await params;
  return <NGOModuleHandoff title="Claim details" description="Continue rescue coordination for this claim." moduleName="Claim detail arrives in Phase 12" activeHref={ROUTES.ngo.claims} context={claimId} />;
}
