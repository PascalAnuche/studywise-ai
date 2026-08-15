'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnswerBody } from '@/components/AnswerBody';
import { Icon, type IconName } from '@/components/Icon';
import { Toast } from '@/components/Toast';
import type { Confidence } from '@/lib/db/types';
import { UnderstandingCheckpoint } from './UnderstandingCheckpoint';
import styles from '../assistant.module.css';

/**
 * One conversation, per the approved Assistant design.
 *
 * The answer renders through AnswerBody so a comparison comes back as a real
 * table. The four suggestions beneath it are prompts the student can send with
 * one tap, which is the design's way of offering the follow-ups prompt section
 * 4 asks for.
 */
export interface Turn {
  id: number | null;
  question: string;
  answer: string;
  confidence: Confidence;
  sentAt?: string;
}

export interface ConversationProps {
  explanationId: number | null;
  question: string;
  answer: string;
  confidence: Confidence;
  understood: boolean | null;
  askedAt: string;
  answeredAt: string;
  followUps: Turn[];
}

/** The four moves offered under an answer. */
const SUGGESTIONS: { label: string; icon: IconName; prompt: string }[] = [
  {
    label: 'Explain this answer',
    icon: 'sparkle',
    prompt: 'Explain this answer in more depth, and show the reasoning step by step.',
  },
  { label: 'Give an example', icon: 'code', prompt: 'Give me a worked example of this.' },
  {
    label: 'Compare pros and cons',
    icon: 'scales',
    prompt: 'Compare the pros and cons of each option here.',
  },
];

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
      await setUnderstood(value);
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
        <div className={styles.question}>
          {props.question}
          <span className={styles.questionMeta}>
            {props.askedAt}
            <Icon name="check" size={12} />
          </span>
        </div>

        <div className={styles.answerRow}>
          <span className={styles.answerAvatar} aria-hidden="true">
            <Icon name="sparkle" size={16} />
          </span>

          <div className={styles.answer}>
            <AnswerBody text={props.answer} />

            <div className={styles.toolbar}>
              {/*
                Copy is real. Feedback and read-aloud have no store and no
                decision behind them, so they say so rather than discarding a
                student's signal silently.
              */}
              <button
                type="button"
                className={styles.tool}
                aria-label="Copy this answer"
                onClick={() => void navigator.clipboard?.writeText(props.answer)}
              >
                <Icon name="copy" size={16} />
              </button>
              {(['thumb-up', 'thumb-down', 'speaker'] as const).map((icon) => (
                <button
                  key={icon}
                  type="button"
                  className={styles.tool}
                  disabled
                  title="Not available yet"
                  aria-label={icon === 'speaker' ? 'Read this answer aloud' : `Mark answer ${icon}`}
                >
                  <Icon name={icon} size={16} />
                </button>
              ))}
              <span className={styles.toolSpacer} />
              <span className={styles.sentAt}>{props.answeredAt}</span>
            </div>

            {props.explanationId !== null && (
              <UnderstandingCheckpoint
                understood={understood}
                pending={checkpointPending}
                onAnswer={answerCheckpoint}
              />
            )}
          </div>
        </div>

        <div className={styles.suggestions}>
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion.label}
              type="button"
              className={styles.suggestion}
              disabled={pending || !props.explanationId}
              onClick={() => void send(suggestion.prompt)}
            >
              <span className={styles.suggestionIcon} aria-hidden="true">
                <Icon name={suggestion.icon} size={16} />
              </span>
              {suggestion.label}
            </button>
          ))}
          <button
            type="button"
            className={styles.suggestion}
            disabled
            title="Saving an explanation is not built yet"
          >
            <span className={styles.suggestionIcon} aria-hidden="true">
              <Icon name="bookmark" size={16} />
            </span>
            Save explanation
          </button>
        </div>

        {turns.length > 0 && (
          <div className={styles.followUps}>
            {turns.map((turn, index) => (
              <div key={turn.id ?? `pending-${index}`} className={styles.conversation}>
                <div className={styles.question}>{turn.question}</div>
                <div className={styles.answerRow}>
                  <span className={styles.answerAvatar} aria-hidden="true">
                    <Icon name="sparkle" size={16} />
                  </span>
                  <div className={styles.answer}>
                    <AnswerBody text={turn.answer} />
                  </div>
                </div>
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
          Ask anything
        </label>
        <textarea
          id="assistant-follow-up"
          className={styles.input}
          rows={2}
          value={followUp}
          placeholder="Ask anything..."
          disabled={pending || !props.explanationId}
          onChange={(event) => setFollowUp(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              const trimmed = followUp.trim();
              if (!trimmed) return;
              setFollowUp('');
              void send(trimmed);
            }
          }}
        />

        <div className={styles.composerRow}>
          {(['attach', 'mic', 'lightbulb'] as const).map((icon) => (
            <button
              key={icon}
              type="button"
              className={styles.tool}
              disabled
              title="Not available yet"
              aria-label={icon === 'attach' ? 'Attach a file' : icon === 'mic' ? 'Dictate' : 'Prompt ideas'}
            >
              <Icon name={icon} size={18} />
            </button>
          ))}
          <span className={styles.toolSpacer} />
          <button
            type="submit"
            className={styles.send}
            disabled={pending || !followUp.trim() || !props.explanationId}
            aria-label="Send"
          >
            <Icon name="send" size={18} />
          </button>
        </div>
      </form>

      <p className={styles.disclaimer}>
        AI responses can make mistakes. Please verify important information.
      </p>
    </>
  );
}
