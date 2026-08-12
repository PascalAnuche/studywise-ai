import { NextResponse } from 'next/server';
import { badRequest, optionalString, readJson, requireString, serverError } from '@/lib/api';
import { runExplain } from '@/lib/ai';
import { isPersistable } from '@/lib/ai/types';
import { buildStudentContext } from '@/lib/db/context';
import { insertExplanation, touchTopic } from '@/lib/db/mutations';
import { getCurrentStudentId } from '@/lib/session';

/**
 * POST /api/assistant/ask — PRD 7.1
 *
 * Mode is Explain because this is the Assistant route, never because of what
 * the question looks like (prompt section 10).
 *
 * Only an `answer` is persisted. A clarifying question isn't an explanation, and
 * section 12 forbids keeping a wellbeing escalation in the study record, so
 * those return a result with no explanationId and nothing is written.
 */
export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return badRequest('Expected a JSON body');

  const question = requireString(body, 'question');
  if (!question) return badRequest('question is required');

  const subject = optionalString(body, 'subject');
  const studentId = getCurrentStudentId();

  try {
    const context = buildStudentContext(studentId);
    const result = await runExplain({ userMessage: question, context });

    if (!isPersistable(result)) {
      return NextResponse.json({ explanationId: null, result });
    }

    const explanation = insertExplanation({
      studentId,
      subject: subject ?? context.currentTopics[0] ?? null,
      question,
      answer: result.answer,
      reasoning: result.reasoning,
      confidence: result.confidence,
    });

    // Studying a topic counts even before the checkpoint is answered. The
    // streak itself waits for the checkpoint, see the write table in API.md.
    if (explanation.subject) touchTopic(studentId, explanation.subject);

    return NextResponse.json({ explanationId: explanation.id, result });
  } catch (error) {
    // Never log the question itself, per rules/SECURITY.md.
    console.error('assistant/ask failed:', error instanceof Error ? error.message : 'unknown');
    return serverError('Could not reach the assistant');
  }
}
