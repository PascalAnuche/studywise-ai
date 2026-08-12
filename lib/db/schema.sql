-- Schema per .agents/docs/DATA_MODEL.md. Keep the two in sync.
-- SQLite: booleans are INTEGER 0/1, timestamps are ISO strings in TEXT.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS students (
  id             INTEGER PRIMARY KEY,
  name           TEXT NOT NULL,
  email          TEXT NOT NULL UNIQUE,
  discipline     TEXT,
  streak_count   INTEGER NOT NULL DEFAULT 0,
  last_active_on TEXT,
  created_at     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS study_plans (
  id         INTEGER PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject    TEXT NOT NULL,
  goals      TEXT,
  topics     TEXT,
  frequency  TEXT,
  start_date TEXT,
  end_date   TEXT,
  status     TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed')),
  -- Nullable on purpose: null means the checkpoint has not been answered yet.
  understood INTEGER CHECK (understood IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- The generated plan body. study_plans holds the student's inputs; this holds
-- what the assistant produced from them. Separate rows rather than a JSON blob
-- because PRD 7.2 requires each item be individually editable, and the schedule
-- view queries by date.
CREATE TABLE IF NOT EXISTS plan_sessions (
  id               INTEGER PRIMARY KEY,
  plan_id          INTEGER NOT NULL REFERENCES study_plans(id) ON DELETE CASCADE,
  order_index      INTEGER NOT NULL,
  topic            TEXT NOT NULL,
  focus            TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  scheduled_for    TEXT,
  -- Local start time, "HH:MM". The approved Home design shows today's plan as
  -- time ranges ("10:00 AM - 11:30 AM"), which a date and a duration cannot
  -- express. Nullable: a plan with no times is still a valid plan.
  start_time       TEXT,
  created_at       TEXT NOT NULL,
  updated_at       TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS explanations (
  id         INTEGER PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject    TEXT,
  question   TEXT NOT NULL,
  answer     TEXT NOT NULL,
  reasoning  TEXT NOT NULL,
  confidence TEXT NOT NULL
               CHECK (confidence IN ('well-established', 'one interpretation', 'worth verifying')),
  -- Nullable on purpose. Defaulting to 0 would make an abandoned question
  -- indistinguishable from "I did not understand" and corrupt the PRD section 3
  -- comprehension metric. Filter on understood IS NOT NULL when measuring.
  understood INTEGER CHECK (understood IN (0, 1)),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS follow_up_questions (
  id             INTEGER PRIMARY KEY,
  explanation_id INTEGER NOT NULL REFERENCES explanations(id) ON DELETE CASCADE,
  question       TEXT NOT NULL,
  answer         TEXT NOT NULL,
  reasoning      TEXT NOT NULL,
  confidence     TEXT NOT NULL
                   CHECK (confidence IN ('well-established', 'one interpretation', 'worth verifying')),
  created_at     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS quizzes (
  id           INTEGER PRIMARY KEY,
  student_id   INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject      TEXT NOT NULL,
  topic        TEXT,
  difficulty   TEXT NOT NULL,
  score        REAL,
  completed_at TEXT,
  created_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id             INTEGER PRIMARY KEY,
  quiz_id        INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text  TEXT NOT NULL,
  options        TEXT,
  correct_answer TEXT NOT NULL,
  -- The because line. Prompt section 10 requires marking to explain why an
  -- answer was wrong, so the reasoning is stored per question at generation
  -- time rather than regenerated at review time and risking a different story.
  reasoning      TEXT NOT NULL DEFAULT '',
  student_answer TEXT,
  is_correct     INTEGER CHECK (is_correct IN (0, 1)),
  -- Set when an incorrect answer traces back to a saved explanation (PRD 7.3).
  explanation_id INTEGER REFERENCES explanations(id) ON DELETE SET NULL,
  created_at     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS progress (
  id              INTEGER PRIMARY KEY,
  student_id      INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  topic           TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'not_started'
                    CHECK (status IN ('not_started', 'in_progress', 'completed')),
  last_studied_at TEXT,
  is_weak_area    INTEGER NOT NULL DEFAULT 0 CHECK (is_weak_area IN (0, 1)),
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL,
  UNIQUE (student_id, topic)
);

CREATE TABLE IF NOT EXISTS recommendations (
  id                INTEGER PRIMARY KEY,
  student_id        INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  based_on_quiz_id  INTEGER REFERENCES quizzes(id) ON DELETE SET NULL,
  topic             TEXT NOT NULL,
  reason            TEXT NOT NULL,
  created_at        TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_plan_sessions_plan ON plan_sessions(plan_id, order_index);
CREATE INDEX IF NOT EXISTS idx_plan_sessions_date ON plan_sessions(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_explanations_student ON explanations(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_follow_ups_explanation ON follow_up_questions(explanation_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_student ON quizzes(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_progress_student ON progress(student_id);
CREATE INDEX IF NOT EXISTS idx_study_plans_student ON study_plans(student_id, status);
CREATE INDEX IF NOT EXISTS idx_recommendations_student ON recommendations(student_id, created_at DESC);
