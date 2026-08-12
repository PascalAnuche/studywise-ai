'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { Icon, type IconName } from '@/components/Icon';
import styles from './RecommendationRail.module.css';

/**
 * "AI Recommendations for You" from the approved Home design.
 *
 * Every card carries its reason. PRD 7.3 requires recommendations to be based
 * on the specific topics missed rather than generic advice, and the reason is
 * what makes that visible instead of merely claimed.
 */
export interface RecommendationItem {
  id: number;
  title: string;
  reason: string;
  actionLabel: string;
  href: string;
  icon: IconName;
  tone: 'brand' | 'positive' | 'caution';
}

export interface RecommendationRailProps {
  items: RecommendationItem[];
}

export function RecommendationRail({ items }: RecommendationRailProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyBody}>
          Once you have taken a quiz or worked through a few topics, suggestions appear here with
          the reason behind each one.
        </span>
        <Link href="/practice">Take a quiz</Link>
      </div>
    );
  }

  return (
    <div className={styles.rail}>
      <div className={styles.track} ref={trackRef}>
        {items.map((item) => (
          <article key={item.id} className={styles.card}>
            <div className={styles.head}>
              <span className={`${styles.icon} ${styles[item.tone]}`} aria-hidden="true">
                <Icon name={item.icon} size={18} />
              </span>
              <span className={styles.title}>{item.title}</span>
            </div>
            <span className={styles.reason}>{item.reason}</span>
            <Link href={item.href} className={styles.action}>
              {item.actionLabel}
              <Icon name="arrow-right" size={16} />
            </Link>
          </article>
        ))}
      </div>

      {items.length > 1 && (
        <button
          type="button"
          className={styles.next}
          aria-label="Show more recommendations"
          onClick={() =>
            trackRef.current?.scrollBy({ left: trackRef.current.clientWidth * 0.8, behavior: 'smooth' })
          }
        >
          <Icon name="arrow-right" size={18} />
        </button>
      )}
    </div>
  );
}
