'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AIResponse } from '@/components/AIResponse';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Toast } from '@/components/Toast';
import type { AsideResult, Difficulty } from '@/lib/ai/types';
import type { QuizDto } from '@/lib/db/practice';
import { DifficultySelector } from './DifficultySelector';
import { QuizProgress } from './QuizProgress';
import { QuizQuestion } from './QuizQuestion';
import { RecommendationCard } from './RecommendationCard';
import { ResultsSummary } from './ResultsSummary';
import styles from './PracticeClient.module.css';

/**
 * Drives PRD 7.3's flow: choose subject and difficulty, take the quiz, submit,
 * review what was missed, act on the recommendations.
 *
 * Difficulty is chosen before generation, never after. Correct answers arrive
 * only with the submission response, so nothing in this component can reveal
 * them early.
 */
interface Recommendation {
  id: number;
  topic: string;
  reason: string;
}

export interface PracticeClientProps {
  /** Prefilled from a recommendation or follow-up link elsewhere in the app. */
  initialTopic?: string;
}

export function PracticeClient({ initialTopic = '' }: PracticeClientProps) {
  const router = useRouter();
  const [subject, setSubject] = useState(initialTopic ? 'Algorithms' : '');
  const [topic, setTopic] = useState(initialTopic);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  const [quiz, setQuiz] = useState<QuizDto | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [aside, setAside] = useState<AsideResult | null>(null);

  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reviewing = quiz?.completedAt != null;
  const answeredCount = quiz ? quiz.questions.filter((q) => answers[q.id]).length : 0;

  async function send(path: string, method: 'POST' | 'PUT', body: unknown) {
    const response = await fetch(path, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      const message =
        data && typeof data === 'object' && 'error' in data
          ? String((data as { error: unknown }).error)
          : 'Something went wrong';
      throw new Error(message);
    }
    return (data ?? {}) as Record<string, unknown>;
  }

  async function generate() {
    setGenerating(true);
    setError(null);
    setAside(null);
    setRecommendations([]);
    try {
      const data = await send('/api/practice/generate', 'POST', {
        subject: subject.trim(),
        topic: topic.trim() || null,
        difficulty,
      });

      if (data.quizId === null) {
        setAside(data.result as AsideResult);
        setQuiz(null);
        return;
      }

      setQuiz(data.quiz as QuizDto);
      setAnswers({});
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not build a quiz');
    } finally {
      setGenerating(false);
    }
  }

  function choose(questionId: number, answer: string) {
    setAnswers((current) => ({ ...current, [questionId]: answer }));
  }

  /** PRD 7.3's "save questions" step: keeps work without scoring it. */
  async function saveProgress() {
    if (!quiz) return;
    setError(null);
    try {
      await send(`/api/practice/${quiz.id}/answers`, 'PUT', {
        answers: Object.entries(answers).map(([questionId, studentAnswer]) => ({
          questionId: Number(questionId),
          studentAnswer,
        })),
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save your answers');
    }
  }

  async function submit() {
    if (!quiz) return;
    setSubmitting(true);
    setError(null);
    try {
      const data = await send(`/api/practice/${quiz.id}/submit`, 'POST', {
        answers: Object.entries(answers).map(([questionId, studentAnswer]) => ({
          questionId: Number(questionId),
          studentAnswer,
        })),
      });

      setQuiz(data.quiz as QuizDto);
      setRecommendations((data.recommendations as Recommendation[]) ?? []);
      // Results feed progress and the streak, so the shell and dashboard are
      // now stale.
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not submit your quiz');
    } finally {
      setSubmitting(false);
    }
  }

  function startOver() {
    setQuiz(null);
    setAnswers({});
    setRecommendations([]);
    setAside(null);
  }

  return (
    <div className={styles.stack}>
      {!quiz && (
        <Card title="Set up a quiz">
          <div className={styles.setup}>
            <div className={styles.row}>
              <Input
                label="Subject"
                value={subject}
                placeholder="Algorithms"
                onChange={(event) => setSubject(event.target.value)}
              />
              <Input
                label="Topic"
                value={topic}
                placeholder="Recursion"
                hint="Optional. Narrows the questions."
                onChange={(event) => setTopic(event.target.value)}
              />
            </div>

            {/* Before generation, per PRD 7.3. */}
            <DifficultySelector value={difficulty} disabled={generating} onChange={setDifficulty} />

            <div className={styles.actions}>
              <Button loading={generating} disabled={!subject.trim()} onClick={generate}>
                Generate quiz
              </Button>
              <span className={styles.note}>
                {subject.trim() ? '5 questions.' : 'Add a subject to start.'}
              </span>
            </div>
          </div>
        </Card>
      )}

      {aside && (
        <Card title="Before we start">
          <AIResponse result={aside} />
        </Card>
      )}

      {quiz && !reviewing && (
        <Card title={`${quiz.topic ?? quiz.subject} · ${quiz.difficulty}`}>
          <QuizProgress answered={answeredCount} total={quiz.questions.length} />
          <ul className={styles.questions} style={{ marginTop: 'var(--spacing-xl)' }}>
            {quiz.questions.map((question) => (
              <QuizQuestion
                key={question.id}
                question={{ ...question, studentAnswer: answers[question.id] ?? null }}
                reviewing={false}
                onAnswer={choose}
              />
            ))}
          </ul>

          <div className={styles.footer}>
            <Button
              loading={submitting}
              disabled={answeredCount < quiz.questions.length}
              onClick={submit}
            >
              Submit quiz
            </Button>
            <Button variant="ghost" disabled={submitting} onClick={saveProgress}>
              Save for later
            </Button>
            <span className={styles.note}>
              {answeredCount < quiz.questions.length
                ? `${quiz.questions.length - answeredCount} left to answer.`
                : 'All answered.'}
            </span>
          </div>
        </Card>
      )}

      {quiz && reviewing && (
        <>
          <Card title="Results">
            <ResultsSummary
              correct={quiz.questions.filter((q) => q.isCorrect).length}
              total={quiz.questions.length}
              topic={quiz.topic ?? quiz.subject}
            />
          </Card>

          {recommendations.length > 0 && (
            <Card title="What to do next">
              <div className={styles.recommendations}>
                {recommendations.map((recommendation) => (
                  <RecommendationCard
                    key={recommendation.id}
                    topic={recommendation.topic}
                    reason={recommendation.reason}
                  />
                ))}
              </div>
            </Card>
          )}

          <Card
            title="Review"
            action={
              <Button size="small" variant="ghost" onClick={startOver}>
                New quiz
              </Button>
            }
          >
            <ul className={styles.questions}>
              {quiz.questions.map((question) => (
                <QuizQuestion
                  key={question.id}
                  question={question}
                  reviewing
                  onAnswer={() => undefined}
                />
              ))}
            </ul>
          </Card>
        </>
      )}

      {error && <Toast tone="caution" message={error} onDismiss={() => setError(null)} />}
    </div>
  );
}
