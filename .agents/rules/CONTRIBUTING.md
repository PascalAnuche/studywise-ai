# Contributing

## Workflow
1. Check `../docs/product/ROADMAP.md` and `../../studywise-ai-prd.md` before starting anything not already scoped
2. Reference the relevant PRD section in your branch name or commit, e.g. `feat/planner-edit-flow` for PRD 7.2
3. Keep AI prompt logic inside `/lib/ai`, never inline in route handlers or components (`../../AGENTS.md`)
4. Run lint, typecheck, and tests before opening a PR

## Commit Style
Conventional commits, per `../../AGENTS.md`: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`

## Pull Requests
- One feature or fix per PR, matching one PRD section where possible
- Describe what changed and which PRD or `../../AGENTS.md` section it implements
- If a change touches the data model or an API contract, update `../docs/DATA_MODEL.md` or `../docs/API.md` in the same PR, don't let the docs drift from the code

## Open Decisions
If a PR touches one of the open items in `../../AGENTS.md`, AI provider, styling, or test framework, resolve it there first. Don't let an implementation detail become a de facto decision without the docs reflecting it.
