import type { ReactNode } from 'react';
import styles from './ReasoningPanel.module.css';

/**
 * The "because" half of the explainability format (prompt section 9).
 *
 * Collapsed by default. The answer is what the student asked for; the reasoning
 * is what lets them check it. Showing both expanded at once buries the answer,
 * which section 7 of the prompt explicitly warns against.
 *
 * Uses <details>/<summary> rather than state, so it renders on the server, works
 * with JavaScript disabled, and inherits keyboard and screen-reader behaviour
 * from the platform instead of reimplementing it.
 */
export interface ReasoningPanelProps {
  reasoning: string;
  /** Open on first render, e.g. after a student says they didn't understand. */
  defaultOpen?: boolean;
  children?: ReactNode;
}

export function ReasoningPanel({ reasoning, defaultOpen = false, children }: ReasoningPanelProps) {
  return (
    <details className={styles.panel} open={defaultOpen}>
      <summary className={styles.summary}>
        <span className={styles.chevron} aria-hidden="true">
          ▶
        </span>
        Why this answer
      </summary>
      <div className={styles.body}>
        <span className={styles.label}>Because</span>
        <p className={styles.because}>{reasoning}</p>
        {children}
      </div>
    </details>
  );
}
