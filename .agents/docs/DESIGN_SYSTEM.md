# Design System

Color and typography are now defined and exported from Figma. Spacing, component states, and iconography are still open, don't treat the sections below marked "not yet defined" as settled.

## Tokens

Source of truth is the Figma export, not the CSS. All four files live in `/tokens`:

```
tokens/design-tokens.tokens.json       color styles
tokens/design-tokens.tokens (1).json   typography styles
  -> node tokens/build-tokens.js
  -> tokens/tokens.css                 generated, do not edit by hand
```

The script resolves paths relative to itself, so it runs from anywhere.

Re-export from Figma and re-run the script, never hand-edit `tokens.css`. Naming fixes (the misspelled `tect colour` style, `cards` -> `card`) live in the `nameOverrides` map at the top of `build-tokens.js`, fix them in Figma when convenient and drop the overrides.

## Color

Two tiers. Primitives (`--_p-*`) are the raw palette, roles (`--color-*`) are the API. **The UI only uses roles.** Naming a primitive in a component means a palette change stops propagating, which is the entire point of the tier split.

| Role | Value | Use |
| --- | --- | --- |
| `--color-primary` | `#6855df` indigo | Primary actions, active states, brand |
| `--color-secondary` | `#f1efff` indigo tint | Subtle fills, selected backgrounds |
| `--color-accent` | `#f4a24c` orange | Highlights, drawing attention |
| `--color-text` | `#121427` | Body and heading text |
| `--color-text-muted` | `#717489` | Supporting and secondary text |
| `--color-background` | `#fafafc` | Page background |
| `--color-card` | `#ffffff` | Card and raised surfaces |
| `--color-border` | `#e8e8f0` | Dividers, input borders |

### Themes

A theme is a file named `<name>.theme.tokens.json` in `/tokens`. It restates the whole role set against the same primitives; role names never change, only what they point at. That indirection is what lets a re-skin happen without touching a component.

`dark.theme.tokens.json` ships today. The build emits both an explicit `[data-theme='dark']` block and a `prefers-color-scheme` block, with the explicit choice winning. `ThemeToggle` in the topbar sets the attribute and knows no colours.

A theme must define **every** role. Interaction states are derived from the roles, so a half-defined theme mixes light hovers into dark surfaces; the build warns when a role is missing. Theme primitives are namespaced (`--_p-dark-indigo-300`) so both palettes stay readable, and a colour identical in both themes is stored once.

`tokens/contrast.test.ts` checks every theme against WCAG AA on each regeneration. See `EXTENDING.md`.

### Hover and focus

Derived, not authored in Figma. Each state mixes its base role toward `--color-text` and lands one rung down the primitive ladder, so `--color-primary-hover` is a real `indigo-600`, not a one-off value. The derivation table is `stateRoles` in `build-tokens.js`, delete an entry the moment Figma exports that state for real.

| State role | Derived from | Use |
| --- | --- | --- |
| `--color-primary-hover` | primary, 12% | Primary buttons, active nav |
| `--color-secondary-hover` | secondary, 8% | Subtle fills, selected rows |
| `--color-accent-hover` | accent, 12% | Accent buttons and chips |
| `--color-surface-hover` | card, 4% | Card and list-row hover |
| `--color-border-hover` | border, 10% | Input and card borders on hover |
| `--color-focus-ring` | primary | `outline`, 2px solid with 2px offset |
| `--color-focus-halo` | primary at 24% alpha | `box-shadow` glow for inset focus |
| `--color-border-focus` | primary | Input border while focused |

```css
.button-primary:hover  { background: var(--color-primary-hover); }
.button-primary:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}
```

Focus is `:focus-visible`, never `:focus`, so a mouse click doesn't leave a ring behind. Never remove the outline without putting an equivalent indicator back.

Contrast, measured not assumed:
- Primary carries white text at 5.31:1, its hover at 6.21:1, both clear AA
- **Accent needs `--color-text` on top, not white.** White on accent is 2.08:1 and fails badly, ink on accent is 8.76:1
- Focus ring clears the 3:1 non-text minimum against every surface it can land on, 5.31:1 on card, 5.10:1 on background, 4.69:1 on a secondary fill

## Typography

Inter throughout, via `--font-family-base`. Each style exposes `-family`, `-size`, `-weight`, `-line-height`, `-letter-spacing`, plus a `font` shorthand:

```css
font: var(--text-h1);              /* whole style */
font-size: var(--text-h3-size);    /* or one property */
```

| Style | Size | Weight | Line height | Use |
| --- | --- | --- | --- | --- |
| `--text-h1` | 32px | 700 | 1.25 | Main page heading |
| `--text-h2` | 24px | 700 | 1.333 | Major sections |
| `--text-h3` | 20px | 600 | 1.4 | Card and section headings |
| `--text-h4` | 18px | 600 | 1.333 | Smaller headings |
| `--text-body-large` | 16px | 400 | 1.5 | Important description |
| `--text-body` | 14px | 400 | 1.429 | Main UI text |
| `--text-body-medium` | 14px | 500 | 1.429 | Labels, emphasized text |
| `--text-caption` | 12px | 400 | 1.333 | Supporting information |
| `--text-button` | 14px | 600 | 1.429 | Buttons and CTAs |

Sizes emit as rem against a 16px base, line heights are unitless ratios so they inherit correctly. Both are flags in `build-tokens.js` if that needs to change.

## Known Accessibility Issues

Both are properties of the exported palette itself, not of the derived states, and both need fixing in Figma rather than in `tokens.css`. Both also violate PRD section 10, which makes accessible color contrast a non-functional requirement, so these are requirement failures rather than polish items.

- **`--color-text-muted` fails AA on `--color-background`.** `#717489` is 4.60:1 on white and 4.42:1 on the page background, so muted text is already non-compliant on the page's own background, before any hover is involved. It fails on every hover surface too. Darkening it about 5% to `#6c6f84` clears 4.5:1 everywhere, including on `--color-surface-hover`.
- **`--color-border` is 1.22:1 against a card.** Fine for decorative dividers, below the 3:1 needed where a border is the only thing identifying a control, which is exactly the case for text inputs. `--color-border-hover` only reaches 1.49:1. Inputs need a darker border role, or a fill that distinguishes them on its own.

## Looking at the UI

`npm run shots` renders every page at desktop and mobile widths into `.screenshots/`, using Playwright. Use it. Verifying CSS by assertion tells you the tokens are wired up; it does not tell you the page looks right. Two bugs got through review and were only caught by looking: a `fieldset` drawing its default browser border around the difficulty group, and a dashboard column leaving a large hole beside a taller neighbour.

One caveat: full-page capture flattens `position: sticky` elements to wherever they happened to be, which makes a sticky composer look like it overlaps content. `node scripts/viewshot.mjs <url> <out>` captures a real viewport instead. Check there before "fixing" a sticky element.

## Still Not Defined

- **Confidence level colors** — the three levels (well-established, one interpretation, worth verifying) have no roles. The current palette has no success/warning/danger colors at all, `--color-accent` is the only non-brand hue. This blocks `ConfidenceBadge`, see below.
- **Spacing and grid system** — no scale exported yet. `build-tokens.js` already emits dimension tokens into an "other" section, so a Figma spacing export needs no script changes.
- **Remaining component states** — pressed/active, disabled, and loading for the shared components in `COMPONENTS.md`. They derive the same way hover does, add them to `stateRoles`, don't darken a role inline at the call site.
- **Iconography set**

## Constraints from Research

Whatever gets defined should support two things the research called out directly:
- A clear, consistent visual affordance for "why" content, per the journey map, this is the single biggest lever for trust, it shouldn't be an afterthought styled the same as everything else
- Enough visual calm to reduce the "overwhelmed by coursework" feeling from the empathy map, avoid dense, cluttered dashboards, especially on the Progress view

These two pull against each other with the palette as it stands. `ConfidenceBadge` and `ReasoningPanel` are the highest-value components per `COMPONENTS.md`, and both need visual weight the current eight roles can't give them without leaning on `--color-accent` for everything. Define the confidence colors before building either.
