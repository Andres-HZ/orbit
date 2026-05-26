## Context

The foundation change provides authenticated users, onboarding preferences, and a dashboard entry point. This change adds Orbit's first recommendation capability: generating plans from current context plus stored preferences.

## Goals / Non-Goals

**Goals:**

- Capture enough context to produce useful activity plans.
- Use a dedicated AI service interface with structured output and a rule-based fallback.
- Persist generated plan requests and results for later history and learning.
- Present results as mobile-first activity cards with cost, duration, ordering, and match explanations.

**Non-Goals:**

- Real provider search, maps, weather, reservations, or event data.
- Collaborative group planning.
- Fully automated personalization from behavior.

## Decisions

### Structured plan contracts

Plan generation will use typed request and response contracts. Costs are stored in cents, dates use ISO 8601, and result items include title, category, estimated duration, estimated cost, location label, order index, and match explanation.

Alternatives considered:

- Free-form AI text only: faster to generate, but hard to render and test.
- Hardcoded cards only: reliable, but does not validate the AI recommendation product promise.

### AI service with fallback

Use a dedicated `AIService` for Claude-backed generation and a deterministic rule-based fallback for local development and provider failures.

Alternatives considered:

- Direct provider calls in plan service: simpler initially, but couples business logic to provider details.
- No AI until later: reduces risk, but delays the main PRD value proposition.

### Persist requests and results

Store each generated plan and its input context so later history, favorites, and personalization changes can reuse the data.

Alternatives considered:

- Generate without persistence: simpler, but blocks profile history and learning.

## Risks / Trade-offs

- AI output can be malformed -> validate and normalize provider output before returning it.
- Fallback quality may feel less magical -> make fallback deterministic but context-aware enough for tests and demos.
- Persisted context may include sensitive location preferences -> store only needed planning fields and keep exact coordinates optional.
- Web-first form flow can feel slow on mobile -> use progressive, card-based input with quick choices.

## Migration Plan

1. Add plan request/result persistence.
2. Add backend plan generation endpoint behind JWT auth.
3. Add AI adapter and fallback generator.
4. Add plan context UI and result screen.
5. Add tests for validation, fallback behavior, persistence, and result rendering.

## Open Questions

- Which city/location defaults should be used when the user has not granted location access?
- Should AI provider failures be visible to users or silently use fallback plans?
