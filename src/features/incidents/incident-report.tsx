"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, CheckCircle2, RefreshCw } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FileUpload } from "@/components/ui/file-upload";
import { RadioGroup } from "@/components/ui/radio-group";
import { Select } from "@/components/ui/select";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { DeliveryClaimSummary } from "@/features/delivery/delivery-claim-summary";
import { NGO_VIEWER } from "@/features/ngo-dashboard/use-ngo-dashboard";
import { IncidentType, PriorityLevel } from "@/lib/constants/domain";
import { ROUTES } from "@/lib/routes";
import { claimService, incidentService, toServiceError, type ClaimCoordinationDetails } from "@/services";
import type { IncidentReport } from "@/types/domain";

const INCIDENT_LABELS: Record<IncidentType, string> = {
  [IncidentType.DAMAGED_FOOD]: "Damaged food or packaging",
  [IncidentType.WRONG_QUANTITY]: "Wrong quantity",
  [IncidentType.LATE_DELIVERY]: "Late delivery",
  [IncidentType.WRONG_ITEM]: "Wrong item",
  [IncidentType.SAFETY_CONCERN]: "Food safety concern",
  [IncidentType.OTHER]: "Other rescue issue",
};

export function IncidentReportScreen({ claimId }: { claimId: string }) {
  const [details, setDetails] = useState<ClaimCoordinationDetails>();
  const [existing, setExisting] = useState<IncidentReport>();
  const [created, setCreated] = useState<IncidentReport>();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [descriptionError, setDescriptionError] = useState<string>();
  const [type, setType] = useState(IncidentType.DAMAGED_FOOD);
  const [severity, setSeverity] = useState(PriorityLevel.HIGH);
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState<IncidentReport["preferredContactMethod"]>("PHONE");
  const [evidenceNames, setEvidenceNames] = useState<string[]>([]);

  async function load() {
    setLoading(true); setError(undefined);
    try {
      const nextDetails = await claimService.getCoordinationDetails(claimId, NGO_VIEWER);
      setDetails(nextDetails);
      const reports = await incidentService.listForDonation(nextDetails.donation.id, NGO_VIEWER);
      setExisting(reports.find((item) => item.claimId === claimId));
    } catch (caught) { setError(toServiceError(caught).message); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [claimId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (description.trim().length < 12) { setDescriptionError("Describe what happened in at least 12 characters."); return; }
    setDescriptionError(undefined); setBusy(true); setError(undefined);
    try {
      const incident = await incidentService.createForDonation(details?.donation.id ?? "", {
        type, severity, description, preferredContactMethod: contact, evidenceFileNames: evidenceNames,
      }, NGO_VIEWER);
      setCreated(incident);
      setDetails(await claimService.getCoordinationDetails(claimId, NGO_VIEWER));
    } catch (caught) {
      const serviceError = toServiceError(caught); setError(serviceError.message);
      setDescriptionError(serviceError.fieldErrors?.description);
    } finally { setBusy(false); }
  }

  const report = created ?? existing;
  return (
    <PortalShell role="ngo" activeHref={ROUTES.ngo.claims} title="Report a rescue issue" description="Pause the normal workflow and send a structured incident for review." profileName="Hope Foundation" profileDescription="Verified NGO" avatarInitials="HF" actions={<ButtonLink href={ROUTES.ngo.claim(claimId)} variant="ghost" size="sm" leftIcon={<ArrowLeft className="size-4" />}>Claim details</ButtonLink>}>
      {loading && !details && <SkeletonGroup label="Loading incident workflow" className="grid gap-5"><Skeleton className="h-48" /><Skeleton className="h-96" /></SkeletonGroup>}
      {error && !details && <EmptyState icon={RefreshCw} title="Issue workflow could not load" description={error} action={<Button onClick={() => void load()}>Try again</Button>} />}
      {details && <div className="grid gap-6">
        <DeliveryClaimSummary details={details} />
        {error && <Alert tone="danger" title="Issue could not be submitted" description={error} />}
        {report ? <Card><CardHeader title="Incident is under review" description={`Report ${report.id}`} action={<CheckCircle2 className="size-6 text-warning-strong" />} /><CardContent className="grid gap-4"><Alert tone="warning" title="Normal rescue progression is paused" description="The claim and donation are marked disputed until an administrator resolves this report." /><div className="flex flex-wrap gap-2"><Badge tone="danger">{INCIDENT_LABELS[report.type]}</Badge><Badge tone="warning">{report.severity.toLowerCase()} priority</Badge><Badge>{report.status.toLowerCase().replaceAll("_", " ")}</Badge></div><p className="rounded-2xl bg-canvas p-4 text-sm leading-6 text-ink-700">{report.description}</p><ButtonLink href={ROUTES.ngo.claim(claimId)} variant="outline">Return to claim</ButtonLink></CardContent></Card> : <form onSubmit={submit} className="grid gap-6">
          <Alert tone="warning" title="Submitting changes the rescue status" description="The claim and donation will move to Disputed / Under review. Use this only for a real coordination, quantity, damage, or food-safety concern." />
          <Card><CardHeader title="Incident details" description="Clear, factual information helps a reviewer respond quickly." /><CardContent className="grid gap-5"><Select label="Issue category" value={type} onChange={(event) => setType(event.target.value as IncidentType)}>{Object.values(IncidentType).map((value) => <option key={value} value={value}>{INCIDENT_LABELS[value]}</option>)}</Select><RadioGroup label="Severity" name="severity" value={severity} onChange={(event) => setSeverity(event.target.value as PriorityLevel)} orientation="horizontal" items={[{ value: PriorityLevel.LOW, label: "Low" }, { value: PriorityLevel.MEDIUM, label: "Medium" }, { value: PriorityLevel.HIGH, label: "High" }, { value: PriorityLevel.URGENT, label: "Urgent", description: "Immediate safety risk." }]} /><Textarea label="What happened?" value={description} onChange={(event) => setDescription(event.target.value)} error={descriptionError} maxLength={1000} placeholder="Include the observed condition, quantity, timing, and any immediate safety action taken…" /><FileUpload label="Evidence" name="incidentEvidence" accept="image/*,.pdf" multiple maxFiles={5} fileNames={evidenceNames} onFilesChange={(files) => setEvidenceNames(files.map((file) => file.name))} hint="Optional. Up to five images or PDFs; names only are kept in this frontend demo." /></CardContent></Card>
          <Card><CardHeader title="Follow-up preference" description="Choose how the support team should contact the NGO." /><CardContent><RadioGroup label="Preferred contact method" name="contact" value={contact} onChange={(event) => setContact(event.target.value as IncidentReport["preferredContactMethod"])} orientation="horizontal" items={[{ value: "PHONE", label: "Phone" }, { value: "EMAIL", label: "Email" }, { value: "IN_APP", label: "In-app message" }]} /></CardContent></Card>
          <div className="flex flex-wrap justify-end gap-3"><ButtonLink href={ROUTES.ngo.claim(claimId)} variant="outline">Cancel</ButtonLink><Button type="submit" variant="danger" disabled={busy}>{busy ? "Submitting report…" : "Submit incident"}</Button></div>
        </form>}
      </div>}
    </PortalShell>
  );
}
