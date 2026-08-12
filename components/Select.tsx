'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Icon } from './Icon';
import { placementFor } from './popover';
import fieldStyles from './Field.module.css';
import styles from './Select.module.css';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label: string;
  options: SelectOption[];
  value: string;
  /**
   * The chosen value. Not an event: there is no native `<select>` underneath
   * any more, so `event.target.value` would be a lie about where it came from.
   */
  onValueChange: (value: string) => void;
  hint?: string;
  /** Submits the value with a surrounding form, via a hidden input. */
  name?: string;
  disabled?: boolean;
  className?: string;
  /**
   * Hides the label visually but keeps it for assistive tech. For places where
   * the surroundings already say what the control is — the month and year
   * pickers in a calendar header, say.
   */
  labelHidden?: boolean;
}

export function Select({
  label,
  options,
  value,
  onValueChange,
  hint,
  name,
  disabled,
  className,
  labelHidden,
}: SelectProps) {
  const id = useId();
  const listId = `${id}-list`;
  const hintId = `${id}-hint`;

  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const selectedIndex = options.findIndex((option) => option.value === value);
  // Which option the keyboard is on. Opens on the current value, or the first.
  const [activeIndex, setActiveIndex] = useState(Math.max(selectedIndex, 0));

  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  // Buffer for type-to-select, cleared after a pause.
  const typed = useRef({ text: '', at: 0 });

  const close = useCallback((focusTrigger: boolean) => {
    setOpen(false);
    if (focusTrigger) triggerRef.current?.focus();
  }, []);

  // Close on a click anywhere else. Pointerdown rather than click, so the list
  // is gone before the click lands on whatever is underneath it.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  // Keep the active option in view when arrowing past the edge of the scroll box.
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex]);

  const openAt = (index: number) => {
    /* 15rem list plus its border, matching the max-height in the stylesheet. */
    setDropUp(placementFor(triggerRef.current, 242).dropUp);
    setActiveIndex(Math.max(0, Math.min(index, options.length - 1)));
    setOpen(true);
  };

  const commit = (index: number) => {
    const option = options[index];
    if (option) onValueChange(option.value);
    close(true);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!open) openAt(selectedIndex < 0 ? 0 : selectedIndex);
        else setActiveIndex((i) => Math.min(i + 1, options.length - 1));
        return;
      case 'ArrowUp':
        event.preventDefault();
        if (!open) openAt(selectedIndex < 0 ? options.length - 1 : selectedIndex);
        else setActiveIndex((i) => Math.max(i - 1, 0));
        return;
      case 'Home':
        if (open) {
          event.preventDefault();
          setActiveIndex(0);
        }
        return;
      case 'End':
        if (open) {
          event.preventDefault();
          setActiveIndex(options.length - 1);
        }
        return;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (open) commit(activeIndex);
        else openAt(selectedIndex < 0 ? 0 : selectedIndex);
        return;
      case 'Escape':
        if (open) {
          event.preventDefault();
          close(true);
        }
        return;
      case 'Tab':
        // Tabbing away is a dismissal, not a choice. Do not steal the focus.
        if (open) close(false);
        return;
      default:
        break;
    }

    // Type-to-select, matching the native control.
    if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
      const now = Date.now();
      const text = (now - typed.current.at < 700 ? typed.current.text : '') + event.key;
      typed.current = { text, at: now };

      const match = options.findIndex((option) =>
        option.label.toLowerCase().startsWith(text.toLowerCase())
      );
      if (match >= 0) {
        if (open) setActiveIndex(match);
        else onValueChange(options[match]!.value);
      }
    }
  };

  const selected = options[selectedIndex];

  return (
    <div className={fieldStyles.field}>
      <span
        className={labelHidden ? 'visually-hidden' : fieldStyles.label}
        id={`${id}-label`}
      >
        {label}
      </span>

      <div className={`${styles.wrap} ${open ? styles.open : ''}`} ref={wrapRef}>
        <button
          type="button"
          ref={triggerRef}
          id={id}
          className={`${styles.trigger} ${className ?? ''}`.trim()}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-labelledby={`${id}-label ${id}`}
          aria-activedescendant={open ? `${id}-opt-${activeIndex}` : undefined}
          aria-describedby={hint ? hintId : undefined}
          disabled={disabled}
          onClick={() => (open ? close(false) : openAt(selectedIndex < 0 ? 0 : selectedIndex))}
          onKeyDown={onKeyDown}
        >
          <span className={styles.value}>{selected?.label ?? ''}</span>
          <span className={styles.chevron} aria-hidden="true">
            <Icon name="chevron-down" size={16} />
          </span>
        </button>

        {open && (
          <ul
            className={`${styles.listbox} ${dropUp ? styles.dropUp : ''}`.trim()}
            id={listId}
            role="listbox"
            ref={listRef}
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;
              return (
                <li
                  key={option.value}
                  id={`${id}-opt-${index}`}
                  data-index={index}
                  role="option"
                  aria-selected={isSelected}
                  className={[
                    styles.option,
                    index === activeIndex ? styles.active : '',
                    isSelected ? styles.selected : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onPointerMove={() => setActiveIndex(index)}
                  onClick={() => commit(index)}
                >
                  {option.label}
                  {isSelected && (
                    <span className={styles.tick} aria-hidden="true">
                      <Icon name="check" size={16} />
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {name && <input type="hidden" name={name} value={value} />}

      {hint && (
        <span id={hintId} className={fieldStyles.hint}>
          {hint}
        </span>
      )}
    </div>
  );
}
