'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/Button';
import { DatePicker } from '@/components/DatePicker';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import type { PlanSession } from '@/lib/ai/types';
import styles from './EditPlanModal.module.css';

/**
 * PRD 7.2: generated plans are editable before saving, not just accepted or
 * rejected outright, and stay adjustable afterwards.
 *
 * Each session is edited independently, which is the reason plan_sessions is a
 * table rather than a JSON blob on study_plans.
 */
export interface EditPlanModalProps {
  open: boolean;
  sessions: PlanSession[];
  saving?: boolean;
  onSave: (sessions: PlanSession[]) => void;
  onClose: () => void;
}

export function EditPlanModal({ open, sessions, saving, onSave, onClose }: EditPlanModalProps) {
  const [draft, setDraft] = useState<PlanSession[]>(sessions);

  // Re-sync when a different plan is opened, or when the saved plan changes
  // underneath, so the modal never shows a stale copy.
  useEffect(() => {
    if (open) setDraft(sessions);
  }, [open, sessions]);

  function update(index: number, changes: Partial<PlanSession>) {
    setDraft((current) => current.map((s, i) => (i === index ? { ...s, ...changes } : s)));
  }

  function remove(index: number) {
    setDraft((current) =>
      current.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i + 1 }))
    );
  }

  return (
    <Modal open={open} title="Edit plan" onClose={onClose}>
      <div className={styles.list}>
        {draft.map((session, index) => (
          <div key={`${index}-${session.topic}`} className={styles.session}>
            <div className={styles.sessionHeader}>
              <span className={styles.sessionTitle}>Session {index + 1}</span>
              <button
                type="button"
                className={styles.remove}
                onClick={() => remove(index)}
                disabled={draft.length === 1}
              >
                Remove
              </button>
            </div>

            <Input
              label="Topic"
              value={session.topic}
              onChange={(event) => update(index, { topic: event.target.value })}
            />
            <Input
              label="Focus"
              value={session.focus}
              onChange={(event) => update(index, { focus: event.target.value })}
            />

            <div className={styles.grid}>
              <Input
                label="Minutes"
                type="number"
                min={5}
                max={600}
                value={session.durationMinutes}
                onChange={(event) =>
                  update(index, { durationMinutes: Number(event.target.value) || 0 })
                }
              />
              <DatePicker
                label="Date"
                value={session.scheduledFor ?? ''}
                onValueChange={(next) => update(index, { scheduledFor: next || null })}
              />
            </div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <Button variant="ghost" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          loading={saving}
          onClick={() => onSave(draft.map((s, i) => ({ ...s, order: i + 1 })))}
          disabled={draft.some((s) => !s.topic.trim() || !s.focus.trim() || s.durationMinutes <= 0)}
        >
          Save changes
        </Button>
      </div>
    </Modal>
  );
}
