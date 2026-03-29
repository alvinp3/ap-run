'use client';

import AppHeader from '@/components/layout/AppHeader';
import AppNav from '@/components/layout/AppNav';
import CoachFAB from '@/components/coach/CoachFAB';
import { grasslandsRacePlan } from '@/data/reference-data';
import { getDaysUntil } from '@/utils/workout';

export default function GrasslandsRacePage() {
  const days = getDaysUntil('2027-03-20');

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <AppHeader title="Grasslands 100" />

      <main className="flex-1 overflow-y-auto px-4 pb-32 pt-4 max-w-lg mx-auto w-full">
        {/* Hero */}
        <div className="card mb-4" style={{ borderColor: 'rgba(168,85,247,0.4)', background: 'linear-gradient(135deg, #1E293B, #1a1232)' }}>
          <div className="text-xs font-semibold tracking-widest mb-1" style={{ color: '#A855F7' }}>
            2027 GRASSLANDS TRAIL RUN 100-MILE
          </div>
          <div className="text-3xl font-black" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>
            Sub-24 Hours
          </div>
          <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            March 20-21, 2027 · LBJ Grasslands, Decatur, TX · First 100-Miler
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="text-2xl font-black" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#A855F7' }}>
              {days > 0 ? days : '🏆'}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {days > 0 ? 'days away' : 'Race complete!'}
            </div>
          </div>
          <div className="mt-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
            ~4,000 ft elevation gain · 30-hour cutoff · Pacers from mile 54.9
          </div>
        </div>

        {/* Pacing strategy */}
        <div className="card mb-4">
          <div className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            🎯 Race Pacing Strategy
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>Overall target</span>
              <span style={{ color: '#A855F7', fontFamily: 'JetBrains Mono, monospace' }}>
                {grasslandsRacePlan.pacing.overall}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>Flat sections</span>
              <span style={{ color: '#22C55E', fontFamily: 'JetBrains Mono, monospace' }}>
                {grasslandsRacePlan.pacing.flats}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>Uphills & aid stations</span>
              <span style={{ color: '#F59E0B', fontFamily: 'JetBrains Mono, monospace' }}>
                {grasslandsRacePlan.pacing.uphills}
              </span>
            </div>
          </div>
          <div
            className="mt-3 pt-3 text-sm text-center font-semibold"
            style={{ borderTop: '1px solid var(--border-subtle)', color: '#EF4444' }}
          >
            ⚠️ {grasslandsRacePlan.pacing.warning}
          </div>
        </div>

        {/* Fueling */}
        <div className="card mb-4">
          <div className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            ⚡ Ultra Fueling Strategy
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span style={{ color: '#F59E0B', fontWeight: 600 }}>Calories: </span>
              <span style={{ color: 'var(--text-secondary)' }}>{grasslandsRacePlan.fueling.calories}</span>
            </div>
            <div>
              <span style={{ color: '#F59E0B', fontWeight: 600 }}>Timer: </span>
              <span style={{ color: 'var(--text-secondary)' }}>{grasslandsRacePlan.fueling.timer}</span>
            </div>
            <div>
              <span style={{ color: '#F59E0B', fontWeight: 600 }}>Rule: </span>
              <span style={{ color: 'var(--text-secondary)' }}>{grasslandsRacePlan.fueling.rule}</span>
            </div>
          </div>
        </div>

        {/* Aid stations */}
        <div className="card mb-4">
          <div className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            🏕️ Aid Station Protocol
          </div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {grasslandsRacePlan.aidStations}
          </div>
          <div className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
            Time target: In and out in 3-5 minutes maximum
          </div>
        </div>

        {/* Night running */}
        <div className="card mb-4">
          <div className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            🌙 Night Running Gear
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center gap-2">
              <span>🔦</span>
              <span style={{ color: 'var(--text-secondary)' }}>{grasslandsRacePlan.night.headlamp}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>💡</span>
              <span style={{ color: 'var(--text-secondary)' }}>{grasslandsRacePlan.night.backup}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🧤</span>
              <span style={{ color: 'var(--text-secondary)' }}>{grasslandsRacePlan.night.gear}</span>
            </div>
          </div>
        </div>

        {/* Pacer */}
        <div className="card mb-4">
          <div className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            👥 Pacer Strategy
          </div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {grasslandsRacePlan.pacer}
          </div>
        </div>

        {/* Mindset */}
        <div className="card mb-4">
          <div className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            🧠 Race Mindset
          </div>
          <div className="space-y-2">
            {grasslandsRacePlan.mindset.map((tip, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-base mt-0.5">💜</span>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Segment pacing */}
        <div className="card mb-4">
          <div className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            📊 Nutrition by Segment
          </div>
          <div className="space-y-2">
            {[
              { segment: 'Miles 1-30',   calPerHour: '250-300', options: 'Gels, chews, PB&J, bananas', color: '#22C55E' },
              { segment: 'Miles 30-60',  calPerHour: '200-250', options: 'Potatoes, broth, quesadillas, pretzels', color: '#F59E0B' },
              { segment: 'Miles 60-80',  calPerHour: '150-200', options: 'Broth, flat Coke, ginger chews, watermelon', color: '#EF4444' },
              { segment: 'Miles 80-100', calPerHour: '100-200', options: 'Whatever you tolerate; Coke + broth', color: '#A855F7' },
            ].map(({ segment, calPerHour, options, color }) => (
              <div key={segment} className="flex gap-3 items-start">
                <span className="text-xs font-bold w-24 flex-shrink-0" style={{ color, fontFamily: 'JetBrains Mono, monospace' }}>
                  {segment}
                </span>
                <div>
                  <span className="text-xs font-semibold" style={{ color: '#F59E0B' }}>{calPerHour} cal/hr · </span>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{options}</span>
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
