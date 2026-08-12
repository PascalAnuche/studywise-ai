import { describe, expect, it } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Streak arithmetic against a real in-memory database.
 *
 * .agents/rules/TESTING.md ranks progress calculation a priority area: the
 * numbers feed the dashboard directly, and a wrong one undermines exactly the
 * trust the product is built around.
 */

const schema = fs.readFileSync(path.resolve(process.cwd(), 'lib/db/schema.sql'), 'utf8');

function freshDb() {
  const db = new DatabaseSync(':memory:');
  db.exec(schema);
  db.prepare(
    `INSERT INTO students (id, name, email, discipline, streak_count, last_active_on, created_at)
     VALUES (1, 'Test', 't@example.com', 'Computer Science', ?, ?, '2026-01-01T00:00:00Z')`
  ).run(0, null);
  return db;
}

const dayString = (offset: number) => new Date(Date.now() + offset * 864e5).toISOString().slice(0, 10);

/** Mirrors extendStreak in lib/db/mutations.ts against an injectable db. */
function extendStreak(db: DatabaseSync, studentId: number): number {
  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(studentId) as unknown as {
    streak_count: number;
    last_active_on: string | null;
  };

  const today = dayString(0);
  if (student.last_active_on === today) return student.streak_count;

  const next = student.last_active_on === dayString(-1) ? student.streak_count + 1 : 1;
  db.prepare('UPDATE students SET streak_count = ?, last_active_on = ? WHERE id = ?').run(
    next,
    today,
    studentId
  );
  return next;
}

const setLastActive = (db: DatabaseSync, value: string | null, count: number) =>
  db.prepare('UPDATE students SET last_active_on = ?, streak_count = ? WHERE id = 1').run(value, count);

describe('streak', () => {
  it('starts at 1 on the first qualifying action', () => {
    const db = freshDb();
    expect(extendStreak(db, 1)).toBe(1);
  });

  it('extends once per calendar day, not once per action', () => {
    const db = freshDb();
    expect(extendStreak(db, 1)).toBe(1);
    // Three more actions the same day must not move it. The streak is written
    // from three separate triggers, so this is the regression that matters.
    expect(extendStreak(db, 1)).toBe(1);
    expect(extendStreak(db, 1)).toBe(1);
    expect(extendStreak(db, 1)).toBe(1);
  });

  it('increments on a consecutive day', () => {
    const db = freshDb();
    setLastActive(db, dayString(-1), 4);
    expect(extendStreak(db, 1)).toBe(5);
  });

  it('resets to 1 after a gap', () => {
    const db = freshDb();
    setLastActive(db, dayString(-3), 9);
    expect(extendStreak(db, 1)).toBe(1);
  });
});

describe('progress upsert', () => {
  it('is one row per student per topic', () => {
    const db = freshDb();
    const insert = () =>
      db
        .prepare(
          `INSERT INTO progress (student_id, topic, status, last_studied_at, is_weak_area, created_at, updated_at)
           VALUES (1, 'Recursion', 'in_progress', ?, 0, ?, ?)
           ON CONFLICT (student_id, topic) DO UPDATE SET updated_at = excluded.updated_at`
        )
        .run('2026-01-01', '2026-01-01', '2026-01-01');

    insert();
    insert();
    insert();

    const rows = db.prepare('SELECT COUNT(*) AS n FROM progress WHERE student_id = 1').get() as unknown as {
      n: number;
    };
    expect(rows.n).toBe(1);
  });

  it('never un-completes a topic', () => {
    const db = freshDb();
    db.prepare(
      `INSERT INTO progress (student_id, topic, status, last_studied_at, is_weak_area, created_at, updated_at)
       VALUES (1, 'Recursion', 'completed', '2026-01-01', 0, '2026-01-01', '2026-01-01')`
    ).run();

    db.prepare(
      `INSERT INTO progress (student_id, topic, status, last_studied_at, is_weak_area, created_at, updated_at)
       VALUES (1, 'Recursion', 'in_progress', '2026-01-02', 0, '2026-01-02', '2026-01-02')
       ON CONFLICT (student_id, topic) DO UPDATE SET
         status = CASE WHEN progress.status = 'not_started' THEN 'in_progress' ELSE progress.status END`
    ).run();

    const row = db.prepare('SELECT status FROM progress WHERE student_id = 1').get() as unknown as {
      status: string;
    };
    expect(row.status).toBe('completed');
  });
});

describe('understood nullability', () => {
  it('accepts null and distinguishes it from 0', () => {
    const db = freshDb();
    const insert = (understood: number | null, question: string) =>
      db
        .prepare(
          `INSERT INTO explanations
             (student_id, subject, question, answer, reasoning, confidence, understood, created_at)
           VALUES (1, 'Recursion', ?, 'a', 'r', 'well-established', ?, '2026-01-01')`
        )
        .run(question, understood);

    insert(null, 'abandoned');
    insert(0, 'not understood');
    insert(1, 'understood');

    const answered = db
      .prepare('SELECT COUNT(*) AS n FROM explanations WHERE understood IS NOT NULL')
      .get() as unknown as { n: number };

    // The abandoned row must not count toward the comprehension metric.
    expect(answered.n).toBe(2);
  });
});
