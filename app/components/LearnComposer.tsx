'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon, type IconName } from '@/components/Icon';
import styles from './LearnComposer.module.css';

/**
 * The Home composer from the approved design.
 *
 * Submitting hands off to the Assistant with the question prefilled, rather
 * than answering inline: flow 1 owns the explanation thread, and duplicating it
 * here would mean two places to keep the section 9 format correct.
 *
 * Each quick action starts a different flow. "Generate Quiz" is how a student
 * reaches Practice, which the design's sidebar omits.
 */
const QUICK_ACTIONS: { label: string; icon: IconName; href: string }[] = [
  { label: 'Explain a Topic', icon: 'lightbulb', href: '/assistant?intent=explain' },
  { label: 'Solve a Problem', icon: 'target', href: '/assistant?intent=solve' },
  { label: 'Summarize Notes', icon: 'notes', href: '/notes?intent=summarize' },
  { label: 'Generate Quiz', icon: 'practice', href: '/practice' },
];

export function LearnComposer() {
  const router = useRouter();
  const [question, setQuestion] = useState('');

  function submit() {
    const trimmed = question.trim();
    if (!trimmed) return;
    router.push(`/assistant?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <section className={styles.composer} aria-labelledby="composer-title">
      <h2 id="composer-title" className={styles.title}>
        What would you like to learn today?
      </h2>

      <form
        className={styles.row}
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <label className="visually-hidden" htmlFor="home-question">
          Ask anything
        </label>
        <input
          id="home-question"
          className={styles.input}
          value={question}
          placeholder="Ask anything..."
          onChange={(event) => setQuestion(event.target.value)}
        />
        <button type="submit" className={styles.send} disabled={!question.trim()} aria-label="Ask">
          <Icon name="send" size={20} />
        </button>
      </form>

      <div className={styles.actions}>
        {QUICK_ACTIONS.map((action) => (
          <a key={action.label} href={action.href} className={styles.action}>
            <span className={styles.actionIcon}>
              <Icon name={action.icon} size={18} />
            </span>
            {action.label}
          </a>
        ))}
      </div>
    </section>
  );
}
