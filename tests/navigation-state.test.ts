import assert from "node:assert/strict";
import { test } from "node:test";
import {
  missionNavigation,
  selectedNavigationHref,
} from "../src/components/navigation/navigation-state";

test("nested pages select one most-specific menu item while explicit sections retain priority", () => {
  const items = [
    { href: "/ngo/dashboard" },
    { href: "/ngo/discover" },
    { href: "/ngo/discover/map" },
    { href: "/ngo/claims" },
  ];
  assert.equal(
    selectedNavigationHref(items, "/ngo/discover/map", "/ngo/discover/map"),
    "/ngo/discover/map",
  );
  assert.equal(
    selectedNavigationHref(items, "/ngo/claims/abc", "/ngo/claims/abc"),
    "/ngo/claims",
  );
  assert.equal(
    selectedNavigationHref(items, "/ngo/discover", "/ngo/donations/abc"),
    "/ngo/discover",
  );
  assert.equal(
    selectedNavigationHref(items, "/ngo/discovery", "/ngo/discovery"),
    undefined,
  );
});

test("assigned mission navigation uses its real route without selecting the dashboard anchor", () => {
  const original = [
    { href: "/volunteer/dashboard" },
    { href: "/volunteer/dashboard#active-mission" },
  ];
  const items = missionNavigation(original, "/volunteer/missions/mission-abc");
  assert.equal(
    selectedNavigationHref(
      items,
      original[1].href,
      "/volunteer/missions/mission-abc",
    ),
    items[1].href,
  );
  assert.equal(
    selectedNavigationHref(items, original[0].href, original[0].href),
    original[0].href,
  );
  assert.equal(original[1].href, "/volunteer/dashboard#active-mission");
});
