'use client';

import { Button } from '@/components/Button';
import styles from './UnderstandingCheckpoint.module.css';

/**
 * PRD 7.1's "do you understand?" checkpoint.
 *
 * The interface owns this question, not the assistant: prompt section 10 tells
 * the model not to ask it itself, because a self-reported "does that make
 * sense?" buried in prose can't be measured. Answering it is what turns a
 * delivered response into a measured one (PRD section 3).
 *
 * Unanswered is a real state. Leaving without answering keeps `understood` null,
 * which is not the same as "no" and must never be counted as one.
 */
export interface UnderstandingCheckpointProps {
  understood: boolean | null;
  pending?: boolean;
  onAnswer: (understood: boolean) => void;
}

export function UnderstandingCheckpoint({
  understood,
  pending = false,
  onAnswer,
}: UnderstandingCheckpointProps) {
  if (understood !== null) {
    return (
      <p className={styles.resolved}>
        {understood
          ? 'Saved. Ask a follow-up any time.'
          : "Noted, let's come at it from a different angle."}
      </p>
    );
  }

  return (
    <div className={styles.checkpoint}>
      <span className={styles.question}>Does that make sense?</span>
      <div className={styles.actions}>
        <Button size="small" loading={pending} onClick={() => onAnswer(true)}>
          Yes, got it
        </Button>
        <Button size="small" variant="ghost" disabled={pending} onClick={() => onAnswer(false)}>
          Not quite
        </Button>
      </div>
    </div>
  );
}
