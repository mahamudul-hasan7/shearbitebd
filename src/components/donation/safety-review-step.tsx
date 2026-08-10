import { AlertTriangle, CalendarClock, CheckCircle2, MapPin, PackageCheck, ShieldCheck, Utensils } from "lucide-react";
import { RescueClock } from "@/components/donor/rescue-clock";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { DonationDraft, DonationDraftErrors, DonationDraftField, DonationWizardStep } from "@/features/donations/types";
import { FOOD_CATEGORY_LABELS, STORAGE_CONDITION_LABELS } from "@/lib/constants/domain";
import { calculateUrgencyScore, getUrgencyLabel } from "@/lib/selectors/donation-selectors";

const checklist: Array<{ field: DonationDraftField; label: string; description: string }> = [
  { field: "freshlyPrepared", label: "Preparation declaration", description: "The preparation time and food condition entered above are truthful." },
  { field: "properlyCovered", label: "Food is properly covered", description: "Food is sealed, covered, or packaged for a safe handover process." },
  { field: "noVisibleSpoilage", label: "No visible spoilage", description: "There are no visible signs of spoilage, contamination, or damaged packaging." },
  { field: "storedSafely", label: "Stored as declared", description: "The selected storage condition has been maintained to the best of your knowledge." },
  { field: "allergensCompleted", label: "Allergen information completed", description: "Known allergens are listed, or ‘None known’ has been entered." },
  { field: "realisticDeadline", label: "Realistic pickup deadline", description: "The safe pickup deadline and pickup window are practical and consistent." },
  { field: "accuracyConfirmed", label: "Donor accuracy declaration", description: "I confirm that the information is accurate and can be used for traceability." },
];

function readableDate(value: string) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Intl.DateTimeFormat("en-BD", { dateStyle: "medium", timeStyle: "short" }).format(timestamp) : "Not set";
}

export function SafetyReviewStep({
  draft,
  errors,
  update,
  editStep,
}: {
  draft: DonationDraft;
  errors: DonationDraftErrors;
  update: (field: DonationDraftField, value: string | boolean | string[]) => void;
  editStep: (step: DonationWizardStep) => void;
}) {
  const urgencyScore = calculateUrgencyScore({ safePickupDeadline: draft.safePickupDeadline, priority: draft.priority });

  return (
    <div className="grid gap-6">
      <Alert tone="warning" title="Declaration, not certification" description="ShareBite BD uses traceability, a checklist, and moderation. This frontend does not medically guarantee freshness or food safety." />

      <div>
        <h3 className="text-lg font-black text-ink-900">Food safety checklist</h3>
        <p className="mt-1 text-sm text-muted-600">Every declaration is required before the mock listing can be published.</p>
        <div className="mt-4 grid gap-3">
          {checklist.map((item) => (
            <Checkbox
              key={item.field}
              name={item.field}
              checked={Boolean(draft[item.field])}
              onChange={(event) => update(item.field, event.target.checked)}
              error={errors[item.field]}
              label={item.label}
              description={item.description}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-line bg-white p-5">
          <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-brand-600">Food details</p><h3 className="mt-2 text-xl font-black text-ink-900">{draft.title || "Untitled donation"}</h3></div><Button type="button" size="sm" variant="ghost" onClick={() => editStep(1)}>Edit</Button></div>
          <div className="mt-4 grid gap-3 text-sm text-muted-600">
            <p className="flex items-center gap-2"><Utensils className="size-4 text-brand-600" />{draft.quantity || "0"} {draft.quantityUnit.toLowerCase()} · {FOOD_CATEGORY_LABELS[draft.category]}</p>
            <p className="flex items-center gap-2"><PackageCheck className="size-4 text-brand-600" />{STORAGE_CONDITION_LABELS[draft.storageCondition]} · {draft.foodCondition.toLowerCase().replaceAll("_", " ")}</p>
            <p className="flex items-start gap-2"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-600" /><span>Allergens: {draft.allergenInfo || "Not provided"}</span></p>
          </div>
        </div>

        <div className="rounded-3xl border border-line bg-white p-5">
          <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-brand-600">Pickup information</p><h3 className="mt-2 text-xl font-black text-ink-900">{draft.approximateArea}</h3></div><Button type="button" size="sm" variant="ghost" onClick={() => editStep(2)}>Edit</Button></div>
          <div className="mt-4 grid gap-3 text-sm text-muted-600">
            <p className="flex items-start gap-2"><MapPin className="mt-0.5 size-4 shrink-0 text-brand-600" /><span>{draft.pickupAddress}</span></p>
            <p className="flex items-center gap-2"><CalendarClock className="size-4 text-brand-600" />{readableDate(draft.pickupWindowStart)} – {readableDate(draft.pickupWindowEnd)}</p>
            <p className="flex items-center gap-2"><CheckCircle2 className="size-4 text-brand-600" />Contact: {draft.contactPerson}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 rounded-3xl border border-danger/15 bg-danger-soft p-5 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2"><p className="font-black text-danger-strong">Estimated rescue urgency</p><Badge tone={urgencyScore >= 65 ? "danger" : urgencyScore >= 45 ? "warning" : "brand"}>{urgencyScore}/100 · {getUrgencyLabel(urgencyScore)}</Badge></div>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-600">Calculated from the safe pickup deadline and selected priority. This is a workflow estimate, not a medical freshness score.</p>
        </div>
        <RescueClock deadline={draft.safePickupDeadline} compact />
      </div>

      {Object.values(errors).some(Boolean) && <div className="flex items-start gap-2 rounded-2xl bg-danger-soft p-4 text-sm text-danger-strong"><AlertTriangle className="mt-0.5 size-5 shrink-0" /><p>Complete every highlighted declaration before submitting.</p></div>}
    </div>
  );
}
