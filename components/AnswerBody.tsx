import styles from './AnswerBody.module.css';

/**
 * Renders an answer, including markdown tables.
 *
 * Comparisons are one of the most common shapes an explanation takes ("what is
 * the difference between X and Y"), and the approved Assistant design shows one
 * as a real table. Answers are stored as text, so the table has to survive the
 * round trip as markdown and be rendered here.
 *
 * Deliberately a small parser rather than a markdown library: it handles pipe
 * tables, `##` headings and paragraphs, and anything it does not recognise
 * falls through as a paragraph. A full markdown renderer would also bring
 * arbitrary HTML, which is not something to accept from a model's output
 * without a much longer conversation about sanitising it.
 */
interface TableBlock {
  kind: 'table';
  headers: string[];
  rows: string[][];
}

interface TextBlock {
  kind: 'paragraph' | 'heading';
  text: string;
}

type Block = TableBlock | TextBlock;

const isTableRow = (line: string) => line.trim().startsWith('|') && line.trim().endsWith('|');
const isDivider = (line: string) => /^\s*\|[\s:|-]+\|\s*$/.test(line);

const cells = (line: string) =>
  line
    .trim()
    .slice(1, -1)
    .split('|')
    .map((cell) => cell.trim());

export function parseAnswer(text: string): Block[] {
  const lines = text.split('\n');
  const blocks: Block[] = [];
  let paragraph: string[] = [];

  const flush = () => {
    const joined = paragraph.join('\n').trim();
    if (joined) blocks.push({ kind: 'paragraph', text: joined });
    paragraph = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // A table needs a header row and a divider directly beneath it.
    if (isTableRow(line) && i + 1 < lines.length && isDivider(lines[i + 1])) {
      flush();
      const headers = cells(line);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && isTableRow(lines[i])) {
        rows.push(cells(lines[i]));
        i++;
      }
      i--;
      blocks.push({ kind: 'table', headers, rows });
      continue;
    }

    if (/^##\s+/.test(line)) {
      flush();
      blocks.push({ kind: 'heading', text: line.replace(/^##\s+/, '').trim() });
      continue;
    }

    if (line.trim() === '') {
      flush();
      continue;
    }

    paragraph.push(line);
  }

  flush();
  return blocks;
}

export function AnswerBody({ text }: { text: string }) {
  const blocks = parseAnswer(text);

  return (
    <div className={styles.body}>
      {blocks.map((block, index) => {
        if (block.kind === 'heading') {
          return (
            <h4 key={index} className={styles.heading}>
              {block.text}
            </h4>
          );
        }

        if (block.kind === 'paragraph') {
          return (
            <p key={index} className={styles.paragraph}>
              {block.text}
            </p>
          );
        }

        // Explicit rather than relying on narrowing by elimination, which does
        // not survive the two returns above inside a callback.
        if (block.kind !== 'table') return null;

        return (
          <div key={index} className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {block.headers.map((header) => (
                    <th key={header} scope="col">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) =>
                      cellIndex === 0 ? (
                        <th key={cellIndex} scope="row">
                          {cell}
                        </th>
                      ) : (
                        <td key={cellIndex}>{cell}</td>
                      )
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
