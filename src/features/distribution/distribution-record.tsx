"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, CheckCircle2, RefreshCw, UsersRound } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/ui/empty-state";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { DeliveryClaimSummary } from "@/features/delivery/delivery-claim-summary";
import { NGO_USER_ID, NGO_VIEWER } from "@/features/ngo-dashboard/use-ngo-dashboard";
import { ClaimStatus } from "@/lib/constants/statuses";
import { ROUTES } from "@/lib/routes";
import { claimService, deliveryService, distributionService, profileService, toServiceError, type ClaimCoordinationDetails, type ProfileBundle } from "@/services";
import type { DeliveryReceipt, DistributionRecord } from "@/types/domain";

type FormErrors = Partial<Record<"beneficiariesServed" | "mealsDistributed" | "breakdown" | "distributedAt" | "addressId" | "photoNames" | "beneficiaryConsentConfirmed", string>>;

function localDateTime() {
  const now = new Date(Date.now() - new Date().getTimezoneOffset() * 60_000);
  return now.toISOString().slice(0, 16);
}

export function DistributionRecordScreen({ claimId }: { claimId: string }) {
  const [details, setDetails] = useState<ClaimCoordinationDetails>();
  const [receipt, setReceipt] = useState<DeliveryReceipt>();
  const [record, setRecord] = useState<DistributionRecord>();
  const [profile, setProfile] = useState<ProfileBundle>();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [errors, setErrors] = useState<FormErrors>({});
  const [beneficiaries, setBeneficiaries] = useState("");
  const [meals, setMeals] = useState("");
  const [adults, setAdults] = useState("");
  const [children, setChildren] = useState("");
  const [distributedAt, setDistributedAt] = useState(localDateTime);
  const [addressId, setAddressId] = useState("");
  const [notes, setNotes] = useState("");
  const [photoNames, setPhotoNames] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);

  async function load() {
    setLoading(true);
    setError(undefined);
    try {
      const [nextDetails, nextReceipt, nextRecord, nextProfile] = await Promise.all([
        claimService.getCoordinationDetails(claimId, NGO_VIEWER), deliveryService.getByClaimId(claimId, NGO_VIEWER),
        distributionService.getByClaimId(claimId, NGO_VIEWER), profileService.getOwnProfile(NGO_USER_ID, NGO_VIEWER),
      ]);
      setDetails(nextDetails); setReceipt(nextReceipt); setRecord(nextRecord); setProfile(nextProfile);
      setMeals((value) => value || String(nextDetails.donation.quantity.estimatedMeals));
      setAddressId((value) => value || nextProfile.addresses.find((item) => item.isPrimary)?.id || nextProfile.addresses[0]?.id || "");
    } catch (caught) { setError(toServiceError(caught).message); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [claimId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setError(undefined); setErrors({});
    try {
      const created = await distributionService.create(claimId, {
        beneficiariesServed: Number(beneficiaries), mealsDistributed: Number(meals),
        adultsServed: adults ? Number(adults) : undefined, childrenServed: children ? Number(children) : undefined,
        distributedAt: new Date(distributedAt).toISOString(), addressId, notes, photoNames,
        beneficiaryConsentConfirmed: consent,
      }, NGO_VIEWER);
      setRecord(created);
      setDetails(await claimService.getCoordinationDetails(claimId, NGO_VIEWER));
    } catch (caught) {
      const serviceError = toServiceError(caught);
      setError(serviceError.message); setErrors((serviceError.fieldErrors ?? {}) as FormErrors);
    } finally { setBusy(false); }
  }

  return (
    <PortalShell role="ngo" activeHref={ROUTES.ngo.claims} title="Record distribution" description="Close the rescue with privacy-aware beneficiary and impact details." profileName="Hope Foundation" profileDescription="Verified NGO" avatarInitials="HF" actions={<ButtonLink href={ROUTES.ngo.claim(claimId)} variant="ghost" size="sm" leftIcon={<ArrowLeft className="size-4" />}>Claim details</ButtonLink>}>
      {loading && !details && <SkeletonGroup label="Loading distribution record" className="grid gap-5"><Skeleton className="h-48" /><Skeleton className="h-96" /></SkeletonGroup>}
      {error && !details && <EmptyState icon={RefreshCw} title="Distribution details could not load" description={error} action={<Button onClick={() => void load()}>Try again</Button>} />}
      {details && <div className="grid gap-6">
        <DeliveryClaimSummary details={details} />
        {error && <Alert tone="danger" title="Distribution could not be recorded" description={error} />}
        {record ? <Card><CardHeader title="Distribution recorded" description={`Record ${record.id}`} action={<CheckCircle2 className="size-6 text-success-strong" />} /><CardContent className="grid gap-4"><Alert tone="success" title={`${record.beneficiariesServed} people served`} description={`${record.mealsDistributed} meals were added to the NGO impact history without storing beneficiary names or identities.`} /><div className="grid gap-3 sm:grid-cols-3"><Metric label="Meals distributed" value={record.mealsDistributed} /><Metric label="Adults" value={record.adultsServed ?? "Not recorded"} /><Metric label="Children" value={record.childrenServed ?? "Not recorded"} /></div><div className="flex flex-wrap gap-3"><ButtonLink href={ROUTES.ngo.impact}>View impact</ButtonLink><ButtonLink href={ROUTES.ngo.claim(claimId)} variant="outline">Return to claim</ButtonLink></div></CardContent></Card> : !receipt ? <Alert tone="warning" title="Confirm delivery first" description="A delivery receipt is required before beneficiary distribution can be recorded." action={<ButtonLink href={ROUTES.ngo.confirmDelivery(claimId)} size="sm">Confirm delivery</ButtonLink>} /> : receipt.distributionBlocked ? <Alert tone="danger" title="Distribution is blocked" description="The receipt marked this food as damaged or poor. Report the incident and do not serve it." action={<ButtonLink href={ROUTES.ngo.reportIssue(claimId)} variant="danger" size="sm">Report incident</ButtonLink>} /> : details.claim.status !== ClaimStatus.DELIVERED ? <Alert tone="warning" title="Distribution is unavailable" description="Only a delivered claim can enter this workflow." /> : <form onSubmit={submit} className="grid gap-6">
          <Card><CardHeader title="Beneficiary outcome" description="Use aggregate counts only. Never enter beneficiary names, phone numbers, or identifiable notes." action={<UsersRound className="size-6 text-brand-700" />} /><CardContent className="grid gap-5"><div className="grid gap-4 sm:grid-cols-2"><Input label="People served" type="number" min="1" step="1" value={beneficiaries} onChange={(event) => setBeneficiaries(event.target.value)} error={errors.beneficiariesServed} /><Input label="Meals distributed" type="number" min="1" step="1" value={meals} onChange={(event) => setMeals(event.target.value)} error={errors.mealsDistributed} /></div><div className="grid gap-4 sm:grid-cols-2"><Input label="Adults served (optional)" type="number" min="0" step="1" value={adults} onChange={(event) => setAdults(event.target.value)} error={errors.breakdown} /><Input label="Children served (optional)" type="number" min="0" step="1" value={children} onChange={(event) => setChildren(event.target.value)} /></div><Input label="Distribution date and time" type="datetime-local" max={localDateTime()} value={distributedAt} onChange={(event) => setDistributedAt(event.target.value)} error={errors.distributedAt} /><Select label="Distribution location" value={addressId} onChange={(event) => setAddressId(event.target.value)} error={errors.addressId}>{profile?.addresses.map((address) => <option key={address.id} value={address.id}>{address.label} — {address.area}, {address.city}</option>)}</Select><Textarea label="Operational notes (optional)" value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={500} hint="Do not include beneficiary identities or sensitive personal information." /><FileUpload label="Distribution photos" name="distributionPhotos" accept="image/*" multiple maxFiles={5} fileNames={photoNames} onFilesChange={(files) => setPhotoNames(files.map((file) => file.name))} error={errors.photoNames} hint="Use group or food-only images with consent. Names only are kept in this demo." /></CardContent></Card>
          <Card><CardHeader title="Consent and privacy" description="This confirmation is required before the outcome can be saved." /><CardContent><Checkbox checked={consent} onChange={(event) => setConsent(event.target.checked)} label="I confirm consent and privacy safeguards were followed" description="No beneficiary identity is stored; any uploaded image was captured with appropriate consent and dignity." error={errors.beneficiaryConsentConfirmed} /></CardContent></Card>
          <div className="flex justify-end"><Button type="submit" disabled={busy}>{busy ? "Saving distribution…" : "Complete rescue"}</Button></div>
        </form>}
      </div>}
    </PortalShell>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-2xl bg-brand-50 p-4"><p className="text-xs text-muted-600">{label}</p><p className="mt-1 text-xl font-black text-ink-900">{value}</p></div>;
}
