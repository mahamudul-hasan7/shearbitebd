"use client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";


import { UiText } from "@/lib/i18n/ui-text-node";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { RefreshCw, SearchX } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ROUTES } from "@/lib/routes";

export function NGODashboardLoading() {
  const tx = useUiText();
  return <LoadingSpinner label={tx("Loading NGO dashboard")} />;
}

export function NGODashboardError({ message, onRetry }: { message: string; onRetry: () => void }) {
  const tx = useUiText();
  return <EmptyState icon={RefreshCw} title={tx("NGO dashboard could not load")} description={message} action={<Button onClick={onRetry}><UiText source={"Try again"} /></Button>} />;
}

export function NoRecommendedDonation() {
  const tx = useUiText();
  return <EmptyState icon={SearchX} title={tx("No matching food posts right now")} description={tx("No available posts match your NGO's accepted food categories. Browse all food or share a food request.")} action={<div className="flex flex-wrap justify-center gap-2"><ButtonLink href={ROUTES.ngo.discover}><UiText source={"Browse Food"} /></ButtonLink><ButtonLink href={ROUTES.ngo.newRequest} variant="outline"><UiText source={"Create Request"} /></ButtonLink></div>} />;
}
