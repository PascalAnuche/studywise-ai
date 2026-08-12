import styles from './QuizProgress.module.css';

/**
 * How far through the quiz the student is.
 *
 * Counts answered questions rather than time. Prompt section 12 rules out
 * anything that reads as a judgement, so this stays a plain count with no
 * pacing pressure.
 */
export interface QuizProgressProps {
  answered: number;
  total: number;
}

export function QuizProgress({ answered, total }: QuizProgressProps) {
  const percent = total === 0 ? 0 : Math.round((answered / total) * 100);

  return (
    <div className={styles.progress}>
      <div className={styles.row}>
        <span>
          {answered} of {total} answered
        </span>
        <span>{percent}%</span>
      </div>
      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={answered}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label="Questions answered"
      >
        <div className={styles.bar} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
