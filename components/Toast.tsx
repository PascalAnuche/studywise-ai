'use client';

import styles from './Toast.module.css';

export type ToastTone = 'info' | 'success' | 'caution';

export interface ToastProps {
  tone?: ToastTone;
  message: string;
  onDismiss?: () => void;
}

export function Toast({ tone = 'info', message, onDismiss }: ToastProps) {
  return (
    <div
      className={`${styles.toast} ${styles[tone]}`}
      role={tone === 'caution' ? 'alert' : 'status'}
      aria-live={tone === 'caution' ? 'assertive' : 'polite'}
    >
      <span className={styles.message}>{message}</span>
      {onDismiss && (
        <button type="button" className={styles.dismiss} onClick={onDismiss} aria-label="Dismiss">
          ✕
        </button>
      )}
    </div>
  );
}
