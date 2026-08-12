'use client';

import Link from 'next/link';
import { Icon } from '@/components/Icon';
import styles from './ChatList.module.css';

/**
 * Recent conversations, per the approved Assistant design.
 *
 * A "chat" is a saved explanation and its follow-ups: the schema already models
 * a thread that way, so this lists explanations rather than introducing a
 * second concept that would need reconciling later.
 */
export interface ChatSummary {
  id: number;
  title: string;
  when: string;
}

export interface ChatListProps {
  chats: ChatSummary[];
  activeId: number | null;
}

export function ChatList({ chats, activeId }: ChatListProps) {
  return (
    <div className={styles.panel}>
      <Link href="/assistant" className={styles.newChat}>
        <Icon name="sparkle" size={16} />
        New Chat
      </Link>

      <span className={styles.label}>Recent Chats</span>

      <ul className={styles.list}>
        {chats.map((chat) => {
          const active = chat.id === activeId;
          return (
            <li key={chat.id}>
              <Link
                href={`/assistant?chat=${chat.id}`}
                className={`${styles.item} ${active ? styles.active : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                <span className={styles.title}>{chat.title}</span>
                <span className={styles.when}>{chat.when}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/*
        Deletion is not built. The button states that rather than pretending to
        work, because a clear-history control that silently does nothing is the
        kind of thing a student only discovers when it matters.
      */}
      <button
        type="button"
        className={styles.clear}
        title="Not available yet"
        aria-disabled="true"
        onClick={(event) => event.preventDefault()}
      >
        <Icon name="history" size={14} />
        Clear conversations
      </button>
    </div>
  );
}
