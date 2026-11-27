import { NGOClaimsList } from "@/features/claims/ngo-claims-list";

export const metadata = { title: "NGO Claims", description: "Search, filter, and coordinate active and completed NGO food-rescue claims." };

export default function NGOClaimsPage() {
  return <NGOClaimsList />;
}
