import Link from 'next/link';
import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import styles from './ActionLink.module.css';

export interface ActionLinkProps {
  href: string;
  children: ReactNode;
  /** Trailing icon. Defaults to the arrow used throughout the designs. */
  icon?: IconName | null;
  tone?: 'primary' | 'muted';
  className?: string;
}

/**
 * The small trailing link in a card header — "View all", "Details", "View
 * Statistics". Always at least 24px tall, which is what the hand-rolled
 * versions in the page modules were not.
 */
export function ActionLink({
  href,
  children,
  icon = 'arrow-right',
  tone = 'primary',
  className,
}: ActionLinkProps) {
  return (
    <Link
      href={href}
      className={[styles.link, tone === 'muted' ? styles.muted : '', className ?? '']
        .filter(Boolean)
        .join(' ')}
    >
      {children}
      {icon && <Icon name={icon} size={14} />}
    </Link>
  );
}
