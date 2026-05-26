## ADDED Requirements

### Requirement: Activity History
The system SHALL keep a paginated history of generated plans and meaningful user interactions for authenticated users.

#### Scenario: User views activity history
- **WHEN** an authenticated user opens activity history
- **THEN** the system MUST return the user's generated plans and interactions ordered from newest to oldest

### Requirement: Interaction Events
The system SHALL record product-specific interaction events such as generated, viewed, saved, skipped, completed, liked, and disliked.

#### Scenario: User completes a plan
- **WHEN** a user marks a plan as completed
- **THEN** the system MUST record a completed interaction event linked to the user and plan
