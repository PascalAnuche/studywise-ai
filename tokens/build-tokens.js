#!/usr/bin/env node
'use strict';

/**
 * Converts the Figma design token exports (*.tokens*.json) into a single
 * CSS custom property file.
 *
 * Usage:
 *   node build-tokens.js                       // auto-discovers *.tokens*.json
 *   node build-tokens.js a.json b.json         // explicit inputs
 *   node build-tokens.js --out src/tokens.css
 *
 * Colour output is deliberately two-tiered:
 *   primitives  -> raw palette values, prefixed `--_p-`, private to this file
 *   roles       -> the public API the UI consumes, every value a var() alias
 * The UI must only ever reference role variables. Primitives exist so a palette
 * value can be changed in one place; naming one in a component defeats that.
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
  tokensDir: __dirname,
  outFile: path.join(__dirname, 'tokens.css'),

  // Prefixes. `primitive` carries a leading underscore by convention: private.
  primitivePrefix: '_p',
  colorPrefix: 'color',
  textPrefix: 'text',

  // px -> rem for font sizes keeps type scaling with the user's browser setting.
  useRem: true,
  remBase: 16,

  // Unitless line-height inherits correctly; `40px` on a parent does not.
  unitlessLineHeight: true,

  fontFallback: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",

  /**
   * Applied to the slugified token name before the trailing "color"/"colour"
   * is stripped. Only for names the generic rule cannot fix on its own.
   */
  nameOverrides: {
    'tect-colour': 'text', // source token is misspelled in Figma: "tect" -> "text"
    'muted-text': 'text-muted', // group by role, not by adjective
    cards: 'card', // roles read better singular: var(--color-card)
  },

  /** Role whose value derived states darken toward, keeping them palette-warm. */
  shadeToward: 'text',

  /**
   * Interaction states, derived from the roles above rather than authored in
   * Figma. `darken` mixes toward the shadeToward role by that fraction and
   * lands one step down the primitive ladder (indigo-500 -> indigo-600), so a
   * state is a real palette entry, not a one-off value bolted onto a role.
   * Delete an entry here the moment Figma exports the state for real.
   */
  stateRoles: [
    { role: 'primary-hover', from: 'primary', darken: 0.12, description: 'Primary buttons, active nav' },
    { role: 'secondary-hover', from: 'secondary', darken: 0.08, description: 'Subtle fills, selected rows' },
    { role: 'accent-hover', from: 'accent', darken: 0.12, description: 'Accent buttons and chips' },
    { role: 'surface-hover', from: 'card', darken: 0.04, description: 'Card and list-row hover' },
    { role: 'border-hover', from: 'border', darken: 0.1, description: 'Input and card borders on hover' },
    { role: 'primary-active', from: 'primary', darken: 0.2, description: 'Pressed state' },
    { role: 'secondary-active', from: 'secondary', darken: 0.14, description: 'Pressed state' },
    { role: 'accent-active', from: 'accent', darken: 0.2, description: 'Pressed state' },
    { role: 'surface-active', from: 'card', darken: 0.07, description: 'Pressed row or card' },
    { role: 'focus-ring', from: 'primary', description: 'outline color, 2px with 2px offset' },
    { role: 'focus-halo', from: 'primary', alpha: 0.24, description: 'box-shadow glow for inset focus' },
    { role: 'border-focus', from: 'primary', description: 'Input border while focused' },
    { role: 'disabled-bg', from: 'border', description: 'Disabled control fill' },
    { role: 'disabled-border', from: 'border', description: 'Disabled control border' },
    { role: 'disabled-text', from: 'text-muted', description: 'Disabled label, exempt from AA' },
  ],
};

/** Group names that mark everything beneath them as a primitive, not a role. */
const PRIMITIVE_GROUPS = /^(primitive|primitives|palette|ref|reference|base|core|global)$/i;

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const files = [];
  let outFile = CONFIG.outFile;

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--out' || argv[i] === '-o') {
      outFile = path.resolve(argv[++i]);
    } else {
      files.push(path.resolve(argv[i]));
    }
  }
  return { files, outFile };
}

function discoverTokenFiles(dir) {
  return fs
    .readdirSync(dir)
    .filter((f) => /\.tokens.*\.json$/i.test(f))
    .sort()
    .map((f) => path.join(dir, f));
}

// ---------------------------------------------------------------------------
// Token tree -> flat lists
// ---------------------------------------------------------------------------

const isTypographyToken = (n) => !!(n && n.fontSize && n.fontFamily);
const isColorToken = (n) => !!(n && n.type === 'color' && typeof n.value === 'string');
const isScalarToken = (n) =>
  !!(n && typeof n.type === 'string' && (typeof n.value === 'string' || typeof n.value === 'number'));

function walk(node, trail, out) {
  if (!node || typeof node !== 'object' || Array.isArray(node)) return;

  if (isTypographyToken(node)) {
    out.typography.push({ trail, token: node });
    return;
  }
  if (isColorToken(node)) {
    out.colors.push({ trail, value: node.value, description: node.description });
    return;
  }
  if (isScalarToken(node)) {
    out.other.push({ trail, type: node.type, value: node.value, description: node.description });
    return;
  }

  for (const [key, child] of Object.entries(node)) {
    if (key === 'extensions' || key === 'description') continue;
    walk(child, [...trail, key], out);
  }
}

// ---------------------------------------------------------------------------
// Naming
// ---------------------------------------------------------------------------

function slugify(str) {
  return String(str)
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function tokenName(trail) {
  const slug = slugify(trail[trail.length - 1]);
  if (CONFIG.nameOverrides[slug]) return CONFIG.nameOverrides[slug];

  // "primary colour" and "border colour" are already inside --color-*.
  const stripped = slug.replace(/-?colou?r$/, '') || slug;
  return CONFIG.nameOverrides[stripped] || stripped;
}

/** Group segments between the top-level category and the token itself. */
function groupPath(trail) {
  return trail
    .slice(1, -1)
    .filter((seg) => !PRIMITIVE_GROUPS.test(seg))
    .map(slugify)
    .filter(Boolean);
}

const isPrimitive = (trail) => trail.some((seg) => PRIMITIVE_GROUPS.test(seg));

// ---------------------------------------------------------------------------
// Colour helpers
// ---------------------------------------------------------------------------

/** #rrggbbaa -> #rrggbb when fully opaque, so the common case stays readable. */
function normalizeHex(value) {
  const hex = value.trim().toLowerCase();
  const m = /^#([0-9a-f]{8})$/.exec(hex);
  if (m && m[1].slice(6) === 'ff') return `#${m[1].slice(0, 6)}`;
  return hex;
}

function hexToRgb(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function rgbToHsl({ r, g, b }) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  const l = (max + min) / 2;

  let h = 0;
  if (delta !== 0) {
    if (max === rn) h = ((gn - bn) / delta) % 6;
    else if (max === gn) h = (bn - rn) / delta + 2;
    else h = (rn - gn) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  return { h, s, l, delta };
}

const HUE_NAMES = [
  [15, 'red'], [40, 'orange'], [55, 'amber'], [70, 'yellow'], [100, 'lime'],
  [150, 'green'], [175, 'teal'], [200, 'cyan'], [230, 'blue'], [260, 'indigo'],
  [280, 'violet'], [310, 'purple'], [330, 'fuchsia'], [345, 'pink'], [360, 'red'],
];

const LIGHTNESS_STEPS = [
  [0.97, 50], [0.93, 100], [0.87, 200], [0.78, 300], [0.68, 400],
  [0.55, 500], [0.45, 600], [0.35, 700], [0.25, 800], [0.15, 900],
];

/**
 * Derives a palette-style name (indigo-500, gray-200, white) from a hex value.
 * Only used when the export has no primitive layer of its own; a real exported
 * palette keeps its authored names.
 */
function paletteName(hex) {
  const rgb = hexToRgb(hex);
  if (rgb.r === 255 && rgb.g === 255 && rgb.b === 255) return 'white';
  if (rgb.r === 0 && rgb.g === 0 && rgb.b === 0) return 'black';

  const { h, s, l, delta } = rgbToHsl(rgb);
  // Low-delta colours read as neutral even when HSL reports high saturation,
  // which it does for anything close to white or black. The delta floor stays
  // tight so a faint brand tint is still named for its hue, not as a gray.
  const neutral = s < 0.15 || delta < 0.05;
  const hue = neutral ? 'gray' : HUE_NAMES.find(([max]) => h < max)[1];
  const step = (LIGHTNESS_STEPS.find(([min]) => l >= min) || [0, 950])[1];
  return `${hue}-${step}`;
}

const toHex = (n) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, '0');

/** Mixes `from` toward `to` by `amount` (0-1) in sRGB. */
function mixHex(from, to, amount) {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  return `#${['r', 'g', 'b'].map((c) => toHex(a[c] + (b[c] - a[c]) * amount)).join('')}`;
}

function withAlpha(hex, alpha) {
  return `${normalizeHex(hex).slice(0, 7)}${toHex(alpha * 255)}`;
}

const STEP_LADDER = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

const lightnessOf = (hex) => rgbToHsl(hexToRgb(hex)).l;

/**
 * Candidate names for a derived colour, best first.
 *
 * The name comes from the value's own lightness rather than by counting rungs
 * from its base: with several derived greys competing for the 50/100/200 range,
 * rung-counting drifts far from the truth and a near-white ends up called
 * gray-500. On a collision, move toward the neighbouring rung on the side the
 * lightness difference points to, then bisect for a half-step. Half-steps like
 * gray-75 are a normal palette convention and keep the scale ordered.
 *
 * Names are assigned first-come, so ordering is locally correct rather than
 * globally guaranteed: two near-identical values can land in the wrong relative
 * rung. Guaranteeing it would mean naming every colour in one pass after
 * collection, which would renumber stable names like indigo-500 whenever a new
 * shade is added. Not worth it for identifiers the UI never references.
 */
function candidateNames(hex, taken) {
  const ideal = paletteName(hex);
  const names = [ideal];

  const match = /^(.*)-(\d+)$/.exec(ideal);
  if (!match) return names;

  const [, family, stepText] = match;
  const step = Number(stepText);
  const index = STEP_LADDER.indexOf(step);
  if (index === -1) return names;

  // Lower step number means lighter, so a lighter colour moves toward index-1.
  const existing = taken.get(ideal);
  const lighter = existing ? lightnessOf(hex) > lightnessOf(existing) : true;
  const neighbourIndex = lighter ? index - 1 : index + 1;
  const neighbour = STEP_LADDER[neighbourIndex] ?? (lighter ? 0 : 1000);

  names.push(`${family}-${neighbour}`);
  names.push(`${family}-${Math.round((step + neighbour) / 2)}`);
  return names;
}

// ---------------------------------------------------------------------------
// Dimensions
// ---------------------------------------------------------------------------

const round = (n, places = 4) => Number(n.toFixed(places));

function px(value) {
  return value === 0 ? '0' : `${round(value)}px`;
}

function fontSize(value) {
  return CONFIG.useRem ? `${round(value / CONFIG.remBase)}rem` : px(value);
}

function lineHeight(value, size) {
  if (CONFIG.unitlessLineHeight && size) return String(round(value / size, 3));
  return px(value);
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

/**
 * The shared primitive pool.
 *
 * Themes register their values here too, so every theme draws from one palette
 * and a colour used by both light and dark is stored once. Kept outside
 * buildColors so it can be threaded through several calls.
 */
function createPalette() {
  return {
    primitives: new Map(), // css var name -> hex
    valueToPrimitive: new Map(), // hex -> css var name
  };
}

/**
 * @param namespace Prefixes primitives this call registers, e.g. "dark". A
 *   themed palette collides with the base one at almost every rung, and the
 *   numeric fallback turns that into `indigo-950-2` and `indigo-950-3`, which
 *   say nothing about which is the background and which is a card. Namespacing
 *   keeps both readable. Exact colour matches still dedupe to the existing
 *   primitive, so a value shared by both themes is stored once.
 */
function buildColors(colorTokens, warnings, palette = createPalette(), namespace = '') {
  const { primitives, valueToPrimitive } = palette;
  const scoped = (name) => (namespace ? `${namespace}-${name}` : name);
  const byPath = new Map(); // dotted token path -> css var name
  const roles = [];

  const authored = colorTokens.filter((t) => isPrimitive(t.trail));
  const roleTokens = colorTokens.filter((t) => !isPrimitive(t.trail));

  const rolePrimitive = new Map(); // role name -> { primitive, hex }

  /** Registers under an already-final name. The only place that writes. */
  const register = (finalName, hex) => {
    // An identical colour in another theme reuses that primitive rather than
    // registering a namespaced duplicate.
    if (valueToPrimitive.has(hex)) return valueToPrimitive.get(hex);

    let unique = finalName;
    let n = 2;
    while (primitives.has(unique) && primitives.get(unique) !== hex) unique = `${finalName}-${n++}`;
    primitives.set(unique, hex);
    valueToPrimitive.set(hex, unique);
    return unique;
  };

  const addPrimitive = (name, hex) => register(scoped(name), hex);

  /**
   * Registers a derived value under the palette name its own lightness earns,
   * stepping to a neighbouring or half rung when that name is already spoken
   * for. See candidateNames.
   */
  const addDerivedPrimitive = (hex) => {
    if (valueToPrimitive.has(hex)) return valueToPrimitive.get(hex);
    for (const candidate of candidateNames(hex, primitives)) {
      const key = scoped(candidate);
      if (!primitives.has(key)) return register(key, hex);
      if (primitives.get(key) === hex) return key;
    }
    return register(scoped(paletteName(hex)), hex); // Falls through to a suffix.
  };

  // 1. Primitives the export actually declares keep their authored names.
  for (const token of authored) {
    const hex = normalizeHex(token.value);
    const name = [...groupPath(token.trail), tokenName(token.trail)].join('-');
    const varName = addPrimitive(name, hex);
    byPath.set(token.trail.join('.'), `${CONFIG.primitivePrefix}-${varName}`);
  }

  // 2. Roles. A role either aliases a primitive or carries a literal value; a
  //    literal gets lifted into the primitive layer so no role owns a raw hex.
  for (const token of roleTokens) {
    const raw = String(token.value).trim();
    const name = [...groupPath(token.trail), tokenName(token.trail)].join('-');
    const alias = /^\{(.+)\}$/.exec(raw);
    let reference;

    if (alias) {
      const target = byPath.get(alias[1]);
      if (target) {
        reference = `var(--${target})`;
        const primitive = target.replace(`${CONFIG.primitivePrefix}-`, '');
        if (primitives.has(primitive)) rolePrimitive.set(name, { primitive, hex: primitives.get(primitive) });
      } else {
        warnings.push(`Unresolved alias {${alias[1]}} on color role "${name}"`);
        reference = 'inherit';
      }
    } else {
      const hex = normalizeHex(raw);
      const primitive = valueToPrimitive.get(hex) || addPrimitive(paletteName(hex), hex);
      reference = `var(--${CONFIG.primitivePrefix}-${primitive})`;
      rolePrimitive.set(name, { primitive, hex });
    }

    roles.push({ name: `${CONFIG.colorPrefix}-${name}`, value: reference, description: token.description });
    byPath.set(token.trail.join('.'), `${CONFIG.colorPrefix}-${name}`);
  }

  // 3. Interaction states, derived from the roles above.
  const states = [];
  const ink = rolePrimitive.get(CONFIG.shadeToward);
  const inkHex = ink ? ink.hex : '#000000';

  for (const spec of CONFIG.stateRoles) {
    const base = rolePrimitive.get(spec.from);
    if (!base) {
      warnings.push(`State role "${spec.role}" skipped, base role "${spec.from}" not found`);
      continue;
    }

    let primitive;
    if (spec.alpha != null) {
      // register, not addPrimitive: base.primitive already carries the
      // namespace, so scoping again would give dark-dark-indigo-300-a24.
      primitive = register(
        `${base.primitive}-a${Math.round(spec.alpha * 100)}`,
        withAlpha(base.hex, spec.alpha)
      );
    } else if (spec.darken) {
      primitive = addDerivedPrimitive(mixHex(base.hex, inkHex, spec.darken));
    } else if (spec.lighten) {
      primitive = addDerivedPrimitive(mixHex(base.hex, '#ffffff', spec.lighten));
    } else {
      primitive = base.primitive; // Same value as the base, different semantic slot.
    }

    states.push({
      name: `${CONFIG.colorPrefix}-${spec.role}`,
      value: `var(--${CONFIG.primitivePrefix}-${primitive})`,
      description: spec.description,
    });
  }

  // Natural sort, so gray-50 lands before gray-100 rather than after gray-200.
  const collator = new Intl.Collator('en', { numeric: true });
  const orderedPrimitives = [...primitives.entries()].sort(([a], [b]) => collator.compare(a, b));
  return { primitives: orderedPrimitives, roles, states, palette };
}

/**
 * A theme restates the role layer against the same primitives.
 *
 * Role *names* never change between themes, only what they point at. That is
 * what lets a component written against `--color-text` survive a re-skin
 * untouched, and it is why a theme file has to define the whole role set rather
 * than a few overrides: the derived states (hover, pressed, focus) are computed
 * from the roles, so a half-defined theme would mix light hovers into dark
 * surfaces.
 */
function buildTheme(name, colorTokens, palette, baseRoleNames, warnings) {
  const built = buildColors(colorTokens, warnings, palette, name);
  const defined = new Set(built.roles.map((role) => role.name));

  for (const roleName of baseRoleNames) {
    if (!defined.has(roleName)) {
      warnings.push(
        `Theme "${name}" does not define ${roleName}. It will inherit the base value, which may not suit the theme.`
      );
    }
  }

  return { name, roles: built.roles, states: built.states };
}

function buildTypography(typographyTokens) {
  const families = new Set(typographyTokens.map((t) => t.token.fontFamily.value));
  const sharedFamily = families.size === 1 ? [...families][0] : null;
  const styles = [];

  for (const { trail, token } of typographyTokens) {
    const base = [CONFIG.textPrefix, ...groupPath(trail), tokenName(trail)].join('-');
    const size = token.fontSize.value;
    const props = [];

    const family = sharedFamily
      ? 'var(--font-family-base)'
      : `'${token.fontFamily.value}', ${CONFIG.fontFallback}`;

    props.push(['family', family]);
    props.push(['size', fontSize(size)]);
    props.push(['weight', String(token.fontWeight.value)]);
    props.push(['line-height', lineHeight(token.lineHeight.value, size)]);
    props.push(['letter-spacing', px(token.letterSpacing ? token.letterSpacing.value : 0)]);

    // Everything below is "none"/0 in the current export; emitted only when it
    // actually says something, so consumers are not handed inert variables.
    if (token.fontStyle && token.fontStyle.value !== 'normal') {
      props.push(['style', token.fontStyle.value]);
    }
    if (token.textCase && token.textCase.value !== 'none') {
      props.push(['transform', token.textCase.value.toLowerCase()]);
    }
    if (token.textDecoration && token.textDecoration.value !== 'none') {
      props.push(['decoration', token.textDecoration.value.toLowerCase()]);
    }
    if (token.paragraphSpacing && token.paragraphSpacing.value !== 0) {
      props.push(['paragraph-spacing', px(token.paragraphSpacing.value)]);
    }
    if (token.paragraphIndent && token.paragraphIndent.value !== 0) {
      props.push(['paragraph-indent', px(token.paragraphIndent.value)]);
    }

    styles.push({
      base,
      description: token.description,
      vars: props.map(([suffix, value]) => [`${base}-${suffix}`, value]),
      // `font` shorthand, so a component can set one property instead of four.
      shorthand: `var(--${base}-weight) var(--${base}-size)/var(--${base}-line-height) var(--${base}-family)`,
    });
  }

  return { sharedFamily, styles };
}

function buildOther(otherTokens) {
  return otherTokens.map(({ trail, type, value, description }) => ({
    name: [...trail.slice(0, -1).map(slugify), tokenName(trail)].join('-'),
    value: type === 'dimension' && typeof value === 'number' ? px(value) : String(value),
    description,
  }));
}

// ---------------------------------------------------------------------------
// Emit
// ---------------------------------------------------------------------------

function declaration(name, value, description, indent = '  ') {
  const comment = description ? ` /* ${description} */` : '';
  return `${indent}--${name}: ${value};${comment}`;
}

function section(title, note) {
  const bar = '='.repeat(74);
  return [`  /* ${bar}`, `     ${title}`, ...(note ? [`     ${note}`] : []), `     ${bar} */`].join('\n');
}

function emitCss({ colors, typography, other, sources, themes = [] }) {
  const lines = [];

  lines.push('/**');
  lines.push(' * Design tokens as CSS custom properties.');
  lines.push(' *');
  lines.push(' * GENERATED FILE, do not edit by hand.');
  lines.push(' * Source: ' + sources.map((f) => path.basename(f)).join(', '));
  lines.push(' * Regenerate: node build-tokens.js');
  lines.push(' */');
  lines.push('');
  lines.push(':root {');

  if (colors.primitives.length) {
    lines.push(section('COLOR PRIMITIVES, INTERNAL', 'Do not use in the UI. Reference the roles below instead.'));
    for (const [name, hex] of colors.primitives) {
      lines.push(declaration(`${CONFIG.primitivePrefix}-${name}`, hex));
    }
    lines.push('');
  }

  if (colors.roles.length) {
    lines.push(section('COLOR ROLES, PUBLIC', 'The only colour variables the UI should consume.'));
    for (const role of colors.roles) {
      lines.push(declaration(role.name, role.value, role.description));
    }
    lines.push('');
  }

  if (colors.states.length) {
    lines.push(section('INTERACTION STATES, PUBLIC', 'Derived from the roles above, not authored in Figma.'));
    for (const state of colors.states) {
      lines.push(declaration(state.name, state.value, state.description));
    }
    lines.push('');
  }

  if (typography.styles.length) {
    lines.push(section('TYPOGRAPHY'));
    if (typography.sharedFamily) {
      lines.push(declaration('font-family-base', `'${typography.sharedFamily}', ${CONFIG.fontFallback}`));
      lines.push('');
    }
    for (const style of typography.styles) {
      if (style.description) lines.push(`  /* ${style.description} */`);
      for (const [name, value] of style.vars) lines.push(declaration(name, value));
      lines.push(declaration(style.base, style.shorthand));
      lines.push('');
    }
  }

  if (other.length) {
    lines.push(section('OTHER TOKENS'));
    for (const token of other) lines.push(declaration(token.name, token.value, token.description));
    lines.push('');
  }

  while (lines[lines.length - 1] === '') lines.pop();
  lines.push('}');

  /*
   * Themes restate only the role layer. Emitted twice on purpose: once for an
   * explicit choice via [data-theme], and once for the operating system
   * preference, with the explicit choice winning so a user who has picked a
   * theme keeps it.
   */
  for (const theme of themes) {
    const body = [
      ...(theme.roles.length
        ? [section(`COLOR ROLES, ${theme.name.toUpperCase()}`), ...theme.roles.map((r) => declaration(r.name, r.value, r.description))]
        : []),
      ...(theme.states.length
        ? ['', section(`INTERACTION STATES, ${theme.name.toUpperCase()}`), ...theme.states.map((s) => declaration(s.name, s.value, s.description))]
        : []),
    ];

    if (!body.length) continue;

    lines.push('');
    lines.push(`[data-theme='${theme.name}'] {`);
    lines.push(...body);
    lines.push('}');

    lines.push('');
    lines.push(`@media (prefers-color-scheme: ${theme.name}) {`);
    lines.push(`  :root:not([data-theme]) {`);
    lines.push(...body.map((line) => (line ? `  ${line}` : line)));
    lines.push('  }');
    lines.push('}');
  }

  lines.push('');
  return lines.join('\n');
}

// ---------------------------------------------------------------------------

/** `dark.theme.tokens.json` -> theme "dark". Anything else is a base token file. */
const THEME_FILE = /^(.+)\.theme\.tokens\.json$/i;

function classifySources(files) {
  const base = [];
  const themes = new Map();

  for (const file of files) {
    const match = THEME_FILE.exec(path.basename(file));
    if (!match) {
      base.push(file);
      continue;
    }
    const name = match[1].toLowerCase();
    themes.set(name, [...(themes.get(name) ?? []), file]);
  }

  return { base, themes };
}

function collectFrom(files) {
  const collected = { colors: [], typography: [], other: [] };
  for (const file of files) {
    walk(JSON.parse(fs.readFileSync(file, 'utf8')), [], collected);
  }
  return collected;
}

function main() {
  const { files, outFile } = parseArgs(process.argv.slice(2));
  const sources = files.length ? files : discoverTokenFiles(CONFIG.tokensDir);

  if (!sources.length) {
    console.error(`No token files found in ${CONFIG.tokensDir} (expected *.tokens*.json)`);
    process.exit(1);
  }

  const { base, themes: themeSources } = classifySources(sources);
  const collected = collectFrom(base);

  const warnings = [];
  const colors = buildColors(collected.colors, warnings);
  const typography = buildTypography(collected.typography);
  const other = buildOther(collected.other);

  // Themes share the base palette, so a colour used by both is stored once.
  const baseRoleNames = colors.roles.map((role) => role.name);
  const themes = [...themeSources.entries()].map(([name, themeFiles]) =>
    buildTheme(name, collectFrom(themeFiles).colors, colors.palette, baseRoleNames, warnings)
  );

  // Theme roles may have added primitives, so re-sort after they are built.
  const collator = new Intl.Collator('en', { numeric: true });
  colors.primitives = [...colors.palette.primitives.entries()].sort(([a], [b]) =>
    collator.compare(a, b)
  );

  fs.writeFileSync(outFile, emitCss({ colors, typography, other, sources, themes }), 'utf8');

  for (const warning of warnings) console.warn(`warning: ${warning}`);
  console.log(`Read ${sources.length} token file(s):`);
  for (const file of sources) console.log(`  ${path.basename(file)}`);
  console.log(
    `Wrote ${path.relative(process.cwd(), outFile) || outFile}: ` +
      `${colors.roles.length} colour role(s), ${colors.states.length} state role(s), ` +
      `${colors.primitives.length} primitive(s), ${typography.styles.length} text style(s)` +
      (other.length ? `, ${other.length} other token(s)` : '') +
      (themes.length ? `, ${themes.length} theme(s): ${themes.map((t) => t.name).join(', ')}` : '')
  );
}

main();
