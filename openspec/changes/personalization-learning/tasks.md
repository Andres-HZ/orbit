## 1. Data And APIs

- [ ] 1.1 Add migrations for interaction events, saved plans, saved places, and learned preference scores
- [ ] 1.2 Implement history API with pagination
- [ ] 1.3 Implement save/unsave APIs for plans and places
- [ ] 1.4 Implement feedback API for liked, disliked, skipped, completed, and not interested events
- [ ] 1.5 Implement recommendation tuning read/update API

## 2. Learning Service

- [ ] 2.1 Implement event-to-score preference weighting
- [ ] 2.2 Add learned preference enrichment to plan generation context
- [ ] 2.3 Add tests for score updates, dislike overrides, history pagination, saved items, and tuning persistence

## 3. Frontend Profile And Feedback

- [ ] 3.1 Add save, like, dislike, skip, and completed controls to eligible plan cards
- [ ] 3.2 Build activity history section in profile
- [ ] 3.3 Build saved plans and saved places sections in profile
- [ ] 3.4 Build recommendation tuning controls and learned preference summary
- [ ] 3.5 Add frontend tests for feedback controls, saved items, history, and tuning

## 4. Verification

- [ ] 4.1 Run backend tests, frontend tests, linting, and a manual smoke test confirming feedback affects a later plan request
