import Link from 'next/link';
import styles from './RecommendationCard.module.css';

/**
 * A post-quiz recommendation (PRD 7.3).
 *
 * Always shows its reason. A recommendation that can't say why it was made is
 * the generic advice the PRD explicitly rules out, and it would break the
 * explainability principle the rest of the product is built on.
 *
 * The two actions are the cross-feature seams: this is where Practice hands
 * back into Learn and Plan.
 */
export interface RecommendationCardProps {
  topic: string;
  reason: string;
}

export function RecommendationCard({ topic, reason }: RecommendationCardProps) {
  return (
    <article className={styles.card}>
      <span className={styles.topic}>{topic}</span>
      <span className={styles.reason}>{reason}</span>
      <div className={styles.actions}>
        <Link className={styles.action} href={`/assistant?topic=${encodeURIComponent(topic)}`}>
          Go over it
        </Link>
        <Link className={styles.action} href={`/planner?topic=${encodeURIComponent(topic)}`}>
          Add to my plan
        </Link>
      </div>
    </article>
  );
}
