## ADDED Requirements

### Requirement: Planning Context Form
The system SHALL allow authenticated users to submit planning context including location, budget, available time, mood, energy level, group size, indoor/outdoor preference, and interests.

#### Scenario: Valid context submitted
- **WHEN** an authenticated user submits valid planning context
- **THEN** the system MUST accept the context for plan generation

#### Scenario: Missing required context
- **WHEN** an authenticated user submits planning context without required fields
- **THEN** the system MUST return validation errors and MUST NOT generate a plan

### Requirement: Stored Preference Enrichment
The system SHALL enrich planning context with the authenticated user's stored onboarding/profile preferences.

#### Scenario: User has stored preferences
- **WHEN** a user generates a plan after onboarding
- **THEN** the recommendation request MUST include relevant stored preferences in addition to current context
