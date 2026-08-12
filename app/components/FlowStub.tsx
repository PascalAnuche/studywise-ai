import Link from 'next/link';
import { Card } from '@/components/Card';
import { Icon, type IconName } from '@/components/Icon';
import styles from '../page.module.css';

/**
 * A destination that exists in the navigation and the flow diagram but has no
 * implementation yet.
 *
 * A real page rather than a 404, because navigation completeness is the point:
 * the design promises eight destinations and a dead link is worse than an
 * honest one. Each stub states the flow it belongs to and the steps it will
 * carry, so the scope stays visible rather than living only in the diagram.
 */
export interface FlowStubProps {
  title: string;
  flow: number;
  summary: string;
  steps: string[];
  icon: IconName;
  /** Something useful the student can do in the meantime. */
  fallback: { href: string; label: string };
}

export function FlowStub({ title, flow, summary, steps, icon, fallback }: FlowStubProps) {
  return (
    <main id="main" className={styles.page}>
      <header className={styles.greeting}>
        <h1>{title}</h1>
        <p className={styles.subtitle}>{summary}</p>
      </header>

      <Card title={`Flow ${flow} — not built yet`}>
        <div className={styles.empty}>
          <span className={styles.emptyTitle}>
            <Icon name={icon} size={20} /> Planned steps
          </span>
          <ul className={styles.list}>
            {steps.map((step) => (
              <li key={step} className={styles.rowMeta}>
                {step}
              </li>
            ))}
          </ul>
          <Link href={fallback.href}>{fallback.label}</Link>
        </div>
      </Card>
    </main>
  );
}
