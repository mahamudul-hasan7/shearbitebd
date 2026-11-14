import test from "node:test";
import assert from "node:assert/strict";
import { ClaimStatus } from "../src/lib/constants/statuses";
import { nearbyOverview, orderActiveClaims, claimNextStep } from "../src/features/ngo-dashboard/dashboard-presentation";
import type { ProfileBundle } from "../src/services/profile.service";
import type { DonationView } from "../src/types/domain";
import type { NGOActiveClaim } from "../src/features/ngo-dashboard/types";

const profile = (point?: {latitude:number;longitude:number}) => ({addresses:[{id:"address",isPrimary:true,coordinates:point}]} as unknown as ProfileBundle);
const donation = (id:string,point?:{latitude:number;longitude:number}) => ({id,pickup:{approximateCoordinates:point}} as DonationView);
const origin = {latitude:23.78,longitude:90.42};

test("nearby availability is unknown without an NGO map pin, including an empty feed",()=>{
  for(const items of [[],[donation("near",origin)]]) {const result=nearbyOverview(profile(),items);assert.equal(result.availableNearby,null);assert.equal(result.hasLocation,false);}
});
test("an address without coordinates does not fall back to another non-primary address",()=>{
  const own={addresses:[{id:"primary",isPrimary:true},{id:"other",coordinates:origin}]} as unknown as ProfileBundle;
  assert.equal(nearbyOverview(own,[donation("food",origin)]).availableNearby,null);
});
test("a genuine measured zero differs from missing food pins",()=>{
  assert.equal(nearbyOverview(profile(origin),[]).availableNearby,0);
  assert.equal(nearbyOverview(profile(origin),[donation("far",{latitude:22.35,longitude:91.8})]).availableNearby,0);
  const missing=nearbyOverview(profile(origin),[donation("unknown")]);assert.equal(missing.availableNearby,null);assert.equal(missing.unmappedDonations,1);
});
test("nearby counts use measured locations and report missing donor pins separately",()=>{
  const source=[donation("near",{latitude:23.79,longitude:90.43}),donation("far",{latitude:22.35,longitude:91.8}),donation("unmapped")];
  const result=nearbyOverview(profile(origin),source);assert.equal(result.availableNearby,1);assert.equal(result.unmappedDonations,1);assert.equal(source[0].pickup.distanceKm,undefined);
});
test("invalid saved coordinates cannot produce a nearby zero",()=>{assert.equal(nearbyOverview(profile({latitude:NaN,longitude:90}),[]).availableNearby,null);});
test("reported issues and delivered work appear before pending pickup without mutating the feed",()=>{
  const source=[ClaimStatus.RESERVED,ClaimStatus.ASSIGNED,ClaimStatus.PICKED_UP,ClaimStatus.DELIVERED,ClaimStatus.DISPUTED].map((status,index)=>({claim:{id:String(index),status},donation:{safePickupDeadline:"2030-01-01T00:00:00Z"}})) as NGOActiveClaim[];
  assert.deepEqual(orderActiveClaims(source).map(item=>item.claim.status),[ClaimStatus.DISPUTED,ClaimStatus.DELIVERED,ClaimStatus.PICKED_UP,ClaimStatus.ASSIGNED,ClaimStatus.RESERVED]);assert.equal(source[0].claim.status,ClaimStatus.RESERVED);
});
test("delivered and paused jobs have stage-appropriate next actions",()=>{
  assert.match(claimNextStep(ClaimStatus.DELIVERED).label,/receipt and distribution/);assert.match(claimNextStep(ClaimStatus.DISPUTED).description,/paused/);assert.match(claimNextStep(ClaimStatus.RESERVED).description,/rider/);
});
