# Folder Structure

```text
src/
├── app/                 # Routes, layouts and page composition
├── components/
│   ├── brand/           # Logo and brand elements
│   ├── layout/          # App shells and page layout
│   ├── navigation/      # Sidebar, topbar and mobile navigation
│   └── ui/              # Reusable UI primitives
├── features/            # Business features added in later phases
├── hooks/               # Shared hooks
├── lib/                 # Utilities, route config and constants
├── store/               # Minimal client state only when necessary
├── types/               # Shared TypeScript models
└── data/                # Mock data during frontend development
```

The route groups for auth, donor and NGO are already prepared with `.gitkeep` files.
