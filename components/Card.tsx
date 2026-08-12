import type { ReactNode } from 'react';
import styles from './Card.module.css';

export interface CardProps {
  title?: ReactNode;
  action?: ReactNode;
  interactive?: boolean;
  className?: string;
  /** Anchor target, so a link can deep-link to this section. */
  id?: string;
  children: ReactNode;
}

export function Card({ title, action, interactive = false, className, id, children }: CardProps) {
  const classes = [styles.card, interactive ? styles.interactive : '', className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <section className={classes} id={id}>
      {(title || action) && (
        <header className={styles.header}>
          {title && <h3 className={styles.title}>{title}</h3>}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
