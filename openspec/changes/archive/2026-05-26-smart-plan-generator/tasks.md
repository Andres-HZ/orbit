## 1. Backend Data Model

- [x] 1.1 Add migrations for plan requests and plan results linked to authenticated users
- [x] 1.2 Add typed plan context and plan result contracts using cents for costs and ISO 8601 timestamps
- [x] 1.3 Implement plan repository for creating and reading generated plans

## 2. Recommendation Engine

- [x] 2.1 Implement plan context validation and preference enrichment
- [x] 2.2 Implement AI service interface and Claude-backed adapter
- [x] 2.3 Implement deterministic rule-based fallback generator
- [x] 2.4 Implement output normalization and safety checks for budget/time constraints
- [x] 2.5 Add backend tests for valid generation, validation errors, AI success, AI failure fallback, and constraint handling

## 3. Plan APIs

- [x] 3.1 Add authenticated `POST /api/v1/plans/generate`
- [x] 3.2 Add authenticated endpoint to read a generated plan by ID
- [x] 3.3 Ensure plan responses use the standard `ApiResponse<T>` wrapper

## 4. Frontend Flow

- [x] 4.1 Add dashboard navigation into the plan context flow
- [x] 4.2 Build mobile-first planning context form with quick choices for mood, budget, time, group size, and activity preferences
- [x] 4.3 Build plan generation loading and recoverable error states
- [x] 4.4 Build plan result screen with activity cards, estimated cost, duration, order, and match explanations

## 5. Verification

- [x] 5.1 Add frontend tests for context validation, loading, error, and result rendering
- [x] 5.2 Run backend tests, frontend tests, linting, and a manual generate-plan smoke test
