import { AddressManager } from "@/features/donor-account/address-manager";

export const metadata = { title: "Saved Addresses | ShareBite BD", description: "Add and manage private donor pickup addresses in the mock account." };

export default function DonorAddressesPage() {
  return <AddressManager />;
}
