import { AddressManager } from "@/features/donor-account/address-manager";

export const metadata = { title: "Saved Addresses", description: "Add and manage private donor pickup addresses and location pins." };

export default function DonorAddressesPage() {
  return <AddressManager />;
}
