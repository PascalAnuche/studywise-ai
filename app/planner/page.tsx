import { Card } from '@/components/Card';
import { listPlans, toPlanDto } from '@/lib/db/planner';
import { getCurrentStudentId } from '@/lib/session';
import { PlannerBoard } from './components/PlannerBoard';
import type { CalendarEvent } from './components/Calendar';
import { PlannerClient } from './components/PlannerClient';
import styles from './planner.module.css';
import page from '../page.module.css';

export const dynamic = 'force-dynamic';

/**
 * Study Planner — flow 2, built to the approved design.
 *
 * The calendar shows active plans. Building a new plan keeps its own section
 * below, because generating a plan is a different task from reading a schedule
 * and the design's calendar has nowhere to put a form.
 */
export default function PlannerPage() {
  const studentId = getCurrentStudentId();
  const active = listPlans(studentId, 'active').map(toPlanDto);
  const drafts = listPlans(studentId, 'draft').map(toPlanDto);
  const today = new Date().toISOString().slice(0, 10);

  const events: CalendarEvent[] = active.flatMap((plan) =>
    plan.sessions
      .filter((session) => session.scheduledFor !== null)
      .map((session) => ({
        id: session.id,
        title: session.focus,
        subtitle: `${plan.subject} · ${session.topic}`,
        date: session.scheduledFor!,
        startTime: session.startTime ?? null,
        durationMinutes: session.durationMinutes,
      }))
  );

  return (
    <main id="main" className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Study Planner</h1>
        <p className={styles.subtitle}>
          Built from the topics you list, at the pace you set. Nothing gets added that you
          didn&rsquo;t ask for, and you can change any of it afterwards.
        </p>
      </header>

      <PlannerBoard events={events} today={today} />

      <PlannerClient />

      {drafts.length > 0 && (
        <Card title="Drafts">
          <ul className={page.list}>
            {drafts.map((plan) => (
              <li key={plan.id} className={page.row}>
                <span className={page.question}>{plan.subject}</span>
                <span className={page.rowMeta}>
                  {plan.sessions.length} session{plan.sessions.length === 1 ? '' : 's'}
                  {plan.understood === false ? ' · needs adjusting' : ' · not reviewed yet'}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </main>
  );
}
