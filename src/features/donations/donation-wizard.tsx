"use client";
import { UiText } from "@/lib/i18n/ui-text-node";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { isNoKnownAllergens } from "@/lib/i18n/food-input";

import { ArrowLeft, ArrowRight, ChevronDown, Save, Send } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { DonationConfirmation } from "@/components/donation/donation-confirmation";
import { DonationSummaryPanel } from "@/components/donation/donation-summary-panel";
import { FoodDetailsStep } from "@/components/donation/food-details-step";
import { PickupInformationStep } from "@/components/donation/pickup-information-step";
import { SafetyReviewStep } from "@/components/donation/safety-review-step";
import { PortalShell } from "@/components/layout/portal-shell";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { Stepper } from "@/components/ui/stepper";
import styles from "@/components/donation/donation-form.module.css";
import { createCampusLunchDraft, createInitialDonationDraft, DONATION_DRAFT_STORAGE_KEY, restoreDonationDraft } from "@/features/donations/donation-draft";
import type { DonationDraft, DonationDraftErrors, DonationDraftField, DonationWizardResult, DonationWizardStep } from "@/features/donations/types";
import { donationErrorStep, hasDonationDraftErrors, validateDonationDraft, validateDonationWizardStep } from "@/features/donations/validation";
import { PriorityLevel, QuantityUnit } from "@/lib/constants/domain";
import { UserRole } from "@/lib/constants/roles";
import { DonationStatus } from "@/lib/constants/statuses";
import { calculateUrgencyScore } from "@/lib/selectors/donation-selectors";
import { ROUTES } from "@/lib/routes";
import { donationService } from "@/services/donation.service";
import { ngoService, type NGODirectoryItem } from "@/services/ngo.service";
import { profileService } from "@/services/profile.service";
import { MockApiError } from "@/services/shared";
import { useMockAuth } from "@/features/auth/mock-auth";
import { triggerCelebration } from "@/components/ui/action-success-modal";
import type { Address, ViewerContext } from "@/types/domain";

const wizardSteps = [
  { label: "Food details", description: "Food, quantity and allergens" },
  { label: "Time and storage", description: "Preparation time, deadline and storage" },
  { label: "Photos (optional)", description: "Upload a photo, choose a sample or continue without one" },
  { label: "Pickup details", description: "Address, contact and collection window" },
  { label: "Review and publish", description: "Check the details and confirm your declarations" },
  { label: "Post published", description: "Your food post has been saved" },
];


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
  if (isNoKnownAllergens(value)) return [];
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

export function DonationWizard({ campusDemo = false }: { campusDemo?: boolean }) {
  const tx = useUiText();
  const { session } = useMockAuth();
  const userId = session?.id;
  const draftStorageKey = `${DONATION_DRAFT_STORAGE_KEY}.${userId}${campusDemo ? ".campus-lunch" : ""}`;
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [profileReady, setProfileReady] = useState(false);
  const [currentStep, setCurrentStep] = useState<DonationWizardStep>(1);
  const [draft, setDraft] = useState<DonationDraft>(() => createInitialDonationDraft());
  const [errors, setErrors] = useState<DonationDraftErrors>({});
  const [savedAt, setSavedAt] = useState<string>();
  const [loadedDraftKey, setLoadedDraftKey] = useState<string>();
  const [uploading, setUploading] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const publishLock = useRef(false);
  const [result, setResult] = useState<DonationWizardResult>();
  const [preferredNgo, setPreferredNgo] = useState<NGODirectoryItem>();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const profile = await profileService.getOwnProfile(userId || "", {}, { signal: controller.signal });
        const preferredNgoProfileId = new URLSearchParams(window.location.search).get("ngo")?.trim() ?? "";
        let restored = campusDemo ? createCampusLunchDraft() : createInitialDonationDraft();
        try {
          const raw = window.sessionStorage.getItem(draftStorageKey);
          if (raw) restored = restoreDonationDraft(JSON.parse(raw));
        } catch { try { window.sessionStorage.removeItem(draftStorageKey); } catch { /* Storage is optional. */ } }
        const address = profile.addresses.find((a) => a.id === restored.addressId) || profile.addresses.find((a) => a.isPrimary) || profile.addresses[0];
        if (!address) throw new Error("Add a pickup address to your profile first.");
        if (controller.signal.aborted) return;
        setAddresses(profile.addresses);
        setDraft({ ...restored, addressId: address.id, pickupAddress: address.addressLine, approximateArea: address.area,
          contactPerson: restored.contactPerson || profile.user.displayName, phone: restored.phone || profile.user.phone || "",
          email: profile.user.email, preferredNgoProfileId: preferredNgoProfileId || restored.preferredNgoProfileId });
        setProfileReady(true);
        setLoadedDraftKey(draftStorageKey);
        if (Date.parse(restored.safePickupDeadline) <= Date.now()) {
          setCurrentStep(2);
          setErrors({ safePickupDeadline: "Safe pickup deadline must be in the future.", form: "This saved food draft has expired. Check the food condition and enter accurate times before posting." });
        }
        if (preferredNgoProfileId) setPreferredNgo(await ngoService.getById(preferredNgoProfileId, { signal: controller.signal }));
      } catch (error) {
        if (!controller.signal.aborted) setErrors({ form: error instanceof Error ? error.message : "Pickup profile could not be loaded." });
      }
    }
    void load();
    return () => controller.abort();
  }, [campusDemo, draftStorageKey, userId]);

  useEffect(() => {
    // Persist only the loaded account's draft; a submitted form must stay cleared.
    if (loadedDraftKey !== draftStorageKey || result) return;
    try { window.sessionStorage.setItem(draftStorageKey, JSON.stringify(draft)); } catch {
      // The explicit Save draft action reports unavailable browser storage.
    }
  }, [draft, draftStorageKey, loadedDraftKey, result]);

  function update(field: DonationDraftField, value: string | boolean | string[]) {
    const address = field === "addressId" ? addresses.find((item) => item.id === value) : undefined;
    setDraft((current) => ({ ...current, [field]: value, ...(field === "photoUrls" && Array.isArray(value) && value.length ? { sampleImageId: "" } : {}), ...(address ? { pickupAddress: address.addressLine, approximateArea: address.area } : {}) }));
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
    setSavedAt(undefined);
  }

  function revealErrors(nextErrors: DonationDraftErrors) {
    setErrors(nextErrors);
    const step = donationErrorStep(nextErrors);
    if (step) setCurrentStep(step);
    window.requestAnimationFrame(() => {
      const target = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]') ?? formRef.current?.querySelector<HTMLElement>('[role="alert"]');
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
      target?.focus({ preventScroll: true });
    });
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
      window.sessionStorage.setItem(draftStorageKey, JSON.stringify(draft));
      setSavedAt(new Date().toISOString());
      setErrors((current) => ({ ...current, form: undefined }));
    } catch {
      setErrors((current) => ({ ...current, form: "This browser could not save the draft." }));
    }
  }

  function goNext() {
    if (uploading || !validateStep()) return;
    persistDraft();
    setCurrentStep((step) => Math.min(5, step + 1) as DonationWizardStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    if (uploading || submitting) return;
    setErrors({});
    setCurrentStep((step) => Math.max(1, step - 1) as DonationWizardStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function editStep(step: DonationWizardStep) {
    if (uploading || submitting) return;
    setErrors({});
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (result || publishLock.current || submitting || uploading || !profileReady) return;
    if (currentStep < 5) {
      goNext();
      return;
    }
    const nextErrors = validateDonationDraft(draft);
    if (hasDonationDraftErrors(nextErrors)) {
      revealErrors(nextErrors);
      return;
    }
    publishLock.current = true;
    setSubmitting(true);
    const submittedAt = new Date().toISOString();

    try {
      const urgency = calculateUrgencyScore({ safePickupDeadline: draft.safePickupDeadline, priority: draft.priority });
      const donorId = session?.donorProfileId;
      if (!donorId || !session?.id) throw new Error("Your donor session is unavailable. Please log in again.");
      const donorViewer: ViewerContext = {
        userId: session.id,
        donorProfileId: donorId,
        role: UserRole.DONOR,
      };

      const donation = await donationService.create({
        donorProfileId: donorId,
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
        photoUrls: draft.photoUrls,
        sampleImageId: draft.sampleImageId || undefined,
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
          declaredByUserId: session.id,
          declaredAt: submittedAt,
        },
        priority: priorityFromScore(urgency),
        status: DonationStatus.AVAILABLE,
        publishedAt: submittedAt,
      }, donorViewer);

      setResult({ donation, submittedAt });
      setCurrentStep(6);
      setErrors({});
      try { window.sessionStorage.removeItem(draftStorageKey); } catch { /* The published donation is already saved. */ }
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Trigger Celebration Animation Popup
      triggerCelebration({
        title: "উদ্বৃত্ত খাবার পোস্ট সম্পন্ন!",
        message: tx("Your donation is published. Open tracking to follow the next steps."),
        badge: "Post saved",
        type: "SUCCESS",
        actionLabel: "ধন্যবাদ, সম্পন্ন",
      });

    } catch (error: unknown) {
      if (error instanceof MockApiError) {
        revealErrors({ ...error.fieldErrors, form: error.message });
      } else {
        setErrors({ form: "The donation could not be saved. Try again." });
      }
    } finally {
      publishLock.current = false;
      setSubmitting(false);
    }
  }

  function addAnother() {
    setDraft((current) => ({ ...createInitialDonationDraft(), addressId: current.addressId, pickupAddress: current.pickupAddress, approximateArea: current.approximateArea, contactPerson: current.contactPerson, phone: current.phone, email: current.email, preferredNgoProfileId: preferredNgo?.profile.id ?? "" }));
    setCurrentStep(1);
    setResult(undefined);
    setSavedAt(undefined);
    setErrors({});
  }

  return (
    <PortalShell
      role="donor"
      compactHeader
      activeHref={ROUTES.donor.newDonation}
      title={currentStep === 6 ? tx("খাদ্য অনুদান সম্পন্ন") : tx("উদ্বৃত্ত খাবার পোস্ট করুন")}
      description={tx("ক্যাফেটেরিয়া বা রেস্তোরাঁর তাজা অতিরিক্ত খাবারের বিবরণ ও পিকআপ তথ্য দিয়ে লাইভ ফিডে তালিকাভুক্ত করুন।")}
      profileName={session?.displayName}
      profileDescription={tx("ভেরিফাইড খাদ্য দাতা")}
      avatarInitials={session?.displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "D"}
      notificationHref={ROUTES.donor.notifications}
      backHref={ROUTES.donor.dashboard}
      backLabel={tx("ড্যাশবোর্ডে ফিরুন")}
    >
      <Stepper
        steps={wizardSteps}
        current={currentStep}
        label={tx("খাদ্য অনুদান পোস্টের অগ্রগতি")}
        onStepClick={result || uploading || submitting ? undefined : (step) => editStep(step as DonationWizardStep)}
      />
      {preferredNgo && currentStep !== 6 && (
        <Alert
          className="mt-6"
          tone="info"
          title={tx("পছন্দনীয় এনজিও: {0}", preferredNgo.profile.organizationName)}
          description={tx("আপনার পছন্দের এই সংস্থাটিকে অগ্রাধিকার ভিত্তিতে অবহিত করা হবে।")}
          action={
            <ButtonLink href={ROUTES.donor.ngoProfile(preferredNgo.profile.id)} size="sm" variant="outline"><UiText source={"এনজিও প্রোফাইল দেখুন"} /></ButtonLink>
          }
        />
      )}

      {currentStep === 6 && result ? (
        <div className="mt-10">
          <DonationConfirmation result={result} addAnother={addAnother} />
        </div>
      ) : (
        <div className={styles.layout}>
          <div className={styles.card}>
            <div className={styles.stepHeading}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800 font-heading">
                    {tx("Step {0} of {1}", currentStep, wizardSteps.length)}</span>
                  <h2 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl font-heading">
                    {tx(wizardSteps[currentStep - 1]?.label)}
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-slate-600 font-normal">
                    {tx(wizardSteps[currentStep - 1]?.description)}
                  </p>
                </div>
                {savedAt && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600">
                    {tx("খসড়া সংরক্ষিত রয়েছে")}</span>
                )}
              </div>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} noValidate data-wizard-step={currentStep}>
              <div className={styles.formContent}>
                {errors.form && (
                  <Alert className="mb-5" tone="danger" title={tx("অগ্রসর হওয়া সম্ভব নয়")} description={tx(errors.form)} />
                )}
                {hasDonationDraftErrors(errors) && !errors.form && (
                  <Alert
                    className="mb-5"
                    tone="danger"
                    title={tx("চিহ্নিত ঘরগুলো পরীক্ষা করুন")}
                    description={tx("পরবর্তী ধাপে যাওয়ার আগে লাল রঙের ঘরগুলোতে সঠিক তথ্য প্রদান করুন।")}
                  />
                )}
                {currentStep === 1 && <FoodDetailsStep part="food" draft={draft} errors={errors} update={update} onUploadBusyChange={setUploading} />}
                {currentStep === 2 && <FoodDetailsStep part="time" draft={draft} errors={errors} update={update} />}
                {currentStep === 3 && <FoodDetailsStep part="photos" draft={draft} errors={errors} update={update} onUploadBusyChange={setUploading} />}
                {currentStep === 4 && <PickupInformationStep draft={draft} errors={errors} update={update} addresses={addresses} />}
                {currentStep === 5 && <SafetyReviewStep draft={draft} errors={errors} update={update} editStep={editStep} />}
              </div>

              <div className={styles.actions} data-testid="donation-form-actions">
                <div className={styles.actionLayout}>
                  {/* Left Side: Back Navigation & Draft */}
                  <div className={styles.secondaryActions}>
                    {currentStep === 1 ? (
                      <ButtonLink
                        href={ROUTES.donor.dashboard}
                        variant="outline"
                        leftIcon={<ArrowLeft className="size-4" />}
                        className="flex-1 sm:flex-initial justify-center text-xs sm:text-sm"
                      >
                        {tx("ড্যাশবোর্ড")}</ButtonLink>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        leftIcon={<ArrowLeft className="size-4" />}
                        onClick={goBack}
                        data-testid="donation-previous"
                        disabled={uploading || submitting}
                        className="flex-1 sm:flex-initial justify-center text-xs sm:text-sm"
                      >
                        {tx("পূর্ববর্তী")}</Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      leftIcon={<Save className="size-4 text-emerald-600 animate-icon-breathe" />}
                      onClick={persistDraft}
                      className="flex-1 sm:flex-initial justify-center text-xs sm:text-sm border-slate-300 bg-slate-50/70 text-slate-700 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-800"
                    >
                      {tx("খসড়া")}</Button>
                  </div>

                  {/* Right Side: Forward Navigation (Primary Mobile Thumb Target) */}
                  <div className={styles.primaryAction}>
                    {currentStep < 5 ? (
                      <Button
                        key="next-step"
                        data-testid="donation-next"
                        type="button"
                        variant="primary"
                        rightIcon={<ArrowRight className="size-4" />}
                        disabled={uploading || !profileReady} onClick={(event) => { event.preventDefault(); goNext(); }}
                        className="w-full sm:w-auto justify-center px-6 py-2.5 sm:py-2 text-sm sm:text-base font-black shadow-lg shadow-emerald-700/25 ring-2 ring-emerald-500/30"
                      >
                        {tx("পরবর্তী ধাপ")}</Button>
                    ) : (
                      <Button
                        key="publish-donation"
                        type="submit"
                        variant="primary"
                        className="w-full sm:w-auto justify-center px-6 py-2.5 sm:py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-sm sm:text-base font-black shadow-xl shadow-emerald-700/30 ring-2 ring-emerald-500/30"
                        rightIcon={<Send className="size-4 animate-icon-float" />}
                        disabled={submitting || uploading || !profileReady}
                      >
                        {submitting ? tx("পোস্ট হচ্ছে...") : tx("অনুদানের তালিকা প্রকাশ করুন")}
                      </Button>
                    )}
                  </div>
                </div>
                {savedAt && <p className={styles.draftStatus} role="status">{tx("Draft saved")}</p>}
              </div>
            </form>
          </div>

          <aside className={styles.summary}>
            <button type="button" className={styles.summaryToggle} aria-expanded={summaryOpen} aria-controls="donation-preview" onClick={() => setSummaryOpen((value) => !value)}>
              {tx("View donation summary")}<ChevronDown size={17} aria-hidden="true" />
            </button>
            <div id="donation-preview" className={styles.summaryContent} data-open={summaryOpen}>
              <DonationSummaryPanel draft={draft} currentStep={currentStep} errors={errors} />
            </div>
          </aside>
        </div>
      )}
    </PortalShell>
  );
}
