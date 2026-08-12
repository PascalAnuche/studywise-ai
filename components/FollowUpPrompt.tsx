import Link from 'next/link';
import type { FollowUpOffer } from '@/lib/ai/types';
import styles from './FollowUpPrompt.module.css';

/**
 * Prompt section 4: "a follow-up prompt is offered when it would deepen
 * understanding". These are the cross-feature seams, an Explain-mode answer
 * hands off into Quiz or Planner, which is what stops the four features feeling
 * like four separate apps (PRD section 3, "rely less on separate apps").
 *
 * A link rather than a handler, so this renders on the server and the
 * destination is a real, shareable URL.
 */
const DESTINATION: Record<FollowUpOffer['action'], (topic: string) => string> = {
  quiz: (topic) => `/practice?topic=${encodeURIComponent(topic)}`,
  plan: (topic) => `/planner?topic=${encodeURIComponent(topic)}`,
};

const ACTION_LABEL: Record<FollowUpOffer['action'], string> = {
  quiz: 'Start a quiz',
  plan: 'Add to plan',
};

export interface FollowUpPromptProps {
  offer: FollowUpOffer;
}

export function FollowUpPrompt({ offer }: FollowUpPromptProps) {
  return (
    <div className={styles.prompt}>
      <span className={styles.label}>{offer.label}</span>
      <Link className={styles.action} href={DESTINATION[offer.action](offer.topic)}>
        {ACTION_LABEL[offer.action]}
      </Link>
    </div>
  );
}
