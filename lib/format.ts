/**
 * Pure formatters shared by server and client components.
 *
 * Deliberately neither `'use client'` nor `server-only`. A helper exported from
 * a client module cannot be called during server rendering — Next throws
 * "Attempted to call X() from the server but X is on the client" — and one
 * exported from a server-only module cannot be imported into a client
 * component. Anything both sides format belongs here.
 */

/** "Today", "Yesterday", then a day count, then a date. */
export function relativeDay(iso: string, now = new Date()): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return '';

  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOfDay(now) - startOfDay(then)) / 864e5);

  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 14) return 'Last week';
  return then.toISOString().slice(0, 10);
}

/**
 * "10:00" plus 90 minutes becomes "10:00 AM - 11:30 AM".
 *
 * Returns null without a start time rather than inventing one: a plan with no
 * times is valid, and a made-up slot is worse than none.
 */
export function formatTimeRange(startTime: string | null, durationMinutes: number): string | null {
  if (!startTime) return null;

  const [hours, minutes] = startTime.split(':').map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;

  const label = (totalMinutes: number) => {
    const h24 = Math.floor(totalMinutes / 60) % 24;
    const m = totalMinutes % 60;
    const suffix = h24 < 12 ? 'AM' : 'PM';
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
  };

  const start = hours * 60 + minutes;
  return `${label(start)} - ${label(start + durationMinutes)}`;
}
