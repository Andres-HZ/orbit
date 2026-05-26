## Context

The generator can produce useful suggestions without external providers, but PRD quality improves when Orbit understands weather, location, and nearby options. This change adds provider-backed context behind normalized interfaces.

## Goals / Non-Goals

**Goals:**

- Normalize user location from browser permission or manual entry.
- Retrieve and cache weather summaries for planning context.
- Retrieve nearby places/events and trending experiences.
- Enrich generated plans with distance, map links, and real-world place candidates.

**Non-Goals:**

- Payments, reservations, ticketing, or marketplace workflows.
- Native mobile-only location behavior.
- Full route optimization across multiple transport modes.

## Decisions

### Provider adapter boundary

Weather, maps, and nearby discovery calls will live behind provider adapters so Orbit can swap services later.

Alternatives considered:

- Direct provider calls from plan service: faster initially, but hard to test and replace.
- Mock-only data: easy for demo, but misses the PRD's context-aware promise.

### Cached contextual data

Cache weather and nearby discovery results by coarse location/time window to reduce provider cost and latency.

Alternatives considered:

- Always live calls: fresher data, but slower and more expensive.
- Long-lived static cache: cheaper, but risks stale plans.

### Manual location fallback

The web app will allow manual city/neighborhood input when browser geolocation is denied.

Alternatives considered:

- Require geolocation permission: cleaner data, but blocks privacy-conscious users.

## Risks / Trade-offs

- Provider quotas can break demos -> add fallback/empty states and cache responses.
- Location data is sensitive -> request only when needed and avoid storing exact coordinates unless required.
- External data can be inconsistent -> normalize categories and tolerate missing ratings or distance fields.

## Migration Plan

1. Add provider configuration and adapter interfaces.
2. Implement location context APIs and frontend permission/manual entry flow.
3. Implement weather context API and dashboard summary.
4. Implement nearby discovery API and dashboard/result displays.
5. Enrich plan generation with optional nearby context.

## Open Questions

- Which maps/places provider should be used first for the prototype?
- What cache duration balances freshness and cost for weather and nearby discovery?
