import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Enforces prompt section 12 on user-facing copy.
 *
 * Performance data must never be used to say anything about a student's ability
 * or intelligence: describe the work, never the person. That is a product
 * requirement, not a style preference, and the Progress view is where it is
 * easiest to break, so it gets a test rather than a code-review note.
 *
 * This is a coarse net. It catches the obvious phrasings; it cannot catch a
 * subtly judgemental sentence, so the copy review in AGENTS.md still applies.
 */
const ROOTS = ['app', 'components'];

/**
 * Phrases that characterise the student rather than the work.
 *
 * Scoped to what section 12 actually forbids: assumptions about a student's
 * ability or intelligence, and comparison to other students.
 *
 * Encouragement is NOT banned. An earlier version of this list also rejected
 * "great job" and "keep it up", which came from a reconstruction of the prompt
 * rather than the real one. Section 6 asks for a tone that is "warm,
 * encouraging, and direct" and rules out only "excessive enthusiasm or filler",
 * so celebrating progress toward a goal the student set is in scope. What they
 * are like as a learner is not.
 */
const BANNED: { pattern: RegExp; why: string }[] = [
  { pattern: /you(?:'re| are)\s+(?:weak|bad|poor|struggling)/i, why: 'characterises the student' },
  { pattern: /you\s+struggle/i, why: 'characterises the student' },
  { pattern: /your\s+weakness/i, why: 'characterises the student' },
  { pattern: /\bpoor\s+performance\b/i, why: 'judgement rather than evidence' },
  { pattern: /\byou\s+failed\b/i, why: 'judgement rather than evidence' },
  { pattern: /\bnot\s+smart\b|\bnot\s+capable\b|\bbad\s+at\b/i, why: 'ability claim' },
  { pattern: /\byou\s+(?:always|never)\s+\w+/i, why: 'generalises from performance to the person' },
  // Section 12: never surfaced to anyone else, so no ranking against peers.
  { pattern: /\bcompared\s+to\s+other\s+students\b|\btop\s+\d+%\s+of\s+students\b/i, why: 'compares students' },
  { pattern: /\bahead\s+of\s+your\s+(?:class|peers)\b/i, why: 'compares students' },
];

/**
 * Comments are stripped before scanning.
 *
 * The rule governs what a student reads, not what the source says about the
 * rule: several files quote the banned phrasings precisely to explain why they
 * are banned, and flagging those would push the explanations out of the code.
 */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1 ');
}

function sourceFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    return /\.tsx?$/.test(entry.name) && !entry.name.endsWith('.test.ts') ? [full] : [];
  });
}

describe('user-facing copy, prompt section 12', () => {
  const files = ROOTS.flatMap((root) => sourceFiles(path.resolve(process.cwd(), root)));

  it('still detects a violation after comments are stripped', () => {
    // Without this, a bug in stripComments could silently blank the whole file
    // and the suite would pass by finding nothing anywhere.
    const offending = stripComments(`
      // eslint-disable-next-line
      export const bad = <p>You struggle with recursion and you are bad at proofs,
        compared to other students.</p>;
    `);

    const hits = BANNED.filter(({ pattern }) => pattern.test(offending));
    expect(hits.length).toBeGreaterThanOrEqual(3);
  });

  it('allows encouragement, which section 6 asks for', () => {
    // The approved design's own copy. Banning this was the earlier bug.
    const allowed = "Great job! You're 72% toward your weekly goal. Keep up the momentum!";
    expect(BANNED.filter(({ pattern }) => pattern.test(allowed))).toEqual([]);
  });

  it('strips comments rather than the code around them', () => {
    const stripped = stripComments(`const a = 1; // you struggle\nconst b = 2;`);
    expect(stripped).toContain('const a = 1;');
    expect(stripped).toContain('const b = 2;');
    expect(stripped).not.toContain('you struggle');
  });

  it('scans a non-trivial number of files', () => {
    // Guards against the glob silently matching nothing and the suite passing
    // for the wrong reason.
    expect(files.length).toBeGreaterThan(20);
  });

  it('never characterises the student rather than the work', () => {
    const offences: string[] = [];

    for (const file of files) {
      const text = stripComments(fs.readFileSync(file, 'utf8'));
      for (const { pattern, why } of BANNED) {
        const match = pattern.exec(text);
        if (match) {
          offences.push(`${path.relative(process.cwd(), file)}: "${match[0]}" — ${why}`);
        }
      }
    }

    expect(offences).toEqual([]);
  });
});
