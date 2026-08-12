'use client';

import type { ReactNode } from 'react';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import styles from '../catalogue.module.css';

/**
 * Catalogue scaffolding, plus the form controls.
 *
 * The controls are here rather than on the page because they are interactive
 * and need a client boundary; the page itself stays a server component so the
 * response states can come from the real adapter.
 */
export function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.section}>
      <header className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {note && <span className={styles.sectionNote}>{note}</span>}
      </header>
      <div className={styles.specimens}>{children}</div>
    </section>
  );
}

export function Specimen({
  label,
  wide,
  children,
}: {
  label: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`${styles.specimen} ${wide ? styles.wide : ''}`}>
      <span className={styles.label}>{label}</span>
      <div className={styles.stage}>{children}</div>
    </div>
  );
}

export function PreviewControls() {
  return (
    <>
      <Specimen label="Input, with a hint" wide>
        <div className={styles.stack}>
          <Input label="Subject" placeholder="Algorithms" hint="Narrows the questions." />
        </div>
      </Specimen>

      <Specimen label="Input, with an error" wide>
        <div className={styles.stack}>
          <Input label="Topic" defaultValue="" error="Add at least one topic." />
        </div>
      </Specimen>

      <Specimen label="Input, disabled" wide>
        <div className={styles.stack}>
          <Input label="Locked" defaultValue="Cannot edit" disabled />
        </div>
      </Specimen>

      <Specimen label="Select" wide>
        <div className={styles.stack}>
          <Select
            label="How often"
            hint="Sessions are spaced to match this."
            options={[
              { value: '1x/week', label: 'Once a week' },
              { value: '3x/week', label: 'Three times a week' },
            ]}
          />
        </div>
      </Specimen>
    </>
  );
}
