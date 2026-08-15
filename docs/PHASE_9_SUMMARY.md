# Phase 9 - NGO Dashboard

Phase 9 replaces the NGO auth placeholder with a complete responsive dashboard for the verified Hope Foundation mock account.

## Dashboard modules

- Organization greeting, verification badge, registration reference, service areas, and daily capacity
- Available nearby, active claims, meals distributed, and beneficiaries served summary cards
- Recommended nearby donation with local image, typed category/quantity/priority data, approximate distance, computed match score, and live safe-pickup clock
- Available-to-reserved-to-assigned status preview and working claim CTA
- Browse Food, My Claims, Create Demand Request, and Confirm Delivery quick actions
- Active claim overview with claim status, public area, pickup ETA, volunteer state, match percentage, and claim links
- Recent claim, notification, request, and impact activity
- Loading, recoverable error, no-recommendation, and no-active-claim states
- Shared desktop sidebar/grid and required Home, Discover, Request, Claims, Profile mobile navigation

## Typed data and interactions

- `impactService.getNgoOverview` returns owner-authorized meals, beneficiaries, food weight, completed rescues, and cloned recent records.
- The dashboard composes profile, donation, claim, impact, notification, and request services without importing raw mock state.
- A new available Gulshan meal-box listing provides a deterministic high-quality recommendation.
- Match percentage is a bounded frontend heuristic using accepted category, service area, distance, and urgency.
- Claiming calls `claimService.create`, protects verified NGO ownership, changes the donation to `RESERVED`, and refreshes dashboard data.
- Sensitive exact address and donor contact remain hidden until the verified claim exists.

## Route handoffs

The existing mobile and quick-action links now resolve to guarded, clearly labelled handoff screens for Discover, Claims, Claim Details, Confirm Delivery, New Demand Request, and NGO Profile. This prevents dead/404 routes while leaving the complete modules to their assigned future phases.

## Safety and scope

- The rescue clock represents a donor-declared deadline, not a freshness guarantee.
- Recommendation scores are not guarantees.
- Impact values remain demo records or estimates.
- No payment, fundraising, banking, payout, or financial-donation flow is present.

## Verification

- `npm.cmd run typecheck` passed.
- `npm.cmd run build` passed and generated all dashboard/handoff routes.
- `npm.cmd run lint` exited successfully with only the two unrelated warnings in the existing user-authored Git reminder scripts.
- Production HTTP checks returned 200 for the NGO dashboard, each action/navigation handoff, and all six Phase 8 donor account routes.
- The bundled in-app browser runtime could not initialize its local assets, so automated click/screenshot QA was unavailable in this environment.

## Manual test path

1. Run `npm.cmd run dev` and sign in with `ngo@sharebite.demo` / `Demo1234`.
2. Open `/ngo/dashboard` and verify summary metrics, live rescue clock, recommendation, active claims, quick actions, and recent activity.
3. Claim Fresh buffet meal boxes and confirm the recommendation moves into the active-claim state.
4. Open each desktop/mobile action to verify the guarded future-module handoff screen.
