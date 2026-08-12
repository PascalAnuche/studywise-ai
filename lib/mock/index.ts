/**
 * Mock data for the features the backend does not model yet.
 *
 * Resources (flow 4), Notes and Flashcards (flow 5), Achievements (flow 7) and
 * Settings (flow 8) have no tables. Rather than leave four destinations empty
 * until the backend restructure, they render from here.
 *
 * Three rules keep this honest:
 *
 * 1. **Everything is in this one module.** No fixture is inlined in a
 *    component, so `rm -r lib/mock` plus the type errors that follow is an
 *    exact inventory of what still needs a real source.
 * 2. **The shapes are the ones the real queries should return**, so swapping
 *    the source is a change of import, not a rewrite of the page.
 * 3. **It is consistent with the seed.** The topics, subjects and dates here
 *    match `scripts/seed.mjs`, because a demo that contradicts itself is worse
 *    than an empty one.
 *
 * Nothing here is written to, and nothing here is presented as the student's
 * real record anywhere it could mislead.
 */

const daysAgo = (n: number) => new Date(Date.now() - n * 864e5).toISOString();

// ---------------------------------------------------------------------------
// Flow 4 — Resources & Upload Materials
// ---------------------------------------------------------------------------

export type MaterialKind = 'lecture-notes' | 'slides' | 'past-exam' | 'pdf';
export type MaterialStatus = 'ready' | 'processing';

export interface MockMaterial {
  id: number;
  title: string;
  kind: MaterialKind;
  subject: string;
  sizeLabel: string;
  pages: number | null;
  status: MaterialStatus;
  uploadedAt: string;
}

export const MOCK_MATERIALS: MockMaterial[] = [
  { id: 1, title: 'Data Structures — Lecture Notes Week 1-6', kind: 'lecture-notes', subject: 'Data Structures', sizeLabel: '2.4 MB', pages: 48, status: 'ready', uploadedAt: daysAgo(18) },
  { id: 2, title: 'Arrays and Linked Lists — Slides', kind: 'slides', subject: 'Data Structures', sizeLabel: '5.1 MB', pages: 32, status: 'ready', uploadedAt: daysAgo(12) },
  { id: 3, title: 'Algorithms Past Paper 2025', kind: 'past-exam', subject: 'Data Structures', sizeLabel: '780 KB', pages: 12, status: 'ready', uploadedAt: daysAgo(9) },
  { id: 4, title: 'Operating Systems — Chapter 7', kind: 'pdf', subject: 'Operating Systems', sizeLabel: '1.9 MB', pages: 26, status: 'ready', uploadedAt: daysAgo(5) },
  { id: 5, title: 'Hash Tables — Seminar Handout', kind: 'lecture-notes', subject: 'Data Structures', sizeLabel: '640 KB', pages: 8, status: 'ready', uploadedAt: daysAgo(3) },
  { id: 6, title: 'Dynamic Programming — Worked Examples', kind: 'pdf', subject: 'Data Structures', sizeLabel: '1.2 MB', pages: 15, status: 'processing', uploadedAt: daysAgo(0) },
];

export const MATERIAL_KIND_LABEL: Record<MaterialKind, string> = {
  'lecture-notes': 'Lecture notes',
  slides: 'Slides',
  'past-exam': 'Past exam',
  pdf: 'PDF',
};

// ---------------------------------------------------------------------------
// Flow 5 — Notes
// ---------------------------------------------------------------------------

export interface MockNote {
  id: number;
  title: string;
  subject: string;
  excerpt: string;
  wordCount: number;
  updatedAt: string;
}

export const MOCK_NOTES: MockNote[] = [
  { id: 1, title: 'Arrays vs Linked Lists', subject: 'Data Structures', excerpt: 'Contiguous vs non-contiguous. Index access is O(1) for arrays because the address is arithmetic, not a walk.', wordCount: 320, updatedAt: daysAgo(6) },
  { id: 2, title: 'Recursion — base cases', subject: 'Data Structures', excerpt: 'Every recursive call must move toward the base case. If it does not, the stack is the thing that stops you.', wordCount: 210, updatedAt: daysAgo(5) },
  { id: 3, title: 'Big-O cheat sheet', subject: 'Data Structures', excerpt: 'Growth, not constants. O(n log n) beats O(n^2) eventually, and "eventually" is the whole caveat.', wordCount: 145, updatedAt: daysAgo(4) },
  { id: 4, title: 'Hash collisions', subject: 'Data Structures', excerpt: 'Chaining vs open addressing. Collisions are guaranteed by pigeonhole, so the question is only how you resolve them.', wordCount: 260, updatedAt: daysAgo(4) },
  { id: 5, title: 'Process states', subject: 'Operating Systems', excerpt: 'New, ready, running, waiting, terminated. The scheduler only ever moves things between ready and running.', wordCount: 180, updatedAt: daysAgo(2) },
  { id: 6, title: 'Memoisation vs tabulation', subject: 'Data Structures', excerpt: 'Same cache, opposite direction. Top-down starts at the answer; bottom-up starts at the base.', wordCount: 240, updatedAt: daysAgo(1) },
];

// ---------------------------------------------------------------------------
// Flow 5 — Flashcards
// ---------------------------------------------------------------------------

export interface MockFlashcardSet {
  id: number;
  title: string;
  subject: string;
  cardCount: number;
  /** Cards answered "knew it" on the last pass. */
  known: number;
  /** Cards marked for review rather than dropped. */
  forReview: number;
  lastReviewedAt: string | null;
}

export const MOCK_FLASHCARD_SETS: MockFlashcardSet[] = [
  { id: 1, title: 'Arrays Basics', subject: 'Data Structures', cardCount: 12, known: 10, forReview: 2, lastReviewedAt: daysAgo(6) },
  { id: 2, title: 'Linked Lists', subject: 'Data Structures', cardCount: 14, known: 11, forReview: 3, lastReviewedAt: daysAgo(5) },
  { id: 3, title: 'Big-O notation', subject: 'Data Structures', cardCount: 10, known: 6, forReview: 4, lastReviewedAt: daysAgo(4) },
  { id: 4, title: 'Hash Tables', subject: 'Data Structures', cardCount: 16, known: 9, forReview: 7, lastReviewedAt: daysAgo(4) },
  { id: 5, title: 'Recursion patterns', subject: 'Data Structures', cardCount: 18, known: 15, forReview: 3, lastReviewedAt: daysAgo(3) },
  { id: 6, title: 'Scheduling algorithms', subject: 'Operating Systems', cardCount: 11, known: 7, forReview: 4, lastReviewedAt: daysAgo(2) },
  { id: 7, title: 'Dynamic programming', subject: 'Data Structures', cardCount: 15, known: 0, forReview: 0, lastReviewedAt: null },
];

// ---------------------------------------------------------------------------
// Flow 7 — Achievements
// ---------------------------------------------------------------------------

export interface MockAchievement {
  id: number;
  title: string;
  /**
   * States what was done, never what it says about the student. Prompt section
   * 12 governs every string on the Achievements screen.
   */
  detail: string;
  earnedAt: string | null;
  /** Progress toward an achievement not yet earned. */
  progress: { current: number; target: number } | null;
}

export const MOCK_ACHIEVEMENTS: MockAchievement[] = [
  { id: 1, title: '7 Day Streak', detail: 'Studied on seven consecutive days.', earnedAt: daysAgo(5), progress: null },
  { id: 2, title: 'Topic Explorer', detail: 'Worked through five different topics.', earnedAt: daysAgo(4), progress: null },
  { id: 3, title: 'Quiz Master', detail: 'Scored 80% or higher on a quiz.', earnedAt: daysAgo(5), progress: null },
  { id: 4, title: 'Deep Diver', detail: 'Asked a follow-up on five saved explanations.', earnedAt: daysAgo(2), progress: null },
  { id: 5, title: '14 Day Streak', detail: 'Study on fourteen consecutive days.', earnedAt: null, progress: { current: 12, target: 14 } },
  { id: 6, title: 'Full Set', detail: 'Complete every topic on one study plan.', earnedAt: null, progress: { current: 8, target: 10 } },
];

// ---------------------------------------------------------------------------
// Flow 1 — Source citations
// ---------------------------------------------------------------------------

/**
 * Citations shown under an answer.
 *
 * Mock, because no provider returns them yet and there is no column to store
 * them in. This is the one fixture that could actually mislead: a fabricated
 * citation on a product built around verifiability is worse than no citation.
 * It is therefore rendered only where the page is labelled as sample data, and
 * `AssistantRail` on Home still shows nothing rather than these.
 */
export interface MockSource {
  label: string;
  href: string;
}

export const MOCK_SOURCES: MockSource[] = [
  { label: 'GeeksforGeeks', href: 'https://www.geeksforgeeks.org/' },
  { label: 'Programiz', href: 'https://www.programiz.com/' },
  { label: 'TutorialsPoint', href: 'https://www.tutorialspoint.com/' },
  { label: 'MIT OpenCourseWare', href: 'https://ocw.mit.edu/' },
  { label: 'CLRS, 3rd edition', href: 'https://mitpress.mit.edu/' },
];

// ---------------------------------------------------------------------------
// Flow 6 — Progress panels
// ---------------------------------------------------------------------------

/**
 * Strengths and areas to improve.
 *
 * Mock: nothing derives these yet.
 *
 * The approved design phrases one strength as "You score higher than 80% of
 * users". That is a comparison against other students, which prompt section 12
 * rules out, so the wording here describes the student's own record instead.
 * The card, its title and its position are exactly as designed. Flagged in
 * AGENTS.md.
 */
export interface MockInsight {
  id: string;
  title: string;
  detail: string;
  icon: 'check-circle' | 'shield' | 'trend-up' | 'learn' | 'plan' | 'notes';
  /** Tint of the icon square, as designed. Keys into `color.event.*`. */
  tone: 'green' | 'blue' | 'amber' | 'rose';
}

export const MOCK_STRENGTHS: MockInsight[] = [
  { id: 'consistent', title: 'Consistent Learner', detail: 'You study regularly and stay consistent.', icon: 'check-circle', tone: 'green' },
  { id: 'quiz', title: 'Quiz Master', detail: 'You scored 80% or higher on 4 of your 6 quizzes.', icon: 'shield', tone: 'blue' },
  { id: 'improver', title: 'Quick Improver', detail: 'Your progress is better than last month.', icon: 'trend-up', tone: 'green' },
];

export const MOCK_IMPROVEMENTS: MockInsight[] = [
  { id: 'algorithms', title: 'Algorithms', detail: 'Practice more on sorting algorithms.', icon: 'learn', tone: 'blue' },
  { id: 'os', title: 'Operating Systems', detail: 'Focus on memory management.', icon: 'plan', tone: 'amber' },
  { id: 'db', title: 'Database Systems', detail: 'Review normalization concepts.', icon: 'notes', tone: 'rose' },
];

export type { ChartTone } from '../tones';
import type { ChartTone } from '../tones';

/** Per-subject rollup for the Subject Performance table. */
export interface MockSubjectPerformance {
  subject: string;
  studyTime: string;
  studyMinutes: number;
  topicsLearned: number;
  questionsSolved: number;
  averageScore: number | null;
  progressPercent: number;
  /**
   * Dot beside the subject in the Subject Performance table.
   *
   * The design gives the table and the donut different hues for the same
   * subject — Algorithms is teal in the table and magenta in the donut, and
   * Operating Systems is amber in the table and teal in the donut. Both are
   * reproduced rather than reconciled, so `tone` and `chartTone` are separate.
   * Worth settling before this stops being mock data; noted in AGENTS.md.
   */
  tone: ChartTone;
  /** Slice colour in the Time by Subject donut. */
  chartTone: ChartTone;
  /**
   * Whether the subject counts toward the weekly Study Time figure and the
   * Time by Subject donut.
   *
   * Computer Networks is tracked in the table but sits outside both, which is
   * what makes the design's donut show four slices totalling 14h 30m while the
   * table lists five subjects.
   */
  inWeeklyTotal: boolean;
}

export const MOCK_SUBJECT_PERFORMANCE: MockSubjectPerformance[] = [
  { subject: 'Data Structures', studyTime: '6h 20m', studyMinutes: 380, topicsLearned: 4, questionsSolved: 24, averageScore: 86, progressPercent: 72, tone: 'indigo', chartTone: 'indigo', inWeeklyTotal: true },
  { subject: 'Algorithms', studyTime: '4h 10m', studyMinutes: 250, topicsLearned: 2, questionsSolved: 18, averageScore: 78, progressPercent: 58, tone: 'teal', chartTone: 'magenta', inWeeklyTotal: true },
  { subject: 'Operating Systems', studyTime: '2h 30m', studyMinutes: 150, topicsLearned: 1, questionsSolved: 9, averageScore: 81, progressPercent: 45, tone: 'amber', chartTone: 'teal', inWeeklyTotal: true },
  { subject: 'Database Systems', studyTime: '1h 30m', studyMinutes: 90, topicsLearned: 1, questionsSolved: 5, averageScore: 75, progressPercent: 38, tone: 'magenta', chartTone: 'red', inWeeklyTotal: true },
  { subject: 'Computer Networks', studyTime: '45m', studyMinutes: 45, topicsLearned: 0, questionsSolved: 0, averageScore: null, progressPercent: 12, tone: 'blue', chartTone: 'blue', inWeeklyTotal: false },
];

/**
 * The five headline figures, exactly as the design states them.
 *
 * Given rather than derived: the design's Average Score (82%) is not the mean
 * of its own table, so deriving it would quietly contradict the mockup. When
 * these come from real queries the derivation replaces the literal.
 */
export const MOCK_PROGRESS_STATS = {
  studyTime: '14h 30m',
  topicsLearned: 8,
  questionsSolved: 56,
  quizzesTaken: 6,
  averageScore: 82,
  deltas: {
    studyTime: '12% vs last week',
    topicsLearned: '2 vs last week',
    questionsSolved: '18 vs last week',
    quizzesTaken: '1 vs last week',
    averageScore: '9% vs last week',
  },
};

/** Minutes studied per weekday, Monday first, for the Study Time Overview. */
export const MOCK_STUDY_TIME_BY_DAY: { day: string; minutes: number }[] = [
  { day: 'Mon', minutes: 130 },
  { day: 'Tue', minutes: 300 },
  { day: 'Wed', minutes: 195 },
  { day: 'Thu', minutes: 130 },
  { day: 'Fri', minutes: 245 },
  { day: 'Sat', minutes: 90 },
  { day: 'Sun', minutes: 150 },
];

// ---------------------------------------------------------------------------
// Flow 8 — Settings
// ---------------------------------------------------------------------------

export interface MockPreference {
  id: string;
  label: string;
  description: string;
  value: string;
  kind: 'toggle' | 'choice';
}

export const MOCK_PREFERENCES: MockPreference[] = [
  { id: 'reminders', label: 'Study reminders', description: 'A daily nudge at the time you choose.', value: 'Daily at 08:00', kind: 'toggle' },
  { id: 'response-style', label: 'AI response style', description: 'How much detail an answer carries by default.', value: 'Detailed', kind: 'choice' },
  { id: 'language', label: 'Language', description: 'Interface and assistant language.', value: 'English (UK)', kind: 'choice' },
  { id: 'quiz-difficulty', label: 'Default quiz difficulty', description: 'Used when you generate a quiz without choosing.', value: 'Medium', kind: 'choice' },
];

export const MOCK_PRIVACY: { label: string; detail: string }[] = [
  { label: 'What is stored', detail: 'Saved explanations, study plans, quiz results and progress. Nothing else.' },
  { label: 'Who can see it', detail: 'Only you. Study data is never surfaced to another student.' },
  { label: 'Ability inferences', detail: 'Never made. Your record describes work done, not what you are capable of.' },
  { label: 'Removing your data', detail: 'Any saved explanation, plan or material can be deleted, and deletion is permanent.' },
];

// ---------------------------------------------------------------------------
// Per-screen fixtures, split out once they outgrew a section here.
// Re-exported so `@/lib/mock` stays the single import for every screen, and
// `rm -r lib/mock` stays an exact inventory of what needs a real source.
// ---------------------------------------------------------------------------

export * from './resources';
export * from './flashcards';
export * from './notes';
