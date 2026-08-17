import type { ChartTone } from '../tones';

/**
 * Flow 7 — Achievements, to the approved design.
 *
 * Prompt section 12 governs every string here. A badge states what was done
 * ("Study for 7 days in a row"), never what it says about the student, and no
 * figure on this screen is a comparison against anybody else.
 *
 * The design's fourth tab is a Leaderboard. That is a ranking of students
 * against each other, which section 12 rules out, so the tab keeps its place
 * and its panel explains what is shown instead. Flagged in AGENTS.md.
 */

export interface AchievementStat {
  id: string;
  icon: 'achievements' | 'target' | 'flame' | 'clock' | 'star';
  value: string;
  label: string;
  delta: string;
  tone: ChartTone;
}

export const MOCK_ACHIEVEMENT_STATS: AchievementStat[] = [
  { id: 'badges', icon: 'achievements', value: '23', label: 'Badges Earned', delta: '+4 this month', tone: 'indigo' },
  { id: 'milestones', icon: 'target', value: '12', label: 'Milestones Reached', delta: '+2 this month', tone: 'teal' },
  { id: 'streak', icon: 'flame', value: '12', label: 'Day Study Streak', delta: 'Best: 21 days', tone: 'amber' },
  { id: 'time', icon: 'clock', value: '134h', label: 'Total Study Time', delta: '+18h this month', tone: 'blue' },
  { id: 'points', icon: 'star', value: '8,450', label: 'Points Earned', delta: '+950 this month', tone: 'magenta' },
];

export type BadgeCategory = 'learning' | 'consistency' | 'exploration';

export interface Badge {
  id: string;
  title: string;
  /** What earns it. A description of work, never of the person. */
  requirement: string;
  icon: 'book' | 'flame' | 'target' | 'clock' | 'layers' | 'star' | 'lock' | 'medal';
  tone: ChartTone;
  category: BadgeCategory;
  earnedOn: string | null;
  /** Set only while unearned, so the card can show how far along it is. */
  progress: { current: number; target: number; unit: string } | null;
}

export const MOCK_BADGES: Badge[] = [
  { id: 'first-steps', title: 'First Steps', requirement: 'Create your first note', icon: 'book', tone: 'indigo', category: 'learning', earnedOn: 'May 5, 2024', progress: null },
  { id: 'consistent', title: 'Consistent Learner', requirement: 'Study for 7 days in a row', icon: 'flame', tone: 'teal', category: 'consistency', earnedOn: 'May 10, 2024', progress: null },
  { id: 'quiz-master', title: 'Quiz Master', requirement: 'Complete 10 quizzes', icon: 'target', tone: 'amber', category: 'learning', earnedOn: 'May 12, 2024', progress: null },
  { id: 'time-invested', title: 'Time Invested', requirement: 'Study for 10 hours', icon: 'clock', tone: 'blue', category: 'consistency', earnedOn: 'May 15, 2024', progress: null },
  { id: 'resource-explorer', title: 'Resource Explorer', requirement: 'Explore 10 resources', icon: 'layers', tone: 'magenta', category: 'exploration', earnedOn: 'May 18, 2024', progress: null },
  { id: 'note-taker', title: 'Note Taker', requirement: 'Create 25 notes', icon: 'star', tone: 'indigo', category: 'learning', earnedOn: 'May 20, 2024', progress: null },
  { id: 'streak-champion', title: 'Streak Champion', requirement: 'Maintain a 30-day streak', icon: 'lock', tone: 'indigo', category: 'consistency', earnedOn: null, progress: { current: 12, target: 30, unit: 'days' } },
  { id: 'knowledge-master', title: 'Knowledge Master', requirement: 'Earn 15,000 points', icon: 'medal', tone: 'indigo', category: 'exploration', earnedOn: null, progress: { current: 8450, target: 15000, unit: '' } },
];

export interface Milestone {
  id: string;
  title: string;
  date: string;
  icon: 'check-circle' | 'clock' | 'notes' | 'target' | 'plan';
  tone: ChartTone;
}

export const MOCK_MILESTONES: Milestone[] = [
  { id: 'flashcards-50', title: 'Completed 50 Flashcards', date: 'May 20, 2024', icon: 'check-circle', tone: 'teal' },
  { id: 'hours-10', title: 'Studied for 10 Hours', date: 'May 15, 2024', icon: 'clock', tone: 'blue' },
  { id: 'notes-25', title: 'Created 25 Notes', date: 'May 12, 2024', icon: 'notes', tone: 'indigo' },
  { id: 'quizzes-5', title: 'Completed 5 Quizzes', date: 'May 10, 2024', icon: 'target', tone: 'amber' },
  { id: 'first-week', title: 'First Week Completed', date: 'May 5, 2024', icon: 'plan', tone: 'magenta' },
];

/**
 * Per-subject completion. Named "Top Skills" in the design; the number is the
 * share of that subject's tracked topics completed, which is a fact about the
 * work rather than a rating of the student.
 */
export interface SkillRow {
  subject: string;
  percent: number;
  tone: ChartTone;
}

export const MOCK_TOP_SKILLS: SkillRow[] = [
  { subject: 'Data Structures', percent: 92, tone: 'indigo' },
  { subject: 'Algorithms', percent: 78, tone: 'teal' },
  { subject: 'Operating Systems', percent: 64, tone: 'amber' },
  { subject: 'Database Systems', percent: 58, tone: 'magenta' },
  { subject: 'Computer Networks', percent: 45, tone: 'blue' },
];

/**
 * Totals per category, as the design states them.
 *
 * Not derived from MOCK_BADGES, which holds only the eight the grid shows.
 * Counting those would put "All (8)" under a figure that says 23 badges
 * earned, and the two disagreeing on the same screen is worse than either.
 */
export const MOCK_BADGE_COUNTS: Record<'all' | BadgeCategory, number> = {
  all: 23,
  learning: 12,
  consistency: 7,
  exploration: 4,
};
