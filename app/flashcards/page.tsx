import { Card } from '@/components/Card';
import { StatTile } from '@/components/StatTile';
import { MOCK_FLASHCARD_SETS } from '@/lib/mock';
import { MockNotice } from '../components/MockNotice';
import styles from '../page.module.css';

/**
 * Flashcards — flow 5, the recall half. Renders from lib/mock; no tables yet.
 *
 * PRD 7.6: retention is shown per set, never as one overall score, and a card
 * marked for review comes back rather than being dropped.
 */
export const dynamic = 'force-dynamic';

export default function FlashcardsPage() {
  const reviewed = MOCK_FLASHCARD_SETS.filter((set) => set.lastReviewedAt !== null);
  const unreviewed = MOCK_FLASHCARD_SETS.filter((set) => set.lastReviewedAt === null);
  const dueForReview = reviewed.reduce((total, set) => total + set.forReview, 0);

  return (
    <main id="main" className={styles.page}>
      <header className={styles.greeting}>
        <h1>Flashcards</h1>
        <p className={styles.subtitle}>
          Active recall. Cards you did not know come back rather than being dropped from the set.
        </p>
        <MockNotice flow={5} />
      </header>

      <section className={styles.grid}>
        <StatTile icon="flashcards" tone="brand" label="Sets" value={MOCK_FLASHCARD_SETS.length} caption="Across your subjects" />
        <StatTile icon="check" tone="positive" label="Sets reviewed" value={reviewed.length} total={MOCK_FLASHCARD_SETS.length} caption="At least one pass" />
        <StatTile icon="target" tone="accent" label="Cards to revisit" value={dueForReview} caption="Marked for review on the last pass" />
      </section>

      <Card title="Your sets">
        <ul className={styles.list}>
          {reviewed.map((set) => (
            <li key={set.id} className={styles.row}>
              <span className={styles.question}>
                {set.title}
                <span className={styles.rowMeta}> · {set.subject}</span>
              </span>
              {/* Per set, never rolled into one retention number. */}
              <span className={styles.rowMeta}>
                {set.known} of {set.cardCount} known · {set.forReview} to revisit · last reviewed{' '}
                {set.lastReviewedAt!.slice(0, 10)}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      {unreviewed.length > 0 && (
        <Card title="Not started">
          <ul className={styles.list}>
            {unreviewed.map((set) => (
              <li key={set.id} className={styles.row}>
                <span className={styles.question}>
                  {set.title}
                  <span className={styles.rowMeta}> · {set.subject}</span>
                </span>
                <span className={styles.rowMeta}>{set.cardCount} cards</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </main>
  );
}
