import type { IconName } from './Icon';

/**
 * Destinations, matching the approved Home design's sidebar.
 *
 * Eight primary destinations, then Profile and Settings below a divider. Each
 * maps to one of the eight flows in the flow diagram.
 *
 * Note: the design's sidebar has no Practice entry, though flow 3 (Take an
 * AI-Generated Quiz) needs one. `/practice` is kept as a route and reached from
 * the Home composer's "Generate Quiz" action and from recommendations, so the
 * flow is never a dead end. Tracked as an open question in AGENTS.md.
 */
export interface Destination {
  href: string;
  label: string;
  icon: IconName;
  description: string;
  /** Flow number in the approved flow diagram, for traceability. */
  flow?: number;
  exact?: boolean;
}

export const PRIMARY_DESTINATIONS: Destination[] = [
  { href: '/', label: 'Home', icon: 'home', description: 'Where to start today', exact: true },
  { href: '/assistant', label: 'AI Assistant', icon: 'learn', description: 'Explanations you can check', flow: 1 },
  { href: '/planner', label: 'Study Planner', icon: 'plan', description: 'Build and adjust a study plan', flow: 2 },
  { href: '/progress', label: 'Progress', icon: 'progress', description: 'How the studying is going', flow: 6 },
  { href: '/resources', label: 'Resources', icon: 'resources', description: 'Your uploaded materials', flow: 4 },
  { href: '/flashcards', label: 'Flashcards', icon: 'flashcards', description: 'Review with active recall', flow: 5 },
  { href: '/notes', label: 'Notes', icon: 'notes', description: 'Write and organise notes', flow: 5 },
  { href: '/achievements', label: 'Achievements', icon: 'achievements', description: 'Milestones and streaks', flow: 7 },
];

export const SECONDARY_DESTINATIONS: Destination[] = [
  { href: '/profile', label: 'Profile', icon: 'profile', description: 'Your account', flow: 8 },
  { href: '/settings', label: 'Settings', icon: 'settings', description: 'Preferences and privacy', flow: 8 },
];

/** Not in the sidebar, but a real destination the topbar still labels. */
export const UNLISTED_DESTINATIONS: Destination[] = [
  { href: '/practice', label: 'Practice', icon: 'practice', description: 'Quiz yourself on a topic', flow: 3 },
  { href: '/preview', label: 'Catalogue', icon: 'sparkle', description: 'Component catalogue' },
];

export const DESTINATIONS: Destination[] = [
  ...PRIMARY_DESTINATIONS,
  ...SECONDARY_DESTINATIONS,
  ...UNLISTED_DESTINATIONS,
];

export function isCurrent(destination: Destination, pathname: string): boolean {
  return destination.exact ? pathname === destination.href : pathname.startsWith(destination.href);
}

export function currentDestination(pathname: string): Destination | undefined {
  // Longest match wins, so /planner beats / when both would match.
  return [...DESTINATIONS]
    .sort((a, b) => b.href.length - a.href.length)
    .find((destination) => isCurrent(destination, pathname));
}
