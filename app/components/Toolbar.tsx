'use client';

import type { ReactNode } from 'react';
import { Icon, type IconName } from '@/components/Icon';
import styles from './Toolbar.module.css';

/**
 * Header furniture shared by Resources and Notes.
 *
 * These are presentational only. Filtering is not wired to anything yet
 * because none of the three screens has a backend; the controls change their
 * own state so the interaction is real, and the lists below them are the mock
 * fixtures either way.
 */

export interface TabItem {
  id: string;
  label: string;
  icon: IconName;
}

export function TabStrip({
  items,
  active,
  onSelect,
  label,
}: {
  items: TabItem[];
  active: string;
  onSelect: (id: string) => void;
  label: string;
}) {
  return (
    <div className={styles.tabs} role="tablist" aria-label={label}>
      {items.map((item) => {
        const selected = item.id === active;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={selected}
            className={`${styles.tab} ${selected ? styles.tabActive : ''}`.trim()}
            onClick={() => onSelect(item.id)}
          >
            <Icon name={item.icon} size={16} filled={selected} />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
}) {
  return (
    <div className={styles.search}>
      <span className={styles.searchIcon}>
        <Icon name="search" size={16} />
      </span>
      <input
        type="search"
        className={styles.searchInput}
        placeholder={placeholder}
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export function FilterRow({ children }: { children: ReactNode }) {
  return <div className={styles.filters}>{children}</div>;
}

export function FilterControls({ children }: { children: ReactNode }) {
  return <div className={styles.controls}>{children}</div>;
}

export function ViewToggle({
  view,
  onChange,
}: {
  view: 'grid' | 'list';
  onChange: (view: 'grid' | 'list') => void;
}) {
  return (
    <div className={styles.viewToggle} role="group" aria-label="Layout">
      <button
        type="button"
        className={`${styles.viewButton} ${view === 'grid' ? styles.viewActive : ''}`.trim()}
        aria-pressed={view === 'grid'}
        aria-label="Grid view"
        onClick={() => onChange('grid')}
      >
        <Icon name="grid" size={16} />
      </button>
      <button
        type="button"
        className={`${styles.viewButton} ${view === 'list' ? styles.viewActive : ''}`.trim()}
        aria-pressed={view === 'list'}
        aria-label="List view"
        onClick={() => onChange('list')}
      >
        <Icon name="list" size={16} />
      </button>
    </div>
  );
}

export function FilterButton({ children }: { children: ReactNode }) {
  return (
    <button type="button" className={styles.filterButton}>
      <Icon name="filter" size={16} />
      {children}
    </button>
  );
}
