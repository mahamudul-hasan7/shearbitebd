"use client";
import { UiText } from "@/lib/i18n/ui-text-node";
import { getUiLocale } from "@/lib/i18n/locale";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { isNoKnownAllergens } from "@/lib/i18n/food-input";

import { ArrowLeft, ArrowRight, ClipboardList, RotateCcw, Save, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { RequestFoodDetailsStep, RequestInfoStep, RequestLocationStep, RequestQuantityTimeStep, RequestReviewStep } from "@/components/request/request-form-steps";
import { PortalShell } from "@/components/layout/portal-shell";
import { StickyActionBar } from "@/components/layout/sticky-action-bar";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Stepper } from "@/components/ui/stepper";
import { createInitialFoodRequestDraft, FOOD_REQUEST_DRAFT_STORAGE_KEY, restoreFoodRequestDraft } from "@/features/requests/request-draft";
import type { FoodRequestDraft, FoodRequestDraftErrors, FoodRequestDraftField, RequestWizardStep } from "@/features/requests/types";
import { foodRequestErrorStep, hasFoodRequestErrors, validateCompleteFoodRequest, validateFoodRequestStep } from "@/features/requests/validation";
import { useMockAuth } from "@/features/auth/mock-auth";
import { profileService } from "@/services/profile.service";
import type { Address } from "@/types/domain";
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
  if (!value.trim() || isNoKnownAllergens(value)) return [];
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

export function FoodRequestWizard() {
  const tx = useUiText();
  const router = useRouter();
  const { session } = useMockAuth();
  const draftStorageKey = `${FOOD_REQUEST_DRAFT_STORAGE_KEY}.${session?.id}`;
  const [verified, setVerified] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const submitted = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [currentStep, setCurrentStep] = useState<RequestWizardStep>(1);
  const [draft, setDraft] = useState<FoodRequestDraft>(() => createInitialFoodRequestDraft());
  const [errors, setErrors] = useState<FoodRequestDraftErrors>({});
  const [hydrated, setHydrated] = useState(false);
  const [savedAt, setSavedAt] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!session?.id) return;
    const controller = new AbortController();
    profileService.getOwnProfile("", {}, { signal: controller.signal }).then((profile) => {
      if (controller.signal.aborted) return;
      let restored = createInitialFoodRequestDraft();
      try { const stored = window.sessionStorage.getItem(draftStorageKey); if (stored) restored = restoreFoodRequestDraft(JSON.parse(stored)); }
      catch { try { window.sessionStorage.removeItem(draftStorageKey); } catch { /* Storage is optional. */ } }
      const address = profile.addresses.find((a) => a.id === restored.deliveryAddressId) || profile.addresses.find((a) => a.isPrimary) || profile.addresses[0];
      setAddresses(profile.addresses);
      setVerified(profile.ngoProfile?.verificationStatus === "VERIFIED");
      if (profile.ngoProfile?.verificationStatus !== "VERIFIED") setErrors({ form: "NGO verification is required before publishing. You can prepare a local draft." });
      setDraft({ ...restored, deliveryAddressId: address?.id || "", addressLine: address?.addressLine || "", area: address?.area || "", city: address?.city || "", landmark: address?.landmark || "" });
      setHydrated(true);
      if (!address) setErrors({ form: "Add a complete saved NGO address before publishing a request." });
    }).catch((error: unknown) => { if (!controller.signal.aborted) setErrors({ form: error instanceof Error ? error.message : "NGO profile could not load." }); });
    return () => controller.abort();
  }, [draftStorageKey, session?.id]);

  useEffect(() => {
    if (!hydrated || submitted.current) return;
    const timer = window.setTimeout(() => {
      if (submitted.current) return;
      try {
        window.sessionStorage.setItem(draftStorageKey, JSON.stringify(draft));
        setSavedAt(new Date().toISOString());
      } catch {
        setErrors((current) => ({ ...current, form: "This browser could not autosave the draft." }));
      }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [draft, hydrated, draftStorageKey]);

  function update<K extends FoodRequestDraftField>(field: K, value: FoodRequestDraft[K]) {
    const address = field === "deliveryAddressId" ? addresses.find((a) => a.id === value) : undefined;
    setDraft((current) => ({ ...current, [field]: value, submissionKey: "", ...(address ? { addressLine: address.addressLine, area: address.area, city: address.city, landmark: address.landmark || "" } : {}) }));
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  }

  function revealErrors(nextErrors: FoodRequestDraftErrors) {
    setErrors(nextErrors);
    const step = foodRequestErrorStep(nextErrors);
    if (step) setCurrentStep(step);
    window.requestAnimationFrame(() => {
      const field = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
      field?.scrollIntoView({ behavior: "smooth", block: "center" });
      field?.focus({ preventScroll: true });
    });
  }

  function goNext(event?: MouseEvent<HTMLButtonElement>) {
    event?.preventDefault();
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
      window.sessionStorage.setItem(draftStorageKey, JSON.stringify(draft));
      setSavedAt(new Date().toISOString());
    } catch {
      setErrors((current) => ({ ...current, form: "This browser could not save the mock draft." }));
    }
  }

  function resetDraft() {
    if (!window.confirm("Clear this food request draft and start again?")) return;
    try { window.sessionStorage.removeItem(draftStorageKey); } catch { /* Reset the form even when storage is unavailable. */ }
    setDraft((current) => ({ ...createInitialFoodRequestDraft(), deliveryAddressId: current.deliveryAddressId, addressLine: current.addressLine, area: current.area, city: current.city, landmark: current.landmark }));
    setCurrentStep(1);
    setErrors({});
    setSavedAt(undefined);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (currentStep !== 5 || !hydrated || submitting || !session?.ngoProfileId) return;
    const nextErrors = validateCompleteFoodRequest(draft);
    if (hasFoodRequestErrors(nextErrors)) {
      revealErrors({ ...nextErrors, form: "Review the highlighted fields before submitting." });
      return;
    }

    setSubmitting(true);
    try {
      const submissionKey = draft.submissionKey || crypto.randomUUID();
      setDraft((current) => ({ ...current, submissionKey }));
      const request = await requestService.create({
        submissionKey,
        ngoProfileId: session.ngoProfileId,
        title: draft.title.trim(),
        requestType: draft.requestType,
        priority: draft.priority,
        priorityReason: draft.priorityReason.trim() || undefined,
        supportingDocumentNames: [],
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
        deliveryAddressId: draft.deliveryAddressId,
        locationType: draft.locationType,
        deliveryLocation: {
          addressLine: draft.addressLine.trim(),
          area: draft.area.trim(),
          city: draft.city.trim(),
          landmark: draft.landmark.trim() || undefined,
          instructions: draft.locationInstructions.trim() || undefined,
        },
        notes: draft.notes.trim() || undefined,
        status: RequestStatus.FINDING_MATCH,
      }, {});
      submitted.current = true;
      try { window.sessionStorage.removeItem(draftStorageKey); } catch { /* The request is already saved. */ }
      router.push(`${ROUTES.ngo.requestSubmitted}?id=${encodeURIComponent(request.id)}`);
    } catch (error: unknown) {
      if (error instanceof MockApiError) revealErrors({ ...error.fieldErrors, ...(error.fieldErrors?.deliveryInstructions ? { locationInstructions: error.fieldErrors.deliveryInstructions } : {}), form: error.message });
      else setErrors({ form: "The request could not be submitted. Try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PortalShell
      role="ngo"
      activeHref={ROUTES.ngo.newRequest}
      title={tx("Create food request")}
      description={tx("Publish a verified community need without mixing it with the donation-claim workflow.")}
      profileName={session?.displayName || "NGO"}
      profileDescription={tx("Verified NGO")}
      avatarInitials={session?.displayName.slice(0, 2).toUpperCase() || "NG"}
      notificationHref={ROUTES.ngo.dashboard + "#recent-activity"}
      backHref={ROUTES.ngo.dashboard}
      backLabel={tx("ড্যাশবোর্ডে ফিরুন")}
      actions={<ButtonLink href={ROUTES.ngo.requests} variant="outline" leftIcon={<ClipboardList className="size-4" />}><UiText source={"My requests"} /></ButtonLink>}
    >
      <div className="grid gap-6">
        <Stepper steps={steps} current={currentStep} label={tx("Food request progress")} />
        {errors.form && <Alert tone="danger" title={tx("Request needs attention")} description={tx(errors.form)} />}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <form ref={formRef} onSubmit={submit} noValidate>
            <Card>
              <CardHeader title={tx(steps[currentStep - 1].label)} description={tx(steps[currentStep - 1].description)} />
              <CardContent>
                {currentStep === 1 && <RequestInfoStep draft={draft} errors={errors} update={update} />}
                {currentStep === 2 && <RequestFoodDetailsStep draft={draft} errors={errors} update={update} />}
                {currentStep === 3 && <RequestQuantityTimeStep draft={draft} errors={errors} update={update} />}
                {currentStep === 4 && <RequestLocationStep draft={draft} errors={errors} update={update} addresses={addresses} />}
                {currentStep === 5 && <RequestReviewStep draft={draft} editStep={editStep} />}
              </CardContent>
              <StickyActionBar className="px-5 sm:px-6">
                <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    {currentStep === 1 ? (
                      <ButtonLink href={ROUTES.ngo.dashboard} variant="outline" leftIcon={<ArrowLeft className="size-4" />}>
                        {tx("Dashboard")}</ButtonLink>
                    ) : (
                      <Button type="button" variant="outline" leftIcon={<ArrowLeft className="size-4" />} onClick={goBack}>
                        {tx("Back")}</Button>
                    )}
                    <Button type="button" variant="ghost" leftIcon={<Save className="size-4" />} onClick={saveDraft}>
                      {tx("Save draft")}</Button>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentStep < 5 ? (
                      <Button key="continue-request" type="button" rightIcon={<ArrowRight className="size-4" />} disabled={!hydrated || submitting} onClick={goNext}>
                        {tx("Continue")}</Button>
                    ) : (
                      <Button key="publish-request" type="submit" rightIcon={<Send className="size-4" />} disabled={submitting || !hydrated || !verified}>
                        {submitting ? tx("Submitting...") : tx("Submit request")}
                      </Button>
                    )}
                  </div>
                </div>
              </StickyActionBar>
            </Card>
          </form>
          <aside className="xl:sticky xl:top-6 xl:self-start">
            <Card><CardHeader title={tx("Request snapshot")} description={savedAt ? tx("Draft saved {0}", new Date(savedAt).toLocaleTimeString(getUiLocale(), { hour: "numeric", minute: "2-digit" })) : tx("Draft autosaves in this browser tab")} /><CardContent className="grid gap-4 text-sm"><div><p className="text-xs font-bold uppercase tracking-wide text-muted-500">{tx("Need")}</p><p className="mt-1 font-black text-ink-900">{draft.title || "Untitled request"}</p></div><div className="grid grid-cols-2 gap-3"><div className="rounded-2xl bg-brand-50 p-3"><p className="text-xs text-muted-600">{tx("Meals")}</p><p className="mt-1 text-xl font-black text-brand-900">{draft.mealsNeeded || "—"}</p></div><div className="rounded-2xl bg-accent-50 p-3"><p className="text-xs text-muted-600">{tx("People")}</p><p className="mt-1 text-xl font-black text-accent-700">{draft.peopleToServe || "—"}</p></div></div><p className="leading-6 text-muted-600">{tx("A request asks the network to find a match. It does not reserve an existing donation or create a claim.")}</p><Button type="button" size="sm" variant="ghost" leftIcon={<RotateCcw className="size-4" />} onClick={resetDraft}>{tx("Clear saved draft")}</Button></CardContent></Card>
          </aside>
        </div>
      </div>
    </PortalShell>
  );
}
