"use client";

import { ArrowLeft, ArrowRight, ClipboardList, RotateCcw, Save, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { RequestFoodDetailsStep, RequestInfoStep, RequestLocationStep, RequestQuantityTimeStep, RequestReviewStep } from "@/components/request/request-form-steps";
import { PortalShell } from "@/components/layout/portal-shell";
import { StickyActionBar } from "@/components/layout/sticky-action-bar";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Stepper } from "@/components/ui/stepper";
import { createInitialFoodRequestDraft, FOOD_REQUEST_DRAFT_STORAGE_KEY, restoreFoodRequestDraft } from "@/features/requests/request-draft";
import type { FoodRequestDraft, FoodRequestDraftErrors, FoodRequestDraftField, RequestWizardStep } from "@/features/requests/types";
import { hasFoodRequestErrors, validateCompleteFoodRequest, validateFoodRequestStep } from "@/features/requests/validation";
import { NGO_PROFILE_ID, NGO_VIEWER } from "@/features/ngo-dashboard/use-ngo-dashboard";
import { RequestStatus } from "@/lib/constants/statuses";
import { ROUTES } from "@/lib/routes";
import { MockApiError, requestService } from "@/services";

const steps = [
  { label: "Request Info", description: "Purpose and priority" },
  { label: "Food Details", description: "Preferences and restrictions" },
  { label: "Quantity & Time", description: "People, meals and schedule" },
  { label: "Location", description: "Authorized delivery details" },
  { label: "Review", description: "Check and submit" },
];

function listFromText(value: string) {
  if (!value.trim() || /^none(?: known)?[.!]?$/i.test(value.trim())) return [];
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

export function FoodRequestWizard() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [currentStep, setCurrentStep] = useState<RequestWizardStep>(1);
  const [draft, setDraft] = useState<FoodRequestDraft>(() => createInitialFoodRequestDraft());
  const [errors, setErrors] = useState<FoodRequestDraftErrors>({});
  const [hydrated, setHydrated] = useState(false);
  const [savedAt, setSavedAt] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = window.sessionStorage.getItem(FOOD_REQUEST_DRAFT_STORAGE_KEY);
        if (stored) {
          const parsed: unknown = JSON.parse(stored);
          setDraft(restoreFoodRequestDraft(parsed));
          setSavedAt(new Date().toISOString());
        }
      } catch {
        window.sessionStorage.removeItem(FOOD_REQUEST_DRAFT_STORAGE_KEY);
      } finally {
        setHydrated(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const timer = window.setTimeout(() => {
      try {
        window.sessionStorage.setItem(FOOD_REQUEST_DRAFT_STORAGE_KEY, JSON.stringify(draft));
        setSavedAt(new Date().toISOString());
      } catch {
        setErrors((current) => ({ ...current, form: "This browser could not autosave the mock draft." }));
      }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [draft, hydrated]);

  function update<K extends FoodRequestDraftField>(field: K, value: FoodRequestDraft[K]) {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  }

  function revealErrors(nextErrors: FoodRequestDraftErrors) {
    setErrors(nextErrors);
    window.requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
  }

  function goNext() {
    const nextErrors = validateFoodRequestStep(currentStep, draft);
    if (hasFoodRequestErrors(nextErrors)) {
      revealErrors(nextErrors);
      return;
    }
    setErrors({});
    setCurrentStep((step) => Math.min(5, step + 1) as RequestWizardStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    setErrors({});
    setCurrentStep((step) => Math.max(1, step - 1) as RequestWizardStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function editStep(step: RequestWizardStep) {
    setErrors({});
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function saveDraft() {
    try {
      window.sessionStorage.setItem(FOOD_REQUEST_DRAFT_STORAGE_KEY, JSON.stringify(draft));
      setSavedAt(new Date().toISOString());
    } catch {
      setErrors((current) => ({ ...current, form: "This browser could not save the mock draft." }));
    }
  }

  function resetDraft() {
    if (!window.confirm("Clear this food request draft and start again?")) return;
    window.sessionStorage.removeItem(FOOD_REQUEST_DRAFT_STORAGE_KEY);
    setDraft(createInitialFoodRequestDraft());
    setCurrentStep(1);
    setErrors({});
    setSavedAt(undefined);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateCompleteFoodRequest(draft);
    if (hasFoodRequestErrors(nextErrors)) {
      revealErrors({ ...nextErrors, form: "Review the highlighted fields before submitting." });
      const firstInvalidStep = ([1, 2, 3, 4] as RequestWizardStep[]).find((step) => hasFoodRequestErrors(validateFoodRequestStep(step, draft)));
      if (firstInvalidStep) setCurrentStep(firstInvalidStep);
      return;
    }

    setSubmitting(true);
    try {
      const request = await requestService.create({
        ngoProfileId: NGO_PROFILE_ID,
        title: draft.title.trim(),
        requestType: draft.requestType,
        priority: draft.priority,
        priorityReason: draft.priorityReason.trim() || undefined,
        supportingDocumentNames: [...draft.supportingDocumentNames],
        purpose: draft.purpose.trim(),
        recipientType: draft.recipientType.trim(),
        categories: [...draft.categories],
        dietaryTypes: [...draft.dietaryTypes],
        specificPreferences: draft.specificPreferences.trim() || undefined,
        allergensOrRestrictions: listFromText(draft.allergensOrRestrictions),
        peopleToServe: Number(draft.peopleToServe),
        mealsNeeded: Number(draft.mealsNeeded),
        neededWhen: draft.neededWhen,
        neededBy: new Date(draft.neededBy).toISOString(),
        preferredTimeSlot: draft.preferredTimeSlot.trim() || undefined,
        deliveryAddressId: "address-hope",
        locationType: draft.locationType,
        deliveryLocation: {
          addressLine: draft.addressLine.trim(),
          area: draft.area.trim(),
          city: draft.city.trim(),
          landmark: draft.landmark.trim() || undefined,
          instructions: draft.locationInstructions.trim() || undefined,
        },
        notes: draft.notes.trim() || undefined,
        status: RequestStatus.PENDING_REVIEW,
      }, NGO_VIEWER);
      window.sessionStorage.removeItem(FOOD_REQUEST_DRAFT_STORAGE_KEY);
      router.push(`${ROUTES.ngo.requestSubmitted}?id=${encodeURIComponent(request.id)}`);
    } catch (error: unknown) {
      if (error instanceof MockApiError) setErrors({ ...error.fieldErrors, form: error.message });
      else setErrors({ form: "The mock request could not be submitted. Try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PortalShell role="ngo" activeHref={ROUTES.ngo.newRequest} title="Create food request" description="Publish a verified community need without mixing it with the donation-claim workflow." profileName="Hope Foundation" profileDescription="Verified NGO" avatarInitials="HF" notificationHref={ROUTES.ngo.dashboard + "#recent-activity"} actions={<ButtonLink href={ROUTES.ngo.requests} variant="outline" leftIcon={<ClipboardList className="size-4" />}>My requests</ButtonLink>}>
      <div className="grid gap-6">
        <Stepper steps={steps} current={currentStep} label="Food request progress" />
        {errors.form && <Alert tone="danger" title="Request needs attention" description={errors.form} />}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <form ref={formRef} onSubmit={submit} noValidate>
            <Card>
              <CardHeader title={steps[currentStep - 1].label} description={steps[currentStep - 1].description} />
              <CardContent>
                {currentStep === 1 && <RequestInfoStep draft={draft} errors={errors} update={update} />}
                {currentStep === 2 && <RequestFoodDetailsStep draft={draft} errors={errors} update={update} />}
                {currentStep === 3 && <RequestQuantityTimeStep draft={draft} errors={errors} update={update} />}
                {currentStep === 4 && <RequestLocationStep draft={draft} errors={errors} update={update} />}
                {currentStep === 5 && <RequestReviewStep draft={draft} editStep={editStep} />}
              </CardContent>
              <StickyActionBar className="px-5 sm:px-6">
                <Button type="button" variant="ghost" leftIcon={<Save className="size-4" />} onClick={saveDraft} className="sm:mr-auto">Save draft</Button>
                {currentStep === 1 ? <ButtonLink href={ROUTES.ngo.dashboard} variant="outline" leftIcon={<ArrowLeft className="size-4" />}>Dashboard</ButtonLink> : <Button type="button" variant="outline" leftIcon={<ArrowLeft className="size-4" />} onClick={goBack}>Back</Button>}
                {currentStep < 5 ? <Button type="button" rightIcon={<ArrowRight className="size-4" />} onClick={goNext}>Continue</Button> : <Button type="submit" rightIcon={<Send className="size-4" />} disabled={submitting}>{submitting ? "Submitting…" : "Submit request"}</Button>}
              </StickyActionBar>
            </Card>
          </form>
          <aside className="xl:sticky xl:top-6 xl:self-start">
            <Card><CardHeader title="Request snapshot" description={savedAt ? `Draft saved ${new Date(savedAt).toLocaleTimeString("en-BD", { hour: "numeric", minute: "2-digit" })}` : "Draft autosaves in this browser tab"} /><CardContent className="grid gap-4 text-sm"><div><p className="text-xs font-bold uppercase tracking-wide text-muted-500">Need</p><p className="mt-1 font-black text-ink-900">{draft.title || "Untitled request"}</p></div><div className="grid grid-cols-2 gap-3"><div className="rounded-2xl bg-brand-50 p-3"><p className="text-xs text-muted-600">Meals</p><p className="mt-1 text-xl font-black text-brand-900">{draft.mealsNeeded || "—"}</p></div><div className="rounded-2xl bg-accent-50 p-3"><p className="text-xs text-muted-600">People</p><p className="mt-1 text-xl font-black text-accent-700">{draft.peopleToServe || "—"}</p></div></div><p className="leading-6 text-muted-600">A request asks the network to find a match. It does not reserve an existing donation or create a claim.</p><Button type="button" size="sm" variant="ghost" leftIcon={<RotateCcw className="size-4" />} onClick={resetDraft}>Clear saved draft</Button></CardContent></Card>
          </aside>
        </div>
      </div>
    </PortalShell>
  );
}
