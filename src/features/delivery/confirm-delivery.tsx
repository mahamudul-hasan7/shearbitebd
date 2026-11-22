"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PhotoUpload } from "@/components/ui/photo-upload";
import { PhotoGallery } from "@/components/ui/photo-gallery";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { DeliveryClaimSummary } from "./delivery-claim-summary";
import { UNIT_LABELS_BN } from "@/features/donations/donation-presentation";
import { NGO_VIEWER } from "@/features/ngo-dashboard/use-ngo-dashboard";
import { ClaimStatus } from "@/lib/constants/statuses";
import { ROUTES } from "@/lib/routes";
import { useUiText } from "@/lib/i18n/use-ui-text";
import {
  claimService,
  deliveryService,
  toServiceError,
  type ClaimCoordinationDetails,
} from "@/services";
import type { DeliveryFoodCondition, DeliveryReceipt } from "@/types/domain";

type ReceiptErrors = Partial<
  Record<"actualQuantity" | "quantityMismatchConfirmed" | "notes", string>
>;
const conditionLabels: Record<DeliveryFoodCondition, string> = {
  GOOD: "Good",
  ACCEPTABLE: "Acceptable",
  DAMAGED_POOR: "Damaged / poor — block distribution",
};
export function ConfirmDelivery({ claimId }: { claimId: string }) {
  return <ReceiptForm key={claimId} claimId={claimId} />;
}
function ReceiptForm({ claimId }: { claimId: string }) {
  const tx = useUiText();
  const [details, setDetails] = useState<ClaimCoordinationDetails>();
  const [receipt, setReceipt] = useState<DeliveryReceipt>();
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<ReceiptErrors>({});
  const [revision, setRevision] = useState(0),
    [loaded, setLoaded] = useState(-1);
  const loading = loaded !== revision;
  const [busy, setBusy] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [condition, setCondition] = useState<DeliveryFoodCondition>("GOOD");
  const [mismatch, setMismatch] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [notes, setNotes] = useState("");
  const formRef = useRef<HTMLFormElement>(null),
    errorRef = useRef<HTMLDivElement>(null),
    submitting = useRef(false);
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      claimService.getCoordinationDetails(claimId, NGO_VIEWER),
      deliveryService.getByClaimId(claimId, NGO_VIEWER),
    ])
      .then(([data, saved]) => {
        if (!cancelled) {
          setDetails(data);
          setReceipt(saved);
          setQuantity(
            String(saved?.actualQuantity ?? data.donation.quantity.value),
          );
          setError("");
        }
      })
      .catch((caught) => {
        if (!cancelled) setError(toServiceError(caught).message);
      })
      .finally(() => {
        if (!cancelled) setLoaded(revision);
      });
    return () => {
      cancelled = true;
    };
  }, [claimId, revision]);
  function clear(field: keyof ReceiptErrors) {
    setErrors((current) => ({ ...current, [field]: undefined }));
    setError("");
  }
  function reveal(message: string, fields: ReceiptErrors = {}) {
    setError(message);
    setErrors(fields);
    requestAnimationFrame(() => {
      const target =
        formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]') ||
        errorRef.current;
      target?.scrollIntoView({ block: "center", behavior: "smooth" });
      target?.focus({ preventScroll: true });
    });
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (submitting.current || uploading || loading || !details || receipt)
      return;
    const next: ReceiptErrors = {},
      actual = Number(quantity);
    if (!Number.isFinite(actual) || actual <= 0 || actual > 1_000_000)
      next.actualQuantity =
        "Enter a received quantity greater than zero and no more than 1,000,000.";
    else if (actual !== details.donation.quantity.value && !mismatch)
      next.quantityMismatchConfirmed =
        "Confirm the difference from the expected quantity.";
    if (condition === "DAMAGED_POOR" && notes.trim().length < 12)
      next.notes =
        "Describe the damaged food condition in at least 12 characters.";
    if (Object.keys(next).length) {
      reveal("Check the highlighted fields before saving the receipt.", next);
      return;
    }
    submitting.current = true;
    setBusy(true);
    setError("");
    setErrors({});
    try {
      setReceipt(
        await deliveryService.confirm(
          claimId,
          {
            actualQuantity: actual,
            foodCondition: condition,
            verificationMethod: "OTP",
            quantityMismatchConfirmed: mismatch,
            notes,
            photoNames: [],
            photoUrls,
          },
          NGO_VIEWER,
        ),
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (caught) {
      // A response can be lost after the receipt was committed. Read it back before
      // suggesting another save, so the user sees the completed next step.
      try {
        const saved = await deliveryService.getByClaimId(claimId, NGO_VIEWER);
        if (saved) {
          setReceipt(saved);
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
      } catch {
        /* Keep the original save error and all entered values. */
      }
      const failure = toServiceError(caught);
      reveal(failure.message, failure.fieldErrors as ReceiptErrors | undefined);
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }
  return (
    <PortalShell
      role="ngo"
      activeHref={ROUTES.ngo.claims}
      title={tx("Delivery receipt")}
      description={tx(
        "Verified handover-এর পর প্রাপ্ত খাবারের পরিমাণ ও অবস্থা সংরক্ষণ করুন।",
      )}
      profileName="NGO"
      profileDescription={tx("Receiving organization")}
      avatarInitials="NG"
      backHref={ROUTES.ngo.claim(claimId)}
      backLabel={tx("Claim details")}
    >
      <div className="grid gap-6">
        {loading && <p role="status">{tx("Loading receipt…")}</p>}
        {!loading && error && (
          <div ref={errorRef} tabIndex={-1}>
            <Alert
              tone="danger"
              title={tx(
                details
                  ? "Receipt could not be saved"
                  : "Receipt details could not load",
              )}
              description={tx(error)}
              action={
                !details ? (
                  <Button
                    variant="outline"
                    onClick={() => setRevision((value) => value + 1)}
                  >
                    {tx("Try again")}
                  </Button>
                ) : undefined
              }
            />
          </div>
        )}
        {!loading && details && (
          <>
            <DeliveryClaimSummary details={details} />
            {receipt ? (
              <Card>
                <CardHeader
                  title={tx("Receipt saved")}
                  description={receipt.id}
                />
                <CardContent className="grid gap-4">
                  <p>
                    {tx("Received:")} {receipt.actualQuantity}{" "}
                    {tx(UNIT_LABELS_BN[receipt.quantityUnit])} ·{" "}
                    {tx(conditionLabels[receipt.foodCondition])}
                  </p>
                  <p>{tx("Handover verified by OTP.")}</p>
                  <PhotoGallery
                    urls={receipt.photoUrls}
                    label={tx("Receipt photos")}
                  />
                  {receipt.distributionBlocked ? (
                    <Alert
                      tone="danger"
                      className="flex-wrap"
                      title={tx("Do not distribute this food")}
                      description={tx(
                        "The recorded food condition blocks distribution.",
                      )}
                      action={
                        <ButtonLink
                          variant="outline"
                          className="w-full whitespace-normal sm:w-auto"
                          href={ROUTES.ngo.reportIssue(claimId)}
                        >
                          {tx("Report a food safety concern")}
                        </ButtonLink>
                      }
                    />
                  ) : (
                    <ButtonLink href={ROUTES.ngo.distribution(claimId)}>
                      {tx("Record distribution")}
                    </ButtonLink>
                  )}
                  <ButtonLink
                    variant="outline"
                    href={ROUTES.ngo.claim(claimId)}
                  >
                    {tx("Return to claim")}
                  </ButtonLink>
                </CardContent>
              </Card>
            ) : details.claim.status !== ClaimStatus.DELIVERED ? (
              <Alert
                tone="warning"
                title={tx("Delivery verification required")}
                description={tx(
                  "NGO claim page থেকে delivery code তৈরি করুন। Assigned volunteer code দিয়ে delivery নিশ্চিত করলে receipt জমা দেওয়া যাবে।",
                )}
                action={
                  <ButtonLink href={ROUTES.ngo.claim(claimId)}>
                    {tx("Go to claim")}
                  </ButtonLink>
                }
              />
            ) : (
              <form ref={formRef} onSubmit={submit} noValidate aria-busy={busy}>
                <Card>
                  <CardHeader
                    title={tx("Received food")}
                    description={tx(
                      "Compare the food with the donor's declared quantity.",
                    )}
                  />
                  <CardContent className="grid gap-5">
                    <Input
                      name="actualQuantity"
                      label={tx(
                        "Received quantity ({0})",
                        tx(UNIT_LABELS_BN[details.donation.quantity.unit]),
                      )}
                      type="number"
                      min="0"
                      max="1000000"
                      step="any"
                      required
                      value={quantity}
                      disabled={busy}
                      error={tx(errors.actualQuantity)}
                      onChange={(e) => {
                        setQuantity(e.target.value);
                        setMismatch(false);
                        clear("actualQuantity");
                        setErrors((current) => ({
                          ...current,
                          quantityMismatchConfirmed: undefined,
                        }));
                      }}
                    />
                    <label className="grid gap-2 text-sm font-semibold">
                      {tx("Food condition")}
                      <select
                        className="rounded-xl border border-slate-300 p-3"
                        value={condition}
                        disabled={busy}
                        onChange={(e) => {
                          setCondition(e.target.value as DeliveryFoodCondition);
                          clear("notes");
                        }}
                      >
                        {Object.entries(conditionLabels).map(
                          ([value, label]) => (
                            <option key={value} value={value}>
                              {tx(label)}
                            </option>
                          ),
                        )}
                      </select>
                    </label>
                    {Number(quantity) !== details.donation.quantity.value && (
                      <Checkbox
                        name="quantityMismatchConfirmed"
                        checked={mismatch}
                        disabled={busy}
                        onChange={(e) => {
                          setMismatch(e.target.checked);
                          clear("quantityMismatchConfirmed");
                        }}
                        label={tx(
                          "I confirm the received quantity differs from the donor's declaration",
                        )}
                        error={tx(errors.quantityMismatchConfirmed)}
                      />
                    )}
                    <Textarea
                      name="notes"
                      label={tx(
                        condition === "DAMAGED_POOR"
                          ? "Food safety notes (required)"
                          : "Receipt notes (optional)",
                      )}
                      required={condition === "DAMAGED_POOR"}
                      hint={
                        condition === "DAMAGED_POOR"
                          ? tx(
                              "Describe the issue in at least 12 characters. This food will be blocked from distribution.",
                            )
                          : undefined
                      }
                      maxLength={2000}
                      value={notes}
                      disabled={busy}
                      error={tx(errors.notes)}
                      onChange={(e) => {
                        setNotes(e.target.value);
                        clear("notes");
                      }}
                    />
                    <PhotoUpload
                      label={tx("Received food photos (optional)")}
                      purpose="RECEIPT"
                      claimId={claimId}
                      urls={photoUrls}
                      onChange={setPhotoUrls}
                      onBusyChange={setUploading}
                      disabled={busy}
                    />
                    <Button type="submit" disabled={busy || uploading}>
                      {busy ? tx("Saving…") : tx("Save receipt")}
                    </Button>
                  </CardContent>
                </Card>
              </form>
            )}
          </>
        )}
      </div>
    </PortalShell>
  );
}
