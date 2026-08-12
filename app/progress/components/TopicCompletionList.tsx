'use client';

import type { TopicProgressDto } from '@/lib/db/progress';
import type { TopicStatus } from '@/lib/db/types';
import styles from './TopicCompletionList.module.css';

/**
 * Completed topics, and the ones still open (PRD 7.4).
 *
 * The status control is the only place a student writes to `progress` directly.
 * Everything else is a side effect of studying, which is why marking a topic
 * here deliberately does not extend the streak.
 */
const LABELS: Record<TopicStatus, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  completed: 'Completed',
};

const TONE: Record<TopicStatus, string> = {
  not_started: styles.notStarted,
  in_progress: styles.inProgress,
  completed: styles.completed,
};

export interface TopicCompletionListProps {
  topics: TopicProgressDto[];
  pendingTopic?: string | null;
  onSetStatus: (topic: string, status: TopicStatus) => void;
}

export function TopicCompletionList({
  topics,
  pendingTopic,
  onSetStatus,
}: TopicCompletionListProps) {
  if (topics.length === 0) {
    return (
      <p className={styles.empty}>
        No topics tracked yet. They appear here as you study, take quizzes, or confirm a study plan.
      </p>
    );
  }

  return (
    <ul className={styles.list}>
      {topics.map((topic) => {
        const done = topic.status === 'completed';
        const next: TopicStatus = done ? 'in_progress' : 'completed';

        return (
          <li key={topic.id} className={styles.item}>
            <div className={styles.body}>
              <span className={styles.topic}>{topic.topic}</span>
              <span className={styles.meta}>
                {topic.lastStudiedAt
                  ? `Last studied ${topic.lastStudiedAt.slice(0, 10)}`
                  : 'Not studied yet'}
              </span>
            </div>

            <span className={`${styles.status} ${TONE[topic.status]}`}>
              {LABELS[topic.status]}
            </span>

            <button
              type="button"
              className={styles.control}
              disabled={pendingTopic === topic.topic}
              onClick={() => onSetStatus(topic.topic, next)}
            >
              {done ? 'Reopen' : 'Mark complete'}
              <span className="visually-hidden"> {topic.topic}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
