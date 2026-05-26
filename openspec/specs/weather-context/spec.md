## Purpose
Define how Orbit retrieves and presents weather context for planning, including graceful degradation when providers are unavailable.

## Requirements

### Requirement: Weather Summary
The system SHALL retrieve a concise weather summary for the user's active location when available.

#### Scenario: Weather data available
- **WHEN** a user has active location context
- **THEN** the system MUST provide weather condition, temperature, and indoor/outdoor suitability metadata

#### Scenario: Weather provider unavailable
- **WHEN** the weather provider fails
- **THEN** the app MUST show a graceful unavailable state and plan generation MUST continue without weather context

### Requirement: Dashboard Weather Display
The web app SHALL display the current weather summary on the home dashboard when available.

#### Scenario: Dashboard with weather
- **WHEN** weather context is available
- **THEN** the dashboard MUST show a concise weather summary relevant to planning
