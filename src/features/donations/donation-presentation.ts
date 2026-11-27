import { getUiLocale, displayUiText } from "@/lib/i18n/locale";
import { sampleDonationImage } from "@/lib/sample-donation-images";
import { FoodCategory, DietaryType, StorageCondition, PriorityLevel, QuantityUnit } from "@/lib/constants/domain";
import { DonationStatus } from "@/lib/constants/statuses";
import type { DonationView } from "@/types/domain";

export function donationImageUrl(donation: DonationView) {
  const candidate = donation.photoUrls[0];
  if (candidate && /^\/api\/photos\/[a-f0-9-]{36}$/.test(candidate)) return candidate;
  return sampleDonationImage(donation.sampleImageId)?.url || "/images/no-donation-photo.svg";
}

export function formatDonationDateTime(value: string) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp)
    ? new Intl.DateTimeFormat(getUiLocale(), { dateStyle: "medium", timeStyle: "short" }).format(timestamp)
    : displayUiText("Not available");
}

export function formatDonationDateTimeBn(value: string) {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return displayUiText("অজানা সময়");
  try {
    return new Intl.DateTimeFormat(getUiLocale(), {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(timestamp);
  } catch {
    return formatDonationDateTime(value);
  }
}

export const UNIT_LABELS_BN: Record<QuantityUnit, string> = {
  [QuantityUnit.PORTIONS]: "প্লেট / অংশ",
  [QuantityUnit.MEALS]: "মিল / প্লেট",
  [QuantityUnit.KILOGRAMS]: "কেজি",
  [QuantityUnit.PACKETS]: "প্যাকেট",
  [QuantityUnit.TRAYS]: "ট্রে / ডেকচি",
  [QuantityUnit.LITRES]: "লিটার",
};

export const CATEGORY_LABELS_BN: Record<FoodCategory, string> = {
  [FoodCategory.COOKED_MEAL]: "রান্না করা খাবার",
  [FoodCategory.BAKERY]: "বেকারি ও পেস্ট্রি",
  [FoodCategory.PRODUCE]: "তাজা শাকসবজি / ফল",
  [FoodCategory.GROCERIES]: "প্যাকেটজাত খাদ্য",
  [FoodCategory.DAIRY]: "দুগ্ধজাত পণ্য",
  [FoodCategory.BEVERAGE]: "পানীয় ও জুস",
  [FoodCategory.OTHER]: "অন্যান্য খাবার",
};

export const STORAGE_LABELS_BN: Record<StorageCondition, string> = {
  [StorageCondition.AMBIENT]: "সাধারণ তাপমাত্রা (রুম টেম্পারেচার)",
  [StorageCondition.REFRIGERATED]: "হিমায়িত (রেফ্রিজারেটেড ৪°সে)",
  [StorageCondition.FROZEN]: "ডিপ ফ্রিজ (-১৮°সে)",
  [StorageCondition.HOT_HOLDING]: "গরম অবস্থায় সংরক্ষিত (>৬০°সে)",
};

export const DIETARY_LABELS_BN: Record<DietaryType, string> = {
  [DietaryType.HALAL]: "১০০% হালাল",
  [DietaryType.VEGETARIAN]: "নিরামিষ (ভেজিটেরিয়ান)",
  [DietaryType.VEGAN]: "সম্পূর্ণ উদ্ভিদজাত (ভেগান)",
  [DietaryType.CONTAINS_MEAT]: "আমিষযুক্ত (মাংস/মাছ)",
  [DietaryType.GLUTEN_FREE]: "গ্লুটেন মুক্ত",
  [DietaryType.OTHER]: "অন্যান্য বিশেষ খাদ্য",
};

export const PRIORITY_LABELS_BN: Record<PriorityLevel, string> = {
  [PriorityLevel.LOW]: "স্বাভাবিক",
  [PriorityLevel.MEDIUM]: "মাঝারি",
  [PriorityLevel.HIGH]: "জরুরি অগ্রাধিকার",
  [PriorityLevel.URGENT]: "অতি জরুরি (দ্রুত রেসকিউ)",
};

export const STATUS_TEXT_BN: Record<DonationStatus, string> = {
  [DonationStatus.DRAFT]: "খসড়া তালিকা",
  [DonationStatus.PUBLISHED]: "উদ্বৃত্ত খাবার পোস্টকৃত",
  [DonationStatus.AVAILABLE]: "উদ্ধারের অপেক্ষায়",
  [DonationStatus.RESERVED]: "এনজিও ক্লেইম করেছে",
  [DonationStatus.ASSIGNED]: "ভলান্টিয়ার রাইডার নির্ধারিত",
  [DonationStatus.PICKED_UP]: "খাবার সংগ্রহ সম্পন্ন",
  [DonationStatus.DELIVERED]: "শেল্টারে পৌঁছেছে",
  [DonationStatus.DISTRIBUTED]: "বিতরণ সম্পন্ন",
  [DonationStatus.CANCELLED]: "বাতিলকৃত",
  [DonationStatus.EXPIRED]: "মেয়াদোত্তীর্ণ",
  [DonationStatus.DISPUTED]: "বিরোধ পর্যালোচনায়",
};

export function formatDonationQuantity(donation: DonationView) {
  if (getUiLocale().startsWith("bn")) {
    return formatDonationQuantityBn(donation);
  }
  return `${donation.quantity.value.toLocaleString(getUiLocale())} ${donation.quantity.unit.toLowerCase().replaceAll("_", " ")}`;
}

export function formatDonationQuantityBn(donation: DonationView) {
  const unitBn = UNIT_LABELS_BN[donation.quantity.unit] || donation.quantity.unit;
  return `${donation.quantity.value.toLocaleString(getUiLocale())} ${displayUiText(unitBn)}`;
}

const UNIT_LABELS_EN: Record<QuantityUnit, string> = {
  [QuantityUnit.PORTIONS]: "portions",
  [QuantityUnit.MEALS]: "meals",
  [QuantityUnit.KILOGRAMS]: "kg",
  [QuantityUnit.PACKETS]: "packets",
  [QuantityUnit.TRAYS]: "trays",
  [QuantityUnit.LITRES]: "litres",
};

export function localizeQuantityText(raw: string): string {
  const match = raw.trim().match(/^(\d+(?:[.,]\d+)?)\s+([A-Z_]+)$/i);
  if (!match) return raw;
  const amount = Number(match[1].replaceAll(",", ""));
  const unit = match[2].toUpperCase() as QuantityUnit;
  const locale = getUiLocale();
  const formattedAmount = Number.isFinite(amount) ? amount.toLocaleString(locale) : match[1];
  if (locale.startsWith("bn")) {
    const label = UNIT_LABELS_BN[unit];
    return label ? `${formattedAmount} ${displayUiText(label)}` : `${formattedAmount} ${match[2].toLowerCase().replaceAll("_", " ")}`;
  }
  const enLabel = UNIT_LABELS_EN[unit] || match[2].toLowerCase().replaceAll("_", " ");
  return `${formattedAmount} ${enLabel}`;
}

export function formatDurationMinutes(totalMinutes: number): string {
  const locale = getUiLocale();
  const isBn = locale.startsWith("bn");
  const safeMins = Math.max(0, Math.round(totalMinutes));
  if (safeMins === 0) {
    return isBn ? "০ মিনিট" : "0 min";
  }
  const days = Math.floor(safeMins / 1440);
  const hours = Math.floor((safeMins % 1440) / 60);
  const mins = safeMins % 60;
  const parts: string[] = [];
  if (days > 0) parts.push(`${days.toLocaleString(locale)} ${isBn ? "দিন" : days === 1 ? "day" : "days"}`);
  if (hours > 0) parts.push(`${hours.toLocaleString(locale)} ${isBn ? "ঘণ্টা" : "hr"}`);
  if (mins > 0 || parts.length === 0) parts.push(`${mins.toLocaleString(locale)} ${isBn ? "মিনিট" : "min"}`);
  return parts.join(" ");
}

const CONDITION_LABELS: Record<string, string> = {
  GOOD: "Good",
  ACCEPTABLE: "Acceptable",
  DAMAGED_POOR: "Damaged or poor",
};

export function localizeMissionFeedback(
  feedback: string,
  tx: (text: string, ...args: Array<string | number>) => string,
): string {
  if (!feedback) return feedback;
  const receiptMatch = feedback.match(/^Receipt recorded:\s*(.+)$/i);
  if (receiptMatch) {
    const rawCondition = receiptMatch[1].trim();
    const mapped = CONDITION_LABELS[rawCondition.toUpperCase()] || rawCondition;
    return tx("Receipt recorded: {0}", tx(mapped));
  }
  return tx(feedback);
}

export const TITLE_TRANSLATIONS: Record<string, string> = {
  "Rice, chicken curry, and vegetables": "ভাত, মুরগির মাংসের তরকারি ও তাজা সবজি",
  "Packaged bread and snack boxes": "প্যাকেটজাত রুটি ও নিরামিষ স্ন্যাক্স বক্স",
  "Seasonal fruit and vegetables": "তাজা মৌসুমি ফলমূল ও কাঁচা শাকসবজি",
  "Warm vegetable biryani with egg": "গরম ভেজিটেবল বিরিয়ানি ও সিদ্ধ ডিম",
  "Fresh bakery buns and rolls": "তাজা বেকারি বান ও সুস্বাদু রোলস",
  "Sealed pantry rescue packs": "সিল্ড খাদ্যশস্য, চাল, মসুর ডাল ও তেল প্যাক",
  "Fresh fruit and vegetable crates": "তাজা ফলমূল ও মৌসুমী শাকসবজির ক্র্যাট",
  "Chilled yoghurt cups": "হিমায়িত মিষ্টি ও টক দইয়ের কাপ",
  "Fresh buffet meal boxes": "বুফে লাঞ্চ মিল বক্স (চিকেন, রাইস ও ডাল)",
  "Mutton kacchi biryani and chicken roast portions": "খাসির ঐতিহ্যবাহী কাচ্চি বিরিয়ানি ও চিকেন রোস্ট",
  "Bhuna khichuri, boiled eggs, and vegetable curry": "গরম ভুনা খিচুড়ি, ডিম ভুনা ও মিক্সড সবজি",
  "Fresh chicken patties, vegetable rolls, and sweet buns": "তাজা চিকেন প্যাটিস, ভেজিটেবল রোল ও মিষ্টি বান",
  "Farm fresh carrots, potatoes, tomatoes, and ripe bananas": "তাজা গাজর, আলু, টমেটো ও পাকা কলার ক্র্যাট",
  "Steamed aromatic rice, lentils, and fresh fish curry": "সুগন্ধি ভাত, ঘন মসুর ডাল ও তাজা রুই মাছের ঝোল",
  "Chicken biryani portions": "চিকেন বিরিয়ানি ও ডিমের পুষ্টিকর অংশ",
};

export const DONOR_ORGANIZATION_TRANSLATIONS: Record<string, string> = {
  "UIU Cafeteria": "UIU সেন্ট্রাল ক্যাফেটেরিয়া",
  "Banani Breadworks": "বনানী ব্রেডওয়ার্কস অ্যান্ড ক্যাফে",
  "Badda Community Bites": "বাড্ডা কমিউনিটি কিচেন",
  "Hope Foundation": "মাস্তুল ফাউন্ডেশন",
};

export function getDonationTitleBn(title?: string): string {
  if (!title) return "";
  return title;
}

export function getDonorOrganizationBn(org?: string): string {
  if (!org) return "";
  return org;
}
