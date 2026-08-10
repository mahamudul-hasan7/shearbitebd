# ShareBite BD Frontend API Contracts

This document describes the future backend boundary represented by the Phase 3 mock services. The current implementation is an in-memory frontend simulation; it is not an authentication, authorization, storage, or food-safety system.

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
| `GET` | `/ngos` | Filters and pagination | Public verified NGO directory items |
| `GET` | `/ngos/:ngoId` | NGO ID | Public NGO directory item |

Backend requirements:

- Passwords, tokens, identity documents, and verification decisions must never use the Phase 2 browser mock session.
- Public NGO responses must expose only approved organization information.
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

High and urgent priority requests require a reason. Status changes must follow `REQUEST_TRANSITIONS`.

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
| `POST` | `/claims/:claimId/distribution` | `DistributionRecord` fields | Created record and updated claim |
| `POST` | `/claims/:claimId/incidents` | `IncidentReport` fields | Created report and disputed state |
| `GET` | `/incidents/:incidentId` | Authorized incident ID | `IncidentReport` |

Impact records must derive from completed delivery/distribution data. CO2 and water values must always be labelled estimated and return their methodology.

## Replacing the mock layer

Phase 3 pages should import from `src/services`, not `src/data` or `src/store`. Backend integration should replace service method bodies while preserving:

- exported TypeScript method signatures
- `DonationView` privacy shape
- centralized status values and transitions
- `ServiceErrorShape`
- loading, success, error, and retry handling

The backend remains authoritative even when frontend helpers block an invalid action.
