'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Icon } from './Icon';
import { Select } from './Select';
import { placementFor } from './popover';
import fieldStyles from './Field.module.css';
import styles from './DatePicker.module.css';

/**
 * Dates are handled as `YYYY-MM-DD` strings in local time throughout, never as
 * Date objects across a boundary. `new Date('2026-08-12')` parses as UTC
 * midnight, which is the previous day for anyone west of Greenwich — the
 * classic way a date picker shows the wrong day to half its users.
 */
const toISO = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;

const fromISO = (value: string) => {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
};

const addDays = (date: Date, n: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);

const addMonths = (date: Date, n: number) =>
  new Date(date.getFullYear(), date.getMonth() + n, 1);

/** Monday-first, matching the planner's calendar. */
const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

/** Month names from the runtime's locale rather than a hardcoded English list. */
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, month) => ({
  value: String(month),
  label: new Date(2000, month, 1).toLocaleDateString(undefined, { month: 'long' }),
}));

/**
 * Years offered in the header. Centred on today but always widened to include
 * whatever is already selected, so an existing value is never unreachable.
 */
function yearRange(...include: number[]): { value: string; label: string }[] {
  const now = new Date().getFullYear();
  const from = Math.min(now - 5, ...include);
  const to = Math.max(now + 10, ...include);
  return Array.from({ length: to - from + 1 }, (_, i) => ({
    value: String(from + i),
    label: String(from + i),
  }));
}

function monthGrid(view: Date): Date[] {
  const first = new Date(view.getFullYear(), view.getMonth(), 1);
  // getDay() is Sunday-first; shift so Monday is 0.
  const lead = (first.getDay() + 6) % 7;
  const start = addDays(first, -lead);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

export interface DatePickerProps {
  label: string;
  /** `YYYY-MM-DD`, or an empty string for no date. */
  value: string;
  onValueChange: (value: string) => void;
  hint?: string;
  /** Submits the value with a surrounding form, via a hidden input. */
  name?: string;
  /** Earliest selectable date, `YYYY-MM-DD`. */
  min?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function DatePicker({
  label,
  value,
  onValueChange,
  hint,
  name,
  min,
  placeholder = 'Pick a date',
  disabled,
}: DatePickerProps) {
  const id = useId();
  const hintId = `${id}-hint`;

  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const [alignEnd, setAlignEnd] = useState(false);
  const [view, setView] = useState(() => (value ? fromISO(value) : new Date()));
  const [focused, setFocused] = useState(() => value || toISO(new Date()));
  // Set while the keyboard is driving, so the grid does not steal focus back
  // from the trigger after a pointer-driven close.
  const shouldFocusDay = useRef(false);

  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const gridRef = useRef<HTMLTableElement>(null);

  const todayISO = toISO(new Date());

  const close = (focusTrigger: boolean) => {
    setOpen(false);
    if (focusTrigger) triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  // Roving focus: the one day with tabIndex 0 is the one the arrows moved to.
  useEffect(() => {
    if (!open || !shouldFocusDay.current) return;
    const day = gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${focused}"]`);
    day?.focus();
  }, [open, focused, view]);

  const openPicker = () => {
    /* Roughly the popup's own height; 21rem wide, matching the stylesheet. */
    const place = placementFor(triggerRef.current, 360);
    setDropUp(place.dropUp);
    setAlignEnd(place.alignEnd);

    const start = value || todayISO;
    setFocused(start);
    setView(fromISO(start));
    shouldFocusDay.current = true;
    setOpen(true);
  };

  const moveTo = (date: Date) => {
    const iso = toISO(date);
    shouldFocusDay.current = true;
    setFocused(iso);
    if (date.getMonth() !== view.getMonth() || date.getFullYear() !== view.getFullYear()) {
      setView(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  };

  const select = (iso: string) => {
    onValueChange(iso);
    close(true);
  };

  const onGridKeyDown = (event: React.KeyboardEvent) => {
    const current = fromISO(focused);
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        moveTo(addDays(current, -1));
        return;
      case 'ArrowRight':
        event.preventDefault();
        moveTo(addDays(current, 1));
        return;
      case 'ArrowUp':
        event.preventDefault();
        moveTo(addDays(current, -7));
        return;
      case 'ArrowDown':
        event.preventDefault();
        moveTo(addDays(current, 7));
        return;
      case 'Home':
        event.preventDefault();
        moveTo(addDays(current, -((current.getDay() + 6) % 7)));
        return;
      case 'End':
        event.preventDefault();
        moveTo(addDays(current, 6 - ((current.getDay() + 6) % 7)));
        return;
      case 'PageUp':
        event.preventDefault();
        moveTo(new Date(current.getFullYear(), current.getMonth() - 1, current.getDate()));
        return;
      case 'PageDown':
        event.preventDefault();
        moveTo(new Date(current.getFullYear(), current.getMonth() + 1, current.getDate()));
        return;
      case 'Escape':
        event.preventDefault();
        close(true);
        return;
      default:
        break;
    }
  };

  const days = monthGrid(view);
  const monthLabel = view.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const display = value
    ? fromISO(value).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : placeholder;

  const changeMonth = (n: number) => {
    shouldFocusDay.current = false;
    setView((v) => addMonths(v, n));
  };

  /* Chosen from the header dropdowns. Focus stays where the user put it. */
  const jumpTo = (year: number, month: number) => {
    shouldFocusDay.current = false;
    setView(new Date(year, month, 1));
  };

  const yearOptions = yearRange(
    view.getFullYear(),
    value ? fromISO(value).getFullYear() : new Date().getFullYear()
  );

  return (
    <div className={fieldStyles.field}>
      <span className={fieldStyles.label} id={`${id}-label`}>
        {label}
      </span>

      <div className={styles.wrap} ref={wrapRef}>
        <button
          type="button"
          ref={triggerRef}
          id={id}
          className={styles.trigger}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-labelledby={`${id}-label ${id}`}
          aria-describedby={hint ? hintId : undefined}
          disabled={disabled}
          onClick={() => (open ? close(false) : openPicker())}
        >
          <span className={value ? undefined : styles.placeholder}>{display}</span>
          <span className={styles.calendarIcon} aria-hidden="true">
            <Icon name="plan" size={16} />
          </span>
        </button>

        {open && (
          <div
            className={[styles.popup, dropUp ? styles.dropUp : '', alignEnd ? styles.alignEnd : '']
              .filter(Boolean)
              .join(' ')}
            role="dialog"
            aria-label={`Choose ${label.toLowerCase()}`}
            onKeyDown={onGridKeyDown}
          >
            {/*
              * Month and year are chosen directly, not walked to. Stepping from
              * August to next June is ten clicks on arrows alone.
              */}
            <div className={styles.head}>
              <div className={styles.periodPickers}>
                <Select
                  label="Month"
                  labelHidden
                  className={styles.periodTrigger}
                  value={String(view.getMonth())}
                  options={MONTH_OPTIONS}
                  onValueChange={(next) => jumpTo(view.getFullYear(), Number(next))}
                />
                <Select
                  label="Year"
                  labelHidden
                  className={styles.periodTrigger}
                  value={String(view.getFullYear())}
                  options={yearOptions}
                  onValueChange={(next) => jumpTo(Number(next), view.getMonth())}
                />
              </div>
              <div className={styles.navGroup}>
                <button
                  type="button"
                  className={styles.nav}
                  aria-label="Previous month"
                  onClick={() => changeMonth(-1)}
                >
                  <Icon name="chevron-left" size={16} />
                </button>
                <button
                  type="button"
                  className={styles.nav}
                  aria-label="Next month"
                  onClick={() => changeMonth(1)}
                >
                  <Icon name="chevron-right" size={16} />
                </button>
              </div>
            </div>

            {/* The visible controls are the two dropdowns; this announces the
              * resulting month to a screen reader as it changes. */}
            <span className="visually-hidden" aria-live="polite">
              {monthLabel}
            </span>

            <table className={styles.grid} ref={gridRef} role="grid">
              <thead>
                <tr>
                  {WEEKDAYS.map((day) => (
                    <th key={day} scope="col" className={styles.weekday} abbr={day}>
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 6 }, (_, week) => (
                  <tr key={week}>
                    {days.slice(week * 7, week * 7 + 7).map((date) => {
                      const iso = toISO(date);
                      const outside = date.getMonth() !== view.getMonth();
                      const blocked = min ? iso < min : false;

                      return (
                        /* Selection belongs on the gridcell, not the button:
                         * aria-selected is not a valid attribute of a button. */
                        <td
                          key={iso}
                          role="gridcell"
                          aria-selected={iso === value}
                          className={styles.cell}
                        >
                          <button
                            type="button"
                            data-date={iso}
                            className={[
                              styles.day,
                              outside ? styles.outside : '',
                              iso === todayISO ? styles.today : '',
                              iso === value ? styles.selected : '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            /* Roving tabindex: one stop for the whole grid. */
                            tabIndex={iso === focused ? 0 : -1}
                            aria-current={iso === todayISO ? 'date' : undefined}
                            aria-label={date.toLocaleDateString(undefined, {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                            disabled={blocked}
                            onClick={() => select(iso)}
                          >
                            {date.getDate()}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={styles.footer}>
              <button
                type="button"
                className={styles.footerAction}
                onClick={() => select(todayISO)}
              >
                Today
              </button>
              {value && (
                <button
                  type="button"
                  className={styles.footerAction}
                  onClick={() => {
                    onValueChange('');
                    close(true);
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {name && <input type="hidden" name={name} value={value} />}

      {hint && (
        <span id={hintId} className={fieldStyles.hint}>
          {hint}
        </span>
      )}
    </div>
  );
}
