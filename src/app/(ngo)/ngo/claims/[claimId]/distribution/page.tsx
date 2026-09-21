import { DistributionRecordScreen } from "@/features/distribution/distribution-record";

export const metadata = { title: "Record Distribution | ShareBite BD", description: "Record a privacy-aware NGO beneficiary distribution and rescue impact." };

export default async function NGODistributionPage({ params }: { params: Promise<{ claimId: string }> }) {
  const { claimId } = await params;
  return <DistributionRecordScreen claimId={claimId} />;
}
