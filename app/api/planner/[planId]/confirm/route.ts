import { NextResponse } from 'next/server';
import { badRequest, notFound, readJson, requireBoolean } from '@/lib/api';
import { confirmPlan, getPlan, toPlanDto } from '@/lib/db/planner';
import { extendStreak, touchTopic } from '@/lib/db/mutations';
import { getCurrentStudentId } from '@/lib/session';

/**
 * Never prerendered. Route handlers with no dynamic marker are candidates for
 * build-time evaluation, which would run this query against a database that
 * holds only seed data — and cache the result forever.
 */
export const dynamic = 'force-dynamic';

/**
 * POST /api/planner/:planId/confirm — PRD 7.2
 *
 * The Planner's understanding checkpoint, mirroring the Assistant's. The
 * original contract took no body, so the answer went unrecorded and the branch
 * TESTING.md ranks first could not be tested on this flow.
 *
 * true  -> plan goes active and appears on the schedule view
 * false -> stays draft, the student edits and re-reviews
 *
 * Either answer is recorded. Null still means "not answered yet", never "no".
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ planId: string }> }
) {
  const { planId: planIdText } = await params;
  const planId = Number(planIdText);
  if (!Number.isInteger(planId) || planId <= 0) return badRequest('Invalid plan id');

  const body = await readJson(request);
  if (!body) return badRequest('Expected a JSON body');

  const understood = requireBoolean(body, 'understood');
  if (understood === null) return badRequest('understood must be a boolean');

  const studentId = getCurrentStudentId();
  const plan = confirmPlan(studentId, planId, understood);
  if (!plan) return notFound('Plan not found');

  const withSessions = getPlan(studentId, planId);

  // Only an accepted plan counts as study activity. Rejecting a plan you don't
  // understand shouldn't quietly award a streak day.
  let streak: number | null = null;
  if (understood) {
    streak = extendStreak(studentId);
    for (const session of withSessions?.sessions ?? []) touchTopic(studentId, session.topic);
  }

  return NextResponse.json({
    success: true,
    plan: withSessions ? toPlanDto(withSessions) : null,
    streak,
  });
}
