import { DonorDonationList } from "@/features/donations/donor-donation-list";

export const metadata = { title: "My Donations", description: "Search, filter, and manage food donor listings across the rescue lifecycle." };

export default function DonorDonationsPage() {
  return <DonorDonationList />;
}
