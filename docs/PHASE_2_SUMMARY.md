# Phase 2 - Authentication Frontend

Phase 2 completes the responsive authentication experience on top of the Phase 1 design system.

## Completed routes

- `/splash` - branded launch screen
- `/onboarding` - three-step product introduction
- `/login` - validated development login
- `/forgot-password` - validated password recovery placeholder
- `/role-selection` - donor, NGO, volunteer, and invite-only administrator choices
- `/register?role=donor` - donor registration flow
- `/register?role=ngo` - NGO registration flow
- `/register?role=volunteer` - volunteer registration flow
- `/unauthorized` - wrong-role access explanation
- `/donor/dashboard` - guarded donor placeholder for the Phase 4 handoff
- `/ngo/dashboard` - guarded NGO placeholder for the Phase 9 handoff
- `/volunteer/dashboard` - guarded volunteer placeholder

## Completed behavior

- Controlled login and password-recovery forms with accessible inline validation
- Password visibility, remember-session behavior, and password-free mock session metadata
- Development-only one-click donor, NGO, and volunteer demo accounts
- Donor, NGO, and volunteer registration rules with state preserved between form steps
- Bangladesh phone, email, password, confirmation, address, terms, and role-specific validation
- File type/count/5 MB checks; NGO and volunteer documents are required, donor documents are optional
- NGO and volunteer verification-pending results
- Role-aware route guards with safe login and unauthorized redirects
- Public administrator registration remains disabled and invite-only

## Responsive behavior

- Mobile: single-column forms and compact branded headers
- Tablet: wider form grids and card layouts
- Desktop: branded visual panel on the left and functional content on the right

## Important boundary

This phase is frontend-only. Form submissions, Google authentication, password reset email, file upload, verification review, and production session enforcement must later be connected to backend services. The mock session never stores a password and is not a security boundary.
