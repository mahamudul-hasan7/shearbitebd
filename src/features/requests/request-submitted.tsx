"use client";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { useEffect, useState } from "react";
import { PortalShell } from "@/components/layout/portal-shell";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { useMockAuth } from "@/features/auth/mock-auth";
import { requestService, toServiceError } from "@/services";
import { ROUTES } from "@/lib/routes";
import type { FoodRequest } from "@/types/domain";
import { CheckCircle2 } from "lucide-react";
import { LiveIcon } from "@/components/motion/live-icon";
export function RequestSubmitted({ requestId }: { requestId?: string }) {
  const tx = useUiText();
  const { session } = useMockAuth();
  const [request, setRequest] = useState<FoodRequest>();
  const [error, setError] = useState("");
  useEffect(() => {
    if (!requestId) return;
    const controller = new AbortController();
    requestService.getById(requestId, { signal: controller.signal }).then(setRequest).catch((caught) => { if (!controller.signal.aborted) setError(toServiceError(caught).message); });
    return () => controller.abort();
  }, [requestId]);
  return <PortalShell role="ngo" activeHref={ROUTES.ngo.requests} title={tx("Food request published")} description={tx("আপনার প্রয়োজন database-এ সংরক্ষিত হয়েছে।")} profileName={session?.displayName} avatarInitials={session?.displayName.slice(0, 2).toUpperCase()}>
    <Card><CardHeader title={request?.title || "Request reference"} description={requestId || "No request reference provided"} action={request && <LiveIcon icon={CheckCircle2} motion="once" size={30} className="text-emerald-700" />} /><CardContent className="grid gap-5">
      {error && <p role="alert">{tx(error)}</p>}
      {request && <><StatusBadge status={request.status} /><p>{request.mealsNeeded} {" "}{tx("meals for")}{" "}{request.peopleToServe} {" "}{tx("planned recipients ·")}{" "}{request.deliveryLocation.area}</p><p>{tx("Suitable donation বেছে reserve করুন। Volunteer handover, NGO receipt ও actual distribution-এর মাধ্যমে request পূরণ হবে।")}</p><ButtonLink href={ROUTES.ngo.request(request.id)}>{tx("Find suitable donations")}</ButtonLink></>}
      <ButtonLink href={ROUTES.ngo.requests} variant="outline">{tx("My requests")}</ButtonLink>
    </CardContent></Card>
  </PortalShell>;
}
