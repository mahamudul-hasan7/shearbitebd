import { DonorSettings } from "@/features/donor-account/donor-settings";

export const metadata = { title: "Donor Settings", description: "Manage donor notification, language, accessibility, and location preferences." };

export default function DonorSettingsPage() {
  return <DonorSettings />;
}
