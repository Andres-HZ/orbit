## ADDED Requirements

### Requirement: Location Permission Flow
The web app SHALL ask for location access only when location-aware features need it.

#### Scenario: User grants location
- **WHEN** a user grants browser location permission
- **THEN** the app MUST use the location as planning context without exposing raw coordinates unnecessarily in the UI

#### Scenario: User denies location
- **WHEN** a user denies browser location permission
- **THEN** the app MUST offer manual city or neighborhood entry

### Requirement: Normalized Location Context
The system SHALL normalize location input into a consistent context object for planning and discovery services.

#### Scenario: Manual location submitted
- **WHEN** a user submits a valid manual location
- **THEN** the system MUST store or resolve it as normalized planning context
