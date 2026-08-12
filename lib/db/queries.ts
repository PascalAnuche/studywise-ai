import 'server-only';
import { queryAll, queryOne } from './client';
import type { Explanation, Progress, Recommendation, Student, StudyPlan } from './types';

/**
 * Read helpers. Every query is scoped by student_id, per .agents/rules/SECURITY.md:
 * no cross-student reads without dedicated admin tooling, which is not in v1.
 */

export function getStudent(studentId: number): Student | undefined {
  return queryOne<Student>('SELECT * FROM students WHERE id = ?', studentId);
}

export function getActivePlans(studentId: number): StudyPlan[] {
  return queryAll<StudyPlan>(
    "SELECT * FROM study_plans WHERE student_id = ? AND status = 'active' ORDER BY updated_at DESC",
    studentId
  );
}

export function getProgress(studentId: number): Progress[] {
  return queryAll<Progress>('SELECT * FROM progress WHERE student_id = ? ORDER BY topic', studentId);
}

export function getRecentExplanations(studentId: number, limit = 5): Explanation[] {
  return queryAll<Explanation>(
    'SELECT * FROM explanations WHERE student_id = ? ORDER BY created_at DESC LIMIT ?',
    studentId,
    limit
  );
}

export function getRecommendations(studentId: number, limit = 5): Recommendation[] {
  return queryAll<Recommendation>(
    'SELECT * FROM recommendations WHERE student_id = ? ORDER BY created_at DESC LIMIT ?',
    studentId,
    limit
  );
}

/**
 * Quiz questions the student has actually answered.
 *
 * Home labels this "Questions Solved", so it counts questions with an answer
 * recorded, not explanations. Using the comprehension count here would put a
 * number under a label that does not describe it.
 */
export function getQuestionsAnswered(studentId: number): number {
  return (
    queryOne<{ n: number }>(
      `SELECT COUNT(*) AS n
         FROM quiz_questions qq
         JOIN quizzes q ON q.id = qq.quiz_id
        WHERE q.student_id = ? AND qq.student_answer IS NOT NULL`,
      studentId
    )?.n ?? 0
  );
}

/**
 * Comprehension rate for the PRD section 3 metric. Only rows where the
 * checkpoint was actually answered count: a null `understood` means the student
 * abandoned the question, which is not the same as "did not understand".
 */
export function getComprehensionRate(studentId: number): { answered: number; understood: number } {
  return (
    queryOne<{ answered: number; understood: number }>(
      `SELECT COUNT(*) AS answered, COALESCE(SUM(understood), 0) AS understood
         FROM explanations
        WHERE student_id = ? AND understood IS NOT NULL`,
      studentId
    ) ?? { answered: 0, understood: 0 }
  );
}
