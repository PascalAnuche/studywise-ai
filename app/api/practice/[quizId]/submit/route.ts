import { NextResponse } from 'next/server';
import { badRequest, notFound, parseAnswers, readJson } from '@/lib/api';
import { getQuizRecommendations, submitQuiz, toQuizDto } from '@/lib/db/practice';
import { getCurrentStudentId } from '@/lib/session';

/**
 * Never prerendered. Route handlers with no dynamic marker are candidates for
 * build-time evaluation, which would run this query against a database that
 * holds only seed data — and cache the result forever.
 */
export const dynamic = 'force-dynamic';

/**
 * POST /api/practice/:quizId/submit — PRD 7.3
 *
 * Marks the quiz, links incorrect answers back to a saved explanation where one
 * exists, updates progress and the streak, and records recommendations built
 * from the topics actually missed.
 *
 * Correct answers and their reasoning are only revealed here, once the quiz is
 * submitted, which is what makes reviewing wrong answers meaningful.
 */
export async function POST(request: Request, { params }: { params: Promise<{ quizId: string }> }) {
  const { quizId: quizIdText } = await params;
  const quizId = Number(quizIdText);
  if (!Number.isInteger(quizId) || quizId <= 0) return badRequest('Invalid quiz id');

  const body = await readJson(request);
  if (!body) return badRequest('Expected a JSON body');

  const answers = parseAnswers(body.answers);
  if (!answers) return badRequest('answers are malformed');

  const studentId = getCurrentStudentId();
  const outcome = submitQuiz(studentId, quizId, answers);
  if (!outcome) return notFound('Quiz not found, or already submitted');

  const quiz = toQuizDto(outcome.quiz);

  return NextResponse.json({
    score: outcome.score,
    quiz,
    results: quiz.questions,
    incorrectQuestions: quiz.questions.filter((question) => question.isCorrect === false),
    recommendations: getQuizRecommendations(studentId, quizId),
    streak: outcome.streak,
  });
}
