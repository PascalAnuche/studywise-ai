import Link from 'next/link';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { MATERIAL_KIND_LABEL, MOCK_MATERIALS } from '@/lib/mock';
import { MockNotice } from '../components/MockNotice';
import styles from '../page.module.css';

/**
 * Resources & Upload Materials — flow 4.
 *
 * Renders from lib/mock: this flow has no tables yet. PRD section 7.5 carries
 * the requirements, and the open question about lecture-notes upload is now
 * resolved in favour of v1.
 */
export const dynamic = 'force-dynamic';

export default function ResourcesPage() {
  const ready = MOCK_MATERIALS.filter((material) => material.status === 'ready');
  const processing = MOCK_MATERIALS.filter((material) => material.status === 'processing');

  return (
    <main id="main" className={styles.page}>
      <header className={styles.greeting}>
        <h1>Resources</h1>
        <p className={styles.subtitle}>
          Your lecture notes, slides and past papers. Once a material is added, every other feature
          can work from it.
        </p>
        <MockNotice flow={4} />
      </header>

      <Card
        title="My Materials"
        action={
          <Button size="small">
            <Icon name="upload" size={16} /> Upload material
          </Button>
        }
      >
        <ul className={styles.list}>
          {ready.map((material) => (
            <li key={material.id} className={styles.row}>
              <span className={styles.question}>
                {material.title}
                <span className={styles.rowMeta}>
                  {' '}
                  · {MATERIAL_KIND_LABEL[material.kind]}
                </span>
              </span>
              <span className={styles.rowMeta}>
                {material.subject} · {material.sizeLabel}
                {material.pages ? ` · ${material.pages} pages` : ''}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      {processing.length > 0 && (
        <Card title="Being read">
          <ul className={styles.list}>
            {processing.map((material) => (
              <li key={material.id} className={styles.row}>
                <span className={styles.question}>{material.title}</span>
                {/* Processing state is visible, per PRD 7.5: a student should
                    never wonder whether an upload worked. */}
                <span className={styles.rowMeta}>Reading and understanding your material…</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card title="What you can do with a material">
        <ul className={styles.list}>
          <li className={styles.rowMeta}>Ask the assistant about it</li>
          <li className={styles.rowMeta}>Summarise it</li>
          <li className={styles.rowMeta}>Generate a quiz from it</li>
          <li className={styles.rowMeta}>Create a flashcard set from it</li>
        </ul>
        <p className={styles.notice} style={{ marginTop: 'var(--spacing-lg)' }}>
          <Link href="/assistant">Ask the assistant something</Link> in the meantime.
        </p>
      </Card>
    </main>
  );
}
