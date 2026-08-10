# Phase 5 - Add Surplus Food Wizard

Phase 5 completes the responsive donor submission flow and connects it to the typed in-memory donation service created in Phase 3.

## Completed flow

1. Food Details
   - Title, category, dietary type, quantity/unit, preparation time, safe pickup deadline, storage, food condition, allergens, description, and special instructions
   - Optional selection of up to five JPG, PNG, or WebP photo names, with a 5 MB-per-file UI limit
   - Explicit browser-only Save draft action
2. Pickup
   - Saved UIU Cafeteria address, read-only exact address, public approximate area, and map placeholder
   - Private pickup contact, phone, optional email, pickup window, and directions
   - Clear privacy explanation for sensitive address and contact fields
3. Safety & Review
   - Editable food and pickup summaries
   - Seven required donor declarations covering preparation, covering, visible spoilage, storage, allergens, pickup deadline, and accuracy
   - Estimated urgency score and hydration-safe rescue clock, explicitly described as workflow estimates rather than medical guarantees
4. Confirmation
   - Generated mock donation ID, submission summary, what-happens-next guidance, and links to the created donation and My Donations
   - Add another food reset action and a disabled impact-sharing action until a rescue is completed

## Validation and persistence

- Quantity must be positive.
- Preparation must not be after the safe pickup deadline.
- The pickup window must be valid and finish on or before the safe pickup deadline.
- Required food, public area, saved address, contact, and declaration fields block progression or submission.
- Validation errors are inline and focus moves to the first invalid control.
- The draft persists in session storage within the current browser tab and survives backward/forward wizard navigation.
- Photos are an explicit optional product decision for this frontend phase. File names are shown locally; no upload occurs.

## Service and privacy boundary

- Final submission calls `donationService.create` with a donor viewer context and a published mock status.
- The resulting donation is inserted into the shared in-memory store and appears at `/donor/donations` during client-side navigation in the current app session.
- `/donor/donations/[donationId]` reads the same service response and demonstrates owner-authorized access to exact pickup/contact information.
- Public discovery projections continue to expose only the approximate pickup area.
- Reloading the application resets in-memory submissions to seed data because no backend exists.

## Responsive behavior

- Mobile uses a stacked stepper, single-column form fields, full-width actions, and safe-area bottom navigation.
- Tablet introduces paired form fields and summary grids.
- Desktop uses a two-column wizard with a sticky live summary/validation panel.
- Confirmation actions wrap from a mobile stack into a desktop action row.

## Phase boundary

The My Donations list and donation detail are limited Phase 5 verification handoffs. Phase 6 will add the complete donation-management interface, status tabs, lifecycle actions, tracking, QR handover, cancellation/edit rules, and their full state coverage.

## Verification

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run build`
- Production HTTP smoke checks returned 200 for `/donor/donations/new`, `/donor/donations`, `/donor/donations/donation-uiu-lunch`, and `/images/donor-active-meal.png`.
- The in-app browser automation surface was unavailable in this session, so interactive click and screenshot QA remains a manual follow-up.
