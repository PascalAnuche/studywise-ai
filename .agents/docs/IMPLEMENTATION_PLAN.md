# Implementation Plan

Build sequence for StudyWise AI v1. Nothing here has been built yet.

## How to use this

Before any task, read in this order:
1. `../../AGENTS.md` — conventions, open items, known issues
2. `../studywise-ai-prompt.md` — AI behavior, authoritative
3. `../rules/` — normative, they constrain how you write code
4. The feature's PRD section and its rows in `API.md` and `DATA_MODEL.md`

Two rules that apply to every phase:

- **Design system.** All colour and type comes from `../../tokens/tokens.css`. Consume role variables (`--color-*`, `--text-*`) only. Never reference a primitive (`--_p-*`), never hardcode a hex or a px font size. See Design System Usage below.
- **Don't resolve an open item by implementing it.** If you hit one of the decisions in `../../AGENTS.md`, stop and raise it. An implementation detail becoming a de facto decision is the specific failure `../rules/CONTRIBUTING.md` warns about.

---

## Phase 0 — Decisions that block the build

None of these are code. Each one blocks the phase named.

| Decision | Blocks | Notes |
| --- | --- | --- |
| AI provider | Phase 1.4 onward for real responses | Phases 1–6 can be built entirely against the mock adapter; only integration is blocked |
| Test framework | Phase 1.1 | Vitest is the working default per `../rules/TESTING.md` |
| Styling approach | Phase 1.2 | Tailwind is the working default; tokens are not Tailwind-specific and work with either |
| Auth | Phase 7, and any real data | Phases 1–6 run against a seeded student id |
| Confidence value wording | Phase 1.5, `ConfidenceBadge` | Prompt §9 says `one valid interpretation`, three docs say `one interpretation`. One-word decision, but it is a stored enum |
| Confidence colours | Phase 1.5, `ConfidenceBadge` | Palette has no success/warning/danger roles at all |
| `--color-text-muted` contrast | Phase 1.2 | Fails WCAG AA at 4.42:1 on `--color-background`, violates PRD §10. Fix in Figma, regenerate |
| Spacing and radius tokens | Phase 1.2 | Not exported yet. Every component needs them |
| Response shapes (below) | Phase 1.4, all of Phase 2 | The largest gap; see next section |
| Streak definition | Phase 5 | `API.md` states an assumption, unconfirmed |
| "Save questions" meaning | Phase 4 | `API.md` states an assumption, unconfirmed |
| Progress Tracking flow diagram | Phase 5 | PRD §12; the whole phase is built from written requirements only |

### The response-shape gap

`API.md` models exactly one assistant response: `{ explanationId, answer, reasoning, confidence }`. The prompt requires four distinct outcomes, and three of them don't fit that shape:

| Prompt | Outcome | Problem |
| --- | --- | --- |
| §9 | Normal answer | Fits today's contract |
| §7 | Clarifying question, asked *instead of* answering an ambiguous question | No `answer`, no `confidence`. Does it create an `explanations` row? |
| §13 | Wellbeing escalation | Not study content. §12 says never use this to make assumptions about the student, so it must **not** be persisted as an explanation |
| §5 | Refusal to do the work wholesale | Has an answer-ish shape but no factual `confidence` |

This needs resolving before Phase 2, because it determines the API contract, the discriminated union the client renders, and — critically — whether a row is written. Recommendation: make the response a tagged union on `kind: 'answer' | 'clarify' | 'escalation' | 'redirect'`, and persist only `kind: 'answer'`. Raise it rather than assuming.

---

## Phase 1 — Foundation

### 1.1 Scaffold
Next.js App Router, TypeScript strict, ESLint `next/core-web-vitals`, Prettier defaults, the chosen test runner. Folder structure exactly as `../../README.md` Project Structure. Fill in the npm scripts that `INSTALLATION.md` already documents but that don't exist yet: `dev`, `build`, `typecheck`, `lint`, `test`, `db:migrate`.

**Done when** a clean clone runs `npm install`, `npm run typecheck`, `npm run lint`, `npm run test` green, and `npm run dev` serves an empty dashboard.

### 1.2 Design system integration
Import `tokens/tokens.css` once at the root layout. Add the missing primitives of a UI kit — spacing scale, radius, shadow, z-index — as a second token layer, ideally exported from Figma rather than invented. If Tailwind is chosen, map its theme onto the CSS variables rather than duplicating values.

Add a base layer: `body` uses `--text-body` and `--color-text` on `--color-background`; a global `:focus-visible` rule using `--color-focus-ring` with 2px offset.

**Done when** no component needs a raw hex or px font size, and a token change in Figma propagates through `node tokens/build-tokens.js` with no hand edits.

### 1.3 Database
Implement `/lib/db` from `DATA_MODEL.md`: 8 tables, the FK relationships, `UNIQUE (student_id, topic)` on `progress`. Nullable `understood` on `explanations` and `study_plans` — this is load-bearing, see the note in `DATA_MODEL.md`. Migration runner plus a seed with one student and enough history to exercise every screen.

**Done when** migrate and seed run from clean, and typed query helpers exist for each table.

### 1.4 AI adapter
The single most important boundary in the codebase. Nothing outside `/lib/ai` imports a provider SDK.

- Mode routing keyed on the calling route, never inferred from content (prompt §10, `ARCHITECTURE.md`)
- Prompt templates as string constants in `/lib/ai/prompts`, per `../rules/CODE_STYLE.md`
- Context assembly per prompt §8: absent variables are unknown, never defaulted, never fabricated
- Response parsing into whatever union Phase 0 settles on
- **A mock provider is a first-class deliverable**, not a stub. It unblocks Phases 2–6 entirely and is what integration tests run against per `../rules/TESTING.md`

**Done when** all four modes route correctly, the mock returns each response shape on demand, and no provider SDK is imported anywhere outside `/lib/ai`.

### 1.5 Shared components
`/components`: `Button`, `Input`, `Select`, `Modal`, `Card`, `LoadingSpinner`, `Toast`, `ConfidenceBadge`.

Every one needs default, hover, focus, disabled, and loading states. Hover and focus roles exist in the tokens; **pressed and disabled do not** — add them to `stateRoles` in `tokens/build-tokens.js` and regenerate, don't darken a role inline.

`ConfidenceBadge` is blocked on two Phase 0 decisions and should be built last in this phase.

**Done when** every component renders from tokens only, is keyboard operable, and shows a visible focus ring.

---

## Phase 2 — AI Study Assistant (PRD 7.1)

The highest-value feature. `ConfidenceBadge` and `ReasoningPanel` are the visual expression of the whole product thesis, per `COMPONENTS.md`.

Routes: `/api/assistant/ask`, `/follow-up`, `/checkpoint`, `/history`.
Components: `ChatInput`, `MessageBubble`, `ReasoningPanel`, `UnderstandingCheckpoint`, `FollowUpPrompt`.

Behaviour to get right:
- Answer renders first; reasoning is a collapsible "why", not always-open — prompt §9 calls out the collapsible pattern specifically
- The understanding checkpoint is the **UI's** job. It writes via `/checkpoint`, which resolves `understood` and extends the streak
- On "no", the follow-up must change approach rather than restating (PRD 7.1: the AI explains why and how)
- Follow-ups carry prior context, never restart
- `FollowUpPrompt` implements prompt §4's offer — "want me to quiz you on this", "should I add this to your plan". These are cross-feature entry points into Phases 3 and 4, so leave the seams even though those phases don't exist yet
- Abandoned questions leave `understood` null. Never coerce to 0

**Done when** a student can ask, see answer/why/confidence, answer the checkpoint, follow up with context retained, and retrieve history.

---

## Phase 3 — Study Planner (PRD 7.2)

Routes: `/api/planner/generate`, `PUT /:planId`, `/:planId/confirm`, `GET /`.
Components: `PlanForm`, `PlanPreview`, `EditPlanModal`, `ScheduleView`.

- Structured inputs only — subject, goals, topics, frequency. Never free text alone
- Plans are editable before *and* after saving
- `/confirm` carries `understood`, the Planner's checkpoint, mirroring the Assistant
- On "not understood" the plan stays `draft` and the student edits and re-reviews

**Done when** a plan can be generated, edited, confirmed, and appears on the schedule view, and remains editable afterwards.

---

## Phase 4 — AI-Generated Quiz (PRD 7.3)

Routes: `/api/practice/generate`, `PUT /:quizId/answers`, `POST /:quizId/submit`, `GET /:quizId/recommendations`.
Components: `DifficultySelector`, `QuizQuestion`, `QuizProgress`, `ResultsSummary`, `RecommendationCard`.

- Difficulty is selected **before** generation and is an input, not a hint
- Incorrect answers link back to a related `explanationId` where possible — this is the loop that ties Practice to the Assistant, and it's a core PRD requirement not a nice-to-have
- Recommendations name the specific topic missed and carry a `reason`, per the explainability principle
- Submit updates progress and the streak

**Done when** the full flow runs end to end and recommendations trace to actually-missed topics.

---

## Phase 5 — Progress Tracking (PRD 7.4)

Weakest-specified feature — no flow diagram exists. Expect rework.

Routes: `GET /api/progress`, `POST /api/progress/topic`, `GET /api/progress/recommendations`.
Components: `ProgressDashboard`, `StreakIndicator`, `WeakAreaList`, `TopicCompletionList`.

- Weak areas surface individually, never folded into one score
- `streak` is the single value on `students`, not an aggregate over topics
- Prompt §12 governs every string on this screen: describe performance, never the person. "Quiz scores on recursion are low", never "you struggle with recursion". This is a copy review, not just a code review
- `DESIGN_SYSTEM.md` calls for visual calm here specifically — the empathy map's "overwhelmed" finding names the Progress view

**Done when** the dashboard reflects real activity from Phases 2–4 and the streak increments once per active day.

---

## Phase 6 — Dashboard and cross-feature wiring

The `/(dashboard)` home, plus the connections that make this one product rather than four:

- Prompt §4: answers reference the student's plan and progress where relevant
- Prompt §8: the adapter receives real context now that all four features write data
- Follow-up prompts from Phase 2 route into Planner and Quiz
- Quiz recommendations route into the Planner

**Done when** the four features share context rather than operating in isolation.

---

## Phase 7 — Hardening

- **Accessibility**: PRD §10 is a stated requirement. Contrast across every state, keyboard paths through all four flows, focus never lost or trapped
- **Security** per `../rules/SECURITY.md`: scope every query by `student_id`, keys server-side only, minimum context to the provider
- **Rate limiting** on AI endpoints before any public deploy — cost and abuse, flagged in `DEPLOYMENT.md`
- **Auth**, once decided. The `students` table has no auth fields today
- **Prompt §12 audit**: grep every user-facing string for ability-based language
- **Tests** to the priority order in `../rules/TESTING.md`: checkpoints, quiz scoring, recommendation logic, progress calculation
- **Deployment**: SQLite needs persistent disk, so serverless-by-default hosts need checking first

---

## Design System Usage

| Need | Use | Never |
| --- | --- | --- |
| Brand, primary actions | `--color-primary`, `--color-primary-hover` | a hex |
| Page background | `--color-background` | `#fff` |
| Cards, raised surfaces | `--color-card`, `--color-surface-hover` | |
| Body text | `--color-text` | |
| Secondary text | `--color-text-muted` | see contrast warning below |
| Dividers, input borders | `--color-border`, `--color-border-hover`, `--color-border-focus` | |
| Focus ring | `--color-focus-ring` at 2px with 2px offset, `--color-focus-halo` for inset glow | removing the outline |
| Headings | `--text-h1` … `--text-h4` | `font-size: 24px` |
| Body copy | `--text-body`, `--text-body-large`, `--text-body-medium` | |
| Buttons | `--text-button` | |
| Captions | `--text-caption` | |

Whole styles apply as a shorthand: `font: var(--text-h1)`. Individual properties are available as `--text-h1-size`, `-weight`, `-line-height`, `-family`, `-letter-spacing`.

**Never reference `--_p-*`.** Those are palette internals; naming one in a component means a palette change stops propagating, which defeats the point of the tier split.

**Contrast warnings, both live today:**
- `--color-text-muted` fails AA on `--color-background` (4.42:1). Until it's fixed in Figma, don't put muted text on a tinted surface
- `--color-border` is 1.22:1 against a card, below the 3:1 that applies where a border is the only thing identifying a control. Text inputs need a darker border role

Regenerate with `node tokens/build-tokens.js` after any Figma re-export. Never hand-edit `tokens/tokens.css`.

---

## Prompt to code

Where each section of `../studywise-ai-prompt.md` is enforced:

| § | Enforced in |
| --- | --- |
| 1–3, 6 | `/lib/ai/prompts` constants |
| 4 | Response formatting, plus `FollowUpPrompt` and Phase 6 wiring |
| 5 | Prompt constants; the wholesale-work refusal is a response shape |
| 7 | Response union — clarify and redirect shapes |
| 8 | Adapter context assembly; absent means unknown |
| 9 | `explanations` columns, `/api/assistant/*` response, `ConfidenceBadge`, `ReasoningPanel` |
| 10 | Mode routing by API route in `/lib/ai` |
| 11 | Prompt constants, keyed on `students.discipline` |
| 12 | Query scoping, Progress copy review, escalation responses never persisted |
| 13 | Escalation response shape and its UI treatment |

Sections 7, 12, and 13 are the ones most likely to be lost in implementation, because none of them is a happy path.
