'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from '@/components/Button';
import { DatePicker } from '@/components/DatePicker';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import styles from '../catalogue.module.css';

const FREQUENCIES = [
  { value: '1x/week', label: 'Once a week' },
  { value: '2x/week', label: 'Twice a week' },
  { value: '3x/week', label: 'Three times a week' },
  { value: '5x/week', label: 'Five times a week' },
];

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
  const [frequency, setFrequency] = useState('3x/week');
  const [date, setDate] = useState('');

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
            value={frequency}
            onValueChange={setFrequency}
            options={FREQUENCIES}
          />
        </div>
      </Specimen>

      <Specimen label="Select, disabled" wide>
        <div className={styles.stack}>
          <Select
            label="How often"
            value={frequency}
            onValueChange={setFrequency}
            options={FREQUENCIES}
            disabled
          />
        </div>
      </Specimen>

      <Specimen label="Date picker" wide>
        <div className={styles.stack}>
          <DatePicker
            label="Target date"
            value={date}
            onValueChange={setDate}
            hint="An exam date, if you have one."
          />
        </div>
      </Specimen>

      <Specimen label="Date picker, empty" wide>
        <div className={styles.stack}>
          <DatePicker label="Start date" value="" onValueChange={() => {}} />
        </div>
      </Specimen>

      <Specimen label="Input with a trailing action" wide>
        <div className={styles.stack}>
          <Input
            label="Topics"
            placeholder="Recursion"
            hint="The button lines up with the input, not with this hint."
            action={
              <Button type="button" variant="ghost">
                Add
              </Button>
            }
          />
        </div>
      </Specimen>
    </>
  );
}
