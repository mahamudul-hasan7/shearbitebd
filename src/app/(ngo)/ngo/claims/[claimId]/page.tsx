import { NGOClaimDetail } from "@/features/claims/ngo-claim-detail";

export const metadata = { title: "Claim Details | ShareBite BD" };

export default async function NGOClaimPage({ params }: { params: Promise<{ claimId: string }> }) {
  const { claimId } = await params;
  return <NGOClaimDetail claimId={claimId} />;
}
