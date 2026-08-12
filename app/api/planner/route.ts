import { NextResponse } from 'next/server';
import { listPlans, toPlanDto } from '@/lib/db/planner';
import { getCurrentStudentId } from '@/lib/session';
import type { PlanStatus } from '@/lib/db/types';

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
