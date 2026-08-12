import 'server-only';
import { getDb, nowIso, queryAll, queryOne } from './client';
import type { Progress, Recommendation, Student, TopicStatus } from './types';

/**
 * Progress Tracking — PRD 7.4.
 *
 * The weakest-specified feature: PRD section 12 records that it was never
 * diagrammed as its own flow, so this is built from the written requirements
 * and the journey map. Expect rework once that flow exists.
 *
 * Two rules shape everything here. PRD 7.4 requires weak areas be visible
 * individually rather than folded into one overall score, and prompt section 12
 * forbids using performance data to say anything about a student's ability, so
 * every value carries the evidence behind it rather than a verdict.
 */

export interface TopicProgressDto {
  id: number;
  topic: string;
  status: TopicStatus;
  isWeakArea: boolean;
  lastStudiedAt: string | null;
  /** Evidence from the most recent completed quiz on this topic, if any. */
  latestQuiz: QuizEvidence | null;
}

export interface QuizEvidence {
  quizId: number;
  missed: number;
  total: number;
  completedAt: string | null;
}

export interface ProgressOverview {
  streak: number;
  lastActiveOn: string | null;
  topics: TopicProgressDto[];
  completedTopics: string[];
  weakAreas: TopicProgressDto[];
  recentQuizzes: QuizEvidence[];
}

interface QuizEvidenceRow {
  quiz_id: number;
  topic: string | null;
  subject: string;
  missed: number;
  total: number;
  completed_at: string | null;
}

/**
 * Per-quiz question counts, newest first.
 *
 * One grouped query rather than one per quiz; the N+1 shape is what turns this
 * page slow once a student has a term's worth of history.
 */
function quizEvidence(studentId: number): QuizEvidenceRow[] {
  return queryAll<QuizEvidenceRow>(
    `SELECT q.id                                              AS quiz_id,
            q.topic                                           AS topic,
            q.subject                                         AS subject,
            SUM(CASE WHEN qq.is_correct = 0 THEN 1 ELSE 0 END) AS missed,
            COUNT(qq.id)                                      AS total,
            q.completed_at                                    AS completed_at
       FROM quizzes q
       JOIN quiz_questions qq ON qq.quiz_id = q.id
      WHERE q.student_id = ? AND q.completed_at IS NOT NULL
      GROUP BY q.id
      ORDER BY q.completed_at DESC`,
    studentId
  );
}

export function getProgressOverview(studentId: number): ProgressOverview {
  const student = queryOne<Student>('SELECT * FROM students WHERE id = ?', studentId);
  const rows = queryAll<Progress>(
    'SELECT * FROM progress WHERE student_id = ? ORDER BY topic',
    studentId
  );

  const evidence = quizEvidence(studentId);

  // Newest quiz per topic. Quizzes are already ordered newest first, so the
  // first sighting of a topic wins.
  const latestByTopic = new Map<string, QuizEvidenceRow>();
  for (const row of evidence) {
    const key = (row.topic ?? row.subject).toLowerCase();
    if (!latestByTopic.has(key)) latestByTopic.set(key, row);
  }

  const topics: TopicProgressDto[] = rows.map((row) => {
    const match = latestByTopic.get(row.topic.toLowerCase());
    return {
      id: row.id,
      topic: row.topic,
      status: row.status,
      isWeakArea: row.is_weak_area === 1,
      lastStudiedAt: row.last_studied_at,
      latestQuiz: match
        ? {
            quizId: match.quiz_id,
            missed: match.missed,
            total: match.total,
            completedAt: match.completed_at,
          }
        : null,
    };
  });

  return {
    streak: student?.streak_count ?? 0,
    lastActiveOn: student?.last_active_on ?? null,
    topics,
    completedTopics: topics.filter((t) => t.status === 'completed').map((t) => t.topic),
    // Individually, never rolled into a single score (PRD 7.4).
    weakAreas: topics.filter((t) => t.isWeakArea),
    recentQuizzes: evidence.slice(0, 5).map((row) => ({
      quizId: row.quiz_id,
      missed: row.missed,
      total: row.total,
      completedAt: row.completed_at,
    })),
  };
}

/**
 * The only direct write to `progress`: the student marking a topic themselves.
 * Everything else is a side effect of studying, see the write table in API.md.
 */
export function setTopicStatus(
  studentId: number,
  topic: string,
  status: TopicStatus
): Progress | undefined {
  const stamp = nowIso();

  getDb()
    .prepare(
      `INSERT INTO progress (student_id, topic, status, last_studied_at, is_weak_area, created_at, updated_at)
       VALUES (?, ?, ?, NULL, 0, ?, ?)
       ON CONFLICT (student_id, topic) DO UPDATE SET
         status     = excluded.status,
         updated_at = excluded.updated_at`
    )
    .run(studentId, topic, status, stamp, stamp);

  return queryOne<Progress>(
    'SELECT * FROM progress WHERE student_id = ? AND topic = ?',
    studentId,
    topic
  );
}

/**
 * Recommendations from a general progress review rather than a specific quiz,
 * the `based_on_quiz_id IS NULL` case the data model allows for and that no
 * route could previously produce.
 */
export function getGeneralRecommendations(studentId: number, limit = 10): Recommendation[] {
  return queryAll<Recommendation>(
    `SELECT * FROM recommendations
      WHERE student_id = ? AND based_on_quiz_id IS NULL
      ORDER BY created_at DESC
      LIMIT ?`,
    studentId,
    limit
  );
}
