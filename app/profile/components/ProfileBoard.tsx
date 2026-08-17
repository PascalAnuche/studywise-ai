'use client';

import { useState } from 'react';
import { ActionLink } from '@/components/ActionLink';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { IconTile } from '@/components/IconTile';
import { CHART_TONE_VAR } from '@/lib/tones';
import {
  MOCK_ABOUT,
  MOCK_ACCOUNT,
  MOCK_CONNECTED,
  MOCK_INTERESTS,
  MOCK_LEARNING_GOALS,
  MOCK_PROFILE_STATS,
  MOCK_REMINDERS,
  MOCK_TOP_SKILLS,
} from '@/lib/mock';
import { TabStrip, type TabItem } from '../../components/Toolbar';
import styles from '../profile.module.css';

const TABS: TabItem[] = [
  { id: 'overview', label: 'Overview', icon: 'profile' },
  { id: 'account', label: 'Account', icon: 'settings' },
  { id: 'preferences', label: 'Preferences', icon: 'filter' },
  { id: 'study', label: 'Study Preferences', icon: 'learn' },
  { id: 'privacy', label: 'Privacy & Security', icon: 'shield' },
];

export interface ProfileBoardProps {
  name: string;
  discipline: string | null;
  /**
   * The student's photo. `students` has no avatar column, so this is null
   * today and the circle shows initials — the state a real account starts in
   * before anyone uploads one. Add the column and a real photo drops straight
   * in; nothing else on this screen changes.
   */
  avatarUrl?: string | null;
}

export function ProfileBoard({ name, discipline, avatarUrl = null }: ProfileBoardProps) {
  const [tab, setTab] = useState('overview');
  const [reminders, setReminders] = useState(() =>
    Object.fromEntries(MOCK_REMINDERS.map((r) => [r.id, r.on]))
  );

  const initials = name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('');

  return (
    <div className={styles.layout}>
      <main id="main" className={styles.main}>
        <header>
          <h1 className={styles.title}>My Profile</h1>
          <p className={styles.subtitle}>
            Manage your information, preferences and account settings.
          </p>
        </header>

        <section className={styles.identity}>
          <span className={styles.avatarWrap}>
            <span className={styles.avatar}>
              {avatarUrl ? (
                /* A plain img, not next/image: the avatar is one small square
                 * from an arbitrary URL, and next/image would pull sharp into
                 * the deployment for it. */
                // eslint-disable-next-line @next/next/no-img-element
                <img className={styles.avatarImage} src={avatarUrl} alt={`${name}'s profile photo`} />
              ) : (
                <span aria-hidden="true">{initials}</span>
              )}
            </span>
            <button type="button" className={styles.avatarEdit} aria-label="Change profile photo">
              <Icon name="camera" size={14} />
            </button>
          </span>

          <div className={styles.identityBody}>
            <div className={styles.nameRow}>
              <h2 className={styles.name}>{name}</h2>
              <span className={`${styles.proChip} ${styles.proChipSoft}`}>
                <Icon name="sparkle" size={12} />
                Pro
              </span>
            </div>
            <p className={styles.discipline}>{discipline ?? 'Student'}</p>
            <div className={styles.contact}>
              <span className={styles.contactRow}>
                <Icon name="mail" size={14} />
                {MOCK_ACCOUNT.email}
              </span>
              <span className={styles.contactRow}>
                <Icon name="pin" size={14} />
                {MOCK_ACCOUNT.location}
              </span>
            </div>
          </div>

          <div className={styles.identityAction}>
            <button type="button" className={styles.editProfile}>
              <Icon name="edit" size={16} />
              Edit Profile
            </button>
          </div>
        </section>

        <TabStrip items={TABS} active={tab} onSelect={setTab} label="Profile sections" />

        {tab === 'overview' ? (
          <>
            <section className={styles.stats}>
              {MOCK_PROFILE_STATS.map((stat) => (
                <article key={stat.id} className={styles.stat}>
                  <div className={styles.statHead}>
                    <IconTile icon={stat.icon} tone={stat.tone} size="sm" />
                    <span className={styles.statValue}>{stat.value}</span>
                  </div>
                  <span className={styles.statLabel}>{stat.label}</span>
                  <span className={styles.statDelta}>
                    <Icon name="trend-up" size={12} />
                    {stat.delta}
                  </span>
                </article>
              ))}
            </section>

            <div className={styles.panels}>
              <Card>
                <h2 className={styles.panelTitle}>About Me</h2>
                <p className={styles.panelText}>A little about you and your academic journey.</p>
                <ul className={styles.aboutList}>
                  {MOCK_ABOUT.map((row) => (
                    <li key={row.id} className={styles.aboutRow}>
                      <span className={styles.aboutIcon} aria-hidden="true">
                        <Icon name={row.icon} size={18} />
                      </span>
                      <span className={styles.aboutBody}>
                        <span className={styles.aboutLabel}>{row.label}</span>
                        <span className={styles.aboutValue}>{row.value}</span>
                      </span>
                    </li>
                  ))}
                  <li className={styles.aboutRow}>
                    <span className={styles.aboutIcon} aria-hidden="true">
                      <Icon name="star" size={18} />
                    </span>
                    <span className={styles.aboutBody}>
                      <span className={styles.aboutLabel}>Interests</span>
                      <span className={styles.interests}>
                        {MOCK_INTERESTS.map((interest) => (
                          <span key={interest} className={styles.interest}>
                            {interest}
                          </span>
                        ))}
                      </span>
                    </span>
                  </li>
                </ul>
              </Card>

              <Card>
                <h2 className={styles.panelTitle}>Subject Strengths</h2>
                {/* Describes the work done, not what the student is capable of. */}
                <p className={styles.panelText}>
                  Your top performing subjects based on progress.
                </p>
                <ul className={styles.strengths}>
                  {MOCK_TOP_SKILLS.map((skill) => (
                    <li key={skill.subject} className={styles.strengthRow}>
                      <span className={styles.strengthName}>{skill.subject}</span>
                      <span className={styles.track}>
                        <span
                          className={styles.bar}
                          style={{
                            width: `${skill.percent}%`,
                            background: CHART_TONE_VAR[skill.tone],
                          }}
                        />
                      </span>
                      <span className={styles.strengthPercent}>{skill.percent}%</span>
                    </li>
                  ))}
                </ul>
                <div className={styles.panelFoot}>
                  <ActionLink href="/progress">View full progress</ActionLink>
                </div>
              </Card>
            </div>
          </>
        ) : (
          <Card>
            <h2 className={styles.panelTitle}>{TABS.find((t) => t.id === tab)?.label}</h2>
            <p className={styles.panelText}>
              Nothing on this tab is stored yet — `students` holds a name, an email, a discipline
              and the streak, and no more. Overview is the tab with real data behind it.
            </p>
          </Card>
        )}
      </main>

      <aside className={styles.rail}>
        <Card>
          <div className={styles.railHead}>
            <h2 className={styles.railTitle}>Account Status</h2>
            <span className={styles.proChip}>
              <Icon name="sparkle" size={12} />
              Pro
            </span>
          </div>
          <div className={styles.planCard}>
            <IconTile icon="crown" tone="indigo" size="sm" />
            <span className={styles.planBody}>
              <span className={styles.planName}>{MOCK_ACCOUNT.plan}</span>
              <span className={styles.planRenews}>
                Your Pro plan renews on {MOCK_ACCOUNT.renewsOn}
              </span>
              <button type="button" className={styles.manage}>
                Manage Subscription
              </button>
            </span>
          </div>
        </Card>

        <Card>
          <div className={styles.railHead}>
            <h2 className={styles.railTitle}>Learning Goals</h2>
            <ActionLink href="/planner">View All</ActionLink>
          </div>
          <ul className={styles.goals}>
            {MOCK_LEARNING_GOALS.map((goal) => (
              <li key={goal.id} className={styles.goalRow}>
                <IconTile icon={goal.icon} tone={goal.tone} size="sm" />
                <span className={styles.goalBody}>
                  <span className={styles.goalTitle}>{goal.title}</span>
                  <span className={styles.goalMeter}>
                    <span className={styles.track}>
                      <span
                        className={styles.bar}
                        style={{
                          width: `${Math.round((goal.current / goal.target) * 100)}%`,
                          background: CHART_TONE_VAR[goal.tone],
                        }}
                      />
                    </span>
                    <span className={styles.goalCount}>
                      {goal.current} / {goal.target} {goal.unit}
                    </span>
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className={styles.railHead}>
            <h2 className={styles.railTitle}>Study Reminders</h2>
            <ActionLink href="/settings" icon={null}>
              Edit
            </ActionLink>
          </div>
          <ul className={styles.reminders}>
            {MOCK_REMINDERS.map((reminder) => (
              <li key={reminder.id} className={styles.reminderRow}>
                <span className={styles.reminderIcon} aria-hidden="true">
                  <Icon name="bell" size={18} />
                </span>
                <span className={styles.reminderBody}>
                  <span className={styles.reminderTitle}>{reminder.title}</span>
                  <span className={styles.reminderDetail}>{reminder.detail}</span>
                </span>
                {/*
                  A real checkbox behind the switch, so it is keyboard operable
                  and announces on/off. Nothing is stored yet — the toggle holds
                  its own state and says so in AGENTS.md.
                */}
                <label className={styles.switchLabel}>
                  <span className="visually-hidden">{reminder.title}</span>
                  <input
                    type="checkbox"
                    className={`visually-hidden ${styles.switchInput}`}
                    checked={reminders[reminder.id] ?? false}
                    onChange={() =>
                      setReminders((prev) => ({ ...prev, [reminder.id]: !prev[reminder.id] }))
                    }
                  />
                  <span
                    className={`${styles.switch} ${reminders[reminder.id] ? styles.switchOn : ''}`.trim()}
                    aria-hidden="true"
                  />
                </label>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className={styles.railHead}>
            <h2 className={styles.railTitle}>Connected Accounts</h2>
            <ActionLink href="/settings" icon={null}>
              Manage
            </ActionLink>
          </div>
          <ul className={styles.accounts}>
            {MOCK_CONNECTED.map((account) => (
              <li key={account.id} className={styles.accountRow}>
                <span className={styles.accountLogo} aria-hidden="true">
                  {account.name[0]}
                </span>
                <span className={styles.accountBody}>
                  <span className={styles.accountName}>{account.name}</span>
                  <span className={styles.accountHandle}>{account.handle}</span>
                </span>
                {account.connected && <span className={styles.connected}>Connected</span>}
              </li>
            ))}
          </ul>
        </Card>
      </aside>
    </div>
  );
}
