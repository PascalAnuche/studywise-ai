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
  | 'chevron-left'
  | 'chevron-right'
  | 'send'
  | 'bookmark'
  | 'thumb-up'
  | 'thumb-down'
  | 'history'
  | 'expand'
  | 'lightbulb'
  | 'wand'
  | 'upload'
  | 'copy'
  | 'speaker'
  | 'mic'
  | 'attach'
  | 'plus'
  | 'more'
  | 'edit'
  | 'trend-up'
  | 'clock'
  | 'check-circle'
  | 'code'
  | 'scales'
  | 'shield'
  | 'chart'
  | 'video'
  | 'link'
  | 'book'
  | 'article'
  | 'database'
  | 'globe'
  | 'download'
  | 'star'
  | 'grid'
  | 'list'
  | 'folder'
  | 'share'
  | 'trash'
  | 'users'
  | 'filter'
  | 'play';

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
  'chevron-left': (
    <>
      <path d="M14.5 6.5 9 12l5.5 5.5" />
    </>
  ),
  'chevron-right': (
    <>
      <path d="M9.5 6.5 15 12l-5.5 5.5" />
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
  copy: (
    <>
      <rect x="8.5" y="8.5" width="11" height="11" rx="2" />
      <path d="M15.5 8.5v-2a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2" />
    </>
  ),
  speaker: (
    <>
      <path d="M11 5 6.5 8.5H4a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h2.5L11 19Z" />
      <path d="M15.5 9.5a3.5 3.5 0 0 1 0 5M18 7a7 7 0 0 1 0 10" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" />
    </>
  ),
  attach: (
    <>
      <path d="M20 11.5 12.4 19a4.5 4.5 0 0 1-6.4-6.4l7.6-7.6a3 3 0 0 1 4.3 4.3l-7.6 7.6a1.5 1.5 0 0 1-2.1-2.1l7-7" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5.5v13M5.5 12h13" />
    </>
  ),
  more: (
    <>
      <circle cx="6" cy="12" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="18" cy="12" r="1.25" fill="currentColor" stroke="none" />
    </>
  ),
  edit: (
    <>
      <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
      <path d="M14.5 6.5l3 3" />
    </>
  ),
  'trend-up': (
    <>
      <path d="M4 16.5 9.5 11l3.5 3.5L20 7.5" />
      <path d="M15 7.5h5v5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" />
    </>
  ),
  'check-circle': (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </>
  ),
  code: (
    <>
      <path d="m9 8.5-4 3.5 4 3.5M15 8.5l4 3.5-4 3.5" />
    </>
  ),
  scales: (
    <>
      <path d="M12 4v16M7 20h10" />
      <path d="M5 8h14M5 8l-2.5 5.5h5ZM19 8l2.5 5.5h-5Z" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.5 19 6v5.5c0 4-3 7.4-7 9-4-1.6-7-5-7-9V6Z" />
      <path d="m9 12 2 2 4-4.5" />
    </>
  ),
  chart: (
    <>
      <path d="M4 19.5h16" />
      <rect x="5.5" y="11" width="3.5" height="6" rx="1" />
      <rect x="11" y="7" width="3.5" height="10" rx="1" />
      <rect x="16.5" y="13" width="3.5" height="4" rx="1" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 3.5 13.7 9l5.5 1.7-5.5 1.7L12 18l-1.7-5.6L4.8 10.7 10.3 9Z" />
      <path d="M18.5 15.5 19.2 18l2.3.8-2.3.8-.7 2.4-.7-2.4-2.3-.8 2.3-.8Z" />
    </>
  ),
  video: (
    <>
      <rect x="3" y="5.5" width="13" height="13" rx="2.5" />
      <path d="M16 10.5 21 8v8l-5-2.5Z" />
    </>
  ),
  link: (
    <>
      <path d="M10 13.5a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1.5 1.5" />
      <path d="M14 10.5a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5L12.5 17" />
    </>
  ),
  book: (
    <>
      <path d="M5 4.5h9a3 3 0 0 1 3 3v12a2.5 2.5 0 0 0-2.5-2.5H5Z" />
      <path d="M19 6.5v13" />
    </>
  ),
  article: (
    <>
      <rect x="5" y="3.5" width="14" height="17" rx="2.5" />
      <path d="M8.5 8.5h7M8.5 12h7M8.5 15.5h4" />
    </>
  ),
  database: (
    <>
      <ellipse cx="12" cy="6.5" rx="7" ry="3" />
      <path d="M5 6.5v11c0 1.7 3.1 3 7 3s7-1.3 7-3v-11" />
      <path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17" />
      <path d="M12 3.5c2.2 2.4 3.3 5.3 3.3 8.5s-1.1 6.1-3.3 8.5c-2.2-2.4-3.3-5.3-3.3-8.5S9.8 5.9 12 3.5Z" />
    </>
  ),
  download: (
    <>
      <path d="M12 3.5v11" />
      <path d="m7.5 10.5 4.5 4.5 4.5-4.5" />
      <path d="M4.5 19.5h15" />
    </>
  ),
  star: (
    <>
      <path d="m12 3.8 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 10l5.9-.9Z" />
    </>
  ),
  grid: (
    <>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
    </>
  ),
  list: (
    <>
      <path d="M9 6.5h11M9 12h11M9 17.5h11" />
      <path d="M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01" />
    </>
  ),
  folder: (
    <>
      <path d="M3.5 7a2 2 0 0 1 2-2h3.4l2 2.5h7.6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2Z" />
    </>
  ),
  share: (
    <>
      <circle cx="17.5" cy="6" r="2.5" />
      <circle cx="6.5" cy="12" r="2.5" />
      <circle cx="17.5" cy="18" r="2.5" />
      <path d="m8.8 10.8 6.4-3.5M8.8 13.2l6.4 3.5" />
    </>
  ),
  trash: (
    <>
      <path d="M4.5 6.5h15" />
      <path d="M9.5 6.5V4.8a1.3 1.3 0 0 1 1.3-1.3h2.4a1.3 1.3 0 0 1 1.3 1.3v1.7" />
      <path d="M6.5 6.5 7.4 19a1.5 1.5 0 0 0 1.5 1.4h6.2a1.5 1.5 0 0 0 1.5-1.4l.9-12.5" />
    </>
  ),
  users: (
    <>
      <circle cx="9.5" cy="8.5" r="3.2" />
      <path d="M3.5 19.5c0-3.1 2.7-5.2 6-5.2s6 2.1 6 5.2" />
      <path d="M16 5.8a3.2 3.2 0 0 1 0 6.2M17.5 14.8c1.9.7 3 2.4 3 4.7" />
    </>
  ),
  filter: (
    <>
      <path d="M4 6h16l-6.2 7.3v5.2l-3.6 1.8v-7Z" />
    </>
  ),
  play: (
    <>
      <path d="M8.5 5.5 18 12l-9.5 6.5Z" />
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
  /* Favourited items and the play affordance read as solid, not outlined. */
  star: <path d="m12 3.8 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 10l5.9-.9Z" />,
  play: <path d="M8.5 5.5 18 12l-9.5 6.5Z" />,
  bookmark: <path d="M6.5 3.5h11a1 1 0 0 1 1 1v16l-6.5-4-6.5 4v-16a1 1 0 0 1 1-1Z" />,
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
