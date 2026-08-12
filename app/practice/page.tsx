import { Card } from '@/components/Card';
import { listQuizzes } from '@/lib/db/practice';
import { getCurrentStudentId } from '@/lib/session';
import { PracticeClient } from './components/PracticeClient';
import styles from '../page.module.css';

export const dynamic = 'force-dynamic';

/**
 * AI-Generated Quiz — PRD 7.3.
 *
 * `?topic=` arrives from a follow-up offer in the Assistant or a recommendation
 * after a previous quiz. Those are the seams that make the four features one
 * product rather than four (PRD section 3).
 */
export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const { topic } = await searchParams;
  const studentId = getCurrentStudentId();
  const history = listQuizzes(studentId, 5);

  return (
    <main id="main" className={styles.page}>
      <header className={styles.greeting}>
        <h1>Practice</h1>
        <p className={styles.subtitle}>
          Questions on what you&rsquo;re studying. Every answer comes back with the reasoning, and
          what you miss turns into a suggestion for what to do next.
        </p>
      </header>

      <PracticeClient initialTopic={topic ?? ''} />

      {history.length > 0 && (
        <Card title="Earlier quizzes">
          <ul className={styles.list}>
            {history.map((quiz) => (
              <li key={quiz.id} className={styles.row}>
                <span className={styles.question}>
                  {quiz.topic ?? quiz.subject}
                  <span className={styles.rowMeta}> · {quiz.difficulty}</span>
                </span>
                <span className={styles.rowMeta}>
                  {quiz.score === null
                    ? 'not submitted'
                    : `${Math.round(quiz.score * 100)}% · ${quiz.completed_at?.slice(0, 10)}`}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </main>
  );
}
