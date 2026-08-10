import { Info, Mail, MapPin, Phone, UserRound } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { DonationDraft, DonationDraftErrors, DonationDraftField } from "@/features/donations/types";

export function PickupInformationStep({
  draft,
  errors,
  update,
}: {
  draft: DonationDraft;
  errors: DonationDraftErrors;
  update: (field: DonationDraftField, value: string | boolean | string[]) => void;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Select label="Saved pickup address" name="addressId" value={draft.addressId} onChange={(event) => update("addressId", event.target.value)} error={errors.addressId} containerClassName="sm:col-span-2" required>
        <option value="address-uiu">UIU Cafeteria pickup — Badda, Dhaka</option>
      </Select>

      <Textarea label="Pickup address" name="pickupAddress" value={draft.pickupAddress} readOnly error={errors.pickupAddress} hint="Manage saved addresses from the donor profile in a later phase." containerClassName="sm:col-span-2" />

      <div className="surface-grid relative min-h-52 overflow-hidden rounded-3xl border border-brand-100 bg-brand-50 p-5 sm:col-span-2">
        <span className="absolute left-[62%] top-[42%] grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-brand-600 text-white shadow-float"><MapPin className="size-6" /></span>
        <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/70 bg-white/90 p-4 shadow-card backdrop-blur">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-600">Map preview placeholder</p>
          <p className="mt-1 font-black text-ink-900">{draft.approximateArea}</p>
          <p className="mt-1 text-xs text-muted-600">Real map routing will be connected with the backend/map phase.</p>
        </div>
      </div>

      <Input label="Contact person" name="contactPerson" value={draft.contactPerson} onChange={(event) => update("contactPerson", event.target.value)} error={errors.contactPerson} leftIcon={<UserRound className="size-5" />} required />
      <Input label="Phone number" name="phone" type="tel" value={draft.phone} onChange={(event) => update("phone", event.target.value)} error={errors.phone} leftIcon={<Phone className="size-5" />} required />
      <Input label="Email (optional)" name="email" type="email" value={draft.email} onChange={(event) => update("email", event.target.value)} error={errors.email} leftIcon={<Mail className="size-5" />} />
      <Input label="Approximate public area" name="approximateArea" value={draft.approximateArea} onChange={(event) => update("approximateArea", event.target.value)} error={errors.approximateArea} leftIcon={<MapPin className="size-5" />} hint="Shown before an NGO claim is accepted." required />

      <Input label="Pickup window starts" name="pickupWindowStart" type="datetime-local" value={draft.pickupWindowStart} onChange={(event) => update("pickupWindowStart", event.target.value)} error={errors.pickupWindowStart} required />
      <Input label="Pickup window ends" name="pickupWindowEnd" type="datetime-local" value={draft.pickupWindowEnd} onChange={(event) => update("pickupWindowEnd", event.target.value)} error={errors.pickupWindowEnd} required />
      <Textarea label="Detailed pickup directions (optional)" name="directions" value={draft.directions} onChange={(event) => update("directions", event.target.value)} placeholder="Gate, floor, counter, or handover instructions." containerClassName="sm:col-span-2" />

      <Alert className="sm:col-span-2" tone="info" title="Private until an authorized rescue" description="Exact pickup address, contact details, and directions remain hidden from global discovery. They are revealed only to the donor, an accepted NGO, an assigned volunteer, or an administrator." />
      <div className="flex items-start gap-2 rounded-2xl bg-canvas p-3 text-xs leading-5 text-muted-600 sm:col-span-2"><Info className="mt-0.5 size-4 shrink-0 text-brand-600" /><p>The pickup window must finish on or before the safe pickup deadline. Inconsistent times block the next step.</p></div>
    </div>
  );
}
