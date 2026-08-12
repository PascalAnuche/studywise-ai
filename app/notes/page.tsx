import { NotesBoard } from './components/NotesBoard';

export const metadata = { title: 'Notes — StudyWise AI' };

/**
 * Notes — flow 5, built to the approved design.
 *
 * Everything comes from lib/mock; no table backs notes yet. The note body is
 * structured blocks rather than a markdown string, so the detail pane renders
 * real headings and lists without parsing anything.
 *
 * Below 64rem the list and the detail are one pane at a time, with a back
 * control, because the design's two-column workspace cannot be shrunk onto a
 * phone without making both halves unusable. See AGENTS.md.
 */
export default function NotesPage() {
  return <NotesBoard />;
}
