import assert from "node:assert/strict";
import { test } from "node:test";
import { createInitialFoodRequestDraft } from "../src/features/requests/request-draft";
import { foodRequestErrorStep, validateCompleteFoodRequest } from "../src/features/requests/validation";

function completedDraft() {
  return { ...createInitialFoodRequestDraft(), title: "Community meals", purpose: "Evening meals for families", recipientType: "Families",
    peopleToServe: "20", mealsNeeded: "20", deliveryAddressId: "owned-address", addressLine: "Community centre", area: "Badda", city: "Dhaka" };
}

test("a completed food request passes final validation", () => {
  assert.deepEqual(validateCompleteFoodRequest(completedDraft()), {});
});

test("request errors identify the relevant editable step", () => {
  assert.equal(foodRequestErrorStep({ title: "Invalid" }), 1);
  assert.equal(foodRequestErrorStep({ categories: "Invalid" }), 2);
  assert.equal(foodRequestErrorStep({ neededBy: "Expired", form: "Check requested time" }), 3);
  assert.equal(foodRequestErrorStep({ locationInstructions: "Too long" }), 4);
  assert.equal(foodRequestErrorStep({ form: "Network failure" }), undefined);
});

test("request text length is checked before server submission", () => {
  const draft = completedDraft();
  draft.title = "x".repeat(161);
  assert.equal(foodRequestErrorStep(validateCompleteFoodRequest(draft)), 1);
  draft.title = "x".repeat(160);
  draft.locationInstructions = "x".repeat(1001);
  assert.equal(foodRequestErrorStep(validateCompleteFoodRequest(draft)), 4);
  draft.locationInstructions = "x".repeat(1000);
  assert.deepEqual(validateCompleteFoodRequest(draft), {});
});
