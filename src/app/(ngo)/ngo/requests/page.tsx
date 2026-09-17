import { NGORequestList } from "@/features/requests/ngo-request-list";

export const metadata = { title: "My Food Requests | ShareBite BD", description: "Search, filter, and manage active and completed NGO food requests." };

export default function NGORequestsPage() {
  return <NGORequestList />;
}
