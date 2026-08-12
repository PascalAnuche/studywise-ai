import type { Confidence } from '@/lib/db/types';
import styles from './ConfidenceBadge.module.css';

/**
 * Renders the confidence signal from prompt section 9. Used anywhere an AI
 * response is shown (COMPONENTS.md).
 *
 * The stored value doubles as the label today. If the prompt's "one valid
 * interpretation" wording wins over the data model's "one interpretation",
 * change LABELS here and leave the stored value alone.
 */
const PRESENTATION: Record<Confidence, { className: string; label: string; hint: string }> = {
  'well-established': {
    className: styles.established,
    label: 'Well established',
    hint: 'Broad consensus, safe to rely on.',
  },
  'one interpretation': {
    className: styles.interpretation,
    label: 'One interpretation',
    hint: 'Defensible, but not the only reading.',
  },
  'worth verifying': {
    className: styles.verify,
    label: 'Worth verifying',
    hint: 'Check this against your course materials.',
  },
};

export interface ConfidenceBadgeProps {
  confidence: Confidence;
}

export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  const { className, label, hint } = PRESENTATION[confidence];

  return (
    <span className={`${styles.badge} ${className}`} title={hint}>
      <span className={styles.dot} aria-hidden="true" />
      <span>Confidence: {label}</span>
    </span>
  );
}
