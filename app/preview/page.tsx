import { AIResponse } from '@/components/AIResponse';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ConfidenceBadge } from '@/components/ConfidenceBadge';
import { FollowUpPrompt } from '@/components/FollowUpPrompt';
import { Hero } from '@/components/Hero';
import { Icon, type IconName } from '@/components/Icon';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ReasoningPanel } from '@/components/ReasoningPanel';
import { SkeletonCard, SkeletonHero, SkeletonTiles } from '@/components/Skeleton';
import { StatTile } from '@/components/StatTile';
import { Toast } from '@/components/Toast';
import { CONFIDENCE_VALUES } from '@/lib/db/types';
import { runExplain } from '@/lib/ai';
import type { StudentContext } from '@/lib/ai/types';
import { PreviewControls, Specimen, Section } from './components/PreviewControls';
import styles from './catalogue.module.css';

export const dynamic = 'force-dynamic';

/**
 * Component catalogue.
 *
 * Every shared component, in every state it is expected to handle, on one page.
 *
 * This exists for the next visual overhaul. Rebuilding a design system without
 * an inventory means discovering the states you forgot one bug report at a
 * time: the disabled button, the empty list, the escalation that must not look
 * like an answer. Rebuild against this page and the gaps are visible before
 * release, not after.
 *
 * It is also the fastest way to check a theme: switch it in the topbar and
 * every component is on screen at once.
 */
const CONTEXT: StudentContext = {
  studentId: 1,
  discipline: 'Computer Science',
  currentTopics: ['Dynamic programming'],
  activePlans: [{ subject: 'Algorithms', topics: ['Recursion'], frequency: '3x/week' }],
  recentQuizzes: [{ subject: 'Algorithms', topic: 'Recursion', score: 0.6 }],
  weakAreas: ['Dynamic programming'],
  completedTopics: ['Recursion'],
  streak: 4,
};

const RESPONSE_CASES = [
  { title: 'Answer', note: 'Prompt §9. Answer first, collapsible why, confidence, follow-up.', question: 'When should I use memoisation instead of tabulation?' },
  { title: 'Clarifying question', note: 'Prompt §7. Asked instead of guessing. Never stored.', question: 'explain it' },
  { title: 'Wellbeing escalation', note: 'Prompt §13. Never persisted, per §12.', question: 'I am completely overwhelmed and behind on everything' },
  { title: 'Redirect', note: 'Prompt §5. Declines the work, offers the method.', question: 'write my essay on graph theory for me' },
];

const ICONS: IconName[] = [
  'home', 'learn', 'plan', 'practice', 'progress',
  'flame', 'check', 'target', 'arrow-right', 'sparkle',
];

export default async function CataloguePage() {
  const responses = await Promise.all(
    RESPONSE_CASES.map(async (testCase) => ({
      ...testCase,
      result: await runExplain({ userMessage: testCase.question, context: CONTEXT }),
    }))
  );

  return (
    <main id="main" className={styles.page}>
      <header className={styles.intro}>
        <h1>Component catalogue</h1>
        <p className={styles.lead}>
          Every shared component, in every state it has to handle. Rebuild against this page during
          a redesign and the states you would otherwise forget stay visible.
        </p>
        <p className={styles.sectionNote}>
          Switch the theme in the topbar to check both at once. Response states come from the real
          adapter, so this page breaks if the union or the renderer drifts.
        </p>
      </header>

      <Section title="Buttons" note="Every variant, plus loading and disabled.">
        <Specimen label="Primary">
          <Button>Primary</Button>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
        </Specimen>
        <Specimen label="Secondary">
          <Button variant="secondary">Secondary</Button>
          <Button variant="secondary" disabled>Disabled</Button>
        </Specimen>
        <Specimen label="Accent — carries dark text, white fails AA at 2.08:1">
          <Button variant="accent">Accent</Button>
        </Specimen>
        <Specimen label="Ghost and small">
          <Button variant="ghost">Ghost</Button>
          <Button size="small">Small</Button>
          <Button size="small" variant="ghost">Small ghost</Button>
        </Specimen>
      </Section>

      <Section title="Form controls" note="Label, hint and error are wired through aria-describedby.">
        <PreviewControls />
      </Section>

      <Section title="Confidence" note="Prompt §9. The vocabulary is a data contract, not a label.">
        <Specimen label="All three values" wide>
          {CONFIDENCE_VALUES.map((value) => (
            <ConfidenceBadge key={value} confidence={value} />
          ))}
        </Specimen>
      </Section>

      <Section title="Reasoning and follow-up" note="The 'why' affordance, and the cross-feature seams.">
        <Specimen label="Collapsed" wide>
          <div className={styles.stack}>
            <ReasoningPanel reasoning="Because this follows from the definition, and the second step is where most people slip." />
          </div>
        </Specimen>
        <Specimen label="Open by default, used after a 'not quite'" wide>
          <div className={styles.stack}>
            <ReasoningPanel defaultOpen reasoning="Because the smaller case makes the overlapping subproblem visible." />
          </div>
        </Specimen>
        <Specimen label="Follow-up offer" wide>
          <div className={styles.stack}>
            <FollowUpPrompt offer={{ label: 'Want me to quiz you on Recursion?', action: 'quiz', topic: 'Recursion' }} />
            <FollowUpPrompt offer={{ label: 'Should I add this to your plan?', action: 'plan', topic: 'Recursion' }} />
          </div>
        </Specimen>
      </Section>

      <Section
        title="AI response states"
        note="All four outcomes the prompt requires. Only the answer is ever persisted."
      >
        {responses.map((testCase) => (
          <Specimen key={testCase.title} label={`${testCase.title} — ${testCase.note}`} wide>
            <div className={styles.stack}>
              <AIResponse result={testCase.result} />
            </div>
          </Specimen>
        ))}
      </Section>

      <Section title="Metrics" note="The number is always text; the meter is a second encoding.">
        <Specimen label="With a meter" wide>
          <div className={styles.stack}>
            <StatTile icon="check" tone="positive" label="Topics completed" value={3} total={4} caption="Across the topics you are tracking" />
          </div>
        </Specimen>
        <Specimen label="Bare count" wide>
          <div className={styles.stack}>
            <StatTile icon="flame" tone="brand" label="Study streak" value={4} suffix="days" caption="Consecutive days with study activity" />
          </div>
        </Specimen>
        <Specimen label="Zero state" wide>
          <div className={styles.stack}>
            <StatTile icon="target" tone="accent" label="Marked as understood" value={0} total={0} caption="No checkpoints answered yet" />
          </div>
        </Specimen>
      </Section>

      <Section title="Surfaces" note="Card, hero, and the feedback states.">
        <Specimen label="Card" wide>
          <div className={styles.stack}>
            <Card title="A card" action={<span className={styles.label}>action slot</span>}>
              Body content.
            </Card>
          </div>
        </Specimen>
        <Specimen label="Hero" wide>
          <div className={styles.stack}>
            <Hero
              eyebrow="Next in your plan"
              greeting="Good morning, Sarah"
              detail="Recursion in Algorithms, 45 minutes."
              primary={{ href: '/assistant', label: 'Work on Recursion' }}
              secondary={{ href: '/planner', label: 'See my plan' }}
            />
          </div>
        </Specimen>
        <Specimen label="Toasts" wide>
          <div className={styles.stack}>
            <Toast tone="info" message="Saved." />
            <Toast tone="success" message="Your plan is now active." />
            <Toast tone="caution" message="Could not reach the assistant." />
          </div>
        </Specimen>
        <Specimen label="Spinners">
          <LoadingSpinner />
          <LoadingSpinner size="small" />
        </Specimen>
      </Section>

      <Section title="Loading states" note="What a route shows while it renders.">
        <Specimen label="Hero, tiles and card skeletons" wide>
          <div className={styles.stack}>
            <SkeletonHero />
            <SkeletonTiles count={3} />
            <SkeletonCard height="8rem" />
          </div>
        </Specimen>
      </Section>

      <Section title="Icons" note="Inline SVG, inheriting currentColor so they follow the role tokens.">
        <Specimen label="Full set" wide>
          {ICONS.map((name) => (
            <span key={name} title={name} style={{ display: 'grid', placeItems: 'center', gap: 'var(--spacing-xs)' }}>
              <Icon name={name} size={22} />
              <span className={styles.label}>{name}</span>
            </span>
          ))}
        </Specimen>
      </Section>
    </main>
  );
}
