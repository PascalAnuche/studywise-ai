import 'server-only';
import { queryAll, queryOne } from './client';

/**
 * Study activity, derived from what the database actually holds.
 *
 * The Achievements panels used to render invented figures from lib/mock. These
 * queries replace them, and everything here traces to a real row:
 *
 * - minutes come from `plan_sessions.duration_minutes`
 * - a day counts as studied once a session's slot has passed, the same
 *   approximation the planner and Home already use, because `plan_sessions`
 *   still has no completion flag (tracked in AGENTS.md)
 * - quizzes, explanations and completed topics carry their own timestamps
 *
 * Where something cannot be derived it is left out rather than filled in.
 */

/**
 * A local calendar date as `YYYY-MM-DD`.
 *
 * Not `toISOString().slice(0, 10)`: that converts to UTC first, so for anyone
 * east of Greenwich a local date near midnight comes back as the day before.
 * It put a week's sessions in the wrong bucket and made "this week" read as
 * empty while the same week showed as the best on record.
 */
function ymd(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** The Monday on or before a date. */
function mondayOf(date: Date): Date {
  const monday = new Date(date);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return monday;
}

export interface StudyDay {
  date: string;
  minutes: number;
}

/** Minutes per day across whole weeks ending today, oldest first. */
export async function getStudyDays(studentId: number, days = 84): Promise<StudyDay[]> {
  const rows = await queryAll<{ date: string; minutes: number }>(
    `SELECT ps.scheduled_for AS date, SUM(ps.duration_minutes) AS minutes
       FROM plan_sessions ps
       JOIN study_plans p ON p.id = ps.plan_id
      WHERE p.student_id = ?
        AND ps.scheduled_for IS NOT NULL
        AND ps.scheduled_for <= date('now')
        AND ps.scheduled_for >= date('now', ?)
      GROUP BY ps.scheduled_for`,
    studentId,
    `-${days} days`
  );

  const byDate = new Map(rows.map((row) => [row.date, Number(row.minutes)]));

  // Whole weeks, so the grid's columns are weeks and its rows are weekdays.
  const today = new Date();
  const from = new Date(today);
  from.setDate(today.getDate() - (days - 1));
  const start = mondayOf(from);

  const out: StudyDay[] = [];
  for (const cursor = new Date(start); cursor <= today; cursor.setDate(cursor.getDate() + 1)) {
    const date = ymd(cursor);
    out.push({ date, minutes: byDate.get(date) ?? 0 });
  }
  return out;
}

export interface ActivityStats {
  currentStreak: number;
  longestStreak: number;
  daysStudied: number;
  daysThisMonth: number;
  totalMinutes: number;
}

/**
 * `students.streak_count` is the live streak. The longest is not stored, so it
 * is computed as the longest run of consecutive study days on record.
 */
export async function getActivityStats(studentId: number): Promise<ActivityStats> {
  const [student, dates] = await Promise.all([
    queryOne<{ streak_count: number }>('SELECT streak_count FROM students WHERE id = ?', studentId),
    queryAll<{ date: string; minutes: number }>(
      `SELECT ps.scheduled_for AS date, SUM(ps.duration_minutes) AS minutes
         FROM plan_sessions ps
         JOIN study_plans p ON p.id = ps.plan_id
        WHERE p.student_id = ?
          AND ps.scheduled_for IS NOT NULL
          AND ps.scheduled_for <= date('now')
        GROUP BY ps.scheduled_for
        ORDER BY ps.scheduled_for`,
      studentId
    ),
  ]);

  let longest = 0;
  let run = 0;
  let previous: Date | null = null;

  for (const { date } of dates) {
    const day = new Date(`${date}T00:00:00`);
    const consecutive =
      previous !== null && Math.round((day.getTime() - previous.getTime()) / 864e5) === 1;
    run = consecutive ? run + 1 : 1;
    if (run > longest) longest = run;
    previous = day;
  }

  const month = ymd(new Date()).slice(0, 7);
  return {
    currentStreak: student?.streak_count ?? 0,
    longestStreak: longest,
    daysStudied: dates.length,
    daysThisMonth: dates.filter((d) => d.date.startsWith(month)).length,
    totalMinutes: dates.reduce((sum, d) => sum + Number(d.minutes), 0),
  };
}

export interface WeeklyTotals {
  thisWeek: number;
  lastWeek: number;
  bestWeek: { minutes: number; weekStart: string } | null;
}

/** Minutes this week, last week, and the best week on record. */
export async function getWeeklyTotals(studentId: number): Promise<WeeklyTotals> {
  const days = await getStudyDays(studentId, 365);

  const weeks = new Map<string, number>();
  for (const day of days) {
    const key = ymd(mondayOf(new Date(`${day.date}T00:00:00`)));
    weeks.set(key, (weeks.get(key) ?? 0) + day.minutes);
  }

  const cursor = mondayOf(new Date());
  const thisKey = ymd(cursor);
  cursor.setDate(cursor.getDate() - 7);
  const lastKey = ymd(cursor);

  let best: { minutes: number; weekStart: string } | null = null;
  for (const [weekStart, minutes] of weeks) {
    if (minutes > 0 && (!best || minutes > best.minutes)) best = { minutes, weekStart };
  }

  return { thisWeek: weeks.get(thisKey) ?? 0, lastWeek: weeks.get(lastKey) ?? 0, bestWeek: best };
}

export interface DerivedMilestone {
  id: string;
  title: string;
  detail: string;
  date: string;
  icon: 'check-circle' | 'clock' | 'target' | 'learn' | 'plan';
  tone: 'indigo' | 'teal' | 'amber' | 'magenta' | 'blue';
}

/**
 * Milestones the record can actually support, newest first.
 *
 * Only reached ones are returned. A milestone that has not happened is absent
 * rather than greyed out, because this list is a history and an unearned entry
 * is not part of one.
 */
export async function getMilestones(studentId: number): Promise<DerivedMilestone[]> {
  const [explanations, quizzes, topics, sessions] = await Promise.all([
    queryAll<{ created_at: string }>(
      'SELECT created_at FROM explanations WHERE student_id = ? ORDER BY created_at',
      studentId
    ),
    queryAll<{ completed_at: string }>(
      `SELECT completed_at FROM quizzes
        WHERE student_id = ? AND completed_at IS NOT NULL
        ORDER BY completed_at`,
      studentId
    ),
    queryAll<{ topic: string; updated_at: string }>(
      `SELECT topic, updated_at FROM progress
        WHERE student_id = ? AND status = 'completed'
        ORDER BY updated_at`,
      studentId
    ),
    queryAll<{ date: string; minutes: number }>(
      `SELECT ps.scheduled_for AS date, SUM(ps.duration_minutes) AS minutes
         FROM plan_sessions ps
         JOIN study_plans p ON p.id = ps.plan_id
        WHERE p.student_id = ?
          AND ps.scheduled_for IS NOT NULL
          AND ps.scheduled_for <= date('now')
        GROUP BY ps.scheduled_for
        ORDER BY ps.scheduled_for`,
      studentId
    ),
  ]);

  const out: DerivedMilestone[] = [];

  if (sessions[0]) {
    out.push({
      id: 'first-session',
      title: 'First study session',
      detail: 'The first session on a plan, finished.',
      date: sessions[0].date,
      icon: 'plan',
      tone: 'magenta',
    });
  }

  // The day cumulative study time first crossed ten hours.
  let running = 0;
  for (const day of sessions) {
    running += Number(day.minutes);
    if (running >= 600) {
      out.push({
        id: 'ten-hours',
        title: 'Ten hours studied',
        detail: 'Ten hours of scheduled sessions, completed.',
        date: day.date,
        icon: 'clock',
        tone: 'blue',
      });
      break;
    }
  }

  if (quizzes[0]) {
    out.push({
      id: 'first-quiz',
      title: 'First quiz completed',
      detail: 'A quiz taken and marked end to end.',
      date: quizzes[0].completed_at,
      icon: 'target',
      tone: 'amber',
    });
  }

  if (quizzes[4]) {
    out.push({
      id: 'five-quizzes',
      title: 'Five quizzes completed',
      detail: `${quizzes.length} finished so far.`,
      date: quizzes[4].completed_at,
      icon: 'target',
      tone: 'amber',
    });
  }

  if (explanations[4]) {
    out.push({
      id: 'five-explanations',
      title: 'Five explanations saved',
      detail: `${explanations.length} saved to your library.`,
      date: explanations[4].created_at,
      icon: 'learn',
      tone: 'indigo',
    });
  }

  if (topics[0]) {
    out.push({
      id: 'first-topic',
      title: 'First topic completed',
      detail: `${topics[0].topic}, marked complete.`,
      date: topics[0].updated_at,
      icon: 'check-circle',
      tone: 'teal',
    });
  }

  if (topics[4]) {
    out.push({
      id: 'five-topics',
      title: 'Five topics completed',
      detail: `${topics.length} topics completed in total.`,
      date: topics[4].updated_at,
      icon: 'check-circle',
      tone: 'teal',
    });
  }

  return out.sort((a, b) => b.date.localeCompare(a.date));
}
