import { NextResponse } from 'next/server';
import { badRequest, readJson, requireString, serverError } from '@/lib/api';
import { setTopicStatus } from '@/lib/db/progress';
import { getCurrentStudentId } from '@/lib/session';
import type { TopicStatus } from '@/lib/db/types';

/**
 * Never prerendered. Route handlers with no dynamic marker are candidates for
 * build-time evaluation, which would run this query against a database that
 * holds only seed data — and cache the result forever.
 */
export const dynamic = 'force-dynamic';

/**
 * POST /api/progress/topic — PRD 7.4
 *
 * The only direct write to `progress`. Everything else that touches it is a
 * side effect of studying: submitting a quiz, or answering an understanding
 * checkpoint. See the write table in API.md.
 *
 * Marking a topic is not study activity in itself, so it deliberately does not
 * extend the streak. Ticking four boxes should not look like four days of work.
 */
const STATUSES: TopicStatus[] = ['not_started', 'in_progress', 'completed'];

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return badRequest('Expected a JSON body');

  const topic = requireString(body, 'topic', { maxLength: 200 });
  if (!topic) return badRequest('topic is required');

  const status = STATUSES.find((value) => value === body.status);
  if (!status) return badRequest('status must be not_started, in_progress, or completed');

  try {
    const row = await setTopicStatus(getCurrentStudentId(), topic, status);
    if (!row) return serverError('Could not update the topic');

    return NextResponse.json({
      topic: {
        id: row.id,
        topic: row.topic,
        status: row.status,
        isWeakArea: row.is_weak_area === 1,
        lastStudiedAt: row.last_studied_at,
      },
    });
  } catch (error) {
    console.error('progress/topic failed:', error instanceof Error ? error.message : 'unknown');
    return serverError('Could not update the topic');
  }
}
