'use client';

import { useEffect, useId, useRef, useState } from 'react';
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

export interface FilterGroup {
  id: string;
  label: string;
  /** The first option is the default and counts as "no filter applied". */
  options: { value: string; label: string }[];
}

/**
 * The Filters control, as a real menu.
 *
 * Single-choice groups rather than free-form checkboxes: each group answers one
 * question, so the applied state is always describable in a sentence and the
 * count on the trigger means something.
 *
 * Like the other controls on these screens it changes its own state and filters
 * nothing yet, because there is no backend to filter. See AGENTS.md.
 */
export function FilterMenu({
  label,
  groups,
  values,
  onChange,
}: {
  label: string;
  groups: FilterGroup[];
  values: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // A group sitting on its default is not a filter, so it is not counted.
  const applied = groups.filter((g) => values[g.id] && values[g.id] !== g.options[0]!.value).length;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const reset = () =>
    onChange(Object.fromEntries(groups.map((g) => [g.id, g.options[0]!.value])));

  return (
    <div className={styles.filterWrap} ref={wrapRef}>
      <button
        type="button"
        ref={triggerRef}
        className={`${styles.filterButton} ${open ? styles.filterButtonOpen : ''}`.trim()}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? `${id}-panel` : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        <Icon name="filter" size={16} />
        {label}
        {applied > 0 && (
          <span className={styles.filterCount}>
            {applied}
            <span className="visually-hidden"> filters applied</span>
          </span>
        )}
      </button>

      {open && (
        <div className={styles.filterPanel} id={`${id}-panel`} role="dialog" aria-label={label}>
          {groups.map((group) => (
            <fieldset key={group.id} className={styles.filterGroup}>
              <legend className={styles.filterLegend}>{group.label}</legend>
              {group.options.map((option) => {
                const selected = (values[group.id] ?? group.options[0]!.value) === option.value;
                return (
                  <label
                    key={option.value}
                    className={`${styles.filterOption} ${
                      selected ? styles.filterOptionSelected : ''
                    }`.trim()}
                  >
                    <input
                      type="radio"
                      className={`visually-hidden ${styles.filterInput}`}
                      name={`${id}-${group.id}`}
                      checked={selected}
                      onChange={() => onChange({ ...values, [group.id]: option.value })}
                    />
                    {option.label}
                    <span className={styles.filterMark} aria-hidden="true">
                      <Icon name="check" size={12} />
                    </span>
                  </label>
                );
              })}
            </fieldset>
          ))}

          <div className={styles.filterFoot}>
            <button
              type="button"
              className={styles.filterReset}
              disabled={applied === 0}
              onClick={reset}
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
