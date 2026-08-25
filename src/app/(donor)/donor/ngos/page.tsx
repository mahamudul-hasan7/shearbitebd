import { NGODirectory } from "@/features/ngos/ngo-directory";

export const metadata = { title: "Verified NGOs", description: "Discover verified recipient organizations by cause, food category, and service area." };

export default function DonorNGODirectoryPage() {
  return <NGODirectory />;
}
