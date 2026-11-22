# Portal dashboard UI

Donor and NGO dashboards use `src/components/dashboard/dashboard-ui.tsx` and its CSS module
for headings, metric cards, active-work surfaces, history disclosures, activity rows
and retry feedback. Header actions use the same button styles. Colors and borders
come from the existing global design tokens.

Donors keep their active rescue first, plus food-post filters and a first-use guide.
The dashboard shows recorded meal totals and saved food posts. It does not render
an empty supported-NGO card. After pickup, the active card explains the next stage
instead of showing a pickup countdown.

NGOs keep nearby-food availability, active claim stages, recommendations, account
verification and safety guidance. Food category matching, authorization, claim
creation and receipt/distribution workflows use their existing services. Optional
activity history starts collapsed in both dashboards and uses the selected
language and Bangladesh time. User-authored food titles remain unchanged.

The volunteer offer component resets its offer during a guarded render when duty
eligibility or identity changes. Its effect synchronizes polling and its current
offer reference. It does not synchronously set React state inside the effect.

Validation commands

```sh
npm run lint
npm run typecheck
node --import tsx --test tests/*.test.ts
npm run build
npm run test:auth
npm run test:portals:browser
```

On Linux, set `PLAYWRIGHT_EXECUTABLE_PATH=/usr/bin/chromium` for the portal test when
using system Chromium. Windows defaults to Microsoft Edge. The test uses an
isolated database schema, checks both languages and six viewport sizes, exercises
history with the keyboard, validates real meal totals, checks touch targets and
verifies initial-error and failed-refresh recovery.

Existing donor, NGO and rider-offer browser scenarios also cover posting,
claiming, handovers, duty changes, competing riders and repeated acceptance.

Rider now uses the same dashboard work cards, section headings, metric grid and
header action styles. Its next mission action and recorded delivery totals replace
the decorative hero metrics. Operational mission, OTP and safety controls remain
available. All three roles receive distinct scoped accents and persistent identity
badges through the [shared portal system](PORTAL_UI_SYSTEM_BN.md).
