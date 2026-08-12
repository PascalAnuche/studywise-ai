'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import { ActionLink } from '@/components/ActionLink';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { IconTile } from '@/components/IconTile';
import { Select } from '@/components/Select';
import { CHART_TONE_VAR } from '@/lib/tones';
import {
  MOCK_NOTE_ENTRIES,
  MOCK_NOTE_FOLDERS,
  MOCK_NOTE_QUICK_ACTIONS,
  MOCK_NOTE_TOTAL,
} from '@/lib/mock';
import {
  FilterControls,
  FilterRow,
  SearchField,
  TabStrip,
  ViewToggle,
  type TabItem,
} from '../../components/Toolbar';
import { NoteBody } from './NoteBody';
import styles from '../notes.module.css';

const TABS: TabItem[] = [
  { id: 'all', label: 'All Notes', icon: 'notes' },
  { id: 'favourites', label: 'Favorites', icon: 'star' },
  { id: 'shared', label: 'Shared with Me', icon: 'users' },
  { id: 'trash', label: 'Trash', icon: 'trash' },
];

const SUBJECTS = [
  { value: 'all', label: 'All Subjects' },
  { value: 'algo', label: 'Algorithms' },
  { value: 'ds', label: 'Data Structures' },
  { value: 'db', label: 'Database Systems' },
  { value: 'os', label: 'Operating Systems' },
];

const SORTS = [
  { value: 'updated', label: 'Recently Updated' },
  { value: 'created', label: 'Recently Created' },
  { value: 'title', label: 'Title A–Z' },
];

export function NotesBoard() {
  const [tab, setTab] = useState('all');
  const [subject, setSubject] = useState('all');
  const [sort, setSort] = useState('updated');
  const [view, setView] = useState<'grid' | 'list'>('list');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(MOCK_NOTE_ENTRIES[0]!.id);
  // Which pane the phone is showing. Ignored from 64rem up, where both fit.
  const [pane, setPane] = useState<'list' | 'detail'>('list');

  const notes = tab === 'favourites' ? MOCK_NOTE_ENTRIES.filter((n) => n.favourite) : MOCK_NOTE_ENTRIES;
  const selected = MOCK_NOTE_ENTRIES.find((note) => note.id === selectedId) ?? MOCK_NOTE_ENTRIES[0]!;

  return (
    <div className={styles.layout}>
      <main id="main" className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Notes</h1>
            <p className={styles.subtitle}>Organize your notes and keep your ideas in one place.</p>
          </div>
          <div className={styles.headerActions}>
            <Button variant="ghost">
              <Icon name="plus" size={16} />
              New Note
            </Button>
            <Button>
              <Icon name="upload" size={16} />
              Import Notes
            </Button>
          </div>
        </header>

        <TabStrip items={TABS} active={tab} onSelect={setTab} label="Note views" />

        <FilterRow>
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Search notes..."
            label="Search notes"
          />
          <FilterControls>
            <Select
              label="Subject"
              labelHidden
              value={subject}
              onValueChange={setSubject}
              options={SUBJECTS}
            />
            <Select label="Sort by" labelHidden value={sort} onValueChange={setSort} options={SORTS} />
            <ViewToggle view={view} onChange={setView} />
          </FilterControls>
        </FilterRow>

        <div className={styles.workspace}>
          <Card className={pane === 'detail' ? styles.paneHidden : undefined}>
            <div className={styles.listHead}>
              <h2 className={styles.listTitle}>My Notes</h2>
              <span className={styles.listCount}>{MOCK_NOTE_TOTAL} notes</span>
            </div>
            <ul className={styles.noteList}>
              {notes.map((note) => (
                <li key={note.id}>
                  <button
                    type="button"
                    className={`${styles.noteRow} ${
                      note.id === selectedId ? styles.noteRowActive : ''
                    }`.trim()}
                    aria-current={note.id === selectedId ? 'true' : undefined}
                    onClick={() => {
                      setSelectedId(note.id);
                      setPane('detail');
                    }}
                  >
                    <IconTile icon={note.icon} tone={note.tone} size="sm" />
                    <span className={styles.noteRowBody}>
                      <span className={styles.noteRowTitle}>{note.title}</span>
                      <span className={styles.noteRowSubject}>{note.subject}</span>
                    </span>
                    <span className={styles.noteRowMeta}>
                      {note.when}
                      {note.favourite && (
                        <span className={styles.starOn}>
                          <Icon name="star" size={12} filled />
                          <span className="visually-hidden">Favourited</span>
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <div className={styles.listFoot}>
              <ActionLink href="/notes">View All Notes</ActionLink>
            </div>
          </Card>

          <Card className={pane === 'list' ? styles.paneHidden : undefined}>
            {/* Only rendered on narrow screens, where the list is swapped out. */}
            <button type="button" className={styles.backButton} onClick={() => setPane('list')}>
              <Icon name="arrow-left" size={14} />
              All notes
            </button>

            <div className={styles.detailHead}>
              <h2 className={styles.detailTitle}>
                {selected.title}
                {selected.favourite && (
                  <span className={styles.starOn}>
                    <Icon name="star" size={16} filled />
                    <span className="visually-hidden">Favourited</span>
                  </span>
                )}
              </h2>
              <div className={styles.detailTools}>
                <button type="button" className={styles.iconButton} aria-label="Edit note">
                  <Icon name="edit" size={16} />
                </button>
                <button type="button" className={styles.iconButton} aria-label="Share note">
                  <Icon name="share" size={16} />
                </button>
                <button type="button" className={styles.iconButton} aria-label="More actions">
                  <Icon name="more" size={16} />
                </button>
              </div>
            </div>

            <div className={styles.detailMeta}>
              <span
                className={styles.subjectChip}
                style={{ '--tone': CHART_TONE_VAR[selected.subjectTone] } as CSSProperties}
              >
                {selected.subject}
              </span>
              <span>· Created: {selected.created}</span>
              <span>· Updated: {selected.updated}</span>
            </div>

            <NoteBody blocks={selected.body} />

            <div className={styles.tags}>
              Tags:
              {selected.tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  {tag}
                </span>
              ))}
              <button type="button" className={styles.addTag}>
                <Icon name="plus" size={12} />
                Add Tag
              </button>
            </div>
          </Card>
        </div>
      </main>

      <aside className={styles.rail}>
        <Card>
          <div className={styles.railHead}>
            <h2 className={styles.railTitle}>Quick Actions</h2>
          </div>
          <ul className={styles.railList}>
            {MOCK_NOTE_QUICK_ACTIONS.map((action) => (
              <li key={action.id}>
                <button type="button" className={styles.railRow}>
                  <IconTile icon={action.icon} tone={action.tone} size="sm" />
                  <span className={styles.railBody}>
                    <span className={styles.railRowTitle}>{action.title}</span>
                    <span className={styles.railRowDetail}>{action.detail}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className={styles.railHead}>
            <h2 className={styles.railTitle}>Folders</h2>
            <button type="button" className={styles.newFolder}>
              <Icon name="plus" size={14} />
              New Folder
            </button>
          </div>
          <ul className={styles.railList}>
            {MOCK_NOTE_FOLDERS.map((folder) => (
              <li key={folder.id}>
                <button type="button" className={styles.railRow}>
                  <IconTile icon="folder" tone={folder.tone} size="sm" />
                  <span className={styles.railBody}>
                    <span className={styles.railRowTitle}>{folder.name}</span>
                    <span className={styles.railRowDetail}>{folder.count} notes</span>
                  </span>
                  <span className={styles.railWhen} aria-hidden="true">
                    <Icon name="more" size={16} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className={styles.railHead}>
            <h2 className={styles.railTitle}>Recent Notes</h2>
            <ActionLink href="/notes">View All</ActionLink>
          </div>
          <ul className={styles.railList}>
            {MOCK_NOTE_ENTRIES.slice(4, 7).map((note) => (
              <li key={note.id}>
                <button
                  type="button"
                  className={styles.railRow}
                  onClick={() => {
                    setSelectedId(note.id);
                    setPane('detail');
                  }}
                >
                  <IconTile icon={note.icon} tone={note.tone} size="sm" />
                  <span className={styles.railBody}>
                    <span className={styles.railRowTitle}>{note.title}</span>
                    <span className={styles.railRowDetail}>{note.subject}</span>
                  </span>
                  <span className={styles.railWhen}>{note.when}</span>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </aside>
    </div>
  );
}
