# API Reference

Route conventions for the four v1 features (`../../studywise-ai-prd.md` section 7). All routes live under `/app/api`, one subfolder per feature (`../../AGENTS.md`). Request/response shapes below are a starting contract, adjust once the AI provider (still undecided) shapes the actual response format.

## Assistant (`/api/assistant`) — PRD 7.1

**POST /api/assistant/ask**
Request: `{ studentId, question, subject? }`
Response: `{ explanationId, answer, reasoning, confidence }`
Routes through the AI adapter in Explain mode (`../studywise-ai-prompt.md` section 10).

**POST /api/assistant/follow-up**
Request: `{ explanationId, question }`
Response: `{ answer, reasoning, confidence }`
Retains the original question and answer as context, per the "no lost context" requirement in PRD 7.1.

**POST /api/assistant/checkpoint**
Request: `{ explanationId, understood: boolean }`
Response: `{ success: true }`
Fires from the "does the student understand" checkpoint. Named `checkpoint`, not `save`, because `ask` already persisted the row and returned its id, this call only resolves `understood`. Also extends the student's streak, see Progress below.

**GET /api/assistant/history?studentId=**
Response: `{ explanations: [...] }`, each with its follow-ups nested.

## Planner (`/api/planner`) — PRD 7.2

**POST /api/planner/generate**
Request: `{ studentId, subject, goals, topics, frequency }`
Response: `{ planId, plan }`
Structured inputs only, no free text alone, per PRD 7.2.

**PUT /api/planner/:planId**
Request: partial plan fields to edit
Response: `{ plan }`
Plans stay editable after generation and after saving.

**POST /api/planner/:planId/confirm**
Request: `{ understood: boolean }`
Response: `{ success: true }`
The Planner's equivalent of the Assistant checkpoint, PRD 7.2's "if understood, the plan is saved" branch. On `true` it marks status `active` and makes the plan visible on the schedule view. On `false` the plan stays `draft` and the student edits and re-reviews.

**GET /api/planner?studentId=**
Response: `{ plans: [...] }` for the schedule view.

## Practice / Quiz (`/api/practice`) — PRD 7.3

**POST /api/practice/generate**
Request: `{ studentId, subject, topic, difficulty }`
Response: `{ quizId, questions }`
Difficulty is selected before generation, not after, per the flow diagram.

**PUT /api/practice/:quizId/answers**
Request: `{ answers: [{ questionId, studentAnswer }] }`
Response: `{ saved: true }`
In-progress save, writes `student_answer` without scoring. This is the "save questions" step in the PRD 7.3 flow, read as saving work in progress between starting and submitting. **Assumption, confirm against the flow diagram** — the other reading is bookmarking a question for later review, which would need its own table.

**POST /api/practice/:quizId/submit**
Request: `{ answers: [{ questionId, studentAnswer }] }`
Response: `{ score, results, incorrectQuestions }`
Where possible, incorrect questions link back to a related `explanationId` from the Assistant, closing the loop per PRD 7.3. Also updates progress, see below.

**GET /api/practice/:quizId/recommendations**
Response: `{ recommendations: [...] }`
Based on the specific topics missed in this quiz, not generic advice.

## Progress (`/api/progress`) — PRD 7.4

**GET /api/progress?studentId=**
Response: `{ completedTopics, streak, recentQuizzes, weakAreas }`
`streak` is the single value from `students.streak_count`, not an aggregate over topics. Weak areas are returned individually, not folded into a single score.

**POST /api/progress/topic**
Request: `{ studentId, topic, status }`
Response: `{ topic }`
The only direct write to `progress`, the student marking a topic `in_progress` or `completed`. Upserts on `(student_id, topic)`.

**GET /api/progress/recommendations?studentId=**
Response: `{ recommendations: [...] }`
Recommendations from a general progress review, the `based_on_quiz_id IS NULL` case the data model allows for. PRD 7.4 requires progress to feed recommendations, and the quiz-scoped route under Practice can't produce these.

### Progress writes

Progress is mostly a side effect, so no single endpoint owns it. Three things update it, and any of them can extend the streak:

| Trigger | Effect |
| --- | --- |
| `POST /api/practice/:quizId/submit` | sets `is_weak_area` and `last_studied_at` for the quiz's topics |
| `POST /api/assistant/checkpoint` | sets `last_studied_at` for the explanation's subject |
| `POST /api/progress/topic` | sets `status` directly |

Streak rule: extend `students.streak_count` when any of the three fires on a calendar day later than `last_active_on`, reset to 1 when more than one day has passed. **Assumption** — the PRD says "study streak" without defining what counts as studying or what breaks it. Confirm before building `StreakIndicator`.

No dedicated flow diagram exists yet for this feature (PRD section 12), this contract is built from the written requirements and journey map, expect it to change once one does.
