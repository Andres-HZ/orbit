## Why

The PRD calls for a magical, addictive one-tap experience. After the core plan generator exists, Surprise Me gives users a faster path to action when they do not want to answer a full planning form.

## What Changes

- Add a one-tap Surprise Me action from the home dashboard.
- Generate a full spontaneous plan using stored preferences, current mood if selected, sensible defaults, and optional lightweight constraints.
- Return estimated costs, estimated duration, nearby/location labels when available, and optimized activity order.
- Add surprise-specific loading animations and a result presentation that feels distinct from manual planning.

### Non-Goals

- Real-time nearby provider search is deferred to `nearby-experiences`.
- Group surprise planning is deferred to `group-planning-mode`.
- Long-term surprise tuning from behavior is deferred to `personalization-learning`.

## Capabilities

### New Capabilities

- `surprise-plan-generation`: One-tap spontaneous plan generation using defaults and stored preferences.
- `surprise-plan-experience`: UI behavior, loading, result presentation, and retry flow for Surprise Me.

### Modified Capabilities

- None.

## Impact

- Backend: surprise generation endpoint that reuses the plan recommendation engine.
- Frontend: home surprise action, loading animation, result route/state, retry behavior.
- Database: reuse plan persistence with metadata indicating surprise-generated plans.
