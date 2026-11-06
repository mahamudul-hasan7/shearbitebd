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
