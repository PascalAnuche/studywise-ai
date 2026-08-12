# Components

Component breakdown. The shared layer below is built; the four feature folders are not yet.

## Shared (`/components`) — built

- `Button` — variants `primary` / `secondary` / `accent` / `ghost`, sizes medium and small, with hover, active, focus-visible, disabled and loading states. Accent carries `--color-text`, never white: white on accent is 2.08:1 and fails AA
- `Input`, `Select` — label, hint and error wired through `aria-describedby` and `aria-invalid`
- `Card` — optional title and action slot, optional `interactive` for hover and pressed
- `Modal` — Escape to close, backdrop click, focus moved into the dialog
- `Toast` — tones `info` / `success` / `caution`, `role="alert"` only for caution
- `LoadingSpinner` — always paired with a screen-reader label
- `ConfidenceBadge` — renders the well-established / one interpretation / worth verifying signal from `../studywise-ai-prompt.md` section 9

### `AIResponse` — the one every feature shares

**Every feature renders assistant output through `AIResponse`. Nothing re-implements the answer / because / confidence shape, and nothing invents its own escalation styling.** Prompt section 9 exists to give the frontend a single predictable pattern; this component is that pattern.

It switches on the whole `AssistantResult` union, so adding a fifth response kind is a compile error here rather than a shape that silently renders as nothing:

| Kind | Prompt | Treatment |
| --- | --- | --- |
| `answer` | §9 | Answer first, then `ConfidenceBadge`, then collapsed `ReasoningPanel`, then an optional `FollowUpPrompt` |
| `clarify` | §7 | Visually distinct from an answer, no badge, no reasoning. A student must see at a glance that this is not a factual response |
| `escalation` | §13 | Wellbeing treatment, campus resources, and an explicit "this isn't saved to your study record". Never offers a route back into coursework |
| `redirect` | §5 | Declines the work in one sentence, offers the method instead |

Composed from `ReasoningPanel` (the collapsible "why", built on native `<details>` so it works without JavaScript and inherits keyboard behaviour) and `FollowUpPrompt` (§4's "want me to quiz you on this", rendered as a real link into Practice or Planner — these are the cross-feature seams).

`AIResponse` is server-renderable: no state, no effects. Live reference for all four states at `/preview`.

## Assistant (`/app/assistant/components`) — PRD 7.1, built
- `ChatInput` — Enter sends, Shift+Enter for a newline, since students paste multi-line problems
- `MessageBubble` — one exchange, delegating the response itself to shared `AIResponse`
- `UnderstandingCheckpoint` — the yes/no prompt. The interface owns this question, not the model: prompt section 10 tells the assistant not to ask it, because a "does that make sense?" buried in prose can't be measured. Unanswered stays null and is never counted as "no"
- `AssistantThread` — session state. A turn only carries an `explanationId` when something was persisted, so clarifications and escalations get no checkpoint and no follow-up thread

`ReasoningPanel` and `FollowUpPrompt` are shared rather than Assistant-specific, since every feature renders assistant output.

## Planner (`/app/planner/components`) — PRD 7.2, built
- `PlanForm` — subject, goals, topics, frequency. Topics are discrete chips, not a comma-separated string: the assistant is told never to invent a topic the student didn't list, so the list has to be unambiguous before it leaves the browser
- `PlanPreview` — the generated plan for review. Carries the same `ReasoningPanel` as an answer, so a student can see why the sequence is what it is before accepting. No confidence badge: a schedule is not a factual claim
- `EditPlanModal` — each session edited independently, which is why `plan_sessions` is a table rather than JSON on `study_plans`
- `ScheduleView` — grouped by date rather than by plan, because a student's week is one timeline. Unscheduled sessions stay visible instead of vanishing
- `PlannerClient` — generate, review, confirm, edit. An edit reopens the checkpoint rather than inheriting a stale "not quite"

## Home (`/app/components`) — built to the approved design
- `LearnComposer` — "What would you like to learn today?" with four quick actions. Submitting hands off to `/assistant` rather than answering inline, so one place owns the thread and the section 9 format. "Generate Quiz" is how a student reaches Practice, which the design's sidebar omits
- `TodaysPlan` — today's sessions from active plans. A real checkbox, not a styled div, since marking a session done is a genuine state change
- `LearningProgress` — goal ring, three figures, and an encouragement callout. The percentage is always text; the ring is a second encoding and is omitted entirely at zero, because a round line cap on a zero-length arc still paints a stray dot
- `RecommendationRail` — the carousel. Native overflow with scroll snap rather than a scripted carousel, so it works by touch, trackpad and keyboard. Every card carries its reason
- `AssistantRail` — **a reading surface, not a second Assistant.** Shows the latest saved explanation in the section 9 format and hands every interaction to `/assistant`. Renders source citations when the provider returns them and omits the block otherwise; it never invents one
- `FlowStub` — a destination that exists in navigation and the flow diagram but has no implementation yet. A real page rather than a 404, stating the flow and its planned steps

## Shell (`/components`)

This is a dashboard application: a persistent sidebar, a topbar above the content, and a scrolling content area. Without a shell each feature is an island, which works against PRD section 3's goal of fewer separate tools and the journey map's Discover → Learn → Practice → Track → Reflect loop, where every stage has to be one click from every other.

- `AppShell` — the frame. A grid, not an overlay, so the sidebar never covers content. No client state, because nothing opens or closes
- `Icon` — inline SVG, inheriting `currentColor`. Outline by default, with **solid variants for the active navigation destination**, drawn as closed shapes rather than filling the outlines, which would smear the open ones
- `Sidebar` — the only navigation. **Always on screen.** Below 60rem it collapses to an icon rail rather than hiding behind a menu, so all five destinations stay reachable at any width. Labels are visually hidden in rail mode rather than removed, so screen readers still announce them, and `title` gives sighted users a tooltip
- `Topbar` — context and status only, never navigation: duplicating destinations would give the same link two competing affordances. Shows the current section, its one-line description, and the streak as a plain number, since prompt section 12 forbids editorialising about a streak in either direction
- `navigation.ts` — the shared destination list, so sidebar and topbar can't disagree about what exists or which is current

## Practice (`/app/practice/components`) — PRD 7.3, built
- `DifficultySelector` — radio inputs, not buttons: a single choice from a fixed set, and the native control brings arrow-key navigation and grouping for free. Shown before generation, since difficulty is an input to it
- `QuizQuestion` — two states. Taking: options selectable, nothing revealed. Reviewing: the student's choice and the correct answer both marked with **text as well as colour**, so the marking survives greyscale and colour blindness. The because line opens by default on a wrong answer, and links back to a saved explanation where one exists
- `QuizProgress` — answered count, not elapsed time. Prompt section 12 rules out anything reading as a judgement, so there is no pacing pressure
- `ResultsSummary` — a count and a next step. No praise and no commiseration: section 12 forbids using performance to say anything about the student
- `RecommendationCard` — always shows its reason. A recommendation that can't say why it was made is the generic advice PRD 7.3 rules out. Its two actions are where Practice hands back into Learn and Plan
- `PracticeClient` — setup, taking, review. Correct answers arrive only with the submission response, so nothing here can reveal them early

## Progress (`/app/progress/components`) — PRD 7.4, built

The feature with no flow diagram (PRD section 12), built from the written requirements and the journey map's Track and Reflect stages. Expect rework once that flow exists.

Prompt section 12 governs every string here: describe the work, never the person. `lib/copy.test.ts` enforces the obvious phrasings so it can't quietly regress.

- `ProgressDashboard` — weak areas before the tally. The Track stage is about insight into weak areas, not a scoreboard, and `DESIGN_SYSTEM.md` names this view when it asks for visual calm. **There is no single overall score anywhere on the page**, by requirement
- `StreakIndicator` — a count and a date. No praise for a long run, no nudge when it is about to lapse
- `WeakAreaList` — each area individually, carrying the quiz evidence that flagged it ("3 of 5 questions were answered incorrectly on 2026-08-10"), never a verdict. Ends in two links out, so the page finishes with something to do
- `TopicCompletionList` — the only place a student writes to `progress` directly. Marking a topic deliberately does **not** extend the streak: ticking four boxes should not read as four days of study

## Note
`ConfidenceBadge` and `ReasoningPanel` are the two components doing the most product-critical work, they're the visual expression of the explainability requirement the whole research base points to. Get these right before polishing anything else.
