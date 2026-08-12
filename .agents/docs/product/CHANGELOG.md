# Changelog

All notable changes to this project are documented here. Format follows Keep a Changelog, versions follow SemVer once releases begin.

## [Unreleased]
### Added
- Product requirements document (`../../../studywise-ai-prd.md`)
- AI assistant system prompt (`../../studywise-ai-prompt.md`), authoritative copy supplied 10 August 2026. It had been listed here as delivered for a period while no copy was committed; a reconstruction stood in and has been fully replaced.
- Implementation plan (`../IMPLEMENTATION_PLAN.md`)
- `../../../AGENTS.md` build instructions
- Data model and API reference (`../DATA_MODEL.md`, `../API.md`)
- Roadmap, contributing, security, installation, code style, architecture, testing, deployment, and component docs
- Design tokens exported from Figma, converted to CSS variables by `../../../tokens/build-tokens.js` into `../../../tokens/tokens.css`, including derived hover and focus roles
- Docs reorganized into `docs/`, `rules/`, and `.agents/`, leaving `../../../README.md` and `../../../AGENTS.md` at the root

### Approved design and flow set
Home rebuilt to the approved design, and every flow in the approved diagram given a destination. Frontend only; the backend is restructured against these flows next.

- Sidebar now carries the design's eight destinations plus Profile and Settings, the Pro upsell, and the theme toggle. **Active destinations use a filled icon**, alongside the tint and leading rail
- Topbar now carries global search with a working ⌘K shortcut, a notification bell, and the account chip
- Home: greeting, learn composer with four quick actions, Today's Plan, Learning Progress with a goal ring and sparkline, AI Recommendations carousel, and a persistent AI Study Assistant rail
- Six new routes so no flow is a dead end: `/resources`, `/flashcards`, `/notes`, `/achievements`, `/profile`, `/settings`. Each states its flow and planned steps rather than 404ing
- `../NAVIGATION.md` maps all eight flows to routes and records the cross-feature seams
- PRD gains sections 7.5 to 7.8 for Resources, Notes and Flashcards, Achievements, and Profile and Settings. Section 12 resolves the lecture-notes-upload question (in v1) and the Progress flow question (now diagrammed), and gains six new open questions the design raises
- **Corrected an over-strict copy rule.** `lib/copy.test.ts` banned "great job" and "keep it up", which came from the *reconstructed* prompt rather than the real one. Section 6 asks for a warm, encouraging tone; section 12 forbids only claims about ability and comparison to other students. The rule now matches the real spec, and a test asserts the design's own copy passes
- Real data only: the weekly sparkline is scheduled minutes per day from the plan, not a decorative shape, and the assistant rail omits the sources block rather than inventing citations

### Provisions for change
Groundwork so the next feature update and visual overhaul are changes, not rewrites. See `../EXTENDING.md`.

- **Themes.** `<name>.theme.tokens.json` restates the role layer against the same primitives. Emits an explicit `[data-theme]` block and a `prefers-color-scheme` block, explicit winning. Theme primitives are namespaced so both palettes stay readable; a colour shared by both is stored once. The build warns when a theme omits a role, because interaction states are derived from roles
- **A dark theme**, shipped as proof the mechanism works. **No component changed to support it** — the whole re-skin is token values plus one attribute
- **`ThemeToggle`**, which knows no colours; it sets `data-theme` and the tokens do the rest. A pre-paint script applies the stored choice so there is no flash of the wrong theme
- **`tokens/contrast.test.ts`** checks every theme against WCAG AA. Known failures are listed explicitly, and the test fails if a listed one is *fixed*, so the list cannot rot
- **`/preview` is now a full component catalogue**: every shared component in every state it must handle, including loading, disabled, empty, error, and all four AI response shapes. Rebuild against it during a redesign so forgotten states are visible before release
- **`lib/view-models/`** holds derived data, so product rules survive a page being rewritten. "What is next" is unit-tested without rendering
- **`server-only` is stubbed under Vitest**, so server modules can be tested directly rather than being split apart to make them reachable

### Built
Implementation plan Phases 1 to 5. All four v1 features from PRD section 7 now exist.

Phase 5, Progress Tracking (PRD 7.4):
- `GET /api/progress`, `POST /api/progress/topic`, `GET /api/progress/recommendations`
- `/progress` page with `StreakIndicator`, `WeakAreaList`, `TopicCompletionList`, `ProgressDashboard`
- Weak areas are returned and shown individually, each with the quiz evidence that flagged it. No single overall score exists anywhere in the payload or the page
- `streak` is the one value on `students`, never an aggregate over topics
- Marking a topic complete does not extend the streak, since ticking a box is not studying
- `GET /api/progress/recommendations` finally serves the `based_on_quiz_id IS NULL` case the data model always allowed and no route could produce
- `lib/copy.test.ts` enforces prompt section 12 across `app/` and `components/`: performance data must never characterise the student. It scans rendered copy with comments stripped, and self-tests that the detector still fires

Phases 1 to 4 as below.

Phase 4, AI-Generated Quiz (PRD 7.3):
- `POST /api/practice/generate`, `PUT /:quizId/answers`, `POST /:quizId/submit`, `GET /:quizId/recommendations`
- `/practice` page with `DifficultySelector`, `QuizQuestion`, `QuizProgress`, `ResultsSummary`, `RecommendationCard`
- New `quiz_questions.reasoning` column: prompt section 10 requires marking to explain why an answer was wrong, and there was nowhere to store the because line
- **The answer key never reaches the browser with the questions.** `toQuizDto` withholds `correctAnswer` and `reasoning` until `completed_at` is set, verified end to end
- Difficulty is chosen before generation and changes the questions, rather than labelling a quiz after the fact
- Incorrect answers link back to a saved explanation covering the topic, closing the loop between practising and understanding
- Submitting feeds progress, flags the weak area, extends the streak, and records a recommendation naming the topic and counting what was missed
- Resubmitting a completed quiz is refused

Phase 3, Study Planner (PRD 7.2):
- `POST /api/planner/generate`, `PUT /:planId`, `POST /:planId/confirm`, `GET /api/planner`
- `/planner` page with `PlanForm`, `PlanPreview`, `EditPlanModal`, `ScheduleView`
- New `plan_sessions` table: the generated plan body had nowhere to live, and PRD 7.2 needs each item individually editable
- Topics are entered as discrete chips and the plan covers exactly those, never inventing or dropping one
- `/confirm` now carries `understood`, so the Planner checkpoint is recorded like the Assistant's. "Not quite" keeps the plan a draft and opens the editor, and awards no streak day
- Section 13 escalation works in Plan mode too: a wellbeing signal in the goals returns support, not a schedule

Visual design pass, modern dashboard direction:
- `Icon`, an inline SVG set replacing the ASCII glyphs (`◆ ✦ ▤ ◇ ◐`) that were standing in for icons. Paths inherit `currentColor`, so they follow the token roles with no colour rules of their own
- `Hero`, the next action given real weight on a brand gradient, ahead of any statistics. PRD section 5's journey map opens at Discover, and a student arriving mid-session is asking "what now", not "how am I doing"
- `StatTile`, metrics with a meter as a second encoding. The number is always present as text, never the meter alone
- Sidebar: active destination marked with a rail on the leading edge, not colour alone
- Dashboard laid out as two balanced stacks rather than one tall column of full-width cards
- Playwright screenshots (`npm run shots`), so the UI can be looked at rather than inferred from CSS assertions. This immediately caught a default `fieldset` border and an unbalanced column that review had missed

UI, against PRD sections 3, 5 and 10:
- Dashboard shell: persistent `Sidebar`, `Topbar` above the content, scrolling content area. Without it each feature was an island, which worked against section 3's "rely less on separate apps" and the journey map's five-stage loop
- The sidebar is always on screen, collapsing to an icon rail below 60rem rather than hiding behind a menu, so all five destinations stay reachable at any width, per section 10's responsive requirement
- The topbar carries context and status only, never navigation
- Dashboard reordered to the journey map: next action first, then counters, then history
- Skip link, `aria-current` on the active destination
- The "why" affordance now carries the brand tint and a left rule, per `../DESIGN_SYSTEM.md` calling it the biggest lever for trust and warning against styling it like everything else
- Real pages for Practice and Progress rather than 404s from the nav

Phase 2, AI Study Assistant (PRD 7.1):
- `POST /api/assistant/ask`, `/follow-up`, `/checkpoint`, `GET /history`
- `/assistant` page with `ChatInput`, `MessageBubble`, `UnderstandingCheckpoint`, and the thread client
- Only an `answer` is persisted. Clarifying questions and wellbeing escalations write nothing, verified end to end: four asks, one row
- "Not quite" records the answer and asks for a different approach rather than restating, with the reasoning opened
- Streak extends once per calendar day across all three triggers, covered by tests

- Next.js App Router scaffold, TypeScript strict, ESLint, Prettier, Vitest
- SQLite via `node:sqlite`, no native build step. Schema, migrate, and seed scripts
- AI adapter in `/lib/ai` with mode routing by route, prompt constants, and a mock provider producing all four response shapes
- Shared components: `Button`, `Input`, `Select`, `Card`, `Modal`, `Toast`, `LoadingSpinner`, `ConfidenceBadge`
- `AIResponse`, the single renderer every feature uses for assistant output, with `ReasoningPanel` and `FollowUpPrompt`
- Spacing, radius, shadow, and layout tokens, plus pressed and disabled colour roles, all generated
- Provisional confidence colours, verified at 5.7:1 or better. Not from Figma, see `../../../AGENTS.md`

### Fixed
Contradictions found reading the docs end to end. Schema and contract changes are documentation-only, no code exists to migrate.

- Study streak moved from `progress` (one row per topic) to `students`, it was stored per topic but read as a single value by `../API.md` and PRD 7.4
- Added the missing write paths for `progress`, the table powering the dashboard was read-only across the whole API
- `POST /api/assistant/save` renamed to `/checkpoint`, `ask` already persisted the row so it never saved anything
- `explanations.understood` made explicitly nullable, defaulting to 0 would have counted abandoned questions as "did not understand" and corrupted the PRD section 3 comprehension metric
- Added `study_plans.understood` and the field to `/api/planner/:planId/confirm`, the Planner checkpoint in PRD 7.2 was recorded nowhere despite being a top test priority
- Added `GET /api/progress/recommendations`, the data model allowed non-quiz recommendations that no route could produce
- Added `PUT /api/practice/:quizId/answers` for the PRD 7.3 "save questions" step, which had no endpoint or schema
- Added `UNIQUE (student_id, topic)` on `progress`, and the missing `created_at` columns
- Corrected the claim that the AI behavior spec was delivered, in this file, `ROADMAP.md`, and the root README, then reconstructed the spec itself so the 11 documents citing it resolve
- Added `.env.example`, `../INSTALLATION.md` step 3 told you to copy a file that did not exist

No application code has shipped yet. This section moves to a versioned entry once v1 reaches a working build.
