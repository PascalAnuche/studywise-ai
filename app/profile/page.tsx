import Link from 'next/link';
import { Card } from '@/components/Card';
import { StatTile } from '@/components/StatTile';
import { listPlans } from '@/lib/db/planner';
import { listQuizzes } from '@/lib/db/practice';
import { getRecentExplanations, getStudent } from '@/lib/db/queries';
import { getCurrentStudentId } from '@/lib/session';
import styles from '../page.module.css';

/**
 * Profile — flow 8.
 *
 * Unlike the other flow-8 screen, this one is real: everything shown already
 * exists in the database. Editing is not built yet.
 */
export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const studentId = getCurrentStudentId();
  const student = await getStudent(studentId);

  if (!student) {
    return (
      <main id="main" className={styles.page}>
        <h1>No student found</h1>
        <p className={styles.subtitle}>
          Run <code>npm run db:reset</code> to create and seed the database.
        </p>
      </main>
    );
  }

  const plans = await listPlans(studentId);
  const quizzes = await listQuizzes(studentId, 50);
  const explanations = await getRecentExplanations(studentId, 50);

  return (
    <main id="main" className={styles.page}>
      <header className={styles.greeting}>
        <h1>Profile</h1>
        <p className={styles.subtitle}>Your account, and what the assistant knows about your course.</p>
      </header>

      <Card title="Account">
        <ul className={styles.list}>
          <li className={styles.row}>
            <span className={styles.question}>Name</span>
            <span className={styles.rowMeta}>{student.name}</span>
          </li>
          <li className={styles.row}>
            <span className={styles.question}>Email</span>
            <span className={styles.rowMeta}>{student.email}</span>
          </li>
          <li className={styles.row}>
            <span className={styles.question}>
              Discipline
              <br />
              {/* Prompt section 11: discipline sets how conservative the
                  assistant is, so it is not a cosmetic field. */}
              <span className={styles.rowMeta}>
                Sets how cautious the assistant is with high-stakes material
              </span>
            </span>
            <span className={styles.rowMeta}>{student.discipline ?? 'Not set'}</span>
          </li>
        </ul>
      </Card>

      <section className={styles.grid}>
        <StatTile icon="plan" tone="brand" label="Study plans" value={plans.length} caption="Drafts and active plans" />
        <StatTile icon="practice" tone="positive" label="Quizzes taken" value={quizzes.length} caption="Submitted and in progress" />
        <StatTile icon="learn" tone="accent" label="Saved explanations" value={explanations.length} caption="With their reasoning kept" />
      </section>

      <Card title="Your activity">
        <p className={styles.notice}>
          Everything above is yours. Nothing is shared with another student, and none of it is used
          to make claims about your ability. See <Link href="/settings">privacy in settings</Link>.
        </p>
      </Card>
    </main>
  );
}
