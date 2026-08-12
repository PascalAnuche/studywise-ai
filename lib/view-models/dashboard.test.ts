import { describe, expect, it } from 'vitest';
import { greetingFor, pickNextSession } from './dashboard';

/**
 * The rules a redesign must not lose.
 *
 * These live in a view model rather than in JSX precisely so they can be tested
 * without rendering, and so replacing the page cannot quietly change them.
 */
describe('pickNextSession', () => {
  const session = (scheduledFor: string | null, topic = 't') => ({ scheduledFor, topic });

  it('picks the earliest session on or after today', () => {
    const next = pickNextSession(
      [session('2026-09-10', 'later'), session('2026-09-02', 'sooner'), session('2026-09-20')],
      '2026-09-01'
    );
    expect(next?.topic).toBe('sooner');
  });

  it('includes today', () => {
    const next = pickNextSession([session('2026-09-01', 'today')], '2026-09-01');
    expect(next?.topic).toBe('today');
  });

  it('ignores sessions in the past', () => {
    const next = pickNextSession([session('2026-08-30'), session('2026-08-31')], '2026-09-01');
    expect(next).toBeNull();
  });

  it('excludes unscheduled sessions rather than treating them as next', () => {
    // An unscheduled session is not "next", it is unplanned. Sorting nulls to
    // the front would put a session with no date at the top of the dashboard.
    const next = pickNextSession([session(null, 'undated'), session('2026-09-05', 'dated')], '2026-09-01');
    expect(next?.topic).toBe('dated');
  });

  it('returns null when there is nothing scheduled at all', () => {
    expect(pickNextSession([session(null), session(null)], '2026-09-01')).toBeNull();
  });
});

describe('greetingFor', () => {
  const at = (hour: number) => new Date(2026, 8, 1, hour, 0, 0);

  it('changes with the time of day', () => {
    expect(greetingFor(at(6))).toBe('Good morning');
    expect(greetingFor(at(11))).toBe('Good morning');
    expect(greetingFor(at(12))).toBe('Good afternoon');
    expect(greetingFor(at(17))).toBe('Good afternoon');
    expect(greetingFor(at(18))).toBe('Good evening');
    expect(greetingFor(at(23))).toBe('Good evening');
  });

  it('covers midnight without falling through', () => {
    expect(greetingFor(at(0))).toBe('Good morning');
  });
});
