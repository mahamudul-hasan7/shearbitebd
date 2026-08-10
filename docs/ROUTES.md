# Route Plan

## Authentication - implemented in Phase 2

| Route | Purpose |
|---|---|
| `/splash` | Launch and brand introduction |
| `/onboarding` | Product overview carousel |
| `/login` | Validated mock account login |
| `/forgot-password` | Password reset request placeholder |
| `/role-selection` | Select donor, NGO, or volunteer; admin is invite-only |
| `/register?role=donor` | Food donor registration |
| `/register?role=ngo` | NGO registration |
| `/register?role=volunteer` | Volunteer registration |
| `/unauthorized` | Wrong-role access explanation |
| `/donor/dashboard` | Complete responsive donor dashboard implemented in Phase 4 |
| `/ngo/dashboard` | Guarded NGO placeholder; full screen planned for Phase 9 |
| `/volunteer/dashboard` | Guarded volunteer placeholder |

## Food Donor

- `/donor/donations/new` - implemented in Phase 5; four-step surplus-food wizard
- `/donor/donations` - Phase 5 service-backed verification handoff; full management planned for Phase 6
- `/donor/donations/[donationId]` - Phase 5 owner detail handoff; full detail and lifecycle actions planned for Phase 6
- `/donor/donations/[donationId]/tracking`
- `/donor/ngos`
- `/donor/ngos/[ngoId]`
- `/donor/notifications`
- `/donor/profile`
- `/donor/profile/edit`
- `/donor/addresses`
- `/donor/settings`
- `/donor/support`

## NGO - planned

- `/ngo/discover`
- `/ngo/discover/map`
- `/ngo/donations/[donationId]`
- `/ngo/claims`
- `/ngo/claims/[claimId]`
- `/ngo/claims/[claimId]/confirm-delivery`
- `/ngo/claims/[claimId]/distribution`
- `/ngo/claims/[claimId]/report-issue`
- `/ngo/requests`
- `/ngo/requests/new`
- `/ngo/requests/[requestId]`
- `/ngo/requests/submitted`
- `/ngo/impact`
- `/ngo/notifications`
- `/ngo/profile`
- `/ngo/profile/edit`
- `/ngo/team`
- `/ngo/verification`
- `/ngo/settings`
- `/ngo/support`

All route strings and dynamic route builders are centralized in `src/lib/routes.ts`. Routes without an implementation note remain unreachable until their planned phase.
