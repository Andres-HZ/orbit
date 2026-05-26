## ADDED Requirements

### Requirement: Structured Plan Generation
The system SHALL generate structured plan recommendations from user context and stored preferences.

#### Scenario: Successful plan generation
- **WHEN** valid planning context is submitted
- **THEN** the system MUST return at least one structured plan with ordered activities, estimated cost in cents, estimated duration, category, and match explanation

### Requirement: AI Provider Adapter
The system SHALL isolate AI provider calls behind a dedicated service interface.

#### Scenario: AI provider succeeds
- **WHEN** the AI provider returns valid structured recommendations
- **THEN** the system MUST normalize the recommendations into the Orbit plan result contract

#### Scenario: AI provider fails
- **WHEN** the AI provider is unavailable or returns invalid data
- **THEN** the system MUST use the rule-based fallback and return a successful plan response when possible

### Requirement: Recommendation Safety Bounds
The recommendation engine MUST keep generated plans within the user's submitted budget and available time when those constraints are provided.

#### Scenario: Budget and time constraints provided
- **WHEN** a user submits maximum budget and available time
- **THEN** returned plans MUST NOT exceed those limits unless explicitly marked as approximate and explained
