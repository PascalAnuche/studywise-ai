import { listPlans, toPlanDto } from '@/lib/db/planner';
import { getStudent } from '@/lib/db/queries';
import { getCurrentStudentId } from '@/lib/session';
import { formatTimeRange } from '@/lib/format';
import type { IconName } from '@/components/Icon';
import type { DayMarker } from './components/MiniCalendar';
import {
  PlannerBoard,
  type ActivePlan,
  type ScheduleSlot,
  type UpcomingTask,
} from './components/PlannerBoard';

export const dynamic = 'force-dynamic';

/**
 * Study Planner — flow 2, built to the approved design.
 *
 * Everything here is real: the plan, its completion, today's sessions and the
 * calendar markers all come from `study_plans` and `plan_sessions`.
 *
 * Completion is inferred from a session's scheduled time having passed, because
 * `plan_sessions` has no completion flag. That is honest arithmetic on what the
 * schema holds, and it is the reason the checkboxes are disabled. Tracked in
 * AGENTS.md.
 */
const TONES: ScheduleSlot['tone'][] = ['violet', 'green', 'amber', 'rose', 'blue'];
const ICONS: IconName[] = ['learn', 'practice', 'notes', 'target', 'plan'];

/** Stable per-title, so the same session keeps its colour and icon. */
function hash(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (Math.imul(31, h) + value.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function formatDateRange(start: string | null, end: string | null): string {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  if (!start && !end) return 'No dates set';
  const from = start ? new Date(`${start}T00:00:00`).toLocaleDateString(undefined, opts) : '—';
  const to = end
    ? new Date(`${end}T00:00:00`).toLocaleDateString(undefined, { ...opts, year: 'numeric' })
    : '—';
  return `${from} – ${to}`;
}

export default function PlannerPage() {
  const studentId = getCurrentStudentId();
  const student = getStudent(studentId);
  const today = new Date().toISOString().slice(0, 10);
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();

  const plans = listPlans(studentId).map(toPlanDto);
  const active = plans.find((plan) => plan.status === 'active') ?? null;

  const allSessions = plans.flatMap((plan) =>
    plan.sessions.map((session) => ({ ...session, planStatus: plan.status }))
  );

  // Completion: a session is done once its slot has passed.
  const isDone = (date: string | null, startTime: string | null | undefined, minutes: number) => {
    if (!date) return false;
    if (date < today) return true;
    if (date > today) return false;
    if (!startTime) return false;
    const [h, m] = startTime.split(':').map(Number);
    return h * 60 + m + minutes <= nowMinutes;
  };

  const activeSessions = active?.sessions ?? [];
  const completedCount = activeSessions.filter((s) =>
    isDone(s.scheduledFor, s.startTime, s.durationMinutes)
  ).length;

  const plan: ActivePlan | null = active
    ? {
        id: active.id,
        title: `${active.subject} Mastery Plan`,
        description:
          active.goals[0] ?? `Strengthen your understanding of ${active.subject.toLowerCase()}.`,
        dateRange: formatDateRange(active.startDate, active.endDate),
        frequency: active.frequency ?? 'Flexible',
        topicCount: active.topics.length,
        percentComplete:
          activeSessions.length === 0
            ? 0
            : Math.round((completedCount / activeSessions.length) * 100),
      }
    : null;

  const schedule: ScheduleSlot[] = allSessions
    .filter((session) => session.scheduledFor === today)
    .sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? ''))
    .map((session) => {
      const done = isDone(session.scheduledFor, session.startTime, session.durationMinutes);
      const [h, m] = (session.startTime ?? '00:00').split(':').map(Number);
      const started = h * 60 + m <= nowMinutes;

      return {
        id: session.id,
        title: session.focus,
        subtitle: session.topic,
        timeRange: formatTimeRange(session.startTime ?? null, session.durationMinutes),
        status: done ? 'completed' : started ? 'in-progress' : 'upcoming',
        tone: TONES[hash(session.focus) % TONES.length],
        icon: ICONS[hash(session.focus) % ICONS.length],
      };
    });

  const tasks: UpcomingTask[] = schedule
    .filter((slot) => slot.status !== 'completed')
    .slice(0, 3)
    .map((slot) => ({
      id: slot.id,
      title: slot.title,
      subtitle: slot.subtitle,
      when: 'Today',
      time: slot.timeRange?.split(' - ')[0] ?? '',
    }));

  // Calendar markers: a study day has sessions, a plan day starts or ends a
  // plan, a goal day is a plan's target date.
  const markers: Record<string, DayMarker[]> = {};
  const mark = (date: string | null, kind: DayMarker) => {
    if (!date) return;
    const list = markers[date] ?? [];
    if (!list.includes(kind)) markers[date] = [...list, kind];
  };

  for (const session of allSessions) mark(session.scheduledFor, 'study');
  for (const item of plans) {
    mark(item.startDate, 'plan');
    mark(item.endDate, 'goal');
  }

  return (
    <PlannerBoard
      plan={plan}
      schedule={schedule}
      tasks={tasks}
      markers={markers}
      streak={student?.streak_count ?? 0}
      today={today}
    />
  );
}
