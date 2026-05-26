## ADDED Requirements

### Requirement: Plan Feedback
The system SHALL allow users to provide feedback on generated plans and activity cards.

#### Scenario: User dislikes a plan
- **WHEN** a user marks a plan or activity as disliked
- **THEN** the system MUST record the feedback and reduce matching weight for relevant attributes

#### Scenario: User likes a plan
- **WHEN** a user marks a plan or activity as liked
- **THEN** the system MUST record the feedback and increase matching weight for relevant attributes

### Requirement: Learned Recommendation Context
The recommendation engine SHALL include learned preference scores in future recommendation requests.

#### Scenario: Learned preferences exist
- **WHEN** a user with learned preference scores generates a plan
- **THEN** the recommendation engine MUST include those scores as part of the recommendation context
