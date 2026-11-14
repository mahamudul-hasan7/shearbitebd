"use client";
import { UiText } from "@/lib/i18n/ui-text-node";
import { useUiText } from "@/lib/i18n/use-ui-text";

import { useEffect, useState, type FormEvent } from "react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PhotoUpload } from "@/components/ui/photo-upload";
import { PhotoGallery } from "@/components/ui/photo-gallery";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { DeliveryClaimSummary } from "@/features/delivery/delivery-claim-summary";
import { NGO_VIEWER } from "@/features/ngo-dashboard/use-ngo-dashboard";
import { ClaimStatus } from "@/lib/constants/statuses";
import { ROUTES } from "@/lib/routes";
import { claimService, deliveryService, toServiceError, type ClaimCoordinationDetails } from "@/services";
import type { DeliveryFoodCondition, DeliveryReceipt } from "@/types/domain";

export function ConfirmDelivery({ claimId }: { claimId: string }) {
  const tx = useUiText();
  const [details, setDetails] = useState<ClaimCoordinationDetails>();
  const [receipt, setReceipt] = useState<DeliveryReceipt>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [condition, setCondition] = useState<DeliveryFoodCondition>("GOOD");
  const [mismatch, setMismatch] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [notes, setNotes] = useState("");
  useEffect(() => {
    let cancelled = false;
    Promise.all([claimService.getCoordinationDetails(claimId, NGO_VIEWER), deliveryService.getByClaimId(claimId, NGO_VIEWER)])
      .then(([data, saved]) => { if (!cancelled) { setDetails(data); setReceipt(saved); setQuantity(String(data.donation.quantity.value)); } })
      .catch((caught) => { if (!cancelled) setError(toServiceError(caught).message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [claimId]);
  async function submit(event: FormEvent) {
    event.preventDefault(); if (uploading) return; setBusy(true); setError("");
    try { setReceipt(await deliveryService.confirm(claimId, { actualQuantity: Number(quantity), foodCondition: condition, verificationMethod: "OTP", quantityMismatchConfirmed: mismatch, notes, photoNames: [], photoUrls }, NGO_VIEWER)); }
    catch (caught) { setError(toServiceError(caught).message); }
    finally { setBusy(false); }
  }
  return <PortalShell role="ngo" activeHref={ROUTES.ngo.claims} title={tx("Delivery receipt")} description={tx("Verified handover-এর পর প্রাপ্ত খাবারের পরিমাণ ও অবস্থা সংরক্ষণ করুন।")} profileName="NGO" profileDescription={tx("Receiving organization")} avatarInitials="NG" backHref={ROUTES.ngo.claim(claimId)} backLabel={tx("Claim details")}>
    <div className="grid gap-6">
      {loading && <p>{tx("Loading receipt…")}</p>}
      {error && <Alert tone="danger" title={tx("Receipt could not be saved")} description={tx(error)} />}
      {details && <DeliveryClaimSummary details={details} />}
      {receipt ? <Card><CardHeader title={tx("Receipt saved")} description={receipt.id} /><CardContent className="grid gap-4">
        <p>{tx("Received:")}{" "}{receipt.actualQuantity} {receipt.quantityUnit} · {receipt.foodCondition}</p>
        <p>{tx("Handover verified by OTP.")}</p>
        <PhotoGallery urls={receipt.photoUrls} label={tx("Receipt photos")} />
        {receipt.distributionBlocked ? <Alert tone="danger" title={tx("Do not distribute this food")} description={tx("The recorded food condition blocks distribution.")} /> : <ButtonLink href={ROUTES.ngo.distribution(claimId)}>{tx("Record distribution")}</ButtonLink>}
      </CardContent></Card> : details && details.claim.status !== ClaimStatus.DELIVERED ? <Alert tone="warning" title={tx("Delivery verification required")} description={tx("NGO claim page থেকে delivery code তৈরি করুন। Assigned volunteer code দিয়ে delivery নিশ্চিত করলে receipt জমা দেওয়া যাবে।")} action={<ButtonLink href={ROUTES.ngo.claim(claimId)}><UiText source={"Go to claim"} /></ButtonLink>} /> : details && <form onSubmit={submit}>
        <Card><CardHeader title={tx("Received food")} description={tx("Compare the food with the donor's declared quantity.")} /><CardContent className="grid gap-5">
          <Input label={tx("Received quantity ({0})", details.donation.quantity.unit)} type="number" min="0.01" step="any" required value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          <label className="grid gap-2 text-sm font-semibold">{tx("Food condition")}<select className="rounded-xl border border-slate-300 p-3" value={condition} onChange={(e) => setCondition(e.target.value as DeliveryFoodCondition)}><option value="GOOD">{tx("Good")}</option><option value="ACCEPTABLE">{tx("Acceptable")}</option><option value="DAMAGED_POOR">{tx("Damaged / poor — block distribution")}</option></select></label>
          {Number(quantity) !== details.donation.quantity.value && <Checkbox checked={mismatch} onChange={(e) => setMismatch(e.target.checked)} label={tx("I confirm the received quantity differs from the donor's declaration")} />}
          <Textarea label={tx("Receipt notes (optional)")} maxLength={2000} value={notes} onChange={(e) => setNotes(e.target.value)} />
          <PhotoUpload label={tx("Received food photos (optional)")} purpose="RECEIPT" claimId={claimId} urls={photoUrls} onChange={setPhotoUrls} onBusyChange={setUploading} disabled={busy} />
          <Button type="submit" disabled={busy || uploading}>{busy ? tx("Saving…") : tx("Save receipt")}</Button>
        </CardContent></Card>
      </form>}
    </div>
  </PortalShell>;
}
