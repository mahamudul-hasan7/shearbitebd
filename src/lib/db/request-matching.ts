import type { FoodRequest, Donation, Address } from "@prisma/client";

function normalized(value: string) { return value.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim(); }
function city(value: string) { const text = normalized(value); return ["dhaka", "ঢাকা"].includes(text) ? "dhaka" : text; }

export function requestMatch(request: FoodRequest, donation: Donation & { pickupAddress: Pick<Address, "city"> }) {
  const category = request.categories.includes(donation.category);
  const dietary = request.dietaryTypes.every((type) => donation.dietaryTypes.includes(type));
  const sameCity = city(request.deliveryCity) === city(donation.pickupAddress.city);
  const time = request.neededBy.getTime() > Date.now() && donation.safePickupDeadline.getTime() > Date.now() && donation.windowEnd.getTime() > Date.now() && donation.windowStart.getTime() < request.neededBy.getTime();
  const conflict = request.allergensOrRestrictions.some((restriction) => donation.allergens.some((allergen) => {
    const left = normalized(restriction), right = normalized(allergen);
    return left && right && (left.includes(right) || right.includes(left));
  }));
  const sameArea = normalized(request.deliveryArea) === normalized(donation.approximateArea);
  return { eligible: category && dietary && sameCity && time && !conflict,
    score: 70 + (sameArea ? 20 : 0) + (donation.estimatedMeals >= request.mealsNeeded - request.mealsFulfilled ? 10 : 0),
    reasons: ["Requested food category", "Declared dietary preferences", "Same delivery city", "Available before the requested deadline", ...(sameArea ? ["Same declared area"] : [])],
    allergenReviewRequired: request.allergensOrRestrictions.length > 0 };
}
