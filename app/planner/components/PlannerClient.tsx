'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AIResponse } from '@/components/AIResponse';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { Modal } from '@/components/Modal';
import { Toast } from '@/components/Toast';
import { isAside } from '@/lib/ai/types';
import type { AsideResult, PlanInput, PlanSession, PlannerResult } from '@/lib/ai/types';
import { EditPlanModal } from './EditPlanModal';
import { PlanForm } from './PlanForm';
import { PlanPreview } from './PlanPreview';
import styles from './PlannerClient.module.css';

/**
 * Drives PRD 7.2's flow: inputs -> generated plan -> review -> confirm or edit.
 *
 * A plan is created as `draft` and only becomes `active` when the student
 * confirms they understand it. Answering "not quite" leaves it draft and opens
 * the editor, so the student adjusts it rather than being stuck with it.
 */
interface DraftPlan {
  planId: number;
  sessions: PlanSession[];
  reasoning: string;
  understood: boolean | null;
}

export function PlannerClient() {
  const router = useRouter();
  const [draft, setDraft] = useState<DraftPlan | null>(null);
  const [aside, setAside] = useState<AsideResult | null>(null);
  const [pending, setPending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  async function generate(input: PlanInput) {
    setPending(true);
    setError(null);
    setAside(null);
    try {
      const data = await send('/api/planner/generate', 'POST', input);
      const result = data.result as PlannerResult;

      if (isAside(result)) {
        setAside(result);
        setDraft(null);
        return;
      }

      setDraft({
        planId: data.planId as number,
        sessions: result.sessions,
        reasoning: result.reasoning,
        understood: null,
      });
      // The plan is the answer to the form, so the form gets out of the way.
      setFormOpen(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not build a plan');
    } finally {
      setPending(false);
    }
  }

  async function confirm(understood: boolean) {
    if (!draft) return;
    setSaving(true);
    setError(null);
    try {
      await send(`/api/planner/${draft.planId}/confirm`, 'POST', { understood });
      setDraft({ ...draft, understood });

      if (understood) {
        // The plan is now active, so the schedule below needs to reflect it.
        router.refresh();
      } else {
        setEditing(true);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save your answer');
    } finally {
      setSaving(false);
    }
  }

  async function saveSessions(sessions: PlanSession[]) {
    if (!draft) return;
    setSaving(true);
    setError(null);
    try {
      await send(`/api/planner/${draft.planId}`, 'PUT', { sessions });
      // Re-reviewing after an edit: the checkpoint reopens rather than
      // inheriting a stale "not quite".
      setDraft({ ...draft, sessions, understood: null });
      setEditing(false);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save your changes');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.stack}>
      <div className={styles.createRow}>
        <div>
          <h2 className={styles.createTitle}>Your study plans</h2>
          <p className={styles.createHint}>
            Built from the topics you list, at the pace you set.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Icon name="plan" size={16} />
          Create Study Plan
        </Button>
      </div>

      {/*
        The form is a modal rather than a permanent card: creating a plan is an
        occasional task, and the schedule is what the page is for the rest of
        the time.
      */}
      <Modal open={formOpen} title="Create a study plan" wide onClose={() => setFormOpen(false)}>
        <PlanForm pending={pending} onSubmit={generate} />
      </Modal>

      {aside && (
        <Card title="Before we plan">
          <AIResponse result={aside} />
        </Card>
      )}

      {draft && (
        <Card
          title="Your plan"
          action={
            <Button size="small" variant="ghost" onClick={() => setEditing(true)}>
              Edit
            </Button>
          }
        >
          <PlanPreview sessions={draft.sessions} reasoning={draft.reasoning}>
            {draft.understood === null ? (
              <div className={styles.checkpoint}>
                <span className={styles.checkpointQuestion}>Does this plan work for you?</span>
                <div className={styles.actions}>
                  <Button size="small" loading={saving} onClick={() => confirm(true)}>
                    Yes, save it
                  </Button>
                  <Button
                    size="small"
                    variant="ghost"
                    disabled={saving}
                    onClick={() => confirm(false)}
                  >
                    Not quite
                  </Button>
                </div>
              </div>
            ) : (
              <p className={styles.status}>
                {draft.understood
                  ? 'Saved and added to your schedule. You can still edit it any time.'
                  : 'Left as a draft. Adjust it and review again.'}
              </p>
            )}
          </PlanPreview>
        </Card>
      )}

      {draft && (
        <EditPlanModal
          open={editing}
          sessions={draft.sessions}
          saving={saving}
          onSave={saveSessions}
          onClose={() => setEditing(false)}
        />
      )}

      {error && <Toast tone="caution" message={error} onDismiss={() => setError(null)} />}
    </div>
  );
}
