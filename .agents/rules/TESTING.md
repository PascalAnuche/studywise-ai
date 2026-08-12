# Testing

Expands on the testing note in `../../AGENTS.md`. Framework isn't chosen yet, defaulting to Vitest, this doc defines what to test once one is picked, not just how to run it.

## Priority Areas
Ordered by risk of silent failure, not by ease of testing:

1. **Understanding checkpoints** — the "does the student understand" branch in the Assistant and Planner flows, wrong branching means a student silently gets stuck or an incomplete explanation gets saved as final. Cover the abandoned case too: `understood` stays null, and null must never be counted as "did not understand"
2. **Quiz scoring** — correct/incorrect determination and score calculation in `/api/practice/:quizId/submit`
3. **Recommendation logic** — that recommendations trace back to actually-missed topics, not generic output
4. **Progress calculation** — streaks, weak-area flags, completed-topic counts, these feed the dashboard directly and any wrong number undermines the trust the product is built around. The streak is written from three separate triggers, so test that two actions on the same day extend it once, not twice

## What Not to Over-Test
AI response content itself isn't a good unit test target, providers change, wording varies. Test the contract instead, does a response include `answer`, `reasoning`, and `confidence`, does confidence fall within the allowed values from `../docs/DATA_MODEL.md`.

## Test Types
- Unit tests: scoring, streak calculation, and recommendation matching logic in `/lib`
- Integration tests: API routes against a test SQLite database, with the AI adapter mocked rather than calling a real provider
- No end-to-end/browser tests planned for v1, revisit once the four core flows stabilize post-launch

## Running Tests
`npm run test` (script to be added once the test framework is confirmed, see `../../AGENTS.md` Open Items)
