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
