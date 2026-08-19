"use client";

import { useState } from "react";
import { AlertTriangle, PackageCheck, ShieldAlert, Truck, UserRoundCheck, XCircle } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ClaimStatus } from "@/lib/constants/statuses";
import type { Claim } from "@/types/domain";

export function ClaimActionPanel({
  claim,
  busy,
  onAssignVolunteer,
  onRelease,
  onMarkPickedUp,
  onConfirmDelivered,
  onReportIssue,
}: {
  claim: Claim;
  busy: boolean;
  onAssignVolunteer: () => void;
  onRelease: () => void;
  onMarkPickedUp: () => void;
  onConfirmDelivered: () => void;
  onReportIssue: (description: string) => void;
}) {
  const [description, setDescription] = useState("");
  const [issueOpen, setIssueOpen] = useState(false);
  const [issueError, setIssueError] = useState<string>();
  const active = [ClaimStatus.RESERVED, ClaimStatus.ASSIGNED, ClaimStatus.PICKED_UP, ClaimStatus.DELIVERED].includes(claim.status);

  function submitIssue() {
    if (description.trim().length < 12) {
      setIssueError("Describe the issue in at least 12 characters.");
      return;
    }
    setIssueError(undefined);
    onReportIssue(description.trim());
  }

  return (
    <Card>
      <CardHeader title="Claim actions" description="Demo controls follow the centralized claim lifecycle. Production actions require authenticated backend verification." />
      <CardContent className="grid gap-4">
        <div className="flex flex-wrap gap-3">
          {claim.status === ClaimStatus.RESERVED && <Button disabled={busy} leftIcon={<UserRoundCheck className="size-4" />} onClick={onAssignVolunteer}>{busy ? "Updating…" : "Assign demo volunteer"}</Button>}
          {claim.status === ClaimStatus.ASSIGNED && <Button disabled={busy} leftIcon={<Truck className="size-4" />} onClick={onMarkPickedUp}>{busy ? "Updating…" : "Verify mock pickup"}</Button>}
          {claim.status === ClaimStatus.PICKED_UP && <Button disabled={busy} leftIcon={<PackageCheck className="size-4" />} onClick={onConfirmDelivered}>{busy ? "Updating…" : "Confirm delivery received"}</Button>}
          {[ClaimStatus.RESERVED, ClaimStatus.ASSIGNED].includes(claim.status) && <Button disabled={busy} variant="outline" leftIcon={<XCircle className="size-4" />} onClick={onRelease}>Release claim</Button>}
          {active && <Button disabled={busy} variant="danger" leftIcon={<ShieldAlert className="size-4" />} onClick={() => setIssueOpen((value) => !value)}>{issueOpen ? "Close issue form" : "Report an issue"}</Button>}
        </div>
        {claim.status === ClaimStatus.DELIVERED && <Alert tone="success" title="Ready for distribution recording" description="The complete beneficiary distribution workflow is intentionally reserved for Phase 13." />}
        {claim.status === ClaimStatus.DISTRIBUTED && <Alert tone="success" title="Rescue completed" description="This claim is closed and already contributes to the mock impact history." />}
        {[ClaimStatus.CANCELLED, ClaimStatus.EXPIRED, ClaimStatus.DISPUTED].includes(claim.status) && <Alert tone="warning" title="No normal actions available" description="This exception-state claim cannot continue through the standard demo lifecycle." />}
        {issueOpen && active && <div className="grid gap-3 rounded-2xl border border-danger/20 bg-danger-soft p-4"><div className="flex items-start gap-3 text-danger-strong"><AlertTriangle className="mt-0.5 size-5" /><div><p className="font-black">Quick coordination report</p><p className="mt-1 text-sm leading-6">This Phase 11 form creates a mock incident and pauses normal progression. Phase 13 adds categories, evidence, severity, and contact preferences.</p></div></div><Textarea label="What happened?" value={description} onChange={(event) => setDescription(event.target.value)} error={issueError} maxLength={500} placeholder="Describe the coordination, pickup, food, or delivery issue…" /><div className="flex justify-end"><Button variant="danger" disabled={busy} onClick={submitIssue}>Submit mock report</Button></div></div>}
      </CardContent>
    </Card>
  );
}
