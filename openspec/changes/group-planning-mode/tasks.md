## 1. Group Data Model

- [ ] 1.1 Add migrations for group sessions, participants, participant preferences, votes, and selected plans
- [ ] 1.2 Implement repositories for sessions, participants, votes, and group plan state
- [ ] 1.3 Add unguessable join code generation and expiration/status handling

## 2. Group APIs

- [ ] 2.1 Implement authenticated group session create/read endpoints
- [ ] 2.2 Implement participant join endpoint for valid share codes
- [ ] 2.3 Implement participant preference submission endpoint
- [ ] 2.4 Implement group voting endpoint
- [ ] 2.5 Implement final plan selection endpoint
- [ ] 2.6 Add backend tests for create, join, invalid code, preferences, voting, conflicts, consensus generation, and final selection

## 3. Consensus Planning

- [ ] 3.1 Implement group preference aggregation with hard constraints and soft weights
- [ ] 3.2 Integrate group context with the existing plan recommendation engine
- [ ] 3.3 Add conflict detection and compromise suggestions
- [ ] 3.4 Persist generated group plan options and selected final plan

## 4. Frontend Group Mode

- [ ] 4.1 Build group mode dashboard entry and session creation flow
- [ ] 4.2 Build invite link/code display and join flow
- [ ] 4.3 Build participant preference and mood sharing UI
- [ ] 4.4 Build voting UI and shared session state display
- [ ] 4.5 Build consensus results and final selected plan view
- [ ] 4.6 Add frontend tests for create, join, preference submission, voting, conflict display, and final result

## 5. Verification

- [ ] 5.1 Run backend tests, frontend tests, linting, and a manual two-participant group planning smoke test
