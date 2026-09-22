"use client";

import { ClipboardCheck, PackageCheck, ShieldAlert, Truck, UserRoundCheck, XCircle } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ClaimStatus } from "@/lib/constants/statuses";
import { ROUTES } from "@/lib/routes";
import type { Claim } from "@/types/domain";

export function ClaimActionPanel({ claim, busy, onAssignVolunteer, onRelease, onMarkPickedUp }: { claim: Claim; busy: boolean; onAssignVolunteer: () => void; onRelease: () => void; onMarkPickedUp: () => void }) {
  const canReport = [ClaimStatus.RESERVED, ClaimStatus.ASSIGNED, ClaimStatus.PICKED_UP, ClaimStatus.DELIVERED].includes(claim.status);
  return (
    <Card>
      <CardHeader title="Claim actions" description="Each handover opens a dedicated workflow with validation and a traceable record." />
      <CardContent className="grid gap-4">
        <div className="flex flex-wrap gap-3">
          {claim.status === ClaimStatus.RESERVED && <Button disabled={busy} leftIcon={<UserRoundCheck className="size-4" />} onClick={onAssignVolunteer}>{busy ? "Updating…" : "Assign demo volunteer"}</Button>}
          {claim.status === ClaimStatus.ASSIGNED && <Button disabled={busy} leftIcon={<Truck className="size-4" />} onClick={onMarkPickedUp}>{busy ? "Updating…" : "Verify mock pickup"}</Button>}
          {claim.status === ClaimStatus.PICKED_UP && <ButtonLink href={ROUTES.ngo.confirmDelivery(claim.id)} leftIcon={<PackageCheck className="size-4" />}>Confirm delivery</ButtonLink>}
          {claim.status === ClaimStatus.DELIVERED && <ButtonLink href={ROUTES.ngo.distribution(claim.id)} leftIcon={<ClipboardCheck className="size-4" />}>Record distribution</ButtonLink>}
          {[ClaimStatus.RESERVED, ClaimStatus.ASSIGNED].includes(claim.status) && <Button disabled={busy} variant="outline" leftIcon={<XCircle className="size-4" />} onClick={onRelease}>Release claim</Button>}
          {canReport && <ButtonLink href={ROUTES.ngo.reportIssue(claim.id)} variant="danger" leftIcon={<ShieldAlert className="size-4" />}>Report an issue</ButtonLink>}
        </div>
        {claim.status === ClaimStatus.DELIVERED && <Alert tone="success" title="Ready for distribution recording" description="Add aggregate beneficiary counts, consent confirmation, optional evidence, and the distribution location." />}
        {claim.status === ClaimStatus.DISTRIBUTED && <Alert tone="success" title="Rescue completed" description="This claim is closed and contributes to the NGO impact history." />}
        {claim.status === ClaimStatus.DISPUTED && <Alert tone="warning" title="Incident under review" description="Normal rescue progression is paused while the submitted report is reviewed." />}
        {[ClaimStatus.CANCELLED, ClaimStatus.EXPIRED].includes(claim.status) && <Alert tone="warning" title="No normal actions available" description="This claim cannot continue through the standard rescue lifecycle." />}
      </CardContent>
    </Card>
  );
}
