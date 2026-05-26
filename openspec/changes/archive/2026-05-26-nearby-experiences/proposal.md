## Why

Orbit becomes more useful when recommendations reflect real context: location, weather, distance, popularity, and nearby places or events. This change adds the environmental and discovery layer needed for higher-quality plans.

## What Changes

- Add location permission flow and manual location fallback.
- Add weather summary retrieval for planning context.
- Add nearby experience discovery for restaurants, cafes, parks, nightlife, activities, and events.
- Add map/distance metadata and trending nearby sections.
- Enrich plan generation inputs and results with nearby experience data when available.

### Non-Goals

- Reservations and ticket purchases are not included.
- Creator marketplace and paid event promotion are deferred.
- Native mobile geolocation APIs are deferred beyond web-compatible location handling.

## Capabilities

### New Capabilities

- `location-context`: Location permission, manual fallback, and normalized user location context.
- `weather-context`: Weather summary retrieval and presentation for planning.
- `nearby-discovery`: Nearby places/events discovery, trending lists, and distance metadata.
- `map-result-context`: Map links, distance display, and plan result enrichment.

### Modified Capabilities

- None.

## Impact

- Backend: provider adapters for weather, maps/places/events, caching, normalized external data contracts.
- Frontend: location permission UI, weather summary, nearby/trending dashboard sections, map/distance displays.
- Configuration: API keys for weather and maps/place providers.
