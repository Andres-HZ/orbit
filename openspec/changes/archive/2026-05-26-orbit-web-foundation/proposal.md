## Why

Orbit needs a reliable product foundation before feature-specific planning modes can be built and tested. The PRD requires a fast, premium, mobile-first experience, but the first prototype targets responsive web, so this change establishes the web app shell, identity, authentication, onboarding, and base profile surfaces that later recommendations depend on.

## What Changes

- Create the responsive web-first Orbit application shell with black/purple brand styling, glassmorphism-inspired surfaces, smooth transitions, and mobile-first layouts.
- Add JWT authentication for registration, login, authenticated API access, and session restoration.
- Add onboarding that collects interests, activity preferences, budget style, social style, and favorite categories.
- Add the personalized home dashboard with quick mood selector, weather summary placeholder, recommended plans placeholder, surprise entry point, and nearby trending placeholder.
- Add a basic user profile for preferences, saved plans/places placeholders, activity history placeholder, and recommendation tuning entry points.
- Define reusable frontend components and backend feature boundaries so later capabilities can plug into the same API-first architecture.

### Non-Goals

- Native iOS/Android delivery is not included in this phase.
- Real map, weather, AI, and event provider integrations are deferred to later changes.
- Group planning, voting, and collaborative sessions are deferred.
- Full personalization learning is deferred beyond storing explicit onboarding/profile preferences.

## Capabilities

### New Capabilities

- `web-app-shell`: Responsive Orbit web shell, brand system, navigation, route protection, and core screen layout.
- `user-auth`: Registration, login, JWT session handling, and authenticated API access.
- `user-onboarding-profile`: Preference onboarding, profile management, and persisted user preference data.
- `home-dashboard`: Personalized home dashboard entry points for moods, recommendations, surprise mode, weather, and nearby discovery.

### Modified Capabilities

- None.

## Impact

- Backend: Node.js/Express API under `/api/v1`, JWT middleware, auth controllers/services/repositories, user preference persistence, and `ApiResponse<T>` responses.
- Database: PostgreSQL schema for users, auth credentials, sessions if needed, user preferences, and profile metadata.
- Frontend: React/Vite/Tailwind/Framer Motion app shell, route structure, auth state, protected pages, onboarding flow, home, and profile screens.
- Configuration: Environment variables for JWT secrets, database URL, API base URL, and frontend runtime configuration.
