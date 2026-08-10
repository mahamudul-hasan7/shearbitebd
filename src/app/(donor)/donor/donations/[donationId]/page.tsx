import { DonationDetailSummary } from "@/features/donations/donation-detail-summary";

export const metadata = { title: "Donation Details" };

export default async function DonorDonationDetailPage({ params }: { params: Promise<{ donationId: string }> }) {
  const { donationId } = await params;
  return <DonationDetailSummary donationId={donationId} />;
}
