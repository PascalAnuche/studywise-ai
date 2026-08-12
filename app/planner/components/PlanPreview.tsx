import type { ReactNode } from 'react';
import { ReasoningPanel } from '@/components/ReasoningPanel';
import type { PlanSession } from '@/lib/ai/types';
import styles from './PlanPreview.module.css';

/**
 * Renders a generated plan for review (PRD 7.2).
 *
 * Carries the same "because" affordance as an answer, via the shared
 * ReasoningPanel: a student should be able to see why the sequence is what it
 * is before accepting it. There is no confidence badge, since a schedule is not
 * a factual claim.
 */
export interface PlanPreviewProps {
  sessions: PlanSession[];
  reasoning?: string | null;
  children?: ReactNode;
}

function formatDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}

export function PlanPreview({ sessions, reasoning, children }: PlanPreviewProps) {
  return (
    <div className={styles.preview}>
      <ol className={styles.sessions}>
        {sessions.map((session) => {
          const when = formatDate(session.scheduledFor);
          return (
            <li key={`${session.order}-${session.topic}`} className={styles.session}>
              <span className={styles.order} aria-hidden="true">
                {session.order}
              </span>
              <div className={styles.body}>
                <span className={styles.topic}>
                  <span className="visually-hidden">Session {session.order}: </span>
                  {session.topic}
                </span>
                <span className={styles.focus}>{session.focus}</span>
                <span className={styles.meta}>
                  {session.durationMinutes} min{when ? ` · ${when}` : ' · not scheduled yet'}
                </span>
              </div>
            </li>
          );
        })}
      </ol>

      {reasoning && <ReasoningPanel reasoning={reasoning} />}

      {children && <div className={styles.actions}>{children}</div>}
    </div>
  );
}
