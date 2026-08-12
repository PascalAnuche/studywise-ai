'use client';

import { useEffect, useState } from 'react';
import styles from './ThemeToggle.module.css';

/**
 * Switches the `data-theme` attribute the generated tokens key off.
 *
 * The whole re-skin happens in CSS custom properties, so nothing here knows any
 * colour: it sets an attribute and the token file does the rest. That is the
 * point of the two-tier token structure, and it is what makes a future overhaul
 * a token change rather than a component rewrite.
 *
 * With no attribute set, the tokens follow the operating system preference.
 */
type Choice = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'studywise-theme';

function apply(choice: Choice) {
  const root = document.documentElement;
  if (choice === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', choice);
}

export interface ThemeToggleProps {
  /** Shows the mode name beside the icon, as the sidebar footer does. */
  showLabel?: boolean;
}

export function ThemeToggle({ showLabel = false }: ThemeToggleProps) {
  const [choice, setChoice] = useState<Choice>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Choice | null;
    if (stored === 'light' || stored === 'dark') {
      setChoice(stored);
      apply(stored);
    }
    setMounted(true);
  }, []);

  function choose(next: Choice) {
    setChoice(next);
    apply(next);
    if (next === 'system') window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, next);
  }

  // Until mounted the stored choice is unknown, so the label would be wrong.
  const isDark = mounted && choice === 'dark';

  return (
    <button
      type="button"
      className={`${styles.toggle} ${showLabel ? styles.withLabel : ''}`}
      onClick={() => choose(isDark ? 'light' : 'dark')}
      aria-pressed={isDark}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light theme' : 'Dark theme'}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {isDark ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        ) : (
          <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" />
        )}
      </svg>
      {showLabel && <span className={styles.label}>{isDark ? 'Dark Mode' : 'Light Mode'}</span>}
    </button>
  );
}
