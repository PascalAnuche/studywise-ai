'use client';

import Link from 'next/link';
import { ReasoningPanel } from '@/components/ReasoningPanel';
import type { QuizQuestionDto } from '@/lib/db/practice';
import styles from './QuizQuestion.module.css';

/**
 * One question, in either of two states.
 *
 * Taking: options are selectable and nothing is revealed. The API withholds
 * correct answers until submission, so there is nothing here to leak.
 *
 * Reviewing: the student's choice and the correct answer are both marked, and
 * the because line explains why. Prompt section 10 requires marking to teach,
 * not just score, and PRD 7.3 requires incorrect answers to link back to a
 * related explanation where one exists, closing the loop with the Assistant.
 */
export interface QuizQuestionProps {
  question: QuizQuestionDto;
  reviewing: boolean;
  onAnswer: (questionId: number, answer: string) => void;
}

export function QuizQuestion({ question, reviewing, onAnswer }: QuizQuestionProps) {
  return (
    <li className={styles.question}>
      <div className={styles.header}>
        <span className={styles.order}>Question {question.order}</span>
      </div>
      <p className={styles.prompt}>{question.question}</p>

      <div className={styles.options} role={reviewing ? undefined : 'group'}>
        {question.options.map((option) => {
          const chosen = question.studentAnswer === option;
          const isAnswer = reviewing && question.correctAnswer === option;
          const wrongChoice = reviewing && chosen && !isAnswer;

          const classes = [
            styles.option,
            reviewing ? styles.locked : '',
            !reviewing && chosen ? styles.chosen : '',
            isAnswer ? styles.correct : '',
            wrongChoice ? styles.incorrect : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <label key={option} className={classes}>
              <input
                className={styles.radio}
                type="radio"
                name={`question-${question.id}`}
                value={option}
                checked={chosen}
                disabled={reviewing}
                onChange={() => onAnswer(question.id, option)}
              />
              <span>{option}</span>

              {/* Text as well as colour, so the marking survives greyscale. */}
              {isAnswer && (
                <span className={`${styles.marker} ${styles.correctMarker}`}>Correct answer</span>
              )}
              {wrongChoice && (
                <span className={`${styles.marker} ${styles.incorrectMarker}`}>Your answer</span>
              )}
            </label>
          );
        })}
      </div>

      {reviewing && question.reasoning && (
        <div className={styles.review}>
          <ReasoningPanel
            reasoning={question.reasoning}
            // Open by default when they got it wrong: the "why" is the whole
            // point of reviewing, and making them click for it buries it.
            defaultOpen={question.isCorrect === false}
          >
            {question.explanationId && (
              <Link className={styles.link} href={`/assistant#explanation-${question.explanationId}`}>
                You saved an explanation covering this
              </Link>
            )}
          </ReasoningPanel>
        </div>
      )}
    </li>
  );
}
