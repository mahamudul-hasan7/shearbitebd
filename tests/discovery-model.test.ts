import assert from "node:assert/strict";
import { test } from "node:test";
import {
  FoodCategory,
  DietaryType,
  PriorityLevel,
  StorageCondition,
  QuantityUnit,
} from "../src/lib/constants/domain";
import { DonationStatus } from "../src/lib/constants/statuses";
import {
  availableForDiscovery,
  discoveryQuery,
  filterDiscovery,
  parseDiscoveryFilters,
  pickupDeadline,
} from "../src/features/ngo-discovery/discovery-model";
import { DEFAULT_DISCOVERY_FILTERS } from "../src/features/ngo-discovery/types";
import type { NGODiscoveryItem } from "../src/services/discovery.service";
import { validateDonationTimes } from "../src/lib/validators/date-time";
const now = Date.parse("2026-11-21T12:00:00Z");
function item(
  id: string,
  accepted = true,
  distance?: number,
  hours = 4,
): NGODiscoveryItem {
  return {
    donation: {
      id,
      donorProfileId: "donor",
      preparationTime: new Date(now - 1000).toISOString(),
      foodCondition: "FRESHLY_PREPARED",
      photoUrls: [],
      updatedAt: new Date(now).toISOString(),
      safetyDeclaration: {
        freshlyPrepared: true,
        properlyCovered: true,
        noVisibleSpoilage: true,
        storedAccordingToDeclaration: true,
        allergensDisclosed: true,
        pickupDeadlineConfirmed: true,
        donorAccuracyConfirmed: true,
        declaredByUserId: "donor",
        declaredAt: new Date(now).toISOString(),
      },
      title: id,
      description: "Community meals",
      category: FoodCategory.COOKED_MEAL,
      status: DonationStatus.AVAILABLE,
      createdAt: new Date(now).toISOString(),
      publishedAt: new Date(now).toISOString(),
      quantity: { estimatedMeals: 60, value: 60, unit: QuantityUnit.MEALS },
      dietaryTypes: [DietaryType.VEGETARIAN],
      allergens: [],
      priority: PriorityLevel.MEDIUM,
      storageCondition: StorageCondition.AMBIENT,
      safePickupDeadline: new Date(now + 8 * 3_600_000).toISOString(),
      pickup: {
        approximateArea: "Badda",
        distanceKm: distance,
        windowStart: new Date(now - 1000).toISOString(),
        windowEnd: new Date(now + hours * 3_600_000).toISOString(),
        sensitiveDetailsVisible: false,
      },
    },
    donorOrganization: "Community kitchen",
    matchScore: 0,
    eligibility: {
      eligible: accepted,
      checks: [
        {
          label: "Food category",
          passed: accepted,
          description: "Declared category",
        },
      ],
    },
  };
}
test("recommendations prioritize accepted food, actual urgency and measured distance without a made-up score", () => {
  const items = [
    item("other-category", false, 0.1, 0.5),
    item("unknown", true, undefined),
    item("near", true, 1),
    item("urgent", true, 20, 1),
    item("far", true, 15),
  ];
  assert.deepEqual(
    filterDiscovery(items, DEFAULT_DISCOVERY_FILTERS, now).map(
      (x) => x.donation.id,
    ),
    ["urgent", "near", "far", "unknown", "other-category"],
  );
  assert.deepEqual(
    items.map((x) => x.donation.id),
    ["other-category", "unknown", "near", "urgent", "far"],
    "Sorting must not mutate source data",
  );
});
test("a collection window closes before the food deadline and is excluded without a reload", () => {
  const food = item("ending", true, 1, 0.001);
  assert.ok(
    pickupDeadline(food.donation) <
      Date.parse(food.donation.safePickupDeadline),
  );
  assert.equal(availableForDiscovery(food.donation, now), true);
  assert.equal(
    filterDiscovery([food], DEFAULT_DISCOVERY_FILTERS, now + 3601).length,
    0,
  );
  food.donation.status = "RESERVED" as typeof food.donation.status;
  assert.equal(availableForDiscovery(food.donation, now), false);
});
test("nearby filters never invent distance and unknown locations remain in All distances", () => {
  const items = [
    item("near", true, 3),
    item("far", true, 15),
    item("unknown", true, undefined),
  ];
  assert.deepEqual(
    filterDiscovery(
      items,
      { ...DEFAULT_DISCOVERY_FILTERS, radiusKm: 5 },
      now,
    ).map((x) => x.donation.id),
    ["near"],
  );
  assert.equal(
    filterDiscovery(items, DEFAULT_DISCOVERY_FILTERS, now).length,
    3,
  );
  assert.deepEqual(
    filterDiscovery(
      items,
      { ...DEFAULT_DISCOVERY_FILTERS, sort: "NEAREST" },
      now,
    ).map((x) => x.donation.id),
    ["near", "far", "unknown"],
  );
});
test("query parsing rejects invalid enums and unbounded numbers and round-trips actual filters", () => {
  const bad = parseDiscoveryFilters(
    new URLSearchParams(
      "radius=-1&quantity=Infinity&deadline=NaN&category=FAKE&sort=unknown",
    ),
  );
  assert.deepEqual(bad, DEFAULT_DISCOVERY_FILTERS);
  const input = parseDiscoveryFilters(
    new URLSearchParams(
      "q=%20ঢাকা%20&radius=5&quantity=40&deadline=2&sort=NEAREST",
    ),
  );
  assert.equal(input.search, "ঢাকা");
  assert.deepEqual(
    parseDiscoveryFilters(new URLSearchParams(discoveryQuery(input))),
    input,
  );
  assert.equal(discoveryQuery(DEFAULT_DISCOVERY_FILTERS), "");
});
test("search, category, diet, quantity and deadline filters compose", () => {
  const food = item("Fresh rice", true, 2, 1);
  food.donation.pickup.approximateArea = "ঢাকা";
  const filters = parseDiscoveryFilters(
    new URLSearchParams(
      "q=ঢাকা&category=COOKED_MEAL&dietary=VEGETARIAN&quantity=40&deadline=2",
    ),
  );
  assert.equal(filterDiscovery([food], filters, now).length, 1);
  assert.equal(
    filterDiscovery([food], { ...filters, minMeals: 100 }, now).length,
    0,
  );
});
test("publishing requires a future collection window while historical draft validation remains possible", () => {
  const input = {
    preparationTime: new Date(now - 10_000).toISOString(),
    pickupWindowStart: new Date(now - 9000).toISOString(),
    pickupWindowEnd: new Date(now - 1000).toISOString(),
    safePickupDeadline: new Date(now + 3_600_000).toISOString(),
    now,
  };
  assert.equal(
    validateDonationTimes(input).pickupWindowEnd,
    "Pickup window must end in the future.",
  );
  assert.equal(
    validateDonationTimes({ ...input, requireFutureDeadline: false })
      .pickupWindowEnd,
    undefined,
  );
});
