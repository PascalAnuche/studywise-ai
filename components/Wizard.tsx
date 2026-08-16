'use client';

import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { Icon } from './Icon';
import styles from './Wizard.module.css';

/**
 * The frame for a multi-step flow, shared by the study-plan and quiz journeys.
 *
 * Two things it owns that are easy to leave out and hard to add back:
 *
 * 1. **Focus moves to the new step's heading.** Without it, advancing a step
 *    leaves focus on a button that no longer exists and a keyboard user is
 *    dropped at the top of the document.
 * 2. **The step change is announced.** The progress bar is invisible to a
 *    screen reader, so the count is live text.
 */
export interface WizardProps {
  step: number;
  total: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  note?: ReactNode;
  actions: ReactNode;
}

export function Wizard({ step, total, title, subtitle, children, note, actions }: WizardProps) {
  const headingId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    // Not on mount: the dialog has already placed focus, and stealing it here
    // would skip past whatever opened first.
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const percent = Math.round((step / total) * 100);

  return (
    <div className={styles.wizard}>
      <div className={styles.head}>
        <div className={styles.progressRow}>
          <span aria-live="polite">
            Step {step} of {total}
          </span>
          <span>{percent}%</span>
        </div>
        <span
          className={styles.track}
          role="progressbar"
          aria-valuenow={step}
          aria-valuemin={1}
          aria-valuemax={total}
          aria-label="Progress through this flow"
        >
          <span className={styles.bar} style={{ width: `${percent}%` }} />
        </span>

        <div>
          {/* tabIndex -1 so focus can be moved here without adding a tab stop. */}
          <h3 className={styles.title} id={headingId} ref={headingRef} tabIndex={-1}>
            {title}
          </h3>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      </div>

      <div className={styles.body}>{children}</div>

      <div className={styles.footer}>
        <span className={styles.footerNote}>{note}</span>
        <div className={styles.footerActions}>{actions}</div>
      </div>
    </div>
  );
}

/**
 * A single-choice list.
 *
 * Radios rather than buttons, so arrow keys move between options and the group
 * is announced as one control with a position — which a row of buttons is not.
 */
export function OptionRadios<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
}: {
  name: string;
  legend: string;
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className={styles.options}>
      <legend className="visually-hidden">{legend}</legend>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <label
            key={option.value}
            className={`${styles.option} ${selected ? styles.optionSelected : ''}`.trim()}
          >
            <input
              type="radio"
              className="visually-hidden"
              name={name}
              value={option.value}
              checked={selected}
              onChange={() => onChange(option.value)}
            />
            <span className={styles.optionLabel}>{option.label}</span>
            <span className={`${styles.optionMark} ${styles.markRadio}`} aria-hidden="true">
              <Icon name="check" size={14} />
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}

/** A multi-choice list. Same row target and same tick as the radio version. */
export function OptionChecks({
  legend,
  options,
  values,
  onToggle,
}: {
  legend: string;
  options: { value: string; label: string }[];
  values: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <fieldset className={styles.options}>
      <legend className="visually-hidden">{legend}</legend>
      {options.map((option) => {
        const selected = values.includes(option.value);
        return (
          <label
            key={option.value}
            className={`${styles.option} ${selected ? styles.optionSelected : ''}`.trim()}
          >
            <input
              type="checkbox"
              className="visually-hidden"
              checked={selected}
              onChange={() => onToggle(option.value)}
            />
            <span className={styles.optionLabel}>{option.label}</span>
            <span className={`${styles.optionMark} ${styles.markCheck}`} aria-hidden="true">
              <Icon name="check" size={14} />
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}

/**
 * The "AI is working" step.
 *
 * The checklist is real progress, not decoration: each line ticks as its stage
 * completes, so a slow request shows which stage it is on rather than a spinner
 * that says nothing.
 */
export function GeneratingStep({
  percent,
  stages,
  done,
}: {
  percent: number;
  stages: string[];
  done: number;
}) {
  return (
    <div className={styles.generating}>
      <ul className={styles.steps}>
        {stages.map((stage, index) => (
          <li
            key={stage}
            className={`${styles.stepRow} ${index < done ? styles.stepDone : ''}`.trim()}
          >
            <span className={styles.stepMark} aria-hidden="true">
              <Icon name="check" size={14} />
            </span>
            {stage}
            <span className="visually-hidden">{index < done ? ' — done' : ' — in progress'}</span>
          </li>
        ))}
      </ul>
      <span className={styles.percent} aria-live="polite">
        {percent}%
      </span>
    </div>
  );
}

/** A confirmation or end state. */
export function DoneStep({
  title,
  text,
  icon = 'check',
}: {
  title: string;
  text: string;
  icon?: 'check' | 'sparkle';
}) {
  return (
    <div className={styles.done}>
      <span className={styles.doneMark} aria-hidden="true">
        <Icon name={icon} size={28} />
      </span>
      <h4 className={styles.doneTitle}>{title}</h4>
      <p className={styles.doneText}>{text}</p>
    </div>
  );
}
