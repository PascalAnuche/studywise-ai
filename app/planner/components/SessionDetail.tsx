'use client';

import { Button } from '@/components/Button';
import { formatTimeRange } from '@/lib/format';
import type { CalendarEvent } from './Calendar';
import styles from './SessionDetail.module.css';

/**
 * The detail panel beside the calendar, per the approved design.
 *
 * "Mark as Complete" and the note field are not wired: `plan_sessions` has no
 * completion flag and no notes column. They are shown disabled with a reason
 * rather than silently discarding what a student types, which is the failure
 * mode that costs trust fastest on a planner.
 */
export interface SessionDetailProps {
  event: CalendarEvent | null;
  /** Every session in the shown week, for the task list. */
  weekEvents: CalendarEvent[];
  today: string;
}

function statusOf(event: CalendarEvent, today: string): { label: string; className: string } {
  if (event.date < today) return { label: 'Past', className: styles.past };
  if (event.date > today) return { label: 'Upcoming', className: styles.upcoming };
  return { label: 'In Progress', className: styles.inProgress };
}

export function SessionDetail({ event, weekEvents, today }: SessionDetailProps) {
  if (!event) {
    return (
      <div className={styles.panel}>
        <p className={styles.empty}>Select a session on the calendar to see its detail.</p>
      </div>
    );
  }

  const status = statusOf(event, today);
  const range = formatTimeRange(event.startTime, event.durationMinutes);

  return (
    <div className={styles.panel}>
      <div className={styles.head}>
        <h2 className={styles.title}>{event.title}</h2>
        <span className={`${styles.status} ${status.className}`}>{status.label}</span>
      </div>

      <span className={styles.time}>
        {range ?? `${event.durationMinutes} min`}
        {' · '}
        {new Date(`${event.date}T00:00:00`).toLocaleDateString(undefined, {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })}
      </span>

      <div className={styles.field}>
        <span className={styles.label}>Topic</span>
        <span className={styles.value}>{event.subtitle}</span>
      </div>

      <div className={styles.field}>
        <span className={styles.label}>Notes</span>
        <span className={styles.value}>
          Session notes are not stored yet, so there is nowhere to save one.
        </span>
      </div>

      <div className={styles.actions}>
        <Button size="small" disabled title="plan_sessions has no completion flag yet">
          Mark as Complete
        </Button>
      </div>

      <div className={styles.divider} />

      <span className={styles.tasksLabel}>This week</span>
      <ul className={styles.tasks}>
        {weekEvents.map((session) => (
          <li key={session.id}>
            <label className={styles.task}>
              <input
                className={styles.check}
                type="checkbox"
                checked={session.date < today}
                disabled
                title="Completion is not stored yet"
              />
              <span className={session.date < today ? styles.taskDone : undefined}>
                {session.title}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
