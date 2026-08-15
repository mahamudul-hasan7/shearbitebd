import { NGODonationDetail } from "@/features/ngo-discovery/ngo-donation-detail";

export const metadata = { title: "Donation Details | ShareBite BD" };

export default async function NGODonationDetailPage({ params }: { params: Promise<{ donationId: string }> }) {
  const { donationId } = await params;
  return <NGODonationDetail donationId={donationId} />;
}
