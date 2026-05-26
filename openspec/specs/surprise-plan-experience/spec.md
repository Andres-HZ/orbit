## Purpose
Define the authenticated web experience for starting, loading, viewing, and retrying one-tap Surprise Me plans.

## Requirements

### Requirement: Surprise Dashboard Action
The web app SHALL expose a prominent Surprise Me action on the authenticated home dashboard.

#### Scenario: User starts surprise flow
- **WHEN** an onboarded authenticated user taps the Surprise Me action
- **THEN** the app MUST start surprise generation without requiring the full planning form

### Requirement: Surprise Loading State
The web app SHALL display a distinct loading experience while a surprise plan is being generated.

#### Scenario: Surprise request is in progress
- **WHEN** the Surprise Me request is pending
- **THEN** the app MUST show an animated loading state that communicates spontaneous plan generation

### Requirement: Surprise Retry
The web app SHALL allow the user to retry when a surprise result is not satisfactory or generation fails.

#### Scenario: User retries surprise
- **WHEN** a user selects retry from a surprise result or recoverable error
- **THEN** the app MUST request a new surprise plan
