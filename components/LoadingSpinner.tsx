import styles from './LoadingSpinner.module.css';

export interface LoadingSpinnerProps {
  size?: 'medium' | 'small';
  /** Announced to screen readers; the spinner is otherwise invisible to them. */
  label?: string;
}

export function LoadingSpinner({ size = 'medium', label = 'Loading' }: LoadingSpinnerProps) {
  return (
    <span role="status" aria-live="polite">
      <span className={`${styles.spinner} ${styles[size]}`} />
      <span className="visually-hidden">{label}</span>
    </span>
  );
}
