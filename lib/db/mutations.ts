import 'server-only';
import { nowIso, queryAll, queryOne, run, today } from './client';
import type { Confidence, Explanation, FollowUpQuestion, Student, Understood } from './types';

/**
 * Writes. Every one is scoped by student_id per .agents/rules/SECURITY.md.
 *
 * Progress is mostly a side effect of other actions rather than something the
 * UI edits directly, see the write table in .agents/docs/API.md.
 */

export async function insertExplanation(input: {
  studentId: number;
  subject: string | null;
  question: string;
  answer: string;
  reasoning: string;
  confidence: Confidence;
}): Promise<Explanation> {
  const row = await queryOne<Explanation>(
    `INSERT INTO explanations
       (student_id, subject, question, answer, reasoning, confidence, understood, created_at)
     VALUES (?, ?, ?, ?, ?, ?, NULL, ?)
     RETURNING *`,
    input.studentId,
    input.subject,
    input.question,
    input.answer,
    input.reasoning,
    input.confidence,
    nowIso()
  );

  if (!row) throw new Error('Failed to insert explanation');
  return row;
}

export async function insertFollowUp(input: {
  explanationId: number;
  question: string;
  answer: string;
  reasoning: string;
  confidence: Confidence;
}): Promise<FollowUpQuestion> {
  const row = await queryOne<FollowUpQuestion>(
    `INSERT INTO follow_up_questions
       (explanation_id, question, answer, reasoning, confidence, created_at)
     VALUES (?, ?, ?, ?, ?, ?)
     RETURNING *`,
    input.explanationId,
    input.question,
    input.answer,
    input.reasoning,
    input.confidence,
    nowIso()
  );

  if (!row) throw new Error('Failed to insert follow-up');
  return row;
}

/**
 * Resolves the understanding checkpoint. Scoped by student so one student
 * cannot answer another's checkpoint.
 */
export async function setUnderstood(
  studentId: number,
  explanationId: number,
  understood: boolean
): Promise<Explanation | undefined> {
  return await queryOne<Explanation>(
    `UPDATE explanations SET understood = ?
      WHERE id = ? AND student_id = ?
      RETURNING *`,
    understood ? 1 : 0,
    explanationId,
    studentId
  );
}

/**
 * Marks a topic as studied today. Upserts on (student_id, topic), and only
 * advances status out of not_started, so it never silently un-completes a topic.
 */
export async function touchTopic(studentId: number, topic: string): Promise<void> {
  const stamp = nowIso();
  await run(
    `INSERT INTO progress (student_id, topic, status, last_studied_at, is_weak_area, created_at, updated_at)
       VALUES (?, ?, 'in_progress', ?, 0, ?, ?)
       ON CONFLICT (student_id, topic) DO UPDATE SET
         last_studied_at = excluded.last_studied_at,
         updated_at      = excluded.updated_at,
         status          = CASE WHEN progress.status = 'not_started'
                                THEN 'in_progress' ELSE progress.status END`,
    studentId,
    topic,
    stamp,
    stamp,
    stamp
  );
}

/**
 * Streak rule from .agents/docs/API.md: extend once per calendar day when any
 * qualifying action fires, reset to 1 when more than a day has passed.
 *
 * Assumption, not a settled decision. The PRD says "study streak" without
 * defining what counts as studying or what breaks it. See AGENTS.md.
 */
export async function extendStreak(studentId: number): Promise<number> {
  const student = await queryOne<Student>('SELECT * FROM students WHERE id = ?', studentId);
  if (!student) return 0;

  const day = today();
  if (student.last_active_on === day) return student.streak_count;

  const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  const next = student.last_active_on === yesterday ? student.streak_count + 1 : 1;

  await run('UPDATE students SET streak_count = ?, last_active_on = ? WHERE id = ?', next, day, studentId);

  return next;
}

export async function getExplanationForStudent(
  studentId: number,
  explanationId: number
): Promise<Explanation | undefined> {
  return await queryOne<Explanation>(
    'SELECT * FROM explanations WHERE id = ? AND student_id = ?',
    explanationId,
    studentId
  );
}

export async function getFollowUps(explanationId: number): Promise<FollowUpQuestion[]> {
  return queryAll<FollowUpQuestion>(
    'SELECT * FROM follow_up_questions WHERE explanation_id = ? ORDER BY created_at',
    explanationId
  );
}

/**
 * Follow-ups for several explanations in one query, keyed by explanation id.
 *
 * The per-explanation version is an N+1 when rendering a thread: five saved
 * explanations meant six round trips.
 */
export async function getFollowUpsFor(explanationIds: number[]): Promise<Map<number, FollowUpQuestion[]>> {
  const grouped = new Map<number, FollowUpQuestion[]>();
  if (explanationIds.length === 0) return grouped;

  const placeholders = explanationIds.map(() => '?').join(', ');
  const rows = await queryAll<FollowUpQuestion>(
    `SELECT * FROM follow_up_questions
        WHERE explanation_id IN (${placeholders})
        ORDER BY explanation_id, created_at`,
    ...explanationIds
  );

  for (const row of rows) {
    const list = grouped.get(row.explanation_id);
    if (list) list.push(row);
    else grouped.set(row.explanation_id, [row]);
  }

  return grouped;
}

export type { Understood };
