'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { RotateCcw } from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import AppNav from '@/components/layout/AppNav';
import WorkoutBadge from '@/components/ui/WorkoutBadge';
import PhaseBadge from '@/components/ui/PhaseBadge';
import CoachFAB from '@/components/coach/CoachFAB';
import { getWorkoutByDate, getPhaseForWeek } from '@/data/training-plan';
import { recoveryProtocols } from '@/data/reference-data';
import { formatDate, formatDuration, formatMiles, isHeatSeason } from '@/utils/workout';
import type { WorkoutDay, WorkoutOverride } from '@/types';
import WorkoutSteps from '@/components/ui/WorkoutSteps';

export default function WorkoutDetailPage() {
  const params = useParams();
  const router = useRouter();
  const date = params.date as string;

  const [log, setLog] = useState<{ completed: boolean; skipped: boolean; notes?: string; actualMiles?: number } | null>(null);
  const [notes, setNotes] = useState('');
  const [actualMiles, setActualMiles] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [override, setOverride] = useState<WorkoutOverride | null>(null);
  const [reverting, setReverting] = useState(false);

  const workout = getWorkoutByDate(date) as (WorkoutDay & { weekNumber: number; isDownWeek: boolean }) | null;
  const phase = workout ? getPhaseForWeek(workout.weekNumber) : null;

  useEffect(() => {
    if (!date) return;
    fetch(`/api/logs?date=${date}`)
      .then((r) => r.json())
      .then((d) => {
        if (d) {
          setLog(d);
          setNotes(d.notes ?? '');
          setActualMiles(d.actualMiles ? String(d.actualMiles) : '');
        }
      })
      .catch(() => {});
  }, [date]);

  useEffect(() => {
    if (!date) return;
    fetch(`/api/workouts/override?date=${date}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setOverride(d); })
      .catch(() => {});
  }, [date]);

  if (!workout || !phase) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-4xl mb-4">🤷</div>
        <div className="text-lg font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
          No workout found for {date}
        </div>
        <Link href="/" className="btn-teal mt-4">Back to Dashboard</Link>
      </div>
    );
  }

  const effectiveWorkout = override ? {
    ...workout,
    description: override.description ?? workout.description,
    miles: override.miles ?? workout.miles,
    type: (override.type as typeof workout.type) ?? workout.type,
    estimatedMinutes: override.estimatedMinutes ?? workout.estimatedMinutes,
  } : workout;

  const isHeat = isHeatSeason(date);
  const recoveryKey = effectiveWorkout.type === 'long' ? 'longRun'
    : effectiveWorkout.type === 'rest' ? 'rest'
    : effectiveWorkout.type === 'intervals' || effectiveWorkout.type === 'tempo' ? 'quality'
    : 'easy';
  const recovery = recoveryProtocols[recoveryKey as keyof typeof recoveryProtocols];

  async function handleRevert() {
    setReverting(true);
    try {
      await fetch(`/api/workouts/override?date=${date}`, { method: 'DELETE' });
      setOverride(null);
    } finally {
      setReverting(false);
    }
  }

  async function handleSave(completed: boolean, skipped = false) {
    setSaving(true);
    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          completed,
          skipped,
          actualMiles: actualMiles ? parseFloat(actualMiles) : workout?.miles,
          notes: notes || undefined,
        }),
      });
      const d = await res.json();
      setLog(d);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <AppHeader title="Workout Detail" />

      <main className="flex-1 overflow-y-auto px-4 pb-32 pt-4 max-w-lg mx-auto w-full">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-4 text-sm min-h-0"
          style={{ color: 'var(--text-tertiary)', background: 'none', border: 'none', padding: 0, minHeight: 32 }}
        >
          ← Back
        </button>

        {/* Header */}
        <div className="card mb-4">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <PhaseBadge phase={phase.phase} name={phase.name} />
            {workout.isDownWeek && (
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(139,92,246,0.15)', color: '#8B5CF6' }}>
                DOWN WEEK
              </span>
            )}
          </div>
          <div className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
            {formatDate(date)}
          </div>
          <div className="flex items-center gap-3 mb-3">
            <WorkoutBadge type={effectiveWorkout.type} size="lg" />
            {effectiveWorkout.miles > 0 && (
              <span className="text-2xl font-bold" style={{ fontFamily: 'DM Mono, monospace' }}>
                {formatMiles(effectiveWorkout.miles)}<span className="text-sm font-normal ml-1" style={{ color: 'var(--text-secondary)' }}>mi</span>
              </span>
            )}
            {effectiveWorkout.estimatedMinutes > 0 && (
              <span className="text-sm" style={{ color: 'var(--text-tertiary)', fontFamily: 'DM Mono, monospace' }}>
                ~{formatDuration(effectiveWorkout.estimatedMinutes)}
              </span>
            )}
          </div>
          {override && (
            <div style={{
              background: 'rgba(179,136,255,0.08)',
              border: '1px solid rgba(179,136,255,0.25)',
              padding: '8px 12px',
              marginBottom: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
            }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: '0.1em', color: '#B388FF', fontFamily: 'Space Grotesk, sans-serif', textTransform: 'uppercase' }}>
                  Modified by Coach
                </div>
                {override.reason && (
                  <div style={{ fontSize: 11, color: '#52525B', fontFamily: 'Manrope, sans-serif', marginTop: 2 }}>
                    {override.reason}
                  </div>
                )}
              </div>
              <button
                onClick={handleRevert}
                disabled={reverting}
                style={{
                  background: 'transparent',
                  border: '1px solid #2A2A2A',
                  borderRadius: 0,
                  color: '#52525B',
                  fontSize: 11,
                  fontFamily: 'Manrope, sans-serif',
                  padding: '4px 10px',
                  cursor: 'pointer',
                  minHeight: 'unset',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  flexShrink: 0,
                }}
              >
                <RotateCcw size={11} strokeWidth={2} />
                {reverting ? 'Reverting…' : 'Revert'}
              </button>
            </div>
          )}
          <WorkoutSteps description={effectiveWorkout.description} type={effectiveWorkout.type} />
        </div>

        {/* Heat-adjusted paces */}
        {isHeat && effectiveWorkout.type !== 'rest' && (
          <div className="card mb-4">
            <div className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#F59E0B' }}>
              ☀️ Heat-Adjusted Paces
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm" style={{ fontFamily: 'DM Mono, monospace' }}>
              {[
                ['Recovery', '9:00-9:45/mi'],
                ['Easy', '8:15-9:00/mi'],
                ['Long Run', '7:45-8:30/mi'],
                ['Marathon', '6:45-7:10/mi'],
                ['Tempo', '6:25-6:45/mi'],
                ['Intervals', '6:00-6:25/mi'],
              ].map(([zone, pace]) => (
                <div key={zone} className="flex justify-between gap-2">
                  <span style={{ color: 'var(--text-secondary)' }}>{zone}</span>
                  <span style={{ color: '#F59E0B' }}>{pace}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recovery protocol */}
        {recovery && (
          <div className="card mb-4">
            <div className="text-sm font-bold mb-3" style={{ color: '#8B5CF6' }}>
              Recovery Protocol · {recovery.label}
            </div>
            <div className="space-y-3">
              {recovery.steps.map((step) => (
                <div key={step.order} className="flex gap-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(139,92,246,0.15)', color: '#8B5CF6' }}
                  >
                    {step.order}
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{step.tool}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{step.duration}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{step.targets}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completion section */}
        <div className="card mb-4">
          <div className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            Log This Workout
          </div>

          {log?.completed && (
            <div
              className="rounded-xl px-4 py-3 mb-3 flex items-center gap-3"
              style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}
            >
              <span className="text-xl">✅</span>
              <span className="text-sm font-semibold" style={{ color: '#22C55E' }}>
                Workout Completed!
              </span>
            </div>
          )}

          {/* Actual miles override */}
          {effectiveWorkout.miles > 0 && (
            <div className="mb-3">
              <label className="text-xs font-semibold tracking-wide mb-1 block" style={{ color: 'var(--text-secondary)' }}>
                ACTUAL MILES
              </label>
              <input
                type="number"
                value={actualMiles}
                onChange={(e) => setActualMiles(e.target.value)}
                placeholder={`Planned: ${effectiveWorkout.miles} mi`}
                step="0.1"
                min="0"
                style={{ fontSize: '16px' }}
              />
            </div>
          )}

          {/* Notes */}
          <div className="mb-3">
            <label className="text-xs font-semibold tracking-wide mb-1 block" style={{ color: 'var(--text-secondary)' }}>
              NOTES
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did it go? HR, conditions, how you felt..."
              rows={3}
              className="resize-none"
            />
          </div>

          {saved && (
            <div className="text-sm text-center mb-2" style={{ color: '#22C55E' }}>
              ✓ Saved!
            </div>
          )}

          <div className="flex gap-2">
            <button
              className="btn-teal flex-1"
              onClick={() => handleSave(true)}
              disabled={saving}
            >
              {saving ? '...' : log?.completed ? '✅ Update' : '✅ Mark Complete'}
            </button>
            <button
              className="btn-secondary"
              onClick={() => handleSave(false, true)}
              disabled={saving}
              style={{ color: 'var(--text-tertiary)' }}
            >
              Skip
            </button>
          </div>
        </div>

        {/* Paces reference */}
        <div className="card mb-4">
          <div className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            Training Paces Reference
          </div>
          <div className="space-y-1.5 text-sm" style={{ fontFamily: 'DM Mono, monospace' }}>
            {[
              { zone: 'Recovery',  pace: '8:30-9:00/mi', color: '#8B5CF6' },
              { zone: 'Easy',      pace: '7:50-8:20/mi', color: '#22C55E' },
              { zone: 'Long Run',  pace: '7:20-7:50/mi', color: '#3B82F6' },
              { zone: 'Marathon',  pace: '6:25-6:35/mi', color: '#3B82F6' },
              { zone: 'Tempo/LT',  pace: '6:05-6:15/mi', color: '#F59E0B' },
              { zone: 'Intervals', pace: '5:45-6:00/mi', color: '#EF4444' },
            ].map(({ zone, pace, color }) => (
              <div key={zone} className="flex justify-between items-center">
                <span style={{ color: 'var(--text-secondary)' }}>{zone}</span>
                <span style={{ color }}>{pace}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <AppNav />
      <CoachFAB />
    </div>
  );
}
