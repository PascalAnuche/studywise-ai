import { NextResponse } from 'next/server';
import { getGeneralRecommendations } from '@/lib/db/progress';
import { getCurrentStudentId } from '@/lib/session';

/**
 * GET /api/progress/recommendations — PRD 7.4
 *
 * Recommendations from a general progress review rather than a specific quiz.
 * The data model allows `based_on_quiz_id` to be null for exactly this case,
 * and until now no route could produce or return them.
 *
 * Each carries the reason it was made, so a recommendation stays as
 * explainable as an answer.
 */
export async function GET() {
  const recommendations = getGeneralRecommendations(getCurrentStudentId());
  return NextResponse.json({ recommendations });
}
