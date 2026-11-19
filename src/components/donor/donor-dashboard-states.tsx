"use client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";


import { UiText } from "@/lib/i18n/ui-text-node";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { AlertTriangle, PackageOpen } from "lucide-react";
import { DashboardFeedback } from "@/components/dashboard/dashboard-ui";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ROUTES } from "@/lib/routes";

export function DonorDashboardLoading() {
  const tx = useUiText();
  return (
    <LoadingSpinner label={tx("Loading donor dashboard")} />
  );
}

export function DonorDashboardError({ message, onRetry }: { message: string; onRetry: () => void }) {
  const tx = useUiText();
  return <DashboardFeedback message={tx(message)} onRetry={onRetry} data-testid="donor-dashboard-error" />;
}

export function NoActiveDonation() {
  const tx = useUiText();
  return (
    <EmptyState
      icon={PackageOpen}
      title={tx("বর্তমানে কোনো সক্রিয় অনুদান নেই")}
      description={tx("উদ্বৃত্ত খাবার পোস্ট করার সাথে সাথেই লাইভ রেসকিউ স্ট্যাটাস ও ট্র্যাকিং কার্ড এখানে প্রদর্শিত হবে।")}
      action={
        <ButtonLink href={ROUTES.donor.newDonation} className="font-bold"><UiText source={"উদ্বৃত্ত খাবার পোস্ট করুন"} /></ButtonLink>
      }
    />
  );
}

export function NoDashboardContent() {
  const tx = useUiText();
  return (
    <EmptyState
      icon={AlertTriangle}
      title={tx("আপনার ডোনার ড্যাশবোর্ড প্রস্তুত")}
      description={tx("প্রথম উদ্বৃত্ত খাবার তালিকাভুক্ত করে লাইভ উদ্ধার কার্যক্রম ও কমিউনিটি ইমপ্যাক্ট শুরু করুন।")}
      action={
        <ButtonLink href={ROUTES.donor.newDonation} className="font-bold"><UiText source={"প্রথম অনুদান পোস্ট করুন"} /></ButtonLink>
      }
    />
  );
}
