# ShareBite BD — Service & Domain API Reference

## Core Services

### 1. `donationService`
Coordinates surplus food listings, publishing, updates, and cancellations.
- `list({ donorProfileId, viewer }, options?): Promise<DonationView[]>`
- `getById(id, options?): Promise<DonationView>`
- `create(payload, options?): Promise<DonationView>`
- `cancel(id, reason, options?): Promise<DonationView>`

### 2. `ngoService`
Coordinates NGO discovery, radius queries, and verification records.
- `listVerified(options?): Promise<NGODirectoryItem[]>`
- `getById(id, options?): Promise<NGODirectoryItem>`

### 3. `volunteerService`
Coordinates volunteer rider dispatches, live navigation coordinates, and OTP validation.
- `getActiveMission(volunteerId): Promise<MissionView>`
- `confirmPickup(donationId, pinCode): Promise<boolean>`
- `confirmDelivery(claimId, photoUrls): Promise<boolean>`

## Error Handling Standards
All service methods throw standardized `MockApiError` containing:
- `code`: (e.g. `NOT_FOUND`, `FORBIDDEN`, `VALIDATION_ERROR`)
- `message`: Human-readable explanation in authentic Bengali/English.
- `retryable`: Boolean flag for UI retry buttons.

## Private verification documents

- `GET /api/verification` — NGO/volunteer owner status, current file metadata and
  latest five reviews. No file bytes in JSON.
- `POST /api/verification` — authenticated NGO/volunteer multipart upload: one
  `file` (PDF/JPG/PNG, 5 MB; PDF 1–10 pages), `submissionKey` (16–100 safe characters).
  Returns 201 (new) or 200 (idempotent retry); owner comes from the session. Rejected
  accounts return to PENDING. Verified accounts cannot replace files here.
- `GET /api/verification/documents/:documentId` — owner or ADMIN only; other users
  receive 404. Private, no-store PDF/WebP response. `?download=1` returns attachment.
- `PATCH /api/admin/accounts` — NGO/volunteer approval additionally requires the
  current `documentId`; stale document/profile versions return 409, missing files
  return 422. Review audit retains `verificationDocumentId` for historical preview.

File processing and per-owner 20 MB quota run on the server. Upload and review
transactions share an account lock. These endpoints support manual review, not
automatic document-authenticity certification.

## Admin account access

Separate from verification (`/api/admin/accounts`), ADMIN-only, no-store reads:

- `GET /api/admin/users?q=&role=ALL&access=ALL&page=1`: regular Donor/NGO/Volunteer
  accounts, 20 per page. Roles: ALL/DONOR/NGO/VOLUNTEER. Access: ALL (current),
  ACTIVE, BANNED, DELETED (archive). `q` searches name, organization, email or phone.
- `GET /api/admin/users?id=...`: safe account fields, integer `version`, separate
  `verification` and `access`, actual open-work counts and latest 20 access audits.
- `PATCH /api/admin/users`: `{id, action: "BAN"|"UNBAN"|"DELETE", note,
  expectedVersion, submissionKey, confirmation?}`. Reason: 12–1000 characters;
  submission key: 16–100 alphanumeric/underscore/hyphen; DELETE requires exact
  `confirmation: "DELETE"`. Admin/self targets are forbidden. Stale states or
  active rescues on deletion return 409; invalid confirmation returns 422.

Ban revokes every session. Unban requires fresh login. Delete is a permanent
account tombstone preserving relational records and contact history, releases
unique login identifiers and cancels open, unclaimed donations/food requests.
It is not full personal-data erasure. Deleted accounts cannot be restored here.
Writes are transactional, audited, replay-safe and protected against cross-site
requests. See [admin user guide](ADMIN_USER_CONTROLS_BN.md).
