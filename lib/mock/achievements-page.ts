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
  /** What was actually done. Describes the work, never the student. */
  detail: string;
  date: string;
  icon: 'check-circle' | 'clock' | 'notes' | 'target' | 'plan';
  tone: ChartTone;
}

export const MOCK_MILESTONES: Milestone[] = [
  { id: 'explanations-20', title: 'Saved 20 Explanations', detail: 'Twenty answers kept for later review.', date: 'May 20, 2024', icon: 'check-circle', tone: 'teal' },
  { id: 'hours-10', title: 'Studied for 10 Hours', detail: 'Ten hours across Data Structures and Algorithms.', date: 'May 15, 2024', icon: 'clock', tone: 'blue' },
  { id: 'notes-25', title: 'Created 25 Notes', detail: 'Notes written across five subjects.', date: 'May 12, 2024', icon: 'notes', tone: 'indigo' },
  { id: 'quizzes-5', title: 'Completed 5 Quizzes', detail: 'Five quizzes finished and marked.', date: 'May 10, 2024', icon: 'target', tone: 'amber' },
  { id: 'first-week', title: 'First Week Completed', detail: 'Seven days of study, start to finish.', date: 'May 5, 2024', icon: 'plan', tone: 'magenta' },
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

/** Monday-first study week, for the streak panel. `done` is a day studied. */
export const MOCK_STREAK_DAYS: { day: string; done: boolean }[] = [
  { day: 'M', done: true },
  { day: 'T', done: true },
  { day: 'W', done: true },
  { day: 'T', done: true },
  { day: 'F', done: true },
  { day: 'S', done: true },
  { day: 'S', done: false },
];

/**
 * Twelve weeks of study minutes, newest last.
 *
 * Generated from the run date so the grid never goes stale, and from a fixed
 * pattern rather than Math.random so two renders of the same day agree — a
 * heatmap that reshuffles on every navigation is worse than no heatmap.
 */
export interface StudyDay {
  date: string;
  minutes: number;
}

export const MOCK_STUDY_HISTORY: StudyDay[] = (() => {
  const days: StudyDay[] = [];
  const today = new Date();
  // Start on the Monday 11 weeks back, so the grid is whole weeks.
  const start = new Date(today);
  start.setDate(today.getDate() - 83 - ((today.getDay() + 6) % 7));

  for (let i = 0; i < 84; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const weekday = (date.getDay() + 6) % 7;

    // Weekends lighter, a gap in week five, and a run of solid weeks recently.
    const gap = i >= 28 && i <= 33;
    const recent = i >= 70;
    const base = weekday >= 5 ? 25 : 55;
    const minutes = gap ? 0 : Math.round(base + (i % 7) * 9 + (recent ? 45 : 0));

    days.push({
      date: date.toISOString().slice(0, 10),
      minutes: date > today ? 0 : minutes,
    });
  }
  return days;
})();

export const MOCK_STREAK_STATS = {
  current: 12,
  best: 21,
  daysStudied: 68,
  thisMonth: 24,
};

/**
 * The Leaderboard tab, without a leaderboard.
 *
 * Prompt section 12 rules out ranking students against each other, so the
 * comparison offered instead is against the student's own record: this week,
 * last week, and their best. Every row is a fact about their own work.
 */
export interface PersonalBest {
  id: string;
  label: string;
  value: string;
  detail: string;
  icon: 'flame' | 'clock' | 'target' | 'check-circle';
  tone: ChartTone;
}

export const MOCK_PERSONAL_BESTS: PersonalBest[] = [
  { id: 'week', label: 'This week', value: '6h 10m', detail: '1h 5m more than last week', icon: 'clock', tone: 'indigo' },
  { id: 'best-week', label: 'Best week', value: '9h 45m', detail: 'Week of 4 May', icon: 'target', tone: 'teal' },
  { id: 'streak', label: 'Longest streak', value: '21 days', detail: 'Ended 2 May', icon: 'flame', tone: 'amber' },
  { id: 'topics', label: 'Topics completed', value: '18', detail: '3 in the last fortnight', icon: 'check-circle', tone: 'magenta' },
];
