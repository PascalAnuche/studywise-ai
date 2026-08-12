import { Icon } from '@/components/Icon';
import styles from './LearningProgress.module.css';

/**
 * Weekly progress, per the approved Home design.
 *
 * The ring is a second encoding: the percentage is always present as text, and
 * the ring carries an accessible role so the value is announced once, not twice.
 *
 * The callout celebrates progress toward a goal the student set. Prompt section
 * 6 asks for a warm, encouraging tone; section 12 rules out claims about the
 * student's ability, which is a different thing and stays out.
 */
export interface LearningProgressProps {
  goalPercent: number;
  studyTime: string;
  topicsLearned: number;
  questionsSolved: number;
  /** Weekly totals for the sparkline, oldest first. */
  trend: number[];
}

function Ring({ percent }: { percent: number }) {
  const size = 132;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (Math.min(Math.max(percent, 0), 100) / 100) * circumference;

  return (
    <div className={styles.ring}>
      <svg
        width={size}
        height={size}
        role="img"
        aria-label={`${percent}% of your weekly goal`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={stroke}
        />
        {/*
          Omitted entirely at zero. A round line cap on a zero-length dash still
          paints, leaving a stray dot at the top of an empty ring.
        */}
        {filled > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circumference - filled}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        )}
      </svg>
      <span className={styles.ringLabel} aria-hidden="true">
        <span className={styles.ringValue}>{percent}%</span>
        <span className={styles.ringCaption}>Goal Progress</span>
      </span>
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;

  const width = 120;
  const height = 40;
  const max = Math.max(...values, 1);
  const step = width / (values.length - 1);
  const points = values
    .map((value, index) => `${index * step},${height - (value / max) * (height - 4) - 2}`)
    .join(' ');

  return (
    <svg className={styles.spark} width={width} height={height} aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LearningProgress({
  goalPercent,
  studyTime,
  topicsLearned,
  questionsSolved,
  trend,
}: LearningProgressProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.top}>
        <Ring percent={goalPercent} />

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statIcon}>
              <Icon name="sparkle" size={18} />
            </span>
            <span className={styles.statBody}>
              <span className={styles.statValue}>{studyTime}</span>
              <span className={styles.statLabel}>Study Time</span>
            </span>
          </div>

          <div className={styles.stat}>
            <span className={styles.statIcon}>
              <Icon name="check" size={18} />
            </span>
            <span className={styles.statBody}>
              <span className={styles.statValue}>{topicsLearned}</span>
              <span className={styles.statLabel}>Topics Learned</span>
            </span>
          </div>

          <div className={styles.stat}>
            <span className={styles.statIcon}>
              <Icon name="target" size={18} />
            </span>
            <span className={styles.statBody}>
              <span className={styles.statValue}>{questionsSolved}</span>
              <span className={styles.statLabel}>Questions Solved</span>
            </span>
          </div>
        </div>
      </div>

      {goalPercent > 0 && (
        <div className={styles.callout}>
          <div className={styles.calloutBody}>
            <span className={styles.calloutTitle}>Great job! 🎉</span>
            <span className={styles.calloutText}>
              You&rsquo;re {goalPercent}% toward your weekly goal. Keep up the momentum!
            </span>
          </div>
          <Sparkline values={trend} />
        </div>
      )}
    </div>
  );
}
