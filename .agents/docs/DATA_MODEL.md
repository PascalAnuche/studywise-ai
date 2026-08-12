# Data Model

Full schema behind the sketch in `../../AGENTS.md`, built to support all four v1 features in `../../studywise-ai-prd.md` (sections 7 and 9). SQLite, so types below map to SQLite storage classes (`INTEGER`, `TEXT`, `REAL`), booleans stored as `INTEGER` 0/1.

## students
| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| name | TEXT | |
| email | TEXT | unique |
| discipline | TEXT | e.g. Computer Science, Medicine |
| streak_count | INTEGER | consecutive study days, per student not per topic |
| last_active_on | TEXT | ISO date, the day the streak was last extended |
| created_at | TEXT | ISO timestamp |

The streak lives here, not on `progress`. PRD 7.4 and `API.md` both treat it as one number per student, and a per-topic streak would give as many candidate values as the student has topics with no rule for picking one. `last_active_on` is a date, not a timestamp, because the streak counts days.

## study_plans
| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| student_id | INTEGER FK → students.id | |
| subject | TEXT | |
| goals | TEXT | free text or JSON array |
| topics | TEXT | JSON array |
| frequency | TEXT | e.g. "3x/week" |
| start_date | TEXT | |
| end_date | TEXT | |
| status | TEXT | draft \| active \| completed |
| understood | INTEGER | 0/1, nullable, from the Planner's "does this plan fit" checkpoint |
| created_at | TEXT | |
| updated_at | TEXT | |

PRD 7.2 gives the Planner the same understanding checkpoint as the Assistant, and `../rules/TESTING.md` makes checkpoint branching its top test priority across *both* flows. Without this column the Planner's checkpoint answer is unrecorded and that test target doesn't exist. Same nullability reasoning as `explanations.understood`.

## plan_sessions
The generated plan body. `study_plans` holds what the student asked for; this holds what the assistant produced from it.

Separate rows rather than JSON on `study_plans` because PRD 7.2 requires each item be individually editable before and after saving, and the schedule view queries by date. This table did not exist in the original model, which left the generated plan with nowhere to live.

| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| plan_id | INTEGER FK → study_plans.id | cascades on delete |
| order_index | INTEGER | sequence, by topic dependency not alphabetically |
| topic | TEXT | always one of the topics the student listed, never invented |
| focus | TEXT | what to actually do in the session |
| duration_minutes | INTEGER | longer for weak areas |
| scheduled_for | TEXT | ISO date, nullable when the plan has no start date |
| start_time | TEXT | local "HH:MM", nullable. The Home design shows today's plan as time ranges, which a date plus a duration cannot express |
| created_at | TEXT | |
| updated_at | TEXT | |

## explanations
Saved Q&A from the AI Study Assistant (PRD 7.1). Each row is one saved explanation, following the answer/because/confidence format from `../studywise-ai-prompt.md` section 9.

| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| student_id | INTEGER FK → students.id | |
| subject | TEXT | nullable |
| question | TEXT | |
| answer | TEXT | |
| reasoning | TEXT | the "because" line |
| confidence | TEXT | well-established \| one interpretation \| worth verifying |
| understood | INTEGER | 0/1, **nullable**, null until the checkpoint is answered |
| created_at | TEXT | |

`understood` must be nullable, not default 0. The row is created by `/api/assistant/ask` before the student ever sees the checkpoint, so a student who abandons the question leaves a row behind. Defaulting to 0 would make abandonment indistinguishable from "I don't understand" and would corrupt the comprehension metric in PRD section 3. Filter on `understood IS NOT NULL` when measuring.

## follow_up_questions
Follow-ups on a saved explanation, keeps prior context linked rather than starting fresh (PRD 7.1 requirement).

| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| explanation_id | INTEGER FK → explanations.id | |
| question | TEXT | |
| answer | TEXT | |
| reasoning | TEXT | |
| confidence | TEXT | |
| created_at | TEXT | |

## quizzes
| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| student_id | INTEGER FK → students.id | |
| subject | TEXT | |
| topic | TEXT | |
| difficulty | TEXT | selected before generation, per PRD 7.3 |
| score | REAL | nullable until submitted |
| completed_at | TEXT | nullable until submitted |
| created_at | TEXT | |

## quiz_questions
| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| quiz_id | INTEGER FK → quizzes.id | |
| question_text | TEXT | |
| options | TEXT | JSON array, nullable for non-multiple-choice |
| correct_answer | TEXT | |
| reasoning | TEXT | the because line, why the correct answer is correct |
| student_answer | TEXT | nullable, written by draft save as well as submit |
| is_correct | INTEGER | 0/1, nullable until submitted |
| explanation_id | INTEGER FK → explanations.id | nullable, set on an incorrect answer that traces back to a saved explanation (PRD 7.3) |
| created_at | TEXT | |

`reasoning` is stored at generation time, not regenerated at review time: prompt section 10 requires marking to explain why an answer was wrong, and regenerating it later risks telling the student a different story than the one the question was written against.

## progress
One row per student per topic, this is what powers the dashboard in PRD 7.4.

| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| student_id | INTEGER FK → students.id | |
| topic | TEXT | |
| status | TEXT | not_started \| in_progress \| completed |
| last_studied_at | TEXT | this topic specifically, distinct from `students.last_active_on` |
| is_weak_area | INTEGER | 0/1, drives targeted feedback |
| created_at | TEXT | |
| updated_at | TEXT | |

`UNIQUE (student_id, topic)`, this is what makes "one row per student per topic" a guarantee rather than a convention.

### What writes to this table
Nothing in the UI edits `progress` directly except a topic status change. Everything else is a side effect, see `API.md` under Progress:
- `POST /api/practice/:quizId/submit` sets `is_weak_area` and `last_studied_at` for the topics covered, and extends the streak on `students`
- `POST /api/assistant/checkpoint` sets `last_studied_at` for the explanation's subject and extends the streak
- `POST /api/progress/topic` is the only direct write, the student marking a topic started or completed

## recommendations
Personalized post-quiz and post-progress-review recommendations (PRD 7.3, 7.4).

| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| student_id | INTEGER FK → students.id | |
| based_on_quiz_id | INTEGER FK → quizzes.id | nullable, null when generated from general progress review rather than a specific quiz |
| topic | TEXT | |
| reason | TEXT | why this was recommended, keeps recommendations explainable too, consistent with the product's core trust principle |
| created_at | TEXT | |

## Relationships
- One student has many study_plans, explanations, quizzes, progress rows, and recommendations
- One explanation has many follow_up_questions
- One quiz has many quiz_questions
- A recommendation optionally traces back to the quiz that generated it, for auditability

## Open Item
Progress Tracking has no dedicated flow diagram yet (PRD section 12), the `progress` and `recommendations` tables above are built from the PRD's written requirements and the journey map, not a diagrammed flow, revisit once that flow exists.
