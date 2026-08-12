import { NextResponse } from 'next/server';
import { getProgressOverview } from '@/lib/db/progress';
import { getCurrentStudentId } from '@/lib/session';

/**
 * GET /api/progress — PRD 7.4
 *
 * `streak` is the single value from `students.streak_count`, not an aggregate
 * over topics. Weak areas are returned individually rather than folded into one
 * score, each carrying the quiz evidence behind it.
 *
 * Scoped to the current student; studentId is never read from the query string.
 */
export async function GET() {
  const overview = getProgressOverview(getCurrentStudentId());

  return NextResponse.json({
    streak: overview.streak,
    lastActiveOn: overview.lastActiveOn,
    completedTopics: overview.completedTopics,
    weakAreas: overview.weakAreas,
    recentQuizzes: overview.recentQuizzes,
    topics: overview.topics,
  });
}
