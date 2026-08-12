import styles from './ResultsSummary.module.css';

/**
 * Post-quiz results (PRD 7.3).
 *
 * Reports the work, never the person. Prompt section 12 forbids using
 * performance data to say anything about a student's ability, which rules out
 * both "well done" and "you struggled here". A count and a next step is the
 * whole of it.
 */
export interface ResultsSummaryProps {
  correct: number;
  total: number;
  topic: string;
}

export function ResultsSummary({ correct, total, topic }: ResultsSummaryProps) {
  const incorrect = total - correct;
  const percent = total === 0 ? 0 : Math.round((correct / total) * 100);

  return (
    <div className={styles.summary}>
      <div className={styles.headline}>
        <span className={styles.score}>{percent}%</span>
        <span className={styles.outOf}>
          {correct} of {total} correct
        </span>
      </div>

      <div className={styles.breakdown}>
        <span className={`${styles.chip} ${styles.right}`}>
          <span className={styles.chipValue}>{correct}</span> right
        </span>
        {incorrect > 0 && (
          <span className={`${styles.chip} ${styles.wrong}`}>
            <span className={styles.chipValue}>{incorrect}</span> to revisit
          </span>
        )}
      </div>

      <p className={styles.note}>
        {incorrect === 0
          ? `Every question on ${topic} was answered correctly. The reasoning for each is below if you want to check it.`
          : `${incorrect} question${incorrect === 1 ? '' : 's'} on ${topic} ${incorrect === 1 ? 'was' : 'were'} answered incorrectly. Each one below shows the correct answer and why.`}
      </p>
    </div>
  );
}
