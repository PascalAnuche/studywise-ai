import { Icon } from '@/components/Icon';
import styles from './StreakIndicator.module.css';

/**
 * The study streak (PRD 7.4).
 *
 * A count and a date, nothing else. Prompt section 12 rules out commenting on
 * it in either direction: no praise for a long run, and no nudge when it is
 * about to break. The streak is one value on the student, not an aggregate
 * across topics.
 */
export interface StreakIndicatorProps {
  streak: number;
  lastActiveOn: string | null;
}

export function StreakIndicator({ streak, lastActiveOn }: StreakIndicatorProps) {
  return (
    <div className={styles.indicator}>
      <span className={styles.icon}>
        <Icon name="flame" size={28} />
      </span>

      <div className={styles.body}>
        <span className={styles.value}>
          <span className={styles.number}>{streak}</span>
          <span className={styles.unit}>{streak === 1 ? 'day' : 'days'} in a row</span>
        </span>
        <span className={styles.meta}>
          {lastActiveOn ? `Last study activity ${lastActiveOn}` : 'No study activity recorded yet'}
        </span>
      </div>
    </div>
  );
}
