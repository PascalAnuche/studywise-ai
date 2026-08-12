import { NextResponse } from 'next/server';
import { badRequest, notFound, readJson } from '@/lib/api';
import { toPlanDto, updatePlan } from '@/lib/db/planner';
import { getCurrentStudentId } from '@/lib/session';
import type { PlanSession } from '@/lib/ai/types';

/**
 * PUT /api/planner/:planId — PRD 7.2
 *
 * Plans stay editable after generation *and* after saving, so this accepts a
 * partial update at any status. Status itself is not editable here: only
 * /confirm moves a plan to active, which keeps the checkpoint the single way in.
 */
function parseSessions(value: unknown): PlanSession[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const sessions: PlanSession[] = [];
  for (const [index, raw] of value.entries()) {
    if (typeof raw !== 'object' || raw === null) return undefined;
    const item = raw as Record<string, unknown>;

    const topic = typeof item.topic === 'string' ? item.topic.trim() : '';
    const focus = typeof item.focus === 'string' ? item.focus.trim() : '';
    const duration = typeof item.durationMinutes === 'number' ? item.durationMinutes : NaN;
    if (!topic || !focus || !Number.isFinite(duration) || duration <= 0 || duration > 600) {
      return undefined;
    }

    sessions.push({
      order: typeof item.order === 'number' ? item.order : index + 1,
      topic,
      focus,
      durationMinutes: Math.round(duration),
      scheduledFor: typeof item.scheduledFor === 'string' ? item.scheduledFor : null,
    });
  }
  return sessions;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ planId: string }> }
) {
  const { planId: planIdText } = await params;
  const planId = Number(planIdText);
  if (!Number.isInteger(planId) || planId <= 0) return badRequest('Invalid plan id');

  const body = await readJson(request);
  if (!body) return badRequest('Expected a JSON body');

  const sessions = 'sessions' in body ? parseSessions(body.sessions) : undefined;
  if ('sessions' in body && !sessions) return badRequest('sessions are malformed');

  const updated = updatePlan(getCurrentStudentId(), planId, {
    subject: typeof body.subject === 'string' ? body.subject.trim() : undefined,
    frequency: typeof body.frequency === 'string' ? body.frequency.trim() : undefined,
    goals: Array.isArray(body.goals)
      ? body.goals.filter((g): g is string => typeof g === 'string')
      : undefined,
    topics: Array.isArray(body.topics)
      ? body.topics.filter((t): t is string => typeof t === 'string')
      : undefined,
    startDate: 'startDate' in body ? ((body.startDate as string | null) ?? null) : undefined,
    endDate: 'endDate' in body ? ((body.endDate as string | null) ?? null) : undefined,
    sessions,
  });

  if (!updated) return notFound('Plan not found');
  return NextResponse.json({ plan: toPlanDto(updated) });
}
