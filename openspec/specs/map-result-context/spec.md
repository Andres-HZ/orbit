## Purpose
Define how generated plan activities expose distance, location labels, and map actions when nearby provider data is available.

## Requirements

### Requirement: Plan Distance And Map Metadata
The system SHALL enrich plan results with distance and map metadata when provider data is available.

#### Scenario: Plan uses nearby place data
- **WHEN** a generated plan includes provider-backed nearby places
- **THEN** each applicable activity MUST include distance, location label, and map link metadata when available

### Requirement: Map Link Display
The web app SHALL display map links or map actions for plan result items with map metadata.

#### Scenario: User opens map action
- **WHEN** a user selects a map action on a plan result
- **THEN** the app MUST open the relevant map destination or provider link
