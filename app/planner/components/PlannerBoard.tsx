'use client';

import { useMemo, useState } from 'react';
import { Calendar, addDays, startOfWeek, type CalendarEvent } from './Calendar';
import { SessionDetail } from './SessionDetail';
import styles from '../planner.module.css';

/**
 * The calendar half of the Study Planner, per the approved design.
 *
 * Week navigation is client state rather than a URL parameter: moving between
 * weeks is a view change, not a destination, and a student flicking back and
 * forth should not fill their history.
 */
export interface PlannerBoardProps {
  events: CalendarEvent[];
  today: string;
}

export function PlannerBoard({ events, today }: PlannerBoardProps) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(today));
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const weekEvents = useMemo(() => {
    const end = addDays(weekStart, 7);
    return events
      .filter((event) => event.date >= weekStart && event.date < end)
      .sort((a, b) => `${a.date}${a.startTime ?? ''}`.localeCompare(`${b.date}${b.startTime ?? ''}`));
  }, [events, weekStart]);

  // Default to today's first session, falling back to the week's first, so the
  // panel is never empty when there is something to show.
  const selected =
    weekEvents.find((event) => event.id === selectedId) ??
    weekEvents.find((event) => event.date === today) ??
    weekEvents[0] ??
    null;

  return (
    <div className={styles.layout}>
      <Calendar
        weekStart={weekStart}
        events={weekEvents}
        selectedId={selected?.id ?? null}
        onSelect={setSelectedId}
        onNavigate={(next) => {
          setWeekStart(next);
          setSelectedId(null);
        }}
      />

      <div className={styles.aside}>
        <SessionDetail event={selected} weekEvents={weekEvents} today={today} />
      </div>
    </div>
  );
}
