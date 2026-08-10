"use client";

import { AlertTriangle, Ban, Pencil, Send, X } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { IncidentType, PriorityLevel, PRIORITY_META } from "@/lib/constants/domain";
import { validateDonationTimes } from "@/lib/validators/date-time";
import { toServiceError, type CreateDonationIncidentInput, type UpdateDonationInput } from "@/services";
import type { DonationView } from "@/types/domain";

type ActionKind = "edit" | "cancel" | "issue";

const incidentLabels: Record<IncidentType, string> = {
  [IncidentType.DAMAGED_FOOD]: "Damaged food or packaging",
  [IncidentType.WRONG_QUANTITY]: "Wrong quantity",
  [IncidentType.LATE_DELIVERY]: "Late or missed pickup",
  [IncidentType.WRONG_ITEM]: "Wrong item information",
  [IncidentType.SAFETY_CONCERN]: "Food safety concern",
  [IncidentType.OTHER]: "Other",
};

function localDateTime(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function DonationActions({
  donation,
  canEdit,
  canCancel,
  canReport,
  onEdit,
  onCancel,
  onReport,
}: {
  donation: DonationView;
  canEdit: boolean;
  canCancel: boolean;
  canReport: boolean;
  onEdit: (input: UpdateDonationInput) => Promise<void>;
  onCancel: (reason: string) => Promise<void>;
  onReport: (input: CreateDonationIncidentInput) => Promise<void>;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [action, setAction] = useState<ActionKind>("edit");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [title, setTitle] = useState(donation.title);
  const [description, setDescription] = useState(donation.description);
  const [quantity, setQuantity] = useState(String(donation.quantity.value));
  const [estimatedMeals, setEstimatedMeals] = useState(String(donation.quantity.estimatedMeals));
  const [deadline, setDeadline] = useState(localDateTime(donation.safePickupDeadline));
  const [pickupStart, setPickupStart] = useState(localDateTime(donation.pickup.windowStart));
  const [pickupEnd, setPickupEnd] = useState(localDateTime(donation.pickup.windowEnd));
  const [instructions, setInstructions] = useState(donation.specialInstructions ?? "");
  const [cancelReason, setCancelReason] = useState("");
  const [cancelDetails, setCancelDetails] = useState("");
  const [incidentType, setIncidentType] = useState<IncidentType>(IncidentType.LATE_DELIVERY);
  const [severity, setSeverity] = useState<PriorityLevel>(PriorityLevel.MEDIUM);
  const [issueDescription, setIssueDescription] = useState("");
  const [contactMethod, setContactMethod] = useState<CreateDonationIncidentInput["preferredContactMethod"]>("IN_APP");

  function open(nextAction: ActionKind) {
    setAction(nextAction);
    setError(undefined);
    setFieldErrors({});
    window.requestAnimationFrame(() => dialogRef.current?.showModal());
  }

  function close() {
    if (!busy) dialogRef.current?.close();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setFieldErrors({});

    try {
      setBusy(true);
      if (action === "edit") {
        const quantityValue = Number(quantity);
        const mealsValue = Number(estimatedMeals);
        const nextErrors: Record<string, string> = {};
        if (!title.trim()) nextErrors.title = "Enter a food title.";
        if (!description.trim()) nextErrors.description = "Enter a food description.";
        if (!Number.isFinite(quantityValue) || quantityValue <= 0) nextErrors.quantity = "Enter a positive quantity.";
        if (!Number.isFinite(mealsValue) || mealsValue <= 0) nextErrors.estimatedMeals = "Enter a positive meal estimate.";
        Object.assign(nextErrors, validateDonationTimes({
          preparationTime: donation.preparationTime,
          safePickupDeadline: deadline,
          pickupWindowStart: pickupStart,
          pickupWindowEnd: pickupEnd,
          requireFutureDeadline: true,
        }));
        if (Object.keys(nextErrors).length > 0) {
          setFieldErrors(nextErrors);
          return;
        }
        await onEdit({
          title,
          description,
          quantity: { value: quantityValue, unit: donation.quantity.unit, estimatedMeals: mealsValue },
          safePickupDeadline: new Date(deadline).toISOString(),
          pickupWindowStart: new Date(pickupStart).toISOString(),
          pickupWindowEnd: new Date(pickupEnd).toISOString(),
          specialInstructions: instructions,
        });
      } else if (action === "cancel") {
        if (!cancelReason) {
          setFieldErrors({ cancellationReason: "Select a cancellation reason." });
          return;
        }
        await onCancel(`${cancelReason}${cancelDetails.trim() ? `: ${cancelDetails.trim()}` : ""}`);
      } else {
        if (issueDescription.trim().length < 12) {
          setFieldErrors({ description: "Enter at least 12 characters." });
          return;
        }
        await onReport({ type: incidentType, severity, description: issueDescription, preferredContactMethod: contactMethod });
      }
      dialogRef.current?.close();
    } catch (caught: unknown) {
      const serviceError = toServiceError(caught);
      setError(serviceError.message);
      setFieldErrors(serviceError.fieldErrors ?? {});
    } finally {
      setBusy(false);
    }
  }

  const titleText = action === "edit" ? "Edit donation" : action === "cancel" ? "Cancel donation" : "Report a rescue issue";
  const descriptionText = action === "edit" ? "Changes are allowed only before pickup begins." : action === "cancel" ? "Cancelling closes the listing and releases an active pre-pickup claim." : "Submitting creates a mock incident and pauses normal rescue progression.";

  return (
    <>
      <div id="actions" className="grid gap-3">
        <Button type="button" variant="outline" leftIcon={<Pencil className="size-4" />} disabled={!canEdit} onClick={() => open("edit")}>Edit donation</Button>
        <Button type="button" variant="outline" leftIcon={<AlertTriangle className="size-4" />} disabled={!canReport} onClick={() => open("issue")}>Report issue</Button>
        <Button type="button" variant="danger" leftIcon={<Ban className="size-4" />} disabled={!canCancel} onClick={() => open("cancel")}>Cancel donation</Button>
      </div>

      <dialog ref={dialogRef} aria-labelledby="donation-action-title" aria-describedby="donation-action-description" onClick={(event) => { if (event.target === event.currentTarget) close(); }} onClose={() => { setError(undefined); setFieldErrors({}); }} className="m-auto w-[calc(100%-2rem)] max-w-2xl rounded-panel border border-line bg-white p-0 shadow-dialog">
        <div className="flex items-start justify-between gap-4 border-b border-line p-5 sm:p-6"><div><h2 id="donation-action-title" className="text-xl font-black text-ink-900">{titleText}</h2><p id="donation-action-description" className="mt-1 text-sm leading-6 text-muted-600">{descriptionText}</p></div><IconButton autoFocus label="Close dialog" onClick={close}><X className="size-5" /></IconButton></div>
        <form onSubmit={submit} noValidate>
          <div className="grid gap-5 p-5 sm:p-6">
            {error && <Alert tone="danger" title="Action could not be completed" description={error} />}
            {action === "edit" && <>
              <Input label="Food title" value={title} onChange={(event) => setTitle(event.target.value)} error={fieldErrors.title} required />
              <Textarea label="Description" value={description} onChange={(event) => setDescription(event.target.value)} error={fieldErrors.description} required />
              <div className="grid gap-5 sm:grid-cols-2"><Input label={`Quantity (${donation.quantity.unit.toLowerCase()})`} type="number" min="0.1" step="0.1" value={quantity} onChange={(event) => setQuantity(event.target.value)} error={fieldErrors.quantity} required /><Input label="Estimated meals" type="number" min="1" step="1" value={estimatedMeals} onChange={(event) => setEstimatedMeals(event.target.value)} error={fieldErrors.estimatedMeals} required /></div>
              <Input label="Safe pickup deadline" type="datetime-local" value={deadline} onChange={(event) => setDeadline(event.target.value)} error={fieldErrors.safePickupDeadline} required />
              <div className="grid gap-5 sm:grid-cols-2"><Input label="Pickup window starts" type="datetime-local" value={pickupStart} onChange={(event) => setPickupStart(event.target.value)} error={fieldErrors.pickupWindowStart} required /><Input label="Pickup window ends" type="datetime-local" value={pickupEnd} onChange={(event) => setPickupEnd(event.target.value)} error={fieldErrors.pickupWindowEnd} required /></div>
              <Textarea label="Special instructions (optional)" value={instructions} onChange={(event) => setInstructions(event.target.value)} />
            </>}
            {action === "cancel" && <><Alert tone="warning" title="Cancellation requires a reason" description="This mock action is recorded on the donation and cannot be reversed after confirmation." /><Select label="Cancellation reason" value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} error={fieldErrors.cancellationReason} required><option value="">Select a reason</option><option value="Food is no longer available">Food is no longer available</option><option value="Pickup window can no longer be met">Pickup window can no longer be met</option><option value="Listing information was incorrect">Listing information was incorrect</option><option value="Operational emergency at pickup location">Operational emergency at pickup location</option><option value="Other cancellation reason">Other</option></Select><Textarea label="Additional details (optional)" value={cancelDetails} onChange={(event) => setCancelDetails(event.target.value)} /></>}
            {action === "issue" && <><div className="grid gap-5 sm:grid-cols-2"><Select label="Issue type" value={incidentType} onChange={(event) => setIncidentType(event.target.value as IncidentType)}>{Object.values(IncidentType).map((item) => <option key={item} value={item}>{incidentLabels[item]}</option>)}</Select><Select label="Severity" value={severity} onChange={(event) => setSeverity(event.target.value as PriorityLevel)}>{Object.values(PriorityLevel).map((item) => <option key={item} value={item}>{PRIORITY_META[item].label}</option>)}</Select></div><Textarea label="Describe the issue" value={issueDescription} onChange={(event) => setIssueDescription(event.target.value)} error={fieldErrors.description} placeholder="Explain what happened and what help is needed." required /><Select label="Preferred contact method" value={contactMethod} onChange={(event) => setContactMethod(event.target.value as CreateDonationIncidentInput["preferredContactMethod"])}><option value="IN_APP">In-app update</option><option value="PHONE">Phone</option><option value="EMAIL">Email</option></Select></>}
          </div>
          <div className="flex flex-col-reverse gap-3 border-t border-line p-5 sm:flex-row sm:justify-end sm:p-6"><Button type="button" variant="ghost" disabled={busy} onClick={close}>Keep donation</Button><Button type="submit" variant={action === "cancel" ? "danger" : "primary"} rightIcon={<Send className="size-4" />} disabled={busy}>{busy ? "Saving..." : action === "edit" ? "Save changes" : action === "cancel" ? "Confirm cancellation" : "Submit report"}</Button></div>
        </form>
      </dialog>
    </>
  );
}
