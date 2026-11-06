import { FoodCategory, DietaryType } from "@/lib/constants/domain";
import type { DonationView } from "@/types/domain";

export function matchDietaryFilter(
  donation: DonationView,
  selectedDiet: DietaryType | "all"
): boolean {
  if (selectedDiet === "all") return true;
  return donation.dietaryTypes.includes(selectedDiet);
}

export function searchDonations(
  donations: DonationView[],
  query: string
): DonationView[] {
  const q = query.trim().toLowerCase();
  if (!q) return donations;

  return donations.filter((item) => {
    return (
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.pickup.approximateArea.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q)
    );
  });
}
