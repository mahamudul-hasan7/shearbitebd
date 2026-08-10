import { DonationTracking } from "@/features/donations/donation-tracking";

export const metadata = { title: "Rescue Tracking" };

export default async function DonorDonationTrackingPage({ params }: { params: Promise<{ donationId: string }> }) {
  const { donationId } = await params;
  return <DonationTracking donationId={donationId} />;
}
