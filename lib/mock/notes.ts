import type { ChartTone } from './index';

/**
 * Flow 5 — Notes, to the approved design.
 *
 * The note body is structured data rather than a markdown blob, so the detail
 * pane renders real headings and lists without parsing anything. When notes
 * gain a table this becomes the column shape, not a rewrite of the view.
 */

export type NoteBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'heading'; text: string }
  | { kind: 'ordered'; items: string[] }
  | { kind: 'bullets'; items: string[] }
  | { kind: 'definition'; label: string; items: string[] };

export interface NoteEntry {
  id: string;
  title: string;
  subject: string;
  subjectTone: ChartTone;
  icon: 'notes' | 'clock' | 'database' | 'settings' | 'code' | 'list' | 'chart' | 'article';
  tone: ChartTone;
  when: string;
  favourite: boolean;
  created: string;
  updated: string;
  tags: string[];
  body: NoteBlock[];
}

export const MOCK_NOTE_ENTRIES: NoteEntry[] = [
  {
    id: 'binary-search',
    title: 'Binary Search Algorithm',
    subject: 'Algorithms',
    subjectTone: 'indigo',
    icon: 'notes',
    tone: 'indigo',
    when: 'Just now',
    favourite: true,
    created: 'May 13, 2024',
    updated: 'Just now',
    tags: ['Search', 'Divide and Conquer', 'Important'],
    body: [
      {
        kind: 'paragraph',
        text: 'Binary Search is an efficient algorithm used to find an element in a sorted array by repeatedly dividing the search interval in half.',
      },
      { kind: 'heading', text: 'How it works' },
      {
        kind: 'ordered',
        items: [
          'Compare the middle element with the target value.',
          'If they are equal, return the middle index.',
          'If the target is smaller, search the left half.',
          'If the target is larger, search the right half.',
          'Repeat until the element is found or the interval is empty.',
        ],
      },
      { kind: 'heading', text: 'Time Complexity' },
      {
        kind: 'bullets',
        items: ['Best Case: O(1)', 'Average Case: O(log n)', 'Worst Case: O(log n)'],
      },
      { kind: 'heading', text: 'Example' },
      {
        kind: 'definition',
        label: 'Array: [2, 5, 7, 11, 13, 17, 19, 23, 29]     Target: 17',
        items: [
          'Middle = 13 → 17 is greater → search right half',
          'Middle = 19 → 17 is smaller → search left half',
          'Middle = 17 → found!',
        ],
      },
    ],
  },
  {
    id: 'time-complexity',
    title: 'Time Complexity Summary',
    subject: 'Algorithms',
    subjectTone: 'indigo',
    icon: 'clock',
    tone: 'teal',
    when: '2h ago',
    favourite: false,
    created: 'May 12, 2024',
    updated: '2 hours ago',
    tags: ['Big-O', 'Reference'],
    body: [
      {
        kind: 'paragraph',
        text: 'Growth, not constants. O(n log n) beats O(n²) eventually, and "eventually" is the whole caveat.',
      },
      { kind: 'heading', text: 'Common orders' },
      {
        kind: 'bullets',
        items: ['O(1) — constant', 'O(log n) — halving', 'O(n) — one pass', 'O(n log n) — sorting', 'O(n²) — nested passes'],
      },
    ],
  },
  {
    id: 'normalization',
    title: 'Normalization in DBMS',
    subject: 'Database Systems',
    subjectTone: 'magenta',
    icon: 'database',
    tone: 'amber',
    when: 'Yesterday',
    favourite: false,
    created: 'May 11, 2024',
    updated: 'Yesterday',
    tags: ['Normal Forms'],
    body: [
      {
        kind: 'paragraph',
        text: 'Normalization organises columns and tables so that dependencies are enforced by the schema rather than by convention.',
      },
      { kind: 'heading', text: 'The first three forms' },
      {
        kind: 'ordered',
        items: [
          '1NF — every column holds a single value.',
          '2NF — no partial dependency on part of a composite key.',
          '3NF — no transitive dependency on a non-key column.',
        ],
      },
    ],
  },
  {
    id: 'os-models',
    title: 'Operating System Models',
    subject: 'Operating Systems',
    subjectTone: 'amber',
    icon: 'settings',
    tone: 'blue',
    when: 'Yesterday',
    favourite: true,
    created: 'May 11, 2024',
    updated: 'Yesterday',
    tags: ['Kernel'],
    body: [
      { kind: 'paragraph', text: 'Monolithic, microkernel and hybrid, and what each one moves in or out of kernel space.' },
      { kind: 'heading', text: 'Process states' },
      { kind: 'bullets', items: ['New', 'Ready', 'Running', 'Waiting', 'Terminated'] },
    ],
  },
  {
    id: 'quick-arrays',
    title: 'Quick Notes: Arrays',
    subject: 'Data Structures',
    subjectTone: 'indigo',
    icon: 'code',
    tone: 'magenta',
    when: '2 days ago',
    favourite: false,
    created: 'May 10, 2024',
    updated: '2 days ago',
    tags: ['Arrays'],
    body: [
      {
        kind: 'paragraph',
        text: 'Contiguous memory. Index access is O(1) because the address is arithmetic, not a walk.',
      },
    ],
  },
  {
    id: 'sorting-comparison',
    title: 'Sorting Algorithms Comparison',
    subject: 'Algorithms',
    subjectTone: 'indigo',
    icon: 'list',
    tone: 'amber',
    when: '3 days ago',
    favourite: false,
    created: 'May 9, 2024',
    updated: '3 days ago',
    tags: ['Sorting'],
    body: [
      { kind: 'paragraph', text: 'Which sort to reach for, and the case that makes each one a bad idea.' },
      { kind: 'bullets', items: ['Merge sort — stable, O(n log n), needs extra space', 'Quicksort — in place, O(n²) worst case', 'Insertion sort — fast on nearly sorted input'] },
    ],
  },
  {
    id: 'er-diagram',
    title: 'ER Diagram Basics',
    subject: 'Database Systems',
    subjectTone: 'magenta',
    icon: 'chart',
    tone: 'magenta',
    when: '3 days ago',
    favourite: false,
    created: 'May 9, 2024',
    updated: '3 days ago',
    tags: ['Modelling'],
    body: [{ kind: 'paragraph', text: 'Entities, attributes, relationships, and the cardinality notation.' }],
  },
  {
    id: 'cpu-scheduling',
    title: 'CPU Scheduling Algorithms',
    subject: 'Operating Systems',
    subjectTone: 'amber',
    icon: 'settings',
    tone: 'indigo',
    when: '4 days ago',
    favourite: false,
    created: 'May 8, 2024',
    updated: '4 days ago',
    tags: ['Scheduling'],
    body: [
      { kind: 'paragraph', text: 'First come first served, shortest job first, round robin, and priority.' },
    ],
  },
];

export interface NoteFolder {
  id: string;
  name: string;
  count: number;
  tone: ChartTone;
}

export const MOCK_NOTE_FOLDERS: NoteFolder[] = [
  { id: 'algorithms', name: 'Algorithms', count: 12, tone: 'indigo' },
  { id: 'ds', name: 'Data Structures', count: 8, tone: 'teal' },
  { id: 'db', name: 'Database Systems', count: 7, tone: 'magenta' },
  { id: 'os', name: 'Operating Systems', count: 6, tone: 'amber' },
  { id: 'general', name: 'General', count: 9, tone: 'blue' },
];

export interface NoteQuickAction {
  id: string;
  title: string;
  detail: string;
  icon: 'notes' | 'upload' | 'copy' | 'mic';
  tone: ChartTone;
}

export const MOCK_NOTE_QUICK_ACTIONS: NoteQuickAction[] = [
  { id: 'new', title: 'New Note', detail: 'Create a new note', icon: 'notes', tone: 'indigo' },
  { id: 'upload', title: 'Upload File', detail: 'Import notes from files', icon: 'upload', tone: 'teal' },
  { id: 'template', title: 'Create from Template', detail: 'Use a note template', icon: 'copy', tone: 'amber' },
  { id: 'voice', title: 'Voice to Note', detail: 'Record and transcribe', icon: 'mic', tone: 'blue' },
];

/** As the design states it, not a count of the fixtures above. */
export const MOCK_NOTE_TOTAL = 42;
