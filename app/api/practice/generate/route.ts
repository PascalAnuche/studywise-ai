import { NextResponse } from 'next/server';
import { badRequest, optionalString, readJson, requireString, serverError } from '@/lib/api';
import { runQuiz } from '@/lib/ai';
import { isAside, isDifficulty } from '@/lib/ai/types';
import { buildStudentContext } from '@/lib/db/context';
import { insertQuiz, toQuizDto } from '@/lib/db/practice';
import { getCurrentStudentId } from '@/lib/session';

/**
 * Never prerendered. Route handlers with no dynamic marker are candidates for
 * build-time evaluation, which would run this query against a database that
 * holds only seed data — and cache the result forever.
 */
export const dynamic = 'force-dynamic';

/**
 * POST /api/practice/generate — PRD 7.3
 *
 * Difficulty is required and arrives before generation, not after. The PRD's
 * flow diagram shows it after "generate quiz", but its written requirement is
 * explicit that selection happens first, and the requirement wins: difficulty
 * chosen afterwards could only relabel a quiz, not change it.
 */
const QUESTION_COUNT = 5;

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return badRequest('Expected a JSON body');

  const subject = requireString(body, 'subject', { maxLength: 200 });
  if (!subject) return badRequest('subject is required');

  const difficulty = body.difficulty;
  if (!isDifficulty(difficulty)) {
    return badRequest('difficulty must be easy, medium, or hard');
  }

  const topic = optionalString(body, 'topic');
  const studentId = getCurrentStudentId();

  try {
    const context = await buildStudentContext(studentId);
    const result = await runQuiz({
      input: { subject, topic, difficulty, questionCount: QUESTION_COUNT },
      context,
    });

    if (isAside(result)) {
      return NextResponse.json({ quizId: null, result });
    }

    const quiz = await insertQuiz({ studentId, subject, topic, difficulty, questions: result.questions });

    // toQuizDto withholds correct answers until submission, so the answer key
    // never reaches the browser with the questions.
    return NextResponse.json({ quizId: quiz.id, quiz: toQuizDto(quiz) });
  } catch (error) {
    console.error('practice/generate failed:', error instanceof Error ? error.message : 'unknown');
    return serverError('Could not build a quiz');
  }
}
