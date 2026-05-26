## Why

The first Orbit foundation is functional, but the early UI needs a small polish pass before moving into the plan generator. Adding language switching, fixing tight spacing, and improving visual affordances with icons will make the base experience easier to test and more aligned with the premium black/purple brand.

## What Changes

- Add a visible language toggle in the main banner/header area to switch the current web UI between English and Spanish.
- Persist the selected language on the client so refreshes keep the user's choice.
- Review and adjust tight paddings/margins in forms, cards, navigation, onboarding, dashboard, profile fields, and public/auth hero copy.
- Add lightweight icons to key actions and sections, including auth, onboarding, dashboard cards, profile placeholders, mood selection, and logout.
- Keep the change scoped to UI copy/presentation; no backend localization or database changes are required.

### Non-Goals

- Full backend internationalization is not included.
- Dynamic translation management or CMS-backed copy is not included.
- Adding new product capabilities such as real plan generation, weather, maps, or favorites is not included.
- Native mobile language settings are not included.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `web-app-shell`: Add client-side language toggle, persisted language preference, icon-enhanced shell, and spacing refinements.
- `home-dashboard`: Localize dashboard copy, add icons to dashboard sections/actions, and improve card spacing.
- `user-onboarding-profile`: Replace plain preference text fields with icon-enhanced selectable controls for a more guided profile preference experience.

## Impact

- Frontend: React state/context for language, localized copy map, banner/header toggle, icon-enhanced preference selectors, UI icon usage, CSS spacing refinements, and smoke tests.
- Dependencies: optional icon package if needed for consistent iconography.
- Backend: no API or database changes expected.
