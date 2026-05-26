# plan-context-capture Specification

## Purpose
Capture the authenticated user's current planning context and enrich it with stored profile preferences before generating a plan.

## Requirements
### Requirement: Planning Context Form
The system SHALL allow authenticated users to submit planning context including location, budget, available time, mood, energy level, group size, indoor/outdoor preference, interests, and selected language.

#### Scenario: Valid context submitted
- **WHEN** an authenticated user submits valid planning context
- **THEN** the system MUST accept the context for plan generation

#### Scenario: Missing required context
- **WHEN** an authenticated user submits planning context without required fields
- **THEN** the system MUST return validation errors and MUST NOT generate a plan

#### Scenario: Selected language submitted
- **WHEN** a user generates a plan from the web app
- **THEN** the system MUST include the active English or Spanish locale in the generation request

### Requirement: Stored Preference Enrichment
The system SHALL enrich planning context with the authenticated user's stored onboarding/profile preferences.

#### Scenario: User has stored preferences
- **WHEN** a user generates a plan after onboarding
- **THEN** the recommendation request MUST include relevant stored preferences in addition to current context
