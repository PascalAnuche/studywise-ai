/**
 * Inline SVG icon set.
 *
 * Drawn here rather than pulled from a library: five icons don't justify a
 * dependency, and inline paths inherit `currentColor` so they follow the token
 * roles automatically instead of needing their own colour rules.
 *
 * 24x24 grid, 1.75 stroke, round caps. Every icon is decorative, so they carry
 * aria-hidden and the accessible name comes from the surrounding text.
 */
export type IconName =
  | 'home'
  | 'learn'
  | 'plan'
  | 'practice'
  | 'progress'
  | 'resources'
  | 'flashcards'
  | 'notes'
  | 'achievements'
  | 'profile'
  | 'settings'
  | 'flame'
  | 'check'
  | 'target'
  | 'arrow-right'
  | 'arrow-left'
  | 'sparkle'
  | 'search'
  | 'bell'
  | 'chevron-down'
  | 'send'
  | 'bookmark'
  | 'thumb-up'
  | 'thumb-down'
  | 'history'
  | 'expand'
  | 'lightbulb'
  | 'wand'
  | 'upload';

const PATHS: Record<IconName, React.ReactNode> = {
  home: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.5 9.5V20h13V9.5" />
    </>
  ),
  learn: (
    <>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10a2.5 2.5 0 0 1 2 1 2.5 2.5 0 0 1 2-1h4.5A1.5 1.5 0 0 1 20 5.5v12a1.5 1.5 0 0 1-1.5 1.5H14a2.5 2.5 0 0 0-2 1 2.5 2.5 0 0 0-2-1H5.5A1.5 1.5 0 0 1 4 17.5Z" />
      <path d="M12 5v14" />
    </>
  ),
  plan: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" />
      <path d="M7.5 13.5h4M7.5 16.5h7" />
    </>
  ),
  practice: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.5 9.75a2.5 2.5 0 1 1 3.3 2.37c-.5.17-.8.65-.8 1.18v.45" />
      <path d="M12 16.75h.01" />
    </>
  ),
  progress: (
    <>
      <path d="M4 19.5V13m5 6.5V8m5 11.5v-5m5 5V5" />
    </>
  ),
  flame: (
    <>
      <path d="M12 3.5s4.5 3.6 4.5 7.9a4.5 4.5 0 0 1-9 0c0-1.3.5-2.4 1.2-3.3.3 1 .9 1.7 1.6 2 0-2.4.9-4.7 1.7-6.6Z" />
    </>
  ),
  check: (
    <>
      <path d="M4.5 12.5 9.5 17.5 19.5 7" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="0.75" fill="currentColor" stroke="none" />
    </>
  ),
  resources: (
    <>
      <path d="M4 6.5A1.5 1.5 0 0 1 5.5 5h3.4a1.5 1.5 0 0 1 1.2.6l.9 1.2h7.5A1.5 1.5 0 0 1 20 8.3V18a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18Z" />
    </>
  ),
  flashcards: (
    <>
      <rect x="6.5" y="7.5" width="14" height="11" rx="2" />
      <path d="M16.5 4.5h-11A1.5 1.5 0 0 0 4 6v9" />
    </>
  ),
  notes: (
    <>
      <path d="M6 3.5h8.5L19 8v12.5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1Z" />
      <path d="M14 3.5V8h4.5M8.5 12.5h7M8.5 16h4.5" />
    </>
  ),
  achievements: (
    <>
      <path d="M8 4h8v5a4 4 0 0 1-8 0Z" />
      <path d="M8 5.5H5.5v1A3.5 3.5 0 0 0 8 9.9M16 5.5h2.5v1A3.5 3.5 0 0 1 16 9.9" />
      <path d="M12 13v3.5M9 20h6M10.5 16.5h3l.5 3.5h-4Z" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="8.5" r="3.75" />
      <path d="M4.75 20a7.25 7.25 0 0 1 14.5 0" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 14.5a1.5 1.5 0 0 0 .3 1.65l.05.05a1.8 1.8 0 1 1-2.55 2.55l-.05-.05a1.5 1.5 0 0 0-2.55 1.06V20a1.8 1.8 0 0 1-3.6 0v-.1A1.5 1.5 0 0 0 7.9 18.5l-.05.05a1.8 1.8 0 1 1-2.55-2.55l.05-.05A1.5 1.5 0 0 0 4 13.4H4a1.8 1.8 0 0 1 0-3.6h.1A1.5 1.5 0 0 0 5.5 7.9l-.05-.05A1.8 1.8 0 1 1 8 5.3l.05.05a1.5 1.5 0 0 0 1.65.3H9.8a1.5 1.5 0 0 0 .9-1.37V4a1.8 1.8 0 0 1 3.6 0v.1a1.5 1.5 0 0 0 2.55 1.06l.05-.05A1.8 1.8 0 1 1 19.45 7.7l-.05.05a1.5 1.5 0 0 0-.3 1.65v.05a1.5 1.5 0 0 0 1.37.9H20a1.8 1.8 0 0 1 0 3.6h-.1a1.5 1.5 0 0 0-1.37.9Z" />
    </>
  ),
  'arrow-right': (
    <>
      <path d="M5 12h13.5M13 6.5l5.5 5.5-5.5 5.5" />
    </>
  ),
  'arrow-left': (
    <>
      <path d="M19 12H5.5M11 6.5 5.5 12l5.5 5.5" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8.5a6 6 0 1 0-12 0c0 5-2 6.5-2 6.5h16s-2-1.5-2-6.5Z" />
      <path d="M13.7 19a2 2 0 0 1-3.4 0" />
    </>
  ),
  'chevron-down': (
    <>
      <path d="m6.5 9.5 5.5 5.5 5.5-5.5" />
    </>
  ),
  send: (
    <>
      <path d="M20 4 3.5 10.5l6.5 2.5 2.5 6.5L20 4Z" />
      <path d="m10 13 4-4" />
    </>
  ),
  bookmark: (
    <>
      <path d="M6.5 4.5h11v16l-5.5-4-5.5 4Z" />
    </>
  ),
  'thumb-up': (
    <>
      <path d="M7 10.5v9H4.5v-9Z" />
      <path d="M7 10.5 11 3a2.2 2.2 0 0 1 2.2 2.5l-.6 3.4h5.2a1.8 1.8 0 0 1 1.75 2.2l-1.4 6.2a1.8 1.8 0 0 1-1.75 1.4H7Z" />
    </>
  ),
  'thumb-down': (
    <>
      <path d="M7 13.5v-9H4.5v9Z" />
      <path d="M7 13.5 11 21a2.2 2.2 0 0 0 2.2-2.5l-.6-3.4h5.2a1.8 1.8 0 0 0 1.75-2.2l-1.4-6.2A1.8 1.8 0 0 0 16.4 5.3H7Z" />
    </>
  ),
  history: (
    <>
      <path d="M4 12a8 8 0 1 0 2.4-5.7M4 5.5V11h5.5" />
      <path d="M12 8v4.4l3 1.8" />
    </>
  ),
  expand: (
    <>
      <path d="M14.5 4.5H20v5.5M9.5 19.5H4V14M20 4.5l-6.5 6.5M4 20l6.5-6.5" />
    </>
  ),
  lightbulb: (
    <>
      <path d="M9.5 17.5a5.5 5.5 0 1 1 5 0v1.2a1.3 1.3 0 0 1-1.3 1.3h-2.4a1.3 1.3 0 0 1-1.3-1.3Z" />
      <path d="M9.5 17.5h5" />
    </>
  ),
  wand: (
    <>
      <path d="M4 20 15 9M13.5 4.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7Z" />
      <path d="M19 12.5l.5 1.4 1.4.5-1.4.5-.5 1.4-.5-1.4-1.4-.5 1.4-.5Z" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V4.5M7.5 9 12 4.5 16.5 9" />
      <path d="M4.5 15.5V19a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-3.5" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 3.5 13.7 9l5.5 1.7-5.5 1.7L12 18l-1.7-5.6L4.8 10.7 10.3 9Z" />
      <path d="M18.5 15.5 19.2 18l2.3.8-2.3.8-.7 2.4-.7-2.4-2.3-.8 2.3-.8Z" />
    </>
  ),
};

/**
 * Solid variants, used for the active navigation destination.
 *
 * Drawn as closed shapes rather than filling the outline paths: several of the
 * outlines are open strokes, and filling those produces a smear rather than a
 * solid icon. Only the destinations that can be "active" need one; anything
 * without a filled variant falls back to its outline.
 */
const FILLED_PATHS: Partial<Record<IconName, React.ReactNode>> = {
  home: <path d="M11.36 2.73a1 1 0 0 1 1.28 0l8 6.67c.23.19.36.47.36.77V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9.83c0-.3.13-.58.36-.77Z" />,
  learn: (
    <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10a2.5 2.5 0 0 1 1.5.5V20a2.5 2.5 0 0 0-1.5-.5H5.5A1.5 1.5 0 0 1 4 18Zm8.5-1A2.5 2.5 0 0 1 14 4h4.5A1.5 1.5 0 0 1 20 5.5V18a1.5 1.5 0 0 1-1.5 1.5H14a2.5 2.5 0 0 0-1.5.5Z" />
  ),
  plan: (
    <path d="M8 2.5a.75.75 0 0 1 .75.75V5h6.5V3.25a.75.75 0 0 1 1.5 0V5h2A1.75 1.75 0 0 1 20.5 6.75V9h-17V6.75A1.75 1.75 0 0 1 5.25 5h2V3.25A.75.75 0 0 1 8 2.5ZM3.5 10.5h17v8.75A1.75 1.75 0 0 1 18.75 21H5.25a1.75 1.75 0 0 1-1.75-1.75Zm3.25 3a.75.75 0 0 0 0 1.5h5a.75.75 0 0 0 0-1.5Zm0 3a.75.75 0 0 0 0 1.5h8a.75.75 0 0 0 0-1.5Z" />
  ),
  progress: (
    <path d="M3 13a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v6.5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Zm5-5a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v11.5a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1Zm5 6a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v5.5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1Zm5-9a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v14.5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1Z" />
  ),
  resources: (
    <path d="M3.5 6.5A2 2 0 0 1 5.5 4.5h3.4a2 2 0 0 1 1.6.8l1 1.35h7A2 2 0 0 1 20.5 8.65V18a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2Z" />
  ),
  flashcards: (
    <path d="M4 5.25A1.75 1.75 0 0 1 5.75 3.5h10.5a1.75 1.75 0 0 1 1.75 1.75V6H8.25A2.25 2.25 0 0 0 6 8.25V16.5h-.25A1.75 1.75 0 0 1 4 14.75Zm3.5 3A1.5 1.5 0 0 1 9 6.75h9.75a1.75 1.75 0 0 1 1.75 1.75v9.75A1.75 1.75 0 0 1 18.75 20H9.25A1.75 1.75 0 0 1 7.5 18.25Z" />
  ),
  notes: (
    <path d="M6 2.5h7.5L19.5 8v12.5A1.5 1.5 0 0 1 18 22H6a1.5 1.5 0 0 1-1.5-1.5v-16.5A1.5 1.5 0 0 1 6 2.5Zm7.75 1.6V8h3.9ZM8.5 12a.75.75 0 0 0 0 1.5h7a.75.75 0 0 0 0-1.5Zm0 3.5a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5Z" />
  ),
  achievements: (
    <path d="M7.25 3.5h9.5v1.25h2.5a.75.75 0 0 1 .75.75v1a4.25 4.25 0 0 1-3.6 4.2 5.02 5.02 0 0 1-3.15 2.62v2.43h1.13a1.5 1.5 0 0 1 1.48 1.25l.47 2.75H7.67l.47-2.75a1.5 1.5 0 0 1 1.48-1.25h1.13v-2.43a5.02 5.02 0 0 1-3.15-2.62A4.25 4.25 0 0 1 4 6.5v-1a.75.75 0 0 1 .75-.75h2.5Zm0 2.75H5.5v.25a2.75 2.75 0 0 0 1.75 2.56Zm9.5 0v2.81A2.75 2.75 0 0 0 18.5 6.5v-.25Z" />
  ),
  profile: (
    <path d="M12 3.75a4 4 0 1 1 0 8 4 4 0 0 1 0-8ZM12 13.5c4.28 0 7.75 2.8 7.75 6.25a.75.75 0 0 1-.75.75H5a.75.75 0 0 1-.75-.75c0-3.45 3.47-6.25 7.75-6.25Z" />
  ),
  settings: (
    <path d="M10.6 2.5h2.8a1 1 0 0 1 .98.8l.26 1.3c.42.16.82.37 1.19.62l1.24-.44a1 1 0 0 1 1.2.44l1.4 2.42a1 1 0 0 1-.22 1.25l-1 .86a6.6 6.6 0 0 1 0 1.5l1 .86a1 1 0 0 1 .22 1.25l-1.4 2.42a1 1 0 0 1-1.2.44l-1.24-.44c-.37.25-.77.46-1.19.62l-.26 1.3a1 1 0 0 1-.98.8h-2.8a1 1 0 0 1-.98-.8l-.26-1.3a6.5 6.5 0 0 1-1.19-.62l-1.24.44a1 1 0 0 1-1.2-.44l-1.4-2.42a1 1 0 0 1 .22-1.25l1-.86a6.6 6.6 0 0 1 0-1.5l-1-.86a1 1 0 0 1-.22-1.25l1.4-2.42a1 1 0 0 1 1.2-.44l1.24.44c.37-.25.77-.46 1.19-.62l.26-1.3a1 1 0 0 1 .98-.8ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
  ),
};

export interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  /** Solid variant, used for the active navigation destination. */
  filled?: boolean;
}

export function Icon({ name, size = 20, className, filled = false }: IconProps) {
  const solid = filled ? FILLED_PATHS[name] : undefined;

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={solid ? 'currentColor' : 'none'}
      stroke={solid ? 'none' : 'currentColor'}
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {solid ?? PATHS[name]}
    </svg>
  );
}
