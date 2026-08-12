'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnswerBody } from '@/components/AnswerBody';
import { ConfidenceBadge } from '@/components/ConfidenceBadge';
import { Icon } from '@/components/Icon';
import { Toast } from '@/components/Toast';
import type { Confidence } from '@/lib/db/types';
import { UnderstandingCheckpoint } from './UnderstandingCheckpoint';
import styles from '../assistant.module.css';

/**
 * One conversation, per the approved Assistant design.
 *
 * The answer renders through AnswerBody so a comparison comes back as a real
 * table. The reasoning lives in the "why" rail on this screen rather than in a
 * collapsible, which is why no ReasoningPanel appears here.
 */
export interface Turn {
  id: number | null;
  question: string;
  answer: string;
  confidence: Confidence;
}

export interface ConversationProps {
  explanationId: number | null;
  question: string;
  answer: string;
  confidence: Confidence;
  understood: boolean | null;
  followUps: Turn[];
}

export function Conversation(props: ConversationProps) {
  const router = useRouter();
  const [followUp, setFollowUp] = useState('');
  const [understood, setUnderstood] = useState(props.understood);
  const [turns, setTurns] = useState<Turn[]>(props.followUps);
  const [pending, setPending] = useState(false);
  const [checkpointPending, setCheckpointPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function post(path: string, body: unknown) {
    const response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(
        data && typeof data === 'object' && 'error' in data
          ? String((data as { error: unknown }).error)
          : 'Something went wrong'
      );
    }
    return (data ?? {}) as Record<string, unknown>;
  }

  async function send(question: string) {
    if (!props.explanationId) return;
    setPending(true);
    setError(null);
    try {
      const data = await post('/api/assistant/follow-up', {
        explanationId: props.explanationId,
        question,
      });
      const result = data.result as { kind: string; answer?: string; confidence?: Confidence };

      setTurns((current) => [
        ...current,
        {
          id: (data.followUpId as number | null) ?? null,
          question,
          answer: result.answer ?? '',
          confidence: (result.confidence ?? 'worth verifying') as Confidence,
        },
      ]);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not send your follow-up');
    } finally {
      setPending(false);
    }
  }

  async function answerCheckpoint(value: boolean) {
    if (!props.explanationId) return;
    setCheckpointPending(true);
    setError(null);
    try {
      await post('/api/assistant/checkpoint', {
        explanationId: props.explanationId,
        understood: value,
      });
      setUnderstood(value);
      // PRD 7.1: on "no" the assistant explains why and how, rather than
      // leaving the student where they were.
      if (!value) {
        await send(
          "I didn't follow that. Can you explain it a different way, with a worked example or smaller steps?"
        );
      }
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save your answer');
    } finally {
      setCheckpointPending(false);
    }
  }

  return (
    <>
      <div className={styles.conversation}>
        <p className={styles.question}>{props.question}</p>

        <div className={styles.answer}>
          <AnswerBody text={props.answer} />

          <div className={styles.toolbar}>
            <button
              type="button"
              className={styles.explain}
              disabled={pending}
              onClick={() =>
                send('Explain this answer in more depth, and show the reasoning step by step.')
              }
            >
              <Icon name="wand" size={14} />
              Explain this answer
            </button>

            <ConfidenceBadge confidence={props.confidence} />

            <span className={styles.spacer} />

            {/*
              Feedback has no table and no decision behind it, so these state
              that rather than silently discarding a student's signal.
            */}
            {(['thumb-up', 'thumb-down', 'bookmark'] as const).map((icon) => (
              <button
                key={icon}
                type="button"
                className={styles.tool}
                title="Not available yet"
                aria-disabled="true"
                onClick={(event) => event.preventDefault()}
              >
                <Icon name={icon} size={16} />
              </button>
            ))}
          </div>

          {props.explanationId !== null && (
            <UnderstandingCheckpoint
              understood={understood}
              pending={checkpointPending}
              onAnswer={answerCheckpoint}
            />
          )}
        </div>

        {turns.length > 0 && (
          <div className={styles.followUps}>
            {turns.map((turn, index) => (
              <div key={turn.id ?? `pending-${index}`} className={styles.answer}>
                <p className={styles.question}>{turn.question}</p>
                <AnswerBody text={turn.answer} />
                <ConfidenceBadge confidence={turn.confidence} />
              </div>
            ))}
          </div>
        )}

        {error && <Toast tone="caution" message={error} onDismiss={() => setError(null)} />}
      </div>

      <form
        className={styles.composer}
        onSubmit={(event) => {
          event.preventDefault();
          const trimmed = followUp.trim();
          if (!trimmed) return;
          setFollowUp('');
          void send(trimmed);
        }}
      >
        <label className="visually-hidden" htmlFor="assistant-follow-up">
          Ask a follow-up question
        </label>
        <input
          id="assistant-follow-up"
          className={styles.input}
          value={followUp}
          placeholder="Ask a follow-up question..."
          disabled={pending || !props.explanationId}
          onChange={(event) => setFollowUp(event.target.value)}
        />
        <button
          type="submit"
          className={styles.send}
          disabled={pending || !followUp.trim() || !props.explanationId}
          aria-label="Send"
        >
          <Icon name="send" size={18} />
        </button>
      </form>
    </>
  );
}
