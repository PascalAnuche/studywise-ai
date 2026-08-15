import { NextResponse } from 'next/server';
import { badRequest, notFound, readJson, requireBoolean, requireNumber } from '@/lib/api';
import { extendStreak, setUnderstood } from '@/lib/db/mutations';
import { getCurrentStudentId } from '@/lib/session';

/**
 * Never prerendered. Route handlers with no dynamic marker are candidates for
 * build-time evaluation, which would run this query against a database that
 * holds only seed data — and cache the result forever.
 */
export const dynamic = 'force-dynamic';

/**
 * POST /api/assistant/checkpoint — PRD 7.1
 *
 * Named checkpoint rather than save: `ask` already persisted the row, this only
 * resolves `understood`. Also extends the streak, per the write table in API.md.
 *
 * Answering "no" is not a failure state. It records the answer and the client
 * follows up asking for a different approach; the explanation stays retrievable
 * either way.
 */
export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return badRequest('Expected a JSON body');

  const explanationId = requireNumber(body, 'explanationId');
  const understood = requireBoolean(body, 'understood');
  if (!explanationId) return badRequest('explanationId is required');
  if (understood === null) return badRequest('understood must be a boolean');

  const studentId = getCurrentStudentId();
  const explanation = await setUnderstood(studentId, explanationId, understood);
  if (!explanation) return notFound('Explanation not found');

  const streak = await extendStreak(studentId);

  return NextResponse.json({ success: true, understood: explanation.understood, streak });
}
