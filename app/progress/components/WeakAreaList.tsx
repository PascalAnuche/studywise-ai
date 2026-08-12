import Link from 'next/link';
import type { TopicProgressDto } from '@/lib/db/progress';
import styles from './WeakAreaList.module.css';

/**
 * PRD 7.4: weak areas are visible individually, never folded into one overall
 * score. Each one shows the quiz result that flagged it.
 *
 * Every string here describes the work. Prompt section 12 forbids using
 * performance to characterise the student, so this says "3 of 5 questions were
 * answered incorrectly", never "you are weak at this".
 *
 * The two links are the way out: Practice and Learn, so the page ends in
 * something to do rather than a list of shortcomings.
 */
export interface WeakAreaListProps {
  areas: TopicProgressDto[];
}

export function WeakAreaList({ areas }: WeakAreaListProps) {
  if (areas.length === 0) {
    return <p className={styles.empty}>No topics are flagged from recent quizzes.</p>;
  }

  return (
    <ul className={styles.list}>
      {areas.map((area) => (
        <li key={area.id} className={styles.item}>
          <div className={styles.head}>
            <span className={styles.topic}>{area.topic}</span>
            <span className={styles.meta}>
              {area.lastStudiedAt ? `Last studied ${area.lastStudiedAt.slice(0, 10)}` : 'Not studied yet'}
            </span>
          </div>

          <span className={styles.evidence}>
            {area.latestQuiz
              ? `${area.latestQuiz.missed} of ${area.latestQuiz.total} questions were answered incorrectly${
                  area.latestQuiz.completedAt
                    ? ` on ${area.latestQuiz.completedAt.slice(0, 10)}`
                    : ''
                }.`
              : 'Flagged from earlier practice.'}
          </span>

          <div className={styles.actions}>
            <Link className={styles.action} href={`/assistant?topic=${encodeURIComponent(area.topic)}`}>
              Go over it
            </Link>
            <Link className={styles.action} href={`/practice?topic=${encodeURIComponent(area.topic)}`}>
              Practise it again
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
