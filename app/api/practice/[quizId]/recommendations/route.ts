import { NextResponse } from 'next/server';
import { badRequest, notFound } from '@/lib/api';
import { getQuiz, getQuizRecommendations } from '@/lib/db/practice';
import { getCurrentStudentId } from '@/lib/session';

/**
 * Never prerendered. Route handlers with no dynamic marker are candidates for
 * build-time evaluation, which would run this query against a database that
 * holds only seed data — and cache the result forever.
 */
export const dynamic = 'force-dynamic';

/**
 * GET /api/practice/:quizId/recommendations — PRD 7.3
 *
 * Based on the specific topics missed in this quiz, never generic advice. Each
 * one carries the reason it was made, so a recommendation stays as explainable
 * as an answer.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ quizId: string }> }) {
  const { quizId: quizIdText } = await params;
  const quizId = Number(quizIdText);
  if (!Number.isInteger(quizId) || quizId <= 0) return badRequest('Invalid quiz id');

  const studentId = getCurrentStudentId();

  // Confirm the quiz belongs to this student before returning anything derived
  // from it (rules/SECURITY.md).
  if (!await getQuiz(studentId, quizId)) return notFound('Quiz not found');

  return NextResponse.json({ recommendations: await getQuizRecommendations(studentId, quizId) });
}
