# StudyWise AI — Product Requirements Document

**Document version:** 1.0
**Status:** Draft, open questions in section 12 are unresolved
**Platform:** Responsive Web (Desktop & Mobile)
**Last Updated:** August 10, 2026

## 1. Overview

StudyWise AI is a responsive web platform that helps university students learn more effectively by pairing an explainable AI assistant with study planning and progress tracking, all in one place. Rather than just answering questions the way most AI tools do, it shows students why an answer is correct, helps them plan how they'll study, and tracks how that studying is actually going, replacing the three or four separate apps students currently juggle in a single session.

## 2. Problem Statement

University students rely on AI tools daily, but two problems keep showing up, they don't fully trust the answers they get, and they have no single place to plan, practice, and track their learning. Across eight interviews spanning Computer Science, Medicine, Business, Law, Engineering, Economics, Education, and Psychology, students described verifying AI answers against textbooks or Google, switching between multiple apps in one study session, and having no reliable way to see whether they're actually improving.

## 3. Goals and Success Metrics

| Goal | Success Metric |
|---|---|
| Students understand AI recommendations | % of students reporting clarity on why an answer was given (post-use survey) |
| Students trust AI responses more | Reduction in students leaving the app to verify answers elsewhere |
| Students can plan and track their studies | % of students creating and completing at least one study plan per week |
| Students rely less on separate apps | Decrease in self-reported number of study tools used weekly |

Exact targets need a usage baseline before they can be set, flagged in section 12.

## 4. Target Users

**Persona 1 — Sarah Johnson, 21, Computer Science, Undergraduate**
Goals: understand difficult concepts more easily, prepare effectively for exams, stay consistent with studying, learn with confidence.
Frustrations: doesn't always trust AI-generated responses, uses multiple apps while studying, finds it difficult to stay organized.

**Persona 2 — David Okoro, 23, Business Administration, Undergraduate**
Goals: balance studies with other responsibilities, stay on top of assignments, build a consistent study routine, improve academic performance.
Frustrations: often studies at the last minute, switching between multiple study tools is distracting, has no easy way to track learning progress.

Both personas converge on the same tension, they want AI's speed, but not at the cost of trust or organization, that's the core problem StudyWise AI is solving for.

## 5. User Insights

**From the empathy map:**
- Says: "AI helps me study faster," but "I still double-check important answers," and "I use different apps for different tasks"
- Thinks: "Can I trust this AI response?", "I need a better way to stay organized," "I hope I'm studying the right topics"
- Feels: motivated to perform well, but overwhelmed by coursework and frustrated when information is unclear

**From the user journey map**, five stages surface improvement opportunities that map directly to the features in section 7:

| Stage | Emotion | Improvement Opportunity |
|---|---|---|
| Discover | Motivated, optimistic | Recommend study plans based on learning goals |
| Learn | Curious but unsure of AI reliability | Explainable AI, confidence indicators, source references |
| Practice | Focused, engaged | Personalized quizzes and targeted feedback |
| Track progress | Encouraged, wants clearer insight into weak areas | Learning analytics and personalized recommendations |
| Reflect | Confident, motivated to continue | Suggest next topic based on performance and goals |

## 6. Scope

**In scope for v1:** AI Study Assistant with explainable answers, Study Planner, AI-generated quizzes with results and recommendations, basic progress tracking (completed topics, study streak), resources and material upload, notes, flashcards, achievements, and profile/settings.

Scope note, added with the approved flow set: sections 7.5 to 7.8 below were not in the original v1 scope. Resources and material upload in particular resolves the open question in section 12 about lecture-notes upload, which is now in v1 rather than a fast-follow.

**Out of scope for v1:** native mobile apps, collaborative or group study features, integration with external LMS platforms such as Canvas or Moodle, voice-based interaction.

## 7. Core Features

### 7.1 AI Study Assistant (Learn with AI)
Goal: help a student understand a difficult topic, with reasoning they can actually follow.

Flow: Home → AI Assistant → student adds a question → AI generates a response → student is asked whether they understand → if yes, the explanation is saved and the flow ends → if no, the AI explains its answer (why and how), the student views the full explanation/reasoning, can ask a follow-up question, and saves the explanation once resolved.

Requirements:
- Every response includes an explanation of reasoning, not just the answer, per the system prompt's explainability format
- Follow-up questions retain prior context rather than starting fresh
- Saved explanations and follow-up history persist and are retrievable later
- A clear "do you understand?" checkpoint after each explanation, this is what lets the product measure comprehension rather than just response delivery

### 7.2 Study Planner (Create a Study Plan)
Goal: help a student organize their learning.

Flow: Home → Study planner → create study plan → choose subject → set learning goals → choose topics → set study dates/frequency → AI generates a study plan → student reviews it → if understood, the plan is saved and appears on a schedule view → if not, the student edits the plan and re-reviews until it fits.

Requirements:
- Plan generation takes subject, goals, topics, and frequency as structured inputs, not free text alone
- Generated plans are editable before saving, not just accepted or rejected outright
- Saved plans populate a schedule view accessible from the dashboard
- Plans remain adjustable after saving rather than locking once created

### 7.3 AI-Generated Quiz (Take a Quiz)
Goal: help a student test their understanding.

Flow: Home → Practice → choose subject/topic → generate quiz → select difficulty → start quiz → save questions → submit quiz → view results → review incorrect answers → get personalized recommendations.

Requirements:
- Difficulty selection happens before quiz generation, not after
- Incorrect answers link back to relevant explanations from the AI Assistant where possible, this is what closes the loop between practicing and understanding
- Post-quiz recommendations are based on the specific topics missed, not generic advice
- Quiz results and history feed into progress tracking (section 7.4)

Note on the "save questions" step above: `.agents/docs/API.md` implements it as saving answers in progress before submitting. The other reading is bookmarking individual questions for later review, which would need its own table and UI. Confirm against the original flow diagram, the two are not interchangeable.

### 7.4 Progress Tracking
Goal: give students visibility into how they're actually doing. This is referenced across the research and journey map but isn't yet diagrammed as its own flow, flagged as an open question in section 12.

Requirements:
- Dashboard surfaces completed topics, study streak, and recent quiz performance
- Weak areas are visible individually, not folded into one overall score
- Progress data feeds back into study plan and quiz recommendations, closing the loop the journey map identifies at the Track Progress and Reflect stages

### 7.5 Resources and Material Upload
Goal: let a student work from their own course material rather than the assistant's general knowledge.

Flow: Home → Resources → My Materials → upload a file → choose file → the assistant reads and indexes it → material added → open material → ask about it, summarise it, generate a quiz from it, or create flashcards from it.

Requirements:
- Supported formats cover the material students actually have: PDF, DOCX, PPT, TXT
- A material is usable from every other feature once added, this is what makes it worth uploading rather than pasting
- Processing state is visible; a student should never wonder whether an upload worked
- Uploaded material is the student's own, treated as sensitive per section 12, and removable

### 7.6 Notes and Flashcards
Goal: let a student capture their own understanding, and rehearse it.

Notes flow: Home → Notes → all notes → create or edit → save → ask the assistant about it, or convert it into a quiz.

Flashcards flow: Home → Flashcards → all sets → open a set → review a card → "know it?" → yes advances, no marks the card for review → completed set → retention shown per set.

Requirements:
- Notes are the student's writing. The assistant may read, summarise or quiz from a note, and does not rewrite it in place
- Flashcard review records what was and was not recalled, per card, not as one score
- A card marked for review comes back rather than being dropped from the set
- Sets can be generated from a note, a material, or a studied topic

### 7.7 Achievements and Study Streak
Goal: make progress legible over a term, not just a session.

Flow: Home → Achievements → your achievements → continue learning (go to plan, take a quiz, or review a weak area).

Requirements:
- Each achievement states what was done and when it was earned
- No comparison to other students, per section 12
- A lapsed streak is reported as a fact and not commented on
- The page always offers a next action rather than ending on a tally

### 7.8 Profile and Settings
Goal: let a student see and control what the product knows about them.

Flow: Home → Profile → edit profile → save; and Home → Settings → preferences, notifications, appearance, privacy, plan.

Requirements:
- Discipline is editable, since it changes how conservative the assistant is (section 11)
- Preferences cover study reminders, AI response style, and language
- Privacy is a first-class settings section, not buried: a student can see what is stored about their studying and remove it
- Appearance covers the light and dark themes

## 8. AI Behavior Requirements

The AI Assistant's behavior is governed by the StudyWise AI system prompt (see appendix). Key product-relevant requirements from it:
- Every substantive answer follows an "answer, because, confidence" structure, so the frontend can render a consistent "why" toggle or confidence badge across the product
- The assistant operates in defined modes, Explain, Plan, Track, Quiz, mirroring the four features above rather than one blended behavior
- In high-stakes academic domains like Medicine and Law, the assistant becomes more conservative and flags when something needs professional verification
- Study struggles and performance history are treated as sensitive data by default

## 9. Data Requirements

To support personalization and progress tracking, the platform needs to persist, per student:
- Course/discipline and current topics of study
- Active study plan(s) and their status
- Saved explanations and follow-up question history
- Quiz history, subject, difficulty, score, and specific questions missed
- Study streak and completed topic list

This maps directly to the Input Context Variables defined in the AI system prompt, the assistant depends on this data being available and structured to personalize meaningfully rather than starting from zero every session.

## 10. Non-Functional Requirements
- Responsive across desktop and mobile web
- AI response latency should feel conversational, explanations target a few seconds, longer generation like study plans or quizzes can show a loading state
- Student data handled per the system prompt's privacy section, never surfaced to other users, never used to make ability-based assumptions
- Accessible color contrast and keyboard navigation, given the platform is used for extended study sessions

## 11. Risks and Assumptions
- Assumes students trust the platform enough to input real academic struggles, if explainability doesn't land well early, trust-dependent features like planning and tracking may see slower adoption
- Assumes AI-generated study plans and quizzes are accurate enough per subject, weak coverage in any one discipline could undermine trust faster than a slow feature rollout would
- Content accuracy across the full range of disciplines in the research base, Medicine and Law included, is a meaningfully higher bar than a single-discipline tool would need to clear

## 12. Open Questions

Resolved by the approved flow set:
- ~~What does the Progress Tracking flow look like end to end~~ — flow 6 now diagrams it
- ~~Should lecture notes upload be in v1 scope or a fast-follow~~ — in v1, see section 7.5

Still open:
- What's the actual baseline for the metrics in section 3, usage data is needed before targets can be set
- How is the confidence indicator calculated, model certainty, source availability, or both

New, raised by the approved design:
- **Source citations.** The design shows named sources under each answer. Section 9 defines answer, because and confidence; citations sit alongside them and need a contract of their own. Fabricated citations would be the worst possible failure for a product whose thesis is verifiability, so the rule until this is settled is: show the sources the provider actually returns, and show nothing otherwise
- **Answer feedback.** Thumbs up/down and bookmark appear on each answer. What is stored, who sees it, and whether it feeds recommendations are undecided; section 12 applies to whatever is kept
- **"Explain this answer".** A second, deeper pass over an answer already given. Whether it is a new interaction mode or a follow-up with a fixed prompt is undecided
- **Notifications.** The design shows an unread count. Nothing defines what generates one
- **Pro tier.** The sidebar offers an upgrade. No pricing, entitlement, or gated feature is defined
- **Practice has no sidebar entry** in the approved design, though flow 3 needs one. It is currently reached from the Home composer's "Generate Quiz" action and from recommendations

## 13. Appendix
- AI system prompt: `.agents/studywise-ai-prompt.md`, 13 sections covering role, explainability format, interaction modes, privacy, and escalation handling
- Research summary: UX audit, eight-participant interview findings, and insights synthesized in sections 2 and 5
- Competitor audit: linked Google Sheet from the initial research phase
