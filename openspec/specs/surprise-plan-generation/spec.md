## Purpose
Define one-tap Surprise Me generation, defaults, and persistence metadata for spontaneous Orbit plans.

## Requirements

### Requirement: One-Tap Surprise Generation
The system SHALL allow an authenticated onboarded user to generate a spontaneous plan without completing the full planning form.

#### Scenario: Surprise request succeeds
- **WHEN** an authenticated onboarded user taps Surprise Me
- **THEN** the system MUST generate a structured plan using stored preferences, current dashboard context when available, and safe defaults

### Requirement: Surprise Defaults
The system MUST apply default budget, duration, and activity constraints when the user has not supplied explicit values.

#### Scenario: Missing explicit constraints
- **WHEN** a surprise request has no budget or duration values
- **THEN** the system MUST apply defaults and include those defaults in the generated plan metadata

### Requirement: Surprise Persistence
The system SHALL persist surprise-generated plans with metadata identifying the source as Surprise Me.

#### Scenario: Surprise plan is generated
- **WHEN** a surprise plan is generated successfully
- **THEN** the persisted plan MUST be distinguishable from manually generated plans
