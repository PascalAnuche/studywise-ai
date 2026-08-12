'use client';

import { useState } from 'react';
import { Icon } from '@/components/Icon';
import styles from '../planner.module.css';

/**
 * The month calendar in the Planner rail, per the approved design.
 *
 * Dots under a day mark what is on it. Three kinds, and each is also in the
 * legend by name, so the dot colour is never the only way to read the day.
 */
export type DayMarker = 'study' | 'plan' | 'goal';

export interface MiniCalendarProps {
  /** ISO date -> the markers on that day. */
  markers: Record<string, DayMarker[]>;
  today: string;
}

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const MARKER_CLASS: Record<DayMarker, string> = {
  study: styles.dotStudy,
  plan: styles.dotPlan,
  goal: styles.dotGoal,
};

function monthGrid(year: number, month: number): { iso: string; day: number; inMonth: boolean }[] {
  const first = new Date(year, month, 1);
  // Monday-first, so Sunday (0) becomes the last column.
  const leading = (first.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - leading);

  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    return {
      iso: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
      day: date.getDate(),
      inMonth: date.getMonth() === month,
    };
  });
}

export function MiniCalendar({ markers, today }: MiniCalendarProps) {
  const now = new Date(`${today}T00:00:00`);
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });

  const cells = monthGrid(cursor.year, cursor.month);
  const label = new Date(cursor.year, cursor.month, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  const shift = (by: number) => {
    const next = new Date(cursor.year, cursor.month + by, 1);
    setCursor({ year: next.getFullYear(), month: next.getMonth() });
  };

  return (
    <div>
      <div className={styles.miniHead}>
        <span className={styles.miniMonth}>{label}</span>
        <button type="button" className={styles.miniNav} aria-label="Previous month" onClick={() => shift(-1)}>
          <Icon name="arrow-left" size={14} />
        </button>
        <button type="button" className={styles.miniNav} aria-label="Next month" onClick={() => shift(1)}>
          <Icon name="arrow-right" size={14} />
        </button>
        <button
          type="button"
          className={styles.miniToday}
          onClick={() => setCursor({ year: now.getFullYear(), month: now.getMonth() })}
        >
          Today
        </button>
      </div>

      <div className={styles.miniGrid} role="grid" aria-label={label}>
        {WEEKDAYS.map((day) => (
          <span key={day} className={styles.miniWeekday}>
            {day}
          </span>
        ))}

        {cells.map((cell) => {
          const dots = markers[cell.iso] ?? [];
          return (
            <span
              key={cell.iso}
              className={`${styles.miniDay} ${cell.inMonth ? '' : styles.miniOutside} ${
                cell.iso === today ? styles.miniToday_ : ''
              }`}
            >
              <span className={styles.miniNumber}>{cell.day}</span>
              {dots.length > 0 && (
                <span className={styles.miniDots}>
                  {dots.map((dot) => (
                    <span key={dot} className={`${styles.miniDot} ${MARKER_CLASS[dot]}`} />
                  ))}
                  <span className="visually-hidden">{dots.join(', ')}</span>
                </span>
              )}
            </span>
          );
        })}
      </div>

      <div className={styles.miniLegend}>
        <span className={styles.miniLegendItem}>
          <span className={`${styles.miniDot} ${styles.dotStudy}`} aria-hidden="true" /> Study Day
        </span>
        <span className={styles.miniLegendItem}>
          <span className={`${styles.miniDot} ${styles.dotPlan}`} aria-hidden="true" /> Plan Day
        </span>
        <span className={styles.miniLegendItem}>
          <span className={`${styles.miniDot} ${styles.dotGoal}`} aria-hidden="true" /> Goal Day
        </span>
      </div>
    </div>
  );
}
