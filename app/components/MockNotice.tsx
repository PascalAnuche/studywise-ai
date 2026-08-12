import styles from '../page.module.css';

/**
 * Labels a screen that renders from `lib/mock` rather than the database.
 *
 * Shown to anyone using the app, not hidden in a comment. A demo that looks
 * indistinguishable from real data is how a stakeholder ends up believing a
 * feature is finished, and how a developer ends up writing against a source
 * that does not exist.
 */
export function MockNotice({ flow }: { flow: number }) {
  return (
    <p className={styles.notice}>
      Sample data. Flow {flow} has no backend yet, so this screen renders from{' '}
      <code>lib/mock</code>. Nothing here is saved.
    </p>
  );
}
