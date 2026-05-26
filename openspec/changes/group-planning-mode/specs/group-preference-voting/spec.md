## ADDED Requirements

### Requirement: Participant Preference Capture
The system SHALL collect participant mood, interests, budget comfort, time availability, and activity constraints for a group planning session.

#### Scenario: Participant submits preferences
- **WHEN** a participant submits valid group preferences
- **THEN** the system MUST persist the preferences and make them available to the session consensus flow

### Requirement: Group Voting
The system SHALL allow participants to vote on proposed plan options or preference trade-offs.

#### Scenario: Participant votes
- **WHEN** a participant submits a vote in a group session
- **THEN** the system MUST persist the vote and update the session's shared decision state

### Requirement: Conflict Visibility
The system SHALL make major group preference conflicts visible before final plan selection.

#### Scenario: Conflicting constraints exist
- **WHEN** participant constraints conflict on budget, time, location, or activity style
- **THEN** the app MUST show the conflict and identify which constraint needs compromise without exposing private profile data
