'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import { ActionLink } from '@/components/ActionLink';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { IconTile } from '@/components/IconTile';
import { CHART_TONE_VAR } from '@/lib/tones';
import {
  MOCK_ACHIEVEMENT_STATS,
  MOCK_BADGES,
  MOCK_BADGE_COUNTS,
  MOCK_MILESTONES,
  MOCK_STREAK_DAYS,
  MOCK_TOP_SKILLS,
  type BadgeCategory,
} from '@/lib/mock';
import { TabStrip, type TabItem } from '../../components/Toolbar';
import styles from '../achievements.module.css';

const TABS: TabItem[] = [
  { id: 'badges', label: 'Badges', icon: 'achievements' },
  { id: 'milestones', label: 'Milestones', icon: 'target' },
  { id: 'streaks', label: 'Streaks', icon: 'flame' },
  { id: 'leaderboard', label: 'Leaderboard', icon: 'users' },
];

const CATEGORIES: { id: 'all' | BadgeCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'learning', label: 'Learning' },
  { id: 'consistency', label: 'Consistency' },
  { id: 'exploration', label: 'Exploration' },
];

export function AchievementsBoard({ streak }: { streak: number }) {
  const [tab, setTab] = useState('badges');
  const [category, setCategory] = useState<'all' | BadgeCategory>('all');

  // The stated totals, not a count of the eight on show. See lib/mock.
  const count = (id: 'all' | BadgeCategory) => MOCK_BADGE_COUNTS[id];

  const badges =
    category === 'all' ? MOCK_BADGES : MOCK_BADGES.filter((b) => b.category === category);

  return (
    <div className={styles.layout}>
      <main id="main" className={styles.main}>
        <header>
          <h1 className={styles.title}>Achievements</h1>
          <p className={styles.subtitle}>
            Celebrate your progress and stay motivated on your learning journey.
          </p>
        </header>

        <section className={styles.stats}>
          {MOCK_ACHIEVEMENT_STATS.map((stat) => (
            <article key={stat.id} className={styles.stat}>
              <div className={styles.statHead}>
                <IconTile icon={stat.icon} tone={stat.tone} size="sm" />
                <span className={styles.statValue}>{stat.value}</span>
              </div>
              <span className={styles.statLabel}>{stat.label}</span>
              <span className={styles.statDelta}>{stat.delta}</span>
            </article>
          ))}
        </section>

        <TabStrip items={TABS} active={tab} onSelect={setTab} label="Achievement views" />

        {tab === 'badges' && (
          <section>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>Badges</h2>
              <ActionLink href="/achievements">View All Badges</ActionLink>
            </div>

            <div className={styles.chips} role="group" aria-label="Badge category">
              {CATEGORIES.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  aria-pressed={entry.id === category}
                  className={`${styles.chip} ${entry.id === category ? styles.chipActive : ''}`.trim()}
                  onClick={() => setCategory(entry.id)}
                >
                  {entry.label} ({count(entry.id)})
                </button>
              ))}
            </div>

            <div className={styles.badges}>
              {badges.map((badge) => (
                <article
                  key={badge.id}
                  className={styles.badge}
                  style={{ '--tone': CHART_TONE_VAR[badge.tone] } as CSSProperties}
                >
                  <span
                    className={`${styles.medal} ${badge.earnedOn ? '' : styles.medalLocked}`.trim()}
                    aria-hidden="true"
                  >
                    <Icon name={badge.icon} size={26} />
                  </span>
                  <h3 className={styles.badgeTitle}>{badge.title}</h3>
                  <p className={styles.badgeRequirement}>{badge.requirement}</p>

                  <div className={styles.badgeFoot}>
                    {badge.earnedOn ? (
                      <>
                        <span className={styles.earned}>
                          <Icon name="check-circle" size={14} />
                          Earned
                        </span>
                        <span>{badge.earnedOn}</span>
                      </>
                    ) : (
                      badge.progress && (
                        <span className={styles.badgeProgress}>
                          <span className={styles.track}>
                            <span
                              className={styles.bar}
                              style={{
                                width: `${Math.round((badge.progress.current / badge.progress.target) * 100)}%`,
                              }}
                            />
                          </span>
                          {/* Locked state says how far along, never "not yet good enough". */}
                          <span>
                            {badge.progress.current.toLocaleString()}/
                            {badge.progress.target.toLocaleString()} {badge.progress.unit}
                          </span>
                        </span>
                      )
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {tab === 'milestones' && (
          <Card>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>Milestones</h2>
            </div>
            <ul className={styles.railList}>
              {MOCK_MILESTONES.map((milestone) => (
                <li key={milestone.id} className={styles.railRow}>
                  <IconTile icon={milestone.icon} tone={milestone.tone} size="sm" />
                  <span className={styles.railRowBody}>
                    <span className={styles.railRowTitle}>{milestone.title}</span>
                    <span className={styles.railRowDate}>{milestone.date}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {tab === 'streaks' && (
          <Card>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>This week</h2>
            </div>
            <ul className={styles.week}>
              {MOCK_STREAK_DAYS.map((entry, index) => (
                <li key={index} className={styles.weekDay}>
                  <span className={`${styles.weekMark} ${entry.done ? styles.weekDone : ''}`.trim()}>
                    {entry.done && <Icon name="check" size={12} />}
                    <span className="visually-hidden">
                      {entry.done ? 'Studied' : 'Not studied'}
                    </span>
                  </span>
                  {entry.day}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {tab === 'leaderboard' && (
          <Card>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>Leaderboard</h2>
            </div>
            {/*
              The design puts a ranking of students here. Prompt section 12
              rules out comparing one student to another, so the tab keeps its
              place and says what is shown instead. Flagged in AGENTS.md.
            */}
            <p className={styles.panelNote}>
              StudyWise doesn&rsquo;t rank you against other students. Your badges, milestones and
              streak above are your own record, and they&rsquo;re the only measure here.
            </p>
          </Card>
        )}

        <button type="button" className={styles.viewMore}>
          View More Badges
          <Icon name="chevron-down" size={16} />
        </button>
      </main>

      <aside className={styles.rail}>
        <Card>
          <div className={styles.railHead}>
            <h2 className={styles.railTitle}>Current Streak</h2>
            <ActionLink href="/planner">View Calendar</ActionLink>
          </div>
          <div className={styles.streak}>
            <span className={styles.streakRing} aria-hidden="true">
              🔥
            </span>
            <span className={styles.streakBody}>
              <span className={styles.streakValue}>
                <span className={styles.streakNumber}>{streak}</span>
                <span>{streak === 1 ? 'day in a row!' : 'days in a row!'}</span>
              </span>
              <span className={styles.streakNote}>You&rsquo;re building a great habit!</span>
            </span>
          </div>
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
            <h2 className={styles.railTitle}>Recent Milestones</h2>
            <ActionLink href="/achievements">View All</ActionLink>
          </div>
          <ul className={styles.railList}>
            {MOCK_MILESTONES.map((milestone) => (
              <li key={milestone.id} className={styles.railRow}>
                <IconTile icon={milestone.icon} tone={milestone.tone} size="sm" />
                <span className={styles.railRowBody}>
                  <span className={styles.railRowTitle}>{milestone.title}</span>
                  <span className={styles.railRowDate}>{milestone.date}</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className={styles.railHead}>
            <h2 className={styles.railTitle}>Top Skills</h2>
            <ActionLink href="/progress">View All</ActionLink>
          </div>
          <ul className={styles.skills}>
            {MOCK_TOP_SKILLS.map((skill) => (
              <li key={skill.subject} className={styles.skillRow}>
                <span className={styles.skillName}>{skill.subject}</span>
                <span className={styles.track}>
                  <span
                    className={styles.bar}
                    style={{
                      width: `${skill.percent}%`,
                      background: CHART_TONE_VAR[skill.tone],
                    }}
                  />
                </span>
                <span className={styles.skillPercent}>{skill.percent}%</span>
              </li>
            ))}
          </ul>
        </Card>
      </aside>
    </div>
  );
}
