import { getStudent } from '@/lib/db/queries';
import { getCurrentStudentId } from '@/lib/session';
import { AchievementsBoard } from './components/AchievementsBoard';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Achievements — StudyWise AI' };

/**
 * Achievements — flow 7, built to the approved design.
 *
 * The streak is real, from `students.streak_count`. Badges, milestones and the
 * skill rollups have no tables yet and come from lib/mock.
 *
 * Prompt section 12 governs every string: a badge states what was done, never
 * what it says about the student, and nothing here compares one student to
 * another. The design's Leaderboard tab is exactly that comparison, so it keeps
 * its place and its panel says what is shown instead. Flagged in AGENTS.md.
 */
export default async function AchievementsPage() {
  const student = await getStudent(getCurrentStudentId());
  return <AchievementsBoard streak={student?.streak_count ?? 0} />;
}
