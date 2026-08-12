import Link from 'next/link';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { StatTile } from '@/components/StatTile';
import { MOCK_ACHIEVEMENTS } from '@/lib/mock';
import { getStudent } from '@/lib/db/queries';
import { getCurrentStudentId } from '@/lib/session';
import { MockNotice } from '../components/MockNotice';
import styles from '../page.module.css';

/**
 * Achievements & Study Streak — flow 7. Achievements render from lib/mock; the
 * streak is real, from `students.streak_count`.
 *
 * Prompt section 12 constrains this page more than any other: each achievement
 * states what was done and when, never what it says about the student, and
 * there is no comparison to anyone else. A lapsed streak is a fact, not a
 * failure to comment on.
 */
export const dynamic = 'force-dynamic';

export default function AchievementsPage() {
  const student = getStudent(getCurrentStudentId());
  const earned = MOCK_ACHIEVEMENTS.filter((a) => a.earnedAt !== null);
  const inProgress = MOCK_ACHIEVEMENTS.filter((a) => a.earnedAt === null);

  return (
    <main id="main" className={styles.page}>
      <header className={styles.greeting}>
        <h1>Achievements</h1>
        <p className={styles.subtitle}>
          What you have done so far. Each one records an action and a date, nothing more.
        </p>
        <MockNotice flow={7} />
      </header>

      <section className={styles.grid}>
        <StatTile
          icon="flame"
          tone="brand"
          label="Study streak"
          value={student?.streak_count ?? 0}
          suffix={student?.streak_count === 1 ? 'day' : 'days'}
          caption="Consecutive days with study activity"
        />
        <StatTile icon="achievements" tone="positive" label="Earned" value={earned.length} total={MOCK_ACHIEVEMENTS.length} caption="Milestones reached" />
      </section>

      <Card title="Your achievements">
        <ul className={styles.list}>
          {earned.map((achievement) => (
            <li key={achievement.id} className={styles.row}>
              <span className={styles.question}>
                <Icon name="achievements" size={16} /> {achievement.title}
              </span>
              <span className={styles.rowMeta}>
                {achievement.detail} Earned {achievement.earnedAt!.slice(0, 10)}.
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="In progress">
        <ul className={styles.list}>
          {inProgress.map((achievement) => (
            <li key={achievement.id} className={styles.row}>
              <span className={styles.question}>{achievement.title}</span>
              <span className={styles.rowMeta}>
                {achievement.detail}
                {achievement.progress
                  ? ` ${achievement.progress.current} of ${achievement.progress.target}.`
                  : ''}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      {/* The page ends in something to do rather than on a tally. */}
      <Card title="Continue learning">
        <div className={styles.actions}>
          <Link href="/planner">Go to your study plan</Link>
          <Link href="/practice">Take a quiz</Link>
          <Link href="/progress">Review a weak area</Link>
        </div>
      </Card>
    </main>
  );
}
