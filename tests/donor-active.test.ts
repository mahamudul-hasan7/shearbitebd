import assert from "node:assert/strict";
import test from "node:test";
import { selectActiveDonation } from "../src/features/donor-dashboard/active-donation";
import { DonationStatus } from "../src/lib/constants/statuses";
const food = (status: DonationStatus, hours = 1) => ({ status, safePickupDeadline: new Date(Date.now() + hours * 3600000).toISOString() });
test("active handovers take priority over newer available food", () => {
  const picked = food(DonationStatus.PICKED_UP);
  const items = [food(DonationStatus.AVAILABLE), food(DonationStatus.RESERVED), food(DonationStatus.ASSIGNED), picked];
  assert.equal(selectActiveDonation(items), picked);
  assert.deepEqual(items.map((item) => item.status), ["AVAILABLE", "RESERVED", "ASSIGNED", "PICKED_UP"], "Do not reorder the recent-post list");
  assert.equal(selectActiveDonation([food(DonationStatus.AVAILABLE), food(DonationStatus.ASSIGNED)])?.status, "ASSIGNED");
});
test("held rescues need attention and finished or closed food is excluded", () => {
  assert.equal(selectActiveDonation([food(DonationStatus.PICKED_UP), food(DonationStatus.DISPUTED)])?.status, "DISPUTED");
  assert.equal(selectActiveDonation([food(DonationStatus.DISTRIBUTED), food(DonationStatus.CANCELLED), food(DonationStatus.EXPIRED), food(DonationStatus.DRAFT)]), undefined);
});
test("the nearest deadline breaks ties within the same stage", () => {
  const sooner = food(DonationStatus.ASSIGNED, 1), later = food(DonationStatus.ASSIGNED, 2);
  assert.equal(selectActiveDonation([later, sooner]), sooner);
});
