'use client';

import { useState } from 'react';
import type {
  WorkoutDay,
  WorkoutType,
  WorkoutOverride,
  OverrideFormData,
  AdjustmentSuggestion,
  TrainingWeek,
} from '@/types';
import { formatMiles } from '@/utils/workout';
import { computeAdjustments } from '@/lib/adjustment-engine';
import AdjustmentSuggestions from './AdjustmentSuggestions';

interface QuickOverridePanelProps {
  workout: WorkoutDay & { weekNumber: number };
  existingOverride?: WorkoutOverride | null;
  currentWeek: TrainingWeek;
  weekOverrides: Record<string, WorkoutOverride>;
  logs: Record<string, { completed: boolean; skipped?: boolean; actualMiles?: number }>;
  onOverrideApplied: (override: WorkoutOverride) => void;
  onRevert: () => Promise<void>;
  onClose: () => void;
}

type PanelState = 'presets' | 'run-club-miles' | 'custom' | 'confirm' | 'submitting' | 'adjustments';

const TYPE_OPTIONS: { value: WorkoutType; label: string; color: string }[] = [
  { value: 'easy', label: 'Easy', color: '#22C55E' },
  { value: 'tempo', label: 'Tempo', color: '#F59E0B' },
  { value: 'intervals', label: 'Intervals', color: '#EF4444' },
  { value: 'long', label: 'Long', color: '#3B82F6' },
  { value: 'rest', label: 'Rest', color: '#52525B' },
  { value: 'recovery', label: 'Recovery', color: '#8B5CF6' },
];

export default function QuickOverridePanel({
  workout,
  existingOverride,
  currentWeek,
  weekOverrides,
  logs,
  onOverrideApplied,
  onRevert,
  onClose,
}: QuickOverridePanelProps) {
  const [state, setState] = useState<PanelState>(existingOverride ? 'presets' : 'presets');
  const [formData, setFormData] = useState<OverrideFormData>({
    type: existingOverride?.type ?? workout.type,
    miles: existingOverride?.miles ?? workout.miles,
    description: existingOverride?.description ?? '',
    reason: existingOverride?.reason ?? '',
  });
  const [suggestions, setSuggestions] = useState<AdjustmentSuggestion[]>([]);
  const [reverting, setReverting] = useState(false);

  function selectPreset(preset: string) {
    switch (preset) {
      case 'run-club':
        setFormData({ type: 'easy', miles: 8, reason: 'Run club', description: '' });
        setState('run-club-miles');
        break;
      case 'cut-short':
        setFormData({
          type: workout.type,
          miles: Math.ceil(workout.miles / 2),
          reason: 'Cut short',
          description: '',
        });
        setState('confirm');
        break;
      case 'skip-to-rest':
        setFormData({
          type: 'rest',
          miles: 0,
          reason: 'Skipping today',
          description: 'Rest day (skipped planned workout)',
          estimatedMinutes: 15,
        });
        setState('confirm');
        break;
      case 'custom':
        setFormData({
          type: workout.type,
          miles: workout.miles,
          description: '',
          reason: '',
        });
        setState('custom');
        break;
    }
  }

  async function handleSubmit() {
    setState('submitting');
    try {
      const res = await fetch('/api/workouts/override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: workout.date,
          description: formData.description || undefined,
          miles: formData.miles,
          type: formData.type,
          estimatedMinutes: formData.estimatedMinutes ?? estimateMin(formData.type ?? workout.type, formData.miles ?? workout.miles),
          reason: formData.reason || 'Quick override',
        }),
      });
      if (!res.ok) throw new Error('Failed to save override');

      const override: WorkoutOverride = {
        date: workout.date,
        description: formData.description,
        miles: formData.miles,
        type: formData.type,
        estimatedMinutes: formData.estimatedMinutes,
        reason: formData.reason || 'Quick override',
      };
      onOverrideApplied(override);

      // Compute auto-adjustments
      const adj = computeAdjustments(
        workout.date,
        formData,
        currentWeek,
        { ...weekOverrides, [workout.date]: override },
        logs,
      );
      setSuggestions(adj);
      setState('adjustments');
    } catch {
      setState('confirm');
    }
  }

  async function handleApplySuggestion(s: AdjustmentSuggestion) {
    await fetch('/api/workouts/override', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: s.targetDate,
        miles: s.suggestedMiles,
        type: s.suggestedType,
        description: s.suggestedDescription,
        estimatedMinutes: estimateMin(s.suggestedType ?? s.currentType, s.suggestedMiles ?? s.currentMiles),
        reason: s.explanation,
      }),
    });
    setSuggestions((prev) => prev.filter((x) => x.id !== s.id));
  }

  async function handleApplyAll() {
    for (const s of suggestions) {
      await handleApplySuggestion(s);
    }
  }

  function handleDismiss(id: string) {
    setSuggestions((prev) => prev.filter((x) => x.id !== id));
  }

  async function handleRevert() {
    setReverting(true);
    try { await onRevert(); onClose(); } finally { setReverting(false); }
  }

  function estimateMin(type: WorkoutType, miles: number): number {
    const pace: Record<string, number> = { easy: 8.25, recovery: 9, long: 7.75, tempo: 6.33, intervals: 7, rest: 0, race: 6.5, strength: 0 };
    return Math.round(miles * (pace[type] ?? 8));
  }

  // ── Render states ────────────────────────────────────────────────────────

  if (state === 'adjustments') {
    if (suggestions.length === 0) {
      // No adjustments needed — auto-close after brief message
      return (
        <section className="mb-4">
          <div className="card" style={{ padding: '14px 16px', borderLeft: '3px solid #22C55E' }}>
            <div className="text-sm font-semibold" style={{ color: '#22C55E' }}>
              Override applied. No further adjustments needed this week.
            </div>
            <button className="btn-secondary mt-2" style={{ fontSize: 12 }} onClick={onClose}>
              Done
            </button>
          </div>
        </section>
      );
    }
    return (
      <>
        <section className="mb-4">
          <div className="card" style={{ padding: '12px 16px', borderLeft: '3px solid #22C55E' }}>
            <div className="text-sm font-semibold" style={{ color: '#22C55E' }}>Override applied.</div>
          </div>
        </section>
        <AdjustmentSuggestions
          suggestions={suggestions}
          onApply={handleApplySuggestion}
          onDismiss={handleDismiss}
          onApplyAll={handleApplyAll}
        />
        <section className="mb-4">
          <button className="btn-secondary w-full" style={{ fontSize: 12 }} onClick={onClose}>
            Done
          </button>
        </section>
      </>
    );
  }

  return (
    <section className="mb-4">
      <div className="card" style={{ padding: '16px', borderColor: '#B388FF33' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: '#B388FF', fontFamily: 'DM Sans, sans-serif' }}
          >
            Quick Override
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-tertiary)', fontSize: 16, minHeight: 'unset', padding: 4,
            }}
          >
            &times;
          </button>
        </div>

        {/* Planned workout reference */}
        <div className="text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>
          Planned: <span style={{ fontFamily: 'DM Mono, monospace', color: 'var(--text-secondary)' }}>
            {formatMiles(workout.miles)}mi {workout.type}
          </span>
        </div>

        {/* Revert option if override exists */}
        {existingOverride && state === 'presets' && (
          <button
            className="btn-secondary w-full mb-3"
            style={{ fontSize: 12, color: '#EF4444', borderColor: 'rgba(239,68,68,0.3)' }}
            disabled={reverting}
            onClick={handleRevert}
          >
            {reverting ? 'Reverting...' : 'Revert to Original Plan'}
          </button>
        )}

        {/* Presets */}
        {state === 'presets' && (
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'run-club', label: 'Run Club', icon: '🏃', desc: 'Easy miles with friends' },
              { key: 'cut-short', label: 'Cut Short', icon: '✂️', desc: `${Math.ceil(workout.miles / 2)}mi instead of ${workout.miles}mi` },
              { key: 'skip-to-rest', label: 'Skip → Rest', icon: '😴', desc: 'Take the day off' },
              { key: 'custom', label: 'Custom', icon: '🔧', desc: 'Set your own workout' },
            ].map((p) => (
              <button
                key={p.key}
                onClick={() => selectPreset(p.key)}
                className="card text-left"
                style={{
                  padding: '10px 12px', cursor: 'pointer',
                  border: '1px solid var(--border-subtle)',
                  transition: 'border-color 0.15s',
                  minHeight: 'unset',
                }}
              >
                <div className="text-base mb-1">{p.icon}</div>
                <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{p.label}</div>
                <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{p.desc}</div>
              </button>
            ))}
          </div>
        )}

        {/* Run club miles input */}
        {state === 'run-club-miles' && (
          <div>
            <div className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              How many miles?
            </div>
            <div className="flex items-center gap-3 mb-3">
              <button
                className="btn-secondary"
                style={{ minWidth: 36, minHeight: 36, padding: 0, fontSize: 18 }}
                onClick={() => setFormData((d) => ({ ...d, miles: Math.max(1, (d.miles ?? 8) - 1) }))}
              >
                -
              </button>
              <span className="text-2xl font-bold" style={{ fontFamily: 'DM Mono, monospace', minWidth: 50, textAlign: 'center' }}>
                {formData.miles}
              </span>
              <button
                className="btn-secondary"
                style={{ minWidth: 36, minHeight: 36, padding: 0, fontSize: 18 }}
                onClick={() => setFormData((d) => ({ ...d, miles: (d.miles ?? 8) + 1 }))}
              >
                +
              </button>
              <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>miles</span>
            </div>
            <div className="flex gap-2">
              <button className="btn-teal flex-1" onClick={() => setState('confirm')}>
                Confirm
              </button>
              <button className="btn-secondary" onClick={() => setState('presets')}>
                Back
              </button>
            </div>
          </div>
        )}

        {/* Custom form */}
        {state === 'custom' && (
          <div className="flex flex-col gap-3">
            {/* Type picker */}
            <div>
              <div className="text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Type</div>
              <div className="flex flex-wrap gap-1.5">
                {TYPE_OPTIONS.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setFormData((d) => ({ ...d, type: t.value }))}
                    style={{
                      fontSize: 11, padding: '4px 10px', borderRadius: 20, cursor: 'pointer',
                      background: formData.type === t.value ? `${t.color}22` : 'transparent',
                      color: formData.type === t.value ? t.color : 'var(--text-tertiary)',
                      border: `1px solid ${formData.type === t.value ? `${t.color}55` : 'var(--border-subtle)'}`,
                      minHeight: 'unset', fontWeight: formData.type === t.value ? 700 : 400,
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Miles */}
            <div>
              <div className="text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Miles</div>
              <div className="flex items-center gap-2">
                <button
                  className="btn-secondary"
                  style={{ minWidth: 32, minHeight: 32, padding: 0, fontSize: 16 }}
                  onClick={() => setFormData((d) => ({ ...d, miles: Math.max(0, (d.miles ?? 0) - 1) }))}
                >
                  -
                </button>
                <input
                  type="number"
                  value={formData.miles ?? 0}
                  onChange={(e) => setFormData((d) => ({ ...d, miles: parseFloat(e.target.value) || 0 }))}
                  style={{ width: 60, textAlign: 'center', fontFamily: 'DM Mono, monospace' }}
                />
                <button
                  className="btn-secondary"
                  style={{ minWidth: 32, minHeight: 32, padding: 0, fontSize: 16 }}
                  onClick={() => setFormData((d) => ({ ...d, miles: (d.miles ?? 0) + 1 }))}
                >
                  +
                </button>
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Description (optional)</div>
              <textarea
                value={formData.description ?? ''}
                onChange={(e) => setFormData((d) => ({ ...d, description: e.target.value }))}
                placeholder="What are you doing instead?"
                rows={2}
                style={{ fontSize: 13, resize: 'none' }}
              />
            </div>

            {/* Reason */}
            <div>
              <div className="text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Reason (optional)</div>
              <input
                type="text"
                value={formData.reason ?? ''}
                onChange={(e) => setFormData((d) => ({ ...d, reason: e.target.value }))}
                placeholder="Why the change?"
                style={{ fontSize: 13 }}
              />
            </div>

            <div className="flex gap-2">
              <button className="btn-teal flex-1" onClick={() => setState('confirm')}>
                Review
              </button>
              <button className="btn-secondary" onClick={() => setState('presets')}>
                Back
              </button>
            </div>
          </div>
        )}

        {/* Confirm */}
        {state === 'confirm' && (
          <div>
            <div className="rounded-lg p-3 mb-3" style={{ background: 'rgba(179,136,255,0.08)', border: '1px solid rgba(179,136,255,0.2)' }}>
              <div className="flex items-center gap-2 text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>
                <span>{formatMiles(workout.miles)}mi {workout.type}</span>
                <span>&rarr;</span>
                <span style={{ color: '#B388FF', fontFamily: 'DM Mono, monospace', fontWeight: 700 }}>
                  {formatMiles(formData.miles ?? 0)}mi {formData.type}
                </span>
              </div>
              {formData.reason && (
                <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  {formData.reason}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button className="btn-teal flex-1" onClick={handleSubmit}>
                Apply Override
              </button>
              <button className="btn-secondary" onClick={() => setState('presets')}>
                Back
              </button>
            </div>
          </div>
        )}

        {/* Submitting */}
        {state === 'submitting' && (
          <div className="text-center py-4">
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Applying override...
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
