# Phase 12 - NGO Food Request Workflow

Phase 12 replaces the NGO demand-request handoff with a complete five-step, service-backed workflow while keeping food requests separate from donation claims.

## Implemented routes

- `/ngo/requests`
- `/ngo/requests/new`
- `/ngo/requests/[requestId]`
- `/ngo/requests/submitted`

## Five-step request wizard

1. Request information: title, type, priority, purpose, recipients, high-priority reason, and optional supporting-document names.
2. Food details: categories, dietary compatibility, preferences, allergens/restrictions, and food-quality guidance.
3. Quantity and time: people, meals, ASAP/today/tomorrow/custom timing, preferred slot, and notes.
4. Location: program location type, full address, area, city, landmark, instructions, and a clearly labelled mock map.
5. Review: editable section summaries and final validation before submission.

Draft input autosaves to session storage in the current browser tab. Selected files are not uploaded; only their names are retained for the mock experience.

## Request management

- Search and status filtering across active and historical requests.
- Summary totals for review, matching, and fulfilled states.
- ID-based details with food, recipients, timing, location, and lifecycle context.
- Owner-scoped edit support while a request is draft or pending review.
- Confirmed cancellation while a request is still active.
- Submitted confirmation with the request ID, summary, next steps, and working navigation.

## Service and domain updates

- `FoodRequest` now carries timing intent, delivery-location details, preferences, and supporting-document names.
- `requestService` validates categories, dietary needs, quantities, future timing, high-priority reasons, and delivery location.
- Update and cancellation permissions are enforced through the typed mock service and central status transitions.
- Claims and requests remain separate domain modules; submission does not reserve a donation or create a claim.

## Verification

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run build
```

All data and file handling remain frontend-only demonstrations. Full reload resets in-memory submitted requests, and no donor, reviewer, upload service, or external notification is contacted.
