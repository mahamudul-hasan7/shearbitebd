"use client";

import { CalendarClock, PackageOpen, Utensils } from "lucide-react";
import { AiSpoilageMeter } from "@/components/donation/ai-spoilage-meter";
import { FoodPhotoDropzone } from "@/components/donation/food-photo-dropzone";
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

const quantityUnitLabelsBn: Record<QuantityUnit, string> = {
  [QuantityUnit.PORTIONS]: "প্যাকেট / প্লেট (Portions)",
  [QuantityUnit.MEALS]: "মিলস (Meals)",
  [QuantityUnit.KILOGRAMS]: "কেজি (Kilograms)",
  [QuantityUnit.PACKETS]: "প্যাকেট (Boxes)",
  [QuantityUnit.TRAYS]: "ট্রে / ডেকচি (Trays)",
  [QuantityUnit.LITRES]: "লিটার (Litres)",
};

const dietaryLabelsBn: Record<DietaryType, string> = {
  [DietaryType.HALAL]: "১০০% হালাল খাদ্য (Halal)",
  [DietaryType.VEGETARIAN]: "সম্পূর্ণ নিরামিষ (Vegetarian)",
  [DietaryType.VEGAN]: "ভেগান (Vegan)",
  [DietaryType.CONTAINS_MEAT]: "আমিষযুক্ত - মাংস/মাছ (Contains Meat)",
  [DietaryType.GLUTEN_FREE]: "গ্লুটেন-মুক্ত (Gluten-Free)",
  [DietaryType.OTHER]: "অন্যান্য বিশেষ খাদ্য শ্রেণি (Other)",
};

export function FoodDetailsStep({
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
      {/* 1. Food Title */}
      <Input
        label="খাদ্যের শিরোনাম"
        name="title"
        value={draft.title}
        onChange={(event) => update("title", event.target.value)}
        error={errors.title}
        placeholder="যেমন: চিকেন কাচ্চি বিরিয়ানি, ডিম ও বোরহানি"
        leftIcon={<PackageOpen className="size-5" />}
        containerClassName="sm:col-span-2"
        required
      />

      {/* 2. Category & Dietary Type */}
      <Select
        label="খাবারের ক্যাটাগরি"
        name="category"
        value={draft.category}
        onChange={(event) => update("category", event.target.value)}
      >
        {Object.values(FoodCategory).map((category) => (
          <option key={category} value={category}>
            {FOOD_CATEGORY_LABELS[category]}
          </option>
        ))}
      </Select>

      <Select
        label="খাদ্যাভ্যাস শ্রেণি"
        name="dietaryType"
        value={draft.dietaryType}
        onChange={(event) => update("dietaryType", event.target.value)}
      >
        {Object.values(DietaryType).map((dietaryType) => (
          <option key={dietaryType} value={dietaryType}>
            {dietaryLabelsBn[dietaryType] ?? DIETARY_TYPE_LABELS[dietaryType]}
          </option>
        ))}
      </Select>

      {/* 3. Quantity & Unit */}
      <Input
        label="খাবারের পরিমাণ"
        name="quantity"
        type="number"
        min="0.1"
        step="0.1"
        inputMode="decimal"
        value={draft.quantity}
        onChange={(event) => update("quantity", event.target.value)}
        error={errors.quantity}
        placeholder="যেমন: ৪০"
        leftIcon={<Utensils className="size-5" />}
        required
      />

      <Select
        label="পরিমাপের একক"
        name="quantityUnit"
        value={draft.quantityUnit}
        onChange={(event) => update("quantityUnit", event.target.value)}
      >
        {Object.values(QuantityUnit).map((unit) => (
          <option key={unit} value={unit}>
            {quantityUnitLabelsBn[unit] ?? unit}
          </option>
        ))}
      </Select>

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

      {/* 5. Times and Preservation */}
      <Input
        label="রান্না বা প্রস্তুতির সময়"
        name="preparationTime"
        type="datetime-local"
        value={draft.preparationTime}
        onChange={(event) => update("preparationTime", event.target.value)}
        error={errors.preparationTime}
        leftIcon={<CalendarClock className="size-5" />}
        hint="খাবারটি কখন কিচেনে রান্না বা প্রস্তুত শেষ হয়েছে।"
        required
      />

      <Input
        label="নিরাপদ ব্যবহারের শেষ সময় (Safe Until)"
        name="safePickupDeadline"
        type="datetime-local"
        value={draft.safePickupDeadline}
        onChange={(event) => update("safePickupDeadline", event.target.value)}
        error={errors.safePickupDeadline}
        hint="BFSA হাইজিন অনুযায়ী খাবারটি যে সময়ের মধ্যে বিতরণ করতে হবে।"
        leftIcon={<CalendarClock className="size-5" />}
        required
      />

      <Select
        label="তাপমাত্রা ও সংরক্ষণ অবস্থা"
        name="storageCondition"
        value={draft.storageCondition}
        onChange={(event) => update("storageCondition", event.target.value)}
      >
        {Object.values(StorageCondition).map((condition) => (
          <option key={condition} value={condition}>
            {STORAGE_CONDITION_LABELS[condition]}
          </option>
        ))}
      </Select>

      <Select
        label="খাদ্যের প্যাকেজিং ও অবস্থা"
        name="foodCondition"
        value={draft.foodCondition}
        onChange={(event) => update("foodCondition", event.target.value)}
      >
        <option value="FRESHLY_PREPARED">সদ্য রান্না করা তাজা খাবার (Freshly Prepared)</option>
        <option value="SAME_DAY">আজকের প্রস্তুতকৃত খাবার (Prepared Today)</option>
        <option value="PACKAGED">ইনসুলেটেড বাক্সে সিলযুক্ত (Sealed / Packaged)</option>
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

      {/* 7. Allergen, Description, Special Instructions */}
      <Textarea
        label="অ্যালার্জেন সতর্কতা"
        name="allergenInfo"
        value={draft.allergenInfo}
        onChange={(event) => update("allergenInfo", event.target.value)}
        error={errors.allergenInfo}
        placeholder="যেমন: দুধ, ডিম, চীনাবাদাম অথবা ‘কোনোটি নেই’ লিখুন"
        containerClassName="sm:col-span-2"
        required
      />

      <Textarea
        label="খাবারের বিস্তারিত বিবরণ ও প্যাকেজিং"
        name="description"
        value={draft.description}
        onChange={(event) => update("description", event.target.value)}
        error={errors.description}
        placeholder="মেনুর ধরন, কয়টি বাটিতে রাখা হয়েছে এবং খাবার প্যাকেজিংয়ের বিস্তারিত লিখুন..."
        containerClassName="sm:col-span-2"
        required
      />

      <Textarea
        label="বিশেষ পিকআপ বা হ্যান্ডওভার নির্দেশনা (ঐচ্ছিক)"
        name="specialInstructions"
        value={draft.specialInstructions}
        onChange={(event) => update("specialInstructions", event.target.value)}
        placeholder="যেমন: ৩য় তলার সার্ভিস লিফট ব্যবহার করুন বা কিচেন ম্যানেজারকে ফোন দিন..."
        containerClassName="sm:col-span-2"
      />

      {/* 8. Modern Photo Dropzone */}
      <FoodPhotoDropzone
        photoNames={draft.photoNames}
        onPhotosChange={(photos) => update("photoNames", photos)}
        maxFiles={5}
        className="sm:col-span-2"
      />
    </div>
  );
}
