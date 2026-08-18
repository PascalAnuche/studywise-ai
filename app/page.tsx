import Link from 'next/link';
import { Card } from '@/components/Card';
import { ActionLink } from '@/components/ActionLink';
import { Icon } from '@/components/Icon';
import { buildDashboard } from '@/lib/view-models/dashboard';
import { getCurrentStudentId } from '@/lib/session';
import { AssistantRail } from './components/AssistantRail';
import { LearnComposer } from './components/LearnComposer';
import { LearningProgress } from './components/LearningProgress';
import { RecommendationRail, type RecommendationItem } from './components/RecommendationRail';
import { TodaysPlan, formatTimeRange, type PlanItem } from './components/TodaysPlan';
import styles from './home.module.css';
import page from './page.module.css';

export const dynamic = 'force-dynamic';

/**
 * Home, built to the approved design.
 *
 * Presentation only: every rule about what to show lives in
 * lib/view-models/dashboard.ts, so a redesign can replace this file without
 * taking the logic with it.
 *
 * Order follows the journey map in PRD section 5: greeting, the thing to do
 * next, today's commitments, then progress and suggestions.
 *
 * Copy follows prompt section 6 (warm and encouraging) within the limit of
 * section 12: celebrate progress toward a goal the student set, never say
 * anything about the student's ability.
 */
const RECOMMENDATION_TONES = ['brand', 'positive', 'caution'] as const;
const RECOMMENDATION_ICONS = ['target', 'practice', 'flame'] as const;

export default async function HomePage() {
  const view = await buildDashboard(getCurrentStudentId());

  if (!view) {
    return (
      <main id="main" className={page.page}>
        <h1>No student found</h1>
        <p className={page.subtitle}>
          Run <code>npm run db:reset</code> to create and seed the database.
        </p>
      </main>
    );
  }

  const planItems: PlanItem[] = view.todaysSessions.map((session) => ({
    id: session.id,
    // The session's focus is its title on Home ("Data Structures Lecture"),
    // with the topic as the supporting line.
    title: session.focus,
    detail: session.topic,
    timeRange: formatTimeRange(session.startTime, session.durationMinutes),
    status: session.status,
  }));

  const recommendations: RecommendationItem[] = view.recommendations.map((item, index) => ({
    id: item.id,
    title: item.topic,
    reason: item.reason,
    actionLabel: 'Start review',
    href: `/practice?topic=${encodeURIComponent(item.topic)}`,
    icon: RECOMMENDATION_ICONS[index % RECOMMENDATION_ICONS.length],
    tone: RECOMMENDATION_TONES[index % RECOMMENDATION_TONES.length],
  }));

  return (
    <div className={styles.layout}>
      <main id="main" className={styles.main}>
        <header className={styles.greeting}>
          <div className={styles.greetingText}>
            <h1 className={styles.hello}>Hi {view.firstName}! 👋</h1>
            <p className={styles.subtitle}>Let&rsquo;s make today a productive learning day.</p>
          </div>
        </header>

        <LearnComposer />

        <div className={styles.cards}>
          <Card>
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}>Today&rsquo;s Plan</h2>
              <ActionLink href="/planner">View full planner</ActionLink>
            </div>
            <TodaysPlan items={planItems} />
          </Card>

          <Card>
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}>Learning Progress</h2>
              <ActionLink href="/progress">This Week</ActionLink>
            </div>
            <LearningProgress
              goalPercent={view.weekly.goalPercent}
              studyTime={view.weekly.studyTime}
              topicsLearned={view.weekly.topicsLearned}
              questionsSolved={view.weekly.questionsSolved}
              trend={view.weekly.trend}
            />
          </Card>
        </div>

        <Card>
          <div className={styles.cardHead}>
            <div>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionIcon} aria-hidden="true">
                  <Icon name="sparkle" size={18} />
                </span>
                AI Recommendations for You
              </h2>
              <p className={styles.sectionSub}>Based on your progress and study habits</p>
            </div>
            <ActionLink href="/progress">View all</ActionLink>
          </div>
          <RecommendationRail items={recommendations} />
        </Card>
      </main>

      <aside className={styles.rail}>
        <AssistantRail
          latest={
            view.latestExplanation
              ? {
                  ...view.latestExplanation,
                  // Citations are not stored yet; the rail omits the block
                  // rather than inventing sources. See AGENTS.md.
                  sources: [],
                }
              : null
          }
        />
      </aside>
    </div>
  );
}
