# ShareBite BD Project Status

Last audited: 2026-08-19
Current milestone: Phase 11 complete

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

## Completed donor-facing NGO directory and profiles (Phase 7)

- `/donor/ngos` now provides service-derived verified-organization overview metrics, name/area search, cause filtering, accepted-food-category filtering, service-area filtering, saved-only state, reset controls, loading/error/empty states, and responsive organization cards.
- NGO directory cards clearly label verification and rating/impact values as mock or demo data.
- `/donor/ngos/[ngoId]` now renders organization identity, verification, mission, vision, values, accepted categories, service areas, historical demo statistics, recent service-derived rescue activities, public contact actions, and a privacy-safe gallery.
- NGO public fields are typed in `NGOProfile`; derived impact and recent activity are assembled by `ngoService` rather than page-level raw mock imports.
- Save/follow-style state persists in session storage for the current browser tab.
- The Donate Surplus Food CTA opens the Phase 5 wizard with a typed preferred-NGO context; the UI explicitly says this preference does not guarantee matching or bypass claim rules.
- A generated wide NGO gallery asset contains only prepared meals, food-rescue supplies, and an empty community meal space—no identifiable people, logos, text, or exact location.
- Both directory and profile explicitly exclude monetary donations, fundraising, bank details, and payout actions.

## Completed donor account and support modules (Phase 8)

- `/donor/notifications` includes all/unread/urgent/donation-update filters, typed category and priority presentation, mark read/unread, mark-all-read, loading/error/empty states, and working deep links.
- `/donor/profile` presents verified donor identity, private contact details, service-derived impact metrics, account destinations, and browser-session logout.
- `/donor/profile/edit` validates and writes donor identity, contact, organization, and donor-type changes into the shared frontend mock state.
- `/donor/addresses` supports adding, editing, selecting a primary pickup location, and removing addresses with owner checks in `profileService`.
- `/donor/settings` updates typed push/email, language, and text-size preferences and transparently displays browser location state. Dark mode is withheld until the design system supports a complete theme.
- `/donor/support` provides privacy/safety/payment-scope FAQs and a validated contact form with a mock success reference.
- No payment methods, cards, monetary donations, fundraising, bank details, or payout controls exist.

## Completed NGO dashboard (Phase 9)

- `/ngo/dashboard` now renders a verified Hope Foundation greeting, registration/service-area context, and capacity summary.
- Typed service data powers nearby available-donation count, active claims, meals distributed, beneficiaries served, unread alerts, requests, and activity.
- The recommended donation includes a local food image, computed match percentage, approximate distance, priority, live deadline clock, lifecycle preview, and a working claim CTA.
- Claiming the seeded nearby listing uses `claimService`, creates an NGO-owned reserved claim, updates donation status, and refreshes the dashboard into the active-claim/empty-recommendation state.
- Quick actions cover Browse Food, My Claims, Create Demand Request, and Confirm Delivery.
- Active claims show status, area, pickup ETA, volunteer assignment, match percentage, and claim CTA.
- Responsive loading, error, recommendation-empty, active-claim-empty, desktop sidebar/grid, and required five-item mobile bottom navigation are included.
- Planned NGO destination routes now have clear guarded handoff screens instead of 404 responses; their complete workflows remain in Phases 10, 12, 13, and 14.

## Completed NGO discovery and rescue map (Phase 10)

- `/ngo/discover` provides service-ranked recommendations with match percentage, approximate distance, priority, quantity, preparation time, storage, deadline clock, search, sorting, and complete filters.
- Distance, category, dietary compatibility, minimum meals, urgency, storage, deadline, search, and sort state are encoded in the URL and preserved when switching between list and map.
- The actionable empty state shows current criteria, resets to all donations, links to Create Food Request, and stores an optional frontend-only availability alert preference.
- `/ngo/discover/map` renders intentionally offset approximate pins, Hope Foundation's service-area marker, available/urgent/NGO legend, selected donation preview, nearby list, and a prominent privacy boundary.
- `/ngo/donations/[donationId]` renders donor organization, approximate pickup, quantity, preparation, storage, deadline, dietary/packaging details, allergens, donor safety declarations, eligibility checks, save-for-later state, and a working claim CTA.
- `discoveryService` is the typed privacy boundary for list/detail projections, donor identity, match scoring, and eligibility; exact address/contact/directions remain absent from discovery screens before claim acceptance.
- Four additional available mock listings cover bakery, produce, groceries, and dairy with varied distance, quantity, deadline, diet, priority, and storage values so every filter has meaningful data.
- Claim creation now enforces the NGO profile's accepted food categories in addition to verified ownership and availability.

## Completed NGO claims, verification, and tracking (Phase 11)

- `/ngo/claims` now provides service-backed claim summaries, search, seven status filters, active/history sections, rescue deadlines, volunteer assignment, and ETA context.
- `/ngo/claims/[claimId]` renders the donation, donor, authorized exact pickup details, five-step claim timeline, volunteer coordination, and privacy-aware route preview.
- Pickup and delivery use distinct mock QR placeholders and distinct six-digit fallback codes with explicit frontend-only, time-limited, and one-time language.
- Demo actions cover release before pickup, verified volunteer assignment, pickup verification, delivery receipt, and typed quick incident reporting.
- `claimService.getCoordinationDetails` validates rescue participation before returning private coordination data and reuses the central donation privacy projection.
- Full quantity/condition confirmation, evidence upload, distribution recording, and detailed incident workflows remain assigned to Phase 13.

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
| `/donor/ngos` | Implemented | Verified NGO search, cause/category/location filters, saved state, and responsive cards |
| `/donor/ngos/[ngoId]` | Implemented | ID-based organization identity, impact/activity, gallery, contact, and food CTA |
| `/donor/notifications` | Implemented mock | Categorized alerts, filters, deep links, and read/unread state |
| `/donor/profile` | Implemented mock | Verified donor profile, contact, impact, account links, and logout |
| `/donor/profile/edit` | Implemented mock | Validated profile update into shared mock state |
| `/donor/addresses` | Implemented mock | Add, edit, select, and remove saved pickup addresses |
| `/donor/settings` | Implemented mock | Notification, language, text-size, location, and policy preferences |
| `/donor/support` | Implemented mock | FAQ and mock contact-support success flow |
| `/ngo/dashboard` | Implemented mock | Responsive typed NGO overview, recommendation/claim, active claims, actions, and activity |
| `/ngo/discover` | Implemented mock | Shared-filter recommendation list, sorting, save state, and actionable empty state |
| `/ngo/discover/map` | Implemented mock | Privacy-safe approximate rescue map, preview, legend, and nearby list |
| `/ngo/donations/[donationId]` | Implemented mock | ID-based food, safety, eligibility, privacy, save, and claim details |
| `/ngo/claims` | Implemented mock | Search, status filters, summaries, active/history cards, volunteer and ETA context |
| `/ngo/claims/[claimId]` | Implemented mock | Authorized tracking, timeline, mock pickup/delivery verification, contacts, route, and actions |
| `/ngo/claims/[claimId]/confirm-delivery` | Guarded handoff | Full quantity, condition, evidence, and receipt flow pending Phase 13 |
| `/ngo/requests/new` | Guarded handoff | Working dashboard/mobile-navigation destination; full Phase 12 module pending |
| `/ngo/profile` | Guarded handoff | Working mobile-navigation destination; full Phase 14 module pending |
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
- NGO ratings, people-helped totals, completed rescues, capacity, and profile histories are clearly marked mock/demo values until a backend provides reviewed organization data.
- Saved NGOs use session storage only and reset when that browser-tab session ends.
- The preferred-NGO donation field records matching context only; it does not create or guarantee a claim.
- Registration state intentionally survives step navigation only; it is not persisted across refreshes.
- Google login, reset-email delivery, uploads, and verification are clearly labelled frontend placeholders.
- The volunteer dashboard remains a minimal auth handoff page.
- NGO Demand Request and Profile destinations remain guarded handoffs until their dedicated phases.
- NGO dashboard match percentage is a transparent frontend heuristic, not a production recommendation model or guarantee.
- Discovery match and eligibility values are frontend heuristics for the mock experience; production values must be backend-derived and auditable.
- Rescue-map pins are intentionally approximate visual placements, not live GPS coordinates or navigation routes.
- Saved donations and optional discovery alerts use session storage only; no real notification is sent.
- Profile, address, notification, and preference changes reset on full reload because the shared mock state is in memory.
- The support form returns a local mock reference and does not send an external message.

## Privacy and scope review

- No global screen exposes private donor contact details or an exact pickup address.
- Administrator public registration is disabled and described as invite-only.
- No payment, fundraising, bank, payout, or monetary donation UI is included.
- No production-security, medical food-safety, or environmental-impact guarantees are made.

## Upcoming phases

1. Phases 12-14: complete NGO requests, delivery/distribution exceptions, impact, notifications, and account experience.
2. Phase 15: cross-device responsive QA.
3. Phase 16: accessibility, performance, and UX quality.
4. Phase 17: tests and backend readiness.
5. Phase 18: final QA and release-candidate documentation.

## Verification commands

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run build
npm.cmd run dev
```

Use `http://localhost:3000` after the development server reports ready.
