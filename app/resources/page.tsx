import { ResourcesBoard } from './components/ResourcesBoard';

export const metadata = { title: 'Resources — StudyWise AI' };

/**
 * Resources — flow 4, built to the approved design.
 *
 * Every figure on this screen comes from lib/mock; no table backs Resources
 * yet. The counts on the type filters are the design's own numbers rather than
 * a count of the fixtures, which hold only the rows the screen shows.
 *
 * The board is a client component because the type filter, subject select and
 * search are interactive. They filter nothing yet — there is nothing to filter
 * — but the controls hold their own state so the screen is not a picture of an
 * interface. See AGENTS.md.
 */
export default function ResourcesPage() {
  return <ResourcesBoard />;
}
