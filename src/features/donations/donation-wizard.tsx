"use client";

import { ArrowLeft, ArrowRight, Save, Send } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { DonationConfirmation } from "@/components/donation/donation-confirmation";
import { DonationSummaryPanel } from "@/components/donation/donation-summary-panel";
import { FoodDetailsStep } from "@/components/donation/food-details-step";
import { PickupInformationStep } from "@/components/donation/pickup-information-step";
import { SafetyReviewStep } from "@/components/donation/safety-review-step";
import { PortalShell } from "@/components/layout/portal-shell";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Stepper } from "@/components/ui/stepper";
import { StickyActionBar } from "@/components/layout/sticky-action-bar";
import { createInitialDonationDraft, DONATION_DRAFT_STORAGE_KEY, restoreDonationDraft } from "@/features/donations/donation-draft";
import type { DonationDraft, DonationDraftErrors, DonationDraftField, DonationWizardResult, DonationWizardStep } from "@/features/donations/types";
import { hasDonationDraftErrors, validateDonationWizardStep } from "@/features/donations/validation";
import { PriorityLevel, QuantityUnit } from "@/lib/constants/domain";
import { UserRole } from "@/lib/constants/roles";
import { DonationStatus } from "@/lib/constants/statuses";
import { calculateUrgencyScore } from "@/lib/selectors/donation-selectors";
import { ROUTES } from "@/lib/routes";
import { donationService, MockApiError } from "@/services";
import type { ViewerContext } from "@/types/domain";

const wizardSteps = [
  { label: "Food Details", description: "Food, quantity, time, photos" },
  { label: "Pickup", description: "Address, contact, window" },
  { label: "Safety & Review", description: "Declarations and final check" },
  { label: "Confirmation", description: "Donation created" },
];

const DONOR_VIEWER: ViewerContext = { userId: "user-donor-uiu", donorProfileId: "donor-uiu", role: UserRole.DONOR };

function priorityFromScore(score: number) {
  if (score >= 85) return PriorityLevel.URGENT;
  if (score >= 65) return PriorityLevel.HIGH;
  if (score >= 35) return PriorityLevel.MEDIUM;
  return PriorityLevel.LOW;
}

function estimatedMeals(draft: DonationDraft) {
  const quantity = Number(draft.quantity);
  if (draft.quantityUnit === QuantityUnit.KILOGRAMS) return Math.max(1, Math.round(quantity * 2));
  if (draft.quantityUnit === QuantityUnit.TRAYS) return Math.max(1, Math.round(quantity * 10));
  if (draft.quantityUnit === QuantityUnit.LITRES) return Math.max(1, Math.round(quantity * 4));
  return Math.max(1, Math.round(quantity));
}

function allergensFromDraft(value: string) {
  if (/^none(?: known)?[.!]?$/i.test(value.trim())) return [];
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

export function DonationWizard() {
  const [currentStep, setCurrentStep] = useState<DonationWizardStep>(1);
  const [draft, setDraft] = useState<DonationDraft>(() => createInitialDonationDraft());
  const [errors, setErrors] = useState<DonationDraftErrors>({});
  const [savedAt, setSavedAt] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<DonationWizardResult>();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      try {
        const rawDraft = window.sessionStorage.getItem(DONATION_DRAFT_STORAGE_KEY);
        if (rawDraft) {
          const parsed: unknown = JSON.parse(rawDraft);
          setDraft(restoreDonationDraft(parsed));
          setSavedAt(new Date().toISOString());
        }
      } catch {
        window.sessionStorage.removeItem(DONATION_DRAFT_STORAGE_KEY);
      }
    }, 0);
    return () => window.clearTimeout(hydrationTimer);
  }, []);

  function update(field: DonationDraftField, value: string | boolean | string[]) {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
    setSavedAt(undefined);
  }

  function revealErrors(nextErrors: DonationDraftErrors) {
    setErrors(nextErrors);
    window.requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
  }

  function validateStep(step = currentStep) {
    const nextErrors = validateDonationWizardStep(step, draft);
    if (hasDonationDraftErrors(nextErrors)) {
      revealErrors(nextErrors);
      return false;
    }
    setErrors({});
    return true;
  }

  function persistDraft() {
    try {
      window.sessionStorage.setItem(DONATION_DRAFT_STORAGE_KEY, JSON.stringify(draft));
      setSavedAt(new Date().toISOString());
      setErrors((current) => ({ ...current, form: undefined }));
    } catch {
      setErrors((current) => ({ ...current, form: "This browser could not save the mock draft." }));
    }
  }

  function goNext() {
    if (!validateStep()) return;
    persistDraft();
    setCurrentStep((step) => Math.min(3, step + 1) as DonationWizardStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    setErrors({});
    setCurrentStep((step) => Math.max(1, step - 1) as DonationWizardStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function editStep(step: DonationWizardStep) {
    setErrors({});
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateStep(3)) return;
    setSubmitting(true);
    const submittedAt = new Date().toISOString();

    try {
      const urgency = calculateUrgencyScore({ safePickupDeadline: draft.safePickupDeadline, priority: draft.priority });
      const donation = await donationService.create({
        donorProfileId: "donor-uiu",
        title: draft.title.trim(),
        description: draft.description.trim(),
        category: draft.category,
        dietaryTypes: [draft.dietaryType],
        quantity: { value: Number(draft.quantity), unit: draft.quantityUnit, estimatedMeals: estimatedMeals(draft) },
        preparationTime: new Date(draft.preparationTime).toISOString(),
        safePickupDeadline: new Date(draft.safePickupDeadline).toISOString(),
        storageCondition: draft.storageCondition,
        foodCondition: draft.foodCondition,
        allergens: allergensFromDraft(draft.allergenInfo),
        photoUrls: draft.photoNames.length > 0 ? ["/images/donor-active-meal.png"] : [],
        specialInstructions: draft.specialInstructions.trim() || undefined,
        pickup: {
          addressId: draft.addressId,
          approximateArea: draft.approximateArea.trim(),
          contact: { name: draft.contactPerson.trim(), phone: draft.phone.trim(), email: draft.email.trim() || undefined },
          windowStart: new Date(draft.pickupWindowStart).toISOString(),
          windowEnd: new Date(draft.pickupWindowEnd).toISOString(),
          directions: draft.directions.trim() || undefined,
        },
        safetyDeclaration: {
          freshlyPrepared: draft.freshlyPrepared,
          properlyCovered: draft.properlyCovered,
          noVisibleSpoilage: draft.noVisibleSpoilage,
          storedAccordingToDeclaration: draft.storedSafely,
          allergensDisclosed: draft.allergensCompleted,
          pickupDeadlineConfirmed: draft.realisticDeadline,
          donorAccuracyConfirmed: draft.accuracyConfirmed,
          declaredByUserId: "user-donor-uiu",
          declaredAt: submittedAt,
        },
        priority: priorityFromScore(urgency),
        status: DonationStatus.PUBLISHED,
        publishedAt: submittedAt,
      }, DONOR_VIEWER);

      window.sessionStorage.removeItem(DONATION_DRAFT_STORAGE_KEY);
      setResult({ donation, submittedAt });
      setCurrentStep(4);
      setErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error: unknown) {
      if (error instanceof MockApiError) {
        setErrors({ ...error.fieldErrors, form: error.message });
      } else {
        setErrors({ form: "The mock donation could not be created. Try again." });
      }
    } finally {
      setSubmitting(false);
    }
  }

  function addAnother() {
    setDraft(createInitialDonationDraft());
    setCurrentStep(1);
    setResult(undefined);
    setSavedAt(undefined);
    setErrors({});
  }

  return (
    <PortalShell
      role="donor"
      activeHref={ROUTES.donor.newDonation}
      title={currentStep === 4 ? "Donation submitted" : "Add Surplus Food"}
      description="Create a clear, time-sensitive listing with traceable food and pickup details."
      profileName="UIU Cafeteria"
      profileDescription="Mock verified food donor"
      avatarInitials="UC"
      notificationHref={ROUTES.donor.notifications}
      unreadNotifications={1}
    >
      <Stepper steps={wizardSteps} current={currentStep} label="Add surplus food progress" />

      {currentStep === 4 && result ? (
        <div className="mt-10"><DonationConfirmation result={result} addAnother={addAnother} /></div>
      ) : (
        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_21rem] xl:items-start">
          <Card className="overflow-hidden">
            <div className="border-b border-line bg-brand-50/60 p-5 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3"><div><Badge tone="brand">Step {currentStep} of 4</Badge><h2 className="mt-3 text-2xl font-black text-brand-900 sm:text-3xl">{wizardSteps[currentStep - 1]?.label}</h2><p className="mt-2 text-sm text-muted-600">{wizardSteps[currentStep - 1]?.description}</p></div>{savedAt && <Badge tone="success">Draft saved in this browser</Badge>}</div>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} noValidate>
              <div className="p-5 sm:p-7">
                {errors.form && <Alert className="mb-5" tone="danger" title="Donation could not continue" description={errors.form} />}
                {hasDonationDraftErrors(errors) && !errors.form && <Alert className="mb-5" tone="danger" title="Check the highlighted fields" description="Correct the details below before moving to the next step." />}
                {currentStep === 1 && <FoodDetailsStep draft={draft} errors={errors} update={update} />}
                {currentStep === 2 && <PickupInformationStep draft={draft} errors={errors} update={update} />}
                {currentStep === 3 && <SafetyReviewStep draft={draft} errors={errors} update={update} editStep={editStep} />}
              </div>

              <StickyActionBar className="px-5 sm:px-7">
                <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:items-center">
                  <Button type="button" variant="ghost" leftIcon={<Save className="size-4" />} onClick={persistDraft} className="sm:mr-auto">Save draft</Button>
                  {currentStep === 1 ? <ButtonLink href={ROUTES.donor.dashboard} variant="outline" leftIcon={<ArrowLeft className="size-4" />}>Dashboard</ButtonLink> : <Button type="button" variant="outline" leftIcon={<ArrowLeft className="size-4" />} onClick={goBack}>Back</Button>}
                  {currentStep < 3 ? <Button type="button" rightIcon={<ArrowRight className="size-4" />} onClick={goNext}>Continue</Button> : <Button type="submit" rightIcon={<Send className="size-4" />} disabled={submitting}>{submitting ? "Submitting..." : "Submit donation"}</Button>}
                </div>
              </StickyActionBar>
            </form>
          </Card>

          <DonationSummaryPanel draft={draft} currentStep={currentStep} errors={errors} />
        </div>
      )}
    </PortalShell>
  );
}
