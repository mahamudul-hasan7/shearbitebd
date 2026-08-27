import { NGODonationDetail } from "@/features/ngo-discovery/ngo-donation-detail";

export const metadata = { title: "Donation Details | ShareBite BD", description: "Review a privacy-safe donation, safety declaration, eligibility, and claim action." };

export default async function NGODonationDetailPage({ params }: { params: Promise<{ donationId: string }> }) {
  const { donationId } = await params;
  return <NGODonationDetail donationId={donationId} />;
}
