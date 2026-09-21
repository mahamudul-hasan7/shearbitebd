import { ConfirmDelivery } from "@/features/delivery/confirm-delivery";

export const metadata = { title: "Confirm Delivery | ShareBite BD", description: "Verify a food handover and create the NGO delivery receipt." };

export default async function NGOConfirmDeliveryPage({ params }: { params: Promise<{ claimId: string }> }) {
  const { claimId } = await params;
  return <ConfirmDelivery claimId={claimId} />;
}
