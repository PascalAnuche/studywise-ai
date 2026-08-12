import Link from 'next/link';
import { getFollowUpsFor } from '@/lib/db/mutations';
import { getRecentExplanations } from '@/lib/db/queries';
import { getCurrentStudentId } from '@/lib/session';
import { MOCK_SOURCES } from '@/lib/mock';
import { ChatList, type ChatSummary } from './components/ChatList';
import { relativeDay } from '@/lib/format';
import { Conversation } from './components/Conversation';
import { NewChat } from './components/NewChat';
import { WhyPanel } from './components/WhyPanel';
import styles from './assistant.module.css';

export const dynamic = 'force-dynamic';

/**
 * AI Study Assistant — flow 1, built to the approved design.
 *
 * Three columns: recent conversations, the conversation itself, and the "why"
 * rail. DESIGN_SYSTEM.md calls the "why" affordance the biggest lever for
 * trust, so on this screen it gets a column rather than a collapsible.
 *
 * A "chat" is a saved explanation and its follow-ups. The schema already models
 * a thread that way, so nothing new is introduced here to reconcile later.
 */
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

  const chats: ChatSummary[] = explanations.map((explanation) => ({
    id: explanation.id,
    title: explanation.question,
    when: relativeDay(explanation.created_at),
  }));

  return (
    <div className={styles.layout}>
      <div className={styles.chats}>
        <ChatList chats={chats} activeId={selected?.id ?? null} />
      </div>

      <main id="main" className={styles.thread}>
        <header className={styles.header}>
          <h1 className={styles.title}>AI Assistant</h1>
        </header>

        {selected ? (
          <Conversation
            explanationId={selected.id}
            question={selected.question}
            answer={selected.answer}
            confidence={selected.confidence}
            understood={selected.understood === null ? null : selected.understood === 1}
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
                <Link href="/">Back to home</Link>
              </div>
            </div>
            {/* Prefilled from the Home composer, which passes ?q= */}
            <NewChat initialQuestion={q ?? ''} />
          </>
        )}
      </main>

      <div className={styles.why}>
        <WhyPanel
          reasoning={selected?.reasoning ?? null}
          confidence={selected?.confidence ?? null}
          sources={selected ? MOCK_SOURCES : []}
        />
      </div>
    </div>
  );
}
