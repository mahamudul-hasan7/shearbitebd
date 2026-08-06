# ShareBite BD Frontend

Responsive frontend foundation for the ShareBite BD smart surplus food rescue platform.

## Current progress

- Phase 1: project structure, design system, reusable UI, responsive portal shell
- Phase 2: splash, onboarding, login, password recovery, role selection, and multi-step registration

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
```

## Quality commands

```bash
npm run typecheck
npm run lint
npm run build
```

## Frontend-only note

Authentication forms currently demonstrate interface behavior only. Real sessions, database storage, Google OAuth, email reset, document upload, and verification approval require backend integration.

See `docs/PHASE_2_SUMMARY.md` for the completed scope.
