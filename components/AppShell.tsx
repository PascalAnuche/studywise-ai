import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import styles from './AppShell.module.css';

/**
 * The dashboard frame. No client state: the sidebar is always visible, so
 * there is nothing to open or close.
 *
 * `status` is a slot rather than data, so the shell renders without waiting on
 * anything the database has to answer.
 */
export interface AppShellProps {
  status: ReactNode;
  children: ReactNode;
}

export function AppShell({ status, children }: AppShellProps) {
  return (
    <div className={styles.shell}>
      <Sidebar />

      <div className={styles.main}>
        <Topbar status={status} />
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
