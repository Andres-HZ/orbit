## Context

Orbit starts from `PRD.md` as a mobile-first product vision, but the current implementation target is a responsive web prototype. This foundation must create a coherent app surface before AI recommendations, nearby discovery, group planning, and learning features are layered in.

The technical baseline is Node.js + Express + PostgreSQL for the backend and React + Vite + Tailwind + Framer Motion for the frontend. APIs use `/api/v1`, `ApiResponse<T>`, JWT authentication, ISO 8601 dates, and cents for money values.

## Goals / Non-Goals

**Goals:**

- Establish a mobile-first responsive web app that can later be adapted to native mobile patterns.
- Provide secure auth and route protection for later personalized capabilities.
- Persist explicit user preferences from onboarding and profile editing.
- Create a home dashboard that exposes feature entry points without requiring all downstream capabilities to be implemented.
- Standardize brand primitives around black/purple Orbit visuals.

**Non-Goals:**

- Native mobile implementation.
- Real AI-generated recommendations, weather, maps, events, or group planning.
- Social graph, invitations, or collaborative voting.
- Paid subscriptions or marketplace flows.

## Decisions

### Web-first app shell before native mobile

Build the first Orbit experience as a responsive web app with mobile-first breakpoints, gesture-friendly controls, and large touch targets.

Alternatives considered:

- React Native first: closer to long-term mobile target, but slower to validate quickly in the current web prototype workflow.
- Desktop-first web: easier layout surface, but conflicts with the PRD's mobile UX priority.

### Feature-based backend boundaries

Organize backend code by feature, with controllers, services, repositories, and route modules for auth, users, onboarding, and dashboard data.

Alternatives considered:

- Layer-only folders: simpler initially, but harder to evolve as plan generation, nearby discovery, and group planning expand.
- Monolithic route handlers: fastest to write, but undermines the modular architecture goal.

### JWT auth with explicit preference persistence

Use JWT for authenticated API access and PostgreSQL tables for users and preference data. Store passwords only as hashes.

Alternatives considered:

- OAuth-only auth: useful later, but adds provider setup before the MVP has enough value.
- Client-only preferences: faster prototype, but later recommendation and learning features require server-side user context.

### Brand tokens as reusable UI primitives

Use black/purple tokens as the visual foundation:

- `orbit-black`: `#05030A`
- `orbit-surface`: `#11101A`
- `orbit-purple`: `#8B5CF6`
- `orbit-purple-bright`: `#A855F7`
- `orbit-purple-soft`: `#C4B5FD`
- `orbit-glass`: translucent dark surfaces with purple border glow

Alternatives considered:

- Mood-specific full theming in this phase: desirable later, but the foundation needs one polished brand system first.
- Generic Tailwind palette only: less product-specific and weaker brand continuity.

## Risks / Trade-offs

- Web-first implementation can drift from native mobile expectations -> keep layouts mobile-first and avoid desktop-only interactions.
- JWT session handling can become insecure if stored carelessly -> prefer short-lived access tokens, secure server validation, and no sensitive data in token payloads.
- Placeholder dashboard sections can feel unfinished -> label them as entry points and make empty states intentional.
- Preference schemas may evolve as recommendations improve -> use normalized preference tables or JSONB fields only where the set is expected to change frequently.

## Migration Plan

1. Create backend and frontend project structure if missing.
2. Add database migrations for users and preferences.
3. Implement auth APIs and route protection.
4. Implement onboarding and profile preference APIs.
5. Build web shell, auth pages, onboarding, home, and profile screens.
6. Add smoke tests for auth, protected API access, onboarding persistence, and route rendering.

Rollback is limited to removing the new project scaffolding and database migrations before real user data exists.

## Open Questions

- Which OAuth providers should be added first after email/password auth?
- Should initial preference taxonomy be fixed in seed data or managed through admin configuration later?
