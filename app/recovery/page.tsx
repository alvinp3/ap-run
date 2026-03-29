'use client';

import { useState } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import AppNav from '@/components/layout/AppNav';
import CoachFAB from '@/components/coach/CoachFAB';
import { recoveryProtocols, strengtheningExercises, warningSigns } from '@/data/reference-data';
import { getTodayWorkout, getCurrentWeek, getPhaseForWeek } from '@/data/training-plan';

export default function RecoveryPage() {
  const [checkedWarnings, setCheckedWarnings] = useState<Set<string>>(new Set());
  const [expandedModality, setExpandedModality] = useState<string | null>(null);

  const today = new Date();
  const todayWorkout = getTodayWorkout(today);
  const currentWeek = getCurrentWeek(today);
  const phase = currentWeek ? getPhaseForWeek(currentWeek.week) : null;

  // Determine today's recovery protocol
  const recoveryKey = !todayWorkout ? 'rest'
    : todayWorkout.type === 'long' ? 'longRun'
    : todayWorkout.type === 'rest' ? 'rest'
    : todayWorkout.type === 'intervals' || todayWorkout.type === 'tempo' ? 'quality'
    : 'easy';

  const todayRecovery = recoveryProtocols[recoveryKey as keyof typeof recoveryProtocols];
  const hasWarnings = checkedWarnings.size > 0;

  function toggleWarning(id: string) {
    setCheckedWarnings((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <AppHeader title="Recovery & Mobility" />

      <main className="flex-1 overflow-y-auto px-4 pb-32 pt-4 max-w-lg mx-auto w-full">
        <h1 className="text-2xl font-black mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
          Recovery Hub
        </h1>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          Dynamic protocols based on today&apos;s training
        </p>

        {/* Today's recovery card */}
        <div className="card mb-4" style={{ borderColor: 'rgba(139,92,246,0.3)' }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">💪</span>
            <div>
              <div className="text-sm font-bold" style={{ color: '#8B5CF6' }}>
                Today&apos;s Recovery Protocol
              </div>
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {todayRecovery.label}
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {todayRecovery.steps.map((step) => (
              <div key={step.order} className="flex gap-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: 'rgba(139,92,246,0.15)', color: '#8B5CF6' }}
                >
                  {step.order}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{step.tool}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#F59E0B', fontFamily: 'DM Mono, monospace' }}>
                    {step.duration}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{step.targets}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Warning signs checklist */}
        <div className="card mb-4">
          <div className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            ⚠️ Warning Signs Checklist
          </div>
          <div className="space-y-2 mb-3">
            {warningSigns.map((sign) => (
              <label
                key={sign.id}
                className="flex items-start gap-3 cursor-pointer"
                style={{ minHeight: 'unset' }}
              >
                <input
                  type="checkbox"
                  checked={checkedWarnings.has(sign.id)}
                  onChange={() => toggleWarning(sign.id)}
                  className="mt-0.5 flex-shrink-0"
                  style={{ width: 18, height: 18, accentColor: '#EF4444' }}
                />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {sign.text}
                </span>
              </label>
            ))}
          </div>
          {hasWarnings && (
            <div
              className="rounded-xl px-4 py-3"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
            >
              <div className="text-sm font-semibold mb-1" style={{ color: '#EF4444' }}>
                ⚠️ Recovery Recommended
              </div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Consider an extra rest day and reducing this week&apos;s mileage by 20-30%. A missed week now is better than a missed month later.
              </div>
            </div>
          )}
        </div>

        {/* Modality guide */}
        <div className="mb-4">
          <div className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            Modality Reference Guide
          </div>
          <div className="space-y-2">
            {[
              {
                id: 'foam',
                emoji: '🪨',
                title: 'Foam Rolling',
                content: 'Calves: opposite leg crossed for pressure, 2min. Hip flexors/quads: face down, hip crease to mid-thigh, 2min. Glutes: figure-4 sit, bias piriformis/glute med, 2min. IT band: lateral thigh hip to knee, 90s. Start standard density, progress to textured/hard roller.',
              },
              {
                id: 'lacrosse',
                emoji: '⚾',
                title: 'Lacrosse Ball',
                content: 'Piriformis "glute smash & floss": sit on ball medial to greater trochanter, cross ankle, rotate hip, 2min/side. Psoas/iliacus: face down, ball inside ASIS, extend hip, 30-60s/side. Soleus: sit, ball under bent-knee calf, dorsiflex/plantarflex, 2min/leg. Plantar fascia: stand on ball, roll heel to toe.',
              },
              {
                id: 'massagegun',
                emoji: '🔫',
                title: 'Massage Gun',
                content: 'Round/flat head for calves (straight + bent knee for soleus, 30-60s). Flat head hip flexors (light pressure, 30-45s/side). Ball head glutes (max tolerable intensity, 60-90s/side). Peroneals/tib anterior (30s each). Use BEFORE deeper work. Never on Achilles tendon or bony prominences.',
              },
              {
                id: 'barbell',
                emoji: '🏋️',
                title: 'Barbell Mash',
                content: 'Calf on barbell, cross opposite leg, relax into bar. "Pressure wave" side-to-side. Dorsiflex/plantarflex under compression. 2min/spot, 8-10min total per leg. Quad variant: face down, barbell across front thigh, bend/straighten knee.',
              },
              {
                id: 'dryneedling',
                emoji: '💉',
                title: 'Dry Needling',
                content: 'Professional treatment for acute trigger points not resolving with self-work. 1-2 sessions/week acute, biweekly maintenance. Best targets: soleus, gastroc, piriformis, psoas, glute medius. Fast-in-fast-out technique superior for ROM. Must pair with strengthening for lasting results.',
              },
            ].map(({ id, emoji, title, content }) => (
              <div key={id} className="card" style={{ padding: '12px 14px' }}>
                <button
                  className="flex items-center justify-between w-full text-left min-h-0"
                  style={{ background: 'none', border: 'none', color: 'var(--text-primary)' }}
                  onClick={() => setExpandedModality(expandedModality === id ? null : id)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{emoji}</span>
                    <span className="text-sm font-semibold">{title}</span>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)', transition: 'transform 0.2s', display: 'inline-block', transform: expandedModality === id ? 'rotate(180deg)' : undefined }}>▼</span>
                </button>
                {expandedModality === id && (
                  <div className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {content}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Strengthening exercises */}
        <div className="mb-4">
          <div className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            Runner&apos;s Kinetic Chain — Key Exercises
          </div>
          <div className="space-y-2">
            {strengtheningExercises.map((ex) => (
              <div key={ex.id} className="card" style={{ padding: '12px 14px' }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {ex.name}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                      {ex.muscles}
                    </div>
                    <div className="text-xs mt-1 italic" style={{ color: '#8B5CF6' }}>
                      {ex.note}
                    </div>
                  </div>
                  <div
                    className="text-xs font-bold flex-shrink-0 text-right"
                    style={{ fontFamily: 'DM Mono, monospace', color: '#8B5CF6' }}
                  >
                    {ex.sets}×{ex.reps}
                  </div>
                </div>
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
