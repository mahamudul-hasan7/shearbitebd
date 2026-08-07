# Folder Structure

```text
src/
|-- app/                  # App Router routes, layouts, and thin page composition
|-- components/
|   |-- auth/             # Authentication presentation and forms
|   |-- brand/            # Official logo and wordmark
|   |-- layout/           # Shared responsive shells and containers
|   |-- navigation/       # Sidebar, topbar, and mobile navigation
|   `-- ui/               # Reusable design-system primitives
|-- data/                 # Bangladesh-focused raw mock factories (service internal)
|-- features/             # Feature-specific client behavior
|-- lib/
|   |-- constants/        # Roles, status lifecycles, and domain taxonomy
|   |-- permissions/      # Role permissions and sensitive-field projection
|   |-- selectors/        # Urgency, rescue time, and display selectors
|   `-- validators/       # Cross-feature business validation
|-- services/             # Promise-based mock API adapters and error contracts
|-- store/                # Lightweight in-memory domain state
`-- types/                # Shared strict domain and navigation models
```

The auth route group is complete for Phase 2. Donor, NGO, and volunteer groups include guarded landing placeholders; later phases will add their full product screens.

Route components should consume `src/services` and must not import raw arrays from `src/data` or mutate `src/store` directly.
