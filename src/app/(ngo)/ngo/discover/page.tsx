import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { NGODiscoveryList } from "@/features/ngo-discovery/ngo-discovery-list";

export const metadata = { title: "Discover Food | ShareBite BD", description: "Search and filter privacy-protected surplus-food recommendations for a verified NGO." };

export default function NGODiscoverPage() {
  return <Suspense fallback={<div className="p-6"><Skeleton className="h-[40rem]" /></div>}><NGODiscoveryList /></Suspense>;
}
