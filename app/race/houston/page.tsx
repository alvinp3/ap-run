'use client';

import AppHeader from '@/components/layout/AppHeader';
import AppNav from '@/components/layout/AppNav';
import CoachFAB from '@/components/coach/CoachFAB';
import { houstonRacePlan } from '@/data/reference-data';
import { getDaysUntil } from '@/utils/workout';

export default function HoustonRacePage() {
  const days = getDaysUntil('2027-01-17');

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <AppHeader title="Houston Marathon" />

      <main className="flex-1 overflow-y-auto px-4 pb-32 pt-4 max-w-lg mx-auto w-full">
        {/* Hero */}
        <div className="card mb-4" style={{ borderColor: 'rgba(139,92,246,0.4)', background: 'linear-gradient(135deg, rgba(17,17,19,0.9), rgba(22,20,50,0.9))' }}>
          <div className="text-xs font-semibold tracking-widest mb-1" style={{ color: '#8B5CF6' }}>
            2027 CHEVRON HOUSTON MARATHON
          </div>
          <div className="text-3xl font-black" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
            Sub-2:50:00
          </div>
          <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            January 17, 2027 · Houston, TX · Boston Qualifier
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div
              className="text-2xl font-black"
              style={{ fontFamily: 'DM Mono, monospace', color: '#8B5CF6' }}
            >
              {days > 0 ? days : '🎉'}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {days > 0 ? 'days away' : 'Race complete!'}
            </div>
          </div>
        </div>

        {/* Pacing plan */}
        <div className="card mb-4">
          <div className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            🎯 Race Pacing — Negative Split Strategy
          </div>
          <div className="space-y-2">
            {[
              { segment: 'Miles 1-13', pace: houstonRacePlan.pacing.miles1to13.pace, note: houstonRacePlan.pacing.miles1to13.note, color: '#22C55E' },
              { segment: 'Miles 14-20', pace: houstonRacePlan.pacing.miles14to20.pace, note: houstonRacePlan.pacing.miles14to20.note, color: '#3B82F6' },
              { segment: 'Miles 21-26.2', pace: houstonRacePlan.pacing.miles21to26.pace, note: houstonRacePlan.pacing.miles21to26.note, color: '#EF4444' },
            ].map(({ segment, pace, note, color }) => (
              <div key={segment} className="flex gap-3 items-start">
                <div
                  className="text-xs font-bold w-24 flex-shrink-0 pt-0.5"
                  style={{ fontFamily: 'DM Mono, monospace', color }}
                >
                  {segment}
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color }}>{pace}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{note}</div>
                </div>
              </div>
            ))}
          </div>
          <div
            className="mt-3 pt-3 text-sm font-bold text-center"
            style={{ borderTop: '1px solid var(--border-subtle)', color: '#8B5CF6', fontFamily: 'DM Mono, monospace' }}
          >
            {houstonRacePlan.pacing.halfSplit}
          </div>
        </div>

        {/* Morning routine */}
        <div className="card mb-4">
          <div className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            🌅 Race Morning Protocol
          </div>
          <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <div className="flex items-start gap-2">
              <span style={{ color: '#8B5CF6', fontFamily: 'DM Mono, monospace', flexShrink: 0, width: 64 }}>
                {houstonRacePlan.morning.wakeUp}
              </span>
              <span>Wake up. Eat breakfast immediately.</span>
            </div>
            <div className="flex items-start gap-2">
              <span style={{ color: 'var(--text-tertiary)', fontFamily: 'DM Mono, monospace', flexShrink: 0, width: 64 }}>
                Breakfast
              </span>
              <span>{houstonRacePlan.morning.breakfast}</span>
            </div>
            <div className="flex items-start gap-2">
              <span style={{ color: 'var(--text-tertiary)', fontFamily: 'DM Mono, monospace', flexShrink: 0, width: 64 }}>
                Arrive
              </span>
              <span>{houstonRacePlan.morning.arrive}</span>
            </div>
            <div className="flex items-start gap-2">
              <span style={{ color: 'var(--text-tertiary)', fontFamily: 'DM Mono, monospace', flexShrink: 0, width: 64 }}>
                Warmup
              </span>
              <span>{houstonRacePlan.morning.warmup}</span>
            </div>
          </div>
        </div>

        {/* Fueling */}
        <div className="card mb-4">
          <div className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            ⚡ Race Fueling Strategy
          </div>
          <div className="space-y-2">
            {houstonRacePlan.fueling.map((tip, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#F59E0B' }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mental checkpoints */}
        <div className="card mb-4">
          <div className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            🧠 Mental Checkpoints
          </div>
          <div className="space-y-3">
            {houstonRacePlan.mentalCheckpoints.map(({ mile, message }) => (
              <div key={mile} className="flex gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
                  style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444', fontFamily: 'DM Mono, monospace' }}
                >
                  {mile}
                </div>
                <div className="flex-1 pt-2">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{message}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BQ context */}
        <div
          className="card mb-4"
          style={{ background: 'rgba(139,92,246,0.05)', borderColor: 'rgba(139,92,246,0.2)' }}
        >
          <div className="text-sm font-bold mb-2" style={{ color: '#8B5CF6' }}>
            Boston Qualifier Context
          </div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            BQ standard for males 18-34: <strong>2:55:00</strong>. The 2025 cutoff was 6:51 below the standard — 12,324 qualifiers were rejected. Sub-2:50 provides a safe cushion for acceptance.
          </div>
          <div
            className="mt-2 text-sm font-bold"
            style={{ color: '#8B5CF6', fontFamily: 'DM Mono, monospace' }}
          >
            Target: 2:50:00 → BQ safety buffer: 5:00
          </div>
        </div>
      </main>

      <AppNav />
      <CoachFAB />
    </div>
  );
}
