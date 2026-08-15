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

### Hosted database, and a deployable build

- **Migrated the data layer from `node:sqlite` to libSQL.** One `DATABASE_URL` now selects a local file or a hosted Turso database behind the same API, so writes survive on a serverless host instead of dying with the instance. The SQL is unchanged — libSQL is SQLite
- **Every function in `lib/db` is now async**, and every caller awaits. That is the cost of the change: libSQL is a network client even against a file
- **Independent reads are issued together.** `buildStudentContext` (4 queries) and `buildDashboard` (6) use `Promise.all` rather than sequential awaits, which against a hosted database is the difference between one round-trip and six — both sit on a critical path
- **Multi-statement writes are transactional.** Replacing a plan's sessions, saving quiz answers, and marking a quiz complete go through `batch`, so a failure part-way cannot leave a plan with no sessions or a quiz scored against rows that were never updated
- **libSQL rows are normalised to plain objects.** Its rows carry columns as named properties *and* array indices, so serialising one straight to JSON leaks `"0"`, `"1"`, `"length"` into the response
- `migrate.mjs` and `seed.mjs` run against the same `DATABASE_URL`, so seeding a hosted database is a change of environment. `--fresh` refuses to touch a remote one

**Deployment fixes, from three failed builds:**

- `/_not-found` is prerendered, prerendering it renders the root layout, and the layout queries the database. With `dev.db` gitignored the build machine had none, so the whole build died on `SQLITE_CANTOPEN`. `prebuild` now creates and seeds it
- Both scripts resolved the path from `process.cwd()`, and a build host is not obliged to run npm scripts from the project root. From elsewhere that became `/dev.db`, unwritable, reported as the same opaque error. Resolved from the repo root now
- All 15 API routes are `force-dynamic`. Handlers without a dynamic marker are candidates for build-time evaluation, which would run them against seed data and cache the result
- `lib/db/client.test.ts` covers `openPath`, whose read-only branch never runs on a developer machine and cannot be simulated on Windows — which is exactly how the original failure reached a deploy
- `.gitignore` missed `*.db-shm`, so a SQLite sidecar had been committed

### Responsiveness, custom form controls, and three more screens

**Responsiveness across all breakpoints.** `scripts/responsive-audit.mjs` loads every route at 375, 414, 768, 1024 and 1440 and reports which element causes a sideways scroll, plus any tap target under the 24px WCAG 2.2 minimum. It went from 30-odd findings to none.

- **Study Planner's schedule** was the worst of it: a 6.5rem time column, a marker rail and a card across a phone left the title about 90px, so headings were clipped and the page scrolled sideways. Narrow layouts now put the time above its card and drop the marker rail
- **The topbar** reserved trailing space for a ⌘K hint it was too narrow to show, and a flex spacer competed with the search for the same free space and halved it — about two characters' worth on a phone
- **`ActionLink`**, so the "View all →" link in every card header is at least 24px tall. As loose CSS in each page module every one of them was drawn at its text height
- Two subtle overflow causes worth knowing about, both now commented where they bit: a `grid-auto-flow: column` scroll row resolves `1fr` against the *scrollable* area and sizes itself to its content; and a `visually-hidden` element inside a horizontally scrolling box escapes the clip unless that box is positioned, which is what put a scrollbar across the whole document on Resources
- The remaining audit finding is a link inside a sentence on `/profile`, which the target-size rule explicitly exempts

**Custom form controls, replacing the native ones app-wide.**

- **`Select`** — the native control's arrow sits hard against the border with no way to inset it, and its popup is drawn by the operating system, so it ignored the design system entirely. The replacement implements the ARIA combobox/listbox pattern: arrow keys, Home/End, Enter, Escape, type-to-select, and `aria-activedescendant`
- **`DatePicker`** — same reasoning for `<input type="date">`. Month and year are **chosen from dropdowns** rather than walked to with arrows, since August to next June is ten clicks otherwise. Dates are handled as `YYYY-MM-DD` strings in local time throughout, never parsed as `new Date('2026-08-12')`, which is UTC midnight and therefore the previous day for anyone west of Greenwich
- Both flip above the trigger when the space below runs out, measured against the nearest **scrolling ancestor** rather than the viewport — inside a modal the panel has its own bottom edge
- **`Input` gained an `action` slot**, so a trailing button is a sibling of the input. Laying out `[field, button]` and aligning to the end put the button level with the *hint*, which is what made the Add button sit low

### Resources, Flashcards and Notes built to the design

All three replace placeholder routes, and all three are narrow-first at every breakpoint.

- **Resources** (flow 4): type filters, a scroll-snapping featured row, browse-by-subject, a recent-resources table, and a rail of quick access, recently viewed and recommendations
- **Flashcards** (flow 5): set grid with favourites and per-set progress, a spaced-repetition panel with an inline SVG schedule chart, and a rail of today's figures, a study streak week, activity and a tip
- **Notes** (flow 5): a list-and-detail workspace that becomes **one pane at a time below 64rem** with a back control, rather than a shrunken desktop layout. Note bodies are structured blocks, not markdown strings, so the detail pane renders headings and lists without parsing anything
- **`tokens/chart.tokens.json` now also drives `IconTile`**, the tinted icon square used around thirty times across the three screens. The tint is mixed from the series colour with `color-mix` rather than stored as a second token per hue
- Shared `TabStrip`, `SearchField` and `ViewToggle` in `app/components/Toolbar.tsx`, so the three screens' header furniture is one implementation
- Every figure comes from `lib/mock`. The counts are the design's own numbers, not a count of the fixtures — deriving "245 resources" from six rows would be a lie dressed as arithmetic

### Learning Progress built to the design

- **`/progress` (flow 6) rebuilt to the approved design**: five headline figures in one row, a weekday bar chart, a Time by Subject donut, a Subject Performance table, and a rail of streak, strengths, areas to improve and one AI recommendation. Both charts are inline SVG — seven bars and a ring do not justify a chart dependency, and drawing them by hand keeps every colour a token reference
- **`tokens/chart.tokens.json`**, a data-series palette. `color.event.*` was being reused for chart fills and is tuned for text on a tinted chip, so slices came out muddy and two subjects shared a colour. PROVISIONAL, sampled from the design; logged in `../../../AGENTS.md`
- Both charts stay readable without colour: the donut legend names every slice with its time and share, and the bar chart carries a visually-hidden table of the same figures
- The design's *"Quiz Master — you score higher than 80% of users"* is a comparison against other students, which prompt section 12 rules out. Card, title and placement are unchanged; the line now states her own record. Flagged in `../../../AGENTS.md`

**Fixed while building this:**

- Progress bars in the Subject Performance table rendered as empty tracks. `.track` and `.bar` were inline `<span>`s, and `width` has no effect on an inline box
- The bar chart was letterboxed: a `640x220` viewBox with a fixed `height="220"` scaled to fit the narrower card and left a band of dead space under the bars. The viewBox now carries the aspect ratio alone
- Computer Networks was inflating the donut, which made it disagree with the Study Time figure beside it. `inWeeklyTotal` separates what counts toward the week from what the table lists

### Mock data, and three screens built to the design

- **`scripts/seed.mjs` rewritten**: one student with a term of coherent study. The topics on the plan are the topics quizzed, the weak areas are the ones actually missed, and the recommendations name those same topics. Figures land on the design's numbers (72% goal, 14h 30m, 8 topics, 56 questions) from real arithmetic, not hardcoded display values. Dates are relative to the run, so **re-run `npm run db:seed` after the date rolls over** or "today's plan" drifts
- **`lib/mock/`** for the four flows with no backend: Resources, Notes, Flashcards, Achievements, Settings preferences, and source citations. Everything is in that one module, the shapes match what real queries should return, and every screen using it says so via `MockNotice`
- **`plan_sessions.start_time`** added: the design shows today's plan as time ranges, which a date plus a duration cannot express
- **`scripts/migrate.mjs` is now additive**: `CREATE TABLE IF NOT EXISTS` never adds a column to an existing table, and dropping the file is impossible while anything holds it open. New columns are applied by `ALTER TABLE` from a list in the script
- **AI Assistant screen** (flow 1) rebuilt to the design: chat list, conversation, and a "why" rail with reasoning, confidence and sources. `AnswerBody` renders markdown tables, so a comparison comes back as a real table
- **Study Planner screen** (flow 2) rebuilt to the design: a week calendar with sessions placed by start time, a session detail panel, and the plan form behind a **Create Study Plan** button rather than always open
- Controls with no backing store — answer feedback, clear conversations, mark session complete, session notes — are shown disabled with a reason rather than silently discarding input

**Fixed while building these:**

- `relativeDay` and `formatTimeRange` were exported from `'use client'` modules and called during server rendering, which crashed the Assistant page into its loading skeleton. Both moved to `lib/format.ts`, which is neither client nor server-only
- `next build` and `next dev` both wrote to `.next`, so a verification build corrupted a running dev server's chunks. `distDir` now honours `NEXT_DIST_DIR`, and verification builds go to `.next-verify`
- Home's main column overflowed under the sticky assistant rail, cutting off content, because grid items default to `min-width: auto`

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
