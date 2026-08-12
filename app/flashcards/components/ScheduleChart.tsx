/**
 * Cards scheduled per day, for the Spaced Repetition Overview.
 *
 * Inline SVG with no chart dependency, matching the approach on Progress. The
 * same figures are given as a table to assistive technology, because a line a
 * screen reader cannot read is decoration, not a chart.
 */
export interface ScheduleChartProps {
  data: { day: string; cards: number }[];
}

export function ScheduleChart({ data }: ScheduleChartProps) {
  const width = 520;
  const height = 220;
  const padLeft = 34;
  const padBottom = 28;
  const padTop = 10;

  const top = 200;
  const plotHeight = height - padBottom - padTop;
  const plotWidth = width - padLeft - 8;
  const step = data.length > 1 ? plotWidth / (data.length - 1) : plotWidth;

  const points = data.map((entry, index) => ({
    x: padLeft + index * step,
    y: padTop + plotHeight - Math.min(entry.cards / top, 1) * plotHeight,
  }));

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ');
  const area = `${line} L${points.at(-1)!.x} ${padTop + plotHeight} L${points[0]!.x} ${
    padTop + plotHeight
  } Z`;

  const gridLines = [0, 50, 100, 150, 200];

  return (
    <>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        style={{ height: 'auto', display: 'block' }}
        role="img"
        aria-label="Cards scheduled per day"
      >
        {gridLines.map((value) => {
          const y = padTop + plotHeight - (value / top) * plotHeight;
          return (
            <g key={value}>
              <line x1={padLeft} x2={width} y1={y} y2={y} stroke="var(--color-border)" />
              <text
                x={padLeft - 8}
                y={y + 4}
                textAnchor="end"
                fill="var(--color-text-muted)"
                fontSize="11"
              >
                {value}
              </text>
            </g>
          );
        })}

        <path d={area} fill="var(--color-secondary)" />
        <path d={line} fill="none" stroke="var(--color-primary)" strokeWidth={2} />

        {points.map((point, index) => (
          <circle key={data[index]!.day} cx={point.x} cy={point.y} r={3} fill="var(--color-primary)" />
        ))}

        {data.map((entry, index) => (
          <text
            key={entry.day}
            x={points[index]!.x}
            y={height - 8}
            textAnchor="middle"
            fill="var(--color-text-muted)"
            fontSize="11"
          >
            {entry.day}
          </text>
        ))}
      </svg>

      <table className="visually-hidden">
        <caption>Cards scheduled per day</caption>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">Cards</th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry) => (
            <tr key={entry.day}>
              <th scope="row">{entry.day}</th>
              <td>{entry.cards}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
