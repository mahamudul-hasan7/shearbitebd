export const SAMPLE_DONATION_IMAGES = [
  { id: "packed-meals", label: "Packed meals", url: "/images/donor-active-meal.png" },
  { id: "meal-trays", label: "Meal trays", url: "/images/surplus-food-containers.jpg" },
] as const;

export function sampleDonationImage(id: string | null | undefined) {
  return SAMPLE_DONATION_IMAGES.find((sample) => sample.id === id);
}
