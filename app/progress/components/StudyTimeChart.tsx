/**
 * Study Time Overview, per the approved design: one bar per weekday.
 *
 * Inline SVG rather than a chart library. Seven bars and an axis do not justify
 * a dependency, and the bars inherit the token roles directly so a theme change
 * reaches them like everything else.
 *
 * The figures are also given as a table to assistive technology, because a bar
 * a screen reader cannot read is not a chart, it is decoration.
 */
export interface StudyTimeChartProps {
  data: { day: string; minutes: number }[];
}

export function StudyTimeChart({ data }: StudyTimeChartProps) {
  // The viewBox carries the aspect ratio. It used to be 640x220 with a fixed
  // 220px height attribute, so in a narrower card the SVG scaled down to fit
  // the width and left a band of dead space under the bars.
  const width = 640;
  const height = 300;
  const padLeft = 34;
  const padBottom = 30;
  const padTop = 8;

  const maxMinutes = Math.max(360, ...data.map((d) => d.minutes));
  const topHours = Math.ceil(maxMinutes / 60);
  const plotHeight = height - padBottom - padTop;
  const plotWidth = width - padLeft;
  const slot = plotWidth / data.length;
  const barWidth = Math.min(40, slot * 0.42);

  // Labelled every two hours, as designed. A line per hour crowds the plot and
  // makes the bars harder to read, not easier.
  const gridLines = Array.from({ length: Math.floor(topHours / 2) + 1 }, (_, i) => i * 2);

  return (
    <>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        style={{ height: 'auto', display: 'block' }}
        role="img"
        aria-label="Study time per day this week"
      >
        {gridLines.map((hour) => {
          const y = padTop + plotHeight - (hour / topHours) * plotHeight;
          return (
            <g key={hour}>
              <line
                x1={padLeft}
                x2={width}
                y1={y}
                y2={y}
                stroke="var(--color-border)"
                strokeWidth={1}
              />
              <text
                x={padLeft - 8}
                y={y + 4}
                textAnchor="end"
                fill="var(--color-text-muted)"
                fontSize="12"
              >
                {hour}h
              </text>
            </g>
          );
        })}

        {data.map((entry, index) => {
          const barHeight = (entry.minutes / (topHours * 60)) * plotHeight;
          const x = padLeft + index * slot + (slot - barWidth) / 2;
          const y = padTop + plotHeight - barHeight;

          return (
            <g key={entry.day}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 2)}
                rx={5}
                fill="var(--color-primary)"
              />
              <text
                x={x + barWidth / 2}
                y={height - 8}
                textAnchor="middle"
                fill="var(--color-text-muted)"
                fontSize="12"
              >
                {entry.day}
              </text>
            </g>
          );
        })}
      </svg>

      <table className="visually-hidden">
        <caption>Study time per day this week</caption>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">Study time</th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry) => (
            <tr key={entry.day}>
              <th scope="row">{entry.day}</th>
              <td>
                {Math.floor(entry.minutes / 60)}h {entry.minutes % 60}m
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
