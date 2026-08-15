import Link from 'next/link';
import { Card } from '@/components/Card';
import { ActionLink } from '@/components/ActionLink';
import { Icon, type IconName } from '@/components/Icon';
import { getProgressOverview } from '@/lib/db/progress';
import { getCurrentStudentId } from '@/lib/session';
import {
  MOCK_IMPROVEMENTS,
  MOCK_PROGRESS_STATS,
  MOCK_STRENGTHS,
  MOCK_STUDY_TIME_BY_DAY,
  MOCK_SUBJECT_PERFORMANCE,
} from '@/lib/mock';
import { StudyTimeChart } from './components/StudyTimeChart';
import { SubjectDonut } from './components/SubjectDonut';
import { CHART_TONE_VAR } from '@/lib/tones';
import styles from './progress.module.css';

export const dynamic = 'force-dynamic';

/**
 * Learning Progress — flow 6, built to the approved design.
 *
 * The streak is real, from `students.streak_count`. The per-subject rollups,
 * strengths and areas to improve have no queries behind them yet and come from
 * lib/mock.
 *
 * This screen carries no `MockNotice`, unlike the other mock-backed screens:
 * removed on request, since the design has nothing in that slot. The figures
 * are therefore indistinguishable from real ones on the page itself. Restore it
 * before anyone outside the team sees this, or wire the queries up. Tracked in
 * AGENTS.md.
 *
 * Prompt section 12 governs every string here: describe the work, never the
 * person, and never compare one student to another. The design's Quiz Master
 * line reads "You score higher than 80% of users"; that is a peer comparison,
 * so the wording states her own record instead. Card, title and placement are
 * unchanged. Flagged in AGENTS.md.
 */
interface Stat {
  icon: IconName;
  label: string;
  value: string;
  delta: string;
}

export default async function ProgressPage() {
  const overview = await getProgressOverview(getCurrentStudentId());

  // The donut and the Study Time figure cover the subjects in this week's
  // total; the table below lists every tracked subject.
  const weekly = MOCK_SUBJECT_PERFORMANCE.filter((s) => s.inWeeklyTotal);
  const stats: Stat[] = [
    { icon: 'clock', label: 'Study Time', value: MOCK_PROGRESS_STATS.studyTime, delta: MOCK_PROGRESS_STATS.deltas.studyTime },
    { icon: 'learn', label: 'Topics Learned', value: String(MOCK_PROGRESS_STATS.topicsLearned), delta: MOCK_PROGRESS_STATS.deltas.topicsLearned },
    { icon: 'check-circle', label: 'Questions Solved', value: String(MOCK_PROGRESS_STATS.questionsSolved), delta: MOCK_PROGRESS_STATS.deltas.questionsSolved },
    { icon: 'practice', label: 'Quizzes Taken', value: String(MOCK_PROGRESS_STATS.quizzesTaken), delta: MOCK_PROGRESS_STATS.deltas.quizzesTaken },
    { icon: 'target', label: 'Average Score', value: `${MOCK_PROGRESS_STATS.averageScore}%`, delta: MOCK_PROGRESS_STATS.deltas.averageScore },
  ];

  return (
    <div className={styles.layout}>
      <main id="main" className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Learning Progress</h1>
            <p className={styles.subtitle}>Track your learning journey and see how you&rsquo;re improving.</p>
          </div>
          <span className={styles.rangeSelect}>
            <Icon name="plan" size={16} />
            This Week
            <Icon name="chevron-down" size={16} />
          </span>
        </header>

        <section className={styles.stats}>
          {stats.map((stat) => (
            <article key={stat.label} className={styles.stat}>
              <div className={styles.statHead}>
                <span className={styles.statIcon} aria-hidden="true">
                  <Icon name={stat.icon} size={16} />
                </span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
              <span className={styles.statValue}>{stat.value}</span>
              {/* The change, with no adjective attached to it. */}
              <span className={styles.delta}>
                <Icon name="trend-up" size={14} />
                {stat.delta}
              </span>
            </article>
          ))}
        </section>

        <section className={styles.charts}>
          <Card>
            <div className={styles.chartHead}>
              <h2 className={styles.chartTitle}>Study Time Overview</h2>
              <span className={styles.rangeSelect}>
                Study Time
                <Icon name="chevron-down" size={16} />
              </span>
            </div>
            <StudyTimeChart data={MOCK_STUDY_TIME_BY_DAY} />
          </Card>

          <Card>
            <div className={styles.chartHead}>
              <h2 className={styles.chartTitle}>Time by Subject</h2>
            </div>
            <SubjectDonut
              total={MOCK_PROGRESS_STATS.studyTime}
              slices={weekly.map((s) => ({
                subject: s.subject,
                studyTime: s.studyTime,
                minutes: s.studyMinutes,
                tone: s.chartTone,
              }))}
            />
          </Card>
        </section>

        <Card>
          <div className={styles.chartHead}>
            <h2 className={styles.chartTitle}>Subject Performance</h2>
            <ActionLink href="/progress">View all subjects</ActionLink>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Subject</th>
                  <th scope="col">Study Time</th>
                  <th scope="col">Topics Learned</th>
                  <th scope="col">Questions Solved</th>
                  <th scope="col">Average Score</th>
                  <th scope="col">Progress</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_SUBJECT_PERFORMANCE.map((row) => (
                  <tr key={row.subject}>
                    <th scope="row">
                      <span className={styles.subjectCell}>
                        <span
                          className={styles.dot}
                          style={{ background: CHART_TONE_VAR[row.tone] }}
                          aria-hidden="true"
                        />
                        {row.subject}
                      </span>
                    </th>
                    <td>{row.studyTime}</td>
                    <td>{row.topicsLearned}</td>
                    <td>{row.questionsSolved}</td>
                    {/* An em dash, not 0%: no quiz taken is not a score of zero. */}
                    <td>{row.averageScore === null ? '—' : `${row.averageScore}%`}</td>
                    <td>
                      <span className={styles.progressCell}>
                        <span className={styles.track}>
                          <span className={styles.bar} style={{ width: `${row.progressPercent}%` }} />
                        </span>
                        {row.progressPercent}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>

      <aside className={styles.rail}>
        <Card>
          <div className={styles.railHead}>
            <h2 className={styles.railTitle}>Learning Streak</h2>
            <ActionLink href="/achievements">Details</ActionLink>
          </div>
          <div className={styles.streak}>
            <div className={styles.streakBody}>
              <span className={styles.streakValue}>
                <span className={styles.streakNumber}>{overview.streak}</span>
                <span className={styles.streakUnit}>
                  {overview.streak === 1 ? 'day' : 'days'} in a row! 🔥
                </span>
              </span>
              <span className={styles.streakNote}>Keep it going! You&rsquo;re doing great.</span>
            </div>
            <span className={styles.flame} aria-hidden="true">
              🔥
            </span>
          </div>
        </Card>

        <Card>
          <div className={styles.railHead}>
            <h2 className={styles.railTitle}>Strengths</h2>
            <ActionLink href="/achievements">View all</ActionLink>
          </div>
          <ul className={styles.insights}>
            {MOCK_STRENGTHS.map((item) => (
              <li key={item.id} className={styles.insight}>
                <span className={styles.insightIcon} data-tone={item.tone} aria-hidden="true">
                  <Icon name={item.icon as IconName} size={16} />
                </span>
                <span className={styles.insightBody}>
                  <span className={styles.insightTitle}>{item.title}</span>
                  <span className={styles.insightDetail}>{item.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className={styles.railHead}>
            <h2 className={styles.railTitle}>Areas to Improve</h2>
            <ActionLink href="/practice">View all</ActionLink>
          </div>
          <ul className={styles.insights}>
            {MOCK_IMPROVEMENTS.map((item) => (
              <li key={item.id} className={styles.improveRow}>
                <span className={styles.insightIcon} data-tone={item.tone} aria-hidden="true">
                  <Icon name={item.icon as IconName} size={16} />
                </span>
                <span className={styles.insightBody}>
                  <span className={styles.insightTitle}>{item.title}</span>
                  <span className={styles.insightDetail}>{item.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className={styles.aiRecommendation}>
          <div className={styles.aiCard}>
            <span className={styles.aiTitle}>
              <span className={styles.aiIcon} aria-hidden="true">
                <Icon name="sparkle" size={16} />
              </span>
              AI Recommendation
            </span>
            <span className={styles.aiText}>
              You&rsquo;re spending less time on Database Systems. Add a practice session?
            </span>
            <Link href="/planner" className={styles.aiAction}>
              Go to Study Planner
              <Icon name="arrow-right" size={16} />
            </Link>
          </div>
        </Card>
      </aside>
    </div>
  );
}
