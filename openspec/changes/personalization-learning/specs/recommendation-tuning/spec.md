## ADDED Requirements

### Requirement: Recommendation Tuning Controls
The profile screen SHALL allow users to adjust recommendation preferences that influence future plans.

#### Scenario: User updates tuning
- **WHEN** an authenticated user saves recommendation tuning changes
- **THEN** the system MUST persist the tuning values and apply them to future recommendation context

### Requirement: Learned Preference Transparency
The profile screen SHALL show a concise summary of learned preferences when data exists.

#### Scenario: Learned summary exists
- **WHEN** a user has enough feedback or history to derive learned preferences
- **THEN** the profile MUST display a summary that explains the dominant preference signals
