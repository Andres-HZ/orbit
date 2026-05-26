## 1. Backend Surprise Generation

- [x] 1.1 Add surprise source metadata to plan persistence if missing
- [x] 1.2 Implement derived surprise context using stored preferences, current mood, and safe defaults
- [x] 1.3 Add authenticated surprise generation endpoint that reuses the plan recommendation engine
- [x] 1.4 Add backend tests for default application, generated plan persistence, source metadata, and retry-safe generation

## 2. Frontend Surprise Experience

- [x] 2.1 Wire the home dashboard Surprise Me action to the surprise endpoint
- [x] 2.2 Build surprise-specific animated loading state using Orbit black/purple styling
- [x] 2.3 Render surprise results with metadata explaining what context was used
- [x] 2.4 Add retry behavior from results and recoverable errors

## 3. Verification

- [x] 3.1 Add frontend tests for dashboard action, loading state, success result, failure state, and retry
- [x] 3.2 Run backend tests, frontend tests, linting, and a manual one-tap surprise smoke test
