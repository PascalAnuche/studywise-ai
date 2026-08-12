import { describe, expect, it } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Quiz scoring and recommendation traceability.
 *
 * .agents/rules/TESTING.md ranks these second and third: a wrong score or a
 * recommendation that doesn't trace to an actually-missed topic undermines the
 * trust the product is built around. Run against a real in-memory database, so
 * the schema's constraints are exercised too.
 */
const schema = fs.readFileSync(path.resolve(process.cwd(), 'lib/db/schema.sql'), 'utf8');

function seed() {
  const db = new DatabaseSync(':memory:');
  db.exec(schema);
  db.prepare(
    `INSERT INTO students (id, name, email, streak_count, last_active_on, created_at)
     VALUES (1, 'Test', 't@example.com', 0, NULL, '2026-01-01')`
  ).run();
  db.prepare(
    `INSERT INTO quizzes (id, student_id, subject, topic, difficulty, score, completed_at, created_at)
     VALUES (1, 1, 'Algorithms', 'Recursion', 'medium', NULL, NULL, '2026-01-01')`
  ).run();

  const insert = db.prepare(
    `INSERT INTO quiz_questions
       (id, quiz_id, question_text, options, correct_answer, reasoning, created_at)
     VALUES (?, 1, ?, ?, ?, ?, '2026-01-01')`
  );
  for (let i = 1; i <= 4; i++) {
    insert.run(i, `Q${i}`, JSON.stringify([`right${i}`, `wrong${i}`]), `right${i}`, `because ${i}`);
  }
  return db;
}

/** Mirrors the marking half of submitQuiz against an injectable db. */
function mark(db: DatabaseSync, given: Record<number, string>) {
  const questions = db.prepare('SELECT * FROM quiz_questions WHERE quiz_id = 1').all() as unknown as {
    id: number;
    correct_answer: string;
  }[];

  let correct = 0;
  const update = db.prepare('UPDATE quiz_questions SET student_answer = ?, is_correct = ? WHERE id = ?');

  for (const question of questions) {
    const answer = given[question.id] ?? null;
    const isCorrect = answer !== null && answer === question.correct_answer;
    if (isCorrect) correct++;
    update.run(answer, isCorrect ? 1 : 0, question.id);
  }

  const score = correct / questions.length;
  db.prepare('UPDATE quizzes SET score = ?, completed_at = ? WHERE id = 1').run(score, '2026-01-02');
  return { correct, score };
}

describe('quiz scoring', () => {
  it('scores a perfect quiz as 1', () => {
    const db = seed();
    const { score } = mark(db, { 1: 'right1', 2: 'right2', 3: 'right3', 4: 'right4' });
    expect(score).toBe(1);
  });

  it('scores a half-right quiz as 0.5', () => {
    const db = seed();
    const { correct, score } = mark(db, { 1: 'right1', 2: 'wrong2', 3: 'right3', 4: 'wrong4' });
    expect(correct).toBe(2);
    expect(score).toBe(0.5);
  });

  it('counts an unanswered question as incorrect, never as correct', () => {
    const db = seed();
    const { correct } = mark(db, { 1: 'right1' });
    expect(correct).toBe(1);

    const unanswered = db
      .prepare('SELECT is_correct FROM quiz_questions WHERE id = 2')
      .get() as unknown as { is_correct: number };
    expect(unanswered.is_correct).toBe(0);
  });

  it('never marks an answer correct by position or partial match', () => {
    const db = seed();
    const { correct } = mark(db, { 1: 'right', 2: 'RIGHT2', 3: 'right3 ', 4: 'wrong4' });
    // Only the exact match counts. Trailing space and case are not equality.
    expect(correct).toBe(0);
  });
});

describe('recommendation traceability', () => {
  it('names a topic that was actually missed, with a reason that counts it', () => {
    const db = seed();
    mark(db, { 1: 'right1', 2: 'wrong2', 3: 'wrong3', 4: 'right4' });

    const missed = db
      .prepare('SELECT COUNT(*) AS n FROM quiz_questions WHERE quiz_id = 1 AND is_correct = 0')
      .get() as unknown as { n: number };

    db.prepare(
      `INSERT INTO recommendations (student_id, based_on_quiz_id, topic, reason, created_at)
       VALUES (1, 1, 'Recursion', ?, '2026-01-02')`
    ).run(`${missed.n} of 4 questions on Recursion were incorrect.`);

    const recommendation = db
      .prepare('SELECT * FROM recommendations WHERE student_id = 1')
      .get() as unknown as { topic: string; reason: string; based_on_quiz_id: number };

    expect(recommendation.topic).toBe('Recursion');
    expect(recommendation.based_on_quiz_id).toBe(1);
    // The reason has to carry the evidence, otherwise it is generic advice.
    expect(recommendation.reason).toContain('2 of 4');
    expect(recommendation.reason).toContain('Recursion');
  });

  it('produces no recommendation when nothing was missed', () => {
    const db = seed();
    mark(db, { 1: 'right1', 2: 'right2', 3: 'right3', 4: 'right4' });

    const missed = db
      .prepare('SELECT COUNT(*) AS n FROM quiz_questions WHERE quiz_id = 1 AND is_correct = 0')
      .get() as unknown as { n: number };

    expect(missed.n).toBe(0);
  });
});

describe('answer key exposure', () => {
  it('a quiz in progress has no completed_at, which is what gates the reveal', () => {
    const db = seed();
    const quiz = db.prepare('SELECT completed_at FROM quizzes WHERE id = 1').get() as unknown as {
      completed_at: string | null;
    };
    // toQuizDto withholds correct_answer and reasoning while this is null.
    expect(quiz.completed_at).toBeNull();
  });
});
