import type { ChartTone } from '../tones';

/**
 * Flow 8 — My Profile, to the approved design.
 *
 * The identity fields (university, course, level) have no columns on
 * `students`, which holds only name, email, discipline and the streak. They
 * come from here until the schema grows, and the two real fields on the page —
 * name and discipline — are read from the database by the page itself.
 */

export interface ProfileStat {
  id: string;
  icon: 'notes' | 'learn' | 'flame' | 'clock' | 'star';
  value: string;
  label: string;
  delta: string;
  tone: ChartTone;
}

export const MOCK_PROFILE_STATS: ProfileStat[] = [
  { id: 'notes', icon: 'notes', value: '42', label: 'Notes Created', delta: '12 this month', tone: 'indigo' },
  { id: 'saved', icon: 'learn', value: '18', label: 'Saved Explanations', delta: '4 this month', tone: 'teal' },
  { id: 'streak', icon: 'flame', value: '12', label: 'Day Streak', delta: 'Best: 21 days', tone: 'amber' },
  { id: 'time', icon: 'clock', value: '134h', label: 'Total Study Time', delta: '18h this month', tone: 'blue' },
  { id: 'points', icon: 'star', value: '8,450', label: 'Points Earned', delta: '950 this month', tone: 'magenta' },
];

export interface AboutRow {
  id: string;
  icon: 'achievements' | 'book' | 'chart' | 'star';
  label: string;
  value: string;
}

export const MOCK_ABOUT: AboutRow[] = [
  { id: 'university', icon: 'achievements', label: 'University', value: 'University of Lagos' },
  { id: 'course', icon: 'book', label: 'Course', value: 'B.Sc. Computer Science' },
  { id: 'level', icon: 'chart', label: 'Level', value: '200 Level' },
];

export const MOCK_INTERESTS = ['Algorithms', 'Data Structures', 'AI/ML', 'Web Development'];

export interface LearningGoal {
  id: string;
  title: string;
  current: number;
  target: number;
  unit: string;
  icon: 'target' | 'book' | 'practice';
  tone: ChartTone;
}

export const MOCK_LEARNING_GOALS: LearningGoal[] = [
  { id: 'hours', title: 'Study 15 hours this week', current: 12, target: 15, unit: 'hours', icon: 'target', tone: 'teal' },
  { id: 'chapters', title: 'Read 5 chapters', current: 3, target: 5, unit: 'chapters', icon: 'book', tone: 'indigo' },
  { id: 'quizzes', title: 'Take 10 practice quizzes', current: 7, target: 10, unit: 'quizzes', icon: 'practice', tone: 'amber' },
];

export interface Reminder {
  id: string;
  title: string;
  detail: string;
  on: boolean;
}

export const MOCK_REMINDERS: Reminder[] = [
  { id: 'daily', title: 'Daily Study Reminder', detail: '7:00 PM', on: true },
  { id: 'break', title: 'Break Reminder', detail: 'Every 60 mins', on: true },
  { id: 'weekly', title: 'Weekly Goal Reminder', detail: 'Every Sunday, 6:00 PM', on: true },
];

export interface ConnectedAccount {
  id: string;
  name: string;
  handle: string;
  connected: boolean;
}

export const MOCK_CONNECTED: ConnectedAccount[] = [
  { id: 'google', name: 'Google', handle: 'sarah.johnson@example.com', connected: true },
  { id: 'notion', name: 'Notion', handle: 'sarah_johnson_notion', connected: true },
];

export const MOCK_ACCOUNT = {
  plan: 'StudyWise AI Pro',
  renewsOn: 'June 12, 2024',
  location: 'Lagos, Nigeria',
  email: 'sarah.johnson@example.com',
};
