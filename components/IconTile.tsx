import type { CSSProperties } from 'react';
import { Icon, type IconName } from './Icon';
import { CHART_TONE_VAR, type ChartTone } from '@/lib/tones';
import styles from './IconTile.module.css';

const SIZES = { sm: 16, md: 20, lg: 24 } as const;

export interface IconTileProps {
  icon: IconName;
  tone: ChartTone;
  size?: keyof typeof SIZES;
  className?: string;
}

/** Decorative by design: the label beside it always carries the meaning. */
export function IconTile({ icon, tone, size = 'md', className }: IconTileProps) {
  return (
    <span
      className={`${styles.tile} ${styles[size]} ${className ?? ''}`.trim()}
      style={{ '--tone': CHART_TONE_VAR[tone] } as CSSProperties}
      aria-hidden="true"
    >
      <Icon name={icon} size={SIZES[size]} />
    </span>
  );
}
