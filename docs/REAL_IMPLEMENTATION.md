# Real implementation roadmap

Updated: 21 November 2026 (Asia/Dhaka)

## Rescue coordination across donor, NGO and volunteer

- The three operational screens share next-step guidance, responsive contact cards
  and saved checkpoint presentation. Volunteer route actions precede phase-specific
  OTP entry; mission navigation highlights the current mission and keeps duty controls
  off the handover workspace. Maps and issue history open on demand.
- NGO claim responses include recorded receipt/distribution flags. Receipt comes
  before actual distribution, while volunteer completion means verified delivery.
  No GPS/ETA, safety verification or beneficiary impact is fabricated.
- Owner code panels poll abortable status requests, serialize issuance, count down
  server expiry and hide a replaced/used/blocked code. Replacement identity compares
  the server reissue timestamp, including codes clipped to the same deadline.
- Claim snapshots are bound to the account and claim. Donor tracking selects a
  relevant current claim and reads donation/claim state from its coordination detail,
  excluding cancelled history from relisted food. Existing server authorization,
  handover limits, locks and incident gates are unchanged.
- [Bangla coordination guide](RESCUE_COORDINATION_BN.md) describes the full demo;
  `npm run test:coordination:browser` covers 24 bilingual layouts plus real handovers,
  receipt, distribution, replacement codes, stale recovery and incident holds.

## NGO discovery and explainable recommendations

- List/map share responsive controls and URL-backed filters. Recommendations use
  accepted categories, actual collection deadlines and measured straight-line distance;
  unknown distance is never guessed. Cards explain verification/category/window checks
  without invented match percentages or rewriting donor-authored food descriptions.
- Collection time uses the earlier of pickup-window end and food safe deadline.
  Closed windows disappear locally without reload, cannot be newly published and
  cannot be reserved through the claim API. Listing refresh failures preserve the
  last good results with an explicit retry notice.
- A compact claim confirmation shows quantity, timing, storage and allergens. Client
  locking prevents duplicate submissions; a lost response reconciles with owned
  active claims. Existing server transaction locks retain competition and privacy rules.
- See [Bangla discovery guide](NGO_DISCOVERY_BN.md); `npm run test:discovery:browser`
  covers the bilingual list/map layout and operational flow.

## Private account verification documents

- NGO and volunteer registration completion includes authenticated document upload;
  existing pending accounts use NGO Verification or Volunteer ID card. PDF/JPG/PNG
  files are validated on the server (5 MB; PDFs 1–10 pages). Images are re-encoded
  without metadata; PDFs are rebuilt without source annotations and reject scripts,
  forms and embedded files. Files remain private database records with owner/admin ACL.
- Admin account reviews preview/download the actual file. Approvals require the
  current document ID and profile version. Uploads and reviews lock the same account
  row; retries are idempotent. Rejected accounts can resubmit and return to PENDING.
- Reviews retain the exact document version, author, note and time; earlier files
  remain private and immutable. Per-account stored document quota: 20 MB. Existing
  verified accounts remain verified. Sample documents are for a manual project demo;
  there is no automatic certification of document authenticity.
- See [Bangla verification guide](VERIFICATION_DOCUMENTS_BN.md) and run
  `npm run test:verification:browser` for the end-to-end registration/review workflow.

## Saved rider duty and assignment rules

- A single inline ON/OFF switch replaces the duplicate duty buttons and floating bar.
  New accounts start OFF; verified riders can turn ON. The API saves the state and
  shift start time; reloads and later logins retain it. Focus and cross-tab updates
  refresh from the server, with version checks to discard older responses.
- Both mission acceptance views disable acceptance while OFF, saving, unverified
  or already assigned. The server enforces duty ON under the same account lock used
  for assignment. Turning OFF keeps an active mission and its OTP handovers intact.
- Busy status is separate from duty and loads on direct visits to rider pages.
  Failed saves retain the previous displayed state with an error and retry option.
- `npm run test:duty:browser` covers Bangla mobile, English mobile and desktop,
  persistence, failed saves, cross-tab changes, account isolation and pickup while OFF.

## Bangla and English across the application

- One browser preference controls the home page, authentication screens and donor,
  NGO and volunteer portals. It persists after reload and synchronizes across tabs.
  Authentication screens expose the switch on mobile as well as desktop.
- Application copy uses a shared catalogue under `src/lib/i18n/copy`. Bangla uses
  everyday phrasing for actions, form guidance, status, validation and map notices.
  Dates and number displays follow the selected language; IDs, codes and API values
  retain their original formats.
- Translation is applied to authored UI copy. User names, organization names,
  addresses, food descriptions and report notes retain exactly what was entered.
  Recognized no-known-allergen phrases work in both Bangla and English.
- `npm run test:i18n` checks rendered copy coverage, placeholders and input handling.
  `npm run test:i18n:browser` checks the three portals, language persistence, tab
  synchronization, mobile validation, hydration and preservation of user content.
  Browser integration tests use isolated temporary PostgreSQL schemas.

## Optional sample images for donation demos

- The donor wizard offers Packed meals and Meal trays as explicitly labelled sample
  choices, in addition to real uploads and a neutral no-photo state. The draft and
  database persist sampleImageId; sample paths never enter the uploaded-photo library.
- Draft changes auto-save in session storage after the matching account profile has
  loaded, including sample selection/removal and switching to real photos. Submitted
  drafts stay cleared. New uploaded photos clear the sample choice. Sample choices are server-whitelisted
  and cannot be combined with uploaded food photos. Donor dashboard/detail, NGO
  discovery/detail/recommendations and claim screens share an image component that
  marks every sample as Sample image / উদাহরণ ছবি.
- Samples are illustrations, not evidence; receipt/distribution/incident photos still
  use authenticated real uploads. Existing donations are not given a sample automatically.
- Run npm run test:samples:browser for picker selection/removal, draft reload, actual
  UI publication, persisted donor/NGO/claim labels and switching to a real upload.

## Completed: demo cleanup and honest feature states

- Fixed all six remaining lint errors without disabling their rules. A subscribed
  clock supplies time-dependent pickup displays; language uses a browser storage
  subscription with server-safe hydration and cross-tab updates.
- Header searches only the current role's pages. Header/sidebar show actual account
  identity and session-scoped notifications; fabricated rescue totals, geographic
  telemetry, partner search results and sample rider identities are removed.
- Notification reads wait for successful server responses. Failed loads/updates
  display errors rather than pretending there are no records or showing false
  success. Broadcast events invalidate the server-backed feed instead of injecting
  their payload into a notification list or toast.
- Donor dashboard/profile and NGO/claim cards show recorded quantities/statuses.
  Invented freshness/match percentages, BFSA/NID approval, trust grades, certificates,
  leaderboard ranks, on-time performance and stock photos presented as uploads
  have been removed from connected workflows. A missing food photo uses a neutral
  Photo not provided illustration; galleries include actual stored photo URLs.
- Volunteer verified delivery count comes from the profile record. History meal
  counts come only from NGO distribution; a delivered batch does not count as
  distributed food before that record is saved.
- Donor/NGO settings retain working browser language, profile/address navigation and
  in-app notifications. SMS/push/email preferences, support tickets, team invitations
  show explicit unavailable states. NGO and volunteer verification documents now
  support private uploads, preview, review and resubmission through the admin dashboard.
- The volunteer ID route shows the actual project account profile. It does not
  issue government credentials, QR credentials or university credit.
- Public landing-page counters no longer simulate live activity; invented food
  listings/testimonials have been removed. Sign-in opens real account listings.
  The planning calculator is labelled as an illustrative example with its assumptions,
  separate from recorded impact. No staffed hotline is advertised.
- See [the Bengali demonstration guide](DEMO_GUIDE_BN.md) for setup, three browser
  sessions, location pins, food request/claim, OTP handovers, receipt/distribution,
  issue reporting, persistence and practical limitations.

## Completed: saved locations, food maps and navigation

- Donor /donor/addresses and NGO /ngo/addresses let each account save its own handover
  location by clicking/dragging a Leaflet pin, using a one-time device location, or
  entering latitude/longitude and clicking Apply coordinates. Save commits it to
  PostgreSQL. Zero/negative coordinates are valid; malformed/out-of-range pairs
  and attempts to change another account's pin are rejected.
- Device location requires browser permission and HTTPS or localhost. Permission
  denial, an insecure LAN URL, or unavailable GPS still permits manual pin entry.
  This is a one-time location selection, not background volunteer GPS tracking.
- New donations snapshot their saved pickup coordinates. Requests snapshot their
  delivery coordinates when published/updated; new claims freeze the delivery
  address and pin. Later profile pin edits do not move those rescue records.
  No guessed coordinates are backfilled into older donations/requests. A donor
  should save the pin first, then publish a new donation for the map demonstration.
  Older claims retain text-address fallback without treating later pins as history.
- NGO discovery plots only persisted donation coordinates. Before claim the server
  rounds the location to a 0.01-degree grid (roughly one kilometre); exact pickup
  coordinates/address/contact remain available only to the owner, claiming NGO,
  assigned volunteer and administrator. A cancelled claim loses exact pickup access.
- Discovery distance uses the Haversine straight-line estimate between the NGO's
  own primary address pin and the donation's coarse area pin. It is not road length,
  live rider distance or an ETA. All is the default distance filter; a selected
  radius excludes unknown distances. If the NGO primary address has no pin, no
  nearby distance is inferred. Nearest sorting places unknown distances last.
- Donation pickup/request forms preview their saved pins. Claim coordination,
  donor tracking and assigned volunteer missions show the actual saved endpoints
  and open Google Maps directions on request. Missing pins show text/phone fallback.
  Fake radar points, moving riders, preset routes, speed and arrival time have
  been removed from these connected maps.
- Leaflet loads standard OpenStreetMap tiles with visible attribution and normal
  browser caching. Tile failures leave pins/address/manual input available.
  User-provided popup titles/descriptions use DOM textContent, avoiding HTML injection.
  Map tiles need internet; no geocoding or road-routing service is configured.
- The map browser test covers mobile pin selection, one-time GPS, persistence,
  real tile loading, radius filtering, missing-origin handling, escaped popups,
  claimed navigation links and denied tile/GPS manual fallback. Screenshots are
  in .local-postgres/map-browser/.

Demo order: donor saves pickup pin; NGO saves and selects a primary delivery pin;
donor publishes food; NGO opens /ngo/discover/map, optionally selects 5 km,
then claims a donation. Claim details and the assigned volunteer mission provide
the exact pickup/delivery map and navigation links.

Map implementation references: [Leaflet 1.9.4](https://leafletjs.com/reference-1.9.4.html),
[OpenStreetMap tile policy](https://operations.osmfoundation.org/policies/tiles/),
[Google Maps URLs](https://developers.google.com/maps/documentation/urls/get-started)
and [browser geolocation](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition).
Tile availability is best effort. Do not bulk-download/prefetch or disable tile caching.

## Completed: authentication and PostgreSQL foundation

- Exact password checking, server-issued HttpOnly/SameSite cookies, remember-me,
  session rotation, logout/revocation, expiry and portal role enforcement.
- Passwords intentionally remain plaintext at the project owner's request.
  Session tokens are independently protected by storing only their SHA-256 digest.
- Accounts and sessions now use Prisma/PostgreSQL. Runtime authentication no longer
  reads the JSON account or session files. Old JSON session cookies are not migrated;
  log in again after the upgrade.
- Registration creates the user, role profile, owned primary address and preferences
  in one database transaction. Unique canonical email and normalized phone prevent
  duplicate registration, including concurrent requests.
- The current session exposes real donor/NGO/volunteer profile IDs. Profile and address
  APIs derive identity from that session, ignoring browser-supplied owner IDs.
- Profile editing, owned saved addresses, and user-specific notification read state
  persist in PostgreSQL. Notifications cannot be created arbitrarily by a browser.
- Account deactivation immediately invalidates access through existing sessions.

## Completed: shared donation/claim data

- The donation wizard writes once to the database; confirmation, list, detail,
  discovery, claim coordination and donor tracking use the same persisted IDs.
- Pickup address defaults come from the current donor's actual saved addresses.
  Draft storage is scoped to the signed-in user. Actual food photos now upload to
  authenticated storage; sample images are not saved as claimed user uploads.
- Server validation covers positive quantities, enum values, pickup/deadline ordering,
  contact phone, owned pickup address and all required safety declarations.
- Donors can access only their own listings. Before claiming, NGOs see approximate
  pickup areas; exact donor address/contact are visible only to the owner, the claiming
  NGO and its assigned volunteer. OTP tokens are absent from general read responses.
- NGO claims lock the donation row in a transaction. A partial unique index also
  prevents multiple active claims while retaining cancelled/expired claim history.
- Release preserves the old claim and makes unexpired food available again.
- Volunteer acceptance uses the authenticated volunteer profile, prevents takeover
  and multiple active missions, and commits claim/donation status and notifications
  together. The dispatch API contains only real, unexpired reserved claims.
- Assignment UI waits for a successful API response before displaying success.
- Dashboard totals/impact, verified NGO directory and notification lists read real
  database records; fabricated totals are not used for these connected modules.
- Pickup/delivery require dedicated server OTP verification; generic status PATCH
  requests cannot bypass those handovers.

Compatibility method parameters and some old `Mock*` symbol names remain in the UI
while secondary modules migrate. Those parameters do not grant backend access.

## Completed: verified handover, receipt and distribution

- Donor issues a six-digit pickup code after volunteer assignment. After pickup,
  the receiving NGO issues a separate delivery code. Only the assigned, verified
  volunteer can submit those codes to advance the rescue.
- Codes use cryptographic randomness. The database stores an HMAC digest, never
  plaintext OTPs. The issuer sees a code only in the issue response; general claim,
  mission, dispatch and metadata responses expose neither code nor digest.
- Codes expire after at most ten minutes, respect the donor-declared safe deadline
  (and pickup window end), permit five incorrect attempts, and are single-use.
  Replacement requires a one-minute delay and invalidates the previous code.
- Donation-row locks serialize verification attempts, cancellation, receipt and
  distribution, preventing concurrent verification or duplicate impact increments.
- Volunteer assignment and route stages hydrate from PostgreSQL after reload.
  Stage updates cannot mark pickup or completion without OTP proof.
- After verified delivery, the claiming NGO records received quantity, food condition,
  mismatch acknowledgement and notes. Damaged/poor food blocks distribution.
- Distribution requires the receiving NGO's address, consent declaration, valid
  timestamp and aggregate counts. Meals cannot exceed the received proportion of
  the donor's declared capacity. The donor-declared safe food deadline is enforced.
- One transaction records distribution, impact, status changes, NGO counters and
  participant notifications. Volunteer delivery completion is counted once at handover.
- Environmental numbers are project estimates using illustrative factors, with the
  methodology stored on every impact record; they are not measured environmental results.
- Codes are shared in the app during handover. SMS/email delivery is not connected.
  Receipt/distribution photos now use actual authenticated image storage.
- The new mission cockpit and route progress use actual participants/status. Old
  simulated QR/PIN shortcuts were removed from the operational handover controls.
  Saved endpoint maps replace donor route art; volunteer GPS/temperature are not measured.

### Varsity demonstration sequence

1. Log in as donor, create an unexpired food donation with a valid pickup address.
2. Log in as a verified NGO and claim it.
3. Log in as a verified volunteer, accept the dispatch and open the assigned mission.
4. Donor opens donation detail/tracking and generates the pickup code at handover.
5. Volunteer submits that code in the mission cockpit; status becomes PICKED_UP.
6. NGO opens claim detail and generates a delivery code when the food arrives.
7. Volunteer submits that code; status becomes DELIVERED and history persists.
8. NGO records the receipt, then distribution within the donor-declared safe deadline.
9. Check donor/NGO impact and volunteer history, including after a page reload.

Use separate browser profiles or log out before changing roles; tabs within the same
browser profile share the same authentication cookie. Use synthetic demo data.

## Completed: actual photo storage

- Donor food photos, NGO receipt photos and distribution evidence are uploaded as
  real files. Forms show actual previews, permit removing unused uploads, and display
  saved galleries after reload. The previous donor photo presets were removed.
- JPEG, PNG and static WebP only; at most five photos per record, 5 MB per input file
  and 20 megapixels. Both MIME/signature and actual decoding are checked. SVG/GIF,
  corrupt files, oversized requests and excessive batches are rejected.
- Sharp auto-orients and re-encodes decoded pixels to WebP (maximum 1600 by 1600),
  strips EXIF/GPS metadata, and caps the stored image at 2 MB.
- Actual bytes and metadata are stored in PostgreSQL's photo_assets table. This keeps
  this university demo self-contained and includes images in database backups.
  Each account is limited to 100 MB and 200 total photo assets.
- The upload API returns metadata/URLs only, never image byte arrays in JSON.
  Attaching a photo checks owner, purpose, claim and previous attachment inside the
  record transaction. Invalid/racing saves cannot partially bind images.
- Pending uploads are visible only to their owner. The previous-uploads control can
  recover or delete unused files after navigating away or reloading.
- Donation photos follow donation visibility (including NGO discovery). Receipt and
  distribution photos become visible to rescue participants after the matching record
  is saved; unrelated accounts cannot retrieve them.
- Authenticated image routes use no-store responses. Next Image uses direct requests
  for these preprocessed images so browser cookies accompany each image request.
- A photo is supporting evidence. It does not automatically certify food safety,
  identity or delivery; OTP handover and NGO receipt validation remain separate.
- This storage design suits the local demonstration. A larger hosted deployment
  should use object storage with equivalent access controls; it has not been deployed.

## Completed: incident reporting and controlled review

- Donor, claiming NGO and assigned volunteer can submit a claim-scoped incident
  from their own portal. Reports include category, severity, factual description,
  contact preference and actual image evidence; identity comes from the session.
- Reports start SUBMITTED. UNDER_REVIEW is shown only after an actual review action.
  Participants can read shared report/evidence/review history; unrelated accounts
  cannot read, submit to or review that rescue.
- A report on an ongoing rescue atomically moves claim/donation to DISPUTED,
  remembers the prior claim status, expires unused OTPs and notifies participants.
  Pickup, delivery, release/cancellation and distribution cannot bypass the hold.
  Even a low-priority safety report pauses the rescue; severity cannot disable it.
- Paused in-transit missions remain assigned to the volunteer and prevent accepting
  another mission. Rejected batches are closed and release that assignment.
- Submission keys make network retries idempotent. Reusing a key for different
  details is rejected; duplicate open reports by the same author/category are blocked.
  Evidence attachment, hold and notifications commit together under a donation lock.
- Review is ADMIN-only through PATCH /api/incidents, or through the local operator
  command below. Every action records actor, timestamp, note and decision in an audit
  table. Ordinary participants cannot clear their own reports.
- RESUME requires every blocking report to be resolved without a rejection, a valid
  donor-declared safe deadline and no damaged/poor NGO receipt. It restores the prior
  workflow status; old OTPs remain expired and replacements must be generated.
- REJECT_FOOD cancels the ongoing rescue and never relists that batch. Review does
  not certify food safety; an operator must assess the situation before allowing resume.
- Reports submitted after distribution are retained as post-distribution audit
  reports. Completed distribution/impact records remain historical facts; no delivery
  or served-meal record is silently erased.
- Phone/email preferences are recorded only; notifications remain in-app. There is
  no automated SMS/email response or external support-team escalation.
- ADMIN accounts can review reports at `/admin/reports`. The local CLI remains
  available. Account verification, rescue oversight and recorded decisions are
  available in the responsive admin workspace. See [Admin guide](ADMIN_GUIDE_BN.md).

Local operator commands (copy the report ID from the portal):

```sh
npm run db:incident -- REPORT_ID UNDER_REVIEW "Describe what the operator checked"
npm run db:incident -- REPORT_ID RESUME "Record the reason this rescue may continue"
npm run db:incident -- REPORT_ID REJECT_FOOD "Record why this batch must not be served"
npm run db:incident -- REPORT_ID CLOSE "Record the final review closure note"
```

Choose RESUME or REJECT_FOOD after review; CLOSE is allowed only after resolution.
Each note must contain at least twelve characters. Rejecting food and resuming a
rescue are explicit operator decisions, not actions available to ordinary accounts.

## Completed: NGO food requests, matching and meal fulfillment

- Requests, list/detail/edit/cancellation and dashboard activity use authenticated
  PostgreSQL data. Only the owning NGO can read or change its requests.
- Verified NGOs publish directly into FINDING_MATCH. Request publication does not
  claim that an administrator reviewed the need; admin workflow remains deferred.
  Pending NGOs can prepare a local draft but cannot publish.
- Drafts are scoped to the signed-in account. Saved delivery addresses hydrate from
  the actual NGO profile, and the server stores a trusted address snapshot. Submitted
  address text or NGO identity cannot override the authenticated owner/address.
- Input validation covers real enum values, positive whole meal/recipient counts,
  urgency reasons and future deadlines within ninety days. Submission keys make
  retries idempotent, with conflicting key reuse rejected.
- Suitable donations are evaluated against categories, declared diet, known allergen
  conflicts, delivery city, time window and availability. Restriction-bearing requests
  require an explicit declaration-review acknowledgement before reservation.
- These rules are coordination assistance, not medical clearance. Match scores are
  rule-based. Saved-pin maps now provide approximate straight-line discovery distance;
  road routes, volunteer GPS and arrival times are not measured.
- A reservation creates a normal claim linked to the request, allocates only the
  remaining target meals and sets MATCHED. The whole donation batch is claimed; an
  allocation is demand accounting, not a split donation listing.
- Actual distribution contributes at most the claim's allocation toward the request
  target. Extra distributed food still contributes its actual amount to impact.
  Short deliveries/distributions leave the remaining demand open.
- Donation/request row locks prevent concurrent claims from over-reserving a need.
  Release, donor cancellation and rejected incident batches return unused allocation.
  An incident hold retains the allocation until the batch is resolved or rejected.
- Active linked rescues prevent editing/cancelling the request. Requests with recorded
  pickup/delivery or distribution retain their original requirements; cancelling the unfilled remainder
  preserves distribution, impact and request history.
- Linked volunteer missions and claim coordination use the request's delivery snapshot.
  Distribution must use that request's owned delivery address to count toward the need.
- Requests become FULFILLED only from recorded meals. Deadline expiry stops new
  reservations; existing rescue batches can still finish within their food deadline.
- Recurring-program intent describes the stated occurrence. Future occurrences are
  separate requests. The old filename-only document selector was removed.
- Saved-pin maps are now connected in the next increment; the full admin UI remains deferred.

## Local database and startup

Use Node.js 22 or later. The project includes portable PostgreSQL binaries via the
`embedded-postgres` development dependency; the local helper uses `pg_ctl` with hidden
child processes on Windows. It creates no Windows service and listens only on
`127.0.0.1:5433`.

First setup, before starting the app:

```sh
npm install
npm run db:setup
npm run dev
```

`db:setup` generates Prisma Client, starts the local cluster, applies migrations and
imports legacy JSON data. It also generates a random OTP_SECRET in gitignored
`.env.local`; preserve that value across app restarts. Hosting requires its own random
secret of at least 32 characters. No secret is embedded in browser bundles.
The generated database password is stored in gitignored
`.local-postgres/credentials.json`. Its connection URL is written to `.env.local`,
which Next and the database scripts load ahead of `.env`.

The `predev` hook restarts an already-configured local cluster as needed. On this
workspace it is already set up. Start the app with `npm run dev` or the existing
Windows launcher. For separate PostgreSQL hosting, set DATABASE_URL and use
`npm run db:migrate`; the local helper never replaces an existing DATABASE_URL entry
in `.env.local`.

Useful commands:

```sh
npm run db:local:start
npm run db:local:status
npm run db:local:stop
npm run db:migrate
npm run db:import
npm run db:seed
npm run db:verify -- account@example.com
```

`db:seed` now adds only the three known demo accounts when missing. It never clears
tables or replaces existing accounts. Demo login credentials remain `Demo1234` for
those three specific accounts. No universal password override exists.

New NGO and volunteer registrations remain pending verification. The local project
operator can explicitly approve a selected account using `db:verify`; public users
cannot self-approve. An administrator approval UI is still pending.

Use `AUTH_COOKIE_SECURE=false` for HTTP localhost demos and `true` for HTTPS hosting.
Do not publish the current plaintext password implementation as production-ready.

## Existing data migration

The first successful import added 9 accounts with their profiles/addresses,
1 donation, 1 claim and 46 per-user notification records. Repeating the import added
zero duplicates. Existing database rows are not overwritten, and source JSON remains
unchanged.

Three source records need attention:

- Two accounts have phone numbers already used by imported accounts. They remain
  in the source JSON until their owner confirms unique phone numbers.
- One claim references a donation that does not exist. It remains in the source JSON;
  the importer does not manufacture a food listing to satisfy that reference.

Reports are stored under gitignored `data/migration-reports/` with source IDs and
reasons. Reports do not include passwords. No user data was deleted.

## Verification

```sh
npm run build
npm run test:auth
npm run typecheck
npm run test:photos:browser
npm run test:incidents:browser
npm run test:requests:browser
npm run test:maps:browser
npm run test:cleanup:browser
npm run test:samples:browser
```

The integration suite uses a real production Next server and a separate randomly
named PostgreSQL schema. It applies the committed migrations, creates synthetic
accounts, exercises HTTP/cookie behavior, restarts the app, and removes only its
own test schema. It never clears the application's public schema or JSON source.

95 HTTP integration tests cover authentication, ownership, donation privacy, concurrent claims and
assignment, wrong/expired/replaced/replayed OTPs, attempt locking, application restart,
route persistence, delivery receipt validation, damaged-food blocking, distribution
validation, duplicate submission races, prorated kilogram impact and actual impact/history. Photo cases cover real bytes,
validation, privacy, normalization/metadata stripping, large multipart batches,
atomic attachment, unused libraries, quota and restart persistence. Incident cases
cover all participant roles, evidence privacy, idempotency, holds, blocked bypasses,
admin review, operator CLI, rejection, restart persistence and distribution races.
Request cases cover owner isolation, verified publication, deadline/input validation,
matching privacy, reservations, race protection, partial/excess meal accounting,
release/rejection, delivery snapshots and fulfillment after restart. Location cases
cover coordinate validation/ownership, zero/negative values, clear/preserve behavior,
coarse discovery privacy, immutable pickup/delivery snapshots and assigned mission access.
The suite also checks HTTP rendering of the new operational pages. New backend,
services, handover controls, mission/dispatch UI and tests pass scoped lint.
Project-wide lint passes with zero errors and 144 remaining warnings in older modules.
Build and TypeScript checks pass.

A separate Playwright browser test passed in headless Microsoft Edge: donor upload,
preview, removal, draft restoration and saved donation gallery; mobile NGO receipt and
distribution image upload, submission and persistence after reload. Test screenshots
are under gitignored .local-postgres/photo-browser/. On Windows the command uses the
installed Edge browser; elsewhere install Chromium with npx playwright install chromium
or select an installed browser with PLAYWRIGHT_CHANNEL.
A second Edge browser test passed across donor, NGO and volunteer incident screens:
evidence upload, shared report visibility, disabled handover during a hold, reports
from all three roles, review history and rejection. Mobile screenshots are under
.local-postgres/incident-browser/. A third Edge test passed the food request flow:
NGO publication and matching, linked reservation, volunteer acceptance, donor pickup
OTP, NGO delivery OTP, receipt, distribution and persisted 20/20 fulfillment.
It also verifies that entering the review step does not auto-submit the wizard.
Request screenshots are under .local-postgres/request-browser/. A fourth Edge test
covers saved location maps, nearby filters, privacy, navigation and failure fallback.
Run npm run test:maps:browser for that test. The cleanup browser case additionally
checks real account identity, missing-photo behavior, browser language persistence,
notification read/load failures, owner isolation and unavailable secondary modules.
Run npm run test:cleanup:browser. Full human acceptance remains separate.

## Remaining increments

1. Connect team invitations, support tickets and password reset.
2. Connect real volunteer GPS/telemetry, road routing/ETA, scoring and certification displays
   with measured data or explicit unavailable states. SMS/push and SOS delivery are pending.
3. Review remaining lint warnings and dependency audit findings, then perform the
   human three-account demonstration using DEMO_GUIDE_BN.md.

Authentication, shared rescue data, verified handover/distribution, photos and incidents work against
PostgreSQL. Food requests also use the shared rescue/distribution workflow. The secondary
modules above still prevent calling the entire product complete.
