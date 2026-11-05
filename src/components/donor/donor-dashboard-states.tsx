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
      <Alert tone="danger" title="ড্যাশবোর্ডের তথ্য লোড করা যায়নি" description={message} />
      <div className="flex flex-wrap gap-3">
        <Button onClick={onRetry}>পুনরায় চেষ্টা করুন</Button>
        <ButtonLink href={ROUTES.auth.login} variant="outline">
          লগইনে ফিরুন
        </ButtonLink>
      </div>
    </div>
  );
}

export function NoActiveDonation() {
  return (
    <EmptyState
      icon={PackageOpen}
      title="বর্তমানে কোনো সক্রিয় অনুদান নেই"
      description="উদ্বৃত্ত খাবার পোস্ট করার সাথে সাথেই লাইভ রেসকিউ স্ট্যাটাস ও ট্র্যাকিং কার্ড এখানে প্রদর্শিত হবে।"
      action={
        <ButtonLink href={ROUTES.donor.newDonation} className="font-bold">
          উদ্বৃত্ত খাবার পোস্ট করুন
        </ButtonLink>
      }
    />
  );
}

export function NoDashboardContent() {
  return (
    <EmptyState
      icon={AlertTriangle}
      title="আপনার ডোনার ড্যাশবোর্ড প্রস্তুত"
      description="প্রথম উদ্বৃত্ত খাবার তালিকাভুক্ত করে লাইভ উদ্ধার কার্যক্রম ও কমিউনিটি ইমপ্যাক্ট শুরু করুন।"
      action={
        <ButtonLink href={ROUTES.donor.newDonation} className="font-bold">
          প্রথম অনুদান পোস্ট করুন
        </ButtonLink>
      }
    />
  );
}
