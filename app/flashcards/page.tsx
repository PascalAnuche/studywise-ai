import { FlashcardsBoard } from './components/FlashcardsBoard';

export const metadata = { title: 'Flashcards — StudyWise AI' };

/**
 * Flashcards — flow 5, built to the approved design.
 *
 * Everything on this screen comes from lib/mock; no table backs flashcards
 * yet. The per-set percentage describes cards answered correctly on the last
 * pass — a fact about the deck, not a claim about the student (prompt section
 * 12).
 *
 * The board is a client component because the tabs, filters and layout toggle
 * are interactive. Only the Favorites tab actually filters, since that is the
 * one flag the fixtures carry. See AGENTS.md.
 */
export default function FlashcardsPage() {
  return <FlashcardsBoard />;
}
