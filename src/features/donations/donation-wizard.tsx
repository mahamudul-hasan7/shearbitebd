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
import { donationService, ngoService, MockApiError, type NGODirectoryItem } from "@/services";
import type { ViewerContext } from "@/types/domain";

const wizardSteps = [
  { label: "খাবারের বিবরণ", description: "নাম, পরিমাণ, ছবি ও রান্নার সময়" },
  { label: "পিকআপ লোকেশন", description: "ঠিকানা, যোগাযোগের ব্যক্তি ও সময়সূচি" },
  { label: "নিরাপত্তা ও অঙ্গীকার", description: "BFSA স্বাস্থ্যবিধি ও চূড়ান্ত রিভিউ" },
  { label: "অনুদানের স্বীকৃতি", description: "তাজা খাবার সফলভাবে তালিকাভুক্ত" },
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
  const [preferredNgo, setPreferredNgo] = useState<NGODirectoryItem>();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    const hydrationTimer = window.setTimeout(() => {
      try {
        const rawDraft = window.sessionStorage.getItem(DONATION_DRAFT_STORAGE_KEY);
        const preferredNgoProfileId = new URLSearchParams(window.location.search).get("ngo")?.trim() ?? "";
        let restoredDraft = createInitialDonationDraft();
        if (rawDraft) {
          const parsed: unknown = JSON.parse(rawDraft);
          restoredDraft = restoreDonationDraft(parsed);
          setSavedAt(new Date().toISOString());
        }
        if (preferredNgoProfileId) restoredDraft.preferredNgoProfileId = preferredNgoProfileId;
        setDraft(restoredDraft);
        if (preferredNgoProfileId) {
          ngoService.getById(preferredNgoProfileId, { signal: controller.signal }).then(setPreferredNgo).catch((error: unknown) => {
            if (controller.signal.aborted) return;
            setErrors({ form: error instanceof MockApiError ? error.message : "The preferred NGO context could not be loaded." });
          });
        }
      } catch {
        window.sessionStorage.removeItem(DONATION_DRAFT_STORAGE_KEY);
      }
    }, 0);
    return () => {
      controller.abort();
      window.clearTimeout(hydrationTimer);
    };
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
        preferredNgoProfileId: draft.preferredNgoProfileId || undefined,
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
    setDraft({ ...createInitialDonationDraft(), preferredNgoProfileId: preferredNgo?.profile.id ?? "" });
    setCurrentStep(1);
    setResult(undefined);
    setSavedAt(undefined);
    setErrors({});
  }

  return (
    <PortalShell
      role="donor"
      activeHref={ROUTES.donor.newDonation}
      title={currentStep === 4 ? "খাদ্য অনুদান সম্পন্ন" : "উদ্বৃত্ত খাবার পোস্ট করুন"}
      description="ক্যাফেটেরিয়া বা রেস্তোরাঁর তাজা অতিরিক্ত খাবারের বিবরণ ও পিকআপ তথ্য দিয়ে লাইভ ফিডে তালিকাভুক্ত করুন।"
      profileName="UIU Central Cafeteria"
      profileDescription="ভেরিফাইড খাদ্য দাতা"
      avatarInitials="UI"
      notificationHref={ROUTES.donor.notifications}
      unreadNotifications={1}
      backHref={ROUTES.donor.dashboard}
      backLabel="ড্যাশবোর্ডে ফিরুন"
    >
      <Stepper
        steps={wizardSteps}
        current={currentStep}
        label="খাদ্য অনুদান পোস্টের অগ্রগতি"
        onStepClick={(step) => editStep(step as DonationWizardStep)}
      />
      {preferredNgo && currentStep !== 4 && (
        <Alert
          className="mt-6"
          tone="info"
          title={`পছন্দনীয় এনজিও: ${preferredNgo.profile.organizationName}`}
          description="আপনার পছন্দের এই সংস্থাটিকে অগ্রাধিকার ভিত্তিতে অবহিত করা হবে।"
          action={
            <ButtonLink href={ROUTES.donor.ngoProfile(preferredNgo.profile.id)} size="sm" variant="outline">
              এনজিও প্রোফাইল দেখুন
            </ButtonLink>
          }
        />
      )}

      {currentStep === 4 && result ? (
        <div className="mt-10">
          <DonationConfirmation result={result} addAnother={addAnother} />
        </div>
      ) : (
        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_21rem] xl:items-start">
          <Card className="overflow-hidden">
            <div className="border-b border-line bg-emerald-50/40 p-5 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800 font-heading">
                    ধাপ {currentStep} / ৪
                  </span>
                  <h2 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl font-heading">
                    {wizardSteps[currentStep - 1]?.label}
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-slate-600 font-normal">
                    {wizardSteps[currentStep - 1]?.description}
                  </p>
                </div>
                {savedAt && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600">
                    খসড়া সংরক্ষিত রয়েছে
                  </span>
                )}
              </div>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} noValidate>
              <div className="p-5 sm:p-7">
                {errors.form && (
                  <Alert className="mb-5" tone="danger" title="অগ্রসর হওয়া সম্ভব নয়" description={errors.form} />
                )}
                {hasDonationDraftErrors(errors) && !errors.form && (
                  <Alert
                    className="mb-5"
                    tone="danger"
                    title="চিহ্নিত ঘরগুলো পরীক্ষা করুন"
                    description="পরবর্তী ধাপে যাওয়ার আগে লাল রঙের ঘরগুলোতে সঠিক তথ্য প্রদান করুন।"
                  />
                )}
                {currentStep === 1 && <FoodDetailsStep draft={draft} errors={errors} update={update} />}
                {currentStep === 2 && <PickupInformationStep draft={draft} errors={errors} update={update} />}
                {currentStep === 3 && <SafetyReviewStep draft={draft} errors={errors} update={update} editStep={editStep} />}
              </div>

              <StickyActionBar className="px-5 sm:px-7">
                <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  {/* Left Side: Back Navigation & Draft */}
                  <div className="flex items-center gap-2.5">
                    {currentStep === 1 ? (
                      <ButtonLink
                        href={ROUTES.donor.dashboard}
                        variant="outline"
                        leftIcon={<ArrowLeft className="size-4" />}
                      >
                        ড্যাশবোর্ডে ফিরুন
                      </ButtonLink>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        leftIcon={<ArrowLeft className="size-4" />}
                        onClick={goBack}
                      >
                        পূর্ববর্তী ধাপ
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      leftIcon={<Save className="size-4 text-emerald-600 animate-icon-breathe" />}
                      onClick={persistDraft}
                      className="border-slate-300 bg-slate-50/70 text-slate-700 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-800"
                    >
                      খসড়া সংরক্ষণ
                    </Button>
                  </div>

                  {/* Right Side: Forward Navigation */}
                  <div className="flex items-center gap-2">
                    {currentStep < 3 ? (
                      <Button
                        type="button"
                        variant="primary"
                        rightIcon={<ArrowRight className="size-4" />}
                        onClick={goNext}
                        className="px-6 text-sm sm:text-base shadow-lg shadow-emerald-700/25 ring-2 ring-emerald-500/30"
                      >
                        পরবর্তী ধাপ
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        variant="primary"
                        className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 px-6 text-sm sm:text-base shadow-xl shadow-emerald-700/30 ring-2 ring-emerald-500/30"
                        rightIcon={<Send className="size-4 animate-icon-float" />}
                        disabled={submitting}
                      >
                        {submitting ? "পোস্ট হচ্ছে..." : "অনুদানের তালিকা প্রকাশ করুন"}
                      </Button>
                    )}
                  </div>
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
