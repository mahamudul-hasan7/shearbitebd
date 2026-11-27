import type { FoodRequest, Donation, Address } from "@prisma/client";

function normalized(value: string) { return value.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim(); }
function city(value: string) { const text = normalized(value); return ["dhaka", "ঢাকা"].includes(text) ? "dhaka" : text; }

const MIN_TRANSIT_LEAD_MS = 10 * 60_000;

export function requestMatch(
  request: FoodRequest,
  donation: Donation & { pickupAddress: Pick<Address, "city"> },
  options?: { mealsReserved?: number },
) {
  const category = request.categories.includes(donation.category);
  const dietary = request.dietaryTypes.every((type) => donation.dietaryTypes.includes(type));
  const sameCity = city(request.deliveryCity) === city(donation.pickupAddress.city);
  const now = Date.now();
  const time =
    request.neededBy.getTime() > now &&
    donation.safePickupDeadline.getTime() > now &&
    donation.windowEnd.getTime() > now &&
    donation.windowStart.getTime() + MIN_TRANSIT_LEAD_MS <= request.neededBy.getTime();
  const conflict = request.allergensOrRestrictions.some((restriction) => donation.allergens.some((allergen) => {
    const left = normalized(restriction), right = normalized(allergen);
    return left && right && (left.includes(right) || right.includes(left));
  }));
  const sameArea = normalized(request.deliveryArea) === normalized(donation.approximateArea);
  const remainingNeeded = Math.max(0, request.mealsNeeded - request.mealsFulfilled - (options?.mealsReserved ?? 0));
  return { eligible: category && dietary && sameCity && time && !conflict,
    score: 70 + (sameArea ? 20 : 0) + (donation.estimatedMeals >= remainingNeeded ? 10 : 0),
    reasons: ["Requested food category", "Declared dietary preferences", "Same delivery city", "Available before the requested deadline", ...(sameArea ? ["Same declared area"] : [])],
    allergenReviewRequired: request.allergensOrRestrictions.length > 0 };
}
