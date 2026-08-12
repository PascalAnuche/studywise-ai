import { Card } from '@/components/Card';
import { MOCK_PREFERENCES, MOCK_PRIVACY } from '@/lib/mock';
import { MockNotice } from '../components/MockNotice';
import styles from '../page.module.css';

/**
 * Settings — flow 8. Renders from lib/mock; no tables yet.
 *
 * Privacy is a section here rather than buried, because prompt section 12
 * treats study struggles and performance history as sensitive by default and a
 * student should be able to see that rather than take it on trust.
 */
export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  return (
    <main id="main" className={styles.page}>
      <header className={styles.greeting}>
        <h1>Settings</h1>
        <p className={styles.subtitle}>Preferences, notifications, appearance and privacy.</p>
        <MockNotice flow={8} />
      </header>

      <Card title="Preferences">
        <ul className={styles.list}>
          {MOCK_PREFERENCES.map((preference) => (
            <li key={preference.id} className={styles.row}>
              <span className={styles.question}>
                {preference.label}
                <br />
                <span className={styles.rowMeta}>{preference.description}</span>
              </span>
              <span className={styles.rowMeta}>{preference.value}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Appearance">
        <p className={styles.notice}>
          Light and dark themes are switchable from the sidebar. The whole palette is generated from
          design tokens, so a theme change never touches a component.
        </p>
      </Card>

      <Card title="Privacy">
        <ul className={styles.list}>
          {MOCK_PRIVACY.map((item) => (
            <li key={item.label} className={styles.explanation}>
              <span className={styles.question}>{item.label}</span>
              <span className={styles.rowMeta}>{item.detail}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Plan" id="plan">
        <p className={styles.notice}>
          Pro is offered in the sidebar, but no pricing, entitlement or gated feature is defined
          yet. Tracked as an open question in AGENTS.md.
        </p>
      </Card>
    </main>
  );
}
