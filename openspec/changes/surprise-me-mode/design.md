## Context

Surprise Me builds on authenticated users, stored preferences, dashboard entry points, and the Smart Plan Generator. It reduces input friction by using defaults and profile data to generate a spontaneous plan.

## Goals / Non-Goals

**Goals:**

- Provide a one-tap planning path from the dashboard.
- Reuse the existing recommendation engine rather than duplicating planning logic.
- Make surprise-generated plans distinguishable for analytics, history, and future learning.
- Keep the web UX fast, animated, and mobile-friendly.

**Non-Goals:**

- Provider-backed nearby search or map routing.
- Group consensus surprise mode.
- Advanced behavioral tuning.

## Decisions

### Reuse plan generation with derived context

Surprise Me will create a derived plan context from stored preferences, selected dashboard mood, coarse location if available, and default time/budget values.

Alternatives considered:

- Separate surprise engine: more flexible later, but premature while the recommendation engine is new.
- Random static suggestions: fast, but not personalized enough for Orbit's promise.

### Surprise metadata

Persist surprise plans through the existing plan tables with a `source` or metadata field such as `surprise`.

Alternatives considered:

- Separate surprise tables: unnecessary until surprise behavior diverges significantly.

## Risks / Trade-offs

- Defaults may produce irrelevant plans -> surface lightweight optional constraints and allow retry.
- One-tap flow hides inputs -> show a short explanation of what Orbit used to generate the plan.
- Surprise animation can slow perceived performance -> keep animation interruptible and tied to real request state.

## Migration Plan

1. Add surprise source metadata to plan persistence if needed.
2. Add surprise generation service using existing plan engine.
3. Add surprise endpoint and tests.
4. Add dashboard UI, loading animation, result presentation, and retry flow.

## Open Questions

- What default budget and duration should be used per user until personalization learning exists?
