"use client";
import { useUiText } from "@/lib/i18n/use-ui-text";

import { LocationMap } from "@/components/maps/location-map";
import { ButtonLink } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { CalendarClock, Mail, MapPin, Phone, ShieldCheck, UserRound } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { DonationDraft, DonationDraftErrors, DonationDraftField } from "@/features/donations/types";
import type { Address } from "@/types/domain";

export function PickupInformationStep({
  draft,
  errors,
  update,
  addresses,
}: {
  draft: DonationDraft;
  errors: DonationDraftErrors;
  update: (field: DonationDraftField, value: string | boolean | string[]) => void;
  addresses: Address[];
}) {
  const tx = useUiText();
  const address = addresses.find((item) => item.id === draft.addressId);
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Select
        label={tx("সংরক্ষিত পিকআপ ঠিকানা বেছে নিন")}
        name="addressId"
        value={draft.addressId}
        onChange={(event) => update("addressId", event.target.value)}
        error={tx(errors.addressId)}
        containerClassName="sm:col-span-2"
        required
      >
        {addresses.map((address) => <option key={address.id} value={address.id}>{address.label} — {address.addressLine}</option>)}
      </Select>

      <Textarea
        label={tx("সম্পূর্ণ পিকআপ ঠিকানা")}
        name="pickupAddress"
        value={draft.pickupAddress}
        readOnly
        error={tx(errors.pickupAddress)}
        hint={tx("প্রোফাইল থেকে আপনার প্রতিষ্ঠানের সংরক্ষিত ঠিকানাগুলো পরিচালনা করতে পারেন।")}
        containerClassName="sm:col-span-2"
      />

      <div className="grid gap-3 sm:col-span-2">
        {address?.coordinates ? <LocationMap points={[{ id: "pickup", coordinates: address.coordinates, label: address.label, description: address.addressLine }]} label={tx("Saved pickup location")} /> : <Alert tone="warning" title={tx("Pickup pin not set")} description={tx("এই ঠিকানা text হিসেবে ব্যবহার হবে। Map-এ দেখাতে আগে saved address-এ location pin দিন।")} />}
        <p className="text-xs text-muted-600">{tx("NGO claim করার আগে আনুমানিক এলাকা দেখবে। Claim-এর পরে সঠিক pickup pin দেখা যাবে।")}</p>
        <ButtonLink href={ROUTES.donor.addresses} variant="outline" size="sm" target="_blank" rel="noopener noreferrer">{tx("Manage address location pins ↗")}</ButtonLink>
      </div>

      <Input
        label={tx("দায়িত্বপ্রাপ্ত ব্যক্তির নাম")}
        name="contactPerson"
        autoComplete="name"
        value={draft.contactPerson}
        onChange={(event) => update("contactPerson", event.target.value)}
        error={tx(errors.contactPerson)}
        placeholder={tx("যেমন: আসিফ ইকবাল (সুপারভাইজার)")}
        leftIcon={<UserRound className="size-5" />}
        required
      />

      <Input
        label={tx("জরুরি মোবাইল নম্বর")}
        name="phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        value={draft.phone}
        onChange={(event) => update("phone", event.target.value)}
        error={tx(errors.phone)}
        placeholder={tx("+880 17XXXXXXXX")}
        leftIcon={<Phone className="size-5" />}
        required
      />

      <Input
        label={tx("অফিসিয়াল ইমেইল (ঐচ্ছিক)")}
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        value={draft.email}
        onChange={(event) => update("email", event.target.value)}
        error={tx(errors.email)}
        placeholder="cafeteria@uiu.ac.bd"
        leftIcon={<Mail className="size-5" />}
      />

      <Input
        label={tx("সার্বজনীন প্রদর্শিত এলাকা")}
        name="approximateArea"
        value={draft.approximateArea}
        onChange={(event) => update("approximateArea", event.target.value)}
        error={tx(errors.approximateArea)}
        placeholder={tx("যেমন: বাড্ডা, ১০০ ফিট রোড")}
        leftIcon={<MapPin className="size-5" />}
        hint={tx("এনজিও ক্লেইম গ্রহণের পূর্বে শুধুমাত্র সাধারণ এলাকাটি ফিডে দেখা যাবে।")}
        required
      />

      <Input
        label={tx("পিকআপ শুরুর সময়")}
        name="pickupWindowStart"
        type="datetime-local"
        value={draft.pickupWindowStart}
        onChange={(event) => update("pickupWindowStart", event.target.value)}
        error={tx(errors.pickupWindowStart)}
        leftIcon={<CalendarClock className="size-5" />}
        required
      />

      <div className="space-y-1.5">
        <Input
          label={tx("পিকআপ শেষের সময়")}
          name="pickupWindowEnd"
          type="datetime-local"
          value={draft.pickupWindowEnd}
          onChange={(event) => update("pickupWindowEnd", event.target.value)}
          error={tx(errors.pickupWindowEnd)}
          leftIcon={<CalendarClock className="size-5" />}
          hint={
            draft.safePickupDeadline ? tx("খাবারের নিরাপদ মেয়াদ (Safe Until): {0}। পিকআপ এর আগে শেষ হতে হবে।", draft.safePickupDeadline.replace("T", " ")) : tx("খাবার নষ্ট হওয়ার আগেই পিকআপ সম্পন্ন করতে হবে।")
          }
          required
        />
        {draft.safePickupDeadline && (
          <button
            type="button"
            onClick={() => update("pickupWindowEnd", draft.safePickupDeadline)}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
          >
            {tx("নিরাপদ মেয়াদের সাথে মিলিয়ে দিন (")}{draft.safePickupDeadline.replace("T", " ")})
          </button>
        )}
      </div>

      <Textarea
        label={tx("পিকআপ পয়েন্টের বিস্তারিত নির্দেশনা (ঐচ্ছিক)")}
        name="directions"
        value={draft.directions}
        onChange={(event) => update("directions", event.target.value)}
        placeholder={tx("যেমন: ভবনের উত্তর পাশের সার্ভিস গেট দিয়ে ঢুকে লিফটের ৩ চেপে কিচেনে আসুন...")}
        containerClassName="sm:col-span-2"
      />

      <div className="sm:col-span-2 flex items-start gap-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-4 text-xs leading-relaxed text-emerald-950 font-medium">
        <ShieldCheck className="size-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <strong className="block text-slate-900 font-heading">{tx("গোপনীয়তা ও নিরাপত্তা গ্যারান্টি")}</strong>
          {tx("আপনার সঠিক মোবাইল নম্বর ও সম্পূর্ণ কিচেন ঠিকানা সবার সামনে উন্মুক্ত হবে না। অনুমোদিত এনজিও খাবার ক্লেইম করলে এবং ভলান্টিয়ারের ওটিপি মিললেই কেবল তারা এটি দেখতে পাবে।")}</div>
      </div>

      <Textarea
        label={tx("বিশেষ পিকআপ বা হ্যান্ডওভার নির্দেশনা (ঐচ্ছিক)")}
        name="specialInstructions"
        value={draft.specialInstructions}
        onChange={(event) => update("specialInstructions", event.target.value)}
        placeholder={tx("যেমন: ৩য় তলার সার্ভিস লিফট ব্যবহার করুন বা কিচেন ম্যানেজারকে ফোন দিন...")}
        containerClassName="sm:col-span-2"
      />
    </div>
  );
}
