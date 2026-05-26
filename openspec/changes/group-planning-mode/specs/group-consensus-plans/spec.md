## ADDED Requirements

### Requirement: Group Consensus Plan Generation
The system SHALL generate common plan options from participant preferences, votes, and available planning context.

#### Scenario: Consensus plan generated
- **WHEN** a group session has enough participant input
- **THEN** the system MUST generate plan options that include group-fit explanations and ordered activities

### Requirement: Final Group Decision
The system SHALL allow the session owner or agreed session rule to select a final plan.

#### Scenario: Final plan selected
- **WHEN** a final group plan is selected
- **THEN** the system MUST persist the selected plan and show it to session participants

### Requirement: Insufficient Consensus
The system SHALL handle cases where participant constraints prevent a useful plan.

#### Scenario: No consensus possible
- **WHEN** participant constraints cannot produce a viable plan
- **THEN** the system MUST explain the conflict and suggest constraints the group can relax
