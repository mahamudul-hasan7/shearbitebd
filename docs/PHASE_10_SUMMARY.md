# Phase 10 - NGO Discover, Filters, and Rescue Map

Phase 10 completes privacy-safe surplus-food discovery for verified NGOs in synchronized list, map, and ID-based detail views.

## Discovery list

- Typed available-donation recommendations with match percentage and eligibility state
- Approximate distance/area, priority, estimated meals, preparation time, storage condition, and live rescue clock
- Search across title, description, donor organization, and approximate area
- Best-match, nearest, deadline, and quantity sorting
- Distance, category, dietary compatibility, minimum quantity, urgency, storage, and deadline filters
- Responsive desktop filter sidebar and mobile filter drawer
- Save-for-later state stored for the current browser tab
- Actionable empty state with visible criteria, reset/view-all action, demand-request link, and optional frontend-only availability alert setting

All search/filter/sort values use URL query parameters. Switching between `/ngo/discover` and `/ngo/discover/map` preserves the same query string and therefore the same results.

## Privacy-safe rescue map

- Approximate, intentionally offset pins rather than donor coordinates
- Separate marker for Hope Foundation's service area
- Available, urgent, and NGO-area legend
- Clickable selected-donation preview and nearby donation list
- List/map toggle with shared filter state
- Explicit notice that exact address, coordinates, contact, and directions remain hidden before an accepted claim

The map is a responsive frontend visualization, not live GPS, routing, or navigation.

## Donation details

- ID-based loading from `discoveryService`
- Verified donor organization, approximate location/distance, quantity, preparation, storage, category, packaging, and handling instructions
- Dietary labels and allergen disclosure
- Seven donor safety-declaration checks with traceability/freshness boundary copy
- Verified-organization, accepted-category, service-distance, and rescue-window eligibility checks
- Save-for-later and working claim CTA
- Successful claims use `claimService`, reserve the donation, and hand off to the guarded claim route for Phase 11

## Typed service and mock data

- `discoveryService.listAvailable` and `getById` enforce verified NGO ownership and return privacy-projected `DonationView` records.
- Donor organization, match score, and eligibility are assembled in the service layer rather than from raw page imports.
- Claim creation now rejects categories that are not accepted by the NGO profile.
- Four varied available listings make category, dietary, quantity, urgency, storage, distance, and deadline filters testable.

## Verification

- `npm.cmd run typecheck` passed.
- `npm.cmd run build` passed and generated `/ngo/discover`, `/ngo/discover/map`, and dynamic `/ngo/donations/[donationId]`.
- `npm.cmd run lint` exited successfully with only the two unrelated warnings in existing user-authored Git reminder scripts.
- Production HTTP checks returned 200 for list view, a fully filtered query, map view with the same query, three seeded detail pages, and the NGO dashboard.
- The bundled in-app browser runtime could not initialize its local assets, so automated click/screenshot QA was unavailable in this environment.

## Manual test path

1. Run `npm.cmd run dev` and sign in with `ngo@sharebite.demo` / `Demo1234`.
2. Open `/ngo/discover`; test search, every filter, each sort, save state, reset, and an empty combination.
3. Switch to Map and verify all query parameters and visible results remain unchanged.
4. Select pins and nearby-list rows; confirm only approximate areas are displayed.
5. Open `/ngo/donations/donation-gulshan-buffet`, review safety/eligibility, save it, and create a mock claim.
