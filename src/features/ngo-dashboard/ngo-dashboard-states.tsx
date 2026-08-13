import { RefreshCw, SearchX } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/routes";

export function NGODashboardLoading() {
  return <SkeletonGroup label="Loading NGO dashboard" className="grid gap-6"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-36" />)}</div><Skeleton className="h-[30rem]" /><div className="grid gap-6 xl:grid-cols-2"><Skeleton className="h-80" /><Skeleton className="h-80" /></div></SkeletonGroup>;
}

export function NGODashboardError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <EmptyState icon={RefreshCw} title="NGO dashboard could not load" description={message} action={<Button onClick={onRetry}>Try again</Button>} />;
}

export function NoRecommendedDonation() {
  return <EmptyState icon={SearchX} title="No suitable food nearby right now" description="There are no unclaimed listings inside your current service radius. Check again soon or publish a demand request." action={<div className="flex flex-wrap justify-center gap-2"><ButtonLink href={ROUTES.ngo.discover}>Browse Food</ButtonLink><ButtonLink href={ROUTES.ngo.newRequest} variant="outline">Create Request</ButtonLink></div>} />;
}
