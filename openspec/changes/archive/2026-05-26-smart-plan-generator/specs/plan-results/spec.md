## ADDED Requirements

### Requirement: Plan Result Screen
The web app SHALL display generated plans as mobile-first activity cards with key decision information.

#### Scenario: Results rendered
- **WHEN** a plan generation request succeeds
- **THEN** the app MUST display activity cards with title, category, estimated cost, duration, location label, order, and "Why this matches you" explanation

### Requirement: Plan Persistence
The system SHALL persist generated plan requests and results for authenticated users.

#### Scenario: Generated plan saved
- **WHEN** a plan is generated successfully
- **THEN** the system MUST store the input context, result payload, user ID, and creation timestamp

### Requirement: Result Loading And Error States
The web app SHALL show clear loading and error states for plan generation.

#### Scenario: Plan is generating
- **WHEN** the user submits planning context and the request is in progress
- **THEN** the app MUST show a loading state that communicates Orbit is generating options

#### Scenario: Plan generation fails
- **WHEN** plan generation cannot complete
- **THEN** the app MUST show a recoverable error state with an option to try again
