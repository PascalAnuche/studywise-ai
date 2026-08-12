import type { ChartTone } from './index';

/**
 * Flow 4 — Resources, to the approved design.
 *
 * No tables back any of this yet. The shapes are the ones the real queries
 * should return, so swapping the source is a change of import.
 *
 * The counts are stated as the design states them. They are not derived from
 * the arrays below, which hold only the handful of rows the screen shows —
 * deriving "245" from six fixtures would be a lie dressed as arithmetic.
 */

export type ResourceKind = 'pdf' | 'video' | 'link' | 'book' | 'article';

export interface ResourceTypeFilter {
  id: 'all' | ResourceKind;
  label: string;
  count: number;
  icon: 'resources' | 'notes' | 'video' | 'link' | 'book' | 'article';
}

export const MOCK_RESOURCE_TYPES: ResourceTypeFilter[] = [
  { id: 'all', label: 'All Resources', count: 245, icon: 'resources' },
  { id: 'pdf', label: 'Documents', count: 68, icon: 'notes' },
  { id: 'video', label: 'Videos', count: 74, icon: 'video' },
  { id: 'link', label: 'Web Links', count: 45, icon: 'link' },
  { id: 'book', label: 'Books', count: 32, icon: 'book' },
  { id: 'article', label: 'Articles', count: 26, icon: 'article' },
];

export interface FeaturedResource {
  id: string;
  badge: string;
  kind: ResourceKind;
  title: string;
  description: string;
  meta: string;
  tone: ChartTone;
  bookmarked: boolean;
}

export const MOCK_FEATURED_RESOURCES: FeaturedResource[] = [
  {
    id: 'ds-cheat-sheet',
    badge: 'PDF',
    kind: 'pdf',
    title: 'Data Structures Cheat Sheet',
    description: 'Quick reference for common data structures.',
    meta: 'PDF · 1.2 MB',
    tone: 'indigo',
    bookmarked: false,
  },
  {
    id: 'binary-search',
    badge: 'Video',
    kind: 'video',
    title: 'Binary Search Algorithm Explained',
    description: 'Step-by-step explanation with visual examples.',
    meta: 'YouTube · 12:45',
    tone: 'indigo',
    bookmarked: false,
  },
  {
    id: 'tree-notes',
    badge: 'PDF',
    kind: 'pdf',
    title: 'Tree Data Structure Notes',
    description: 'Comprehensive notes with examples and diagrams.',
    meta: 'PDF · 2.4 MB',
    tone: 'teal',
    bookmarked: false,
  },
  {
    id: 'big-o',
    badge: 'Article',
    kind: 'article',
    title: 'Understanding Big-O Notation',
    description: 'A complete guide with practical examples.',
    meta: 'Article · 8 min read',
    tone: 'amber',
    bookmarked: false,
  },
];

export interface SubjectBrowseEntry {
  id: string;
  subject: string;
  count: number;
  icon: 'learn' | 'code' | 'settings' | 'database' | 'globe';
  tone: ChartTone;
}

export const MOCK_SUBJECT_BROWSE: SubjectBrowseEntry[] = [
  { id: 'ds', subject: 'Data Structures', count: 24, icon: 'learn', tone: 'indigo' },
  { id: 'algo', subject: 'Algorithms', count: 28, icon: 'code', tone: 'teal' },
  { id: 'os', subject: 'Operating Systems', count: 21, icon: 'settings', tone: 'amber' },
  { id: 'db', subject: 'Database Systems', count: 18, icon: 'database', tone: 'magenta' },
  { id: 'net', subject: 'Computer Networks', count: 16, icon: 'globe', tone: 'blue' },
];

export interface RecentResource {
  id: string;
  title: string;
  subject: string;
  subjectTone: ChartTone;
  kind: ResourceKind;
  type: string;
  addedOn: string;
}

export const MOCK_RECENT_RESOURCES: RecentResource[] = [
  { id: 'dp-notes', title: 'Dynamic Programming Notes', subject: 'Algorithms', subjectTone: 'teal', kind: 'pdf', type: 'PDF', addedOn: 'May 13, 2024' },
  { id: 'os-intro', title: 'Introduction to OS Concepts', subject: 'Operating Systems', subjectTone: 'amber', kind: 'video', type: 'Video', addedOn: 'May 12, 2024' },
  { id: 'sorting-10', title: 'Top 10 Sorting Algorithms', subject: 'Algorithms', subjectTone: 'teal', kind: 'link', type: 'Web Link', addedOn: 'May 11, 2024' },
  { id: 'normalization', title: 'Normalization in DBMS', subject: 'Database Systems', subjectTone: 'magenta', kind: 'pdf', type: 'PDF', addedOn: 'May 10, 2024' },
];

export interface QuickAccessEntry {
  id: string;
  title: string;
  detail: string;
  icon: 'upload' | 'resources' | 'bookmark' | 'download';
  tone: ChartTone;
  href: string;
}

export const MOCK_QUICK_ACCESS: QuickAccessEntry[] = [
  { id: 'upload', title: 'Upload Material', detail: 'Add your own study materials', icon: 'upload', tone: 'blue', href: '/resources' },
  { id: 'mine', title: 'My Materials', detail: 'View uploaded materials', icon: 'resources', tone: 'indigo', href: '/resources' },
  { id: 'bookmarks', title: 'Bookmarks', detail: 'Saved resources', icon: 'bookmark', tone: 'amber', href: '/resources' },
  { id: 'downloads', title: 'Download History', detail: 'View downloaded resources', icon: 'download', tone: 'teal', href: '/resources' },
];

export interface ResourceListEntry {
  id: string;
  title: string;
  meta: string;
  kind: ResourceKind;
  when: string;
}

export const MOCK_RECENTLY_VIEWED: ResourceListEntry[] = [
  { id: 'binary-trees', title: 'Binary Trees Tutorial', meta: 'Video · 15:20', kind: 'video', when: 'Just now' },
  { id: 'time-complexity', title: 'Time Complexity Guide', meta: 'PDF · 1.8 MB', kind: 'pdf', when: '2 hours ago' },
  { id: 'blooms', title: "Bloom's Taxonomy", meta: 'Web Link', kind: 'link', when: 'Yesterday' },
  { id: 'process-scheduling', title: 'Process Scheduling Notes', meta: 'PDF · 2.1 MB', kind: 'pdf', when: '2 days ago' },
];

export const MOCK_RECOMMENDED_RESOURCES: ResourceListEntry[] = [
  { id: 'recursion', title: 'Recursion Explained', meta: 'Video · 18:30', kind: 'video', when: '' },
  { id: 'sql-basics', title: 'SQL Basics for Beginners', meta: 'PDF · 1.6 MB', kind: 'pdf', when: '' },
  { id: 'graph-ds', title: 'Graph Data Structures', meta: 'Article · 6 min read', kind: 'article', when: '' },
];
