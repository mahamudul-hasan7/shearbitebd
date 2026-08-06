# Maintenance Rules

1. Keep routing inside `src/app` and business logic inside `src/features`.
2. Reuse components from `src/components/ui` before creating new UI primitives.
3. Keep donor-specific and NGO-specific composition separate, but share core donation components.
4. Store route labels and navigation in `src/lib/navigation.ts`.
5. Use design tokens from `src/app/globals.css`; avoid scattered hard-coded brand colors.
6. Build mobile-first, then add desktop composition using Tailwind breakpoints.
7. Do not duplicate a full component for mobile and desktop unless the interaction is genuinely different.
8. Keep files focused; split a component when it becomes difficult to understand or test.
9. Use semantic status names in code and friendly labels only in the UI.
10. Run typecheck, lint and build before every release archive.
