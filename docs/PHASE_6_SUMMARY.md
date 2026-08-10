# Phase 6 - Donor Donations, Details, and Tracking

Phase 6 replaces the Phase 5 verification handoff with the complete responsive donor donation-management experience.

## My Donations

- Status overview cards for all donations, scheduled rescues, completed rescues, and items needing attention
- Search across title, description, donation ID, and pickup area
- Food-category and priority filters
- Deadline, recently updated, and newest sorting
- Working tabs for all, available/active, matched, scheduled, completed, cancelled, and expired
- Per-tab counts, reset controls, filter-aware empty states, initial empty state, loading skeletons, retry UI, and service result count
- Responsive donation cards with status, priority, photo fallback, rescue clock, quantity, approximate area, deadline, lifecycle progress, detail, and tracking actions

## Donation details

- ID-based service loading with loading, retry, and refresh feedback
- Photo, food description, quantity, estimated meals, storage, condition, preparation time, safe pickup deadline, dietary types, allergens, pickup window, and special instructions
- Complete lifecycle timeline using centralized donation statuses
- Owner-authorized exact pickup/contact display and an authorized receiver NGO summary
- Edit action for title, description, quantity, estimated meals, deadline, pickup window, and instructions
- Reason-required cancellation with active pre-pickup claim release
- Claim-linked issue reporting with type, severity, description, and contact preference
- Share-sheet integration with clipboard fallback and accessible feedback
- Completed, expired, cancelled, picked-up, delivered, distributed, and disputed records obey read-only/action rules from the service layer

## Tracking and handover

- Current donation and claim status with the shared lifecycle timeline
- Approximate route/map placeholder between the donor pickup and authorized receiver NGO
- Pickup window, mock volunteer ETA, and estimated delivery time
- Authorized NGO and assigned volunteer cards with contact controls
- Owner-only exact pickup information; unauthorized tracking requests are rejected by `trackingService`
- Pickup QR placeholder and six-digit fallback entry point based on the seeded mock token
- Clear copy that the QR, fallback code, map, ETA, and contact flow are frontend demonstrations rather than backend-secure or real-time systems
- Food-safety declaration and safe-deadline disclaimer remains visible

## Typed service changes

- `donationService.update` validates editable status, positive quantity, future deadline, and pickup-window consistency.
- `donationService.cancel` requires a reason and updates both donation and eligible claim state.
- `incidentService.createForDonation` validates participant permission and moves eligible claim/donation state to `DISPUTED`.
- `trackingService.getByDonationId` aggregates the donation privacy view, latest claim, receiver NGO, assigned volunteer, mock verification token, and incident records.
- The seeded UIU lunch donation now demonstrates an assigned NGO/volunteer rescue with mock ETA and pickup/delivery tokens.

## Privacy and lifecycle rules

- Exact pickup/contact information is still omitted from public discovery views.
- Tracking and receiver/volunteer contacts require an authorized rescue relationship.
- Edit and cancellation are allowed only before pickup begins.
- Cancellation requires a reason.
- Closed donations remain read-only.
- Issue reports pause normal progression through the centralized `DISPUTED` state.

## Verification

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run build`
- Production HTTP checks returned 200 for `/donor/donations`, `/donor/donations/donation-uiu-lunch`, and `/donor/donations/donation-uiu-lunch/tracking`.
- The bundled browser-control runtime could not initialize its local execution assets in this session, so automated click/screenshot QA was unavailable. Manual interaction steps remain below.

## Manual test path

1. Run `npm.cmd run dev` and sign in with the donor demo account.
2. Open `/donor/donations` and test the Scheduled and Completed tabs, search, filters, sort, and filter reset.
3. Open `donation-uiu-lunch` to inspect authorized NGO details, lifecycle, edit/cancel/report/share actions.
4. Open its tracking screen to verify volunteer/NGO data, ETA, contact controls, privacy copy, and mock QR handover.
5. Reload the app to reset in-memory mutations to the seeded Phase 6 state.
