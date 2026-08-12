'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Icon } from './Icon';
import styles from './Topbar.module.css';

/**
 * Global bar, per the approved Home design.
 *
 * `status` is passed in as a node rather than fetched here, so the data it
 * needs can stream behind Suspense without holding up the rest of the shell.
 */
export interface TopbarProps {
  status: ReactNode;
}

export function Topbar({ status }: TopbarProps) {
  const searchRef = useRef<HTMLInputElement>(null);

  // Cmd/Ctrl+K focuses search, matching the hint shown in the field.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <header className={styles.topbar}>
      <div className={styles.search}>
        <span className={styles.searchIcon}>
          <Icon name="search" size={18} />
        </span>
        <label className="visually-hidden" htmlFor="global-search">
          Search topics, notes and tasks
        </label>
        <input
          id="global-search"
          ref={searchRef}
          className={styles.searchInput}
          type="search"
          placeholder="Search topics, notes, tasks..."
        />
        <span className={styles.shortcut} aria-hidden="true">
          ⌘K
        </span>
      </div>

      <span className={styles.spacer} />

      <div className={styles.status}>{status}</div>
    </header>
  );
}

/** Notification bell. Count is rendered as text, never colour alone. */
export function NotificationBell({ count }: { count: number }) {
  return (
    <Link href="/notifications" className={styles.iconButton} aria-label={`Notifications, ${count} unread`}>
      <Icon name="bell" size={20} />
      {count > 0 && (
        <span className={styles.badge} aria-hidden="true">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  );
}

export function AccountChip({
  name,
  discipline,
}: {
  name: string;
  discipline: string | null;
}) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  return (
    <Link href="/profile" className={styles.account}>
      <span className={styles.avatar} aria-hidden="true">
        {initial}
      </span>
      <span className={styles.identity}>
        <span className={styles.name}>{name}</span>
        {discipline && <span className={styles.discipline}>{discipline}</span>}
      </span>
      <Icon name="chevron-down" size={16} />
      <span className="visually-hidden">Open your profile</span>
    </Link>
  );
}

export function AccountChipSkeleton() {
  return (
    <span className={styles.account} aria-hidden="true">
      <span className={`${styles.avatar} ${styles.skeleton}`} />
    </span>
  );
}
