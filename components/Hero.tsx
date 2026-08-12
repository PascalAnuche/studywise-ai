import Link from 'next/link';
import { Icon } from './Icon';
import styles from './Hero.module.css';

export interface HeroAction {
  href: string;
  label: string;
}

export interface HeroProps {
  eyebrow?: string;
  greeting: string;
  detail: string;
  primary?: HeroAction;
  secondary?: HeroAction;
}

export function Hero({ eyebrow, greeting, detail, primary, secondary }: HeroProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        {eyebrow && (
          <span className={styles.eyebrow}>
            <Icon name="sparkle" size={14} />
            {eyebrow}
          </span>
        )}

        <h1 className={styles.greeting}>{greeting}</h1>
        <p className={styles.detail}>{detail}</p>

        {(primary || secondary) && (
          <div className={styles.actions}>
            {primary && (
              <Link href={primary.href} className={styles.primary}>
                {primary.label}
                <Icon name="arrow-right" size={18} />
              </Link>
            )}
            {secondary && (
              <Link href={secondary.href} className={styles.secondary}>
                {secondary.label}
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
