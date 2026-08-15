import { NextResponse } from 'next/server';
import { badRequest, notFound, parseAnswers, readJson } from '@/lib/api';
import { saveAnswers } from '@/lib/db/practice';
import { getCurrentStudentId } from '@/lib/session';

/**
 * Never prerendered. Route handlers with no dynamic marker are candidates for
 * build-time evaluation, which would run this query against a database that
 * holds only seed data — and cache the result forever.
 */
export const dynamic = 'force-dynamic';

/**
 * PUT /api/practice/:quizId/answers — PRD 7.3's "save questions" step.
 *
 * Saves work in progress. Scores nothing, reveals nothing, and refuses once the
 * quiz is submitted.
 *
 * The step is read as saving answers as you go. The other reading is
 * bookmarking questions for later review, which would need its own table.
 * Assumption, tracked in AGENTS.md.
 */
export async function PUT(request: Request, { params }: { params: Promise<{ quizId: string }> }) {
  const { quizId: quizIdText } = await params;
  const quizId = Number(quizIdText);
  if (!Number.isInteger(quizId) || quizId <= 0) return badRequest('Invalid quiz id');

  const body = await readJson(request);
  if (!body) return badRequest('Expected a JSON body');

  const answers = parseAnswers(body.answers);
  if (!answers) return badRequest('answers are malformed');

  const saved = await saveAnswers(getCurrentStudentId(), quizId, answers);
  if (!saved) return notFound('Quiz not found, or already submitted');

  return NextResponse.json({ saved: true });
}
