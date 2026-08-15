import 'server-only';
import { batch, nowIso, queryAll, queryOne, run } from './client';
import { extendStreak, touchTopic } from './mutations';
import type { Difficulty, QuizQuestionDraft } from '@/lib/ai/types';
import type { Quiz, QuizQuestion, Recommendation } from './types';

export interface QuizWithQuestions extends Quiz {
  questions: QuizQuestion[];
}

export interface QuizQuestionDto {
  id: number;
  order: number;
  question: string;
  options: string[];
  studentAnswer: string | null;
  /** Withheld until the quiz is submitted, see toQuizDto. */
  correctAnswer: string | null;
  reasoning: string | null;
  isCorrect: boolean | null;
  explanationId: number | null;
}

export interface QuizDto {
  id: number;
  subject: string;
  topic: string | null;
  difficulty: string;
  score: number | null;
  completedAt: string | null;
  questions: QuizQuestionDto[];
}

function parseOptions(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

/**
 * Row shape to wire shape, camelCase per .agents/rules/CODE_STYLE.md.
 *
 * Correct answers and their reasoning are withheld until the quiz is submitted.
 * Sending them with the questions would put the answer key in the browser, and
 * "take a quiz" stops meaning anything.
 */
export function toQuizDto(quiz: QuizWithQuestions): QuizDto {
  const submitted = quiz.completed_at !== null;

  return {
    id: quiz.id,
    subject: quiz.subject,
    topic: quiz.topic,
    difficulty: quiz.difficulty,
    score: quiz.score,
    completedAt: quiz.completed_at,
    questions: quiz.questions.map((question, index) => ({
      id: question.id,
      order: index + 1,
      question: question.question_text,
      options: parseOptions(question.options),
      studentAnswer: question.student_answer,
      correctAnswer: submitted ? question.correct_answer : null,
      reasoning: submitted ? question.reasoning : null,
      isCorrect: question.is_correct === null ? null : question.is_correct === 1,
      explanationId: question.explanation_id,
    })),
  };
}

export async function getQuiz(studentId: number, quizId: number): Promise<QuizWithQuestions | undefined> {
  const quiz = await queryOne<Quiz>(
    'SELECT * FROM quizzes WHERE id = ? AND student_id = ?',
    quizId,
    studentId
  );
  if (!quiz) return undefined;

  const questions = await queryAll<QuizQuestion>(
    'SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY id',
    quizId
  );

  return { ...quiz, questions };
}

export async function listQuizzes(studentId: number, limit = 10): Promise<Quiz[]> {
  return await queryAll<Quiz>(
    'SELECT * FROM quizzes WHERE student_id = ? ORDER BY created_at DESC LIMIT ?',
    studentId,
    limit
  );
}

export async function insertQuiz(input: {
  studentId: number;
  subject: string;
  topic: string | null;
  difficulty: Difficulty;
  questions: QuizQuestionDraft[];
}): Promise<QuizWithQuestions> {
  const stamp = nowIso();

  const quiz = await queryOne<Quiz>(
    `INSERT INTO quizzes (student_id, subject, topic, difficulty, score, completed_at, created_at)
     VALUES (?, ?, ?, ?, NULL, NULL, ?)
     RETURNING *`,
    input.studentId,
    input.subject,
    input.topic,
    input.difficulty,
    stamp
  );

  if (!quiz) throw new Error('Failed to insert quiz');

  await batch(
    input.questions.map((question) => ({
      sql: `INSERT INTO quiz_questions
       (quiz_id, question_text, options, correct_answer, reasoning, student_answer, is_correct, explanation_id, created_at)
     VALUES (?, ?, ?, ?, ?, NULL, NULL, NULL, ?)`,
      args: [
        quiz.id,
        question.question,
        JSON.stringify(question.options),
        question.correctAnswer,
        question.reasoning,
        stamp,
      ],
    }))
  );

  const saved = await getQuiz(input.studentId, quiz.id);
  if (!saved) throw new Error('Quiz vanished immediately after insert');
  return saved;
}

/**
 * PRD 7.3's "save questions" step, read as saving work in progress.
 * Scores nothing and reveals nothing. Assumption, see AGENTS.md.
 */
export async function saveAnswers(
  studentId: number,
  quizId: number,
  answers: { questionId: number; studentAnswer: string }[]
): Promise<boolean> {
  const quiz = await getQuiz(studentId, quizId);
  if (!quiz || quiz.completed_at) return false;

  const valid = new Set(quiz.questions.map((question) => question.id));

  await batch(
    answers
      .filter((answer) => valid.has(answer.questionId))
      .map((answer) => ({
        sql: 'UPDATE quiz_questions SET student_answer = ? WHERE id = ? AND quiz_id = ?',
        args: [answer.studentAnswer, answer.questionId, quizId],
      }))
  );

  return true;
}

export interface SubmissionOutcome {
  quiz: QuizWithQuestions;
  score: number;
  missedTopics: string[];
  streak: number;
}

/**
 * Marks the quiz, links what it can back to saved explanations, and feeds
 * progress. PRD 7.3 requires results to flow into progress tracking, and that
 * incorrect answers link back to a related explanation where possible, which is
 * the loop between practising and understanding.
 */
export async function submitQuiz(
  studentId: number,
  quizId: number,
  answers: { questionId: number; studentAnswer: string }[]
): Promise<SubmissionOutcome | undefined> {
  const existing = await getQuiz(studentId, quizId);
  if (!existing || existing.completed_at) return undefined;

  const submitted = new Map(answers.map((a) => [a.questionId, a.studentAnswer]));
  const updates: { sql: string; args: unknown[] }[] = [];

  let correctCount = 0;

  for (const question of existing.questions) {
    const given = submitted.get(question.id) ?? question.student_answer;
    const isCorrect = given !== null && given === question.correct_answer;
    if (isCorrect) correctCount++;

    // Only look for a link when the answer was wrong: the point is to send a
    // student to the explanation covering what they just missed.
    const explanationId = isCorrect
      ? null
      : ((await findRelatedExplanation(studentId, existing.topic ?? existing.subject))?.id ?? null);

    updates.push({
      sql: `UPDATE quiz_questions
        SET student_answer = ?, is_correct = ?, explanation_id = ?
      WHERE id = ? AND quiz_id = ?`,
      args: [given, isCorrect ? 1 : 0, explanationId, question.id, quizId],
    });
  }

  const score = existing.questions.length === 0 ? 0 : correctCount / existing.questions.length;
  const stamp = nowIso();

  // Marking every answer and closing the quiz is one unit: a quiz recorded as
  // complete with only half its answers saved would be scored against rows
  // that were never updated.
  await batch([
    ...updates,
    {
      sql: 'UPDATE quizzes SET score = ?, completed_at = ? WHERE id = ? AND student_id = ?',
      args: [score, stamp, quizId, studentId],
    },
  ]);

  const quiz = await getQuiz(studentId, quizId);
  if (!quiz) throw new Error('Quiz vanished immediately after submission');
  const missed = quiz.questions.filter((question) => question.is_correct === 0);
  const topic = quiz.topic ?? quiz.subject;

  await touchTopic(studentId, topic);
  await markWeakArea(studentId, topic, missed.length > 0);

  const streak = await extendStreak(studentId);
  const missedTopics = missed.length > 0 ? [topic] : [];

  if (missedTopics.length > 0) {
    await insertRecommendation({
      studentId,
      quizId,
      topic,
      reason: `${missed.length} of ${quiz.questions.length} questions on ${topic} were incorrect.`,
    });
  }

  return { quiz, score, missedTopics, streak };
}

/**
 * Finds a saved explanation covering a topic. Subject is stored free-text, so
 * this matches case-insensitively rather than requiring an exact string.
 */
async function findRelatedExplanation(studentId: number, topic: string) {
  return await queryOne<{ id: number }>(
    `SELECT id FROM explanations
      WHERE student_id = ? AND subject IS NOT NULL AND LOWER(subject) = LOWER(?)
      ORDER BY created_at DESC LIMIT 1`,
    studentId,
    topic
  );
}

async function markWeakArea(studentId: number, topic: string, weak: boolean): Promise<Promise<void>> {
  await run(
    `UPDATE progress SET is_weak_area = ?, updated_at = ? WHERE student_id = ? AND topic = ?`,
    weak ? 1 : 0,
    nowIso(),
    studentId,
    topic
  );
}

export async function insertRecommendation(input: {
  studentId: number;
  quizId: number | null;
  topic: string;
  reason: string;
}): Promise<void> {
  await run(
    `INSERT INTO recommendations (student_id, based_on_quiz_id, topic, reason, created_at)
       VALUES (?, ?, ?, ?, ?)`,
    input.studentId,
    input.quizId,
    input.topic,
    input.reason,
    nowIso()
  );
}

export async function getQuizRecommendations(studentId: number, quizId: number): Promise<Recommendation[]> {
  return await queryAll<Recommendation>(
    `SELECT * FROM recommendations
      WHERE student_id = ? AND based_on_quiz_id = ?
      ORDER BY created_at DESC`,
    studentId,
    quizId
  );
}
