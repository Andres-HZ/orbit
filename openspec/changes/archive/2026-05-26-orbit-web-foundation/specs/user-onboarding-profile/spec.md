## ADDED Requirements

### Requirement: Preference Onboarding
The system SHALL collect initial user preferences for interests, activity types, budget style, social style, and favorite categories.

#### Scenario: Completing onboarding
- **WHEN** an authenticated user submits all required onboarding preferences
- **THEN** the system MUST persist the preferences and mark onboarding as complete

#### Scenario: Missing required onboarding data
- **WHEN** an authenticated user submits incomplete onboarding preferences
- **THEN** the system MUST return validation errors for the missing required fields

### Requirement: Onboarding Gate
The web app SHALL route authenticated users who have not completed onboarding into the onboarding flow before the main dashboard.

#### Scenario: Authenticated user without onboarding
- **WHEN** an authenticated user without completed onboarding opens the app
- **THEN** the app MUST show onboarding before the home dashboard

#### Scenario: Authenticated user with onboarding
- **WHEN** an authenticated user with completed onboarding opens the app
- **THEN** the app MUST show the home dashboard

### Requirement: Profile Preference Management
The system SHALL allow authenticated users to view and update their stored profile preferences.

#### Scenario: View profile preferences
- **WHEN** an authenticated user opens the profile screen
- **THEN** the app MUST display the user's current preferences and profile metadata

#### Scenario: Update profile preferences
- **WHEN** an authenticated user saves valid preference changes
- **THEN** the system MUST persist the changes and return the updated profile using `ApiResponse<T>`

### Requirement: Profile Placeholders
The profile screen SHALL include intentional placeholders for activity history, saved places, favorite plans, and recommendation tuning.

#### Scenario: Placeholder section without data
- **WHEN** a profile section has no implemented data source yet
- **THEN** the app MUST show a clear empty state that communicates the feature is coming in a later phase
