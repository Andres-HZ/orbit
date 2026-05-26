## Context

The PRD requires personalization over time. This change builds on plan generation and persisted results by recording user interactions and deriving explainable preference signals.

## Goals / Non-Goals

**Goals:**

- Track useful user interactions without over-collecting data.
- Let users save plans and places.
- Feed learned preferences back into recommendation context.
- Expose tuning controls so users can correct the system.

**Non-Goals:**

- Black-box ML ranking.
- Cross-user social matching.
- Monetization or premium personalization.

## Decisions

### Explainable scoring first

Use weighted preference scores by category, budget, indoor/outdoor tendency, food types, activity intensity, and social style.

Alternatives considered:

- ML model from the start: premature without enough data.
- Manual preferences only: misses the PRD's "learns over time" requirement.

### Event-based interaction tracking

Record plan interactions as events, then derive scores from those events.

Alternatives considered:

- Update aggregate scores only: simpler, but loses useful audit/history detail.

## Risks / Trade-offs

- Tracking too much can feel invasive -> keep event types product-specific and visible through profile/history.
- Learned scores can reinforce bad recommendations -> allow explicit tuning and dislike signals to override weak positives.
- History can grow quickly -> paginate APIs and avoid loading everything at once.

## Migration Plan

1. Add interaction, favorites, and preference score persistence.
2. Add APIs for history, favorites, feedback, and tuning.
3. Enrich recommendation engine inputs with learned scores.
4. Add profile/history/favorites UI and plan feedback controls.

## Open Questions

- How long should old interactions influence recommendations before decaying?
