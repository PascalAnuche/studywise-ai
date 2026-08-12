import type {
  AiProvider,
  AssistantResult,
  AsideResult,
  PlanSession,
  PlannerResult,
  ProviderRequest,
  QuizGenerationResult,
  QuizQuestionDraft,
} from '@/lib/ai/types';
import { isHighStakes } from '@/lib/ai/prompts/system';

/**
 * Deterministic provider used for development and integration tests. Not a
 * stub: it produces every response shape so each path through the UI can be
 * exercised before a real provider is chosen (AGENTS.md open items).
 *
 * Trigger an aside by what the text contains:
 *   "burnout", "stressed", "overwhelmed", "can't cope"   -> escalation
 *   "write my essay", "do my assignment", "answer for me" -> redirect
 *   fewer than three words, or ending in a bare pronoun   -> clarify
 */

const WELLBEING = ['burnout', 'burnt out', 'stressed', 'overwhelmed', "can't cope", 'cant cope'];
const WHOLESALE = ['write my essay', 'do my assignment', 'answer for me', 'write it for me'];

/** Stable pseudo-random so the same input always yields the same response. */
function hash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (Math.imul(31, h) + input.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * Section 13 applies in every mode, so this check runs for planning input as
 * much as for a question. Exam-period planning is exactly when a student is
 * most likely to say they're drowning.
 */
function detectAside(text: string): AsideResult | null {
  const lower = text.toLowerCase();

  if (WELLBEING.some((phrase) => lower.includes(phrase))) {
    return {
      kind: 'escalation',
      message:
        "That sounds like a lot to carry, and it matters more than the coursework right now. I'm not the right support for this, but people at your university are.",
      resources: [
        'Your university student support or counselling service',
        'Your personal tutor or course leader',
        'Someone you trust outside of study',
      ],
    };
  }

  if (WHOLESALE.some((phrase) => lower.includes(phrase))) {
    return {
      kind: 'redirect',
      message: "I won't write this one for you, that's the part where the learning actually happens.",
      suggestion:
        "Tell me the argument you want to make and I'll help you structure it, or paste a draft paragraph and I'll tell you where the reasoning is thin.",
    };
  }

  return null;
}

/** "3x/week" -> 3. Falls back to 2 rather than inventing an intense schedule. */
function sessionsPerWeek(frequency: string): number {
  const match = /(\d+)\s*x?\s*(?:per|\/)?\s*week/i.exec(frequency);
  const parsed = match ? Number(match[1]) : NaN;
  return Number.isFinite(parsed) && parsed > 0 && parsed <= 14 ? parsed : 2;
}

export class MockProvider implements AiProvider {
  readonly name = 'mock';

  async explain(request: ProviderRequest): Promise<AssistantResult> {
    const question = request.userMessage.trim();

    const aside = detectAside(question);
    if (aside) return aside;

    const words = question.replace(/[?.!]/g, '').split(/\s+/).filter(Boolean);
    if (words.length < 3 || /\b(it|this|that|them)$/i.test(words.join(' '))) {
      return {
        kind: 'clarify',
        question: `Which part of ${request.context.currentTopics[0] ?? 'the topic'} do you want me to start with, the definition or how it's applied?`,
      };
    }

    const highStakes = isHighStakes(request.context.discipline);
    const confidences = highStakes
      ? (['worth verifying', 'worth verifying', 'one interpretation'] as const)
      : (['well-established', 'one interpretation', 'worth verifying'] as const);
    const confidence = confidences[hash(question) % confidences.length];

    const topic = request.context.currentTopics[0] ?? request.context.activePlans[0]?.subject ?? null;

    return {
      kind: 'answer',
      answer: `[mock:${request.mode}] Here's the short version of "${question}", broken into the steps that matter.`,
      reasoning: highStakes
        ? 'Because this is a high-stakes discipline, this is study support rather than professional guidance, check it against your course materials or a clinician.'
        : 'Because this follows from the definition, and the second step is where most people slip.',
      confidence,
      followUp: topic ? { label: `Want me to quiz you on ${topic}?`, action: 'quiz', topic } : null,
    };
  }

  async plan(request: ProviderRequest): Promise<PlannerResult> {
    const input = request.planInput;
    if (!input) throw new Error('plan mode requires planInput');

    const aside = detectAside([input.subject, ...input.goals, ...input.topics].join(' '));
    if (aside) return aside;

    if (input.topics.length === 0) {
      return {
        kind: 'clarify',
        question: `Which topics in ${input.subject} do you want the plan to cover?`,
      };
    }

    const perWeek = sessionsPerWeek(input.frequency);
    const gapDays = Math.max(1, Math.round(7 / perWeek));
    const start = input.startDate ? new Date(input.startDate) : null;

    // One session per listed topic, in the order given. Topics are never
    // invented and never dropped: the structured input is the source of truth.
    const sessions: PlanSession[] = input.topics.map((topic, index) => {
      const scheduled =
        start && !Number.isNaN(start.getTime())
          ? new Date(start.getTime() + index * gapDays * 864e5).toISOString().slice(0, 10)
          : null;

      const weak = request.context.weakAreas.includes(topic);

      return {
        order: index + 1,
        topic,
        focus: weak
          ? `Rework the parts that caught you out last time, then one practice pass.`
          : `Work through the core ideas, then check yourself on one example.`,
        durationMinutes: weak ? 60 : 45,
        scheduledFor: scheduled,
      };
    });

    const weakCount = sessions.filter((s) => request.context.weakAreas.includes(s.topic)).length;

    return {
      kind: 'plan' as const,
      sessions,
      reasoning:
        `Because you asked for ${perWeek}x a week, sessions sit about ${gapDays} day${gapDays === 1 ? '' : 's'} apart, in the order you listed the topics.` +
        (weakCount > 0
          ? ` ${weakCount} of them got a longer slot, since your quiz results show those need more room.`
          : ''),
    };
  }

  async quiz(request: ProviderRequest): Promise<QuizGenerationResult> {
    const input = request.quizInput;
    if (!input) throw new Error('quiz mode requires quizInput');

    const aside = detectAside(`${input.subject} ${input.topic ?? ''}`);
    if (aside) return aside;

    const subject = input.topic ?? input.subject;

    // Difficulty is an input, not a suggestion (PRD 7.3): it changes the
    // questions rather than being recorded and ignored.
    const framing: Record<typeof input.difficulty, string> = {
      easy: 'Recall',
      medium: 'Apply',
      hard: 'Evaluate',
    };

    const questions: QuizQuestionDraft[] = Array.from(
      { length: input.questionCount },
      (_, index): QuizQuestionDraft => {
        const n = index + 1;
        const correct = `The ${framing[input.difficulty].toLowerCase()} answer for point ${n}`;

        return {
          order: n,
          question: `[mock:${input.difficulty}] ${framing[input.difficulty]} question ${n} on ${subject}.`,
          // Every distractor is wrong for a stated reason rather than filler,
          // so reviewing a wrong answer still teaches something.
          options: [
            correct,
            `A common mix-up on ${subject}, right idea applied to the wrong case`,
            `True of a related topic, but not of ${subject}`,
            `Correct wording, wrong conclusion for point ${n}`,
          ],
          correctAnswer: correct,
          reasoning: `Because point ${n} of ${subject} turns on the distinction the other three options each miss in a different way.`,
        };
      }
    );

    return { kind: 'quiz', questions };
  }
}
