## MODIFIED Requirements

### Requirement: Profile Preference Management
The system SHALL allow authenticated users to view and update their stored profile preferences through guided, icon-enhanced selectable controls instead of plain comma-separated text fields.

#### Scenario: View profile preferences
- **WHEN** an authenticated user opens the profile screen
- **THEN** the app MUST display the user's current preferences and profile metadata

#### Scenario: Profile preferences render as selectable controls
- **WHEN** an authenticated user views interests, activity preferences, budget style, social style, or favorite categories
- **THEN** the app MUST show compact visual selectable options with icons, accessible text labels, and group titles inside each selection container

#### Scenario: Accumulating multi-select preferences
- **WHEN** an authenticated user selects or deselects multi-value preferences such as interests, activity preferences, or favorite categories
- **THEN** the app MUST update the accumulated selected values before saving

#### Scenario: Update profile preferences
- **WHEN** an authenticated user saves valid preference changes
- **THEN** the system MUST persist the changes and return the updated profile using `ApiResponse<T>`
