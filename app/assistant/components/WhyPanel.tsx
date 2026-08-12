import { ConfidenceBadge } from '@/components/ConfidenceBadge';
import type { Confidence } from '@/lib/db/types';
import type { MockSource } from '@/lib/mock';
import styles from './WhyPanel.module.css';

/**
 * The reasoning and citations for the answer on screen.
 *
 * Sources are sample data: no provider returns citations yet and there is no
 * column to store them in, so the panel says so. Presenting invented citations
 * as real would undermine the exact thing this product is built to do.
 */
export interface WhyPanelProps {
  reasoning: string | null;
  confidence: Confidence | null;
  sources: MockSource[];
  /** Shown beyond the first few, as "+2 more" in the design. */
  visibleSources?: number;
}

export function WhyPanel({ reasoning, confidence, sources, visibleSources = 3 }: WhyPanelProps) {
  if (!reasoning) {
    return (
      <aside className={styles.panel}>
        <h2 className={styles.title}>Why this answer?</h2>
        <p className={styles.empty}>
          Ask a question and the reasoning behind the answer appears here, with the sources it
          leaned on.
        </p>
      </aside>
    );
  }

  const shown = sources.slice(0, visibleSources);
  const hidden = sources.length - shown.length;

  return (
    <aside className={styles.panel}>
      <h2 className={styles.title}>Why this answer?</h2>
      <p className={styles.reasoning}>{reasoning}</p>

      {confidence && (
        <span className={styles.confidence}>
          <ConfidenceBadge confidence={confidence} />
        </span>
      )}

      {shown.length > 0 && (
        <>
          <span className={styles.sourcesLabel}>Sources</span>
          <div className={styles.sources}>
            {shown.map((source) => (
              <a
                key={source.label}
                className={styles.source}
                href={source.href}
                target="_blank"
                rel="noreferrer noopener"
              >
                {source.label}
              </a>
            ))}
            {hidden > 0 && <span className={styles.more}>+{hidden} more</span>}
          </div>
          <p className={styles.note}>
            Sample sources. No provider returns citations yet, so these are illustrative and are not
            what the answer was written from.
          </p>
        </>
      )}
    </aside>
  );
}
