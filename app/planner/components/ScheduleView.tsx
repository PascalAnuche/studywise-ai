import styles from './ScheduleView.module.css';

/**
 * The schedule view saved plans populate (PRD 7.2).
 *
 * Grouped by date rather than by plan, because a student's week is a single
 * timeline: two active plans on the same Tuesday is one Tuesday. Unscheduled
 * sessions are kept visible rather than hidden, otherwise a plan with no start
 * date silently disappears.
 */
export interface ScheduleItem {
  id: number;
  subject: string;
  topic: string;
  durationMinutes: number;
  scheduledFor: string | null;
}

export interface ScheduleViewProps {
  items: ScheduleItem[];
}

function label(date: string): { heading: string; relative: string | null } {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return { heading: date, relative: null };

  const heading = parsed.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOfDay(parsed) - startOfDay(new Date())) / 864e5);

  if (days === 0) return { heading, relative: 'today' };
  if (days === 1) return { heading, relative: 'tomorrow' };
  if (days < 0) return { heading, relative: `${Math.abs(days)} days ago` };
  return { heading, relative: `in ${days} days` };
}

export function ScheduleView({ items }: ScheduleViewProps) {
  if (items.length === 0) {
    return <p className={styles.empty}>Nothing scheduled yet. Build a plan and confirm it.</p>;
  }

  const scheduled = items.filter((item) => item.scheduledFor);
  const unscheduled = items.filter((item) => !item.scheduledFor);

  const groups = new Map<string, ScheduleItem[]>();
  for (const item of scheduled.sort((a, b) => a.scheduledFor!.localeCompare(b.scheduledFor!))) {
    const key = item.scheduledFor!;
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }

  const todayKey = new Date().toISOString().slice(0, 10);

  return (
    <div className={styles.schedule}>
      {[...groups.entries()].map(([date, group]) => {
        const { heading, relative } = label(date);
        return (
          <section key={date} className={styles.group}>
            <h3 className={styles.date}>
              {heading}
              {relative && <span className={styles.relative}>{relative}</span>}
            </h3>
            <ul className={styles.items}>
              {group.map((item) => (
                <li
                  key={item.id}
                  className={`${styles.item} ${date === todayKey ? styles.today : ''}`}
                >
                  <span>
                    <span className={styles.topic}>{item.topic}</span>
                    <br />
                    <span className={styles.subject}>{item.subject}</span>
                  </span>
                  <span className={styles.duration}>{item.durationMinutes} min</span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {unscheduled.length > 0 && (
        <section className={styles.group}>
          <h3 className={styles.date}>
            Not scheduled
            <span className={styles.relative}>no start date set</span>
          </h3>
          <ul className={styles.items}>
            {unscheduled.map((item) => (
              <li key={item.id} className={styles.item}>
                <span>
                  <span className={styles.topic}>{item.topic}</span>
                  <br />
                  <span className={styles.subject}>{item.subject}</span>
                </span>
                <span className={styles.duration}>{item.durationMinutes} min</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
