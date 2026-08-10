# ShareBite BD Frontend

Responsive frontend foundation for the ShareBite BD smart surplus food rescue platform.

## Current progress

- Phase 1: project structure, design system, reusable UI, responsive portal shell
- Phase 2: complete authentication frontend, accessible validation, mock sessions, and role guards
- Phase 3: strict domain models, Bangladesh-focused mock services, state, permissions, and API contracts
- Phase 4: complete responsive Food Donor dashboard powered by typed mock services

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The root route redirects to `/splash`.

## Authentication demo routes

```text
/splash
/onboarding
/login
/forgot-password
/role-selection
/register?role=donor
/register?role=ngo
/register?role=volunteer
/unauthorized
/donor/dashboard
/ngo/dashboard
/volunteer/dashboard
```

Development builds show one-click donor, NGO, and volunteer accounts on `/login`. Their shared password is `Demo1234`; session data contains only mock profile and role metadata, never the password.

## Quality commands

```bash
npm run typecheck
npm run lint
npm run build
```

## Frontend-only note

Authentication remains a frontend demonstration. The role session and route guards are browser-only mocks, not production authorization. Database storage, Google OAuth, reset email delivery, document upload, and verification approval require backend integration.

See `docs/PHASE_2_SUMMARY.md` for the completed scope.

Domain/API details are documented in `docs/PHASE_3_SUMMARY.md` and `docs/API_CONTRACTS.md`. The donor dashboard is documented in `docs/PHASE_4_SUMMARY.md`.
