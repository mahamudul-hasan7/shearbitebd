"use client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";


import { UiText } from "@/lib/i18n/ui-text-node";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { SearchX } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { DashboardFeedback } from "@/components/dashboard/dashboard-ui";
import ui from "@/components/dashboard/dashboard.module.css";
import { ROUTES } from "@/lib/routes";

export function NGODashboardLoading() {
  const tx = useUiText();
  return <LoadingSpinner label={tx("Loading NGO dashboard")} />;
}

export function NGODashboardError({ message, onRetry }: { message: string; onRetry: () => void }) {
  const tx = useUiText();
  return <DashboardFeedback message={tx(message)} onRetry={onRetry} data-testid="ngo-dashboard-error" />;
}

export function NoRecommendedDonation() {
  const tx = useUiText();
  return <EmptyState icon={SearchX} title={tx("No matching food posts right now")} description={tx("No available posts match your NGO's accepted food categories. Browse all food or share a food request.")} action={<div className="flex flex-wrap justify-center gap-2"><ButtonLink href={ROUTES.ngo.discover} className={ui.primaryAction}><UiText source={"Browse Food"} /></ButtonLink><ButtonLink href={ROUTES.ngo.newRequest} variant="outline" className={ui.secondaryAction}><UiText source={"Create Request"} /></ButtonLink></div>} />;
}
