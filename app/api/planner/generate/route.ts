import { NextResponse } from 'next/server';
import { badRequest, optionalString, readJson, requireString, serverError } from '@/lib/api';
import { runPlan } from '@/lib/ai';
import { isAside } from '@/lib/ai/types';
import { buildStudentContext } from '@/lib/db/context';
import { insertPlan, toPlanDto } from '@/lib/db/planner';
import { getCurrentStudentId } from '@/lib/session';

/**
 * Never prerendered. Route handlers with no dynamic marker are candidates for
 * build-time evaluation, which would run this query against a database that
 * holds only seed data — and cache the result forever.
 */
export const dynamic = 'force-dynamic';

/**
 * POST /api/planner/generate — PRD 7.2
 *
 * Structured inputs only, never free text alone. Topics and frequency are
 * required because the plan is built from them; without them the assistant
 * would have to invent the plan's contents, which prompt section 10 forbids.
 *
 * An aside (clarify, escalation, redirect) writes nothing, same boundary as the
 * Assistant. A student saying they're overwhelmed while planning gets support,
 * not a schedule.
 */
function readStringArray(body: Record<string, unknown>, key: string): string[] {
  const value = body[key];
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 40);
}

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return badRequest('Expected a JSON body');

  const subject = requireString(body, 'subject', { maxLength: 200 });
  const frequency = requireString(body, 'frequency', { maxLength: 60 });
  const topics = readStringArray(body, 'topics');
  const goals = readStringArray(body, 'goals');

  if (!subject) return badRequest('subject is required');
  if (!frequency) return badRequest('frequency is required');
  if (topics.length === 0) return badRequest('at least one topic is required');

  const startDate = optionalString(body, 'startDate');
  const endDate = optionalString(body, 'endDate');
  const studentId = getCurrentStudentId();

  const input = { subject, goals, topics, frequency, startDate, endDate };

  try {
    const context = await buildStudentContext(studentId);
    const result = await runPlan({ input, context });

    if (isAside(result)) {
      return NextResponse.json({ planId: null, result });
    }

    const plan = await insertPlan({ studentId, ...input, sessions: result.sessions });

    return NextResponse.json({ planId: plan.id, plan: toPlanDto(plan), result });
  } catch (error) {
    console.error('planner/generate failed:', error instanceof Error ? error.message : 'unknown');
    return serverError('Could not build a plan');
  }
}
