# Phase 8 - Donor Notifications, Profile, Settings, and Support

Phase 8 completes the donor account-management and help experience with six responsive routes backed by the shared typed mock state.

## Completed modules

- Categorized notifications for urgent, NGO match, volunteer, pickup, delivery, and system activity
- All, unread, urgent, and donation-update filters; mark read/unread and mark-all-read controls
- Verified donor profile with private contact information and service-derived impact summary
- Validated profile editing for display name, organization, donor type, email, and phone
- Saved pickup-address CRUD plus primary-address selection and owner authorization checks
- Push/email preferences, location-permission display, language, and text-size controls
- FAQ covering pickup, safety, privacy, NGO preferences, and the non-monetary product boundary
- Validated support form with issue category, message, and local mock reference
- Browser-session logout

## Typed service changes

- `UserPreferences` and related language, text-size, and location-permission types are part of `MockAppState`.
- `accountService` reads and updates owner-only preferences and validates mock support requests.
- `profileService` now validates and updates complete donor profiles and supports owner-scoped address add/edit/select/remove operations.
- `notificationService` supports mark unread and mark all read in addition to the existing private list and mark-read operations.

## Scope boundaries

- Changes are in-memory and reset after a full reload.
- The contact-support form does not send an external message.
- Browser location is displayed, not changed programmatically.
- Dark mode is intentionally unavailable until the full theme system supports it.
- No payment method, card, fundraising, bank, payout, or financial-donation option exists.

## Verification

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run build`

The two existing unused-variable warnings in user-authored Git reminder scripts remain unrelated to this phase.
