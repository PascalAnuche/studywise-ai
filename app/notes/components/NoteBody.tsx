import type { NoteBlock } from '@/lib/mock';
import styles from '../notes.module.css';

/**
 * Renders a note's blocks.
 *
 * The note is structured data, not a markdown string, so nothing here parses
 * anything. That keeps the detail pane free of the one risk a markdown
 * renderer carries: deciding what to do with arbitrary HTML.
 */
export function NoteBody({ blocks }: { blocks: NoteBlock[] }) {
  return (
    <div className={styles.body}>
      {blocks.map((block, index) => {
        switch (block.kind) {
          case 'heading':
            return (
              <h3 key={index} className={styles.heading}>
                {block.text}
              </h3>
            );
          case 'ordered':
            return (
              <ol key={index} className={styles.ordered}>
                {block.items.map((item) => (
                  <li key={item} className={styles.orderedItem}>
                    {item}
                  </li>
                ))}
              </ol>
            );
          case 'bullets':
            return (
              <ul key={index} className={styles.bullets}>
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            );
          case 'definition':
            return (
              <div key={index}>
                <p className={styles.definitionLabel}>{block.label}</p>
                <ul className={styles.bullets}>
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            );
          default:
            return (
              <p key={index} className={styles.paragraph}>
                {block.text}
              </p>
            );
        }
      })}
    </div>
  );
}
