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
| `/ngo/dashboard` | Complete responsive NGO dashboard implemented in Phase 9 |
| `/volunteer/dashboard` | Guarded volunteer placeholder |

## Food Donor

- `/donor/donations/new` - implemented in Phase 5; four-step surplus-food wizard
- `/donor/donations` - implemented in Phase 6; searchable/filterable management, status tabs, progress, and states
- `/donor/donations/[donationId]` - implemented in Phase 6; full owner detail, receiver summary, lifecycle, edit/cancel/report/share actions
- `/donor/donations/[donationId]/tracking` - implemented in Phase 6; permission-aware tracking, map/ETA placeholders, contacts, and mock QR handover
- `/donor/ngos` - implemented in Phase 7; verified directory search, cause/category/location filters, saved state, and cards
- `/donor/ngos/[ngoId]` - implemented in Phase 7; identity, impact/activity, gallery, public contact, save, and surplus-food CTA
- `/donor/notifications` - implemented in Phase 8; categorized alerts, filters, and read/unread controls
- `/donor/profile` - implemented in Phase 8; verified identity, contact, impact, account links, and logout
- `/donor/profile/edit` - implemented in Phase 8; validated mock profile editing
- `/donor/addresses` - implemented in Phase 8; add, edit, choose primary, and remove saved pickup addresses
- `/donor/settings` - implemented in Phase 8; notification, language, text-size, location, and policy controls
- `/donor/support` - implemented in Phase 8; FAQ and validated mock support request

## NGO

- `/ngo/dashboard` - implemented in Phase 9; typed overview, recommendation/claim, active claims, quick actions, activity, and responsive states
- `/ngo/discover` - implemented in Phase 10; searchable/filterable/sortable recommendation list with saved state and actionable empty state
- `/ngo/discover/map` - implemented in Phase 10; shared filters, approximate pins, NGO area, selected preview, legend, and nearby list
- `/ngo/donations/[donationId]` - implemented in Phase 10; ID-based details, privacy, safety declaration, eligibility, save, and claim CTA
- `/ngo/claims` - implemented in Phase 11; searchable claims, status filters, summaries, active/history cards, rescue clocks, volunteers, and ETAs
- `/ngo/claims/[claimId]` - implemented in Phase 11; authorized coordination detail, lifecycle, separate pickup/delivery mock verification, volunteer contacts, route preview, release, progression, and quick issue reporting
- `/ngo/claims/[claimId]/confirm-delivery` - guarded Phase 9 delivery-context handoff; full condition/quantity/evidence flow arrives in Phase 13
- `/ngo/claims/[claimId]/distribution`
- `/ngo/claims/[claimId]/report-issue`
- `/ngo/requests`
- `/ngo/requests/new` - guarded Phase 9 route handoff; full demand request arrives in Phase 12
- `/ngo/requests/[requestId]`
- `/ngo/requests/submitted`
- `/ngo/impact`
- `/ngo/notifications`
- `/ngo/profile` - guarded Phase 9 route handoff; full account module arrives in Phase 14
- `/ngo/profile/edit`
- `/ngo/team`
- `/ngo/verification`
- `/ngo/settings`
- `/ngo/support`

All route strings and dynamic route builders are centralized in `src/lib/routes.ts`. Routes without an implementation note remain unreachable until their planned phase.
