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
  MOCK_FLASHCARD_ACTIVITY,
  MOCK_FLASHCARD_CARDS,
  MOCK_FLASHCARD_TODAY,
  MOCK_SPACED_REPETITION,
  MOCK_STREAK_DAYS,
} from '@/lib/mock';
import {
  FilterControls,
  FilterRow,
  SearchField,
  TabStrip,
  ViewToggle,
  type TabItem,
} from '../../components/Toolbar';
import { ScheduleChart } from './ScheduleChart';
import styles from '../flashcards.module.css';

const TABS: TabItem[] = [
  { id: 'sets', label: 'My Flashcard Sets', icon: 'flashcards' },
  { id: 'study', label: 'Study', icon: 'play' },
  { id: 'favourites', label: 'Favorites', icon: 'star' },
  { id: 'archived', label: 'Archived', icon: 'folder' },
];

const SUBJECTS = [
  { value: 'all', label: 'All Subjects' },
  { value: 'ds', label: 'Data Structures' },
  { value: 'algo', label: 'Algorithms' },
  { value: 'os', label: 'Operating Systems' },
  { value: 'db', label: 'Database Systems' },
];

const SORTS = [
  { value: 'updated', label: 'Recently Updated' },
  { value: 'created', label: 'Recently Created' },
  { value: 'title', label: 'Title A–Z' },
  { value: 'cards', label: 'Most Cards' },
];

export function FlashcardsBoard() {
  const [tab, setTab] = useState('sets');
  const [subject, setSubject] = useState('all');
  const [sort, setSort] = useState('updated');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [query, setQuery] = useState('');

  // Favourites is the one tab with a real filter behind it, because the
  // fixtures carry the flag. The rest show every set until there is a backend.
  const sets =
    tab === 'favourites' ? MOCK_FLASHCARD_CARDS.filter((set) => set.favourite) : MOCK_FLASHCARD_CARDS;

  return (
    <div className={styles.layout}>
      <main id="main" className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Flashcards</h1>
            <p className={styles.subtitle}>
              Learn faster with smart flashcards and spaced repetition.
            </p>
          </div>
          <div className={styles.headerActions}>
            <Button variant="ghost">
              <Icon name="plus" size={16} />
              Create Flashcard Set
            </Button>
            <Button>
              <Icon name="play" size={16} filled />
              Study Now
            </Button>
          </div>
        </header>

        <TabStrip items={TABS} active={tab} onSelect={setTab} label="Flashcard views" />

        <FilterRow>
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Search flashcard sets..."
            label="Search flashcard sets"
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

        <div className={`${styles.sets} ${view === 'list' ? styles.setsList : ''}`.trim()}>
          {sets.map((set) => (
            <article
              key={set.id}
              className={styles.set}
              style={{ '--tone': CHART_TONE_VAR[set.tone] } as CSSProperties}
            >
              <div className={styles.setTop}>
                <IconTile icon={set.icon} tone={set.tone} />
                <div className={styles.setControls}>
                  <button
                    type="button"
                    className={`${styles.iconButton} ${set.favourite ? styles.starOn : ''}`.trim()}
                    aria-label={
                      set.favourite ? `Remove ${set.title} from favourites` : `Add ${set.title} to favourites`
                    }
                    aria-pressed={set.favourite}
                  >
                    <Icon name="star" size={16} filled={set.favourite} />
                  </button>
                  <button
                    type="button"
                    className={styles.iconButton}
                    aria-label={`More actions for ${set.title}`}
                  >
                    <Icon name="more" size={16} />
                  </button>
                </div>
              </div>

              <div>
                <h2 className={styles.setTitle}>{set.title}</h2>
                <p className={styles.setSubject}>{set.subject}</p>
              </div>

              <div className={styles.setFoot}>
                {set.cardCount} cards
                <span className={styles.track}>
                  <span className={styles.bar} style={{ width: `${set.masteredPercent}%` }} />
                </span>
                {set.masteredPercent}%
              </div>
            </article>
          ))}
        </div>

        <button type="button" className={styles.viewMore}>
          View More Sets
          <Icon name="chevron-down" size={16} />
        </button>

        <Card>
          <div className={styles.spaced}>
            <div>
              <div className={styles.spacedHead}>
                <h2 className={styles.spacedTitle}>Spaced Repetition Overview</h2>
                <p className={styles.spacedText}>
                  Your flashcards are scheduled for optimal learning.
                </p>
              </div>
              <div className={styles.spacedStats}>
                <div className={styles.spacedStat}>
                  <span className={styles.spacedValue}>{MOCK_SPACED_REPETITION.dueToday}</span>
                  <span className={styles.spacedLabel}>Due Today</span>
                </div>
                <div className={styles.spacedStat}>
                  <span className={styles.spacedValue}>{MOCK_SPACED_REPETITION.dueTomorrow}</span>
                  <span className={styles.spacedLabel}>Due Tomorrow</span>
                </div>
                <div className={styles.spacedStat}>
                  <span className={styles.spacedValue}>{MOCK_SPACED_REPETITION.dueThisWeek}</span>
                  <span className={styles.spacedLabel}>Due This Week</span>
                </div>
                <div className={styles.spacedStat}>
                  <span className={styles.spacedValue}>{MOCK_SPACED_REPETITION.totalCards}</span>
                  <span className={styles.spacedLabel}>Total Cards</span>
                </div>
              </div>
            </div>
            <ScheduleChart data={MOCK_SPACED_REPETITION.schedule} />
          </div>
        </Card>
      </main>

      <aside className={styles.rail}>
        <Card>
          <div className={styles.railHead}>
            <h2 className={styles.railTitle}>Today&rsquo;s Progress</h2>
            <ActionLink href="/progress">View Statistics</ActionLink>
          </div>
          <div className={styles.todayGrid}>
            {MOCK_FLASHCARD_TODAY.map((stat) => (
              <div key={stat.id} className={styles.todayStat}>
                <IconTile icon={stat.icon} tone={stat.tone} size="sm" />
                <span className={styles.todayBody}>
                  <span className={styles.todayValue}>{stat.value}</span>
                  <span className={styles.todayLabel}>{stat.label}</span>
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className={styles.railHead}>
            <h2 className={styles.railTitle}>Study Streak 🔥</h2>
            <ActionLink href="/planner">View Calendar</ActionLink>
          </div>
          <span className={styles.streakValue}>
            <span className={styles.streakNumber}>12</span>
            <span>days in a row! 🔥</span>
          </span>
          <span className={styles.streakNote}>Keep it going! You&rsquo;re doing great.</span>
          {/* The tick is a shape, not a colour, so the studied days are
            * distinguishable without relying on the green. */}
          <ul className={styles.week}>
            {MOCK_STREAK_DAYS.map((entry, index) => (
              <li key={index} className={styles.weekDay}>
                <span className={`${styles.weekMark} ${entry.done ? styles.weekDone : ''}`.trim()}>
                  {entry.done && <Icon name="check" size={12} />}
                  <span className="visually-hidden">{entry.done ? 'Studied' : 'Not studied'}</span>
                </span>
                {entry.day}
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className={styles.railHead}>
            <h2 className={styles.railTitle}>Recent Activity</h2>
            <ActionLink href="/flashcards">View All</ActionLink>
          </div>
          <ul className={styles.activity}>
            {MOCK_FLASHCARD_ACTIVITY.map((entry) => (
              <li key={entry.id} className={styles.activityRow}>
                <IconTile icon={entry.icon} tone={entry.tone} size="sm" />
                <span className={styles.activityText}>{entry.text}</span>
                <span className={styles.activityWhen}>{entry.when}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className={styles.tip}>
          <span className={styles.tipTitle}>
            <span className={styles.tipIcon} aria-hidden="true">
              <Icon name="lightbulb" size={16} />
            </span>
            Study Tip
          </span>
          <p className={styles.tipText}>
            Review a little each day. Consistency beats cramming!
          </p>
        </Card>
      </aside>
    </div>
  );
}
