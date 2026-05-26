## Why

The PRD includes social planning where friends share moods, vote preferences, and converge on a common plan. This change adds collaborative planning after individual planning and personalization are established.

## What Changes

- Add group planning sessions created by an authenticated user.
- Allow invited participants to join through a shareable link or code.
- Collect participant moods, interests, constraints, and votes.
- Generate a common plan optimized for group preferences.
- Display shared decision state and final selected plan.

### Non-Goals

- Full social graph and friend management are not included.
- Real-time chat is not included.
- Payments, reservations, and event ticketing are not included.

## Capabilities

### New Capabilities

- `group-session-management`: Group planning session creation, invite links/codes, participant join, and session state.
- `group-preference-voting`: Participant preference capture, mood sharing, voting, and conflict visibility.
- `group-consensus-plans`: Common plan generation and final group decision presentation.

### Modified Capabilities

- None.

## Impact

- Backend: group sessions, participants, votes, consensus service, group plan generation endpoint.
- Database: group sessions, participant context, votes, selected plans.
- Frontend: group mode screen, invite/join flow, voting UI, consensus result UI.
