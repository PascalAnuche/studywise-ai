import type {
  AiProvider,
  AssistantResult,
  PlanInput,
  PlannerResult,
  ProviderRequest,
  QuizGenerationResult,
  QuizInput,
  StudentContext,
} from './types';
import { MockProvider } from './providers/mock';
import { MODE_INSTRUCTIONS, renderContext } from './prompts/modes';
import { HIGH_STAKES_ADDENDUM, SYSTEM_PROMPT, isHighStakes } from './prompts/system';

/**
 * The AI adapter. Nothing outside this folder imports a provider SDK, so
 * changing provider is a change here and nowhere else (ARCHITECTURE.md).
 *
 * One entry point per mode rather than one call taking a mode string. Prompt
 * section 10 requires mode to come from the calling route and never be inferred
 * from content; separate functions make that structural instead of a convention,
 * and let each mode return its own shape.
 */

function selectProvider(): AiProvider {
  const configured = process.env.AI_PROVIDER?.trim().toLowerCase();

  switch (configured) {
    case 'mock':
    case '':
    case undefined:
      // No provider chosen yet, see AGENTS.md Open Items. The mock is complete
      // enough to build and test every path against.
      return new MockProvider();
    default:
      throw new Error(
        `AI_PROVIDER "${configured}" is not implemented. Add it under lib/ai/providers and register it here. See AGENTS.md Open Items.`
      );
  }
}

let provider: AiProvider | null = null;

export function getProvider(): AiProvider {
  if (!provider) provider = selectProvider();
  return provider;
}

/** Test seam, so integration tests can inject a provider without env juggling. */
export function setProvider(next: AiProvider | null): void {
  provider = next;
}

function buildRequest(
  mode: ProviderRequest['mode'],
  context: StudentContext,
  userMessage: string,
  extra: Partial<ProviderRequest> = {}
): ProviderRequest {
  const systemPrompt = [
    SYSTEM_PROMPT,
    isHighStakes(context.discipline) ? HIGH_STAKES_ADDENDUM : '',
    MODE_INSTRUCTIONS[mode],
    renderContext(context),
  ]
    .filter(Boolean)
    .join('\n\n');

  return { mode, systemPrompt, userMessage, context, history: [], ...extra };
}

/** Explain mode — the Assistant routes. */
export async function runExplain(options: {
  userMessage: string;
  context: StudentContext;
  history?: ProviderRequest['history'];
}): Promise<AssistantResult> {
  const request = buildRequest('explain', options.context, options.userMessage, {
    history: options.history ?? [],
  });
  return getProvider().explain(request);
}

/** Plan mode — the Planner routes. Structured inputs only, per PRD 7.2. */
export async function runPlan(options: {
  input: PlanInput;
  context: StudentContext;
}): Promise<PlannerResult> {
  const summary = `Build a ${options.input.subject} study plan covering ${options.input.topics.join(', ')} at ${options.input.frequency}.`;
  const request = buildRequest('plan', options.context, summary, { planInput: options.input });
  return getProvider().plan(request);
}

/** Quiz mode — the Practice routes. Difficulty is an input, never a hint. */
export async function runQuiz(options: {
  input: QuizInput;
  context: StudentContext;
}): Promise<QuizGenerationResult> {
  const target = options.input.topic ?? options.input.subject;
  const summary = `Write ${options.input.questionCount} ${options.input.difficulty} questions on ${target}.`;
  const request = buildRequest('quiz', options.context, summary, { quizInput: options.input });
  return getProvider().quiz(request);
}

export type {
  AssistantResult,
  AsideResult,
  Difficulty,
  Mode,
  PlanInput,
  PlanSession,
  PlannerResult,
  QuizGenerationResult,
  QuizInput,
  QuizQuestionDraft,
  StudentContext,
} from './types';
export { DIFFICULTIES, isAside, isDifficulty, isPersistable } from './types';
