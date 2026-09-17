import { Clock3, MapPin, ShieldCheck } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { RadioGroup } from "@/components/ui/radio-group";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { FoodRequestDraft, FoodRequestDraftErrors, FoodRequestDraftUpdate, RequestTiming, RequestWizardStep } from "@/features/requests/types";
import { DIETARY_TYPE_LABELS, DietaryType, FOOD_CATEGORY_LABELS, FoodCategory, PRIORITY_META, PriorityLevel, RequestType } from "@/lib/constants/domain";

function toggleValue<T extends string>(values: T[], value: T) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function localDateTime(date: Date) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function dateForTiming(timing: RequestTiming) {
  const date = new Date();
  if (timing === "ASAP") date.setHours(date.getHours() + 2);
  if (timing === "TODAY") date.setHours(date.getHours() + 4);
  if (timing === "TOMORROW") {
    date.setDate(date.getDate() + 1);
    date.setHours(12, 0, 0, 0);
  }
  return localDateTime(date);
}

export function RequestInfoStep({ draft, errors, update }: { draft: FoodRequestDraft; errors: FoodRequestDraftErrors; update: FoodRequestDraftUpdate }) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-5 md:grid-cols-2">
        <Input name="title" label="Request title" value={draft.title} error={errors.title} placeholder="Evening meals for shelter families" onChange={(event) => update("title", event.target.value)} containerClassName="md:col-span-2" />
        <Select name="requestType" label="Request type" value={draft.requestType} onChange={(event) => update("requestType", event.target.value as RequestType)}>
          <option value={RequestType.ONE_TIME}>One-time need</option>
          <option value={RequestType.RECURRING}>Recurring program</option>
          <option value={RequestType.EMERGENCY}>Emergency response</option>
        </Select>
        <Select name="priority" label="Priority" value={draft.priority} onChange={(event) => update("priority", event.target.value as PriorityLevel)}>
          {Object.values(PriorityLevel).map((priority) => <option key={priority} value={priority}>{PRIORITY_META[priority].label}</option>)}
        </Select>
        <Input name="purpose" label="Purpose" value={draft.purpose} error={errors.purpose} placeholder="Evening meal support" onChange={(event) => update("purpose", event.target.value)} />
        <Input name="recipientType" label="Recipient group" value={draft.recipientType} error={errors.recipientType} placeholder="Shelter families" onChange={(event) => update("recipientType", event.target.value)} />
      </div>
      {(draft.priority === PriorityLevel.HIGH || draft.priority === PriorityLevel.URGENT) && (
        <Textarea name="priorityReason" label="High-priority reason" value={draft.priorityReason} error={errors.priorityReason} placeholder="Explain the time-sensitive need…" onChange={(event) => update("priorityReason", event.target.value)} />
      )}
      <FileUpload label="Supporting document (optional)" name="supportingDocuments" accept=".pdf,.jpg,.jpeg,.png" multiple maxFiles={3} maxSizeMb={5} fileNames={draft.supportingDocumentNames} hint="PDF, JPG or PNG; up to 3 files, 5 MB each. Names are saved locally—files are not uploaded." onFilesChange={(files) => update("supportingDocumentNames", files.map((file) => file.name))} />
    </div>
  );
}

export function RequestFoodDetailsStep({ draft, errors, update }: { draft: FoodRequestDraft; errors: FoodRequestDraftErrors; update: FoodRequestDraftUpdate }) {
  return (
    <div className="grid gap-6">
      <fieldset>
        <legend className="text-sm font-bold text-ink-700">Preferred food categories</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {Object.values(FoodCategory).map((category) => <Checkbox key={category} label={FOOD_CATEGORY_LABELS[category]} checked={draft.categories.includes(category)} onChange={() => update("categories", toggleValue(draft.categories, category))} />)}
        </div>
        {errors.categories && <p role="alert" className="mt-2 text-xs text-danger">{errors.categories}</p>}
      </fieldset>
      <fieldset>
        <legend className="text-sm font-bold text-ink-700">Dietary compatibility</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {Object.values(DietaryType).map((dietaryType) => <Checkbox key={dietaryType} label={DIETARY_TYPE_LABELS[dietaryType]} checked={draft.dietaryTypes.includes(dietaryType)} onChange={() => update("dietaryTypes", toggleValue(draft.dietaryTypes, dietaryType))} />)}
        </div>
        {errors.dietaryTypes && <p role="alert" className="mt-2 text-xs text-danger">{errors.dietaryTypes}</p>}
      </fieldset>
      <Textarea name="specificPreferences" label="Specific preferences (optional)" value={draft.specificPreferences} placeholder="Packaging, portion size, preparation or culturally appropriate meal preferences…" onChange={(event) => update("specificPreferences", event.target.value)} />
      <Textarea name="allergensOrRestrictions" label="Allergens or restrictions" value={draft.allergensOrRestrictions} hint="Separate items with commas, or enter ‘None known’. Donors must still declare allergens on their listing." placeholder="Milk, nuts, low spice" onChange={(event) => update("allergensOrRestrictions", event.target.value)} />
      <Alert tone="info" title="Quality guidance, not a medical guarantee" description="Only accept food with clear preparation time, storage condition, allergen information, and a safe pickup deadline. ShareBite BD does not certify food as medically safe." />
    </div>
  );
}

export function RequestQuantityTimeStep({ draft, errors, update }: { draft: FoodRequestDraft; errors: FoodRequestDraftErrors; update: FoodRequestDraftUpdate }) {
  function changeTiming(timing: RequestTiming) {
    update("neededWhen", timing);
    if (timing !== "CUSTOM") update("neededBy", dateForTiming(timing));
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <Input name="peopleToServe" type="number" min={1} step={1} label="People to be served" value={draft.peopleToServe} error={errors.peopleToServe} placeholder="80" onChange={(event) => update("peopleToServe", event.target.value)} />
        <Input name="mealsNeeded" type="number" min={1} step={1} label="Meals needed" value={draft.mealsNeeded} error={errors.mealsNeeded} placeholder="80" onChange={(event) => update("mealsNeeded", event.target.value)} />
      </div>
      <RadioGroup label="When is the food needed?" name="neededWhen" value={draft.neededWhen} orientation="horizontal" items={[
        { value: "ASAP", label: "ASAP", description: "About two hours from now" },
        { value: "TODAY", label: "Today", description: "Later today" },
        { value: "TOMORROW", label: "Tomorrow", description: "Tomorrow around midday" },
        { value: "CUSTOM", label: "Custom", description: "Choose a specific time" },
      ]} onChange={(event) => changeTiming(event.target.value as RequestTiming)} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Input name="neededBy" type="datetime-local" label="Needed by" value={draft.neededBy} error={errors.neededBy} leftIcon={<Clock3 className="size-4" aria-hidden="true" />} onChange={(event) => { update("neededWhen", "CUSTOM"); update("neededBy", event.target.value); }} />
        <Input name="preferredTimeSlot" label="Preferred time slot" value={draft.preferredTimeSlot} error={errors.preferredTimeSlot} placeholder="6:00 PM – 8:00 PM" onChange={(event) => update("preferredTimeSlot", event.target.value)} />
      </div>
      <Textarea name="notes" label="Additional notes (optional)" value={draft.notes} placeholder="Add serving context or coordination notes without beneficiary-identifying information…" onChange={(event) => update("notes", event.target.value)} />
    </div>
  );
}

export function RequestLocationStep({ draft, errors, update }: { draft: FoodRequestDraft; errors: FoodRequestDraftErrors; update: FoodRequestDraftUpdate }) {
  return (
    <div className="grid gap-6">
      <Select name="locationType" label="Location type" value={draft.locationType} onChange={(event) => update("locationType", event.target.value as FoodRequestDraft["locationType"])}>
        <option value="SHELTER">Shelter or orphanage</option>
        <option value="COMMUNITY_CENTER">Community center</option>
        <option value="OTHER">Other verified program location</option>
      </Select>
      <Input name="addressLine" label="Full delivery address" value={draft.addressLine} error={errors.addressLine} placeholder="House, road and building details" onChange={(event) => update("addressLine", event.target.value)} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Input name="area" label="Area" value={draft.area} error={errors.area} placeholder="Badda" onChange={(event) => update("area", event.target.value)} />
        <Input name="city" label="City" value={draft.city} error={errors.city} placeholder="Dhaka" onChange={(event) => update("city", event.target.value)} />
        <Input name="landmark" label="Landmark (optional)" value={draft.landmark} placeholder="Near the community clinic" onChange={(event) => update("landmark", event.target.value)} />
        <Input name="locationInstructions" label="Delivery instructions (optional)" value={draft.locationInstructions} placeholder="Call the NGO desk on arrival" onChange={(event) => update("locationInstructions", event.target.value)} />
      </div>
      <div className="grid min-h-52 place-items-center rounded-3xl border border-brand-100 bg-[radial-gradient(circle_at_center,_var(--color-brand-100)_1px,_transparent_1px)] bg-[size:18px_18px] p-6 text-center">
        <div><span className="mx-auto grid size-14 place-items-center rounded-full bg-brand-600 text-white shadow-card"><MapPin className="size-7" aria-hidden="true" /></span><p className="mt-4 font-black text-brand-900">Mock delivery map</p><p className="mt-1 max-w-md text-sm leading-6 text-muted-600">This frontend preview does not send coordinates or provide live routing. The full address is visible only within the authorized request workflow.</p></div>
      </div>
    </div>
  );
}

function ReviewSection({ title, step, onEdit, children }: { title: string; step: RequestWizardStep; onEdit: (step: RequestWizardStep) => void; children: React.ReactNode }) {
  return <Card><CardHeader title={title} action={<Button type="button" size="sm" variant="ghost" onClick={() => onEdit(step)}>Edit</Button>} /><CardContent className="grid gap-2 text-sm text-muted-600">{children}</CardContent></Card>;
}

export function RequestReviewStep({ draft, editStep }: { draft: FoodRequestDraft; editStep: (step: RequestWizardStep) => void }) {
  return (
    <div className="grid gap-4">
      <Alert tone="warning" title="Review before submitting" description="A submitted request enters pending review. Matching is not guaranteed and donors still control whether suitable surplus food is published." />
      <ReviewSection title="Request information" step={1} onEdit={editStep}><p className="font-bold text-ink-900">{draft.title}</p><p>{draft.requestType.replaceAll("_", " ")} · {PRIORITY_META[draft.priority].label} priority</p><p>{draft.purpose} for {draft.recipientType}</p>{draft.priorityReason && <p>Priority reason: {draft.priorityReason}</p>}</ReviewSection>
      <ReviewSection title="Food details" step={2} onEdit={editStep}><p>Categories: {draft.categories.map((item) => FOOD_CATEGORY_LABELS[item]).join(", ")}</p><p>Dietary: {draft.dietaryTypes.map((item) => DIETARY_TYPE_LABELS[item]).join(", ")}</p><p>Restrictions: {draft.allergensOrRestrictions || "None provided"}</p></ReviewSection>
      <ReviewSection title="Quantity and time" step={3} onEdit={editStep}><p>{draft.mealsNeeded} meals for {draft.peopleToServe} people</p><p>Needed: {new Date(draft.neededBy).toLocaleString("en-BD", { dateStyle: "medium", timeStyle: "short" })}</p><p>Preferred slot: {draft.preferredTimeSlot}</p></ReviewSection>
      <ReviewSection title="Delivery location" step={4} onEdit={editStep}><p className="font-bold text-ink-900">{draft.addressLine}</p><p>{draft.area}, {draft.city}{draft.landmark ? ` · ${draft.landmark}` : ""}</p><p className="flex items-center gap-2 text-brand-700"><ShieldCheck className="size-4" aria-hidden="true" />Authorized request participants only</p></ReviewSection>
    </div>
  );
}
