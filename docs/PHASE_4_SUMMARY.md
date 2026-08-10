# Phase 4 - Food Donor Dashboard

Phase 4 replaces the donor authentication handoff placeholder with a complete service-driven responsive dashboard.

## Completed dashboard content

- Responsive donor header with greeting, mock verification summary, notification count, profile initials, desktop sidebar, and mobile bottom navigation
- Impact overview for total donations, active donations, rescued meals, and verified NGOs helped
- Clearly described mock donor score that is not presented as a food-safety certification
- Active donation card with generated meal image, title, approximate area, quantity, storage, category, priority, and current status
- Hydration-safe live rescue clock based on the safe pickup deadline
- Responsive donation status timeline
- Quick actions for Add Surplus Food, My Donations, QR Handover, and Help & Support
- Recent activity feed built from donation, notification, and impact services
- Recently supported NGO cards built from verified NGO and impact services
- Loading skeletons, recoverable service error state, first-use empty state, and no-active-donation state
- Frontend food-safety and environmental-estimate boundaries remain explicit

## Data boundary

The dashboard imports only Phase 3 service adapters. It does not import raw mock arrays or mutate the mock store directly.

## Responsive behavior

- Small mobile: single-column cards, compact timeline grid, touch-friendly actions, and safe-area bottom navigation
- Tablet: two-column impact and action layouts
- Desktop: persistent sidebar with a wide active-donation panel and separate quick-action column
- Wide desktop: four-column statistics and balanced activity/NGO panels

## Image asset

`public/images/donor-active-meal.png` was generated with the built-in image generation tool for the active donation card. The image contains generic prepared meal trays with no people, text, logo, or identifiable location.

## Current limitation

Donor dashboard CTA links use the centralized routes for Phases 5-8. Their destination product screens are intentionally not implemented in Phase 4.
