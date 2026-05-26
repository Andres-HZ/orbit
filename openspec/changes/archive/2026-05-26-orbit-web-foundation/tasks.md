## 1. Backend Project Foundation

- [x] 1.1 Create Node.js/Express project structure with `/api/v1` routing and `ApiResponse<T>` helpers
- [x] 1.2 Add PostgreSQL connection management, migration tooling, and environment configuration
- [x] 1.3 Add shared error handling, validation middleware, and request logging
- [x] 1.4 Add health check endpoint for local smoke testing

## 2. User Auth

- [x] 2.1 Create user and credential database migrations with unique email constraints
- [x] 2.2 Implement auth repository for user lookup, creation, and password hash storage
- [x] 2.3 Implement registration service and `/api/v1/auth/register`
- [x] 2.4 Implement login service and `/api/v1/auth/login`
- [x] 2.5 Implement JWT signing, verification, and protected route middleware
- [x] 2.6 Add auth API tests for registration, duplicate email, login, invalid credentials, missing token, and valid token

## 3. Onboarding And Profile

- [x] 3.1 Create preference/profile persistence model for interests, activity preferences, budget style, social style, favorite categories, and onboarding status
- [x] 3.2 Implement onboarding read/write API endpoints for authenticated users
- [x] 3.3 Implement profile preference read/update API endpoints
- [x] 3.4 Add validation for required onboarding fields and profile update payloads
- [x] 3.5 Add API tests for onboarding completion, missing required fields, profile loading, and profile updates

## 4. Web App Shell

- [x] 4.1 Create React/Vite/Tailwind/Framer Motion frontend structure if missing
- [x] 4.2 Define Orbit black/purple theme tokens and reusable UI primitives
- [x] 4.3 Implement client API wrapper using `ApiResponse<T>` and auth token handling
- [x] 4.4 Implement auth state management, session restoration, protected routes, and logout
- [x] 4.5 Build login and registration screens with mobile-first responsive layout

## 5. Onboarding, Home, And Profile UI

- [x] 5.1 Build onboarding flow for interests, activity preferences, budget style, social style, and favorite categories
- [x] 5.2 Gate onboarded vs non-onboarded authenticated users correctly
- [x] 5.3 Build home dashboard with main prompt, quick mood selector, recommendation placeholder, surprise entry point, weather placeholder, and nearby placeholder
- [x] 5.4 Build profile screen with preference editing and intentional placeholders for history, saved places, favorite plans, and tuning
- [x] 5.5 Add loading, empty, and unavailable states for dashboard/profile sections

## 6. Verification

- [x] 6.1 Add frontend smoke tests for protected route behavior, session restoration, onboarding gate, home rendering, and profile rendering
- [x] 6.2 Run backend tests, frontend tests, linting, and a local manual smoke test from registration through dashboard access
