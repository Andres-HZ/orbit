## ADDED Requirements

### Requirement: Saved Plans
The system SHALL allow authenticated users to save and unsave generated plans.

#### Scenario: User saves a plan
- **WHEN** an authenticated user saves a generated plan
- **THEN** the system MUST persist the saved plan relationship and show it in the user's saved items

### Requirement: Saved Places
The system SHALL allow authenticated users to save and unsave places from plan results or nearby discovery.

#### Scenario: User saves a place
- **WHEN** an authenticated user saves a place from a result card
- **THEN** the system MUST persist the saved place with source metadata when available
