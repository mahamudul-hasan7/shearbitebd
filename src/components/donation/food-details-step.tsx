"use client";
import { useUiText } from "@/lib/i18n/use-ui-text";

import Image from "next/image";
import styles from "./donation-form.module.css";
import { SAMPLE_DONATION_IMAGES } from "@/lib/sample-donation-images";
import { CalendarClock, ChevronDown, PackageOpen, Utensils } from "lucide-react";
import { AiSpoilageMeter } from "@/components/donation/ai-spoilage-meter";
import { PhotoUpload } from "@/components/ui/photo-upload";
import { SmartQuantityConverter } from "@/components/donation/smart-quantity-converter";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { DonationDraft, DonationDraftErrors, DonationDraftField } from "@/features/donations/types";
import {
  DietaryType,
  DIETARY_TYPE_LABELS,
  FoodCategory,
  FOOD_CATEGORY_LABELS,
  QuantityUnit,
  StorageCondition,
  STORAGE_CONDITION_LABELS,
} from "@/lib/constants/domain";

export function FoodDetailsStep({
  draft,
  part,
  errors,
  update,
  onUploadBusyChange,
}: {
  draft: DonationDraft;
  part: "food" | "time" | "photos";
  onUploadBusyChange?: (busy: boolean) => void;
  errors: DonationDraftErrors;
  update: (field: DonationDraftField, value: string | boolean | string[]) => void;
}) {
  const tx = useUiText();
  const selectedSample = SAMPLE_DONATION_IMAGES.find((sample) => sample.id === draft.sampleImageId);
  return (
    <div className={styles.fields}>
      {part === "food" && <section className={styles.fieldSection} aria-labelledby="food-quantity-heading">
        <h3 id="food-quantity-heading">{tx("Food and quantity")}</h3><div className={styles.fieldGrid}>
      {/* 1. Food Title */}
      <Input
        label={tx("খাদ্যের শিরোনাম")}
        name="title"
        value={draft.title}
        onChange={(event) => update("title", event.target.value)}
        error={tx(errors.title)}
        placeholder={tx("যেমন: চিকেন কাচ্চি বিরিয়ানি, ডিম ও বোরহানি")}
        leftIcon={<PackageOpen className="size-5" />}
        containerClassName="sm:col-span-2"
        required
      />

      <div className={styles.pair}>
      {/* 2. Category & Dietary Type */}
      <Select
        label={tx("খাবারের ক্যাটাগরি")}
        name="category"
        value={draft.category}
        onChange={(event) => update("category", event.target.value)}
      >
        {Object.values(FoodCategory).map((category) => (
          <option key={category} value={category}>
            {tx(FOOD_CATEGORY_LABELS[category])}
          </option>
        ))}
      </Select>

      <Select
        label={tx("খাদ্যাভ্যাস শ্রেণি")}
        name="dietaryType"
        value={draft.dietaryType}
        onChange={(event) => update("dietaryType", event.target.value)}
      >
        {Object.values(DietaryType).map((dietaryType) => (
          <option key={dietaryType} value={dietaryType}>
            {tx(DIETARY_TYPE_LABELS[dietaryType])}
          </option>
        ))}
      </Select>

      </div><div className={styles.pair}>
      {/* 3. Quantity & Unit */}
      <Input
        label={tx("খাবারের পরিমাণ")}
        name="quantity"
        type="number"
        min="0.1"
        step="0.1"
        inputMode="decimal"
        value={draft.quantity}
        onChange={(event) => update("quantity", event.target.value)}
        error={tx(errors.quantity)}
        placeholder={tx("যেমন: ৪০")}
        leftIcon={<Utensils className="size-5" />}
        required
      />

      <Select
        label={tx("পরিমাপের একক")}
        name="quantityUnit"
        value={draft.quantityUnit}
        onChange={(event) => update("quantityUnit", event.target.value)}
      >
        {Object.values(QuantityUnit).map((unit) => (
          <option key={unit} value={unit}>
            {tx(unit)}
          </option>
        ))}
      </Select>

      </div>
      {/* 4. Smart Quantity Converter & Preset Pills */}
      <div className="sm:col-span-2">
        <SmartQuantityConverter
          quantity={draft.quantity}
          quantityUnit={draft.quantityUnit}
          onSelectPreset={(qty, unit) => {
            update("quantity", qty);
            update("quantityUnit", unit);
          }}
        />
      </div>

      </div></section>}
      {part === "time" && <section className={styles.fieldSection} aria-labelledby="food-time-heading">
        <h3 id="food-time-heading">{tx("Time and storage")}</h3><div className={styles.fieldGrid}>
      {/* 5. Times and Preservation */}
      <Input
        label={tx("রান্না বা প্রস্তুতির সময়")}
        name="preparationTime"
        type="datetime-local"
        value={draft.preparationTime}
        onChange={(event) => update("preparationTime", event.target.value)}
        error={tx(errors.preparationTime)}
        leftIcon={<CalendarClock className="size-5" />}
        hint={tx("খাবারটি কখন কিচেনে রান্না বা প্রস্তুত শেষ হয়েছে।")}
        required
      />

      <Input
        label={tx("নিরাপদ ব্যবহারের শেষ সময় (Safe Until)")}
        name="safePickupDeadline"
        type="datetime-local"
        value={draft.safePickupDeadline}
        onChange={(event) => update("safePickupDeadline", event.target.value)}
        error={tx(errors.safePickupDeadline)}
        hint={tx("BFSA হাইজিন অনুযায়ী খাবারটি যে সময়ের মধ্যে বিতরণ করতে হবে।")}
        leftIcon={<CalendarClock className="size-5" />}
        required
      />

      <Select
        label={tx("তাপমাত্রা ও সংরক্ষণ অবস্থা")}
        name="storageCondition"
        value={draft.storageCondition}
        onChange={(event) => update("storageCondition", event.target.value)}
      >
        {Object.values(StorageCondition).map((condition) => (
          <option key={condition} value={condition}>
            {tx(STORAGE_CONDITION_LABELS[condition])}
          </option>
        ))}
      </Select>

      <Select
        label={tx("খাদ্যের প্যাকেজিং ও অবস্থা")}
        name="foodCondition"
        value={draft.foodCondition}
        onChange={(event) => update("foodCondition", event.target.value)}
      >
        <option value="FRESHLY_PREPARED">{tx("সদ্য রান্না করা তাজা খাবার (Freshly Prepared)")}</option>
        <option value="SAME_DAY">{tx("আজকের প্রস্তুতকৃত খাবার (Prepared Today)")}</option>
        <option value="PACKAGED">{tx("ইনসুলেটেড বাক্সে সিলযুক্ত (Sealed / Packaged)")}</option>
      </Select>

      {/* 6. AI Spoilage & Food Safety Meter */}
      <div className="sm:col-span-2">
        <AiSpoilageMeter
          category={draft.category}
          storageCondition={draft.storageCondition}
          foodCondition={draft.foodCondition}
          preparationTime={draft.preparationTime}
          safePickupDeadline={draft.safePickupDeadline}
          onSyncCurrentTime={(newPrepTime, newDeadline) => {
            update("preparationTime", newPrepTime);
            update("safePickupDeadline", newDeadline);
            update("pickupWindowStart", newPrepTime);
            update("pickupWindowEnd", newDeadline);
          }}
        />
      </div>

      </div></section>}
      {part === "food" && <section className={styles.fieldSection} aria-labelledby="food-notes-heading">
        <h3 id="food-notes-heading">{tx("Food details and notes")}</h3><div className={styles.fieldGrid}>
      {/* 7. Allergen, Description, Special Instructions */}
      <Textarea
        label={tx("অ্যালার্জেন সতর্কতা")}
        name="allergenInfo"
        value={draft.allergenInfo}
        onChange={(event) => update("allergenInfo", event.target.value)}
        error={tx(errors.allergenInfo)}
        placeholder={tx("যেমন: দুধ, ডিম, চীনাবাদাম অথবা ‘কোনোটি নেই’ লিখুন")}
        containerClassName="sm:col-span-2"
        required
      />

      <Textarea
        label={tx("খাবারের বিস্তারিত বিবরণ ও প্যাকেজিং")}
        name="description"
        value={draft.description}
        onChange={(event) => update("description", event.target.value)}
        error={tx(errors.description)}
        placeholder={tx("মেনুর ধরন, কয়টি বাটিতে রাখা হয়েছে এবং খাবার প্যাকেজিংয়ের বিস্তারিত লিখুন...")}
        containerClassName="sm:col-span-2"
        required
      />



      </div></section>}
      {part === "photos" && <section className={styles.fieldSection} aria-labelledby="food-photos-heading">
        <h3 id="food-photos-heading">{tx("Photos (optional)")}</h3><div className={styles.fieldGrid}>
      {/* 8. Modern Photo Dropzone */}
      <PhotoUpload
        label={tx("খাবারের ছবি (ঐচ্ছিক)")}
        purpose="DONATION"
        urls={draft.photoUrls}
        onChange={(urls) => update("photoUrls", urls)}
        onBusyChange={onUploadBusyChange}
        className="sm:col-span-2"
      />
      <details className={styles.samples} data-testid="sample-image-picker"><summary><span>{selectedSample ? tx("Sample selected: {0}", tx(selectedSample.label)) : tx("Choose a sample image")}</span><ChevronDown size={16} aria-hidden="true" /></summary>
      <section className="grid gap-3 sm:col-span-2" aria-label={tx("Sample food images")}>
        <h3 className="text-sm font-bold">{tx("Sample image (ঐচ্ছিক)")}</h3>
        <p className="text-xs text-muted-600">{tx("Demo-এর জন্য একটি উদাহরণ ছবি বেছে নিতে পারেন। Donation-এ “Sample image” label দেখাবে। নিজের ছবি upload করলে sample selection সরে যাবে।")}</p>
        <div className="grid grid-cols-2 gap-3">{SAMPLE_DONATION_IMAGES.map((sample) => <button key={sample.id} type="button" aria-label={tx("Use sample image: {0}", tx(sample.label))} aria-pressed={draft.sampleImageId === sample.id} disabled={draft.photoUrls.length > 0} onClick={() => update("sampleImageId", sample.id)} className={`overflow-hidden rounded-2xl border-2 text-left disabled:opacity-40 ${draft.sampleImageId === sample.id ? "border-emerald-600 bg-emerald-50" : "border-slate-200"}`}><Image src={sample.url} alt={tx("Sample: {0}", tx(sample.label))} width={400} height={240} className="aspect-[5/3] w-full object-cover" /><span className="block p-3 text-xs font-bold">{tx(sample.label)} {" "}{tx("· Sample")}</span></button>)}</div>
        {draft.sampleImageId && <button type="button" onClick={() => update("sampleImageId", "")} className="justify-self-start text-xs font-semibold text-emerald-800 underline">{tx("Remove sample image")}</button>}
        {draft.photoUrls.length > 0 && <p className="text-xs text-muted-600">{tx("নিজের ছবির পরিবর্তে sample ব্যবহার করতে আগে uploaded photo সরান।")}</p>}
      </section>
      </details>
      </div></section>}


    </div>
  );
}
