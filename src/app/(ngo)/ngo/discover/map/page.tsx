import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { NGORescueMap } from "@/features/ngo-discovery/ngo-rescue-map";

export const metadata = { title: "Rescue Map | ShareBite BD" };

export default function NGORescueMapPage() {
  return <Suspense fallback={<div className="p-6"><Skeleton className="h-[40rem]" /></div>}><NGORescueMap /></Suspense>;
}
