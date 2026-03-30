'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppHeader from '@/components/layout/AppHeader';
import AppNav from '@/components/layout/AppNav';
import CoachFAB from '@/components/coach/CoachFAB';
import WorkoutBadge from '@/components/ui/WorkoutBadge';
import { getCurrentWeek, getPhaseForWeek, getWeekByNumber, allWeeks } from '@/data/training-plan';
import { formatMiles, formatDuration, isToday, isPast, getWorkoutColor } from '@/utils/workout';
import { parseWorkoutDescription } from '@/utils/parseWorkout';
import type { WorkoutDay, WorkoutType } from '@/types';

function blockColor(label: string): string {
  const u = label.toUpperCase();
  if (u === 'WARMUP' || u === 'COOLDOWN') return '#52525B';
  if (u === 'INTERVALS')                  return '#EF4444';
  if (u === 'TEMPO' || u === 'FARTLEK' || u === 'STRIDES' || u === 'PICKUP') return '#F59E0B';
  if (u === 'EASY' || u === 'RUN' || u === 'LONG RUN') return '#22C55E';
  if (u.startsWith('STRENGTH'))           return '#B388FF';
  if (u === 'FINISH')                     return '#00E5FF';
  if (u === 'FUEL')                       return '#F59E0B';
  if (u === 'REST')                       return '#3A3A3A';
  return '#52525B';
}

function WorkoutSegments({ description, type, phase }: { description: string; type: WorkoutType; phase?: number }) {
  const blocks = parseWorkoutDescription(description, type, phase);
  if (!blocks.length) return null;

  // Notes and rest-label blocks add noise — skip them in the compact view
  const visible = blocks.filter(b => b.kind !== 'note' && b.label !== 'REST');
  if (!visible.length) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 5 }}>
      {visible.map((block, i) => {
        const color = blockColor(block.label);
        const isStrength = block.kind === 'strength';
        const exercises = block.exercises ?? [];
        const shown = exercises.slice(0, 4);
        const extra = exercises.length - shown.length;

        return (
          <div key={i}>
            {/* Label + key metrics row */}
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '2px 8px' }}>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                color, fontWeight: 700, lineHeight: 1.2,
              }}>
                {block.label}
              </span>
              {block.count && !isStrength && (
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#00E5FF' }}>
                  {block.count}
                </span>
              )}
              {block.pace && (
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#F59E0B' }}>
                  @{block.pace}
                </span>
              )}
              {block.recovery && (
                <span style={{ fontSize: 9, color: '#52525B', fontFamily: 'Manrope, sans-serif' }}>
                  {block.recovery} rest
                </span>
              )}
              {isStrength && block.detail && (
                <span style={{ fontSize: 10, color: 'var(--text-tertiary)', fontFamily: 'Manrope, sans-serif' }}>
                  {block.detail}
                </span>
              )}
            </div>

            {/* Exercises */}
            {shown.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginTop: 2, paddingLeft: 8, borderLeft: `2px solid ${color}22` }}>
                {shown.map((ex, j) => (
                  <span key={j} style={{
                    fontSize: 10, color: 'var(--text-secondary)',
                    fontFamily: 'DM Sans, sans-serif', lineHeight: 1.4,
                  }}>
                    {ex}
                  </span>
                ))}
                {extra > 0 && (
                  <span style={{ fontSize: 9, color: '#52525B', fontFamily: 'Manrope, sans-serif' }}>
                    +{extra} more
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function WeekPage() {
  const [weekNum, setWeekNumRaw] = useState<number>(1);
  const [logs, setLogs] = useState<Record<string, { completed: boolean; skipped: boolean }>>({});
  const [overrideDates, setOverrideDates] = useState<Set<string>>(new Set());

  const today = new Date();

  // On mount: read ?w= directly from window.location (avoids Suspense requirement
  // of useSearchParams). Falls back to the current training week.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const param  = params.get('w');
    const parsed = param ? parseInt(param, 10) : NaN;
    if (!isNaN(parsed) && parsed >= 1 && parsed <= allWeeks.length) {
      setWeekNumRaw(parsed);
    } else {
      const cw = getCurrentWeek(today);
      setWeekNumRaw(cw?.week ?? 1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update state AND URL together — use replaceState so browser back works
  function setWeekNum(n: number | ((prev: number) => number)) {
    setWeekNumRaw((prev) => {
      const next = typeof n === 'function' ? n(prev) : n;
      window.history.replaceState(null, '', `/week?w=${next}`);
      return next;
    });
  }

  useEffect(() => {
    fetch('/api/logs')
      .then((r) => r.json())
      .then((data: Array<{ date: string; completed: boolean; skipped: boolean }>) => {
        const map: Record<string, { completed: boolean; skipped: boolean }> = {};
        if (Array.isArray(data)) {
          data.forEach((l) => { map[l.date] = l; });
        }
        setLogs(map);
      })
      .catch(() => {});
  }, []);

  const week = getWeekByNumber(weekNum);

  useEffect(() => {
    if (!week) return;
    fetch(`/api/workouts/override`)
      .then(r => r.json())
      .then((data: Array<{ date: string }>) => {
        if (!Array.isArray(data)) return;
        const dates = new Set(data.map(o => o.date));
        setOverrideDates(dates);
      })
      .catch(() => {});
  }, [week]);
  const phase = getPhaseForWeek(weekNum);

  const totalWeeks = allWeeks.length;
  const canGoBack = weekNum > 1;
  const canGoForward = weekNum < totalWeeks;

  const completedMiles = week?.days
    .filter((d) => logs[d.date]?.completed)
    .reduce((sum, d) => sum + d.miles, 0) ?? 0;

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <AppHeader />

      <main className="flex-1 overflow-y-auto px-4 pb-32 pt-4 max-w-lg mx-auto w-full">
        {/* Week navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setWeekNum((w) => Math.max(1, w - 1))}
            disabled={!canGoBack}
            className="btn-secondary"
            style={{ padding: '8px 16px', minHeight: 40, opacity: canGoBack ? 1 : 0.3 }}
          >
            ←
          </button>
          <div className="text-center">
            {phase && (
              <div
                className="text-xs font-semibold tracking-wide"
                style={{ color: phase.color, fontFamily: 'DM Sans, sans-serif' }}
              >
                PHASE {phase.phase} · {phase.name.toUpperCase()}
              </div>
            )}
            <div
              className="text-lg font-black"
              style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
            >
              Week {weekNum} of {totalWeeks}
            </div>
            {week && (
              <div
                className="text-xs"
                style={{ color: 'var(--text-tertiary)', fontFamily: 'DM Sans, sans-serif' }}
              >
                {new Date(week.startDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                {' – '}
                {new Date(week.days[6].date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            )}
          </div>
          <button
            onClick={() => setWeekNum((w) => Math.min(totalWeeks, w + 1))}
            disabled={!canGoForward}
            className="btn-secondary"
            style={{ padding: '8px 16px', minHeight: 40, opacity: canGoForward ? 1 : 0.3 }}
          >
            →
          </button>
        </div>

        {/* Down week badge */}
        {week?.isDownWeek && (
          <div
            className="rounded-xl px-4 py-2 mb-4 text-sm font-medium text-center"
            style={{ background: 'rgba(139,92,246,0.1)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.2)' }}
          >
            Recovery week — reduced volume and intensity
          </div>
        )}

        {/* Day cards */}
        <div className="space-y-2 mb-4">
          {week?.days.map((day: WorkoutDay) => {
            const log = logs[day.date];
            const isCurrentDay = isToday(day.date);
            const isPastDay = isPast(day.date) && !isCurrentDay;
            const color = getWorkoutColor(day.type);

            return (
              <Link
                key={day.date}
                href={`/workout/${day.date}`}
                className="card flex gap-3 min-h-0"
                style={{
                  padding: '12px 14px',
                  alignItems: 'flex-start',
                  borderColor: isCurrentDay ? `${color}55` : 'var(--border-subtle)',
                  boxShadow: isCurrentDay ? `0 0 16px ${color}15` : undefined,
                  textDecoration: 'none',
                  transition: 'background 0.15s',
                }}
              >
                {/* Day/Date */}
                <div
                  className="flex-shrink-0 text-center"
                  style={{ width: 44 }}
                >
                  <div
                    className="text-xs font-semibold"
                    style={{
                      color: isCurrentDay ? color : 'var(--text-tertiary)',
                      fontFamily: 'DM Sans, sans-serif',
                    }}
                  >
                    {day.day.slice(0, 3).toUpperCase()}
                  </div>
                  <div
                    className="text-lg font-black leading-none"
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      color: isCurrentDay ? color : 'var(--text-primary)',
                    }}
                  >
                    {new Date(day.date + 'T00:00:00').getDate()}
                  </div>
                </div>

                {/* Color dot */}
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: color }}
                />

                {/* Workout info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <WorkoutBadge type={day.type} size="sm" />
                    {day.hasStrength && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                        style={{ background: 'rgba(139,92,246,0.12)', color: '#8B5CF6' }}
                      >
                        + Strength
                      </span>
                    )}
                    {isCurrentDay && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                        style={{ background: `${color}20`, color }}
                      >
                        TODAY
                      </span>
                    )}
                  </div>
                  <WorkoutSegments description={day.description} type={day.type} phase={phase?.phase} />
                </div>

                {/* Right: miles + status */}
                <div className="flex-shrink-0 flex flex-col items-end gap-1" style={{ paddingTop: 2 }}>
                  {day.miles > 0 && (
                    <span
                      className="text-sm font-bold"
                      style={{ fontFamily: 'DM Mono, monospace', color: 'var(--text-primary)' }}
                    >
                      {formatMiles(day.miles)}mi
                    </span>
                  )}
                  {day.estimatedMinutes > 0 && (
                    <span
                      className="text-xs"
                      style={{ color: 'var(--text-tertiary)', fontFamily: 'DM Mono, monospace' }}
                    >
                      {formatDuration(day.estimatedMinutes)}
                    </span>
                  )}
                  {log?.completed && <span className="text-base">✅</span>}
                  {log?.skipped && <span className="text-base opacity-50">⏭️</span>}
                  {!log && isPastDay && day.type !== 'rest' && (
                    <span className="text-base opacity-30">○</span>
                  )}
                  {overrideDates.has(day.date) && (
                    <span style={{ fontSize: 10, color: '#B388FF', fontFamily: 'JetBrains Mono, monospace' }}>✎</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Weekly totals */}
        {week && (
          <div className="card" style={{ padding: '14px 16px' }}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                Week Total
              </span>
              <span className="text-sm font-bold" style={{ fontFamily: 'DM Mono, monospace' }}>
                {formatMiles(completedMiles)} / {week.totalMiles} mi planned
              </span>
            </div>
            <div className="progress-bar mt-2">
              <div
                className="progress-fill"
                style={{
                  width: `${Math.min(100, (completedMiles / week.totalMiles) * 100)}%`,
                  background: 'linear-gradient(135deg, #8B5CF6, #6366F1, #06B6D4)',
                }}
              />
            </div>
          </div>
        )}
      </main>

      <AppNav />
      <CoachFAB />
    </div>
  );
}
