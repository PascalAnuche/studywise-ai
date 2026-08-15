import { NextResponse } from 'next/server';
import { getFollowUpsFor } from '@/lib/db/mutations';
import { getRecentExplanations } from '@/lib/db/queries';
import { getCurrentStudentId } from '@/lib/session';

/**
 * Never prerendered. Route handlers with no dynamic marker are candidates for
 * build-time evaluation, which would run this query against a database that
 * holds only seed data — and cache the result forever.
 */
export const dynamic = 'force-dynamic';

/**
 * GET /api/assistant/history — PRD 7.1
 *
 * Each explanation with its follow-ups nested. Scoped to the current student;
 * the studentId is never taken from the query string, which would let anyone
 * read another student's record (rules/SECURITY.md).
 */
export async function GET(request: Request) {
  const studentId = getCurrentStudentId();
  const limitParam = new URL(request.url).searchParams.get('limit');
  const limit = Math.min(Math.max(Number(limitParam) || 20, 1), 50);

  const recent = getRecentExplanations(studentId, limit);
  // One query for every explanation's follow-ups, not one per explanation.
  const followUpsById = getFollowUpsFor(recent.map((explanation) => explanation.id));

  const explanations = recent.map((explanation) => ({
    ...explanation,
    followUps: followUpsById.get(explanation.id) ?? [],
  }));

  return NextResponse.json({ explanations });
}
