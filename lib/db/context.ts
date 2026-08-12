import 'server-only';
import { queryAll, queryOne } from './client';
import type { StudentContext } from '@/lib/ai/types';
import type { Progress, Quiz, Student, StudyPlan } from './types';

/**
 * Assembles the Input Context Variables from prompt section 8.
 *
 * Anything the database doesn't hold is left empty rather than defaulted, so
 * the assistant treats it as unknown instead of inventing a value. Section 7
 * requires it to say when it can't access context rather than fabricating it.
 *
 * Section 12 also applies: this is the boundary that decides how much of a
 * student's record leaves the server, so it sends the minimum each request
 * needs rather than the whole history.
 */
export function buildStudentContext(studentId: number): StudentContext {
  const student = queryOne<Student>('SELECT * FROM students WHERE id = ?', studentId);

  const progress = queryAll<Progress>(
    'SELECT * FROM progress WHERE student_id = ? ORDER BY updated_at DESC',
    studentId
  );

  const plans = queryAll<StudyPlan>(
    "SELECT * FROM study_plans WHERE student_id = ? AND status = 'active'",
    studentId
  );

  const quizzes = queryAll<Quiz>(
    'SELECT * FROM quizzes WHERE student_id = ? ORDER BY created_at DESC LIMIT 3',
    studentId
  );

  return {
    studentId,
    discipline: student?.discipline ?? null,
    currentTopics: progress.filter((p) => p.status === 'in_progress').map((p) => p.topic),
    completedTopics: progress.filter((p) => p.status === 'completed').map((p) => p.topic),
    weakAreas: progress.filter((p) => p.is_weak_area === 1).map((p) => p.topic),
    activePlans: plans.map((plan) => ({
      subject: plan.subject,
      topics: parseJsonArray(plan.topics),
      frequency: plan.frequency,
    })),
    recentQuizzes: quizzes.map((quiz) => ({
      subject: quiz.subject,
      topic: quiz.topic,
      score: quiz.score,
    })),
    streak: student?.streak_count ?? null,
  };
}

/** Topics and goals are stored as JSON text; bad data degrades to empty, never throws. */
function parseJsonArray(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}
