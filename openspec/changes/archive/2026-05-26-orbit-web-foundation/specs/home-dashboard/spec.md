## ADDED Requirements

### Requirement: Personalized Home Dashboard
The system SHALL provide an authenticated home dashboard centered on the question "What do you want to do today?"

#### Scenario: Dashboard loads for onboarded user
- **WHEN** an onboarded authenticated user opens the home screen
- **THEN** the app MUST show the main prompt, quick mood selector, recommendation area, surprise action, weather summary area, and nearby trending area

### Requirement: Quick Mood Selection
The dashboard SHALL allow the user to select a current mood or energy state as planning context.

#### Scenario: User selects mood
- **WHEN** the user selects a mood on the dashboard
- **THEN** the app MUST store the selection in client state for use by later planning actions

### Requirement: Feature Entry Points
The dashboard SHALL expose entry points for recommendations, Surprise Me, nearby discovery, and profile tuning even when downstream features are not implemented yet.

#### Scenario: Feature entry point is unavailable
- **WHEN** a user selects an entry point whose downstream capability is not yet implemented
- **THEN** the app MUST show an intentional unavailable state instead of crashing or navigating to a broken page

#### Scenario: Feature entry point is available
- **WHEN** a user selects an entry point whose downstream capability exists
- **THEN** the app MUST navigate to that feature using the current dashboard context when applicable
