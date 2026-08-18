'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConfidenceBadge } from '@/components/ConfidenceBadge';
import { Icon } from '@/components/Icon';
import type { Confidence } from '@/lib/db/types';
import styles from './AssistantRail.module.css';

/**
 * The AI Study Assistant rail on Home, per the approved design.
 *
 * A reading surface, not a second Assistant. It shows the most recent saved
 * explanation in the section 9 format and hands every interaction off to
 * /assistant, so one place owns the thread and one place owns the
 * answer/because/confidence contract.
 *
 * Sources are new in this design: prompt section 9 defines answer, because and
 * confidence, and citations sit alongside them. Until the provider returns
 * them, the panel renders the sources it has and omits the block otherwise,
 * rather than inventing citations, which would be the worst possible failure
 * for a product whose whole thesis is verifiability.
 */
export interface RailExplanation {
  id: number;
  question: string;
  answer: string;
  reasoning: string;
  confidence: Confidence;
  sources: { label: string; href: string }[];
}

export interface AssistantRailProps {
  latest: RailExplanation | null;
}

export function AssistantRail({ latest }: AssistantRailProps) {
  const router = useRouter();
  const [followUp, setFollowUp] = useState('');
  // Minimised keeps the header and hides everything under it, so the assistant
  // gets out of the way without leaving the page.
  const [minimised, setMinimised] = useState(false);

  return (
    <section
      className={`${styles.rail} ${minimised ? styles.railMinimised : ''}`.trim()}
      aria-labelledby="assistant-rail-title"
    >
      <header className={styles.head}>
        <h2 id="assistant-rail-title" className={styles.title}>
          <span className={styles.titleIcon} aria-hidden="true">
            <Icon name="sparkle" size={18} />
          </span>
          AI Study Assistant
        </h2>
        <Link href="/assistant" className={styles.headAction} aria-label="Explanation history">
          <Icon name="history" size={18} />
        </Link>
        <button
          type="button"
          className={styles.headAction}
          aria-expanded={!minimised}
          aria-controls="assistant-rail-body"
          aria-label={minimised ? 'Expand the assistant' : 'Minimise the assistant'}
          onClick={() => setMinimised((open) => !open)}
        >
          <Icon name={minimised ? 'expand' : 'collapse'} size={18} />
        </button>
      </header>

      {minimised ? null : latest ? (
        <div className={styles.body} id="assistant-rail-body">
          <p className={styles.question}>{latest.question}</p>

          <div className={styles.answer}>
            <p className={styles.answerText}>{latest.answer}</p>
            <ConfidenceBadge confidence={latest.confidence} />

            <div className={styles.toolbar}>
              <Link href={`/assistant#explanation-${latest.id}`} className={styles.explain}>
                <Icon name="wand" size={14} />
                Explain this answer
              </Link>
              <span className={styles.toolSpacer} />
              {/*
                Feedback is not stored yet: there is no table for it and no
                decision about what happens to it. Wiring the buttons to nothing
                would be worse than leaving them disabled, so they link to the
                thread where a follow-up is the real way to push back.
              */}
              <Link href="/assistant" className={styles.tool} aria-label="This answer was helpful">
                <Icon name="thumb-up" size={16} />
              </Link>
              <Link href="/assistant" className={styles.tool} aria-label="This answer was not helpful">
                <Icon name="thumb-down" size={16} />
              </Link>
              <Link href="/assistant" className={styles.tool} aria-label="Save this answer">
                <Icon name="bookmark" size={16} />
              </Link>
            </div>
          </div>

          <div className={styles.why}>
            <span className={styles.whyTitle}>Why this answer?</span>
            <span className={styles.whyText}>{latest.reasoning}</span>

            {latest.sources.length > 0 && (
              <>
                <span className={styles.sourcesLabel}>Sources</span>
                <div className={styles.sources}>
                  {latest.sources.map((source) => (
                    <a
                      key={source.label}
                      className={styles.source}
                      href={source.href}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {source.label}
                    </a>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.empty}>
          <span className={styles.emptyBody}>
            Ask about something you are stuck on. You get the answer, the reasoning behind it, and
            how confident it is.
          </span>
          <Link href="/assistant">Open the assistant</Link>
        </div>
      )}

      {minimised ? null : (
      <form
        className={styles.composer}
        onSubmit={(event) => {
          event.preventDefault();
          const trimmed = followUp.trim();
          if (!trimmed) return;
          router.push(`/assistant?q=${encodeURIComponent(trimmed)}`);
        }}
      >
        <label className="visually-hidden" htmlFor="rail-follow-up">
          Ask a follow-up question
        </label>
        <input
          id="rail-follow-up"
          className={styles.input}
          value={followUp}
          placeholder="Ask a follow-up question..."
          onChange={(event) => setFollowUp(event.target.value)}
        />
        <button type="submit" className={styles.send} aria-label="Send">
          <Icon name="send" size={18} />
        </button>
      </form>
      )}
    </section>
  );
}
