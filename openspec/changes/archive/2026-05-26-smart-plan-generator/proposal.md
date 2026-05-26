## Why

The Smart Plan Generator is Orbit's core promise: users should stop deciding from a blank page and receive personalized activity ideas based on their current context. This change turns the foundation dashboard into a working planning flow.

## What Changes

- Add a plan request flow that captures location, budget, available time, mood, energy level, group size, indoor/outdoor preference, and activity interests.
- Add backend plan generation APIs that combine user input, stored preferences, and recommendation logic.
- Add AI integration through a dedicated `AIService` with a deterministic fallback when the provider is unavailable.
- Return structured plan results with activity cards, estimated cost, estimated duration, distance placeholder, ordered steps, and "Why this matches you" explanation.
- Persist generated plans for later profile/history features.

### Non-Goals

- Real nearby provider search, maps routing, and weather integration are deferred to `nearby-experiences`.
- One-tap spontaneous planning is deferred to `surprise-me-mode`.
- Group voting and consensus planning are deferred to `group-planning-mode`.
- Long-term behavioral learning is deferred to `personalization-learning`.

## Capabilities

### New Capabilities

- `plan-context-capture`: User-facing flow for collecting planning context.
- `plan-recommendation-engine`: Backend service for generating structured personalized plan recommendations.
- `plan-results`: Plan result presentation, explanations, and persistence.

### Modified Capabilities

- None.

## Impact

- Backend: plan routes, controller/service/repository modules, AI service adapter, fallback rules, plan persistence, and tests.
- Database: plan request/result tables linked to users.
- Frontend: plan context form, result screen, activity cards, loading states, error states, and dashboard navigation.
- Configuration: AI provider key/model settings with local fallback behavior.
