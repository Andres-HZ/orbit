## ADDED Requirements

### Requirement: Group Session Creation
The system SHALL allow an authenticated user to create a group planning session.

#### Scenario: User creates group session
- **WHEN** an authenticated user creates a group planning session
- **THEN** the system MUST create a session with an owner, status, shareable join code or link, and creation timestamp

### Requirement: Participant Join
The system SHALL allow invited participants to join a valid group planning session.

#### Scenario: Participant joins valid session
- **WHEN** a participant opens a valid join link or enters a valid code
- **THEN** the system MUST add the participant to the session or restore their existing participant state

#### Scenario: Participant joins invalid session
- **WHEN** a participant uses an invalid or expired join code
- **THEN** the system MUST reject the join attempt with a clear error
