# Phase 11 - NGO Claims, QR Verification, and Tracking

Phase 11 replaces the NGO claim handoffs with a complete responsive claims list and privacy-aware rescue coordination detail.

## Implemented routes

- `/ngo/claims`
- `/ngo/claims/[claimId]`

## Claims list

- Service-backed total, reserved, in-progress, and completed summaries
- Search across food, donor, area, volunteer, and claim ID
- All, Reserved, Assigned, Picked up, Delivered, Distributed, and Expired filters
- Active and history sections with status, match score, quantity, area, rescue deadline, volunteer, and ETA context
- Loading, error, filter-empty, and no-result states

## Claim coordination detail

- Donation and verified donor summary with current match score
- Five-step Reserved → Assigned → Picked up → Delivered → Distributed timeline
- Authorized exact pickup address, directions, and donor contact controls
- Verified volunteer details, transport, completed-rescue count, ETA, call, and message controls
- Separate pickup and delivery mock QR placeholders and separate six-digit fallback codes
- Privacy-aware pickup-to-NGO route preview
- Demo claim release, volunteer assignment, pickup verification, delivery receipt, and quick issue-report actions

## Service and privacy behavior

- `claimService.getCoordinationDetails` rejects viewers who are not part of the rescue and uses the centralized donation privacy projection.
- Exact donor address/contact becomes available to the claiming NGO only in an authorized claim state.
- Demo volunteer assignment issues distinct pickup and delivery tokens and updates both claim and donation state.
- Issue reporting uses the existing typed incident service and moves eligible claim/donation state to `DISPUTED`.
- Full delivery-condition, quantity, evidence, distribution, and incident workflows remain assigned to Phase 13.

## Security boundary

QR blocks, fallback codes, ETAs, route drawing, phone/message actions, token expiry wording, and one-time wording are frontend demonstrations. Production token generation, token expiry, one-time enforcement, GPS, messaging, and authorization require backend services.

## Verification

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run build
```
