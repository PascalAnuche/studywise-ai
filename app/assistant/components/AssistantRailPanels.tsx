import Link from 'next/link';
import { Card } from '@/components/Card';
import { ActionLink } from '@/components/ActionLink';
import { Icon } from '@/components/Icon';
import styles from '../assistant.module.css';

/**
 * The right rail on the Assistant, per the approved design: a study tip, chat
 * history, saved explanations, and popular topics.
 *
 * Chat history and saved explanations are real — a "chat" is a saved
 * explanation and its follow-ups, which the schema already models. The tip and
 * the topic chips are static: nothing generates either yet.
 */
export interface RailChat {
  id: number;
  title: string;
  when: string;
}

export interface AssistantRailPanelsProps {
  chats: RailChat[];
  saved: RailChat[];
  activeId: number | null;
}

const POPULAR_TOPICS = [
  'Data Structures',
  'Algorithms',
  'Time Complexity',
  'OOP Concepts',
  'Database Basics',
  'Operating Systems',
];

export function AssistantRailPanels({ chats, saved, activeId }: AssistantRailPanelsProps) {
  return (
    <>
      <Card>
        <div className={styles.tipHead}>
          <span className={styles.tipIcon} aria-hidden="true">
            <Icon name="lightbulb" size={16} />
          </span>
          <span className={styles.railTitle}>Study Tip</span>
        </div>
        <p className={styles.tipBody}>
          Break down complex topics into smaller parts and ask follow-up questions for better
          understanding.
        </p>
      </Card>

      <Card>
        <div className={styles.railHead}>
          <span className={styles.railTitle}>
            <span className={styles.railIcon} aria-hidden="true">
              <Icon name="history" size={16} />
            </span>
            Chat History
          </span>
          <ActionLink href="/assistant" icon={null}>View all</ActionLink>
        </div>
        <ul className={styles.railList}>
          {chats.map((chat) => {
            const active = chat.id === activeId;
            return (
              <li key={chat.id}>
                <Link
                  href={`/assistant?chat=${chat.id}`}
                  className={`${styles.railRow} ${active ? styles.railRowActive : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  <span className={styles.railRowTitle}>{chat.title}</span>
                  <span className={styles.railRowWhen}>{chat.when}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card>
        <div className={styles.railHead}>
          <span className={styles.railTitle}>
            <span className={styles.railIcon} aria-hidden="true">
              <Icon name="bookmark" size={16} />
            </span>
            Saved Explanations
          </span>
          <ActionLink href="/assistant" icon={null}>View all</ActionLink>
        </div>
        <ul className={styles.railList}>
          {saved.map((item) => (
            <li key={item.id}>
              <Link href={`/assistant?chat=${item.id}`} className={styles.railRow}>
                <span className={styles.railRowTitle}>{item.title}</span>
                <span className={styles.railRowWhen}>{item.when}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <div className={styles.railHead}>
          <span className={styles.railTitle}>
            <span className={styles.railIcon} aria-hidden="true">
              <Icon name="flame" size={16} />
            </span>
            Popular Topics
          </span>
          <ActionLink href="/practice" icon={null}>View all</ActionLink>
        </div>
        <div className={styles.chips}>
          {POPULAR_TOPICS.map((topic) => (
            <Link key={topic} href={`/practice?topic=${encodeURIComponent(topic)}`} className={styles.chip}>
              {topic}
            </Link>
          ))}
        </div>
      </Card>
    </>
  );
}
