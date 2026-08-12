# AGENTS.md

Build instructions for agents and developers working in this repo. Nine docs already point here for conventions and open decisions, this file is the index and the record of what is not yet decided.

Read `README.md` first for what the product is. Read this for how to build it.

## Documentation Map

All documentation lives under `.agents/`.

| Need | Read |
| --- | --- |
| Destinations, flows, and how they connect | `.agents/docs/NAVIGATION.md` |
| Add a feature, or re-skin the product | `.agents/docs/EXTENDING.md` |
| How to build it, in what order | `.agents/docs/IMPLEMENTATION_PLAN.md` |
| What we're building and why | `studywise-ai-prd.md`, at the repo root |
| How the AI must behave | `.agents/studywise-ai-prompt.md` |
| System design, request flow | `.agents/docs/ARCHITECTURE.md` |
| Database schema | `.agents/docs/DATA_MODEL.md` |
| API route contracts | `.agents/docs/API.md` |
| Component breakdown | `.agents/docs/COMPONENTS.md` |
| Colors, typography, states | `.agents/docs/DESIGN_SYSTEM.md` |
| Local setup | `.agents/docs/INSTALLATION.md` |
| Shipping | `.agents/docs/DEPLOYMENT.md` |
| What's next | `.agents/docs/product/ROADMAP.md` |

Rules in `.agents/rules/` are normative, follow them when writing code: `.agents/rules/CODE_STYLE.md`, `.agents/rules/CONTRIBUTING.md`, `.agents/rules/SECURITY.md`, `.agents/rules/TESTING.md`.

## Repository Layout

```
AGENTS.md, README.md      entry points
studywise-ai-prd.md       the PRD, root reference, single copy
/.agents                  all documentation
  /docs                   architecture, data model, API, design
    /product              PRD, roadmap, changelog
  /rules                  normative standards, follow when writing code
  studywise-ai-prompt.md  AI behavior spec, missing
/tokens
  design-tokens.tokens*.json  raw Figma exports, source of truth for design
  build-tokens.js         Figma token export -> CSS variables
  tokens.css              generated, never hand-edited
```

Application code does not exist yet. The intended structure is in `README.md` under Project Structure.

## Standing Rules

1. **Anchor every piece of work to the PRD.** `studywise-ai-prd.md`, at the repo root, is the root reference. It lives at the root deliberately, and there is exactly one copy: never fork it into the docs tree, two copies drift. Before building a feature, read its section 7 entry; before writing user-facing copy, read sections 5 and 12. Cite the section in comments where a decision traces back to one, so the next person can tell a requirement from a preference.
2. **All colour, type, spacing and radius come from `/tokens`.** Role variables only, never a primitive, never a raw hex or px font size. See `.agents/docs/DESIGN_SYSTEM.md`.
3. **UI quality is part of the requirement, not a follow-up.** PRD section 10 makes responsive layout, accessible contrast and keyboard navigation non-functional requirements, and section 5 asks for enough visual calm to counter the "overwhelmed by coursework" finding. A screen that works but reads as cluttered has not met the spec.

## Conventions

- API routes live under `/app/api`, one subfolder per feature, matching the four PRD features
- Response JSON is camelCase, never raw database rows: serialise through a DTO at the route boundary
- AI prompt logic stays inside `/lib/ai`, never inline in route handlers or components
- The AI provider sits behind an adapter, nothing outside `/lib/ai` imports a provider SDK
- Prompt templates are string constants in `/lib/ai/prompts`, not inline template literals
- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`
- Never log full student questions or AI responses in production, per `.agents/rules/SECURITY.md`
- UI consumes color roles (`--color-*`) only, never primitives (`--_p-*`), per `.agents/docs/DESIGN_SYSTEM.md`

## Open Items

Unresolved decisions. Referenced by name from TODOs in code, e.g. `// TODO: AI_PROVIDER not yet decided, see AGENTS.md`. Resolve one here first, in the docs, before letting an implementation make it a de facto decision.

- **AI provider** — undecided. Everything routes through the adapter in `/lib/ai` so this is a config change later, not a rewrite. Blocks `AI_PROVIDER` in `.agents/docs/INSTALLATION.md`.
- **Styling library** — Tailwind CSS is the working default, not confirmed. Whatever wins consumes `tokens.css`, the tokens are not Tailwind-specific.
- **Test framework** — Vitest is the working default, not confirmed. Blocks the `npm run test` script, see `.agents/rules/TESTING.md`.
- **Progress Tracking flow diagram** — missing, PRD section 12. The `progress` and `recommendations` tables and the `/api/progress` contract are built from written requirements and the journey map, not a diagrammed flow. Expect both to change.
- **Authentication** — not specified in the PRD. The `students` table has no auth fields. Must be resolved before storing real student data.
- **Confidence level colors** — the three levels have no color roles, and the palette has no success/warning/danger colors at all. Blocks `ConfidenceBadge` and `ReasoningPanel`, the two highest-value components. See `.agents/docs/DESIGN_SYSTEM.md`.
- **How confidence is calculated** — PRD section 12, question 4. Model certainty, source availability, or both. The three *values* are already frozen into the schema, the API, and `ConfidenceBadge`, but nothing decides how a given answer gets one. A harder blocker than the missing colors, since it determines whether the badge means anything.
- **Security contact** — `.agents/rules/SECURITY.md` tells finders not to open a public issue but gives them nowhere else to go. Resolve before the repo is visible outside the team.
- **Metrics baseline** — PRD section 12, question 2. No targets can be set on the section 3 success metrics without usage data, and `.agents/docs/product/ROADMAP.md` gates Phase 2 scope on it.
- **Lecture notes upload** — PRD section 12, question 3. In v1 or a fast-follow. Currently parked in Phase 2 with a note that it may pull forward.
- **Streak definition** — what counts as studying and what breaks a streak. `.agents/docs/API.md` assumes any of three triggers extends it once per calendar day, with a reset after a gap. Assumption, not a decision.
- **"Save questions" in the quiz flow** — PRD 7.3 lists it as a step, `.agents/docs/API.md` reads it as saving answers in progress. The alternative reading, bookmarking questions for later review, needs its own table. Confirm against the flow diagram.
- **Source citations on answers** — the approved design shows named sources under each answer, which prompt section 9 does not define. Until it does, show only what the provider returns and omit the block otherwise. Fabricated citations are the worst failure available to a product built on verifiability.
- **Answer feedback** — thumbs up/down and bookmark are in the design. No table, no decision on what is stored or whether it feeds recommendations. The buttons currently route to the thread rather than writing nothing.
- **"Explain this answer"** — a deeper second pass over an answer already given. New interaction mode, or a follow-up with a fixed prompt?
- **Notifications** — the topbar shows an unread count. Nothing defines what generates one, so it currently renders zero rather than a placeholder number.
- **Pro tier** — the sidebar offers an upgrade. No pricing, entitlement, or gated feature defined.
- **Practice has no sidebar entry** in the approved design, though flow 3 needs one. Reached from the Home composer and recommendations. See `.agents/docs/NAVIGATION.md`.
- **Per-session completion** — Home's weekly goal ring approximates "done" as sessions scheduled before today, because `plan_sessions` has no completion flag. Add one before this number is shown to a real student.
- **Confidence value wording** — prompt section 9 says `one valid interpretation`; `.agents/docs/DATA_MODEL.md`, `.agents/docs/COMPONENTS.md`, and `.agents/docs/DESIGN_SYSTEM.md` all say `one interpretation`. This is a stored enum value and a rendered badge label, so the two spellings cannot both be right. One-word decision, blocks `ConfidenceBadge`.
- **Assistant response shapes** — the prompt requires four outcomes (answer, clarifying question, wellbeing escalation, refusal to do the work wholesale) and `.agents/docs/API.md` models only the first. Determines the API contract and, because prompt section 12 forbids retaining escalation content, determines whether a row is written at all. Blocks all of Phase 2. See `.agents/docs/IMPLEMENTATION_PLAN.md`.
- **Spacing, radius, and shadow tokens** — never exported from Figma. Every component in Phase 1.5 needs them.
- **Pressed and disabled colour roles** — hover and focus exist, these don't. Add to `stateRoles` in `tokens/build-tokens.js`, don't darken a role at the call site.

## AI Behavior Spec

`.agents/studywise-ai-prompt.md` is authoritative, supplied 10 August 2026. It replaced a reconstruction that stood in while the file was missing. Sections 9 (explainability format), 10 (interaction modes), and 12 (privacy) are cited by number from five documents and must not be renumbered.

## Known Issues

Both of these violate PRD section 10, which lists accessible color contrast as a non-functional requirement. They are requirement failures, not polish.

- `--color-text-muted` fails WCAG AA against `--color-background` (4.42:1). Documented with a fix value in `.agents/docs/DESIGN_SYSTEM.md`, needs correcting in Figma.
- `--color-border` is 1.22:1 against a card, below the 3:1 needed where a border is the only thing identifying a control, which is the case for text inputs.

## Scripts

`node tokens/build-tokens.js` regenerates `tokens/tokens.css` from the Figma exports. It resolves paths relative to itself, so it runs from any directory. Every other script in `.agents/docs/INSTALLATION.md` is aspirational until the Next.js scaffold is initialized.
