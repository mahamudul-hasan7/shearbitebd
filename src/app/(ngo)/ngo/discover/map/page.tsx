import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { NGORescueMap } from "@/features/ngo-discovery/ngo-rescue-map";

export const metadata = { title: "Rescue Map", description: "Explore approximate surplus-food locations without exposing private donor addresses." };

export default function NGORescueMapPage() {
  return <Suspense fallback={<div className="p-6"><LoadingSpinner /></div>}><NGORescueMap /></Suspense>;
}
