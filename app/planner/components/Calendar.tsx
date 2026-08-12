'use client';

import { Icon } from '@/components/Icon';
import styles from './Calendar.module.css';

/**
 * Week calendar for the Study Planner, per the approved design.
 *
 * Sessions are positioned from their start time and duration, so this is a view
 * of the plan rather than a second copy of it. A session with no start time
 * cannot be placed on a time grid and is listed under the calendar instead of
 * being dropped or given an invented slot.
 */
export interface CalendarEvent {
  id: number;
  title: string;
  subtitle: string;
  /** ISO date. */
  date: string;
  /** "HH:MM", or null when the session has no time. */
  startTime: string | null;
  durationMinutes: number;
}

export interface CalendarProps {
  /** Monday of the week being shown, as an ISO date. */
  weekStart: string;
  events: CalendarEvent[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onNavigate: (weekStartIso: string) => void;
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const FIRST_HOUR = 8;
const LAST_HOUR = 20;
const SLOT_HEIGHT_REM = 3.5;
const TONES = [styles.toneA, styles.toneB, styles.toneC];

/** The Monday on or before the given date. */
export function startOfWeek(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  const weekday = (date.getDay() + 6) % 7; // Monday = 0
  date.setDate(date.getDate() - weekday);
  return date.toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function formatRange(weekStart: string): string {
  const start = new Date(`${weekStart}T00:00:00`);
  const end = new Date(`${addDays(weekStart, 6)}T00:00:00`);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString(undefined, opts)} – ${end.toLocaleDateString(undefined, { ...opts, year: 'numeric' })}`;
}

function hourLabel(hour: number): string {
  const suffix = hour < 12 ? 'AM' : 'PM';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12} ${suffix}`;
}

export function Calendar({ weekStart, events, selectedId, onSelect, onNavigate }: CalendarProps) {
  const today = new Date().toISOString().slice(0, 10);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: LAST_HOUR - FIRST_HOUR + 1 }, (_, i) => FIRST_HOUR + i);

  const placed = events.filter((event) => event.startTime !== null);
  const unplaced = events.filter((event) => event.startTime === null);

  return (
    <div className={styles.calendar}>
      <div className={styles.toolbar}>
        <button
          type="button"
          className={styles.navButton}
          aria-label="Previous week"
          onClick={() => onNavigate(addDays(weekStart, -7))}
        >
          <Icon name="arrow-left" size={16} />
        </button>
        <span className={styles.range}>{formatRange(weekStart)}</span>
        <button
          type="button"
          className={styles.navButton}
          aria-label="Next week"
          onClick={() => onNavigate(addDays(weekStart, 7))}
        >
          <Icon name="arrow-right" size={16} />
        </button>

        <button type="button" className={styles.today} onClick={() => onNavigate(startOfWeek(today))}>
          Today
        </button>

        <span className={styles.spacer} />

        <div className={styles.views}>
          <span className={`${styles.view} ${styles.viewActive}`}>Week</span>
          {/* Month is in the design but not built; saying so beats a dead tab. */}
          <span className={styles.view} title="Not available yet">
            Month
          </span>
        </div>
      </div>

      <div className={styles.scroll}>
        <div className={styles.grid}>
          <div className={styles.corner} />
          {days.map((date, index) => {
            const dayNumber = Number(date.slice(8, 10));
            return (
              <div key={date} className={styles.dayHead}>
                <span className={styles.dayName}>{DAY_NAMES[index]}</span>
                <span className={styles.dayNumber}>
                  {date === today ? (
                    <span className={styles.todayNumber}>{dayNumber}</span>
                  ) : (
                    dayNumber
                  )}
                </span>
              </div>
            );
          })}

          <div className={styles.hours}>
            {hours.map((hour) => (
              <div key={hour} className={styles.hour}>
                {hourLabel(hour)}
              </div>
            ))}
          </div>

          {days.map((date) => (
            <div key={date} className={styles.day}>
              {hours.map((hour) => (
                <div key={hour} className={styles.slot} />
              ))}

              {placed
                .filter((event) => event.date === date)
                .map((event, index) => {
                  const [h, m] = event.startTime!.split(':').map(Number);
                  const offsetMinutes = (h - FIRST_HOUR) * 60 + m;
                  const top = (offsetMinutes / 60) * SLOT_HEIGHT_REM;
                  const height = Math.max((event.durationMinutes / 60) * SLOT_HEIGHT_REM, 1.75);

                  return (
                    <button
                      key={event.id}
                      type="button"
                      className={`${styles.event} ${TONES[index % TONES.length]} ${
                        event.id === selectedId ? styles.eventSelected : ''
                      }`}
                      style={{ top: `${top}rem`, height: `${height}rem` }}
                      onClick={() => onSelect(event.id)}
                    >
                      <span className={styles.eventTitle}>{event.title}</span>
                      <span className={styles.eventTime}>
                        {event.startTime} · {event.durationMinutes} min
                      </span>
                    </button>
                  );
                })}
            </div>
          ))}
        </div>
      </div>

      {unplaced.length > 0 && (
        <p className={styles.empty}>
          {unplaced.length} session{unplaced.length === 1 ? '' : 's'} this week{' '}
          {unplaced.length === 1 ? 'has' : 'have'} no time set, so {unplaced.length === 1 ? 'it is' : 'they are'} not
          on the grid.
        </p>
      )}
    </div>
  );
}
