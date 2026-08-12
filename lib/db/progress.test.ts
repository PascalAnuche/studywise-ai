import { describe, expect, it } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Progress calculation.
 *
 * .agents/rules/TESTING.md ranks this a priority area: these numbers feed the
 * dashboard directly and a wrong one undermines the trust the product is built
 * around.
 */
const schema = fs.readFileSync(path.resolve(process.cwd(), 'lib/db/schema.sql'), 'utf8');

function seed() {
  const db = new DatabaseSync(':memory:');
  db.exec(schema);
  db.prepare(
    `INSERT INTO students (id, name, email, streak_count, last_active_on, created_at)
     VALUES (1, 'Test', 't@example.com', 3, '2026-08-10', '2026-01-01')`
  ).run();

  const topics: [string, string, number][] = [
    ['Recursion', 'completed', 0],
    ['Big-O notation', 'completed', 0],
    ['Dynamic programming', 'in_progress', 1],
    ['Graph traversal', 'not_started', 0],
  ];
  const insert = db.prepare(
    `INSERT INTO progress (student_id, topic, status, last_studied_at, is_weak_area, created_at, updated_at)
     VALUES (1, ?, ?, '2026-08-09', ?, '2026-08-01', '2026-08-09')`
  );
  for (const [topic, status, weak] of topics) insert.run(topic, status, weak);

  return db;
}

function addQuiz(
  db: DatabaseSync,
  id: number,
  topic: string,
  correct: number,
  wrong: number,
  completedAt: string
) {
  db.prepare(
    `INSERT INTO quizzes (id, student_id, subject, topic, difficulty, score, completed_at, created_at)
     VALUES (?, 1, 'Algorithms', ?, 'medium', ?, ?, ?)`
  ).run(id, topic, correct / (correct + wrong), completedAt, completedAt);

  const q = db.prepare(
    `INSERT INTO quiz_questions (quiz_id, question_text, options, correct_answer, reasoning, is_correct, created_at)
     VALUES (?, 'q', '[]', 'a', 'because', ?, ?)`
  );
  for (let i = 0; i < correct; i++) q.run(id, 1, completedAt);
  for (let i = 0; i < wrong; i++) q.run(id, 0, completedAt);
}

/** Mirrors the grouped evidence query in lib/db/progress.ts. */
function evidence(db: DatabaseSync) {
  return db
    .prepare(
      `SELECT q.id AS quiz_id, q.topic AS topic,
              SUM(CASE WHEN qq.is_correct = 0 THEN 1 ELSE 0 END) AS missed,
              COUNT(qq.id) AS total, q.completed_at AS completed_at
         FROM quizzes q JOIN quiz_questions qq ON qq.quiz_id = q.id
        WHERE q.student_id = 1 AND q.completed_at IS NOT NULL
        GROUP BY q.id
        ORDER BY q.completed_at DESC`
    )
    .all() as unknown as { quiz_id: number; topic: string; missed: number; total: number }[];
}

describe('progress overview', () => {
  it('counts completed topics without rolling anything into one score', () => {
    const db = seed();
    const rows = db.prepare('SELECT status FROM progress WHERE student_id = 1').all() as unknown as {
      status: string;
    }[];

    expect(rows.filter((r) => r.status === 'completed')).toHaveLength(2);
    expect(rows).toHaveLength(4);
  });

  it('lists weak areas individually, not as an aggregate', () => {
    const db = seed();
    const weak = db
      .prepare('SELECT topic FROM progress WHERE student_id = 1 AND is_weak_area = 1')
      .all() as unknown as { topic: string }[];

    // PRD 7.4: each weak area stands on its own.
    expect(weak.map((w) => w.topic)).toEqual(['Dynamic programming']);
  });

  it('counts missed questions per quiz correctly', () => {
    const db = seed();
    addQuiz(db, 1, 'Recursion', 3, 2, '2026-08-10');

    const [row] = evidence(db);
    expect(row.missed).toBe(2);
    expect(row.total).toBe(5);
  });

  it('takes the most recent quiz per topic as the evidence', () => {
    const db = seed();
    addQuiz(db, 1, 'Recursion', 1, 4, '2026-08-01'); // older, worse
    addQuiz(db, 2, 'Recursion', 4, 1, '2026-08-10'); // newer, better

    const rows = evidence(db);
    // Newest first, so the first sighting of a topic is the one shown.
    expect(rows[0].quiz_id).toBe(2);
    expect(rows[0].missed).toBe(1);
  });

  it('ignores quizzes that were never submitted', () => {
    const db = seed();
    addQuiz(db, 1, 'Recursion', 3, 2, '2026-08-10');
    db.prepare(
      `INSERT INTO quizzes (id, student_id, subject, topic, difficulty, score, completed_at, created_at)
       VALUES (2, 1, 'Algorithms', 'Graph traversal', 'easy', NULL, NULL, '2026-08-11')`
    ).run();
    db.prepare(
      `INSERT INTO quiz_questions (quiz_id, question_text, options, correct_answer, reasoning, created_at)
       VALUES (2, 'q', '[]', 'a', 'because', '2026-08-11')`
    ).run();

    // An abandoned quiz is not a result, so it must not appear as evidence.
    expect(evidence(db).map((r) => r.quiz_id)).toEqual([1]);
  });
});

describe('marking a topic', () => {
  it('upserts rather than duplicating the row', () => {
    const db = seed();
    const mark = (status: string) =>
      db
        .prepare(
          `INSERT INTO progress (student_id, topic, status, last_studied_at, is_weak_area, created_at, updated_at)
           VALUES (1, 'Recursion', ?, NULL, 0, '2026-08-11', '2026-08-11')
           ON CONFLICT (student_id, topic) DO UPDATE SET status = excluded.status`
        )
        .run(status);

    mark('completed');
    mark('in_progress');
    mark('completed');

    const rows = db
      .prepare("SELECT status FROM progress WHERE student_id = 1 AND topic = 'Recursion'")
      .all() as unknown as { status: string }[];

    expect(rows).toHaveLength(1);
    expect(rows[0].status).toBe('completed');
  });

  it('does not touch the streak', () => {
    const db = seed();
    const before = db.prepare('SELECT streak_count FROM students WHERE id = 1').get() as unknown as {
      streak_count: number;
    };

    db.prepare(
      `INSERT INTO progress (student_id, topic, status, last_studied_at, is_weak_area, created_at, updated_at)
       VALUES (1, 'Graph traversal', 'completed', NULL, 0, '2026-08-11', '2026-08-11')
       ON CONFLICT (student_id, topic) DO UPDATE SET status = excluded.status`
    ).run();

    const after = db.prepare('SELECT streak_count FROM students WHERE id = 1').get() as unknown as {
      streak_count: number;
    };

    // Ticking boxes is not studying. Four checkboxes must not read as four days.
    expect(after.streak_count).toBe(before.streak_count);
  });
});
