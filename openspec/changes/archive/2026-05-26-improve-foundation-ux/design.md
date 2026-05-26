## Context

`orbit-web-foundation` is implemented and archived. The current app can be tested, but the first user feedback calls out three polish needs: a language switcher in the main banner, spacing cleanup, and better visual guidance through icons.

This change stays frontend-only and web-first. It should improve the perceived quality of the existing foundation without changing backend contracts or starting the next product capability.

## Goals / Non-Goals

**Goals:**

- Add English/Spanish switching for visible foundation UI copy.
- Place the language toggle in the main banner/header area where it is easy to discover.
- Persist language selection locally.
- Normalize spacing in forms, fields, cards, dashboard grid, navigation, onboarding, and profile sections.
- Add tasteful icons to make actions and empty states easier to scan.
- Replace plain profile preference text fields with guided selectable options that can accumulate multiple values where appropriate.

**Non-Goals:**

- Backend/user-account language preference persistence.
- Translation infrastructure beyond a local typed copy map.
- Full accessibility audit beyond keeping controls labeled and keyboard reachable.
- New business capabilities.

## Decisions

### Client-side localization first

Use a small typed dictionary in the frontend for English and Spanish copy. Store the selected locale in `localStorage`.

Alternatives considered:

- Backend-stored locale: more durable across devices, but unnecessary for this first UI polish pass.
- i18n framework: useful later, but too much overhead for a small foundation UI.

### Header/banner language toggle

Place the toggle near the main brand/banner area and keep it available in authenticated and unauthenticated layouts.

Alternatives considered:

- Profile-only language setting: less discoverable and does not help first-time visitors.

### Icon package over hand-made symbols

Use a lightweight React icon package for consistent sizing, stroke weight, and accessibility behavior.

Alternatives considered:

- Unicode/emoji icons: fast, but less consistent with the premium Orbit visual style.
- Custom SVG set: good later, but unnecessary for this pass.

### Guided preference controls

Use icon-enhanced button groups for interests, activity preferences, budget style, social style, and favorite categories. Multi-value fields support accumulated selections, while single-value fields use one active selection.

Alternatives considered:

- Keep text inputs: flexible, but too raw for the desired consumer app feel.
- Dropdowns: compact, but less visual and less engaging for profile tuning.

## Risks / Trade-offs

- Copy can drift if translations are duplicated -> centralize foundation copy in one dictionary.
- Icons can clutter the UI -> use icons only for primary actions, section headings, nav, and empty states.
- Spacing fixes can affect mobile layout -> verify mobile-width rendering and protected route smoke tests.
- Preference chips can hide free-form options -> start with curated options and keep backend payload unchanged for now.

## Migration Plan

1. Add frontend locale provider/dictionary and local persistence.
2. Add banner/header language toggle.
3. Replace hard-coded foundation copy with localized values.
4. Add icon package and wire icons into key UI primitives/sections.
5. Adjust CSS spacing tokens and field/card layouts.
6. Replace profile/onboarding preference text inputs with selectable option groups.
7. Add/update frontend smoke tests for language switching, icons/labels, preference selection, and spacing-sensitive screens.

## Open Questions

- Should Spanish or English be the default language? For now, default to Spanish to match the user's current working language.
