## MODIFIED Requirements

### Requirement: Responsive Web Shell
The system SHALL provide a mobile-first responsive web application shell for Orbit with navigation, protected route layout, premium black/purple visual styling, consistent spacing, and discoverable English/Spanish language switching.

#### Scenario: Mobile viewport renders primary shell
- **WHEN** a user opens the web app on a mobile-width viewport
- **THEN** the app MUST render navigation, content, fields, and actions without horizontal scrolling or visually cramped spacing

#### Scenario: Hero title and subtitle spacing
- **WHEN** a primary hero/banner displays a large title and supporting subtitle
- **THEN** the subtitle MUST have enough vertical spacing to avoid appearing attached to the title

#### Scenario: Brand styling is applied
- **WHEN** any primary screen is rendered
- **THEN** the UI MUST use Orbit black/purple tokens and glass-style surfaces consistently

#### Scenario: Language toggle changes visible copy
- **WHEN** a user toggles the language between English and Spanish from the main banner or header area
- **THEN** the app MUST update visible foundation UI copy to the selected language without requiring a page reload

#### Scenario: Language preference persists
- **WHEN** a user selects a language and refreshes the web app
- **THEN** the app MUST restore the previously selected language from local client storage

### Requirement: Protected Route Experience
The system SHALL prevent unauthenticated users from accessing authenticated app screens.

#### Scenario: Unauthenticated protected route access
- **WHEN** an unauthenticated user requests an authenticated route
- **THEN** the system MUST redirect the user to login while preserving the intended destination when possible

#### Scenario: Authenticated protected route access
- **WHEN** an authenticated user requests an authenticated route
- **THEN** the system MUST render the requested screen without forcing login again

### Requirement: Reusable UI Components
The system SHALL provide reusable UI primitives for buttons, cards, inputs, page shells, loading states, empty states, and icon-enhanced section/action affordances.

#### Scenario: Primary action rendering
- **WHEN** a primary action is displayed
- **THEN** it MUST use the standard Orbit button treatment with hover or press feedback

#### Scenario: Empty state rendering
- **WHEN** a feature section has no data
- **THEN** it MUST render an intentional empty state instead of a broken or blank panel

#### Scenario: Icon-enhanced affordance rendering
- **WHEN** navigation items, primary actions, section headings, or empty states are displayed
- **THEN** the UI MUST use consistent icons that improve scanning without replacing accessible text labels
