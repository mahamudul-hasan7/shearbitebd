import { CalendarClock, PackageOpen } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
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

const quantityUnitLabels: Record<QuantityUnit, string> = {
  [QuantityUnit.PORTIONS]: "Portions",
  [QuantityUnit.MEALS]: "Meals",
  [QuantityUnit.KILOGRAMS]: "Kilograms",
  [QuantityUnit.PACKETS]: "Packets",
  [QuantityUnit.TRAYS]: "Trays",
  [QuantityUnit.LITRES]: "Litres",
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
      <Input label="Food title" name="title" value={draft.title} onChange={(event) => update("title", event.target.value)} error={errors.title} placeholder="Rice, chicken curry, and vegetables" leftIcon={<PackageOpen className="size-5" />} containerClassName="sm:col-span-2" required />

      <Select label="Food category" name="category" value={draft.category} onChange={(event) => update("category", event.target.value)}>
        {Object.values(FoodCategory).map((category) => <option key={category} value={category}>{FOOD_CATEGORY_LABELS[category]}</option>)}
      </Select>
      <Select label="Dietary type" name="dietaryType" value={draft.dietaryType} onChange={(event) => update("dietaryType", event.target.value)}>
        {Object.values(DietaryType).map((dietaryType) => <option key={dietaryType} value={dietaryType}>{DIETARY_TYPE_LABELS[dietaryType]}</option>)}
      </Select>

      <Input label="Quantity" name="quantity" type="number" min="0.1" step="0.1" value={draft.quantity} onChange={(event) => update("quantity", event.target.value)} error={errors.quantity} placeholder="40" required />
      <Select label="Quantity unit" name="quantityUnit" value={draft.quantityUnit} onChange={(event) => update("quantityUnit", event.target.value)}>
        {Object.values(QuantityUnit).map((unit) => <option key={unit} value={unit}>{quantityUnitLabels[unit]}</option>)}
      </Select>

      <Input label="Preparation date and time" name="preparationTime" type="datetime-local" value={draft.preparationTime} onChange={(event) => update("preparationTime", event.target.value)} error={errors.preparationTime} leftIcon={<CalendarClock className="size-5" />} required />
      <Input label="Safe pickup deadline" name="safePickupDeadline" type="datetime-local" value={draft.safePickupDeadline} onChange={(event) => update("safePickupDeadline", event.target.value)} error={errors.safePickupDeadline} hint="A traceability deadline—not a medical freshness guarantee." leftIcon={<CalendarClock className="size-5" />} required />

      <Select label="Storage condition" name="storageCondition" value={draft.storageCondition} onChange={(event) => update("storageCondition", event.target.value)}>
        {Object.values(StorageCondition).map((condition) => <option key={condition} value={condition}>{STORAGE_CONDITION_LABELS[condition]}</option>)}
      </Select>
      <Select label="Food condition" name="foodCondition" value={draft.foodCondition} onChange={(event) => update("foodCondition", event.target.value)}>
        <option value="FRESHLY_PREPARED">Freshly prepared</option>
        <option value="SAME_DAY">Prepared today</option>
        <option value="PACKAGED">Sealed / packaged</option>
      </Select>

      <Textarea label="Allergen information" name="allergenInfo" value={draft.allergenInfo} onChange={(event) => update("allergenInfo", event.target.value)} error={errors.allergenInfo} placeholder="Milk, egg, nuts — or enter ‘None known’" containerClassName="sm:col-span-2" required />
      <Textarea label="Food description" name="description" value={draft.description} onChange={(event) => update("description", event.target.value)} error={errors.description} placeholder="Describe preparation, packaging, portion size, and visible condition." containerClassName="sm:col-span-2" required />
      <Textarea label="Special instructions (optional)" name="specialInstructions" value={draft.specialInstructions} onChange={(event) => update("specialInstructions", event.target.value)} placeholder="Insulated carrier, tray return, access instructions..." containerClassName="sm:col-span-2" />

      <FileUpload
        label="Food photos (optional, up to 5)"
        name="foodPhotos"
        accept="image/jpeg,image/png,image/webp"
        multiple
        maxFiles={5}
        maxSizeMb={5}
        fileNames={draft.photoNames}
        onFilesChange={(files) => update("photoNames", files.map((file) => file.name))}
        hint="JPG, PNG, or WebP. Maximum 5 MB each. Files are not uploaded in this frontend demo."
        className="sm:col-span-2"
      />
    </div>
  );
}
