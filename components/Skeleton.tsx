import styles from './Skeleton.module.css';

/**
 * Building blocks for route-level loading states.
 *
 * Marked aria-hidden with a single polite live region announcing the load, so
 * assistive tech hears "Loading" once instead of reading a wall of empty boxes.
 */
export function SkeletonPageHeader() {
  return (
    <div className={styles.header} aria-hidden="true">
      <div className={`${styles.block} ${styles.title}`} />
      <div className={`${styles.block} ${styles.subtitle}`} />
    </div>
  );
}

export function SkeletonHero() {
  return <div className={`${styles.block} ${styles.hero}`} aria-hidden="true" />;
}

export function SkeletonTiles({ count = 3 }: { count?: number }) {
  return (
    <div className={styles.tiles} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={`${styles.block} ${styles.tile}`} />
      ))}
    </div>
  );
}

export function SkeletonCard({ height }: { height?: string }) {
  return (
    <div className={`${styles.block} ${styles.card}`} style={height ? { height } : undefined} aria-hidden="true" />
  );
}

export function SkeletonColumns({ children }: { children: React.ReactNode }) {
  return <div className={styles.columns}>{children}</div>;
}

/** Announced once per navigation, so the load is audible as well as visible. */
export function LoadingAnnouncement({ label }: { label: string }) {
  return (
    <span role="status" aria-live="polite" className="visually-hidden">
      Loading {label}
    </span>
  );
}
