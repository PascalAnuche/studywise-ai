import type { AssistantResult } from '@/lib/ai/types';
import { ConfidenceBadge } from './ConfidenceBadge';
import { FollowUpPrompt } from './FollowUpPrompt';
import { ReasoningPanel } from './ReasoningPanel';
import styles from './AIResponse.module.css';

/**
 * The canonical renderer for anything the assistant says, in every feature.
 *
 * Prompt section 9 exists so the frontend has one predictable pattern to build
 * around rather than reasoning that shows up differently every time. This
 * component is that pattern. Assistant, Planner, Practice and Progress all
 * render assistant output through here; none of them re-implements the
 * answer / because / confidence shape or invents its own escalation styling.
 *
 * It handles all four outcomes in the AssistantResult union, so adding a fifth
 * is a compile error here rather than a shape silently rendering as nothing.
 *
 * Deliberately server-renderable: no state, no effects. The only interactive
 * parts are a native <details> and a <Link>.
 */
export interface AIResponseProps {
  result: AssistantResult;
  /**
   * Opens the reasoning by default. Pass true after a student says they did not
   * understand, when the "why" is the thing they actually need.
   */
  expandReasoning?: boolean;
}

export function AIResponse({ result, expandReasoning = false }: AIResponseProps) {
  switch (result.kind) {
    case 'answer':
      return (
        <div className={styles.response}>
          <p className={styles.answer}>{result.answer}</p>

          <div className={styles.meta}>
            <ConfidenceBadge confidence={result.confidence} />
          </div>

          <ReasoningPanel reasoning={result.reasoning} defaultOpen={expandReasoning} />

          {result.followUp && <FollowUpPrompt offer={result.followUp} />}
        </div>
      );

    // Section 7: one clarifying question, asked instead of guessing. No answer
    // and no confidence, so it must not borrow the answer's styling.
    case 'clarify':
      return (
        <div className={`${styles.aside} ${styles.clarify}`}>
          <span className={styles.asideLabel}>Quick check</span>
          <p className={styles.asideBody}>{result.question}</p>
        </div>
      );

    // Section 13. Not study content. Section 12 forbids retaining this as part
    // of the study record, which is why it is never persisted, and why nothing
    // here offers a follow-up back into coursework.
    case 'escalation':
      return (
        <div className={`${styles.aside} ${styles.escalation}`} role="note">
          <p className={styles.asideBody}>{result.message}</p>
          {result.resources.length > 0 && (
            <ul className={styles.resources}>
              {result.resources.map((resource) => (
                <li key={resource}>{resource}</li>
              ))}
            </ul>
          )}
          <p className={styles.privacyNote}>
            This isn&rsquo;t saved to your study record.
          </p>
        </div>
      );

    // Section 5: declining to do the work wholesale. Says so in one sentence and
    // offers the nearest useful thing, rather than lecturing.
    case 'redirect':
      return (
        <div className={`${styles.aside} ${styles.redirect}`}>
          <p className={styles.asideBody}>{result.message}</p>
          <p className={styles.suggestion}>{result.suggestion}</p>
        </div>
      );
  }
}
