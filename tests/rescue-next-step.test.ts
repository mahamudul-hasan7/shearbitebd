import assert from "node:assert/strict";
import { test } from "node:test";
import {
  rescueNextStep,
  selectTrackingClaim,
} from "../src/lib/rescue-next-step";
import { hasUiTranslation } from "../src/lib/i18n/ui-text";

test("each role gets its actual handover responsibility", () => {
  assert.equal(
    rescueNextStep({ role: "donor", status: "ASSIGNED" }).action,
    "PICKUP_CODE",
  );
  assert.equal(
    rescueNextStep({ role: "ngo", status: "ASSIGNED" }).action,
    undefined,
  );
  assert.equal(
    rescueNextStep({ role: "ngo", status: "PICKED_UP" }).action,
    "DELIVERY_CODE",
  );
  assert.equal(
    rescueNextStep({ role: "donor", status: "PICKED_UP" }).action,
    undefined,
  );
});
test("volunteer actions follow saved route stages without simulating OTP completion", () => {
  for (const [stage, action] of [
    ["assigned", "en_route_pickup"],
    ["en_route_pickup", "at_pickup"],
    ["at_pickup", "PICKUP_CODE"],
    ["cargo_loaded", "en_route_dropoff"],
    ["en_route_dropoff", "DELIVERY_CODE"],
  ] as const) {
    assert.equal(
      rescueNextStep({
        role: "volunteer",
        status: ["cargo_loaded", "en_route_dropoff"].includes(stage)
          ? "PICKED_UP"
          : "ASSIGNED",
        routeStage: stage,
      }).action,
      action,
    );
  }
});
test("verified delivery requires NGO receipt before distribution while rider completion stays separate", () => {
  assert.equal(
    rescueNextStep({ role: "ngo", status: "DELIVERED", receiptRecorded: false })
      .action,
    "RECEIPT",
  );
  assert.equal(
    rescueNextStep({ role: "ngo", status: "DELIVERED", receiptRecorded: true })
      .action,
    "DISTRIBUTION",
  );
  const rider = rescueNextStep({
    role: "volunteer",
    status: "DELIVERED",
    routeStage: "completed",
  });
  assert.equal(rider.action, undefined);
  assert.match(rider.description, /does not count as meals served/);
  for (const role of ["donor", "ngo", "volunteer"] as const)
    assert.equal(
      rescueNextStep({ role, status: "DISTRIBUTED" }).title,
      "Distribution recorded",
    );
});
test("incident holds and closed rescues offer no progress actions", () => {
  for (const role of ["donor", "ngo", "volunteer"] as const)
    for (const status of ["DISPUTED", "CANCELLED", "EXPIRED"]) {
      assert.equal(
        rescueNextStep({ role, status, routeStage: "at_pickup" }).action,
        undefined,
      );
    }
  assert.equal(
    rescueNextStep({ role: "ngo", status: "DELIVERED", distributionBlocked: true })
      .action,
    "REPORT_ISSUE",
  );
  assert.equal(
    rescueNextStep({
      role: "volunteer",
      status: "PICKED_UP",
      routeStage: "en_route_dropoff",
      expired: true,
    }).action,
    "REPORT_ISSUE",
  );
});
test("relisted food cannot reuse a cancelled receiver as its current rescue", () => {
  const cancelled = { id: "old", status: "CANCELLED" },
    current = { id: "new", status: "RESERVED" };
  assert.equal(selectTrackingClaim([cancelled], "AVAILABLE"), undefined);
  assert.equal(selectTrackingClaim([cancelled], "EXPIRED"), undefined);
  assert.equal(selectTrackingClaim([cancelled, current], "RESERVED"), current);
  assert.equal(selectTrackingClaim([cancelled], "CANCELLED"), cancelled);
});
test("all coordination stage guidance is authored in both languages", () => {
  for (const role of ["donor", "ngo", "volunteer"] as const)
    for (const status of [
      "DRAFT",
      "AVAILABLE",
      "RESERVED",
      "ASSIGNED",
      "PICKED_UP",
      "DELIVERED",
      "DISTRIBUTED",
      "DISPUTED",
      "CANCELLED",
      "EXPIRED",
    ])
      for (const routeStage of [
        "assigned",
        "en_route_pickup",
        "at_pickup",
        "cargo_loaded",
        "en_route_dropoff",
        "completed",
      ] as const) {
        const model = rescueNextStep({ role, status, routeStage });
        assert.ok(hasUiTranslation(model.title), model.title);
        assert.ok(hasUiTranslation(model.description), model.description);
      }
});
