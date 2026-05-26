## ADDED Requirements

### Requirement: User Registration
The system SHALL allow a new user to register with valid identity credentials and create a persisted account.

#### Scenario: Successful registration
- **WHEN** a user submits valid registration data
- **THEN** the system MUST create the user, store only a password hash, and return an authenticated response using `ApiResponse<T>`

#### Scenario: Duplicate registration
- **WHEN** a user registers with an email that already exists
- **THEN** the system MUST reject the request with a validation error and MUST NOT create a duplicate account

### Requirement: User Login
The system SHALL allow an existing user to authenticate and receive a JWT for API access.

#### Scenario: Successful login
- **WHEN** a user submits valid credentials
- **THEN** the system MUST return a JWT and user summary using `ApiResponse<T>`

#### Scenario: Invalid login
- **WHEN** a user submits invalid credentials
- **THEN** the system MUST reject authentication without revealing whether the email or password was incorrect

### Requirement: Authenticated API Access
The system SHALL require a valid JWT for protected `/api/v1` endpoints.

#### Scenario: Missing token
- **WHEN** a protected endpoint receives a request without a JWT
- **THEN** the system MUST return an unauthorized error using the standard API response shape

#### Scenario: Valid token
- **WHEN** a protected endpoint receives a valid JWT
- **THEN** the system MUST attach the authenticated user context to the request handling flow

### Requirement: Session Restoration
The web app SHALL restore authenticated state when a valid token exists.

#### Scenario: App reload with valid token
- **WHEN** an authenticated user reloads the web app
- **THEN** the app MUST restore the session and keep the user on authenticated screens

#### Scenario: App reload with expired token
- **WHEN** the web app detects an expired or invalid token
- **THEN** it MUST clear local auth state and route the user to login
