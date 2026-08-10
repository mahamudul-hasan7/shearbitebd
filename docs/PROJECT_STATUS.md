# ShareBite BD Project Status

Last audited: 2026-08-10
Current milestone: Phase 6 complete

## Completed foundation

- Next.js App Router, React, strict TypeScript, Tailwind CSS v4, and ESLint are configured.
- Central brand tokens, shared responsive layouts, reusable UI components, route constants, and role/status constants were completed in Phase 1.
- The full component catalogue is available at `/design-system`; donor and NGO shell previews are available under `/preview`.
- The project uses one responsive web codebase with mobile, tablet, and desktop layouts.

## Completed authentication frontend

- Splash and three-step onboarding flows.
- Controlled email/password login with password visibility, remember-session behavior, and inline validation.
- Forgot-password request with validated frontend-only confirmation.
- Public donor, NGO, and volunteer role selection; administrator registration is disabled and invite-only.
- Role-aware multi-step donor, NGO, and volunteer registration.
- Registration data survives backward and forward step navigation during the current page session.
- Bangladesh phone, email, password, confirmation, address, terms, document, and role-specific validation.
- NGO and volunteer document requirements and verification-pending result copy.
- Development-only donor, NGO, and volunteer demo accounts.
- Password-free browser mock session plus donor, NGO, and volunteer route guards.
- Guarded dashboard placeholders and a wrong-role `/unauthorized` route.

Authentication remains a frontend demonstration. There is no production session, OAuth, reset-email delivery, upload storage, identity verification, or authorization backend.

## Completed domain and mock service foundation (Phase 3)

- Strict TypeScript models cover users, role profiles, addresses, donations, safety declarations, claims, food requests, notifications, impact, incidents, and distributions.
- Central enums cover domain taxonomy and the existing role/status lifecycles.
- Bangladesh-focused mock state includes UIU Cafeteria, nearby donor businesses, verified NGOs, donations, claims, requests, notifications, and estimated impact history.
- Promise service adapters provide configurable latency, abort, loading, and mock error behavior.
- Central selectors calculate rescue time, urgency, and match-score display.
- Central transition maps validate donation, claim, and request state changes.
- Permission and privacy projection helpers hide exact donor address/contact from unauthorized viewers.
- `docs/API_CONTRACTS.md` documents the future backend boundary.

## Completed Food Donor dashboard (Phase 4)

- The guarded `/donor/dashboard` route now renders the complete responsive dashboard.
- Dashboard data comes from the typed profile, donation, impact, notification, and NGO services.
- Impact statistics, active donation, live rescue clock, lifecycle timeline, quick actions, activity, and supported NGOs are implemented.
- Responsive loading, error, empty, and no-active-donation states are included.
- Header profile summary, unread notification count, desktop sidebar, and mobile bottom navigation share one page implementation.
- A generated generic meal image is stored locally and rendered with Next.js Image.

## Completed Add Surplus Food flow (Phase 5)

- The guarded `/donor/donations/new` route now provides one responsive four-step wizard.
- Food details cover category, dietary type, quantity/unit, preparation and safe pickup times, storage, condition, allergens, description, instructions, and up to five optional local photo selections.
- Pickup details use the saved mock address, public approximate area, private contact data, pickup window, directions, and a non-interactive map placeholder.
- Food and pickup time consistency, positive quantity, contact fields, and all seven required safety declarations use blocking inline validation.
- Draft input survives forward/back navigation and can be persisted to session storage in the current browser tab.
- Submission uses the typed Phase 3 donation service, generates a mock donation ID, clears the saved draft, and renders the confirmation/next-step UI.
- Phase 5 introduced limited service-backed list/detail verification handoffs; Phase 6 has since upgraded them into the complete management and tracking experience.
- Sensitive pickup fields are visible on the owner-only detail response but remain excluded from public discovery projections.

## Completed donor donation management and tracking (Phase 6)

- `/donor/donations` now provides status overview cards, search, category/priority filters, sorting, seven working status tabs, lifecycle progress, rescue clocks, filter-aware empty states, and responsive management cards.
- `/donor/donations/[donationId]` now renders complete food, timing, storage, dietary, allergen, pickup, authorized NGO, issue, and lifecycle information.
- Donors can edit food/quantity/timing details only before pickup begins; service validation rechecks positive quantity and deadline/pickup consistency.
- Cancellation requires a reason, moves the donation to `CANCELLED`, and releases an active pre-pickup claim.
- Claim-linked issue reporting creates a typed incident record and consistently moves the claim and donation to `DISPUTED` when allowed.
- Share uses the device share sheet or clipboard fallback and returns accessible status feedback.
- `/donor/donations/[donationId]/tracking` includes permission-aware pickup/receiver route UI, current progress, volunteer and NGO summaries, mock ETA, contact controls, safety copy, and a clearly non-secure QR/fallback handover entry.
- The tracking service exposes receiver/volunteer contact details only to an authorized rescue participant; global donation projections remain approximate.

## Implemented routes

| Route | Status | Purpose |
|---|---|---|
| `/` | Implemented | Redirects to `/splash` |
| `/splash` | Implemented | Brand launch screen |
| `/onboarding` | Implemented | Three-step product introduction |
| `/login` | Implemented mock | Demo login and role landing navigation |
| `/forgot-password` | Implemented mock | Reset request and confirmation UI |
| `/role-selection` | Implemented | Public roles; admin remains invite-only |
| `/register?role=donor` | Implemented mock | Donor registration |
| `/register?role=ngo` | Implemented mock | NGO registration and required verification document |
| `/register?role=volunteer` | Implemented mock | Volunteer registration and required identity document |
| `/unauthorized` | Implemented mock | Wrong-role access explanation |
| `/donor/dashboard` | Implemented | Complete responsive Food Donor dashboard |
| `/donor/donations/new` | Implemented mock | Four-step Add Surplus Food wizard and confirmation |
| `/donor/donations` | Implemented | Searchable/filterable donation management and status tabs |
| `/donor/donations/[donationId]` | Implemented | Full ID-based detail, lifecycle, privacy-aware receiver data, and donor actions |
| `/donor/donations/[donationId]/tracking` | Implemented mock | Permission-aware tracking, ETA, contacts, map placeholder, and QR handover entry |
| `/ngo/dashboard` | Guarded placeholder | NGO authentication handoff; full dashboard begins in Phase 9 |
| `/volunteer/dashboard` | Guarded placeholder | Volunteer authentication handoff |
| `/design-system` | Implemented | Shared component and layout catalogue |
| `/preview/donor` | Implemented preview | Responsive donor shell demonstration |
| `/preview/ngo` | Implemented preview | Responsive NGO shell demonstration |

## Known limitations

- The installed Next.js version remains pinned; dependency upgrades were outside the completed phase scope.
- There is no automated test script or configured test suite yet. Business-rule tests are planned for Phase 17.
- Mock sessions and client route guards are not production security controls.
- The Phase 3 domain store is in-memory and resets on full reload.
- Donation wizard drafts use session storage; selected photo names are retained, but files are not uploaded.
- A newly submitted donation appears in My Donations during client-side navigation in the current app session and resets on full reload.
- Donation edits, cancellations, issue reports, tracking updates, and claim releases are in-memory mock operations and reset on full reload.
- Tracking maps and ETAs are visual placeholders; there is no live GPS, routing, or real-time socket connection.
- QR/fallback credentials are visibly labelled mock-only and are not production-secure, one-time, or backend-verified.
- Registration state intentionally survives step navigation only; it is not persisted across refreshes.
- Google login, reset-email delivery, uploads, and verification are clearly labelled frontend placeholders.
- NGO and volunteer dashboards remain minimal auth handoff pages.
- Donor notifications, NGO directory, profile, address, settings, and support destinations remain planned Phase 7-8 routes.

## Privacy and scope review

- No global screen exposes private donor contact details or an exact pickup address.
- Administrator public registration is disabled and described as invite-only.
- No payment, fundraising, bank, payout, or monetary donation UI is included.
- No production-security, medical food-safety, or environmental-impact guarantees are made.

## Upcoming phases

1. Phases 7-8: complete donor NGO directory/notifications and profile/settings/support.
2. Phases 9-14: complete NGO experience.
3. Phase 15: cross-device responsive QA.
4. Phase 16: accessibility, performance, and UX quality.
5. Phase 17: tests and backend readiness.
6. Phase 18: final QA and release-candidate documentation.

## Verification commands

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run build
npm.cmd run dev
```

Use `http://localhost:3000` after the development server reports ready.
