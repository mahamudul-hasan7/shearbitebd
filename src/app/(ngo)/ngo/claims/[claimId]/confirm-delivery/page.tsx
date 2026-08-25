import { NGOModuleHandoff } from "@/features/ngo-dashboard/ngo-module-handoff";
import { ROUTES } from "@/lib/routes";

export const metadata = { title: "Confirm Delivery | ShareBite BD", description: "Open the guarded delivery confirmation handoff for an NGO rescue claim." };

export default async function NGOConfirmDeliveryHandoffPage({ params }: { params: Promise<{ claimId: string }> }) {
  const { claimId } = await params;
  return <NGOModuleHandoff title="Confirm delivery" description="Review the handover before confirming receipt." moduleName="Delivery confirmation arrives in Phase 12" activeHref={ROUTES.ngo.claims} context={claimId} />;
}
