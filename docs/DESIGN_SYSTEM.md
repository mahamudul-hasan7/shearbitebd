# ShareBite BD Design System

The live catalogue is available at `/design-system`.

## Brand foundation

- Primary: deep sustainable green (`brand-50` through `brand-900`)
- Accent: urgency orange (`accent-50` through `accent-600`)
- Canvas: warm off-white
- Surface: white
- Text: green-black with muted neutral support
- Semantic states: success, warning, danger, and info, each with soft and strong variants

Brand values, semantic colors, radii, shadows, breakpoints, the sidebar width, and maximum page width are defined in `src/app/globals.css`. Pages must use these tokens instead of introducing new brand color literals.

## Responsive tokens

| Token | Width |
|---|---:|
| `xs` | 480px |
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |
| `2xl` | 1536px |

- Mobile begins as a single-column layout.
- The desktop sidebar replaces mobile bottom navigation at `lg`.
- Page content uses the shared 1600px maximum width and responsive gutters.
- Controls are at least 44px high; primary form controls are 48px or 56px.
- Mobile navigation uses a five-column grid so it remains within a 320px viewport.

## UI primitives

### Actions and navigation

- `Button` and `ButtonLink`
- `IconButton`
- `Tabs`
- `Dropdown`

Use `ButtonLink` for navigation styled as a button. Do not wrap a button inside a link.

### Forms

- `Input`
- `Textarea`
- `Select`
- `Checkbox`
- `RadioGroup`
- `Switch`
- `SearchInput`
- `FileUpload`

All form controls provide stable IDs, labels, associated help/error text, and invalid states. Errors use `role="alert"` where immediate feedback is appropriate.

### Content and data display

- `Card`, `CardHeader`, and `CardContent`
- `Badge`
- `StatusBadge`
- `StatCard`
- `SectionHeader`
- `Stepper`
- `Avatar`

`StatusBadge` consumes centralized lifecycle values from `src/lib/constants/statuses.ts`; pages should not hard-code status labels or colors.

### Feedback and overlays

- `Alert`
- `Toast`
- `Skeleton` and `SkeletonGroup`
- `EmptyState`
- `Modal`
- `Drawer`

Modal and drawer components use the native dialog element for keyboard escape behavior, focus management, and a semantic modal boundary. Toast content is announced through a polite live region.

## Layout components

- `AppHeader`
- `DesktopSidebar`
- `MobileBottomNavigation` (`MobileBottomNav` remains as a compatibility alias)
- `PageContainer`
- `ResponsiveGrid`
- `StickyActionBar`
- `PortalShell`

The same page content is composed at all breakpoints. Do not maintain separate mobile and desktop page implementations.

## Central configuration

- Routes and route builders: `src/lib/routes.ts`
- Donor/NGO navigation: `src/lib/navigation.ts`
- Roles and public-registration policy: `src/lib/constants/roles.ts`
- Donation, claim, and request lifecycles: `src/lib/constants/statuses.ts`

## Accessibility rules

- Never communicate status using color alone.
- Every input must have a visible label or an explicit accessible name.
- Keep visible focus rings and native keyboard interaction.
- Use a link for navigation and a button for an action.
- Provide descriptive labels for icon-only buttons.
- Maintain adequate contrast for semantic states.
- Respect safe-area padding on mobile navigation and sticky actions.
- Reduced-motion preferences disable non-essential transitions and animation.
