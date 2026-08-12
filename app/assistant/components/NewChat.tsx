'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { Toast } from '@/components/Toast';
import styles from '../assistant.module.css';

/**
 * The composer shown when there is no conversation yet.
 *
 * Asking creates the explanation and reloads onto it, so a new chat and a
 * resumed one render through exactly the same path.
 */
export function NewChat({ initialQuestion = '' }: { initialQuestion?: string }) {
  const router = useRouter();
  const [question, setQuestion] = useState(initialQuestion);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ask() {
    const trimmed = question.trim();
    if (!trimmed) return;

    setPending(true);
    setError(null);
    try {
      const response = await fetch('/api/assistant/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmed }),
      });
      const data: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          data && typeof data === 'object' && 'error' in data
            ? String((data as { error: unknown }).error)
            : 'Could not reach the assistant'
        );
      }

      const explanationId = (data as { explanationId: number | null }).explanationId;
      setQuestion('');
      // A clarification or an escalation has no id, so there is nothing to open.
      router.push(explanationId ? `/assistant?chat=${explanationId}` : '/assistant');
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not reach the assistant');
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      {error && (
        <div style={{ padding: '0 var(--spacing-xl)' }}>
          <Toast tone="caution" message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      <form
        className={styles.composer}
        onSubmit={(event) => {
          event.preventDefault();
          void ask();
        }}
      >
        <label className="visually-hidden" htmlFor="assistant-new-question">
          Ask a question
        </label>
        <input
          id="assistant-new-question"
          className={styles.input}
          value={question}
          placeholder="Ask anything..."
          disabled={pending}
          onChange={(event) => setQuestion(event.target.value)}
        />
        <button
          type="submit"
          className={styles.send}
          disabled={pending || !question.trim()}
          aria-label="Ask"
        >
          <Icon name="send" size={18} />
        </button>
      </form>
    </>
  );
}
