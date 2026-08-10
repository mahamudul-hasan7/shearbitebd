import { CalendarClock, ImageIcon, MapPin, ShieldCheck, Utensils } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { DonationDraft, DonationDraftErrors, DonationWizardStep } from "@/features/donations/types";
import { FOOD_CATEGORY_LABELS, STORAGE_CONDITION_LABELS } from "@/lib/constants/domain";

function shortDate(value: string) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Intl.DateTimeFormat("en-BD", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(timestamp) : "Not set";
}

export function DonationSummaryPanel({ draft, currentStep, errors }: { draft: DonationDraft; currentStep: DonationWizardStep; errors: DonationDraftErrors }) {
  const declarationCount = [draft.freshlyPrepared, draft.properlyCovered, draft.noVisibleSpoilage, draft.storedSafely, draft.allergensCompleted, draft.realisticDeadline, draft.accuracyConfirmed].filter(Boolean).length;
  const errorCount = Object.values(errors).filter(Boolean).length;

  return (
    <Card className="xl:sticky xl:top-24">
      <div className="border-b border-line p-5"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-brand-600">Live summary</p><h2 className="mt-2 text-xl font-black text-ink-900">Donation preview</h2></div><Badge tone={errorCount ? "danger" : "brand"}>Step {currentStep}/4</Badge></div></div>
      <div className="grid gap-4 p-5 text-sm">
        <div><p className="text-xs font-bold text-muted-400">Food</p><p className="mt-1 font-black text-ink-900">{draft.title || "Add a food title"}</p><p className="mt-1 text-muted-600">{FOOD_CATEGORY_LABELS[draft.category]} · {draft.quantity || "0"} {draft.quantityUnit.toLowerCase()}</p></div>
        <div className="grid gap-3 rounded-2xl bg-brand-50 p-4">
          <p className="flex items-center gap-2"><Utensils className="size-4 text-brand-600" />{STORAGE_CONDITION_LABELS[draft.storageCondition]}</p>
          <p className="flex items-start gap-2"><CalendarClock className="mt-0.5 size-4 shrink-0 text-brand-600" /><span>Deadline: {shortDate(draft.safePickupDeadline)}</span></p>
          <p className="flex items-start gap-2"><MapPin className="mt-0.5 size-4 shrink-0 text-brand-600" /><span>{draft.approximateArea || "Pickup area not set"}</span></p>
          <p className="flex items-center gap-2"><ImageIcon className="size-4 text-brand-600" />{draft.photoNames.length}/5 photos selected</p>
          <p className="flex items-center gap-2"><ShieldCheck className="size-4 text-brand-600" />{declarationCount}/7 declarations</p>
        </div>
        {errorCount > 0 ? <p role="status" className="rounded-2xl bg-danger-soft p-3 text-xs font-bold text-danger-strong">{errorCount} field{errorCount === 1 ? "" : "s"} need attention.</p> : <p className="rounded-2xl bg-success-soft p-3 text-xs font-bold text-success-strong">No current validation errors.</p>}
        <p className="text-xs leading-5 text-muted-600">Draft data stays in this browser demo. Exact pickup/contact details are never included in public discovery responses.</p>
      </div>
    </Card>
  );
}
