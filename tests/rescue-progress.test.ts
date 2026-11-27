import assert from "node:assert/strict";
import test from "node:test";
import { buildRescueProgress, type RescueRouteStage } from "../src/lib/rescue-progress";
import { hasUiTranslation, translateUiText } from "../src/lib/i18n/ui-text";

test("food progress advances only from saved workflow status", () => {
  const statuses = ["AVAILABLE", "RESERVED", "ASSIGNED", "PICKED_UP", "DELIVERED", "DISTRIBUTED"];
  for (const [index, status] of statuses.entries()) {
    const progress = buildRescueProgress({ status });
    assert.equal(progress.index, index);
    assert.equal(progress.state, index === 5 ? "complete" : "active");
    assert.equal(progress.steps.filter((s) => s.done).length, index === 5 ? 6 : index);
    assert.equal(progress.steps.filter((s) => s.current).length, 1);
    assert.equal(progress.steps.filter((s) => s.timestamp).length, 0, "Do not invent checkpoint timestamps");
  }
  assert.equal(buildRescueProgress({ status: "RESERVED", routeStage: "assigned" }).index, 1, "The default route stage does not imply a rider");
  assert.equal(buildRescueProgress({ status: "DRAFT" }).state, "draft");
});

test("rider route has six saved stages and finishes at verified delivery", () => {
  const stages: RescueRouteStage[] = ["assigned", "en_route_pickup", "at_pickup", "cargo_loaded", "en_route_dropoff", "completed"];
  for (const [index, routeStage] of stages.entries()) {
    const progress = buildRescueProgress({ scope: "rider", status: index < 3 ? "ASSIGNED" : index < 5 ? "PICKED_UP" : "DELIVERED", routeStage });
    assert.equal(progress.index, index);
    assert.equal(progress.state, index === 5 ? "complete" : "active");
  }
  assert.equal(buildRescueProgress({ status: "DELIVERED" }).state, "active", "NGO distribution is still pending");
  assert.equal(buildRescueProgress({ status: "ASSIGNED", routeStage: "en_route_pickup" }).title, "Travelling to pickup");
  assert.equal(buildRescueProgress({ status: "PICKED_UP", routeStage: "en_route_dropoff" }).title, "Travelling to NGO");
});

test("incident holds and closures retain recorded checkpoints without claiming completion", () => {
  const at = "2026-11-14T08:30:00.000Z";
  for (const [status, state] of [["DISPUTED", "paused"], ["CANCELLED", "cancelled"], ["EXPIRED", "expired"]]) {
    const progress = buildRescueProgress({ status, publishedAt: at, reservedAt: at, assignedAt: at, pickedUpAt: at, deliveredAt: "invalid" });
    assert.equal(progress.state, state);
    assert.equal(progress.index, 3);
    assert.equal(progress.steps[3].timestamp, at);
    assert.equal(progress.steps[3].done, true);
    assert.equal(progress.steps[4].done, false);
    assert.equal(progress.steps[4].timestamp, undefined);
    assert.equal(progress.stoppedAtLabel, "Pickup verified");
    assert.equal(progress.completedSteps, 4);
    assert.equal(buildRescueProgress({ scope: "rider", status, routeStage: "at_pickup", assignedAt: at }).state, state);
    assert.equal(buildRescueProgress({ scope: "rider", status: "CANCELLED", routeStage: "assigned", pickedUpAt: at }).stoppedAtLabel, "Pickup verified");
  }
});

test("every dynamic progress heading description and checkpoint has both languages", () => {
  const stages: RescueRouteStage[] = ["assigned", "en_route_pickup", "at_pickup", "cargo_loaded", "en_route_dropoff", "completed"];
  for (const scope of ["donation", "claim", "rider"] as const) {
    for (const status of ["DRAFT", "AVAILABLE", "RESERVED", "ASSIGNED", "PICKED_UP", "DELIVERED", "DISTRIBUTED", "DISPUTED", "CANCELLED", "EXPIRED"]) {
      for (const routeStage of stages) {
        const progress = buildRescueProgress({ scope, status, routeStage });
        for (const text of [progress.title, progress.description, ...progress.steps.map((s) => s.label)]) {
          assert.ok(hasUiTranslation(text), text);
          assert.match(translateUiText("bn", text), /[\u0980-\u09ff]/, text);
          assert.ok(!/[\u0980-\u09ff]/.test(translateUiText("en", text)), text);
        }
      }
    }
  }
});
