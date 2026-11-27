import { AddressManager } from "@/features/donor-account/address-manager";

export const metadata = { title: "Delivery Addresses" };
export default function NGOAddressesPage() { return <AddressManager role="ngo" />; }
