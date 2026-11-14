"use client";
import { getUiLocale } from "@/lib/i18n/locale";
import { useUiText } from "@/lib/i18n/use-ui-text";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PhotoUpload } from "@/components/ui/photo-upload";
import { PhotoGallery } from "@/components/ui/photo-gallery";
import { IncidentType, PriorityLevel } from "@/lib/constants/domain";
import { incidentService } from "@/services/incident.service";
import { toServiceError } from "@/services/shared";
import type { IncidentReport } from "@/types/domain";

export const INCIDENT_LABELS: Record<IncidentType, string> = {
  DAMAGED_FOOD: "Damaged food or packaging", WRONG_QUANTITY: "Wrong quantity", LATE_DELIVERY: "Pickup / delivery delay",
  WRONG_ITEM: "Wrong item", SAFETY_CONCERN: "Food safety concern", OTHER: "Other rescue issue",
};
const STATUS_LABELS: Record<string, string> = { SUBMITTED: "Submitted — awaiting review", UNDER_REVIEW: "Under review", RESOLVED: "Resolved", CLOSED: "Closed" };

export function IncidentPanel({ claimId, showForm = false, canReport = true, onSubmitted }: {
  claimId: string; showForm?: boolean; canReport?: boolean; onSubmitted?: () => void;
}) {
  const tx = useUiText();
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [type, setType] = useState(IncidentType.DAMAGED_FOOD);
  const [severity, setSeverity] = useState(PriorityLevel.HIGH);
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState<IncidentReport["preferredContactMethod"]>("IN_APP");
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);
  const submissionKey = useRef<string | undefined>(undefined);
  const refresh = useCallback(async () => {
    try { setReports(await incidentService.listForClaim(claimId)); }
    catch (caught) { setError(toServiceError(caught).message); }
    finally { setLoading(false); }
  }, [claimId]);
  useEffect(() => {
    const initial = window.setTimeout(() => { void refresh(); }, 0);
    const timer = window.setInterval(() => { void refresh(); }, 10_000);
    return () => { window.clearTimeout(initial); window.clearInterval(timer); };
  }, [refresh]);
  function changed() { submissionKey.current = undefined; setMessage(""); }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy || uploading || !canReport) return;
    setBusy(true); setError(""); setMessage("");
    submissionKey.current ||= crypto.randomUUID();
    try {
      const incident = await incidentService.createForClaim(claimId, { type, severity, description, preferredContactMethod: contact, evidenceUrls, submissionKey: submissionKey.current });
      setReports((current) => [incident, ...current.filter((r) => r.id !== incident.id)]);
      setMessage("Report submitted. আপনার report ও evidence সংরক্ষিত হয়েছে।");
      setDescription(""); setEvidenceUrls([]); submissionKey.current = undefined; onSubmitted?.();
    } catch (caught) { setError(toServiceError(caught).message); }
    finally { setBusy(false); }
  }
  return <section className="grid min-w-0 gap-5" aria-label={tx("Rescue incidents")}>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{tx(error)}</p>}
    {message && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">{tx(message)}</p>}
    {loading && <p>{tx("Loading reports…")}</p>}
    {!loading && !reports.length && <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm">{tx("এই rescue-এ এখন কোনো incident report নেই।")}</p>}
    {reports.map((report) => <Card key={report.id}>
      <CardHeader title={tx(INCIDENT_LABELS[report.type])} description={tx(STATUS_LABELS[report.status] || report.status)} />
      <CardContent className="grid min-w-0 gap-4">
        <p className="break-all text-xs text-muted-600">{tx("Report")}{" "}{report.id} · {report.reporterName || tx("Rescue participant")} ({tx(report.reporterRole || "participant")}) · {tx(report.severity)}</p>
        <p className="text-xs text-muted-600">{new Date(report.createdAt).toLocaleString(getUiLocale())}</p>
        <p className="whitespace-pre-wrap break-words rounded-xl bg-slate-50 p-4 text-sm">{report.description}</p>
        {report.blocksRescue === false && <p className="text-xs text-amber-800">{tx("Post-distribution report: আগের delivery/distribution record মুছে ফেলা হয়নি।")}</p>}
        <PhotoGallery urls={report.evidenceUrls} label={tx("Incident evidence")} />
        {report.reviews?.map((review) => <div key={review.id} className="grid gap-1 rounded-xl border border-slate-200 p-3 text-sm">
          <p className="font-semibold">{review.actorLabel} · {tx(STATUS_LABELS[review.status] || review.status)}{review.decision ? " / " + tx(review.decision) : ""}</p>
          <p className="whitespace-pre-wrap break-words">{review.note}</p>
          <p className="text-xs text-muted-600">{new Date(review.createdAt).toLocaleString(getUiLocale())}</p>
        </div>)}
      </CardContent>
    </Card>)}
    {showForm && (canReport ? <form onSubmit={submit}>
      <Card><CardHeader title={tx("Report a rescue issue")} description={tx("চলমান rescue report জমা হলে review-এর জন্য থামবে। ইতিমধ্যে বিতরণ করা খাবারের report audit হিসেবে সংরক্ষিত হবে।")} />
        <CardContent className="grid min-w-0 gap-5">
          <fieldset disabled={busy} className="grid min-w-0 gap-5">
            <Select label={tx("Issue category")} value={type} onChange={(e) => { setType(e.target.value as IncidentType); changed(); }}>{Object.entries(INCIDENT_LABELS).map(([value, label]) => <option key={value} value={value}>{tx(label)}</option>)}</Select>
            <Select label={tx("Severity")} value={severity} onChange={(e) => { setSeverity(e.target.value as PriorityLevel); changed(); }}>{Object.values(PriorityLevel).map((value) => <option key={value} value={value}>{tx(value)}</option>)}</Select>
            <Textarea label={tx("What happened?")} required minLength={12} maxLength={2000} value={description} onChange={(e) => { setDescription(e.target.value); changed(); }} hint={tx("Observed condition, quantity or delay লিখুন। Beneficiary-র ব্যক্তিগত তথ্য দেবেন না।")} />
            <Select label={tx("Follow-up preference")} value={contact} onChange={(e) => { setContact(e.target.value as IncidentReport["preferredContactMethod"]); changed(); }}><option value="IN_APP">{tx("In-app updates")}</option><option value="PHONE">{tx("Phone preference")}</option><option value="EMAIL">{tx("Email preference")}</option></Select>
            <PhotoUpload key={claimId} label={tx("Evidence photos (optional)")} purpose="INCIDENT" claimId={claimId} urls={evidenceUrls} onChange={(urls) => { setEvidenceUrls(urls); changed(); }} onBusyChange={setUploading} disabled={busy} />
          </fieldset>
          <Button type="submit" variant="danger" disabled={busy || uploading}>{busy ? tx("Submitting…") : tx("Submit incident")}</Button>
        </CardContent>
      </Card>
    </form> : <p className="rounded-xl bg-amber-50 p-4 text-sm">{tx("এই rescue-এ নতুন operational report জমা দেওয়া যাবে না। আগের report ও review history উপরে দেখুন।")}</p>)}
  </section>;
}
