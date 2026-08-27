import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { NGORescueMap } from "@/features/ngo-discovery/ngo-rescue-map";

export const metadata = { title: "Rescue Map | ShareBite BD", description: "Explore approximate surplus-food locations without exposing private donor addresses." };

export default function NGORescueMapPage() {
  return <Suspense fallback={<div className="p-6"><Skeleton className="h-[40rem]" /></div>}><NGORescueMap /></Suspense>;
}
