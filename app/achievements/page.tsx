import { getActivityStats, getMilestones, getStudyDays, getWeeklyTotals } from '@/lib/db/activity';
import { getCurrentStudentId } from '@/lib/session';
import { AchievementsBoard } from './components/AchievementsBoard';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Achievements — StudyWise AI' };

/**
 * Achievements — flow 7, built to the approved design.
 *
 * The streak, the milestones, the heatmap and the weekly totals are all derived
 * from real rows by lib/db/activity. Badges and the skill rollups still have no
 * tables and come from lib/mock; they are the only invented figures left here.
 *
 * Prompt section 12 governs every string: a badge states what was done, never
 * what it says about the student, and nothing here compares one student to
 * another. The design's Leaderboard tab is exactly that comparison, so it keeps
 * its place and its panel says what is shown instead. Flagged in AGENTS.md.
 */
export default async function AchievementsPage() {
  const studentId = getCurrentStudentId();

  // Four independent reads, issued together rather than in sequence.
  const [stats, milestones, studyDays, weekly] = await Promise.all([
    getActivityStats(studentId),
    getMilestones(studentId),
    getStudyDays(studentId, 84),
    getWeeklyTotals(studentId),
  ]);

  return (
    <AchievementsBoard
      stats={stats}
      milestones={milestones}
      studyDays={studyDays}
      weekly={weekly}
    />
  );
}
