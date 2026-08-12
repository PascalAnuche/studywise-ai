import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { getFollowUpsFor } from '@/lib/db/mutations';
import { getRecentExplanations } from '@/lib/db/queries';
import { getCurrentStudentId } from '@/lib/session';
import { relativeDay } from '@/lib/format';
import { AssistantRailPanels, type RailChat } from './components/AssistantRailPanels';
import { Conversation } from './components/Conversation';
import { NewChat } from './components/NewChat';
import styles from './assistant.module.css';

export const dynamic = 'force-dynamic';

/**
 * AI Study Assistant — flow 1, built to the approved design.
 *
 * The conversation on the left, and a rail on the right carrying a study tip,
 * chat history, saved explanations and popular topics.
 *
 * A "chat" is a saved explanation and its follow-ups. The schema already models
 * a thread that way, so nothing new is introduced here to reconcile later.
 */
function clockTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export default async function AssistantPage({
  searchParams,
}: {
  searchParams: Promise<{ chat?: string; q?: string }>;
}) {
  const { chat, q } = await searchParams;
  const studentId = getCurrentStudentId();

  const explanations = getRecentExplanations(studentId, 20);
  const followUpsById = getFollowUpsFor(explanations.map((explanation) => explanation.id));

  const requested = chat ? Number(chat) : NaN;
  const selected =
    explanations.find((explanation) => explanation.id === requested) ?? explanations[0] ?? null;

  const chats: RailChat[] = explanations.slice(0, 5).map((explanation) => ({
    id: explanation.id,
    title: explanation.question,
    when: relativeDay(explanation.created_at),
  }));

  // "Saved" is an explanation whose checkpoint the student answered: they
  // engaged with it rather than abandoning it. There is no separate save
  // action yet, which is tracked in AGENTS.md.
  const saved: RailChat[] = explanations
    .filter((explanation) => explanation.understood !== null)
    .slice(0, 3)
    .map((explanation) => ({
      id: explanation.id,
      title: explanation.subject ?? explanation.question,
      when: relativeDay(explanation.created_at),
    }));

  return (
    <div className={styles.layout}>
      <main id="main" className={styles.thread}>
        <header className={styles.header}>
          <div className={styles.identity}>
            <span className={styles.avatar} aria-hidden="true">
              <Icon name="sparkle" size={22} />
            </span>
            <div>
              <h1 className={styles.title}>AI Assistant</h1>
              <p className={styles.subtitle}>Your smart study companion</p>
            </div>
          </div>

          <Link href="/assistant?chat=new" className={styles.newChat}>
            <Icon name="plus" size={16} />
            New Chat
          </Link>
        </header>

        {selected && chat !== 'new' ? (
          <Conversation
            explanationId={selected.id}
            question={selected.question}
            answer={selected.answer}
            confidence={selected.confidence}
            understood={selected.understood === null ? null : selected.understood === 1}
            askedAt={clockTime(selected.created_at)}
            answeredAt={clockTime(selected.created_at)}
            followUps={(followUpsById.get(selected.id) ?? []).map((followUp) => ({
              id: followUp.id,
              question: followUp.question,
              answer: followUp.answer,
              confidence: followUp.confidence,
            }))}
          />
        ) : (
          <>
            <div className={styles.conversation}>
              <div className={styles.empty}>
                <span className={styles.emptyTitle}>Ask about something you&rsquo;re stuck on</span>
                <span className={styles.emptyBody}>
                  You&rsquo;ll get the answer, the reasoning behind it, and how confident it is, so
                  you can check it rather than take it on trust.
                </span>
              </div>
            </div>
            {/* Prefilled from the Home composer, which passes ?q= */}
            <NewChat initialQuestion={q ?? ''} />
            <p className={styles.disclaimer}>
              AI responses can make mistakes. Please verify important information.
            </p>
          </>
        )}
      </main>

      <aside className={styles.rail}>
        <AssistantRailPanels chats={chats} saved={saved} activeId={selected?.id ?? null} />
      </aside>
    </div>
  );
}
