'use client';

import { useState } from 'react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { DatePicker } from '@/components/DatePicker';
import type { PlanInput } from '@/lib/ai/types';
import styles from './PlanForm.module.css';

/**
 * PRD 7.2: plan generation takes subject, goals, topics and frequency as
 * structured inputs, not free text alone.
 *
 * Topics are entered as discrete chips rather than a comma-separated string on
 * purpose. The assistant is told never to invent a topic the student didn't
 * list, so the list has to be unambiguous before it leaves the browser.
 */
const FREQUENCIES = [
  { value: '1x/week', label: 'Once a week' },
  { value: '2x/week', label: 'Twice a week' },
  { value: '3x/week', label: 'Three times a week' },
  { value: '5x/week', label: 'Five times a week' },
];

export interface PlanFormProps {
  pending?: boolean;
  onSubmit: (input: PlanInput) => void;
}

export function PlanForm({ pending = false, onSubmit }: PlanFormProps) {
  const [subject, setSubject] = useState('');
  const [frequency, setFrequency] = useState(FREQUENCIES[2].value);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [topicDraft, setTopicDraft] = useState('');
  const [goalDraft, setGoalDraft] = useState('');

  const canSubmit = subject.trim().length > 0 && topics.length > 0 && !pending;

  function addTo(list: string[], setList: (next: string[]) => void, value: string, clear: () => void) {
    const trimmed = value.trim();
    if (!trimmed || list.includes(trimmed)) return;
    setList([...list, trimmed]);
    clear();
  }

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSubmit) return;
        onSubmit({
          subject: subject.trim(),
          goals,
          topics,
          frequency,
          startDate: startDate || null,
          endDate: endDate || null,
        });
      }}
    >
      <div className={styles.row}>
        <Input
          label="Subject"
          value={subject}
          required
          placeholder="Algorithms"
          onChange={(event) => setSubject(event.target.value)}
        />
        <Select
          label="How often"
          value={frequency}
          options={FREQUENCIES}
          hint="Sessions are spaced to match this."
          onValueChange={setFrequency}
        />
      </div>

      <div className={styles.row}>
        <DatePicker label="Start date" value={startDate} onValueChange={setStartDate} />
        <DatePicker
          label="Target date"
          value={endDate}
          onValueChange={setEndDate}
          /* A target before the start is not a plan anyone can follow. */
          min={startDate || undefined}
          hint="An exam date, if you have one."
        />
      </div>

      <div>
        <Input
          label="Topics"
          value={topicDraft}
          placeholder="Recursion"
          hint="Add each topic separately. The plan only covers what you list here."
          onChange={(event) => setTopicDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              addTo(topics, setTopics, topicDraft, () => setTopicDraft(''));
            }
          }}
          action={
            <Button
              type="button"
              variant="ghost"
              onClick={() => addTo(topics, setTopics, topicDraft, () => setTopicDraft(''))}
            >
              Add
            </Button>
          }
        />

        {topics.length > 0 && (
          <ul className={styles.chips} style={{ marginTop: 'var(--spacing-md)' }}>
            {topics.map((topic) => (
              <li key={topic} className={styles.chip}>
                {topic}
                <button
                  type="button"
                  className={styles.chipRemove}
                  aria-label={`Remove ${topic}`}
                  onClick={() => setTopics(topics.filter((t) => t !== topic))}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <Input
          label="Goals"
          value={goalDraft}
          placeholder="Pass the January exam"
          onChange={(event) => setGoalDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              addTo(goals, setGoals, goalDraft, () => setGoalDraft(''));
            }
          }}
          action={
            <Button
              type="button"
              variant="ghost"
              onClick={() => addTo(goals, setGoals, goalDraft, () => setGoalDraft(''))}
            >
              Add
            </Button>
          }
        />

        {goals.length > 0 && (
          <ul className={styles.chips} style={{ marginTop: 'var(--spacing-md)' }}>
            {goals.map((goal) => (
              <li key={goal} className={styles.chip}>
                {goal}
                <button
                  type="button"
                  className={styles.chipRemove}
                  aria-label={`Remove ${goal}`}
                  onClick={() => setGoals(goals.filter((g) => g !== goal))}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={styles.actions}>
        <Button type="submit" loading={pending} disabled={!canSubmit}>
          Build my plan
        </Button>
        <span className={styles.note}>
          {topics.length === 0 ? 'Add at least one topic.' : 'You can edit everything afterwards.'}
        </span>
      </div>
    </form>
  );
}
