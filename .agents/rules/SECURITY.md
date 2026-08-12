# Security

## Data Sensitivity
StudyWise AI stores academic performance data, quiz scores, saved explanations, study struggles, and progress history. Per `../studywise-ai-prompt.md` section 12, this is treated as sensitive by default, never surfaced to other users, and never used to infer or state anything about a student's ability or intelligence.

## Reporting a Vulnerability
Don't open a public issue for a security finding.

There is no reporting channel yet. Until one exists this policy cannot actually be followed, which makes it worse than having no policy, a finder has nowhere to go and defaults to disclosing publicly. Tracked in `../../AGENTS.md` under Open Items, resolve before the repo is visible to anyone outside the team.

## Handling Practices
- Student data is scoped per `student_id`, no cross-student queries without dedicated admin tooling (not in v1 scope)
- AI provider API keys are never exposed client-side, all AI calls route through `/lib/ai` on the server
- No more student data is sent to the AI provider than what's needed to answer the specific request in front of it

## Known Gaps (pre-v1)
- No authentication system is specified yet in the PRD, resolve this before storing any real student data, the `students` table currently has no auth fields
- No rate limiting is defined for AI endpoints yet, worth adding before any public deployment given AI call cost and abuse risk
