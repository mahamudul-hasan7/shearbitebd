# Phase 7 - NGO Directory and NGO Profiles for Donors

Phase 7 completes the Food Donor experience for discovering verified mock NGOs and reviewing their public organization profiles before creating a surplus-food listing.

## NGO directory

- Verified organization overview cards for organization count, service-area count, people helped, and completed rescues
- Search by organization name, summary, or service area
- Cause/beneficiary, accepted food category, and service-area filters
- Saved-NGOs-only switch with session-storage persistence
- Working reset control, result count, loading skeletons, recoverable error UI, first-use empty state, and filter-aware empty state
- Responsive NGO cards with privacy-safe image crops, verified badge, clearly marked demo rating, cause badges, service areas, people helped, completed rescues, profile link, save action, and surplus-food CTA
- Explicit directory-level notice that the product has no payment, fundraising, bank, payout, or financial-donation flow

## NGO profile

- ID-based service loading for `/donor/ngos/[ngoId]`
- Organization identity, registration reference, verified mock state, founded year, summary, mission, vision, values, causes, accepted categories, service areas, capacity, and public area
- Historical people-helped and completed-rescue values clearly labelled demo/mock
- Recent meal and food-weight metrics derived from typed impact records
- Estimated CO2 value with methodology boundary language
- Recent rescue activities assembled by `ngoService`
- Public organization email and phone actions, explicitly separated from private account contacts
- Save NGO action persisted for the current browser-tab session
- Donate Surplus Food CTA opens `/donor/donations/new?ngo=:ngoId`
- The donation wizard resolves that verified NGO through `ngoService`, displays the preference context, stores `preferredNgoProfileId`, and states that matching remains non-guaranteed

## Gallery asset

The built-in image generation tool created `public/images/ngo-community-gallery.png` as a wide, privacy-safe three-zone panorama. It shows prepared meal boxes, rescued produce/pantry crates, and an empty community dining space. It contains no people, beneficiaries, text, logo, money, or identifiable location. The profile uses left/center/right crops from the same optimized layout to create a responsive gallery without privacy risk.

## Typed service and domain changes

- `NGOProfile` now includes approved public mission, vision, values, accepted food categories, historical demo reach, founding year, public contact, and gallery fields.
- `NGODirectoryItem` includes cloned public profile/address data, derived impact summary, and recent rescue activities.
- `ngoService.getById` rejects profiles that are not verified for donor-directory display.
- `Donation.preferredNgoProfileId` and the Phase 5 draft preserve optional NGO matching context without creating a claim.

## Scope and privacy

- There is no monetary donation, fundraising, bank, payout, or financial history UI.
- Rating, reach, capacity, and impact values remain explicitly mock/demo until a backend supplies reviewed data.
- The gallery contains no identifiable beneficiaries.
- Preferred NGO context does not guarantee assignment and cannot bypass normal verification and claim rules.
- Save/follow-style state is browser-session-only.

## Verification

- `npm.cmd run typecheck`
- `npm.cmd run build`
- `npm.cmd run lint` exits successfully; two unrelated warnings remain in the user-added Git-hook scripts `scripts/check-unpushed.mjs` and `scripts/setup-git-hooks.mjs`.
- Production HTTP checks returned 200 for `/donor/ngos`, both seeded NGO profiles, the NGO-context donation wizard, and the generated gallery asset.
- The bundled browser-control runtime could not initialize its local execution assets, so automated click/screenshot QA was unavailable.

## Manual test path

1. Run `npm.cmd run dev` and sign in with the donor demo account.
2. Open `/donor/ngos` and test organization search, cause/category/location filters, saved-only state, and reset.
3. Open `/donor/ngos/ngo-hope` and review profile content, gallery, recent activities, contact, and save state.
4. Select Donate Surplus Food and verify the wizard displays Hope Foundation as a non-guaranteed matching preference.
