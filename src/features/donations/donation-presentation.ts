import type { DonationView } from "@/types/domain";

export function donationImageUrl(donation: DonationView) {
  const candidate = donation.photoUrls[0];
  return candidate?.startsWith("/images/") ? candidate : "/images/donor-active-meal.png";
}

export function formatDonationDateTime(value: string) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp)
    ? new Intl.DateTimeFormat("en-BD", { dateStyle: "medium", timeStyle: "short" }).format(timestamp)
    : "Not available";
}

export function formatDonationQuantity(donation: DonationView) {
  return `${donation.quantity.value} ${donation.quantity.unit.toLowerCase().replaceAll("_", " ")}`;
}
