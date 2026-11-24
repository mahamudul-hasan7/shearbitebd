# ShareBite BD — Smart Surplus Food Rescue Platform

[![Next.js 16](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript 5.8](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6.4%20%2B%20PostgreSQL-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Leaflet & OSM](https://img.shields.io/badge/GIS-Leaflet%20%2B%20OpenStreetMap-199900?style=flat-square&logo=openstreetmap)](https://leafletjs.com/)
[![UN SDG 2](https://img.shields.io/badge/UN%20SDG-2%3A%20Zero%20Hunger-E5243B?style=flat-square)](https://sdgs.un.org/goals/goal2)
[![UN SDG 12](https://img.shields.io/badge/UN%20SDG-12%3A%20Responsible%20Consumption-BF8B2E?style=flat-square)](https://sdgs.un.org/goals/goal12)

> *"Do not waste surplus food — deliver it to people's plates with dignity."*
>
> A bilingual (English & Bengali), mobile-first civic-tech food rescue platform connecting university cafeterias, restaurants, and event caterers in Dhaka with verified NGOs and volunteer riders for safe, accountable surplus food redistribution.

---

## Overview

ShareBite BD addresses two urgent urban challenges simultaneously: **large-scale surplus food waste** from cafeterias, restaurants, and events, and **food insecurity** across nearby shelters and underserved communities.

Because cooked food spoils rapidly under ambient temperatures in Dhaka, ad-hoc phone calls often fail before food can be safely delivered. ShareBite BD replaces informal coordination with a **PostgreSQL-backed, role-isolated rescue workflow** featuring:

* **Row-locked atomic claims and dispatches** to prevent duplicate reservations or race conditions.
* **Privacy-preserving geolocation** that approximates pickup pins on a `0.01°` (~1 km) grid prior to claiming, revealing exact pickup addresses and contact details only to authorized rescue participants.
* **Two-stage six-digit HMAC-OTP handovers** (donor-to-rider pickup and rider-to-NGO delivery) with attempt limits, expiry clipping against the food's safe deadline, and replay protection.
* **End-to-end accountability** covering delivery receipt reconciliation, beneficiary distribution records, dispute/incident holds, and audited admin governance.

---

## Core Portals & Capabilities

### 1. Food Donor Portal (`/donor`)
* **Guided 4-Step Surplus Posting Wizard:** Capture food category, dietary tags, quantity/servings, preparation and safe pickup deadlines, storage condition, allergens, safety declarations, and real photo uploads (`sharp`-sanitized WebP) or labelled sample illustrations.
* **Live Rescue Tracking & Handover:** Monitor active donations, issue single-use 6-digit pickup OTPs once a rider is assigned, view pickup-to-delivery endpoints on Leaflet/OpenStreetMap, and report issues if needed.
* **Address & NGO Directory:** Manage saved pickup coordinates (interactive map pin, manual coordinates, or one-time device GPS) and browse verified NGOs.

### 2. NGO / Charity Cockpit (`/ngo`)
* **Explainable Food Discovery (`/ngo/discover` & `/ngo/discover/map`):** Filter available surplus batches by category, dietary type, urgency, minimum meals, and straight-line Haversine distance from the NGO's primary saved pin—without fabricated match percentages.
* **Food Requests & Matching (`/ngo/requests`):** Publish structured demand requests that match eligible donations, track meal allocations, and fulfill targets strictly from recorded distributions.
* **Receipt, Distribution & Impact:** Reconcile delivered quantities and food condition (damaged/poor batches block distribution), record aggregate beneficiary outcomes within the safe food deadline, and view methodology-labelled environmental and meal impact metrics.
* **Private Document Verification:** Upload PDF/JPG/PNG registration documents (sanitized server-side with `pdf-lib` and `sharp`) for admin review.

### 3. Volunteer Rider Cockpit (`/volunteer`)
* **Duty Control & Dispatch Board:** Single persisted `ON`/`OFF` duty switch (`dutyVersion`-locked) controlling incoming dispatch eligibility while keeping any active mission intact.
* **Step-by-Step Mission Cockpit:** Progress through pickup stages, navigate via Google Maps links for saved pickup/delivery pins, submit 6-digit pickup and delivery OTPs, and access delivery history and profile ID card.

### 4. Administrator Workspace (`/admin`)
* **Verification Queue (`/admin/verifications`):** Preview and download private NGO/volunteer verification documents securely (sandboxed CSP) and approve or reject applications with optimistic version checks and immutable audit trails.
* **User Access Governance (`/admin/users`):** Search and manage user access (`BAN`, `UNBAN`, and permanent `DELETE` with typed confirmation, session revocation, and active-rescue guards).
* **Rescue & Incident Oversight (`/admin/rescues` & `/admin/reports`):** Monitor active rescues and review disputed claims (`UNDER_REVIEW`, `RESUME`, `REJECT_FOOD`, `CLOSE`) while blocking unauthorized progression during incident holds.

---

## End-to-End Rescue Lifecycle

1. **Donor** saves a pickup address pin and publishes an unexpired surplus food listing.
2. **Verified NGO** discovers the listing (coarse ~1 km preview) and claims the batch atomically (or matches it to a Food Request).
3. **Verified On-Duty Volunteer** accepts the reserved dispatch from the dispatch board.
4. **Donor** issues a 6-digit pickup OTP; **Volunteer** enters it at pickup (`ASSIGNED` -> `PICKED_UP`).
5. **NGO** issues a separate 6-digit delivery OTP upon arrival; **Volunteer** enters it at drop-off (`PICKED_UP` -> `DELIVERED`).
6. **NGO** records the delivery receipt (quantity and condition check) and logs beneficiary distribution within the donor-declared safe deadline (`DELIVERED` -> `DISTRIBUTED`), generating an `ImpactRecord`.
7. **Any Rescue Participant** can submit an incident report during an active rescue, placing an atomic `DISPUTED` hold until reviewed by an **Admin**.

---

## Technology Stack

| Layer | Technology | Role in Project |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | SSR/CSR routing, API Route Handlers, request proxy/RBAC |
| **UI & Language** | React 19, TypeScript 5.8 | Strict typed domain models, hooks, and server/client boundaries |
| **Styling & UX** | Tailwind CSS v4, CSS Modules | Responsive desktop sidebars, mobile bottom dock, bilingual (EN/BN) UI |
| **Database & ORM** | PostgreSQL + Prisma 6.4 | Relational schema, row locks (`FOR UPDATE`), partial unique indexes |
| **Local DB Runtime** | `embedded-postgres` | Zero-install portable PostgreSQL cluster for local dev/demos (`127.0.0.1:5433`) |
| **Mapping & GIS** | Leaflet 1.9.4 + OpenStreetMap | Privacy-grid markers, saved pin pickers, Haversine distance, map directions |
| **Media & Documents** | `sharp`, `pdf-lib`, `pdfjs-dist` | EXIF-stripped WebP re-encoding, active-content PDF sanitization & preview |
| **Testing** | Node Test Runner + Playwright | HTTP integration suite & multi-viewport bilingual browser E2E tests |

---

## Quick Start & Installation

### Prerequisites
* **Node.js `22+`** (LTS recommended) — [nodejs.org](https://nodejs.org/)
* **Git** (optional if using a downloaded archive)

### Option 1: 1-Click Windows Launch (Recommended for Local Demo)

* **Development mode:** Double-click `run-project.bat` in the repository root.
* **Presentation / Production demo mode:** Double-click `run-demo.bat`.

The launcher automatically verifies Node.js `22+`, installs missing dependencies, initializes the local PostgreSQL cluster if needed, builds (in `--demo` mode), opens the app in your browser, and prints local and LAN URLs. Keep the terminal window open and press `Ctrl+C` to stop.

### Option 2: Standard Terminal Setup (Windows / macOS / Linux)

```bash
# 1. Clone the repository
git clone https://github.com/mahamudul-hasan7/shearbitebd.git
cd shearbitebd

# 2. Install dependencies
npm install

# 3. Initialize local PostgreSQL, run migrations, seed demo accounts, and generate OTP_SECRET
npm run db:setup

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Using an external PostgreSQL instance?** Copy `.env.example` to `.env.local`, set your `DATABASE_URL` and a random `OTP_SECRET` (at least 32 characters), then run `npm run db:migrate` and `npm run db:seed`.

---

## Environment Configuration

See [`.env.example`](.env.example) for reference:

| Variable | Description | Default / Local Demo |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string (written to `.env.local` by `db:setup`) | `127.0.0.1:5433/sharebite_bd` |
| `OTP_SECRET` | Server-side secret (32+ chars) for HMAC-SHA256 handover OTPs | Auto-generated in `.env.local` |
| `AUTH_COOKIE_SECURE` | Set `true` for HTTPS hosting; `false` for HTTP localhost/LAN demos | `false` |
| `NEXT_PUBLIC_APP_NAME` | Application display name | `ShareBite BD` |
| `NEXT_PUBLIC_APP_URL` | Base application URL | `http://localhost:3000` |
| `NEXT_PUBLIC_MAP_PROVIDER` | Map tile provider identifier | `openstreetmap` |

---

## Demo & Admin Accounts

After running `npm run db:setup` (or `npm run db:seed`), the following synthetic accounts are available at `/login`:

| Role | Identifier / Email | Password | Portal |
|---|---|---|---|
| **Admin** | `admin` | `admin123` | `/admin/dashboard` |
| **Food Donor** | `donor@sharebite.demo` | `Demo1234` | `/donor/dashboard` |
| **NGO** | `ngo@sharebite.demo` | `Demo1234` | `/ngo/dashboard` |
| **Volunteer Rider** | `volunteer@sharebite.demo` | `Demo1234` | `/volunteer/dashboard` |

* Local admin credentials are also saved to gitignored `.local-postgres/admin-access.json`.
* Newly registered NGO and Volunteer accounts start as `PENDING` until approved via `/admin/verifications` (or locally via `npm run db:verify -- <email>`).
* **Tip for multi-role demos:** Use separate browser profiles or incognito windows when testing Donor, NGO, Volunteer, and Admin simultaneously, as tabs in the same browser profile share one session cookie.

---

## Mobile, LAN & PWA Access

ShareBite BD is built mobile-first and supports PWA home-screen installation and local Wi-Fi testing:

1. **Same Wi-Fi / LAN Testing:**
   * Keep `AUTH_COOKIE_SECURE=false` in `.env.local` for HTTP LAN demos (restart the server after changes).
   * Start with `run-demo.bat` (or `npm run demo`) and find your computer's IPv4 address (`ipconfig` / `ifconfig`) and printed port.
   * Open `http://<YOUR_COMPUTER_IP>:<PORT>` on your phone's browser.
   * *Note:* Browser geolocation (`navigator.geolocation`) requires HTTPS or `localhost`. On plain HTTP LAN URLs, use the interactive Leaflet map pin or manual coordinate entry instead.
2. **Install as a Standalone PWA:**
   * **Android (Chrome):** Tap the menu (`⋮`) -> **Install app** / **Add to Home screen**.
   * **iOS (Safari):** Tap **Share** -> **Add to Home Screen**.

---

## Verification & Testing

The project includes TypeScript/ESLint checks, isolated-schema HTTP integration tests, and Playwright browser tests (using Edge/Chromium):

```bash
# Static checks & production build
npm run lint
npm run typecheck
npm run build

# Core integration & unit tests (isolated temporary PostgreSQL schema)
npm run test:auth
npm run test:i18n
npm run test:progress

# End-to-end Playwright browser workflows
npm run test:coordination:browser
npm run test:discovery:browser
npm run test:verification:browser
npm run test:duty:browser
npm run test:photos:browser
npm run test:incidents:browser
npm run test:requests:browser
npm run test:maps:browser
npm run test:admin:browser
npm run test:admin-users:browser
npm run test:lan:browser
```

---

## Project Structure

```text
shearbitebd/
├── prisma/
│   ├── schema.prisma            # PostgreSQL models, enums, and relations
│   ├── migrations/              # Committed SQL migrations (incl. partial unique indexes)
│   └── seed.ts                  # Idempotent demo account seeder
├── public/
│   ├── fonts/                   # Self-hosted Plus Jakarta Sans, Outfit, Hind Siliguri
│   └── images/                  # Brand mark, landing hero assets, sample meal images
├── scripts/                     # Local PostgreSQL lifecycle, admin/CLI helpers, test runners
├── src/
│   ├── proxy.ts                 # Request guard: CSRF origin check, session & role enforcement
│   ├── app/
│   │   ├── (auth)/              # Login, role-selection, registration, onboarding, splash
│   │   ├── (donor)/donor/       # Donor dashboard, donation wizard, tracking, NGOs, addresses
│   │   ├── (ngo)/ngo/           # NGO dashboard, discovery/map, claims, requests, verification
│   │   ├── (volunteer)/volunteer/ # Rider command, dispatches, mission cockpit, history, ID card
│   │   ├── (admin)/admin/       # Admin dashboard, verifications, users, rescues, reports
│   │   └── api/                 # Authenticated REST API route handlers
│   ├── components/              # Shared UI primitives, Leaflet maps, mobile dock, header, shell
│   ├── features/                # Role-scoped feature views, hooks, validation, and forms
│   ├── lib/
│   │   ├── auth/                # Cookie session store & server auth helpers
│   │   ├── db/                  # Transactional PostgreSQL domain modules
│   │   ├── i18n/                # EN/BN translation catalogue and hooks
│   │   └── permissions/         # Role permissions and privacy-preserving projections
│   └── types/                   # Shared domain & navigation TypeScript definitions
├── tests/                       # Integration, unit, and Playwright browser test specs
├── docs/                        # Architecture, implementation status, and role guides
├── run-project.bat              # Windows 1-click development launcher
└── run-demo.bat                 # Windows 1-click production presentation launcher
```

---

## Important Limitations & Production Readiness Notes

This codebase was developed as a **university civic-tech project and functional pilot demo**. Before deploying to a public production environment, note the following intentional constraints documented in [`docs/REAL_IMPLEMENTATION.md`](docs/REAL_IMPLEMENTATION.md):

1. **Plaintext Passwords (Demo-Only):** Passwords are stored and compared in plaintext by design for the university evaluation phase. Replace with `argon2` or `scrypt`/`bcrypt` password hashing and remove default seeded/admin passwords before production deployment.
2. **Disconnected Secondary Modules:** Password reset email delivery, NGO team invitations, support ticket persistence, SMS/push notifications, and live background volunteer GPS/road-routing ETA are intentionally marked unavailable or pending rather than simulated.
3. **Database Binary Storage:** Uploaded food/evidence photos and verification documents are stored in PostgreSQL `Bytes` columns (`photo_assets` and `verification_documents`) for self-contained demos; migrate to object storage (S3/R2/GCS) for scale.
4. **Food Safety & Impact Estimates:** Temperature/spoilage windows rely on donor declarations and deadlines rather than IoT sensors; CO2e and water-saved figures are illustrative estimates (`2.5 kg CO2e` and `250 L` per kg) rather than measured audits.

---

## Documentation Index

* [`docs/REAL_IMPLEMENTATION.md`](docs/REAL_IMPLEMENTATION.md) — Current PostgreSQL implementation, security controls, and test coverage
* [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — System architecture overview
* [`docs/API_CONTRACTS.md`](docs/API_CONTRACTS.md) & [`docs/API_REFERENCE.md`](docs/API_REFERENCE.md) — API endpoints and contracts
* [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) — Visual tokens, typography, and component guidelines
* [`docs/ROUTES.md`](docs/ROUTES.md) — Application route map
* Bengali Operational Guides: [`DEMO_GUIDE_BN.md`](docs/DEMO_GUIDE_BN.md), [`ADMIN_GUIDE_BN.md`](docs/ADMIN_GUIDE_BN.md), [`ADMIN_USER_CONTROLS_BN.md`](docs/ADMIN_USER_CONTROLS_BN.md), [`RESCUE_COORDINATION_BN.md`](docs/RESCUE_COORDINATION_BN.md), [`NGO_DISCOVERY_BN.md`](docs/NGO_DISCOVERY_BN.md), [`VERIFICATION_DOCUMENTS_BN.md`](docs/VERIFICATION_DOCUMENTS_BN.md)

---

## License

Developed for educational and humanitarian purposes under the **MIT License**.
