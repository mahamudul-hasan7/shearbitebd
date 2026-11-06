# ShareBite BD — System Architecture & Design

## 1. High-Level System Architecture

```
[ Food Donor Portal ]       [ NGO Discovery Hub ]       [ Volunteer Cockpit ]
        │                           │                           │
        └───────────────┬───────────┴───────────┬───────────────┘
                        ▼                       ▼
            [ Next.js 15 App Router & API / Services Layer ]
                        │                       │
        ┌───────────────┴───────────┐           └───────────────┐
        ▼                           ▼                           ▼
[ Domain State Machine ]  [ Geolocation & Radius ]  [ Handover OTP / QR Engine ]
        │                           │                           │
        └───────────────────────────┼───────────────────────────┘
                                    ▼
                [ BFSA Thermal Safety & Audit Logs ]
```

## 2. Food Rescue Lifecycle State Machine

1. **DRAFT:** Donor prepares food listing.
2. **AVAILABLE:** Food published to nearby NGO radar (Safe pickup clock starts).
3. **RESERVED:** NGO claims the batch within their 3 km service radius.
4. **ASSIGNED:** Nearest volunteer rider accepts the dispatch.
5. **PICKED_UP:** 4-digit OTP PIN verification completed between donor and volunteer.
6. **DELIVERED:** Volunteer delivers sealed food to NGO shelter facility.
7. **DISTRIBUTED:** Food safely distributed to beneficiaries with photo proof.

## 3. Data Integrity & Security

- **Strict Role-Based Access Control (RBAC):** Donors, NGOs, and Volunteers access isolated portal shells.
- **Tamper-Proof Handover:** Two-way verification prevents unauthorized food claims.
- **Audit Logging:** Every state transition is stamped with geolocation and UTC timestamps.
