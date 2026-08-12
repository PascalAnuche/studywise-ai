import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { MOCK_NOTES } from '@/lib/mock';
import { MockNotice } from '../components/MockNotice';
import styles from '../page.module.css';

/**
 * Notes — flow 5, the writing half. Renders from lib/mock; no tables yet.
 *
 * PRD 7.6: notes are the student's writing. The assistant may read, summarise
 * or quiz from a note; it does not rewrite one in place.
 */
export const dynamic = 'force-dynamic';

export default function NotesPage() {
  const bySubject = MOCK_NOTES.reduce<Record<string, typeof MOCK_NOTES>>((groups, note) => {
    groups[note.subject] = [...(groups[note.subject] ?? []), note];
    return groups;
  }, {});

  return (
    <main id="main" className={styles.page}>
      <header className={styles.greeting}>
        <h1>Notes</h1>
        <p className={styles.subtitle}>
          Your own writing. Hand any note to the assistant to talk through, or turn it into a quiz.
        </p>
        <MockNotice flow={5} />
      </header>

      {Object.entries(bySubject).map(([subject, notes]) => (
        <Card
          key={subject}
          title={subject}
          action={
            <Button size="small" variant="ghost">
              <Icon name="notes" size={16} /> New note
            </Button>
          }
        >
          <ul className={styles.list}>
            {notes.map((note) => (
              <li key={note.id} className={styles.explanation}>
                <span className={styles.question}>{note.title}</span>
                <span className={styles.rowMeta}>{note.excerpt}</span>
                <span className={styles.rowMeta}>
                  {note.wordCount} words · updated {note.updatedAt.slice(0, 10)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </main>
  );
}
