import { getProgressOverview } from '@/lib/db/progress';
import { getCurrentStudentId } from '@/lib/session';
import { ProgressDashboard } from './components/ProgressDashboard';
import styles from '../page.module.css';

export const dynamic = 'force-dynamic';

/**
 * Progress Tracking — PRD 7.4.
 *
 * The feature with no flow diagram (PRD section 12), so this is built from the
 * written requirements and the journey map's Track and Reflect stages. Expect
 * it to change once that flow exists.
 */
export default function ProgressPage() {
  const overview = getProgressOverview(getCurrentStudentId());

  return (
    <main id="main" className={styles.page}>
      <header className={styles.greeting}>
        <h1>Progress</h1>
        <p className={styles.subtitle}>
          What you have covered, and what is worth another look. Each topic stands on its own
          here rather than being rolled into a single score.
        </p>
      </header>

      <ProgressDashboard overview={overview} />
    </main>
  );
}
