import { NextResponse } from 'next/server';
import { listPlans, toPlanDto } from '@/lib/db/planner';
import { getCurrentStudentId } from '@/lib/session';
import type { PlanStatus } from '@/lib/db/types';

/**
 * Never prerendered. Route handlers with no dynamic marker are candidates for
 * build-time evaluation, which would run this query against a database that
 * holds only seed data — and cache the result forever.
 */
export const dynamic = 'force-dynamic';

/**
 * GET /api/planner — PRD 7.2, the schedule view.
 *
 * Scoped to the current student. studentId is never read from the query string;
 * doing so would let anyone enumerate another student's plans.
 */
const STATUSES: PlanStatus[] = ['draft', 'active', 'completed'];

export async function GET(request: Request) {
  const studentId = getCurrentStudentId();
  const requested = new URL(request.url).searchParams.get('status');
  const status = STATUSES.find((value) => value === requested);

  return NextResponse.json({ plans: listPlans(studentId, status).map(toPlanDto) });
}
