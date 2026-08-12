import { Icon, type IconName } from './Icon';
import styles from './StatTile.module.css';

/**
 * A dashboard metric: icon, number, and an optional meter.
 *
 * PRD 7.4 asks the dashboard to surface completed topics, the streak, and
 * recent performance. Each is a proportion or a count, so each gets the same
 * shape rather than three bespoke layouts.
 *
 * The number is always present as text. The meter is a second encoding, never
 * the only one.
 */
export type StatTone = 'brand' | 'positive' | 'accent';

export interface StatTileProps {
  icon: IconName;
  label: string;
  value: number;
  /** Renders "value of total" and fills the meter. Omit for a bare count. */
  total?: number;
  suffix?: string;
  caption?: string;
  tone?: StatTone;
}

export function StatTile({
  icon,
  label,
  value,
  total,
  suffix,
  caption,
  tone = 'brand',
}: StatTileProps) {
  const percent = total && total > 0 ? Math.round((value / total) * 100) : null;

  return (
    <article className={`${styles.tile} ${styles[tone]}`}>
      <div className={styles.head}>
        <span className={styles.icon}>
          <Icon name={icon} />
        </span>
        <span className={styles.label}>{label}</span>
      </div>

      <div className={styles.value}>
        <span className={styles.number}>{value}</span>
        {total !== undefined && <span className={styles.suffix}>of {total}</span>}
        {suffix && <span className={styles.suffix}>{suffix}</span>}
      </div>

      {percent !== null && (
        <div
          className={styles.track}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label={label}
        >
          <div className={styles.bar} style={{ width: `${percent}%` }} />
        </div>
      )}

      {caption && <span className={styles.caption}>{caption}</span>}
    </article>
  );
}
