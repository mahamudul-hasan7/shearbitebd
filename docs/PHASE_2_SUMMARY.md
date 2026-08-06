# Phase 2 — Authentication Frontend

Phase 2 adds a complete responsive authentication experience on top of the Phase 1 design system.

## Completed routes

- `/splash` — branded launch screen
- `/onboarding` — three-step product introduction
- `/login` — email/password login frontend
- `/forgot-password` — password recovery frontend
- `/role-selection` — donor, NGO, volunteer, and controlled admin roles
- `/register?role=donor` — donor registration flow
- `/register?role=ngo` — NGO registration flow
- `/register?role=volunteer` — volunteer registration flow

## Reusable authentication components

- `AuthShell`
- `AuthArtwork`
- `OnboardingCarousel`
- `RoleCard`
- `AuthProgress`
- `LoginForm`
- `ForgotPasswordForm`
- `RegisterForm`
- `PasswordInput`

## Responsive behavior

- Mobile: single-column forms and compact branded headers
- Tablet: wider form grids and card layouts
- Desktop: branded visual panel on the left and functional content on the right

## Important boundary

This phase is frontend-only. Form submissions, Google authentication, password reset email, file upload, verification review, and real session handling are represented as UI behavior and must later be connected to backend services.
