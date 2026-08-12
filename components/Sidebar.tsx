'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from './Icon';
import { PRIMARY_DESTINATIONS, SECONDARY_DESTINATIONS, isCurrent, type Destination } from './navigation';
import { ThemeToggle } from './ThemeToggle';
import styles from './Sidebar.module.css';

/**
 * Persistent dashboard navigation, per the approved Home design.
 *
 * No open/closed state: the sidebar is always on screen, collapsing to an icon
 * rail on narrow viewports rather than hiding behind a toggle. `title` gives
 * sighted rail users a tooltip; the visually hidden label covers screen readers.
 */
function NavLink({ destination, pathname }: { destination: Destination; pathname: string }) {
  const active = isCurrent(destination, pathname);

  return (
    <Link
      href={destination.href}
      className={`${styles.link} ${active ? styles.active : ''}`}
      aria-current={active ? 'page' : undefined}
      title={destination.label}
    >
      <span className={styles.icon}>
        {/* Filled when active: a second signal alongside the tint and rail. */}
        <Icon name={destination.icon} filled={active} />
      </span>
      <span className={styles.label}>{destination.label}</span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <Link href="/" className={styles.brand}>
        <span className={styles.mark} aria-hidden="true">
          <Icon name="sparkle" size={18} />
        </span>
        <span className={styles.wordmark}>StudyWise AI</span>
      </Link>

      <nav className={styles.nav} aria-label="Main">
        {PRIMARY_DESTINATIONS.map((destination) => (
          <NavLink key={destination.href} destination={destination} pathname={pathname} />
        ))}
      </nav>

      <div className={styles.divider} />

      <nav className={styles.nav} aria-label="Account">
        {SECONDARY_DESTINATIONS.map((destination) => (
          <NavLink key={destination.href} destination={destination} pathname={pathname} />
        ))}
      </nav>

      <div className={styles.footer}>
        {/* Hidden in rail mode: an upsell is the first thing to lose to space. */}
        <div className={styles.upsell}>
          <span className={styles.upsellTitle}>Study smarter with StudyWise AI</span>
          <span className={styles.upsellBody}>
            Get personalised study recommendations and stay on track.
          </span>
          <Link href="/settings#plan" className={styles.upsellAction}>
            Upgrade to Pro
            <Icon name="sparkle" size={16} />
          </Link>
        </div>

        <div className={styles.themeRow}>
          <ThemeToggle showLabel />
        </div>
      </div>
    </aside>
  );
}
