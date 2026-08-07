# Phase 3 - Domain Models, Mock API, and State Foundation

Phase 3 adds the non-visual typed foundation used by the donor and NGO product phases.

## Completed

- Strict domain models for users, role profiles, addresses, donations, food-safety declarations, claims, food requests, notifications, impact, incidents, and distributions
- Central enums and labels for priorities, food categories, dietary types, storage conditions, incident types, verification, notifications, quantities, and transport
- Realistic Bangladesh-focused mock state for UIU Cafeteria, nearby donor businesses, verified NGOs, donations, claims, requests, notifications, and impact history
- Lightweight immutable in-memory store with subscriptions and reset support
- Promise-based donation, claim, NGO, request, notification, and profile service adapters
- Configurable mock latency, abort support, simulated error responses, and reusable async-state types
- Central donation, claim, and food-request transition maps
- Safe-pickup deadline validation, rescue time calculation, urgency score, and match-score display helpers
- Role permissions and donation privacy projection that hides exact donor address/contact until the viewer is authorized
- Future backend request/response expectations in `docs/API_CONTRACTS.md`

## Consumer rule

Future pages must import from `src/services`. Raw mock arrays and the in-memory store are implementation details and should not be imported directly by route components.

## Boundary

The mock store resets on a full reload and is not a backend. Client permission checks improve UI behavior but do not provide production authorization. Environmental values in mock impact records are explicitly estimated.
