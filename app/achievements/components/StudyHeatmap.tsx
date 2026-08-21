import type { StudyDay } from '@/lib/mock';
import styles from '../achievements.module.css';

/**
 * Twelve weeks of study, one square per day.
 *
 * A grid of elements rather than SVG, so each square can carry its own title
 * and the whole thing reflows on a narrow screen. Colour is never the only
 * encoding: the same figures are given as a table to assistive technology, and
 * each square's title states the date and the minutes.
 */
const LEVELS = 4;

function levelFor(minutes: number): number {
  if (minutes <= 0) return 0;
  if (minutes < 45) return 1;
  if (minutes < 90) return 2;
  return 3;
}

export function StudyHeatmap({ days }: { days: StudyDay[] }) {
  const weeks: StudyDay[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  const label = (day: StudyDay) => {
    const when = new Date(`${day.date}T00:00:00`).toLocaleDateString(undefined, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
    return day.minutes > 0 ? `${when}: ${day.minutes} minutes` : `${when}: no study`;
  };

  return (
    <>
      <div className={styles.heatmap} aria-hidden="true">
        <div className={styles.heatDays}>
          <span>Mon</span>
          <span>Wed</span>
          <span>Fri</span>
        </div>
        <div className={styles.heatGrid}>
          {weeks.map((week, w) => (
            <div key={w} className={styles.heatWeek}>
              {week.map((day) => (
                <span
                  key={day.date}
                  className={`${styles.heatCell} ${styles[`heat${levelFor(day.minutes)}`]}`}
                  title={label(day)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.heatLegend} aria-hidden="true">
        <span>Less</span>
        {Array.from({ length: LEVELS }, (_, i) => (
          <span key={i} className={`${styles.heatCell} ${styles[`heat${i}`]}`} />
        ))}
        <span>More</span>
      </div>

      <table className="visually-hidden">
        <caption>Study minutes per day over the last twelve weeks</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Minutes</th>
          </tr>
        </thead>
        <tbody>
          {days.map((day) => (
            <tr key={day.date}>
              <th scope="row">{day.date}</th>
              <td>{day.minutes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
