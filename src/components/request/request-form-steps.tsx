"use client";

import { UiText } from "@/lib/i18n/ui-text-node";
import { getUiLocale } from "@/lib/i18n/locale";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { LocationMap } from "@/components/maps/location-map";
import { Clock3, MapPin, ShieldCheck } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ButtonLink } from "@/components/ui/button";
import type { Address } from "@/types/domain";
import { ROUTES } from "@/lib/routes";
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
  const tx = useUiText();
  return (
    <div className="grid gap-6">
      <div className="grid gap-5 md:grid-cols-2">
        <Input name="title" label={tx("Request title")} value={draft.title} error={tx(errors.title)} placeholder={tx("Evening meals for shelter families")} onChange={(event) => update("title", event.target.value)} containerClassName="md:col-span-2" />
        <Select name="requestType" label={tx("Request type")} value={draft.requestType} onChange={(event) => update("requestType", event.target.value as RequestType)}>
          <option value={RequestType.ONE_TIME}>{tx("One-time need")}</option>
          <option value={RequestType.RECURRING}>{tx("Recurring program")}</option>
          <option value={RequestType.EMERGENCY}>{tx("Emergency response")}</option>
        </Select>
        <Select name="priority" label={tx("Priority")} value={draft.priority} onChange={(event) => update("priority", event.target.value as PriorityLevel)}>
          {Object.values(PriorityLevel).map((priority) => <option key={priority} value={priority}>{tx(PRIORITY_META[priority].label)}</option>)}
        </Select>
        <Input name="purpose" label={tx("Purpose")} value={draft.purpose} error={tx(errors.purpose)} placeholder={tx("Evening meal support")} onChange={(event) => update("purpose", event.target.value)} />
        <Input name="recipientType" label={tx("Recipient group")} value={draft.recipientType} error={tx(errors.recipientType)} placeholder={tx("Shelter families")} onChange={(event) => update("recipientType", event.target.value)} />
      </div>
      {(draft.priority === PriorityLevel.HIGH || draft.priority === PriorityLevel.URGENT) && (
        <Textarea name="priorityReason" label={tx("High-priority reason")} value={draft.priorityReason} error={tx(errors.priorityReason)} placeholder={tx("Explain the time-sensitive need…")} onChange={(event) => update("priorityReason", event.target.value)} />
      )}
      <p className="text-xs text-muted-600">{tx("Recurring program requests cover this stated occurrence; future requests are created separately.")}</p>
    </div>
  );
}

export function RequestFoodDetailsStep({ draft, errors, update }: { draft: FoodRequestDraft; errors: FoodRequestDraftErrors; update: FoodRequestDraftUpdate }) {
  const tx = useUiText();
  return (
    <div className="grid gap-6">
      <fieldset>
        <legend className="text-sm font-bold text-ink-700">{tx("Preferred food categories")}</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {Object.values(FoodCategory).map((category) => <Checkbox key={category} label={tx(FOOD_CATEGORY_LABELS[category])} checked={draft.categories.includes(category)} onChange={() => update("categories", toggleValue(draft.categories, category))} />)}
        </div>
        {errors.categories && <p role="alert" className="mt-2 text-xs text-danger">{tx(errors.categories)}</p>}
      </fieldset>
      <fieldset>
        <legend className="text-sm font-bold text-ink-700">{tx("Dietary compatibility")}</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {Object.values(DietaryType).map((dietaryType) => <Checkbox key={dietaryType} label={tx(DIETARY_TYPE_LABELS[dietaryType])} checked={draft.dietaryTypes.includes(dietaryType)} onChange={() => update("dietaryTypes", toggleValue(draft.dietaryTypes, dietaryType))} />)}
        </div>
        {errors.dietaryTypes && <p role="alert" className="mt-2 text-xs text-danger">{tx(errors.dietaryTypes)}</p>}
      </fieldset>
      <Textarea name="specificPreferences" label={tx("Specific preferences (optional)")} value={draft.specificPreferences} placeholder={tx("Packaging, portion size, preparation or culturally appropriate meal preferences…")} onChange={(event) => update("specificPreferences", event.target.value)} />
      <Textarea name="allergensOrRestrictions" label={tx("Allergens or restrictions")} value={draft.allergensOrRestrictions} hint={tx("Separate items with commas, or enter ‘None known’. Donors must still declare allergens on their listing.")} placeholder={tx("Milk, nuts, low spice")} onChange={(event) => update("allergensOrRestrictions", event.target.value)} />
      <Alert tone="info" title={tx("Quality guidance, not a medical guarantee")} description={tx("Only accept food with clear preparation time, storage condition, allergen information, and a safe pickup deadline. ShareBite BD does not certify food as medically safe.")} />
    </div>
  );
}

export function RequestQuantityTimeStep({ draft, errors, update }: { draft: FoodRequestDraft; errors: FoodRequestDraftErrors; update: FoodRequestDraftUpdate }) {
  const tx = useUiText();
  function changeTiming(timing: RequestTiming) {
    update("neededWhen", timing);
    if (timing !== "CUSTOM") update("neededBy", dateForTiming(timing));
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <Input name="peopleToServe" type="number" min={1} step={1} label={tx("People to be served")} value={draft.peopleToServe} error={tx(errors.peopleToServe)} placeholder="80" onChange={(event) => update("peopleToServe", event.target.value)} />
        <Input name="mealsNeeded" type="number" min={1} step={1} label={tx("Meals needed")} value={draft.mealsNeeded} error={tx(errors.mealsNeeded)} placeholder="80" onChange={(event) => update("mealsNeeded", event.target.value)} />
      </div>
      <RadioGroup label={tx("When is the food needed?")} name="neededWhen" value={draft.neededWhen} orientation="horizontal" items={[
        { value: "ASAP", label: "ASAP", description: "About two hours from now" },
        { value: "TODAY", label: "Today", description: "Later today" },
        { value: "TOMORROW", label: "Tomorrow", description: "Tomorrow around midday" },
        { value: "CUSTOM", label: "Custom", description: "Choose a specific time" },
      ]} onChange={(event) => changeTiming(event.target.value as RequestTiming)} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Input name="neededBy" type="datetime-local" label={tx("Needed by")} value={draft.neededBy} error={tx(errors.neededBy)} leftIcon={<Clock3 className="size-4" aria-hidden="true" />} onChange={(event) => { update("neededWhen", "CUSTOM"); update("neededBy", event.target.value); }} />
        <Input name="preferredTimeSlot" label={tx("Preferred time slot")} value={draft.preferredTimeSlot} error={tx(errors.preferredTimeSlot)} placeholder={tx("6:00 PM – 8:00 PM")} onChange={(event) => update("preferredTimeSlot", event.target.value)} />
      </div>
      <Textarea name="notes" label={tx("Additional notes (optional)")} value={draft.notes} placeholder={tx("Add serving context or coordination notes without beneficiary-identifying information…")} onChange={(event) => update("notes", event.target.value)} />
    </div>
  );
}

export function RequestLocationStep({ draft, errors, update, addresses }: { draft: FoodRequestDraft; errors: FoodRequestDraftErrors; update: FoodRequestDraftUpdate; addresses: Address[] }) {
  const tx = useUiText();
  const address = addresses.find((item) => item.id === draft.deliveryAddressId);
  return (
    <div className="grid gap-6">
      <Select name="deliveryAddressId" label={tx("Saved delivery address")} value={draft.deliveryAddressId} error={tx(errors.deliveryAddressId)} onChange={(event) => update("deliveryAddressId", event.target.value)}>{addresses.map((address) => <option key={address.id} value={address.id}>{address.label} — {address.addressLine}</option>)}</Select>
      <ButtonLink href={ROUTES.ngo.addresses} variant="outline" target="_blank" rel="noopener noreferrer">{tx("Manage saved NGO addresses")}</ButtonLink>
      {address?.coordinates ? <LocationMap points={[{ id: "delivery", coordinates: address.coordinates, label: address.label, description: address.addressLine }]} label={tx("Saved delivery location")} /> : <p className="text-sm text-amber-800">{tx("Delivery pin not set. Save a pin on this address to enable map navigation for new requests.")}</p>}
      <Select name="locationType" label={tx("Location type")} value={draft.locationType} onChange={(event) => update("locationType", event.target.value as FoodRequestDraft["locationType"])}>
        <option value="SHELTER">{tx("Shelter or orphanage")}</option>
        <option value="COMMUNITY_CENTER">{tx("Community center")}</option>
        <option value="OTHER">{tx("Other verified program location")}</option>
      </Select>
      <Input name="addressLine" readOnly label={tx("Full delivery address")} value={draft.addressLine} error={tx(errors.addressLine)} placeholder={tx("House, road and building details")} onChange={(event) => update("addressLine", event.target.value)} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Input name="area" readOnly label={tx("Area")} value={draft.area} error={tx(errors.area)} placeholder={tx("Badda")} onChange={(event) => update("area", event.target.value)} />
        <Input name="city" readOnly label={tx("City")} value={draft.city} error={tx(errors.city)} placeholder={tx("Dhaka")} onChange={(event) => update("city", event.target.value)} />
        <Input name="landmark" label={tx("Landmark (optional)")} value={draft.landmark} placeholder={tx("Near the community clinic")} onChange={(event) => update("landmark", event.target.value)} />
        <Input name="locationInstructions" label={tx("Delivery instructions (optional)")} value={draft.locationInstructions} placeholder={tx("Call the NGO desk on arrival")} onChange={(event) => update("locationInstructions", event.target.value)} />
      </div>
      <div className="grid min-h-52 place-items-center rounded-3xl border border-brand-100 bg-[radial-gradient(circle_at_center,_var(--color-brand-100)_1px,_transparent_1px)] bg-[size:18px_18px] p-6 text-center">
        <div><span className="mx-auto grid size-14 place-items-center rounded-full bg-brand-600 text-white shadow-card"><MapPin className="size-7" aria-hidden="true" /></span><p className="mt-4 font-black text-brand-900">{tx("Mock delivery map")}</p><p className="mt-1 max-w-md text-sm leading-6 text-muted-600">{tx("This frontend preview does not send coordinates or provide live routing. The full address is visible only within the authorized request workflow.")}</p></div>
      </div>
    </div>
  );
}

function ReviewSection({ title, step, onEdit, children }: { title: string; step: RequestWizardStep; onEdit: (step: RequestWizardStep) => void; children: React.ReactNode }) {
  return <Card><CardHeader title={title} action={<Button type="button" size="sm" variant="ghost" onClick={() => onEdit(step)}><UiText source={"Edit"} /></Button>} /><CardContent className="grid gap-2 text-sm text-muted-600">{children}</CardContent></Card>;
}

export function RequestReviewStep({ draft, editStep }: { draft: FoodRequestDraft; editStep: (step: RequestWizardStep) => void }) {
  const tx = useUiText();
  return (
    <div className="grid gap-4">
      <Alert tone="warning" title={tx("Review before submitting")} description={tx("A verified NGO request starts finding suitable donations. Reserving food starts a linked rescue; recorded distribution fulfills the request.")} />
      <ReviewSection title={tx("Request information")} step={1} onEdit={editStep}><p className="font-bold text-ink-900">{draft.title}</p><p>{draft.requestType.replaceAll("_", " ")} · {tx(PRIORITY_META[draft.priority].label)} {" "}{tx("priority")}</p><p>{draft.purpose} {" "}{tx("for")}{" "}{draft.recipientType}</p>{draft.priorityReason && <p>{tx("Priority reason:")}{" "}{draft.priorityReason}</p>}</ReviewSection>
      <ReviewSection title={tx("Food details")} step={2} onEdit={editStep}><p>{tx("Categories:")}{" "}{draft.categories.map((item) => FOOD_CATEGORY_LABELS[item]).join(", ")}</p><p>{tx("Dietary:")}{" "}{draft.dietaryTypes.map((item) => DIETARY_TYPE_LABELS[item]).join(", ")}</p><p>{tx("Restrictions:")}{" "}{draft.allergensOrRestrictions || "None provided"}</p></ReviewSection>
      <ReviewSection title={tx("Quantity and time")} step={3} onEdit={editStep}><p>{draft.mealsNeeded} {" "}{tx("meals for")}{" "}{draft.peopleToServe} {" "}{tx("people")}</p><p>{tx("Needed:")}{" "}{new Date(draft.neededBy).toLocaleString(getUiLocale(), { dateStyle: "medium", timeStyle: "short" })}</p><p>{tx("Preferred slot:")}{" "}{draft.preferredTimeSlot}</p></ReviewSection>
      <ReviewSection title={tx("Delivery location")} step={4} onEdit={editStep}><p className="font-bold text-ink-900">{draft.addressLine}</p><p>{draft.area}, {draft.city}{draft.landmark ? ` · ${draft.landmark}` : ""}</p><p className="flex items-center gap-2 text-brand-700"><ShieldCheck className="size-4" aria-hidden="true" />{tx("Authorized request participants only")}</p></ReviewSection>
    </div>
  );
}
