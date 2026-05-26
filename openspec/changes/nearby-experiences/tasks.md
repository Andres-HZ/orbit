## 1. Provider Infrastructure

- [ ] 1.1 Add environment configuration for weather and maps/places providers
- [ ] 1.2 Implement provider adapter interfaces and normalized response contracts
- [ ] 1.3 Add caching strategy for weather and nearby discovery by coarse location/time window
- [ ] 1.4 Add tests for adapter normalization, missing fields, provider errors, and cache behavior

## 2. Location And Weather

- [ ] 2.1 Implement location context API for browser and manual locations
- [ ] 2.2 Build frontend location permission and manual fallback flow
- [ ] 2.3 Implement weather context API using active location
- [ ] 2.4 Render dashboard weather summary and unavailable state

## 3. Nearby Discovery And Maps

- [ ] 3.1 Implement nearby discovery API for restaurants, cafes, events, parks, nightlife, and activities
- [ ] 3.2 Render dashboard trending nearby cards
- [ ] 3.3 Enrich plan generation with optional nearby and weather context
- [ ] 3.4 Add distance and map metadata to eligible plan result cards
- [ ] 3.5 Add frontend tests for location fallback, weather display, nearby cards, provider failure, and map actions

## 4. Verification

- [ ] 4.1 Run backend tests, frontend tests, linting, and manual smoke test with granted and denied location permission
