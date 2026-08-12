'use client';

import type { Difficulty } from '@/lib/ai/types';
import styles from './DifficultySelector.module.css';

/**
 * PRD 7.3: difficulty is selected before the quiz is generated, not after.
 * It is an input to generation, so choosing it later could only relabel a quiz
 * rather than change what it asks.
 *
 * Radio inputs rather than buttons: this is a single choice from a fixed set,
 * and the native control brings arrow-key navigation and grouping for free.
 */
const OPTIONS: { value: Difficulty; label: string; description: string }[] = [
  { value: 'easy', label: 'Easy', description: 'Recall the core ideas' },
  { value: 'medium', label: 'Medium', description: 'Apply them to a case' },
  { value: 'hard', label: 'Hard', description: 'Judge between close options' },
];

export interface DifficultySelectorProps {
  value: Difficulty;
  disabled?: boolean;
  onChange: (value: Difficulty) => void;
}

export function DifficultySelector({ value, disabled, onChange }: DifficultySelectorProps) {
  return (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>Difficulty</legend>
      <div className={styles.options}>
        {OPTIONS.map((option) => (
          <label
            key={option.value}
            className={`${styles.option} ${value === option.value ? styles.selected : ''}`}
          >
            <input
              className={styles.input}
              type="radio"
              name="difficulty"
              value={option.value}
              checked={value === option.value}
              disabled={disabled}
              onChange={() => onChange(option.value)}
            />
            <span className={styles.label}>{option.label}</span>
            <span className={styles.description}>{option.description}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
