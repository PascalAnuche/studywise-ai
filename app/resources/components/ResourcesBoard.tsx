'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { ActionLink } from '@/components/ActionLink';
import { Card } from '@/components/Card';
import { Icon, type IconName } from '@/components/Icon';
import { IconTile } from '@/components/IconTile';
import { Select } from '@/components/Select';
import { CHART_TONE_VAR } from '@/lib/tones';
import {
  MOCK_FEATURED_RESOURCES,
  MOCK_QUICK_ACCESS,
  MOCK_RECENT_RESOURCES,
  MOCK_RECENTLY_VIEWED,
  MOCK_RECOMMENDED_RESOURCES,
  MOCK_RESOURCE_TYPES,
  MOCK_SUBJECT_BROWSE,
  type ResourceKind,
  type ResourceListEntry,
} from '@/lib/mock';
import {
  FilterButton,
  FilterControls,
  FilterRow,
  SearchField,
} from '../../components/Toolbar';
import styles from '../resources.module.css';

/** One glyph per resource kind, used in the tables and the rail. */
const KIND_ICON: Record<ResourceKind, IconName> = {
  pdf: 'notes',
  video: 'video',
  link: 'link',
  book: 'book',
  article: 'article',
};

const KIND_TONE = {
  pdf: 'red',
  video: 'magenta',
  link: 'teal',
  book: 'amber',
  article: 'blue',
} as const;

const SUBJECTS = [
  { value: 'all', label: 'All Subjects' },
  { value: 'ds', label: 'Data Structures' },
  { value: 'algo', label: 'Algorithms' },
  { value: 'os', label: 'Operating Systems' },
  { value: 'db', label: 'Database Systems' },
  { value: 'net', label: 'Computer Networks' },
];

function RailList({ entries, showWhen }: { entries: ResourceListEntry[]; showWhen: boolean }) {
  return (
    <ul className={styles.railList}>
      {entries.map((entry) => (
        <li key={entry.id}>
          <Link href="/resources" className={styles.railRow}>
            <IconTile icon={KIND_ICON[entry.kind]} tone={KIND_TONE[entry.kind]} size="sm" />
            <span className={styles.railBody}>
              <span className={styles.railRowTitle}>{entry.title}</span>
              <span className={styles.railRowDetail}>{entry.meta}</span>
            </span>
            {showWhen && entry.when && <span className={styles.railWhen}>{entry.when}</span>}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function ResourcesBoard() {
  const [type, setType] = useState('all');
  const [subject, setSubject] = useState('all');
  const [query, setQuery] = useState('');

  return (
    <div className={styles.layout}>
      <main id="main" className={styles.main}>
        <header>
          <h1 className={styles.title}>Resources</h1>
          <p className={styles.subtitle}>
            Access quality learning materials to enhance your understanding.
          </p>
        </header>

        <FilterRow>
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Search resources..."
            label="Search resources"
          />
          <FilterControls>
            <Select
              label="Subject"
              labelHidden
              value={subject}
              onValueChange={setSubject}
              options={SUBJECTS}
            />
            <FilterButton>Filters</FilterButton>
          </FilterControls>
        </FilterRow>

        <div className={styles.types} role="group" aria-label="Resource type">
          {MOCK_RESOURCE_TYPES.map((entry) => (
            <button
              key={entry.id}
              type="button"
              aria-pressed={entry.id === type}
              className={`${styles.type} ${entry.id === type ? styles.typeActive : ''}`.trim()}
              onClick={() => setType(entry.id)}
            >
              <IconTile icon={entry.icon} tone="indigo" size="sm" />
              <span className={styles.typeBody}>
                <span className={styles.typeLabel}>{entry.label}</span>
                <span className={styles.typeCount}>{entry.count}</span>
              </span>
            </button>
          ))}
        </div>

        <section>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Featured Resources</h2>
            <ActionLink href="/resources">View all</ActionLink>
          </div>
          {/* Scroll-snapping row: the design's carousel, without a control
            * that would do nothing on a touch screen. */}
          <div className={styles.featured}>
            {MOCK_FEATURED_RESOURCES.map((item) => (
              <article
                key={item.id}
                className={styles.featuredCard}
                style={{ '--tone': CHART_TONE_VAR[item.tone] } as CSSProperties}
              >
                <div className={styles.thumb}>
                  <span className={styles.thumbBadge}>{item.badge}</span>
                  <Icon name={KIND_ICON[item.kind]} size={32} />
                </div>
                <div className={styles.featuredBody}>
                  <h3 className={styles.featuredTitle}>{item.title}</h3>
                  <p className={styles.featuredText}>{item.description}</p>
                  <div className={styles.featuredFoot}>
                    {item.meta}
                    <button
                      type="button"
                      className={styles.bookmark}
                      aria-label={`Bookmark ${item.title}`}
                      aria-pressed={item.bookmarked}
                    >
                      <Icon name="bookmark" size={16} filled={item.bookmarked} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Browse by Subject</h2>
            <ActionLink href="/resources">View all subjects</ActionLink>
          </div>
          <div className={styles.subjects}>
            {MOCK_SUBJECT_BROWSE.map((entry) => (
              <Link key={entry.id} href="/resources" className={styles.subject}>
                <IconTile icon={entry.icon} tone={entry.tone} size="sm" />
                <span className={styles.typeBody}>
                  <span className={styles.subjectName}>{entry.subject}</span>
                  <span className={styles.subjectCount}>{entry.count} resources</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <Card>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Recent Resources</h2>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Resource</th>
                  <th scope="col">Subject</th>
                  <th scope="col">Type</th>
                  <th scope="col">Added On</th>
                  <th scope="col">
                    <span className="visually-hidden">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {MOCK_RECENT_RESOURCES.map((row) => (
                  <tr key={row.id}>
                    <th scope="row">
                      <span className={styles.resourceCell}>
                        <IconTile
                          icon={KIND_ICON[row.kind]}
                          tone={KIND_TONE[row.kind]}
                          size="sm"
                        />
                        {row.title}
                      </span>
                    </th>
                    <td>
                      <span className={styles.subjectCell}>
                        <span
                          className={styles.dot}
                          style={{ background: CHART_TONE_VAR[row.subjectTone] }}
                          aria-hidden="true"
                        />
                        {row.subject}
                      </span>
                    </td>
                    <td>{row.type}</td>
                    <td>{row.addedOn}</td>
                    <td>
                      <button
                        type="button"
                        className={styles.rowMore}
                        aria-label={`More actions for ${row.title}`}
                      >
                        <Icon name="more" size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <button type="button" className={styles.viewMore}>
          View More
          <Icon name="chevron-down" size={16} />
        </button>
      </main>

      <aside className={styles.rail}>
        <Card>
          <div className={styles.railHead}>
            <h2 className={styles.railTitle}>Quick Access</h2>
          </div>
          <ul className={styles.railList}>
            {MOCK_QUICK_ACCESS.map((entry) => (
              <li key={entry.id}>
                <Link href={entry.href} className={styles.railRow}>
                  <IconTile icon={entry.icon} tone={entry.tone} size="sm" />
                  <span className={styles.railBody}>
                    <span className={styles.railRowTitle}>{entry.title}</span>
                    <span className={styles.railRowDetail}>{entry.detail}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className={styles.railHead}>
            <h2 className={styles.railTitle}>Recently Viewed</h2>
            <ActionLink href="/resources">View all</ActionLink>
          </div>
          <RailList entries={MOCK_RECENTLY_VIEWED} showWhen />
        </Card>

        <Card>
          <div className={styles.railHead}>
            <h2 className={styles.railTitle}>Recommended for You</h2>
            <ActionLink href="/resources">View all</ActionLink>
          </div>
          <RailList entries={MOCK_RECOMMENDED_RESOURCES} showWhen={false} />
        </Card>
      </aside>
    </div>
  );
}
