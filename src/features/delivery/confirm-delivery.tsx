"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, CheckCircle2, QrCode, RefreshCw } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/ui/empty-state";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { RadioGroup } from "@/components/ui/radio-group";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { DeliveryClaimSummary } from "@/features/delivery/delivery-claim-summary";
import { NGO_VIEWER } from "@/features/ngo-dashboard/use-ngo-dashboard";
import { ClaimStatus } from "@/lib/constants/statuses";
import { ROUTES } from "@/lib/routes";
import { claimService, deliveryService, toServiceError, type ClaimCoordinationDetails } from "@/services";
import type { DeliveryFoodCondition, DeliveryReceipt } from "@/types/domain";

type FormErrors = Partial<Record<"actualQuantity" | "foodCondition" | "fallbackCode" | "notes" | "quantityMismatchConfirmed" | "photoNames", string>>;

function deliveryCode(token?: string) {
  return token?.replace(/\D/g, "").slice(-6).padStart(6, "0") ?? "000000";
}

export function ConfirmDelivery({ claimId }: { claimId: string }) {
  const [details, setDetails] = useState<ClaimCoordinationDetails>();
  const [receipt, setReceipt] = useState<DeliveryReceipt>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [actualQuantity, setActualQuantity] = useState("");
  const [foodCondition, setFoodCondition] = useState<DeliveryFoodCondition>("GOOD");
  const [verificationMethod, setVerificationMethod] = useState<DeliveryReceipt["verificationMethod"]>("QR");
  const [fallbackCode, setFallbackCode] = useState("");
  const [notes, setNotes] = useState("");
  const [photoNames, setPhotoNames] = useState<string[]>([]);
  const [mismatchConfirmed, setMismatchConfirmed] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  async function load() {
    setLoading(true);
    setError(undefined);
    try {
      const [nextDetails, nextReceipt] = await Promise.all([
        claimService.getCoordinationDetails(claimId, NGO_VIEWER),
        deliveryService.getByClaimId(claimId, NGO_VIEWER),
      ]);
      setDetails(nextDetails);
      setReceipt(nextReceipt);
      setActualQuantity((current) => current || String(nextDetails.donation.quantity.value));
    } catch (caught) {
      setError(toServiceError(caught).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [claimId]); // eslint-disable-line react-hooks/exhaustive-deps

  const quantityMismatch = useMemo(() => {
    if (!details || actualQuantity.trim() === "") return false;
    return Number(actualQuantity) !== details.donation.quantity.value;
  }, [actualQuantity, details]);

  function validate() {
    const next: FormErrors = {};
    if (!Number.isFinite(Number(actualQuantity)) || Number(actualQuantity) <= 0) next.actualQuantity = "Enter the quantity that arrived.";
    if (quantityMismatch && !mismatchConfirmed) next.quantityMismatchConfirmed = "Confirm the difference before continuing.";
    if (verificationMethod === "FALLBACK_CODE" && !/^\d{6}$/.test(fallbackCode)) next.fallbackCode = "Enter the six-digit delivery code.";
    if (foodCondition === "DAMAGED_POOR" && notes.trim().length < 12) next.notes = "Describe the food safety concern in at least 12 characters.";
    setFormErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!details || !validate()) return;
    setBusy(true);
    setError(undefined);
    try {
      const created = await deliveryService.confirm(claimId, {
        actualQuantity: Number(actualQuantity), foodCondition, verificationMethod,
        fallbackCode: verificationMethod === "FALLBACK_CODE" ? fallbackCode : undefined,
        quantityMismatchConfirmed: mismatchConfirmed, notes, photoNames,
      }, NGO_VIEWER);
      setReceipt(created);
      setDetails(await claimService.getCoordinationDetails(claimId, NGO_VIEWER));
    } catch (caught) {
      const serviceError = toServiceError(caught);
      setError(serviceError.message);
      setFormErrors((serviceError.fieldErrors ?? {}) as FormErrors);
    } finally {
      setBusy(false);
    }
  }

  return (
    <PortalShell role="ngo" activeHref={ROUTES.ngo.claims} title="Confirm delivery" description="Verify what arrived and create a traceable delivery receipt." profileName="Hope Foundation" profileDescription="Verified NGO" avatarInitials="HF" actions={<ButtonLink href={ROUTES.ngo.claim(claimId)} variant="ghost" size="sm" leftIcon={<ArrowLeft className="size-4" />}>Claim details</ButtonLink>}>
      {loading && !details && <SkeletonGroup label="Loading delivery confirmation" className="grid gap-5"><Skeleton className="h-48" /><Skeleton className="h-96" /></SkeletonGroup>}
      {error && !details && <EmptyState icon={RefreshCw} title="Delivery details could not load" description={error} action={<Button onClick={() => void load()}>Try again</Button>} />}
      {details && <div className="grid gap-6">
        <DeliveryClaimSummary details={details} />
        {error && <Alert tone="danger" title="Delivery could not be confirmed" description={error} />}
        {receipt ? <Card><CardHeader title="Delivery receipt recorded" description={`Receipt ${receipt.id}`} action={<CheckCircle2 className="size-6 text-success-strong" />} /><CardContent className="grid gap-4"><Alert tone={receipt.distributionBlocked ? "danger" : "success"} title={receipt.distributionBlocked ? "Distribution is blocked" : "Food is ready for distribution"} description={receipt.distributionBlocked ? "A damaged or poor food condition was recorded. Submit an incident for review before serving this food." : `${receipt.actualQuantity} ${receipt.quantityUnit.toLowerCase()} received and verified by ${receipt.verificationMethod === "QR" ? "QR" : "fallback code"}.`} /><div className="flex flex-wrap gap-3">{receipt.distributionBlocked ? <ButtonLink href={ROUTES.ngo.reportIssue(claimId)} variant="danger">Report safety incident</ButtonLink> : <ButtonLink href={ROUTES.ngo.distribution(claimId)}>Record distribution</ButtonLink>}<ButtonLink href={ROUTES.ngo.claim(claimId)} variant="outline">Return to claim</ButtonLink></div></CardContent></Card> : details.claim.status !== ClaimStatus.PICKED_UP ? <Alert tone="warning" title="Delivery cannot be confirmed yet" description="This workflow becomes available after pickup verification." /> : <form onSubmit={submit} className="grid gap-6">
          <Card><CardHeader title="Receipt details" description="Record the actual handover instead of copying the expected values blindly." /><CardContent className="grid gap-5"><Input label="Actual quantity received" type="number" min="0.1" step="0.1" value={actualQuantity} onChange={(event) => setActualQuantity(event.target.value)} error={formErrors.actualQuantity} hint={`Expected: ${details.donation.quantity.value} ${details.donation.quantity.unit.toLowerCase()}`} /><RadioGroup label="Food condition on arrival" name="foodCondition" value={foodCondition} onChange={(event) => setFoodCondition(event.target.value as DeliveryFoodCondition)} orientation="horizontal" items={[{ value: "GOOD", label: "Good", description: "Safe and as expected." }, { value: "ACCEPTABLE", label: "Acceptable", description: "Usable with a minor concern." }, { value: "DAMAGED_POOR", label: "Damaged / poor", description: "Block distribution and review." }]} />{quantityMismatch && <Checkbox checked={mismatchConfirmed} onChange={(event) => setMismatchConfirmed(event.target.checked)} label="I confirm the quantity differs from the donation record" description="The expected and actual quantities will both remain visible on the receipt." error={formErrors.quantityMismatchConfirmed} />}<Textarea label="Condition notes" value={notes} onChange={(event) => setNotes(event.target.value)} error={formErrors.notes} maxLength={500} hint="Required when food is damaged or poor." placeholder="Packaging, temperature, missing items, or other observations…" /><FileUpload label="Delivery photos" name="deliveryPhotos" accept="image/*" multiple maxFiles={5} fileNames={photoNames} onFilesChange={(files) => setPhotoNames(files.map((file) => file.name))} error={formErrors.photoNames} hint="Optional. Up to five images; names only are kept in this frontend demo." /></CardContent></Card>
          <Card><CardHeader title="Handover verification" description="Use the QR handover in the normal path or the six-digit code as an accessible fallback." action={<QrCode className="size-6 text-brand-700" />} /><CardContent className="grid gap-5"><RadioGroup label="Verification method" name="verificationMethod" value={verificationMethod} onChange={(event) => setVerificationMethod(event.target.value as DeliveryReceipt["verificationMethod"])} orientation="horizontal" items={[{ value: "QR", label: "QR scan", description: "Simulated scan for this frontend build." }, { value: "FALLBACK_CODE", label: "Six-digit code", description: "Use when a camera is unavailable." }]} />{verificationMethod === "QR" ? <div className="grid min-h-44 place-items-center rounded-3xl border-2 border-dashed border-brand-200 bg-brand-50 text-center"><div><QrCode className="mx-auto size-16 text-brand-800" /><p className="mt-2 font-black text-ink-900">Mock QR verified</p><p className="mt-1 text-xs text-muted-600">Backend scanning and one-time expiry are intentionally simulated.</p></div></div> : <Input label="Delivery fallback code" inputMode="numeric" maxLength={6} value={fallbackCode} onChange={(event) => setFallbackCode(event.target.value.replace(/\D/g, ""))} error={formErrors.fallbackCode} hint={`Demo code: ${deliveryCode(details.claim.deliveryVerificationToken)}`} />}</CardContent></Card>
          {foodCondition === "DAMAGED_POOR" && <Alert tone="danger" title="Do not distribute unsafe food" description="Confirming creates the receipt but blocks distribution. Use the incident workflow immediately after saving." />}
          <div className="flex flex-wrap justify-end gap-3"><ButtonLink href={ROUTES.ngo.reportIssue(claimId)} variant="outline">Report issue instead</ButtonLink><Button type="submit" disabled={busy}>{busy ? "Saving receipt…" : "Confirm delivery"}</Button></div>
        </form>}
      </div>}
    </PortalShell>
  );
}
