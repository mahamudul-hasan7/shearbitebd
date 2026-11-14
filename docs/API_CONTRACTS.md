# ShareBite BD Frontend API Contracts

Current implementation (14 November 2026) uses authenticated /api routes with
PostgreSQL persistence. See [REAL_IMPLEMENTATION.md](REAL_IMPLEMENTATION.md) for the
verified scope. The Phase 3 conventions below are historical and do not supersede
the implemented route handlers.

## Volunteer duty

- GET /api/volunteer/duty returns the authenticated rider's saved duty state,
  start time, version, active-mission status and permission to go on duty. New accounts start OFF.
- PATCH /api/volunteer/duty accepts { isOnDuty: boolean }. Identity comes from
  the session; only verified riders can turn ON. Repeating the same state does
  not reset the start time or increment its version.
- POST /api/dispatches requires duty ON. Assignment and duty updates lock the
  same user row, so concurrent requests respect the committed duty state.
  Turning OFF does not cancel an assigned mission or prevent its OTP handovers.
- The rider pages use one inline ON/OFF switch. State is applied after saving,
  persists across reloads, and refreshes on tab focus and cross-tab changes.

## Distribution form feedback and time

- GET /api/distributions includes serverTime alongside distribution. The form
  uses this timestamp to account for a different phone/computer clock.
- Distribution validates counts, received meal capacity, receipt chronology,
  location and consent before sending. Errors focus the relevant field, while
  server-only errors scroll into view. Native validation cannot silently stop submission.
- Use current time fills the time from the server clock offset. Server checks
  still reject future times, pre-receipt times and expired food.
- A successful save immediately shows the stored record. A second request is not
  needed to show completion. test:distribution:browser covers mobile, desktop,
  invalid form feedback, failed writes, reload and fast/slow device clocks.

## Optional donation sample images

- POST /api/donations accepts optional sampleImageId: packed-meals or meal-trays.
  The server stores this choice separately from photoUrls and uploaded PhotoAsset
  records. Arbitrary paths/URLs/IDs and a sample combined with uploaded photos are rejected.
- Donation responses include the optional sampleImageId. Donor/NGO/claim images
  resolve it through the fixed catalogue and display an explicit Sample image label.
- The wizard restores the selected sample from its account-scoped draft. Adding an
  uploaded photo clears the sample choice. Removing the sample returns to the neutral
  no-photo state. Receipt, incident and distribution evidence still require real uploads.

## Implemented cleanup behavior

- GET /api/missions also returns completedRescues from the authenticated volunteer
  profile. Completed-history servings count recorded NGO distribution meals, or zero
  while distribution is pending; verified delivery and actual distribution are separate.
- Notification clients use the authenticated /api/notifications and read-all endpoints.
  Failed requests throw; no read-success broadcast is emitted until the write succeeds.
  Broadcast payloads cannot create visible server notification records.
- Read-only verification/profile pages use /api/profile. Disconnected settings,
  invitations, support tickets and certificate flows no longer simulate successful writes.

## Implemented saved-location behavior

- POST /api/profile accepts addAddress/updateAddress with optional coordinates:
  { latitude: number, longitude: number } or null to clear. Omitting coordinates
  on update preserves the pin. All mutations are scoped to the authenticated owner.
- POST /api/profile also accepts { action: "setCoordinates", id, input:
  { coordinates: { latitude, longitude } | null } }. This edits only the owned
  address pin, including addresses whose text is protected by donation history.
  Latitude is -90..90 and longitude -180..180; both values are required together.
- Donation publish and request publish/update copy coordinates from the owned saved
  address. Browser-supplied coordinates/distance do not set rescue snapshots.
- Donation pickup.approximateCoordinates is rounded to a 0.01-degree grid. Exact
  coordinates are available only in pickup.exactAddress.coordinates to authorized
  participants. Old/missing pins are omitted; no coordinate is invented.
- Claim details.deliveryAddress and assigned mission pickupCoordinates/dropoffCoordinates
  use saved snapshots. Later address pin edits do not move existing rescue endpoints.
- Discovery computes approximate straight-line distance client-side from the NGO's
  own primary pin and the server-provided coarse donation location. Radius defaults
  to All; a specific radius excludes donations with unavailable distance.
- GET /api/missions?claimId=... exposes exact endpoints only to the assigned volunteer.
  Public dispatch listings do not expose exact coordinate pairs or infer exact
  distances. Maps/navigation use actual endpoints only where permitted.

## Implemented incident endpoints

- GET /api/incidents supports claimId, donationId or id filters. The session limits
  records to the donor, claiming NGO, assigned volunteer, or an administrator.
- POST /api/incidents accepts { claimId, input } (donationId can select the latest
  accessible claim). Input contains type, severity, description (12–2000 characters),
  preferredContactMethod, optional evidenceUrls, and a 16–100 character submissionKey.
- Creation returns { incident, created } with 201, or 200 for an identical retry.
  A changed payload under the same key or duplicate open author/category returns 409.
- Current rescue reports pause claim/donation as DISPUTED and expire pending OTPs.
  Reports after DISTRIBUTED are audit reports and preserve historical records.
- PATCH /api/incidents is ADMIN-only: { id, action, note }. Actions: UNDER_REVIEW,
  RESUME, REJECT_FOOD, CLOSE. Notes require 12–2000 characters. Review returns
  { incident }; record history includes actor label, status, decision and timestamp.
- RESUME restores the held stage only after all blocking reports are resolved and
  the declared deadline/receipt checks pass. REJECT_FOOD closes the batch; CLOSE
  follows resolution. Participants cannot clear a hold themselves.
- Evidence uses POST /api/photos with purpose INCIDENT and claimId. Only actual,
  owned uploads from the same claim can be attached; protected photo reads enforce
  participant access. Formats and limits are documented in the roadmap.

## Implemented food request endpoints

- GET /api/requests lists the authenticated NGO's requests; id selects an owned request.
  Adding matches=true returns current suitable donations with approximate pickup data.
- POST /api/requests publishes a validated verified-NGO request with an owned
  deliveryAddressId, submissionKey and the declared food/time/recipient requirements.
  Returns { request, created } with 201; identical retries return 200.
- PATCH /api/requests accepts { id, action: "update", input } or { id, action: "cancel" }.
  Identity, status and fulfillment cannot be set through update input.
- POST /api/claims accepts optional foodRequestId and allergenReviewAcknowledged.
  Server matching is rechecked under locks; the claim carries requestMealsAllocated.
- Request responses contain mealsFulfilled, mealsReserved, remainingMeals and
  linkedClaims. Reservation sets MATCHED; actual distribution advances fulfillment.
  Excess batches are capped to the request target while impact retains actual meals.
- Active linked claims block edits/cancellation. Release, donor cancellation and
  incident rejection release allocation. Deadline expiry blocks new matches/claims
  without deleting existing rescue history. Full requirements are in the roadmap.
- These endpoints are NGO-scoped. Saved delivery snapshots feed assigned missions and
  distribution validation; unrelated NGOs, donors and volunteers cannot list requests.

## Historical Phase 3 contract proposal

## Conventions

- Base path: `/api/v1`
- Content type: `application/json`
- Entity IDs: opaque strings
- Date/time values: ISO 8601 strings in UTC
- Status, role, priority, category, dietary, storage, and incident values: centralized uppercase enums
- List endpoints should support pagination before backend integration
- All protected requests will require a backend-validated identity and role

Successful single-resource response:

```json
{
  "data": {},
  "meta": {
    "requestId": "req_opaque"
  }
}
```

Successful list response:

```json
{
  "data": [],
  "meta": {
    "requestId": "req_opaque",
    "page": 1,
    "pageSize": 20,
    "total": 0
  }
}
```

Standard error response:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Correct the highlighted fields.",
    "retryable": false,
    "fieldErrors": {
      "safePickupDeadline": "Pickup time cannot be later than the safe pickup deadline."
    }
  },
  "meta": {
    "requestId": "req_opaque"
  }
}
```

Frontend error codes currently modeled by `MockApiError`:

- `NOT_FOUND`
- `VALIDATION_ERROR`
- `FORBIDDEN`
- `CONFLICT`
- `MOCK_FAILURE`
- `ABORTED`

## Authentication and profiles

| Method | Endpoint | Request | Response |
|---|---|---|---|
| `GET` | `/me` | Authenticated request | `ProfileBundle` |
| `PATCH` | `/me` | Editable user/profile fields | `ProfileBundle` |
| `GET` | `/ngos` | Name/area search, cause, accepted food category, service area, verified status, pagination | Public verified `NGODirectoryItem[]` |
| `GET` | `/ngos/:ngoId` | Verified NGO ID | Public `NGODirectoryItem` with approved profile, impact summary, and recent activities |
| `PATCH` | `/ngos/:ngoId/profile` | Authorized organization profile fields | Updated private `NGOProfile` |
| `GET` | `/ngos/:ngoId/team` | Authorized organization member | Private `NGOTeamMember[]` |
| `POST` | `/ngos/:ngoId/team/invitations` | Name, email, and organization role | Invited `NGOTeamMember` |
| `POST` | `/ngos/:ngoId/verification-submissions` | Backend-issued document references | Updated review status |

Backend requirements:

- Passwords, tokens, identity documents, and verification decisions must never use the Phase 2 browser mock session.
- Public NGO responses must expose only approved organization information.
- Public rating, capacity, people-helped, rescue-history, and impact fields require backend provenance/review; frontend seed values remain clearly labelled mock or demo.
- NGO public contact fields must be explicitly approved for directory display and kept separate from private account contact data.
- NGO profile editing, team membership, and verification submissions require organization-scoped authorization and an auditable actor.
- Team invitations must be unique per organization, role-limited, expiring, and accepted through a backend-issued token.
- Verification documents must use private upload references; filenames selected by the mock frontend are not evidence uploads.
- Donor and volunteer private contact/address fields require explicit authorization.
- Administrator accounts are backend-created or invite-only.

## Donations

| Method | Endpoint | Request | Response |
|---|---|---|---|
| `GET` | `/donations` | Search, category, status, distance, deadline, pagination | `DonationView[]` |
| `GET` | `/donations/:donationId` | Donation ID | `DonationView` |
| `POST` | `/donations` | `CreateDonationInput` | Created `DonationView` |
| `PATCH` | `/donations/:donationId` | Editable draft fields | Updated `DonationView` |
| `POST` | `/donations/:donationId/cancel` | Required cancellation reason | Cancelled `DonationView` and released pre-pickup claim |
| `POST` | `/donations/:donationId/transitions` | `{ "status": "PUBLISHED" }` | Updated `DonationView` |
| `GET` | `/donations/:donationId/tracking` | Authorized donation participant | `DonationTrackingData` |

NGO discovery reads should accept search, distance radius, food category, dietary compatibility, minimum estimated meals, priority/urgency, storage condition, deadline, sort, and pagination. List and map responses must use the same filter contract and return only privacy-projected `DonationView` data. Match/eligibility fields should be backend-derived and auditable rather than trusted from the client.

Required backend rules:

- Quantity must be positive.
- Preparation time cannot be after the safe pickup deadline.
- Pickup window cannot end after the safe pickup deadline.
- Required food-safety declarations must be complete before publishing.
- Food safety is based on declaration, traceability, moderation, and disclaimers; the product does not medically certify food.
- Status changes must follow `DONATION_TRANSITIONS`.
- Edit is allowed only before pickup begins; completed, expired, cancelled, and disputed records are read-only.
- Cancellation requires a recorded reason and must atomically release a reserved or assigned pre-pickup claim.
- Tracking responses must authorize the donor owner, accepted NGO, assigned volunteer, or administrator before including private contact, token, or exact-location fields.
- `preferredNgoProfileId`, when present, is non-binding matching context and must not bypass verification, eligibility, reservation, or claim rules.

## Donation privacy response

Before an accepted claim, `DonationView.pickup` contains only:

- approximate area
- approximate distance when available
- pickup window
- `sensitiveDetailsVisible: false`

After authorization, the backend may additionally return:

- exact pickup address
- pickup contact
- detailed directions
- `sensitiveDetailsVisible: true`

Authorized viewers are the donor owner, the accepted NGO, the assigned volunteer after assignment, and an administrator. The current `createDonationView` helper applies this rule in mock services, but the backend must enforce it independently.

## Claims

| Method | Endpoint | Request | Response |
|---|---|---|---|
| `GET` | `/claims` | Role-scoped filters and pagination | `Claim[]` |
| `GET` | `/claims/:claimId` | Claim ID | `Claim` |
| `POST` | `/claims` | Donation ID and backend-calculated match context | Reserved `Claim` |
| `POST` | `/claims/:claimId/transitions` | Next status and required verification payload | Updated `Claim` |

Required backend rules:

- Only a verified NGO can reserve an available donation.
- The food category must be included in the NGO profile's current accepted-food categories.
- One active claim is allowed per donation.
- Claim and donation status updates must be atomic.
- Status changes must follow `CLAIM_TRANSITIONS`.
- Pickup and delivery verification tokens must be distinct, short-lived, one-time backend tokens. Phase 3 mock strings are not security controls.

## Food requests

| Method | Endpoint | Request | Response |
|---|---|---|---|
| `GET` | `/requests` | NGO-scoped filters and pagination | `FoodRequest[]` |
| `GET` | `/requests/:requestId` | Request ID | `FoodRequest` |
| `POST` | `/requests` | `CreateFoodRequestInput` | Created `FoodRequest` |
| `PATCH` | `/requests/:requestId` | Editable request fields | Updated `FoodRequest` |
| `POST` | `/requests/:requestId/transitions` | Next status | Updated `FoodRequest` |

High and urgent priority requests require a reason. Creation also requires at least one food category and dietary preference, positive people/meal counts, a future `neededBy` value, and a complete delivery location. Supporting-document names in the mock UI represent future upload references; raw files must use an authorized upload endpoint. Owners may edit draft or pending-review requests. Status changes must follow `REQUEST_TRANSITIONS`, and request submission must not create a claim implicitly.

## Notifications

| Method | Endpoint | Request | Response |
|---|---|---|---|
| `GET` | `/notifications` | Current account, filters, pagination | `Notification[]` |
| `POST` | `/notifications/:notificationId/read` | Notification ID | Updated `Notification` |
| `POST` | `/notifications/read-all` | Current account | Updated unread count |

Notifications are private to the account owner and administrators with an audited support reason.

## Impact, distribution, and incidents

| Method | Endpoint | Request | Response |
|---|---|---|---|
| `GET` | `/impact` | Role-scoped date range | `ImpactRecord[]` and aggregates |
| `GET` | `/claims/:claimId/delivery-receipt` | Authorized claim participant | `DeliveryReceipt` |
| `POST` | `/claims/:claimId/delivery-receipt` | Actual quantity, condition, verification, notes, upload references | Created receipt and delivered claim |
| `POST` | `/claims/:claimId/distribution` | `DistributionRecord` fields | Created record and updated claim |
| `POST` | `/claims/:claimId/incidents` | `IncidentReport` fields | Created report and disputed state |
| `GET` | `/incidents/:incidentId` | Authorized incident ID | `IncidentReport` |

Delivery confirmation must be restricted to the claiming NGO, reconcile expected and received quantities, consume a one-time backend token, and block distribution when food is marked damaged or poor. Distribution must require a delivery receipt, use aggregate beneficiary counts, record consent confirmation, and atomically complete the claim/donation while creating impact. Incident submission must atomically pause normal progression and retain an auditable review status. Upload fields are backend-issued references, never trusted local filenames. Impact records must derive from completed delivery/distribution data. CO2 and water values must always be labelled estimated and return their methodology.

## Replacing the mock layer

Phase 3 pages should import from `src/services`, not `src/data` or `src/store`. Backend integration should replace service method bodies while preserving:

- exported TypeScript method signatures
- `DonationView` privacy shape
- centralized status values and transitions
- `ServiceErrorShape`
- loading, success, error, and retry handling

The backend remains authoritative even when frontend helpers block an invalid action.
