/**
 * The data-series palette, as CSS custom properties.
 *
 * Charts and tinted tiles need a colour as an SVG attribute or an inline
 * style, which is the one place a class name cannot carry it. The value is
 * still a token reference, so the roles-only rule in DESIGN_SYSTEM.md holds:
 * no component anywhere names a hex.
 *
 * It lives in lib rather than in components or in a page, because both the
 * fixtures and the views need the same vocabulary of tones.
 */
export type ChartTone = 'indigo' | 'magenta' | 'teal' | 'red' | 'amber' | 'blue';

export const CHART_TONE_VAR: Record<ChartTone, string> = {
  indigo: 'var(--color-chart-indigo)',
  magenta: 'var(--color-chart-magenta)',
  teal: 'var(--color-chart-teal)',
  red: 'var(--color-chart-red)',
  amber: 'var(--color-chart-amber)',
  blue: 'var(--color-chart-blue)',
};
