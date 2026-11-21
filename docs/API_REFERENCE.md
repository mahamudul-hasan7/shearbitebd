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
