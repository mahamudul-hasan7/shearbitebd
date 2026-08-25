import { DonationDetailSummary } from "@/features/donations/donation-detail-summary";

export const metadata = { title: "Donation Details", description: "Review an owned food donation, lifecycle, receiver, pickup, and available actions." };

export default async function DonorDonationDetailPage({ params }: { params: Promise<{ donationId: string }> }) {
  const { donationId } = await params;
  return <DonationDetailSummary donationId={donationId} />;
}
