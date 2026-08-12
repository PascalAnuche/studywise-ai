# Roadmap

## Phase 0 — Foundation (current)
- Product requirements defined (`../../../studywise-ai-prd.md`)
- AI behavior spec defined (`../../studywise-ai-prompt.md`), authoritative copy supplied 10 August 2026
- Data model and API contracts drafted
- Color and typography tokens defined, generated into `../../../tokens/tokens.css`
- No application code written yet

## Phase 1 — v1 MVP (PRD section 6)
1. AI Study Assistant with explainable answers — built
2. Study Planner — built
3. AI-generated quizzes with results and recommendations — built
4. Basic progress tracking — built

All four run against the mock AI provider. What remains before this ships is not features: a real AI provider, authentication, rate limiting, and the accessibility fixes in `../DESIGN_SYSTEM.md`. See Phase 7 of `../IMPLEMENTATION_PLAN.md`.

Ships when all four features work end to end against the flows in the PRD, currently blocked on the open decisions in `../../../AGENTS.md` (AI provider, styling, test framework) and the missing Progress Tracking flow diagram (PRD section 12).

## Phase 2 — Post-launch
Pulled from PRD section 6's "out of scope for v1," revisit once real usage data exists:
- Native mobile apps
- Collaborative/group study features
- LMS integrations (Canvas, Moodle, etc.)
- Voice-based interaction
- Lecture notes upload (PRD open question, may pull forward if early demand is high)

## Metrics Gate
Before committing to Phase 2 scope, the success metrics in PRD section 3 need a real usage baseline, that data should decide which Phase 2 item comes first, not assumption.
