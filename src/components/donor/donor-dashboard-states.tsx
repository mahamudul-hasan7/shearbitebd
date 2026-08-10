import { AlertTriangle, PackageOpen } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/routes";

export function DonorDashboardLoading() {
  return (
    <SkeletonGroup label="Loading donor dashboard" className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-44 rounded-card" />)}</div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(18rem,0.7fr)]"><Skeleton className="h-[34rem] rounded-card" /><Skeleton className="h-[34rem] rounded-card" /></div>
      <div className="grid gap-6 xl:grid-cols-2"><Skeleton className="h-96 rounded-card" /><Skeleton className="h-96 rounded-card" /></div>
    </SkeletonGroup>
  );
}

export function DonorDashboardError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="grid gap-5">
      <Alert tone="danger" title="Dashboard data could not load" description={message} />
      <div className="flex flex-wrap gap-3"><Button onClick={onRetry}>Try again</Button><ButtonLink href={ROUTES.auth.login} variant="outline">Return to login</ButtonLink></div>
    </div>
  );
}

export function NoActiveDonation() {
  return <EmptyState icon={PackageOpen} title="No active donation" description="Your active rescue card will appear here after you publish surplus food." action={<ButtonLink href={ROUTES.donor.newDonation}>Add Surplus Food</ButtonLink>} />;
}

export function NoDashboardContent() {
  return <EmptyState icon={AlertTriangle} title="Your donor dashboard is ready" description="Add the first surplus food listing to start tracking rescue activity and impact." action={<ButtonLink href={ROUTES.donor.newDonation}>Create first donation</ButtonLink>} />;
}
