'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/Card';
import { ActionLink } from '@/components/ActionLink';
import { Icon, type IconName } from '@/components/Icon';
import { IconTile } from '@/components/IconTile';
import { Modal } from '@/components/Modal';
import { Toast } from '@/components/Toast';
import { isAside } from '@/lib/ai/types';
import type { AsideResult, PlanInput, PlannerResult } from '@/lib/ai/types';
import { AIResponse } from '@/components/AIResponse';
import { PlanWizard } from './PlanWizard';
import { MiniCalendar, type DayMarker } from './MiniCalendar';
import styles from '../planner.module.css';

/**
 * Study Planner, per the approved design.
 *
 * Tabs, the active plan with its completion ring, today's schedule, and an AI
 * recommendation; the rail carries a month calendar, the streak and upcoming
 * tasks.
 *
 * The plan form is a modal behind "Create New Plan": creating a plan is
 * occasional, and reading the schedule is what the page is for the rest of the
 * time.
 */
export interface ScheduleSlot {
  id: number;
  title: string;
  subtitle: string;
  timeRange: string | null;
  status: 'in-progress' | 'completed' | 'upcoming';
  tone: 'violet' | 'green' | 'amber' | 'rose' | 'blue';
  icon: IconName;
}

export interface ActivePlan {
  id: number;
  title: string;
  description: string;
  dateRange: string;
  frequency: string;
  topicCount: number;
  percentComplete: number;
}

export interface UpcomingTask {
  id: number;
  title: string;
  subtitle: string;
  when: string;
  time: string;
}

export interface GoalCard {
  id: string;
  /** What the student wrote, verbatim. */
  text: string;
  subject: string;
  status: 'draft' | 'active' | 'completed';
  targetDate: string | null;
  /** Progress of the plan serving this goal, not a figure invented per card. */
  percentComplete: number;
  sessionCount: number;
}

export interface PastPlan {
  id: number;
  subject: string;
  dateRange: string;
  topicCount: number;
  sessionCount: number;
  percentComplete: number;
  goals: string[];
}

export interface PlannerBoardProps {
  plan: ActivePlan | null;
  goals: GoalCard[];
  pastPlans: PastPlan[];
  schedule: ScheduleSlot[];
  tasks: UpcomingTask[];
  markers: Record<string, DayMarker[]>;
  streak: number;
  today: string;
}

const TABS = [
  { id: 'my-plans', label: 'My Plans', icon: 'plan' as IconName },
  { id: 'create', label: 'Create Plan', icon: 'wand' as IconName },
  { id: 'goals', label: 'Study Goals', icon: 'target' as IconName },
  { id: 'past', label: 'Past Plans', icon: 'history' as IconName },
];

const TONE_CLASS: Record<ScheduleSlot['tone'], string> = {
  violet: 'toneViolet',
  green: 'toneGreen',
  amber: 'toneAmber',
  rose: 'toneRose',
  blue: 'toneBlue',
};

const TONE_STYLE: Record<ScheduleSlot['tone'], { background: string; color: string }> = {
  violet: { background: 'var(--color-event-violet-bg)', color: 'var(--color-event-violet-fg)' },
  green: { background: 'var(--color-event-green-bg)', color: 'var(--color-event-green-fg)' },
  amber: { background: 'var(--color-event-amber-bg)', color: 'var(--color-event-amber-fg)' },
  rose: { background: 'var(--color-event-rose-bg)', color: 'var(--color-event-rose-fg)' },
  blue: { background: 'var(--color-event-blue-bg)', color: 'var(--color-event-blue-fg)' },
};

const STATUS_CLASS = {
  'in-progress': styles.statusInProgress,
  completed: styles.statusCompleted,
  upcoming: styles.statusUpcoming,
};

const STATUS_LABEL = {
  'in-progress': 'In Progress',
  completed: 'Completed',
  upcoming: 'Upcoming',
};

function Ring({ percent }: { percent: number }) {
  const size = 96;
  const stroke = 9;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (Math.min(Math.max(percent, 0), 100) / 100) * circumference;

  return (
    <div className={styles.planRing}>
      <svg width={size} height={size} role="img" aria-label={`${percent}% completed`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-border)" strokeWidth={stroke} />
        {filled > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circumference - filled}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        )}
      </svg>
      <span className={styles.planRingLabel} aria-hidden="true">
        <span className={styles.planRingValue}>{percent}%</span>
        <span className={styles.planRingCaption}>Completed</span>
      </span>
    </div>
  );
}

export function PlannerBoard({
  plan,
  goals,
  pastPlans,
  schedule,
  tasks,
  markers,
  streak,
  today,
}: PlannerBoardProps) {
  const [tab, setTab] = useState('my-plans');
  const [formOpen, setFormOpen] = useState(false);
  const [aside, setAside] = useState<AsideResult | null>(null);
  const [error, setError] = useState<string | null>(null);


  return (
    <div className={styles.layout}>
      <main id="main" className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Study Planner</h1>
            <p className={styles.subtitle}>Plan your study schedule and goals with the help of AI.</p>
          </div>
          <button type="button" className={styles.createButton} onClick={() => setFormOpen(true)}>
            <Icon name="plus" size={16} />
            Create New Plan
          </button>
        </header>

        <nav className={styles.tabs} aria-label="Planner sections">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`${styles.tab} ${tab === item.id ? styles.tabActive : ''}`}
              aria-current={tab === item.id ? 'true' : undefined}
              onClick={() => (item.id === 'create' ? setFormOpen(true) : setTab(item.id))}
            >
              <Icon name={item.icon} size={16} />
              {item.label}
            </button>
          ))}
        </nav>

        {aside && (
          <Card title="Before we plan">
            <AIResponse result={aside} />
          </Card>
        )}

        {tab === 'my-plans' && (
          <>
          {plan ? (
            <Card>
              <div className={styles.planCard}>
                <div className={styles.planBody}>
                  <div className={styles.planTitleRow}>
                    <h2 className={styles.planTitle}>{plan.title}</h2>
                    <span className={styles.planBadge}>Active Plan</span>
                  </div>
                  <p className={styles.planDescription}>{plan.description}</p>
                  <div className={styles.planMeta}>
                    <span className={styles.planMetaItem}>
                      <Icon name="plan" size={14} /> {plan.dateRange}
                    </span>
                    <span className={styles.planMetaItem}>
                      <Icon name="clock" size={14} /> {plan.frequency}
                    </span>
                    <span className={styles.planMetaItem}>
                      <Icon name="learn" size={14} /> {plan.topicCount} Topics
                    </span>
                  </div>
                </div>

                <Ring percent={plan.percentComplete} />

                <Link href="/planner" className={styles.planAction}>
                  View Plan
                </Link>
              </div>
            </Card>
          ) : (
            <Card>
              <p className={styles.empty}>
                No active plan yet. Create one and today&rsquo;s schedule appears here.
              </p>
            </Card>
          )}

          <Card>
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}>Today&rsquo;s Schedule</h2>
              <ActionLink href="/planner">View full schedule</ActionLink>
            </div>

            {schedule.length === 0 ? (
              <p className={styles.empty}>Nothing scheduled for today.</p>
            ) : (
              <ul className={styles.schedule}>
                {schedule.map((slot) => (
                  <li key={slot.id} className={styles.slot}>
                    <span className={styles.slotTime}>{slot.timeRange ?? '—'}</span>

                    <span className={styles.slotMarker} aria-hidden="true">
                      <span
                        className={`${styles.slotDot} ${
                          slot.status !== 'upcoming' ? styles.slotDotActive : ''
                        }`}
                      />
                    </span>

                    <div className={styles.slotCard}>
                      <span className={styles.slotIcon} style={TONE_STYLE[slot.tone]} aria-hidden="true">
                        <Icon name={slot.icon} size={20} />
                      </span>

                      <span className={styles.slotBody}>
                        <span className={styles.slotTitle}>{slot.title}</span>
                        <span className={styles.slotSubtitle}>{slot.subtitle}</span>
                      </span>

                      <span className={`${styles.slotStatus} ${STATUS_CLASS[slot.status]}`}>
                        {STATUS_LABEL[slot.status]}
                      </span>

                      {slot.status === 'completed' ? (
                        <span className={styles.slotDone} aria-hidden="true">
                          <Icon name="check-circle" size={20} filled />
                        </span>
                      ) : (
                        <button
                          type="button"
                          className={styles.slotMore}
                          disabled
                          title="Per-session actions are not built yet"
                          aria-label={`More actions for ${slot.title}`}
                        >
                          <Icon name="more" size={18} />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <button
              type="button"
              className={styles.editSchedule}
              disabled
              title="Editing the schedule inline is not built yet"
            >
              <Icon name="edit" size={16} />
              Edit Schedule
            </button>
          </Card>

          <div className={styles.aiStrip}>
            <span className={styles.aiHead}>
              <span className={styles.aiIcon} aria-hidden="true">
                <Icon name="sparkle" size={18} />
              </span>
              <span>
                <span className={styles.aiTitle}>AI Recommendation</span>
                <br />
                <span className={styles.aiSub}>Based on your progress</span>
              </span>
            </span>
            <span className={styles.aiText}>
              You&rsquo;re doing great! After completing Linked Lists, try practicing more questions to
              strengthen your understanding.
            </span>
            <Link href="/practice" className={styles.aiAction}>
              Practice Now
            </Link>
          </div>
          </>
        )}

        {tab === 'goals' && (
          <>
            <div className={styles.panelHead}>
              <h2 className={styles.panelTitle}>Study Goals</h2>
            </div>

            {goals.length === 0 ? (
              <Card>
                <p className={styles.emptyText}>
                  No goals yet. Goals are what you write when you create a plan, and they are what
                  each session is working towards.
                </p>
              </Card>
            ) : (
              <div className={styles.goalGrid}>
                {goals.map((goal) => (
                  <article key={goal.id} className={styles.goalCard}>
                    <div className={styles.goalTop}>
                      <IconTile icon="target" tone="indigo" size="sm" />
                      <span
                        className={`${styles.goalStatus} ${
                          goal.status === 'active' ? styles.goalActive : styles.goalDraft
                        }`}
                      >
                        {goal.status === 'active' ? 'Active' : 'Draft'}
                      </span>
                    </div>

                    <h3 className={styles.goalText}>{goal.text}</h3>

                    <div className={styles.goalMeta}>
                      <span className={styles.goalMetaItem}>
                        <Icon name="learn" size={14} />
                        {goal.subject}
                      </span>
                      <span className={styles.goalMetaItem}>
                        <Icon name="plan" size={14} />
                        {goal.targetDate ?? 'No target date'}
                      </span>
                    </div>

                    <div className={styles.goalFoot}>
                      <span className={styles.goalTrack}>
                        <span
                          className={styles.goalBar}
                          style={{ width: `${goal.percentComplete}%` }}
                        />
                      </span>
                      {/* The plan's progress, labelled as such: a goal is not a
                        * percentage, the work towards it is. */}
                      <span className={styles.goalPercent}>{goal.percentComplete}%</span>
                    </div>
                    <span className={styles.goalNote}>
                      {goal.sessionCount} {goal.sessionCount === 1 ? 'session' : 'sessions'} on this
                      plan
                    </span>
                  </article>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'past' && (
          <>
            <div className={styles.panelHead}>
              <h2 className={styles.panelTitle}>Past Plans</h2>
            </div>

            {pastPlans.length === 0 ? (
              <Card>
                <p className={styles.emptyText}>
                  Nothing here yet. A plan moves here once it is marked complete, with what it
                  covered and how much of it you got through.
                </p>
              </Card>
            ) : (
              <div className={styles.pastList}>
                {pastPlans.map((past) => (
                  <Card key={past.id}>
                    <div className={styles.pastHead}>
                      <div className={styles.pastTitleRow}>
                        <h3 className={styles.pastTitle}>{past.subject}</h3>
                        <span className={styles.pastBadge}>Completed</span>
                      </div>
                      <span className={styles.pastRange}>{past.dateRange}</span>
                    </div>

                    <div className={styles.pastStats}>
                      <span className={styles.pastStat}>
                        <span className={styles.pastStatValue}>{past.topicCount}</span>
                        <span className={styles.pastStatLabel}>Topics</span>
                      </span>
                      <span className={styles.pastStat}>
                        <span className={styles.pastStatValue}>{past.sessionCount}</span>
                        <span className={styles.pastStatLabel}>Sessions</span>
                      </span>
                      <span className={styles.pastStat}>
                        <span className={styles.pastStatValue}>{past.percentComplete}%</span>
                        <span className={styles.pastStatLabel}>Completed</span>
                      </span>
                    </div>

                    {past.goals.length > 0 && (
                      <ul className={styles.pastGoals}>
                        {past.goals.map((goal) => (
                          <li key={goal} className={styles.pastGoal}>
                            <Icon name="check-circle" size={14} />
                            {goal}
                          </li>
                        ))}
                      </ul>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

      </main>

      <aside className={styles.rail}>
        <Card>
          <MiniCalendar markers={markers} today={today} />
        </Card>

        <Card>
          <div className={styles.railHead}>
            <span className={styles.railTitle}>
              <span className={styles.railIcon} aria-hidden="true">
                <Icon name="flame" size={16} />
              </span>
              Study Streak
            </span>
            <ActionLink href="/achievements">Details</ActionLink>
          </div>
          <div className={styles.streakRow}>
            <span className={styles.streakBody}>
              <span className={styles.streakValue}>
                <span className={styles.streakNumber}>{streak}</span>
                <span className={styles.streakUnit}>{streak === 1 ? 'day' : 'days'} in a row!</span>
              </span>
              <span className={styles.streakNote}>Keep it going! 🔥</span>
            </span>
            <span className={styles.flame} aria-hidden="true">
              🔥
            </span>
          </div>
        </Card>

        <Card>
          <div className={styles.railHead}>
            <span className={styles.railTitle}>Upcoming Tasks</span>
            <ActionLink href="/planner">View all</ActionLink>
          </div>

          {tasks.length === 0 ? (
            <p className={styles.empty}>Nothing left today.</p>
          ) : (
            <ul className={styles.tasks}>
              {tasks.map((task) => (
                <li key={task.id} className={styles.task}>
                  <input
                    className={styles.taskCheck}
                    type="checkbox"
                    disabled
                    title="Completion is not stored yet"
                    aria-label={`Mark ${task.title} complete`}
                  />
                  <span className={styles.taskBody}>
                    <span className={styles.taskTitle}>{task.title}</span>
                    <span className={styles.taskSub}>{task.subtitle}</span>
                  </span>
                  <span className={styles.taskWhen}>
                    {task.when}
                    <br />
                    {task.time}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <button type="button" className={styles.addTask} disabled title="Ad-hoc tasks are not modelled yet">
            <Icon name="plus" size={16} />
            Add a task
          </button>
        </Card>
      </aside>

      <Modal open={formOpen} title="Create a study plan" wide onClose={() => setFormOpen(false)}>
        <PlanWizard
          onCancel={() => setFormOpen(false)}
          /* The new plan is the point of the flow, so the page reloads onto the
           * schedule it just created rather than leaving a stale one behind. */
          onSaved={() => {
            setFormOpen(false);
            window.location.reload();
          }}
        />
      </Modal>

      {error && <Toast tone="caution" message={error} onDismiss={() => setError(null)} />}
    </div>
  );
}
