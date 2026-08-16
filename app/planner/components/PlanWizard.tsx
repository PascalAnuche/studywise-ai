'use client';

import { useState } from 'react';
import { Button } from '@/components/Button';
import { DatePicker } from '@/components/DatePicker';
import { Icon } from '@/components/Icon';
import { Select } from '@/components/Select';
import {
  DoneStep,
  GeneratingStep,
  OptionChecks,
  OptionRadios,
  Wizard,
} from '@/components/Wizard';
import type { PlanDto } from '@/lib/db/planner';
import type { PlanInput } from '@/lib/ai/types';
import styles from './PlanWizard.module.css';

/**
 * Flow 2 — create a study plan, as the approved flow diagram lays it out.
 *
 * The steps mirror the real API rather than decorating a single form:
 *
 *   1-4  collect subject, goals, topics, dates
 *   5    POST /api/planner/generate, which persists a **draft**
 *   6    review that draft — the diagram's "is the student happy?" decision
 *   7    POST /confirm, which is what makes it active
 *
 * That the plan exists as a draft before the student approves it is the point:
 * leaving at the review step abandons a draft, it does not create a plan the
 * student never agreed to. Editing goes back to the collection steps and
 * generates again, which is the diagram's 11a branch.
 */
const SUBJECTS = [
  'Data Structures',
  'Algorithms',
  'Operating Systems',
  'Database Systems',
  'Computer Networks',
];

const GOALS = [
  'Understand concepts',
  'Prepare for exam',
  'Improve grades',
  'Complete syllabus',
  'Build projects',
];

/** Topics offered per subject, so step 3 follows from step 1. */
const TOPICS: Record<string, string[]> = {
  'Data Structures': ['Arrays', 'Linked Lists', 'Stacks', 'Queues', 'Hash Tables', 'Trees', 'Recursion'],
  Algorithms: ['Sorting', 'Searching', 'Big-O notation', 'Dynamic programming', 'Graph traversal'],
  'Operating Systems': ['Processes', 'Scheduling', 'Memory management', 'File systems', 'Concurrency'],
  'Database Systems': ['Normal forms', 'Indexing', 'Transactions', 'Query planning', 'ER modelling'],
  'Computer Networks': ['OSI model', 'TCP/IP', 'Routing', 'DNS', 'HTTP'],
};

const FREQUENCIES = [
  { value: '1x/week', label: 'Once a week' },
  { value: '2x/week', label: 'Twice a week' },
  { value: '3x/week', label: 'Three times a week' },
  { value: '5x/week', label: 'Five times a week' },
  { value: 'Everyday', label: 'Everyday' },
];

const STAGES = ['Analysing topics', 'Setting time blocks', 'Optimising schedule'];

type Stage = 'subject' | 'goals' | 'topics' | 'dates' | 'generating' | 'review' | 'saved';

/** Only the collection steps count toward the progress bar. */
const STEP_INDEX: Record<Stage, number> = {
  subject: 1,
  goals: 2,
  topics: 3,
  dates: 4,
  generating: 5,
  review: 5,
  saved: 5,
};

export interface PlanWizardProps {
  onSaved: () => void;
  onCancel: () => void;
}

export function PlanWizard({ onSaved, onCancel }: PlanWizardProps) {
  const [stage, setStage] = useState<Stage>('subject');
  const [subject, setSubject] = useState<string | null>(null);
  const [goals, setGoals] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [frequency, setFrequency] = useState('3x/week');

  const [progress, setProgress] = useState(0);
  const [stagesDone, setStagesDone] = useState(0);
  const [plan, setPlan] = useState<PlanDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const toggle = (list: string[], set: (next: string[]) => void, value: string) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  async function generate() {
    setStage('generating');
    setError(null);
    setProgress(0);
    setStagesDone(0);

    // The checklist ticks as the request runs. It is paced, not faked: each
    // stage marks while the single request is still in flight, so the student
    // sees which part is happening rather than a spinner that says nothing.
    const ticker = setInterval(() => {
      setProgress((p) => Math.min(p + 7, 92));
      setStagesDone((d) => Math.min(d + (Math.random() > 0.6 ? 1 : 0), STAGES.length - 1));
    }, 400);

    const input: PlanInput = {
      subject: subject!,
      goals,
      topics,
      frequency,
      startDate: startDate || null,
      endDate: endDate || null,
    };

    try {
      const response = await fetch('/api/planner/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data && typeof data === 'object' && 'error' in data
            ? String((data as { error: unknown }).error)
            : 'Could not build a plan'
        );
      }

      const body = data as { plan?: PlanDto };
      if (!body.plan) {
        // The adapter can answer with a clarifying question instead of a plan.
        // That is a valid outcome, not a failure, and it belongs back at the
        // step the student can act on.
        throw new Error('The assistant needs more detail before it can plan this.');
      }

      setStagesDone(STAGES.length);
      setProgress(100);
      setPlan(body.plan);
      setStage('review');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not build a plan');
      setStage('dates');
    } finally {
      clearInterval(ticker);
    }
  }

  async function confirm() {
    if (!plan) return;
    setSaving(true);
    setError(null);
    try {
      /*
       * `understood` is the diagram's "is the student happy with the plan?"
       * decision, and the endpoint records it rather than just flipping the
       * status. Saving from this step is the Yes branch; Edit plan is the No
       * branch and goes back to the topics step instead of confirming.
       */
      const response = await fetch(`/api/planner/${plan.id}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ understood: true }),
      });
      if (!response.ok) {
        const data: unknown = await response.json().catch(() => null);
        throw new Error(
          data && typeof data === 'object' && 'error' in data
            ? String((data as { error: unknown }).error)
            : 'Could not save the plan'
        );
      }
      setStage('saved');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save the plan');
    } finally {
      setSaving(false);
    }
  }

  const available = subject ? (TOPICS[subject] ?? []) : [];
  const asOptions = (list: string[]) => list.map((value) => ({ value, label: value }));

  const back = (to: Stage) => (
    <Button variant="ghost" onClick={() => setStage(to)}>
      Back
    </Button>
  );

  const problem = error && (
    <span role="alert" className={styles.error}>
      {error}
    </span>
  );

  if (stage === 'subject') {
    return (
      <Wizard
        step={1}
        total={5}
        title="Choose a subject"
        subtitle="The plan covers one subject at a time, so each session has a clear focus."
        note={problem}
        actions={
          <>
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            <Button disabled={!subject} onClick={() => setStage('goals')}>
              Continue
            </Button>
          </>
        }
      >
        <OptionRadios
          name="plan-subject"
          legend="Subject"
          options={asOptions(SUBJECTS)}
          value={subject}
          onChange={(next) => {
            setSubject(next);
            // Topics belong to a subject; keeping the old ones would carry
            // Arrays into a Networks plan.
            setTopics([]);
          }}
        />
      </Wizard>
    );
  }

  if (stage === 'goals') {
    return (
      <Wizard
        step={2}
        total={5}
        title="What do you want to achieve?"
        subtitle="Pick as many as apply. These shape what each session is for."
        note={problem}
        actions={
          <>
            {back('subject')}
            <Button disabled={goals.length === 0} onClick={() => setStage('topics')}>
              Continue
            </Button>
          </>
        }
      >
        <OptionChecks
          legend="Learning goals"
          options={asOptions(GOALS)}
          values={goals}
          onToggle={(value) => toggle(goals, setGoals, value)}
        />
      </Wizard>
    );
  }

  if (stage === 'topics') {
    return (
      <Wizard
        step={3}
        total={5}
        title="Which topics?"
        subtitle={`The plan only covers what you choose here. ${topics.length} selected.`}
        note={problem}
        actions={
          <>
            {back('goals')}
            <Button disabled={topics.length === 0} onClick={() => setStage('dates')}>
              Continue
            </Button>
          </>
        }
      >
        <OptionChecks
          legend="Topics"
          options={asOptions(available)}
          values={topics}
          onToggle={(value) => toggle(topics, setTopics, value)}
        />
      </Wizard>
    );
  }

  if (stage === 'dates') {
    return (
      <Wizard
        step={4}
        total={5}
        title="When are you studying?"
        subtitle="Sessions are spaced across this range at the frequency you choose."
        note={problem}
        actions={
          <>
            {back('topics')}
            <Button onClick={generate}>Generate plan</Button>
          </>
        }
      >
        <div className={styles.dates}>
          <DatePicker label="Start date" value={startDate} onValueChange={setStartDate} />
          <DatePicker
            label="Target date"
            value={endDate}
            onValueChange={setEndDate}
            min={startDate || undefined}
            hint="An exam date, if you have one."
          />
        </div>
        <Select
          label="Study frequency"
          value={frequency}
          onValueChange={setFrequency}
          options={FREQUENCIES}
        />
      </Wizard>
    );
  }

  if (stage === 'generating') {
    return (
      <Wizard
        step={5}
        total={5}
        title="Building your plan"
        subtitle="Working out how to spread these topics across your dates."
        actions={null}
      >
        <GeneratingStep percent={progress} stages={STAGES} done={stagesDone} />
      </Wizard>
    );
  }

  if (stage === 'review' && plan) {
    const bySession = new Map<string, number>();
    for (const session of plan.sessions) {
      bySession.set(session.topic, (bySession.get(session.topic) ?? 0) + 1);
    }

    return (
      <Wizard
        step={5}
        total={5}
        title="Review your plan"
        subtitle="Nothing is active until you save it. Go back to change anything."
        note={problem}
        actions={
          <>
            <Button variant="ghost" onClick={() => setStage('topics')}>
              Edit plan
            </Button>
            <Button loading={saving} onClick={confirm}>
              Save plan
            </Button>
          </>
        }
      >
        <div className={styles.summary}>
          <span className={styles.summarySubject}>{plan.subject}</span>
          <span className={styles.summaryMeta}>
            {plan.sessions.length} sessions · {plan.frequency ?? 'Flexible'}
          </span>
        </div>
        <ul className={styles.topicList}>
          {[...bySession.entries()].map(([topic, count]) => (
            <li key={topic} className={styles.topicRow}>
              <Icon name="check-circle" size={16} />
              <span className={styles.topicName}>{topic}</span>
              <span className={styles.topicCount}>
                {count} {count === 1 ? 'session' : 'sessions'}
              </span>
            </li>
          ))}
        </ul>
      </Wizard>
    );
  }

  if (stage === 'saved') {
    return (
      <Wizard
        step={5}
        total={5}
        title="Plan saved"
        actions={
          <Button onClick={onSaved}>
            View schedule
            <Icon name="arrow-right" size={16} />
          </Button>
        }
      >
        <DoneStep
          title="You're all set!"
          text="Your sessions are on the schedule. Stay consistent and you'll get there."
        />
      </Wizard>
    );
  }

  return null;
}
