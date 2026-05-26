## Context

Group Planning Mode depends on the individual planning foundation: authenticated users, profiles, generated plans, nearby data, and preference learning. It adds session state and preference aggregation for multiple participants.

## Goals / Non-Goals

**Goals:**

- Let users create lightweight group planning sessions.
- Support invited participants without requiring a full social graph.
- Capture group moods, constraints, interests, and votes.
- Generate a common plan using participant preferences and explain why it fits the group.

**Non-Goals:**

- Chat, friend lists, or permanent social graph.
- Reservations, payments, or ticketing.
- Native push notifications.

## Decisions

### Shareable session codes first

Use shareable links/codes for joining group sessions instead of building friend relationships.

Alternatives considered:

- Full friend graph: richer long term, but too large for first group planning delivery.
- Anonymous-only sessions: simple, but loses profile preference benefits for authenticated participants.

### Aggregated preference scoring

Generate group plans by aggregating participant constraints and weights, with hard constraints for budget/time/location where possible and soft weights for moods/interests.

Alternatives considered:

- Majority vote only: transparent, but weak for mixed constraints.
- AI-only consensus: flexible, but harder to test and explain.

## Risks / Trade-offs

- Group state can become stale -> add explicit session statuses and timestamps.
- Conflicting constraints may produce no good plan -> show trade-off explanations and ask the group to relax constraints.
- Joining flow can be abused -> use unguessable join codes and avoid exposing private profile data.

## Migration Plan

1. Add group session, participant, and vote persistence.
2. Add group session create/join/read APIs.
3. Add preference/voting APIs.
4. Add consensus generation service using existing plan engine.
5. Build group mode UI and tests.

## Open Questions

- Should unauthenticated guests be allowed in the first version, or require accounts for all participants?
