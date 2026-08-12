import type { Confidence } from '@/lib/db/types';

/**
 * Prompt section 10. Mode is set by the API route that invoked the adapter and
 * is never inferred from request content, so behaviour stays predictable.
 */
export type Mode = 'explain' | 'plan' | 'track' | 'quiz';

/**
 * Prompt section 8. Every field is nullable or empty-able on purpose: absent
 * context is treated as unknown, never defaulted and never fabricated.
 */
export interface StudentContext {
  studentId: number;
  discipline: string | null;
  currentTopics: string[];
  activePlans: { subject: string; topics: string[]; frequency: string | null }[];
  recentQuizzes: { subject: string; topic: string | null; score: number | null }[];
  weakAreas: string[];
  completedTopics: string[];
  streak: number | null;
}

/**
 * Outcomes that can happen in *any* mode, not just Explain.
 *
 * A student is at least as likely to disclose exam stress while building a
 * study plan as while asking a question, so section 13 has to hold everywhere.
 * Keeping these separate from the per-mode success payloads is what lets every
 * mode return them without redefining them.
 *
 * None of these is ever persisted. Section 12 forbids retaining an escalation
 * as part of the study record, and a clarifying question is not an explanation.
 */
export type AsideResult =
  /** Section 7: one clarifying question, asked instead of guessing. */
  | { kind: 'clarify'; question: string }
  /** Section 13: wellbeing signal. Never stored, never treated as study content. */
  | { kind: 'escalation'; message: string; resources: string[] }
  /** Section 5: declining to do the work wholesale, redirecting to method. */
  | { kind: 'redirect'; message: string; suggestion: string };

/** Explain mode's success payload: the section 9 format. */
export interface AnswerResult {
  kind: 'answer';
  answer: string;
  reasoning: string;
  confidence: Confidence;
  /** Section 4: offered when it would deepen understanding. */
  followUp: FollowUpOffer | null;
}

/** One discrete, individually editable item of a study plan (PRD 7.2). */
export interface PlanSession {
  order: number;
  topic: string;
  focus: string;
  durationMinutes: number;
  /** ISO date, or null when the plan has no start date to anchor to. */
  scheduledFor: string | null;
  /** Local "HH:MM", or null when the plan has no times. */
  startTime?: string | null;
}

/**
 * Plan mode's success payload.
 *
 * No confidence value: section 9's three levels describe how settled a factual
 * claim is, and a schedule is not a factual claim. The "because" still applies,
 * it explains the sequencing.
 */
export interface PlanResult {
  kind: 'plan';
  sessions: PlanSession[];
  reasoning: string;
}

/** Structured inputs only, never free text alone (PRD 7.2). */
export interface PlanInput {
  subject: string;
  goals: string[];
  topics: string[];
  frequency: string;
  startDate: string | null;
  endDate: string | null;
}

/**
 * One generated question. `reasoning` is the because line prompt section 10
 * requires when marking: a student reviewing a wrong answer has to learn why it
 * was wrong, not just that it was.
 */
export interface QuizQuestionDraft {
  order: number;
  question: string;
  options: string[];
  correctAnswer: string;
  reasoning: string;
}

export interface QuizResult {
  kind: 'quiz';
  questions: QuizQuestionDraft[];
}

/** Chosen before generation and treated as an input, never a suggestion (PRD 7.3). */
export type Difficulty = 'easy' | 'medium' | 'hard';

export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

export function isDifficulty(value: unknown): value is Difficulty {
  return typeof value === 'string' && (DIFFICULTIES as string[]).includes(value);
}

export interface QuizInput {
  subject: string;
  topic: string | null;
  difficulty: Difficulty;
  questionCount: number;
}

export type AssistantResult = AnswerResult | AsideResult;
export type PlannerResult = PlanResult | AsideResult;
export type QuizGenerationResult = QuizResult | AsideResult;

/** Section 4's "want me to quiz you on this" / "should I add this to your plan". */
export interface FollowUpOffer {
  label: string;
  action: 'quiz' | 'plan';
  topic: string;
}

/** True only for a stored explanation. Asides and plans take other paths. */
export function isPersistable(result: AssistantResult): result is AnswerResult {
  return result.kind === 'answer';
}

/** An aside can come back from any mode, so every caller has to handle it. */
export function isAside(result: { kind: string }): result is AsideResult {
  return result.kind === 'clarify' || result.kind === 'escalation' || result.kind === 'redirect';
}

export interface ProviderRequest {
  mode: Mode;
  systemPrompt: string;
  userMessage: string;
  context: StudentContext;
  /** Prior turns, for follow-ups that must not restart from zero (PRD 7.1). */
  history: { question: string; answer: string }[];
  /** Present in Plan mode only. */
  planInput?: PlanInput;
  /** Present in Quiz mode only. */
  quizInput?: QuizInput;
}

/**
 * The only surface any provider implements. Nothing outside /lib/ai imports a
 * provider SDK, so swapping providers is a change in this folder alone.
 *
 * One method per mode rather than one general call, mirroring section 10: modes
 * do not bleed into each other, and the return type differs per mode.
 */
export interface AiProvider {
  readonly name: string;
  explain(request: ProviderRequest): Promise<AssistantResult>;
  plan(request: ProviderRequest): Promise<PlannerResult>;
  quiz(request: ProviderRequest): Promise<QuizGenerationResult>;
}
