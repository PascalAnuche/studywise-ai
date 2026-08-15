import { NextResponse } from 'next/server';
import { badRequest, notFound, readJson, requireNumber, requireString, serverError } from '@/lib/api';
import { runExplain } from '@/lib/ai';
import { isPersistable } from '@/lib/ai/types';
import { buildStudentContext } from '@/lib/db/context';
import { getExplanationForStudent, getFollowUps, insertFollowUp } from '@/lib/db/mutations';
import { getCurrentStudentId } from '@/lib/session';

/**
 * Never prerendered. Route handlers with no dynamic marker are candidates for
 * build-time evaluation, which would run this query against a database that
 * holds only seed data — and cache the result forever.
 */
export const dynamic = 'force-dynamic';

/**
 * POST /api/assistant/follow-up — PRD 7.1
 *
 * Carries the original question and answer plus every prior follow-up, so the
 * thread never restarts from zero. This is the "no lost context" requirement.
 */
export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return badRequest('Expected a JSON body');

  const explanationId = requireNumber(body, 'explanationId');
  const question = requireString(body, 'question');
  if (!explanationId) return badRequest('explanationId is required');
  if (!question) return badRequest('question is required');

  const studentId = getCurrentStudentId();
  const explanation = getExplanationForStudent(studentId, explanationId);
  if (!explanation) return notFound('Explanation not found');

  try {
    const priorFollowUps = getFollowUps(explanationId);

    const history = [
      { question: explanation.question, answer: explanation.answer },
      ...priorFollowUps.map((f) => ({ question: f.question, answer: f.answer })),
    ];

    const result = await runExplain({
      userMessage: question,
      context: buildStudentContext(studentId),
      history,
    });

    if (!isPersistable(result)) {
      return NextResponse.json({ followUpId: null, result });
    }

    const followUp = insertFollowUp({
      explanationId,
      question,
      answer: result.answer,
      reasoning: result.reasoning,
      confidence: result.confidence,
    });

    return NextResponse.json({ followUpId: followUp.id, result });
  } catch (error) {
    console.error('assistant/follow-up failed:', error instanceof Error ? error.message : 'unknown');
    return serverError('Could not reach the assistant');
  }
}
