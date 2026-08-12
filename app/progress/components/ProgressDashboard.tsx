'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/Card';
import { StatTile } from '@/components/StatTile';
import { Toast } from '@/components/Toast';
import type { ProgressOverview } from '@/lib/db/progress';
import type { TopicStatus } from '@/lib/db/types';
import { StreakIndicator } from './StreakIndicator';
import { TopicCompletionList } from './TopicCompletionList';
import { WeakAreaList } from './WeakAreaList';
import styles from './ProgressDashboard.module.css';

/**
 * Progress Tracking — PRD 7.4.
 *
 * Order is deliberate: what to look at again comes before the tally. The
 * journey map's Track stage records students wanting "clearer insight into weak
 * areas", not a scoreboard, and DESIGN_SYSTEM.md asks for calm here in
 * particular.
 *
 * There is no single overall score anywhere on this page, by requirement.
 */
export interface ProgressDashboardProps {
  overview: ProgressOverview;
}

export function ProgressDashboard({ overview }: ProgressDashboardProps) {
  const router = useRouter();
  const [pendingTopic, setPendingTopic] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function setStatus(topic: string, status: TopicStatus) {
    setPendingTopic(topic);
    setError(null);
    try {
      const response = await fetch('/api/progress/topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, status }),
      });
      if (!response.ok) {
        const detail: unknown = await response.json().catch(() => null);
        throw new Error(
          detail && typeof detail === 'object' && 'error' in detail
            ? String((detail as { error: unknown }).error)
            : 'Could not update the topic'
        );
      }
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not update the topic');
    } finally {
      setPendingTopic(null);
    }
  }

  const completed = overview.completedTopics.length;

  return (
    <div className={styles.stack}>
      <Card title="Study streak">
        <StreakIndicator streak={overview.streak} lastActiveOn={overview.lastActiveOn} />
      </Card>

      <section className={styles.columns}>
        <div className={styles.column}>
          {/* Weak areas first: the Track stage is about insight, not a tally. */}
          <Card title="Worth another look">
            <WeakAreaList areas={overview.weakAreas} />
          </Card>

          <Card title="Recent quizzes">
            {overview.recentQuizzes.length === 0 ? (
              <p className={styles.empty}>No quizzes submitted yet.</p>
            ) : (
              <ul className={styles.quizzes}>
                {overview.recentQuizzes.map((quiz) => (
                  <li key={quiz.quizId} className={styles.quiz}>
                    <span className={styles.quizResult}>
                      {quiz.total - quiz.missed} of {quiz.total} correct
                    </span>
                    <span className={styles.quizMeta}>
                      {quiz.completedAt ? quiz.completedAt.slice(0, 10) : 'not submitted'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className={styles.column}>
          <StatTile
            icon="check"
            tone="positive"
            label="Topics completed"
            value={completed}
            total={overview.topics.length}
            caption="Across the topics you are tracking"
          />

          <Card title="Your topics">
            <TopicCompletionList
              topics={overview.topics}
              pendingTopic={pendingTopic}
              onSetStatus={setStatus}
            />
          </Card>
        </div>
      </section>

      {error && <Toast tone="caution" message={error} onDismiss={() => setError(null)} />}
    </div>
  );
}
