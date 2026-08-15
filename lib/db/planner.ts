import 'server-only';
import { batch, nowIso, queryAll, queryOne } from './client';
import type { PlanSession } from '@/lib/ai/types';
import type { PlanStatus, StudyPlan } from './types';

export interface PlanSessionRow {
  id: number;
  plan_id: number;
  order_index: number;
  topic: string;
  focus: string;
  duration_minutes: number;
  scheduled_for: string | null;
  start_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlanWithSessions extends StudyPlan {
  sessions: PlanSessionRow[];
}

export interface PlanSessionDto extends PlanSession {
  id: number;
}

export interface PlanDto {
  id: number;
  subject: string;
  goals: string[];
  topics: string[];
  frequency: string | null;
  startDate: string | null;
  endDate: string | null;
  status: PlanStatus;
  understood: boolean | null;
  sessions: PlanSessionDto[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Row shape to wire shape.
 *
 * .agents/rules/CODE_STYLE.md requires camelCase keys in response JSON, and
 * returning rows straight from the database also leaks the column names into
 * the client. It made `plan.sessions` (snake_case rows) and `result.sessions`
 * (camelCase from the adapter) two different shapes under the same name.
 */
export function toPlanDto(plan: PlanWithSessions): PlanDto {
  return {
    id: plan.id,
    subject: plan.subject,
    goals: parseJsonArray(plan.goals),
    topics: parseJsonArray(plan.topics),
    frequency: plan.frequency,
    startDate: plan.start_date,
    endDate: plan.end_date,
    status: plan.status,
    understood: plan.understood === null ? null : plan.understood === 1,
    sessions: plan.sessions.map((session) => ({
      id: session.id,
      order: session.order_index,
      topic: session.topic,
      focus: session.focus,
      durationMinutes: session.duration_minutes,
      scheduledFor: session.scheduled_for,
      startTime: session.start_time,
    })),
    createdAt: plan.created_at,
    updatedAt: plan.updated_at,
  };
}

/** Topics and goals are JSON text; malformed data degrades to empty, never throws. */
export function parseJsonArray(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

export async function getPlan(studentId: number, planId: number): Promise<PlanWithSessions | undefined> {
  const plan = await queryOne<StudyPlan>(
    'SELECT * FROM study_plans WHERE id = ? AND student_id = ?',
    planId,
    studentId
  );
  if (!plan) return undefined;
  return { ...plan, sessions: await getSessions(planId) };
}

export async function getSessions(planId: number): Promise<PlanSessionRow[]> {
  return await queryAll<PlanSessionRow>(
    'SELECT * FROM plan_sessions WHERE plan_id = ? ORDER BY order_index',
    planId
  );
}

export async function listPlans(studentId: number, status?: PlanStatus): Promise<PlanWithSessions[]> {
  const plans = status
    ? await queryAll<StudyPlan>(
        'SELECT * FROM study_plans WHERE student_id = ? AND status = ? ORDER BY updated_at DESC',
        studentId,
        status
      )
    : await queryAll<StudyPlan>(
        'SELECT * FROM study_plans WHERE student_id = ? ORDER BY updated_at DESC',
        studentId
      );

  if (plans.length === 0) return [];

  // One query for every plan's sessions rather than one per plan. Cheap at this
  // size, but the N+1 shape is what turns a fast page into a slow one later.
  const placeholders = plans.map(() => '?').join(', ');
  const sessions = await queryAll<PlanSessionRow>(
    `SELECT * FROM plan_sessions WHERE plan_id IN (${placeholders}) ORDER BY plan_id, order_index`,
    ...plans.map((plan) => plan.id)
  );

  const byPlan = new Map<number, PlanSessionRow[]>();
  for (const session of sessions) {
    const list = byPlan.get(session.plan_id);
    if (list) list.push(session);
    else byPlan.set(session.plan_id, [session]);
  }

  return plans.map((plan) => ({ ...plan, sessions: byPlan.get(plan.id) ?? [] }));
}

/**
 * Creates a plan as `draft` with `understood` null. It only becomes `active`
 * once the student confirms it, which is PRD 7.2's review step.
 */
export async function insertPlan(input: {
  studentId: number;
  subject: string;
  goals: string[];
  topics: string[];
  frequency: string;
  startDate: string | null;
  endDate: string | null;
  sessions: PlanSession[];
}): Promise<PlanWithSessions> {
  const stamp = nowIso();

  const plan = await queryOne<StudyPlan>(
    `INSERT INTO study_plans
       (student_id, subject, goals, topics, frequency, start_date, end_date, status, understood, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', NULL, ?, ?)
     RETURNING *`,
    input.studentId,
    input.subject,
    JSON.stringify(input.goals),
    JSON.stringify(input.topics),
    input.frequency,
    input.startDate,
    input.endDate,
    stamp,
    stamp
  );

  if (!plan) throw new Error('Failed to insert study plan');

  await replaceSessions(plan.id, input.sessions);
  return { ...plan, sessions: await getSessions(plan.id) };
}

/**
 * The delete and the inserts go as one batch, which libSQL runs as a
 * transaction. Sent as separate statements a failure part-way through would
 * leave the plan with no sessions at all — the old ones already gone and the
 * new ones never written.
 */
export async function replaceSessions(planId: number, sessions: PlanSession[]): Promise<void> {
  const stamp = nowIso();

  await batch([
    { sql: 'DELETE FROM plan_sessions WHERE plan_id = ?', args: [planId] },
    ...sessions.map((session, index) => ({
      sql: `INSERT INTO plan_sessions
       (plan_id, order_index, topic, focus, duration_minutes, scheduled_for, start_time, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        planId,
        session.order ?? index + 1,
        session.topic,
        session.focus,
        session.durationMinutes,
        session.scheduledFor,
        session.startTime ?? null,
        stamp,
        stamp,
      ],
    })),
  ]);
}

/**
 * PRD 7.2: plans stay adjustable after saving, not just before. Status is
 * deliberately not editable here, only /confirm moves a plan to active.
 */
export async function updatePlan(
  studentId: number,
  planId: number,
  changes: {
    subject?: string;
    goals?: string[];
    topics?: string[];
    frequency?: string;
    startDate?: string | null;
    endDate?: string | null;
    sessions?: PlanSession[];
  }
): Promise<PlanWithSessions | undefined> {
  const existing = await getPlan(studentId, planId);
  if (!existing) return undefined;

  const plan = await queryOne<StudyPlan>(
    `UPDATE study_plans SET
       subject = ?, goals = ?, topics = ?, frequency = ?,
       start_date = ?, end_date = ?, updated_at = ?
     WHERE id = ? AND student_id = ?
     RETURNING *`,
    changes.subject ?? existing.subject,
    JSON.stringify(changes.goals ?? parseJsonArray(existing.goals)),
    JSON.stringify(changes.topics ?? parseJsonArray(existing.topics)),
    changes.frequency ?? existing.frequency,
    changes.startDate === undefined ? existing.start_date : changes.startDate,
    changes.endDate === undefined ? existing.end_date : changes.endDate,
    nowIso(),
    planId,
    studentId
  );

  if (!plan) return undefined;
  if (changes.sessions) await replaceSessions(planId, changes.sessions);

  return { ...plan, sessions: await getSessions(planId) };
}

/**
 * The Planner's understanding checkpoint (PRD 7.2), mirroring the Assistant's.
 *
 * On true the plan goes active and appears on the schedule view. On false it
 * stays draft so the student can edit and re-review; the answer is recorded
 * either way, which is what makes the branch testable.
 */
export async function confirmPlan(
  studentId: number,
  planId: number,
  understood: boolean
): Promise<StudyPlan | undefined> {
  return await queryOne<StudyPlan>(
    `UPDATE study_plans SET status = ?, understood = ?, updated_at = ?
      WHERE id = ? AND student_id = ?
      RETURNING *`,
    understood ? 'active' : 'draft',
    understood ? 1 : 0,
    nowIso(),
    planId,
    studentId
  );
}
