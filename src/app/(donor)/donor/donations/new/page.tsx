import { DonationWizard } from "@/features/donations/donation-wizard";

export const metadata = { title: "Add Surplus Food", description: "Create a safe surplus-food listing with pickup, declaration, and review details." };

export default function NewDonationPage() {
  return <DonationWizard />;
}
