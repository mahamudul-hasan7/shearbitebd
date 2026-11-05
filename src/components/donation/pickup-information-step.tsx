"use client";

import { CalendarClock, Info, Mail, MapPin, Phone, ShieldCheck, UserRound } from "lucide-react";
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
      <Select
        label="সংরক্ষিত পিকআপ ঠিকানা বেছে নিন"
        name="addressId"
        value={draft.addressId}
        onChange={(event) => update("addressId", event.target.value)}
        error={errors.addressId}
        containerClassName="sm:col-span-2"
        required
      >
        <option value="address-uiu">UIU সেন্ট্রাল ক্যাফেটেরিয়া — ইউনাইটেড সিটি, বাড্ডা, ঢাকা-১২১২</option>
      </Select>

      <Textarea
        label="সম্পূর্ণ পিকআপ ঠিকানা"
        name="pickupAddress"
        value={draft.pickupAddress}
        readOnly
        error={errors.pickupAddress}
        hint="প্রোফাইল থেকে আপনার প্রতিষ্ঠানের সংরক্ষিত ঠিকানাগুলো পরিচালনা করতে পারেন।"
        containerClassName="sm:col-span-2"
      />

      {/* Visual Map Radar Card */}
      <div className="relative min-h-48 overflow-hidden rounded-3xl border border-emerald-900/10 bg-gradient-to-br from-[#02241b] to-[#011610] p-5 sm:col-span-2 text-white">
        <div className="absolute inset-0 dark-surface-grid opacity-35" />
        <span className="absolute left-[58%] top-[40%] grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-500/30 animate-pulse">
          <MapPin className="size-6" />
        </span>
        <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/20 bg-black/60 p-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
            <p className="text-xs font-black uppercase tracking-wider text-emerald-300 font-heading">
              লাইভ পিকআপ রাডার
            </p>
          </div>
          <p className="mt-1 font-bold text-sm text-white font-heading">{draft.approximateArea || "বাড্ডা ও আফতাবনগর জোন"}</p>
          <p className="mt-0.5 text-[11px] text-emerald-200/70">
            নিকটস্থ নিবন্ধিত এনজিও ও ভলান্টিয়ার রাইডাররা এই জোন অনুযায়ী স্বয়ংক্রিয় রুট নোটিফিকেশন পাবে।
          </p>
        </div>
      </div>

      <Input
        label="দায়িত্বপ্রাপ্ত ব্যক্তির নাম"
        name="contactPerson"
        value={draft.contactPerson}
        onChange={(event) => update("contactPerson", event.target.value)}
        error={errors.contactPerson}
        placeholder="যেমন: আসিফ ইকবাল (সুপারভাইজার)"
        leftIcon={<UserRound className="size-5" />}
        required
      />

      <Input
        label="জরুরি মোবাইল নম্বর"
        name="phone"
        type="tel"
        value={draft.phone}
        onChange={(event) => update("phone", event.target.value)}
        error={errors.phone}
        placeholder="+880 17XXXXXXXX"
        leftIcon={<Phone className="size-5" />}
        required
      />

      <Input
        label="অফিসিয়াল ইমেইল (ঐচ্ছিক)"
        name="email"
        type="email"
        value={draft.email}
        onChange={(event) => update("email", event.target.value)}
        error={errors.email}
        placeholder="cafeteria@uiu.ac.bd"
        leftIcon={<Mail className="size-5" />}
      />

      <Input
        label="সার্বজনীন প্রদর্শিত এলাকা"
        name="approximateArea"
        value={draft.approximateArea}
        onChange={(event) => update("approximateArea", event.target.value)}
        error={errors.approximateArea}
        placeholder="যেমন: বাড্ডা, ১০০ ফিট রোড"
        leftIcon={<MapPin className="size-5" />}
        hint="এনজিও ক্লেইম গ্রহণের পূর্বে শুধুমাত্র সাধারণ এলাকাটি ফিডে দেখা যাবে।"
        required
      />

      <Input
        label="পিকআপ শুরুর সময়"
        name="pickupWindowStart"
        type="datetime-local"
        value={draft.pickupWindowStart}
        onChange={(event) => update("pickupWindowStart", event.target.value)}
        error={errors.pickupWindowStart}
        leftIcon={<CalendarClock className="size-5" />}
        required
      />

      <Input
        label="পিকআপ শেষের সময়"
        name="pickupWindowEnd"
        type="datetime-local"
        value={draft.pickupWindowEnd}
        onChange={(event) => update("pickupWindowEnd", event.target.value)}
        error={errors.pickupWindowEnd}
        leftIcon={<CalendarClock className="size-5" />}
        required
      />

      <Textarea
        label="পিকআপ পয়েন্টের বিস্তারিত নির্দেশনা (ঐচ্ছিক)"
        name="directions"
        value={draft.directions}
        onChange={(event) => update("directions", event.target.value)}
        placeholder="যেমন: ভবনের উত্তর পাশের সার্ভিস গেট দিয়ে ঢুকে লিফটের ৩ চেপে কিচেনে আসুন..."
        containerClassName="sm:col-span-2"
      />

      <div className="sm:col-span-2 flex items-start gap-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-4 text-xs leading-relaxed text-emerald-950 font-medium">
        <ShieldCheck className="size-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <strong className="block text-slate-900 font-heading">গোপনীয়তা ও নিরাপত্তা গ্যারান্টি</strong>
          আপনার সঠিক মোবাইল নম্বর ও সম্পূর্ণ কিচেন ঠিকানা সবার সামনে উন্মুক্ত হবে না। অনুমোদিত এনজিও খাবার ক্লেইম করলে এবং ভলান্টিয়ারের ওটিপি মিললেই কেবল তারা এটি দেখতে পাবে।
        </div>
      </div>
    </div>
  );
}