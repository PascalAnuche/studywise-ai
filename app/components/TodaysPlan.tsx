import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { formatTimeRange } from '@/lib/format';
import styles from './TodaysPlan.module.css';

export { formatTimeRange };

/**
 * Today's sessions from the active study plan, as a row of cards per the
 * approved design.
 *
 * Times come from the plan's schedule. A session with no time shows its
 * duration rather than an invented slot.
 */
export interface PlanItem {
  id: number;
  title: string;
  detail: string;
  timeRange: string | null;
  status: 'in-progress' | 'todo' | 'done';
}

const TONES = [styles.toneA, styles.toneB, styles.toneC];

export function TodaysPlan({ items }: { items: PlanItem[] }) {
  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyBody}>
          Nothing scheduled for today. Build a plan and today&rsquo;s sessions appear here.
        </span>
        <Link href="/planner">Open the planner</Link>
      </div>
    );
  }

  return (
    <ul className={styles.list}>
      {items.map((item, index) => (
        <li key={item.id} className={styles.item}>
          <span className={`${styles.icon} ${TONES[index % TONES.length]}`} aria-hidden="true">
            <Icon name="plan" size={18} />
          </span>

          <div className={styles.body}>
            <span className={styles.title}>{item.title}</span>
            <span className={styles.meta}>
              {item.timeRange ? `${item.timeRange} · ` : ''}
              {item.detail}
            </span>
          </div>

          {item.status === 'in-progress' ? (
            <span className={styles.status}>In Progress</span>
          ) : (
            <input
              className={styles.check}
              type="checkbox"
              defaultChecked={item.status === 'done'}
              aria-label={`Mark ${item.title} complete`}
            />
          )}
        </li>
      ))}
    </ul>
  );
}
