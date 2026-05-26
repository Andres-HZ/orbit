## Why

Orbit should feel like it understands the user better over time. Once users can generate and view plans, the product needs feedback, history, favorites, and preference tuning to improve future recommendations.

## What Changes

- Add activity history for generated plans and user interactions.
- Add saved/favorite plans and saved places.
- Add explicit plan feedback such as liked, disliked, skipped, completed, and not interested.
- Update recommendation context to include learned preferences from behavior.
- Add profile recommendation tuning controls.

### Non-Goals

- Complex machine learning models are not included; this phase uses explainable preference scoring.
- Social compatibility matching is deferred to future group/social changes.
- Premium personalization tiers are not included.

## Capabilities

### New Capabilities

- `activity-history`: Persisted user history of generated plans and interactions.
- `favorites-saved-items`: Saved plans, saved places, and favorite activity categories.
- `feedback-learning`: Feedback capture and preference scoring for future recommendations.
- `recommendation-tuning`: Profile controls for adjusting recommendation behavior.

### Modified Capabilities

- None.

## Impact

- Backend: interaction tracking, favorites APIs, scoring service, recommendation context enrichment.
- Database: history, favorites, feedback, and learned preference score tables.
- Frontend: profile history/favorites screens, feedback controls on plan cards, tuning UI.
