import type { ChartTone } from './index';

/**
 * Flow 5 — Flashcards, to the approved design.
 *
 * Nothing here is written to and no table backs it yet. The percentages are
 * the design's own figures; they describe cards answered correctly on the last
 * pass, never the student (prompt section 12).
 */

export interface FlashcardSetCard {
  id: string;
  title: string;
  subject: string;
  cardCount: number;
  /** Share of the set answered correctly on the last pass. */
  masteredPercent: number;
  icon: 'learn' | 'code' | 'database' | 'settings' | 'globe' | 'chart' | 'scales' | 'flashcards';
  tone: ChartTone;
  favourite: boolean;
}

export const MOCK_FLASHCARD_CARDS: FlashcardSetCard[] = [
  { id: 'ds-essentials', title: 'Data Structures Essentials', subject: 'Data Structures', cardCount: 24, masteredPercent: 75, icon: 'learn', tone: 'indigo', favourite: true },
  { id: 'sorting', title: 'Sorting Algorithms', subject: 'Algorithms', cardCount: 18, masteredPercent: 60, icon: 'code', tone: 'teal', favourite: true },
  { id: 'db-normalisation', title: 'Database Normalization', subject: 'Database Systems', cardCount: 16, masteredPercent: 90, icon: 'database', tone: 'amber', favourite: true },
  { id: 'os-concepts', title: 'Operating Systems Concepts', subject: 'Operating Systems', cardCount: 22, masteredPercent: 40, icon: 'settings', tone: 'blue', favourite: false },
  { id: 'networks', title: 'Computer Networks Basics', subject: 'Computer Networks', cardCount: 15, masteredPercent: 30, icon: 'globe', tone: 'magenta', favourite: false },
  { id: 'programming', title: 'Programming Fundamentals', subject: 'Programming', cardCount: 20, masteredPercent: 65, icon: 'code', tone: 'amber', favourite: true },
  { id: 'discrete', title: 'Discrete Mathematics', subject: 'Discrete Math', cardCount: 19, masteredPercent: 50, icon: 'scales', tone: 'indigo', favourite: false },
  { id: 'digital-logic', title: 'Digital Logic', subject: 'Computer Architecture', cardCount: 14, masteredPercent: 25, icon: 'chart', tone: 'teal', favourite: false },
];

export interface TodayStat {
  id: string;
  label: string;
  value: string;
  icon: 'flashcards' | 'target' | 'plus' | 'clock';
  tone: ChartTone;
}

export const MOCK_FLASHCARD_TODAY: TodayStat[] = [
  { id: 'reviewed', label: 'Cards Reviewed', value: '42', icon: 'flashcards', tone: 'indigo' },
  { id: 'accuracy', label: 'Accuracy', value: '85%', icon: 'target', tone: 'teal' },
  { id: 'new', label: 'New Cards', value: '18', icon: 'plus', tone: 'amber' },
  { id: 'time', label: 'Study Time', value: '12m', icon: 'clock', tone: 'blue' },
];

/** Monday-first, matching the planner. `done` is a day studied. */
export const MOCK_STREAK_DAYS: { day: string; done: boolean }[] = [
  { day: 'M', done: true },
  { day: 'T', done: true },
  { day: 'W', done: true },
  { day: 'T', done: true },
  { day: 'F', done: true },
  { day: 'S', done: true },
  { day: 'S', done: false },
];

export interface ActivityEntry {
  id: string;
  text: string;
  when: string;
  icon: 'flashcards' | 'plus' | 'check-circle';
  tone: ChartTone;
}

export const MOCK_FLASHCARD_ACTIVITY: ActivityEntry[] = [
  { id: 'a1', text: 'Reviewed Data Structures Essentials', when: 'Just now', icon: 'flashcards', tone: 'indigo' },
  { id: 'a2', text: 'Added 5 new cards to Sorting Algorithms', when: '2 hours ago', icon: 'plus', tone: 'teal' },
  { id: 'a3', text: 'Completed study session', when: 'Yesterday', icon: 'check-circle', tone: 'amber' },
];

export const MOCK_SPACED_REPETITION = {
  dueToday: 56,
  dueTomorrow: 23,
  dueThisWeek: 89,
  totalCards: 168,
  /** Cards scheduled per day, for the overview sparkline. */
  schedule: [
    { day: 'May 7', cards: 62 },
    { day: 'May 8', cards: 71 },
    { day: 'May 9', cards: 96 },
    { day: 'May 10', cards: 148 },
    { day: 'May 11', cards: 112 },
    { day: 'May 12', cards: 74 },
    { day: 'May 13', cards: 128 },
    { day: 'May 14', cards: 168 },
  ],
};
