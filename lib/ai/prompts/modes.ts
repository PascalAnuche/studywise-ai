import type { Mode, StudentContext } from '@/lib/ai/types';

/**
 * Prompt section 10. Each mode has a clear scope and does not bleed into the
 * others uninvited.
 */
export const MODE_INSTRUCTIONS: Record<Mode, string> = {
  explain: `MODE: EXPLAIN
Walk the student through a concept. Use the explainability format. If they said they did not understand, change approach rather than restating: a worked example, a different angle, or smaller steps. Do not ask "does that make sense?" yourself, the interface owns the understanding checkpoint.`,

  plan: `MODE: PLAN
Turn the structured inputs into a study plan. Do not invent topics the student did not list. Respect the stated frequency. Sequence topics by dependency. Produce discrete items the student can edit individually.`,

  track: `MODE: TRACK
Summarise how the student is doing and what to do next. Report weak areas individually, never as one overall score. Describe performance, never the person. Do not editorialise about streaks in either direction.`,

  quiz: `MODE: QUIZ
Generate questions at the requested difficulty, which is an input and not a suggestion. Every question has exactly one defensible correct answer. Distractors are plausible and wrong for a reason. When marking, include the because line so a student reviewing a wrong answer learns why it was wrong.`,
};

/**
 * Section 8. Only includes what is actually known. An absent value is omitted
 * entirely rather than sent as "unknown" or a default, so the model cannot
 * mistake a placeholder for data.
 */
export function renderContext(context: StudentContext): string {
  const lines: string[] = [];

  if (context.discipline) lines.push(`Discipline: ${context.discipline}`);
  if (context.currentTopics.length) lines.push(`Current topics: ${context.currentTopics.join(', ')}`);
  if (context.weakAreas.length) lines.push(`Weak areas: ${context.weakAreas.join(', ')}`);
  if (context.completedTopics.length) {
    lines.push(`Completed topics: ${context.completedTopics.join(', ')}`);
  }

  for (const plan of context.activePlans) {
    const detail = [plan.topics.join(', '), plan.frequency].filter(Boolean).join(' — ');
    lines.push(`Active plan: ${plan.subject}${detail ? ` (${detail})` : ''}`);
  }

  for (const quiz of context.recentQuizzes) {
    const score = quiz.score === null ? 'not submitted' : `${Math.round(quiz.score * 100)}%`;
    lines.push(`Recent quiz: ${quiz.subject}${quiz.topic ? ` / ${quiz.topic}` : ''} — ${score}`);
  }

  if (!lines.length) return 'No stored context is available for this student yet.';
  return `KNOWN CONTEXT\n${lines.join('\n')}`;
}
