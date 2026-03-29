'use client';

import AppHeader from '@/components/layout/AppHeader';
import AppNav from '@/components/layout/AppNav';
import CoachFAB from '@/components/coach/CoachFAB';
import {
  nutritionTargets, workoutNutrition, houstonCarbLoad,
  grasslandsNutrition, samplePeakDay
} from '@/data/reference-data';
import { getCurrentWeek, getPhaseForWeek } from '@/data/training-plan';
import type { PhaseNumber } from '@/types';

export default function NutritionPage() {
  const today = new Date();
  const currentWeek = getCurrentWeek(today);
  const phase = currentWeek ? getPhaseForWeek(currentWeek.week) : null;
  const currentPhase = (phase?.phase ?? 1) as PhaseNumber;
  const currentNutrition = nutritionTargets.find((n) => n.phase === currentPhase);

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <AppHeader title="Nutrition Guide" />

      <main className="flex-1 overflow-y-auto px-4 pb-32 pt-4 max-w-lg mx-auto w-full">
        <h1 className="text-2xl font-black mb-1" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>
          Nutrition Guide
        </h1>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          Phase-aware fueling strategy
        </p>

        {/* Current phase targets */}
        {currentNutrition && (
          <div className="card mb-4" style={{ borderColor: 'rgba(245,158,11,0.3)' }}>
            <div className="text-xs font-semibold tracking-wide mb-2" style={{ color: '#F59E0B' }}>
              CURRENT PHASE {currentPhase} TARGETS
            </div>
            <div className="text-3xl font-black mb-3" style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)' }}>
              {currentNutrition.calories}
              <span className="text-sm font-normal ml-1" style={{ color: 'var(--text-secondary)' }}>cal/day</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Carbs', value: currentNutrition.carbs, color: '#3B82F6' },
                { label: 'Protein', value: currentNutrition.protein, color: '#EF4444' },
                { label: 'Fat', value: currentNutrition.fat, color: '#F59E0B' },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center">
                  <div className="text-sm font-bold" style={{ color, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{label}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Workout nutrition timing */}
        <div className="card mb-4">
          <div className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            Run-Day Nutrition Timing
          </div>
          <div className="space-y-4">
            {[
              {
                phase: 'Pre-Run',
                emoji: '🌅',
                timing: workoutNutrition.preRun.timing,
                detail: workoutNutrition.preRun.calories,
                options: workoutNutrition.preRun.options,
                color: '#F59E0B',
              },
              {
                phase: 'During Run (>75min)',
                emoji: '🏃',
                timing: 'Every 45 min',
                detail: workoutNutrition.duringRun.over75min,
                options: workoutNutrition.duringRun.options,
                color: '#22C55E',
              },
              {
                phase: 'Post-Run',
                emoji: '🍽️',
                timing: workoutNutrition.postRun.timing,
                detail: `${workoutNutrition.postRun.protein} + ${workoutNutrition.postRun.carbs}`,
                options: workoutNutrition.postRun.options,
                color: '#3B82F6',
              },
            ].map(({ phase: p, emoji, timing, detail, options, color }) => (
              <div key={p}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{emoji}</span>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{p}</div>
                    <div className="text-xs" style={{ color, fontFamily: 'JetBrains Mono, monospace' }}>
                      {timing} · {detail}
                    </div>
                  </div>
                </div>
                <div className="ml-8 space-y-1">
                  {options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: color }} />
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{opt}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Phase macro table */}
        <div className="card mb-4">
          <div className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Phase Macro Targets</div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Phase', 'Calories', 'Carbs', 'Protein', 'Fat'].map((h) => (
                    <th
                      key={h}
                      className="text-left pb-2 pr-3"
                      style={{ color: 'var(--text-tertiary)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600 }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {nutritionTargets.map((n) => (
                  <tr key={n.phase} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <td className="py-2 pr-3 font-semibold" style={{ color: n.phase === currentPhase ? 'var(--accent-teal)' : 'var(--text-secondary)' }}>
                      P{n.phase}
                    </td>
                    <td className="py-2 pr-3" style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)' }}>
                      {n.calories}
                    </td>
                    <td className="py-2 pr-3" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#3B82F6' }}>
                      {n.carbs.split(' ')[0]}
                    </td>
                    <td className="py-2 pr-3" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#EF4444' }}>
                      {n.protein.split(' ')[0]}
                    </td>
                    <td className="py-2" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#F59E0B' }}>
                      {n.fat.split(' ')[0]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sample peak day */}
        <div className="card mb-4">
          <div className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            Sample Peak Training Day (~3,800 cal)
          </div>
          <div className="space-y-2">
            {samplePeakDay.map(({ time, meal, calories }) => (
              <div key={time} className="flex items-start gap-3">
                <span
                  className="text-xs font-bold flex-shrink-0 w-16"
                  style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent-teal)' }}
                >
                  {time}
                </span>
                <span className="text-xs flex-1" style={{ color: 'var(--text-secondary)' }}>{meal}</span>
                <span
                  className="text-xs flex-shrink-0"
                  style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-tertiary)' }}
                >
                  {calories}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Houston carb load */}
        <div className="card mb-4">
          <div className="text-sm font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            🏆 Houston Carb Load Protocol
          </div>
          <div className="text-xs mb-2" style={{ color: '#F59E0B', fontFamily: 'JetBrains Mono, monospace' }}>
            {houstonCarbLoad.timing} · {houstonCarbLoad.target}
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            {houstonCarbLoad.foods.map((f) => (
              <span key={f} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(59,130,246,0.12)', color: '#3B82F6' }}>
                {f}
              </span>
            ))}
          </div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Avoid: {houstonCarbLoad.avoid.join(', ')}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
            {houstonCarbLoad.note}
          </div>
        </div>

        {/* Grasslands ultra nutrition */}
        <div className="card mb-4">
          <div className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            🌟 Grasslands 100 Ultra Nutrition
          </div>
          <div className="space-y-2">
            {grasslandsNutrition.map(({ segment, calPerHour, options }) => (
              <div key={segment} className="flex gap-3 items-start">
                <span
                  className="text-xs font-bold w-24 flex-shrink-0"
                  style={{ fontFamily: 'JetBrains Mono, monospace', color: '#A855F7' }}
                >
                  {segment}
                </span>
                <div>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: '#F59E0B' }}
                  >
                    {calPerHour} cal/hr
                  </span>
                  <span className="text-xs ml-2" style={{ color: 'var(--text-secondary)' }}>
                    {options}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hydration */}
        <div className="card mb-4">
          <div className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Hydration Guidelines
          </div>
          <div className="space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <div>• <strong>Baseline:</strong> Half your body weight in ounces (~75-85 oz/day)</div>
            <div>• <strong>Training days:</strong> Add 16-24 oz per hour of activity</div>
            <div>• <strong>Summer heat:</strong> Add 50-100% more. Pre-hydrate the night before.</div>
            <div>• <strong>Indicator:</strong> Pale yellow urine = hydrated. Dark = drink more.</div>
            <div>• <strong>Electrolytes:</strong> Sodium + potassium during runs &gt;60 min in heat</div>
          </div>
        </div>
      </main>

      <AppNav />
      <CoachFAB />
    </div>
  );
}
