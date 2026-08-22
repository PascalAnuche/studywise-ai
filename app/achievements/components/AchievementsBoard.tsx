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
  MOCK_TOP_SKILLS,
  type BadgeCategory,
} from '@/lib/mock';
import type {
  ActivityStats,
  DerivedMilestone,
  StudyDay,
  WeeklyTotals,
} from '@/lib/db/activity';
import { TabStrip, type TabItem } from '../../components/Toolbar';
import { StudyHeatmap } from './StudyHeatmap';
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

export interface AchievementsBoardProps {
  stats: ActivityStats;
  milestones: DerivedMilestone[];
  studyDays: StudyDay[];
  weekly: WeeklyTotals;
}

/** Minutes as "6h 10m", or "—" when there is nothing to report. */
function hours(minutes: number): string {
  if (minutes <= 0) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h === 0 ? `${m}m` : m === 0 ? `${h}h` : `${h}h ${m}m`;
}

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/**
 * This week from the day series, Monday first.
 *
 * `getStudyDays` returns whole weeks ending today, so the tail is the current
 * week; days later in the week have not happened yet and are simply not
 * studied, which is not the same as a missed day but reads correctly either way.
 */
function currentWeek(days: StudyDay[]): { day: string; done: boolean }[] {
  const today = new Date();
  const offset = (today.getDay() + 6) % 7;
  const tail = days.slice(-(offset + 1));
  return WEEKDAYS.map((day, index) => ({ day, done: (tail[index]?.minutes ?? 0) > 0 }));
}

function shortDate(value: string): string {
  return new Date(value.length > 10 ? value : `${value}T00:00:00`).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function AchievementsBoard({
  stats,
  milestones,
  studyDays,
  weekly,
}: AchievementsBoardProps) {
  const week = currentWeek(studyDays);

  /*
   * The headline figures are the same numbers the panels below use.
   *
   * They were all invented before, which put "Best: 21 days" above a Streaks
   * panel computing 8, and "12 milestones" above a list of 7. Badges and points
   * have no table behind them at all, so those two remain the only mock figures
   * on this screen and are the ones to replace when a source exists.
   */
  const headlineStats = [
    MOCK_ACHIEVEMENT_STATS[0]!,
    {
      ...MOCK_ACHIEVEMENT_STATS[1]!,
      value: String(milestones.length),
      delta: `${milestones.length === 1 ? '1 milestone' : `${milestones.length} milestones`} reached`,
    },
    {
      ...MOCK_ACHIEVEMENT_STATS[2]!,
      value: String(stats.currentStreak),
      delta: `Best: ${stats.longestStreak} ${stats.longestStreak === 1 ? 'day' : 'days'}`,
    },
    {
      ...MOCK_ACHIEVEMENT_STATS[3]!,
      value: hours(stats.totalMinutes),
      delta: `${stats.daysStudied} days studied`,
    },
    MOCK_ACHIEVEMENT_STATS[4]!,
  ];

  // The comparison prompt section 12 does allow: the student against their own
  // record. Every figure is computed, and a week with nothing in it says so.
  const difference = weekly.thisWeek - weekly.lastWeek;
  const records = [
    {
      id: 'week',
      label: 'This week',
      value: hours(weekly.thisWeek),
      detail:
        weekly.lastWeek === 0
          ? 'No sessions last week to compare'
          : `${hours(Math.abs(difference))} ${difference >= 0 ? 'more' : 'less'} than last week`,
      icon: 'clock' as const,
      tone: 'indigo' as const,
    },
    {
      id: 'best',
      label: 'Best week',
      value: weekly.bestWeek ? hours(weekly.bestWeek.minutes) : '—',
      detail: weekly.bestWeek ? `Week of ${shortDate(weekly.bestWeek.weekStart)}` : 'No weeks on record',
      icon: 'target' as const,
      tone: 'teal' as const,
    },
    {
      id: 'streak',
      label: 'Longest streak',
      value: stats.longestStreak > 0 ? `${stats.longestStreak} days` : '—',
      detail: `Currently ${stats.currentStreak} ${stats.currentStreak === 1 ? 'day' : 'days'}`,
      icon: 'flame' as const,
      tone: 'amber' as const,
    },
    {
      id: 'days',
      label: 'Days studied',
      value: String(stats.daysStudied),
      detail: `${stats.daysThisMonth} this month`,
      icon: 'check-circle' as const,
      tone: 'magenta' as const,
    },
  ];

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
          {headlineStats.map((stat) => (
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
          <section>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>Milestones</h2>
              <ActionLink href="/progress">View progress</ActionLink>
            </div>

            {milestones.length === 0 ? (
              <Card>
                <p className={styles.panelNote}>
                  No milestones yet. They appear here as you finish sessions, quizzes and topics.
                </p>
              </Card>
            ) : (
              /* A timeline: milestones are dated, and the order is the point. */
              <ol className={styles.timeline}>
                {milestones.map((milestone) => (
                  <li key={milestone.id} className={styles.timelineItem}>
                    <span className={styles.timelineMark}>
                      <IconTile icon={milestone.icon} tone={milestone.tone} size="sm" />
                    </span>
                    <article className={styles.timelineCard}>
                      <div className={styles.timelineHead}>
                        <h3 className={styles.timelineTitle}>{milestone.title}</h3>
                        <span className={styles.timelineDate}>{shortDate(milestone.date)}</span>
                      </div>
                      <p className={styles.timelineDetail}>{milestone.detail}</p>
                    </article>
                  </li>
                ))}
              </ol>
            )}
          </section>
        )}

        {tab === 'streaks' && (
          <section className={styles.streakPanel}>
            <div className={styles.streakFigures}>
              <article className={styles.streakFigure}>
                <span className={styles.streakFigureValue}>{stats.currentStreak}</span>
                <span className={styles.streakFigureLabel}>Current streak, days</span>
              </article>
              <article className={styles.streakFigure}>
                <span className={styles.streakFigureValue}>{stats.longestStreak}</span>
                <span className={styles.streakFigureLabel}>Longest streak, days</span>
              </article>
              <article className={styles.streakFigure}>
                <span className={styles.streakFigureValue}>{stats.daysStudied}</span>
                <span className={styles.streakFigureLabel}>Days studied</span>
              </article>
              <article className={styles.streakFigure}>
                <span className={styles.streakFigureValue}>{stats.daysThisMonth}</span>
                <span className={styles.streakFigureLabel}>Days this month</span>
              </article>
            </div>

            <Card>
              <div className={styles.sectionHead}>
                <h2 className={styles.sectionTitle}>This week</h2>
              </div>
              <ul className={styles.week}>
                {week.map((entry, index) => (
                  <li key={index} className={styles.weekDay}>
                    <span
                      className={`${styles.weekMark} ${entry.done ? styles.weekDone : ''}`.trim()}
                    >
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

            <Card>
              <div className={styles.sectionHead}>
                <h2 className={styles.sectionTitle}>Last twelve weeks</h2>
              </div>
              <StudyHeatmap days={studyDays} />
            </Card>
          </section>
        )}

        {tab === 'leaderboard' && (
          <section className={styles.streakPanel}>
            {/*
              The design puts a ranking of students here. Prompt section 12
              rules out comparing one student to another, so the comparison is
              against their own record instead. Flagged in AGENTS.md.
            */}
            <Card className={styles.noRank}>
              <span className={styles.noRankTitle}>
                <Icon name="shield" size={16} />
                No student rankings
              </span>
              <p className={styles.noRankText}>
                StudyWise doesn&rsquo;t rank you against anyone else, and never will. What it can
                show you is how this week compares with your own.
              </p>
            </Card>

            <div className={styles.bestGrid}>
              {records.map((best) => (
                <article key={best.id} className={styles.bestCard}>
                  <div className={styles.bestHead}>
                    <IconTile icon={best.icon} tone={best.tone} size="sm" />
                    <span className={styles.bestLabel}>{best.label}</span>
                  </div>
                  <span className={styles.bestValue}>{best.value}</span>
                  <span className={styles.bestDetail}>{best.detail}</span>
                </article>
              ))}
            </div>
          </section>
        )}

        {tab === 'badges' && (
          <button type="button" className={styles.viewMore}>
            View More Badges
            <Icon name="chevron-down" size={16} />
          </button>
        )}
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
                <span className={styles.streakNumber}>{stats.currentStreak}</span>
                <span>{stats.currentStreak === 1 ? 'day in a row!' : 'days in a row!'}</span>
              </span>
              <span className={styles.streakNote}>You&rsquo;re building a great habit!</span>
            </span>
          </div>
          <ul className={styles.week}>
            {week.map((entry, index) => (
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
            {milestones.slice(0, 5).map((milestone) => (
              <li key={milestone.id} className={styles.railRow}>
                <IconTile icon={milestone.icon} tone={milestone.tone} size="sm" />
                <span className={styles.railRowBody}>
                  <span className={styles.railRowTitle}>{milestone.title}</span>
                  <span className={styles.railRowDate}>{shortDate(milestone.date)}</span>
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
