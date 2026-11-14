import assert from "node:assert/strict";
import { test } from "node:test";
import { localDistributionTime, validateDistributionForm } from "../src/features/distribution/distribution-validation";

const now = Date.parse("2026-11-14T06:00:01.500Z");
const context = { now, receivedAt: "2026-11-14T06:00:00.123Z", mealCapacity: 25 };
function valid() { return { beneficiaries: "10", meals: "10", adults: "", children: "", distributedAt: localDistributionTime(now), addressId: "owned", consent: true }; }

test("complete distribution values validate while preserving timestamp precision", () => {
  assert.equal(Date.parse(localDistributionTime(now)), now);
  assert.deepEqual(validateDistributionForm(valid(), context), {});
});

test("invalid and future times produce a field error before converting to ISO", () => {
  for (const time of ["", "invalid", localDistributionTime(now + 1)]) assert.ok(validateDistributionForm({ ...valid(), distributedAt: time }, context).distributedAt);
});

test("a time before receipt is rejected including earlier seconds in the same minute", () => {
  assert.ok(validateDistributionForm({ ...valid(), distributedAt: localDistributionTime(Date.parse(context.receivedAt) - 1) }, context).distributedAt);
});

test("counts, received meal capacity, location and consent are validated", () => {
  assert.ok(validateDistributionForm({ ...valid(), beneficiaries: "" }, context).beneficiariesServed);
  assert.ok(validateDistributionForm({ ...valid(), meals: "1.5" }, context).mealsDistributed);
  assert.ok(validateDistributionForm({ ...valid(), meals: "26" }, context).mealsDistributed);
  assert.ok(validateDistributionForm({ ...valid(), beneficiaries: "11", meals: "10" }, context).beneficiariesServed);
  assert.ok(validateDistributionForm({ ...valid(), adults: "8", children: "3" }, context).breakdown);
  assert.ok(validateDistributionForm({ ...valid(), adults: "-1" }, context).breakdown);
  assert.ok(validateDistributionForm({ ...valid(), consent: false }, context).beneficiaryConsentConfirmed);
  assert.ok(validateDistributionForm({ ...valid(), addressId: "" }, context).addressId);
});
