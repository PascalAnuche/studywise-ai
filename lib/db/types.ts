/** Row types mirroring lib/db/schema.sql and .agents/docs/DATA_MODEL.md. */

/**
 * Prompt section 9. Stored verbatim, so these strings are a data contract, not
 * display labels. Note the spec's section 9 prose says "one valid
 * interpretation" while DATA_MODEL.md, COMPONENTS.md and DESIGN_SYSTEM.md all
 * say "one interpretation". Using the docs' spelling because it is the stored
 * enum in three engineering documents; tracked in AGENTS.md. If the prompt's
 * wording wins instead, change it here, in schema.sql, and in the badge labels.
 */
export const CONFIDENCE_VALUES = [
  'well-established',
  'one interpretation',
  'worth verifying',
] as const;

export type Confidence = (typeof CONFIDENCE_VALUES)[number];

export function isConfidence(value: unknown): value is Confidence {
  return typeof value === 'string' && (CONFIDENCE_VALUES as readonly string[]).includes(value);
}

/** Null means the understanding checkpoint has not been answered. Never coerce to 0. */
export type Understood = 0 | 1 | null;

export interface Student {
  id: number;
  name: string;
  email: string;
  discipline: string | null;
  streak_count: number;
  last_active_on: string | null;
  created_at: string;
}

export type PlanStatus = 'draft' | 'active' | 'completed';

export interface StudyPlan {
  id: number;
  student_id: number;
  subject: string;
  goals: string | null;
  topics: string | null;
  frequency: string | null;
  start_date: string | null;
  end_date: string | null;
  status: PlanStatus;
  understood: Understood;
  created_at: string;
  updated_at: string;
}

export interface Explanation {
  id: number;
  student_id: number;
  subject: string | null;
  question: string;
  answer: string;
  reasoning: string;
  confidence: Confidence;
  understood: Understood;
  created_at: string;
}

export interface FollowUpQuestion {
  id: number;
  explanation_id: number;
  question: string;
  answer: string;
  reasoning: string;
  confidence: Confidence;
  created_at: string;
}

export interface Quiz {
  id: number;
  student_id: number;
  subject: string;
  topic: string | null;
  difficulty: string;
  score: number | null;
  completed_at: string | null;
  created_at: string;
}

export interface QuizQuestion {
  id: number;
  quiz_id: number;
  question_text: string;
  options: string | null;
  correct_answer: string;
  reasoning: string;
  student_answer: string | null;
  is_correct: 0 | 1 | null;
  explanation_id: number | null;
  created_at: string;
}

export type TopicStatus = 'not_started' | 'in_progress' | 'completed';

export interface Progress {
  id: number;
  student_id: number;
  topic: string;
  status: TopicStatus;
  last_studied_at: string | null;
  is_weak_area: 0 | 1;
  created_at: string;
  updated_at: string;
}

export interface Recommendation {
  id: number;
  student_id: number;
  based_on_quiz_id: number | null;
  topic: string;
  reason: string;
  created_at: string;
}
