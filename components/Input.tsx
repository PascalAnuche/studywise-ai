'use client';

import { useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import styles from './Field.module.css';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  hint?: string;
  error?: string;
  /**
   * A control that belongs beside the input — an Add button, say.
   *
   * Passed in rather than placed by the caller so it sits in the same row as
   * the input itself. A caller laying out [field, button] side by side gets the
   * button level with the hint instead.
   */
  action?: ReactNode;
}

export function Input({ label, hint, error, action, className, ...rest }: InputProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : '', error ? errorId : ''].filter(Boolean).join(' ');

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <div className={styles.controlRow}>
        <input
          id={id}
          className={`${styles.control} ${className ?? ''}`.trim()}
          aria-describedby={describedBy || undefined}
          aria-invalid={error ? true : undefined}
          {...rest}
        />
        {action}
      </div>
      {hint && (
        <span id={hintId} className={styles.hint}>
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId} className={styles.error} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
