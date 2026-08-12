import { CHART_TONE_VAR, type ChartTone } from '@/lib/tones';
import styles from '../progress.module.css';

/**
 * Time by Subject, per the approved design: a donut with the total in the
 * middle and a legend beneath.
 *
 * Every slice is also named in the legend with its time and share, so the
 * colour is never the only way to read the chart.
 */
export interface SubjectDonutProps {
  total: string;
  slices: { subject: string; studyTime: string; minutes: number; tone: ChartTone }[];
}

export function SubjectDonut({ total, slices }: SubjectDonutProps) {
  const size = 152;
  const stroke = 26;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const sum = slices.reduce((acc, slice) => acc + slice.minutes, 0) || 1;
  let offset = 0;

  return (
    <div>
      <div style={{ display: 'grid', placeItems: 'center' }}>
        <svg width={size} height={size} role="img" aria-label={`Time by subject, ${total} total`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={stroke}
          />
          {slices.map((slice) => {
            const length = (slice.minutes / sum) * circumference;
            const dash = `${length} ${circumference - length}`;
            const element = (
              <circle
                key={slice.subject}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={CHART_TONE_VAR[slice.tone]}
                strokeWidth={stroke}
                strokeDasharray={dash}
                strokeDashoffset={-offset}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            );
            offset += length;
            return element;
          })}
          <text
            x="50%"
            y="48%"
            textAnchor="middle"
            fill="var(--color-text)"
            fontSize="18"
            fontWeight="600"
          >
            {total}
          </text>
          <text x="50%" y="62%" textAnchor="middle" fill="var(--color-text-muted)" fontSize="11">
            Total
          </text>
        </svg>
      </div>

      <div className={styles.legend}>
        {slices.map((slice) => (
          <div key={slice.subject} className={styles.legendRow}>
            <span
              className={styles.dot}
              style={{ background: CHART_TONE_VAR[slice.tone] }}
              aria-hidden="true"
            />
            <span className={styles.legendName}>{slice.subject}</span>
            <span className={styles.legendValue}>{slice.studyTime}</span>
            <span className={styles.legendPercent}>{Math.round((slice.minutes / sum) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
