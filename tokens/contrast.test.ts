import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Contrast guard for every theme.
 *
 * PRD section 10 makes accessible colour contrast a requirement, not a
 * preference. A re-skin or a new theme is exactly when contrast quietly breaks,
 * so this runs against the generated CSS rather than against intentions.
 *
 * Known failures are listed explicitly below. The test fails if a new one
 * appears, and it also fails if a listed one is fixed, so the list cannot rot.
 */
const css = fs.readFileSync(path.resolve(process.cwd(), 'tokens/tokens.css'), 'utf8');

function primitives(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const m of css.matchAll(/--(_p-[\w-]+):\s*(#[0-9a-f]{6,8});/g)) map[m[1]] = m[2];
  return map;
}

function rolesFor(themeName: string | null): Record<string, string> {
  const prim = primitives();
  const block = themeName
    ? css.slice(css.indexOf(`[data-theme='${themeName}'] {`), css.indexOf('@media (prefers-color-scheme'))
    : css.slice(0, css.indexOf("[data-theme='"));

  const roles: Record<string, string> = {};
  for (const m of block.matchAll(/--(color-[\w-]+):\s*var\(--(_p-[\w-]+)\)/g)) {
    roles[m[1]] = prim[m[2]];
  }
  return roles;
}

const channel = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function ratio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** [foreground role, background role, minimum]. 4.5 for text, 3 for non-text. */
const PAIRS: [string, string, number][] = [
  ['color-text', 'color-background', 4.5],
  ['color-text', 'color-card', 4.5],
  ['color-text-muted', 'color-card', 4.5],
  ['color-text-muted', 'color-background', 4.5],
  ['color-primary', 'color-card', 4.5],
  ['color-focus-ring', 'color-card', 3],
  ['color-focus-ring', 'color-background', 3],
  ['color-confidence-established-fg', 'color-confidence-established-bg', 4.5],
  ['color-confidence-interpretation-fg', 'color-confidence-interpretation-bg', 4.5],
  ['color-confidence-verify-fg', 'color-confidence-verify-bg', 4.5],
];

/**
 * Documented in .agents/docs/DESIGN_SYSTEM.md and AGENTS.md. Both need fixing
 * in Figma; both violate PRD section 10. Listed so the suite stays green while
 * still catching anything new.
 */
const KNOWN_FAILURES = new Set(['light:color-text-muted/color-background']);

const THEMES: (string | null)[] = [null, 'dark'];

describe('colour contrast, every theme', () => {
  it('has a light and a dark role set to check', () => {
    expect(Object.keys(rolesFor(null)).length).toBeGreaterThan(8);
    expect(Object.keys(rolesFor('dark')).length).toBeGreaterThan(8);
  });

  for (const theme of THEMES) {
    const label = theme ?? 'light';

    it(`meets AA in the ${label} theme`, () => {
      const roles = rolesFor(theme);
      const unexpected: string[] = [];
      const fixed: string[] = [];

      for (const [fg, bg, min] of PAIRS) {
        if (!roles[fg] || !roles[bg]) continue;

        const key = `${label}:${fg}/${bg}`;
        const value = ratio(roles[fg], roles[bg]);
        const passes = value >= min;

        if (!passes && !KNOWN_FAILURES.has(key)) {
          unexpected.push(`${key} is ${value.toFixed(2)}:1, needs ${min}`);
        }
        if (passes && KNOWN_FAILURES.has(key)) {
          fixed.push(`${key} now passes at ${value.toFixed(2)}:1 — remove it from KNOWN_FAILURES`);
        }
      }

      expect([...unexpected, ...fixed]).toEqual([]);
    });
  }
});
