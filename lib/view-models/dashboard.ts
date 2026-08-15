import 'server-only';
import { listPlans, toPlanDto } from '@/lib/db/planner';
import {
  getComprehensionRate,
  getProgress,
  getQuestionsAnswered,
  getRecentExplanations,
  getRecommendations,
  getStudent,
} from '@/lib/db/queries';
import type { Confidence } from '@/lib/db/types';

/**
 * Everything the dashboard needs, decided here rather than in the component.
 *
 * A view model exists so a visual overhaul can replace the page without
 * rewriting the rules. "What is next" is not styling: it is the earliest
 * scheduled session from an active plan, on or after today. That rule should
 * survive a redesign, and it will only survive if it does not live inside JSX.
 *
 * The same split makes the rules testable without rendering anything.
 */
export interface DashboardViewModel {
  firstName: string;
  greeting: string;
  streak: number;
  completedCount: number;
  trackedCount: number;
  comprehension: { understood: number; answered: number };
  nextSession: { topic: string; subject: string; durationMinutes: number } | null;
  hasActivePlan: boolean;
  weakAreas: { id: number; topic: string; status: string; lastStudiedAt: string | null }[];
  recommendations: { id: number; topic: string; reason: string }[];
  explanations: {
    id: number;
    question: string;
    confidence: Confidence;
    checkpoint: 'understood' | 'needs-another-pass' | 'unanswered';
  }[];
  /** Today's sessions across every active plan, for the Home plan card. */
  todaysSessions: {
    id: number;
    topic: string;
    subject: string;
    durationMinutes: number;
    startTime: string | null;
    focus: string;
    status: 'in-progress' | 'todo';
  }[];
  /** Weekly figures for the Home progress card. */
  weekly: {
    goalPercent: number;
    studyTime: string;
    topicsLearned: number;
    questionsSolved: number;
    trend: number[];
  };
  latestExplanation: {
    id: number;
    question: string;
    answer: string;
    reasoning: string;
    confidence: Confidence;
  } | null;
}

/**
 * Weekly goal progress.
 *
 * Sessions completed against sessions scheduled this week. Derived from the
 * plan the student actually set, so the number means something to them rather
 * than being a target the product invented.
 */
export function weeklyGoalPercent(completed: number, scheduled: number): number {
  if (scheduled <= 0) return 0;
  return Math.min(100, Math.round((completed / scheduled) * 100));
}

/** Minutes as "14h 30m", or "0m" when nothing has been studied. */
export function formatStudyTime(minutes: number): string {
  if (minutes <= 0) return '0m';
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest}m`;
  if (rest === 0) return `${hours}h`;
  return `${hours}h ${rest}m`;
}

/** Time-of-day greeting. Extracted so the page has no branching of its own. */
export function greetingFor(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/**
 * The next scheduled session across every active plan.
 *
 * Sessions with no date are excluded rather than sorted to the front: an
 * unscheduled session is not "next", it is unplanned.
 */
export function pickNextSession<T extends { scheduledFor: string | null }>(
  sessions: T[],
  today = new Date().toISOString().slice(0, 10)
): T | null {
  return (
    sessions
      .filter((session) => session.scheduledFor !== null && session.scheduledFor >= today)
      .sort((a, b) => a.scheduledFor!.localeCompare(b.scheduledFor!))[0] ?? null
  );
}

export async function buildDashboard(studentId: number): Promise<DashboardViewModel | null> {
  const student = await getStudent(studentId);
  if (!student) return null;

  /*
   * Six independent reads, issued together. Awaited in sequence they are six
   * round-trips, and against a hosted database that is the difference between
   * Home feeling instant and Home feeling slow.
   */
  const [progress, planRows, explanations, recommendations, comprehension, questionsSolved] =
    await Promise.all([
      getProgress(studentId),
      listPlans(studentId, 'active'),
      getRecentExplanations(studentId, 3),
      getRecommendations(studentId, 3),
      getComprehensionRate(studentId),
      getQuestionsAnswered(studentId),
    ]);

  const plans = planRows.map(toPlanDto);

  const sessions = plans.flatMap((plan) =>
    plan.sessions.map((session) => ({ ...session, subject: plan.subject }))
  );
  const next = pickNextSession(sessions);

  const today = new Date().toISOString().slice(0, 10);
  const todays = sessions.filter((session) => session.scheduledFor === today);

  // A week of scheduled sessions, for the goal ring. Completed is approximated
  // by sessions already past: there is no per-session completion flag yet, so
  // this is honest arithmetic on what the schema holds. See AGENTS.md.
  const weekStart = new Date(Date.now() - 6 * 864e5).toISOString().slice(0, 10);
  const thisWeek = sessions.filter(
    (session) => session.scheduledFor !== null && session.scheduledFor >= weekStart
  );
  const done = thisWeek.filter((session) => session.scheduledFor! < today);
  const studiedMinutes = done.reduce((total, session) => total + session.durationMinutes, 0);

  // Scheduled minutes per day over the last seven days. Real counts from the
  // plan, not a decorative shape: there is no daily activity log, so this is
  // the honest series the schema can actually support.
  const trend = Array.from({ length: 7 }, (_, offset) => {
    const day = new Date(Date.now() - (6 - offset) * 864e5).toISOString().slice(0, 10);
    return sessions
      .filter((session) => session.scheduledFor === day)
      .reduce((total, session) => total + session.durationMinutes, 0);
  });

  const latest = explanations[0] ?? null;

  return {
    firstName: student.name.split(' ')[0],
    greeting: greetingFor(),
    streak: student.streak_count,
    completedCount: progress.filter((p) => p.status === 'completed').length,
    trackedCount: progress.length,
    comprehension,
    nextSession: next
      ? { topic: next.topic, subject: next.subject, durationMinutes: next.durationMinutes }
      : null,
    hasActivePlan: plans.length > 0,
    weakAreas: progress
      .filter((p) => p.is_weak_area === 1)
      .map((p) => ({
        id: p.id,
        topic: p.topic,
        status: p.status.replace('_', ' '),
        lastStudiedAt: p.last_studied_at,
      })),
    recommendations: recommendations.map((r) => ({ id: r.id, topic: r.topic, reason: r.reason })),
    explanations: explanations.map((explanation) => ({
      id: explanation.id,
      question: explanation.question,
      confidence: explanation.confidence,
      // Null is its own case, never folded into "did not understand".
      checkpoint:
        explanation.understood === null
          ? 'unanswered'
          : explanation.understood === 1
            ? 'understood'
            : 'needs-another-pass',
    })),
    todaysSessions: todays.map((session, index) => ({
      id: session.id,
      topic: session.topic,
      subject: session.subject,
      durationMinutes: session.durationMinutes,
      startTime: session.startTime ?? null,
      focus: session.focus,
      // The earliest of today's sessions is the one in progress.
      status: index === 0 ? ('in-progress' as const) : ('todo' as const),
    })),
    weekly: {
      goalPercent: weeklyGoalPercent(done.length, thisWeek.length),
      studyTime: formatStudyTime(studiedMinutes),
      topicsLearned: progress.filter((p) => p.status === 'completed').length,
      questionsSolved,
      trend,
    },
    latestExplanation: latest
      ? {
          id: latest.id,
          question: latest.question,
          answer: latest.answer,
          reasoning: latest.reasoning,
          confidence: latest.confidence,
        }
      : null,
  };
}
