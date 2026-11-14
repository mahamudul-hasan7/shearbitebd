"use client";
import { LiveIcon } from "@/components/motion/live-icon";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

import { UiText } from "@/lib/i18n/ui-text-node";
import { useUiText } from "@/lib/i18n/use-ui-text";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { CheckCircle2, RefreshCw, UsersRound } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/ui/empty-state";
import { PhotoUpload } from "@/components/ui/photo-upload";
import { PhotoGallery } from "@/components/ui/photo-gallery";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DeliveryClaimSummary } from "@/features/delivery/delivery-claim-summary";
import { NGO_USER_ID, NGO_VIEWER } from "@/features/ngo-dashboard/use-ngo-dashboard";
import { ClaimStatus, DonationStatus } from "@/lib/constants/statuses";
import { getUiLocale } from "@/lib/i18n/locale";
import { localDistributionTime, validateDistributionForm, type DistributionFormErrors } from "./distribution-validation";
import { ROUTES } from "@/lib/routes";
import { claimService, deliveryService, distributionService, profileService, toServiceError, type ClaimCoordinationDetails, type ProfileBundle } from "@/services";
import type { DeliveryReceipt, DistributionRecord } from "@/types/domain";

export function DistributionRecordScreen({ claimId }: { claimId: string }) {
  const tx = useUiText();
  const [details, setDetails] = useState<ClaimCoordinationDetails>();
  const [receipt, setReceipt] = useState<DeliveryReceipt>();
  const [record, setRecord] = useState<DistributionRecord>();
  const [profile, setProfile] = useState<ProfileBundle>();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [errors, setErrors] = useState<DistributionFormErrors>({});
  const [beneficiaries, setBeneficiaries] = useState("");
  const [meals, setMeals] = useState("");
  const [adults, setAdults] = useState("");
  const [children, setChildren] = useState("");
  const [distributedAt, setDistributedAt] = useState("");
  const [serverOffset, setServerOffset] = useState(0);
  const [addressId, setAddressId] = useState("");
  const [notes, setNotes] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [consent, setConsent] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const submitting = useRef(false);
  const mealCapacity = details ? Math.floor(details.donation.quantity.estimatedMeals * Math.min(1, (receipt?.actualQuantity ?? details.donation.quantity.value) / details.donation.quantity.value)) : 0;

  function revealError(message: string, fieldErrors: DistributionFormErrors = {}) {
    setError(message); setErrors(fieldErrors);
    window.requestAnimationFrame(() => {
      const target = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]') ?? errorRef.current;
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
      target?.focus({ preventScroll: true });
    });
  }

  function clearError(field: keyof DistributionFormErrors) {
    setErrors((current) => ({ ...current, [field]: undefined }));
    setError(undefined);
  }

  async function load() {
    setLoading(true);
    setError(undefined);
    try {
      const [nextDetails, nextReceipt, context, nextProfile] = await Promise.all([
        claimService.getCoordinationDetails(claimId, NGO_VIEWER), deliveryService.getByClaimId(claimId, NGO_VIEWER),
        distributionService.getContext(claimId), profileService.getOwnProfile(NGO_USER_ID, NGO_VIEWER),
      ]);
      const serverTime = Date.parse(context.serverTime);
      if (!Number.isFinite(serverTime)) throw new Error("Distribution details could not load");
      setServerOffset(serverTime - Date.now());
      setDistributedAt((value) => value || localDistributionTime(serverTime));
      setDetails(nextDetails); setReceipt(nextReceipt); setRecord(context.distribution ?? undefined); setProfile(nextProfile);
      setMeals((value) => value || String(Math.floor(nextDetails.donation.quantity.estimatedMeals * Math.min(1, (nextReceipt?.actualQuantity ?? nextDetails.donation.quantity.value) / nextDetails.donation.quantity.value))));
      setAddressId((value) => value || (nextDetails.claim.foodRequestId ? nextDetails.deliveryAddress?.id : undefined) || nextProfile.addresses.find((item) => item.isPrimary)?.id || nextProfile.addresses[0]?.id || "");
    } catch (caught) { setError(toServiceError(caught).message); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [claimId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (submitting.current || uploading || !receipt || !details) return;
    const nextErrors = validateDistributionForm({ beneficiaries, meals, adults, children, distributedAt, addressId, consent }, { now: Date.now() + serverOffset, receivedAt: receipt.receivedAt, mealCapacity });
    if (Object.values(nextErrors).some(Boolean)) {
      revealError("Check the highlighted fields before completing distribution.", nextErrors);
      return;
    }
    submitting.current = true;
    setBusy(true); setError(undefined); setErrors({});
    try {
      const created = await distributionService.create(claimId, {
        beneficiariesServed: Number(beneficiaries), mealsDistributed: Number(meals),
        adultsServed: adults ? Number(adults) : undefined, childrenServed: children ? Number(children) : undefined,
        distributedAt: new Date(distributedAt).toISOString(), addressId, notes, photoNames: [], photoUrls,
        beneficiaryConsentConfirmed: consent,
      }, NGO_VIEWER);
      setRecord(created);
      setDetails((current) => current ? { ...current, claim: { ...current.claim, status: ClaimStatus.DISTRIBUTED }, donation: { ...current.donation, status: DonationStatus.DISTRIBUTED } } : current);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (caught) {
      const serviceError = toServiceError(caught);
      revealError(serviceError.message, (serviceError.fieldErrors ?? {}) as DistributionFormErrors);
    } finally { submitting.current = false; setBusy(false); }
  }

  return (
    <PortalShell
      role="ngo"
      activeHref={ROUTES.ngo.claims}
      title={tx("Record distribution")}
      description={tx("Close the rescue with privacy-aware beneficiary and impact details.")}
      profileName={profile?.user.displayName || "NGO"}
      profileDescription={tx("Verified NGO")}
      avatarInitials={profile?.user.displayName.slice(0, 2).toUpperCase() || "NG"}
      backHref={ROUTES.ngo.claim(claimId)}
      backLabel={tx("Claim details")}
    >
      {loading && !details && <LoadingSpinner label={tx("Loading distribution record")} />}
      {error && !details && <EmptyState icon={RefreshCw} title={tx("Distribution details could not load")} description={tx(error)} action={<Button onClick={() => void load()}><UiText source={"Try again"} /></Button>} />}
      {details && <div className="grid gap-6">
        <DeliveryClaimSummary details={details} />
        {error && <div ref={errorRef} tabIndex={-1}><Alert tone="danger" title={tx("Distribution could not be recorded")} description={tx(error)} /></div>}
        {record ? <Card><CardHeader title={tx("Distribution recorded")} description={tx("Record {0}", record.id)} action={<LiveIcon icon={CheckCircle2} motion="once" className="size-6 text-success-strong" />} /><CardContent className="grid gap-4"><Alert tone="success" title={tx("{0} people served", record.beneficiariesServed)} description={tx("{0} meals were added to the NGO impact history without storing beneficiary names or identities.", record.mealsDistributed)} /><div className="grid gap-3 sm:grid-cols-3"><Metric label={tx("Meals distributed")} value={record.mealsDistributed} /><Metric label={tx("Adults")} value={record.adultsServed ?? "Not recorded"} /><Metric label={tx("Children")} value={record.childrenServed ?? "Not recorded"} /></div><PhotoGallery urls={record.photoUrls} label={tx("Distribution photos")} /><div className="flex flex-wrap gap-3"><ButtonLink href={ROUTES.ngo.impact}>{tx("View impact")}</ButtonLink><ButtonLink href={ROUTES.ngo.claim(claimId)} variant="outline">{tx("Return to claim")}</ButtonLink></div></CardContent></Card> : !receipt ? <Alert tone="warning" title={tx("Confirm delivery first")} description={tx("A delivery receipt is required before beneficiary distribution can be recorded.")} action={<ButtonLink href={ROUTES.ngo.confirmDelivery(claimId)} size="sm"><UiText source={"Confirm delivery"} /></ButtonLink>} /> : receipt.distributionBlocked ? <Alert tone="danger" title={tx("Distribution is blocked")} description={tx("The receipt marked this food as damaged or poor. Report the incident and do not serve it.")} action={<ButtonLink href={ROUTES.ngo.reportIssue(claimId)} variant="danger" size="sm"><UiText source={"Report incident"} /></ButtonLink>} /> : details.claim.status !== ClaimStatus.DELIVERED ? <Alert tone="warning" title={tx("Distribution is unavailable")} description={tx("Only a delivered claim can enter this workflow.")} /> : <form ref={formRef} onSubmit={submit} noValidate className="grid gap-6">
          <Card>
            <CardHeader title={tx("Beneficiary outcome")} description={tx("Use aggregate counts only. Never enter beneficiary names, phone numbers, or identifiable notes.")} action={<UsersRound className="size-6 text-brand-700" />} />
            <CardContent className="grid gap-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input name="beneficiariesServed" label={tx("People served")} aria-label={tx("People served")} type="number" min="1" max="1000000" step="1" required value={beneficiaries} onChange={(event) => { setBeneficiaries(event.target.value); clearError("beneficiariesServed"); }} error={tx(errors.beneficiariesServed)} />
                <Input name="mealsDistributed" label={tx("Meals distributed")} aria-label={tx("Meals distributed")} type="number" min="1" max={mealCapacity} step="1" required value={meals} onChange={(event) => { setMeals(event.target.value); clearError("mealsDistributed"); }} error={tx(errors.mealsDistributed)} hint={tx("You can record up to {0} meals from the received food.", mealCapacity)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input name="adultsServed" label={tx("Adults served (optional)")} type="number" min="0" step="1" value={adults} onChange={(event) => { setAdults(event.target.value); clearError("breakdown"); }} error={tx(errors.breakdown)} />
                <Input name="childrenServed" label={tx("Children served (optional)")} type="number" min="0" step="1" value={children} onChange={(event) => { setChildren(event.target.value); clearError("breakdown"); }} />
              </div>
              <div className="grid gap-2">
                <Input name="distributedAt" label={tx("Distribution date and time")} aria-label={tx("Distribution date and time")} type="datetime-local" step="0.001" required min={receipt ? localDistributionTime(Date.parse(receipt.receivedAt)) : undefined} value={distributedAt} onChange={(event) => { setDistributedAt(event.target.value); clearError("distributedAt"); }} error={tx(errors.distributedAt)} hint={receipt ? tx("Received at {0}", new Intl.DateTimeFormat(getUiLocale(), { dateStyle: "medium", timeStyle: "medium" }).format(new Date(receipt.receivedAt))) : undefined} />
                <Button type="button" variant="outline" size="sm" className="justify-self-start" onClick={() => { setDistributedAt(localDistributionTime(Date.now() + serverOffset)); clearError("distributedAt"); }}>{tx("Use current time")}</Button>
              </div>
              <Select name="addressId" label={tx("Distribution location")} required value={addressId} onChange={(event) => { setAddressId(event.target.value); clearError("addressId"); }} error={tx(errors.addressId)}>
                <option value="">{tx("Choose a distribution location")}</option>
                {profile?.addresses.map((address) => <option key={address.id} value={address.id}>{address.label} - {address.area}, {address.city}</option>)}
              </Select>
              <Textarea label={tx("Operational notes (optional)")} value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={500} hint={tx("Do not include beneficiary identities or sensitive personal information.")} />
              <PhotoUpload label={tx("Distribution photos (optional)")} purpose="DISTRIBUTION" claimId={claimId} urls={photoUrls} onChange={setPhotoUrls} onBusyChange={setUploading} disabled={busy} />
            </CardContent>
          </Card>
          <Card><CardHeader title={tx("Consent and privacy")} description={tx("This confirmation is required before the outcome can be saved.")} /><CardContent><Checkbox name="beneficiaryConsentConfirmed" checked={consent} onChange={(event) => { setConsent(event.target.checked); clearError("beneficiaryConsentConfirmed"); }} label={tx("I confirm consent and privacy safeguards were followed")} description={tx("No beneficiary identity is stored; any selected image was captured with appropriate consent and dignity.")} error={tx(errors.beneficiaryConsentConfirmed)} /></CardContent></Card>
          <div className="flex justify-end"><Button type="submit" disabled={busy || uploading}>{busy ? tx("Saving distribution…") : tx("Complete rescue")}</Button></div>
        </form>}
      </div>}
    </PortalShell>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-2xl bg-brand-50 p-4"><p className="text-xs text-muted-600">{label}</p><p className="mt-1 text-xl font-black text-ink-900">{value}</p></div>;
}
