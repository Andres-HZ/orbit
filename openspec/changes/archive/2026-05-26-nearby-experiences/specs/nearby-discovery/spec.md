## ADDED Requirements

### Requirement: Nearby Experience Discovery
The system SHALL return nearby restaurants, cafes, events, parks, nightlife, and activities based on active location context.

#### Scenario: Nearby results available
- **WHEN** a user requests nearby discovery with valid location context
- **THEN** the system MUST return normalized experience cards with category, title, place name when available, description when available, location label, distance when available, opening hours when available, popularity/rating/price when available, tags when available, and source metadata

### Requirement: Trending Nearby Section
The web app SHALL display trending nearby experiences on the home dashboard when discovery data is available.

#### Scenario: Trending data rendered
- **WHEN** nearby discovery returns trending experiences
- **THEN** the dashboard MUST display them as mobile-first cards with enough detail to understand the place, schedule, distance, popularity, and map action when available

### Requirement: Nearby Provider Failure
The app SHALL handle nearby provider failures without breaking the dashboard or plan flow.

#### Scenario: Nearby provider unavailable
- **WHEN** nearby provider calls fail
- **THEN** the app MUST show an intentional unavailable state and keep other dashboard actions usable
