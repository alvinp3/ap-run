'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import AppHeader from '@/components/layout/AppHeader';
import AppNav from '@/components/layout/AppNav';
import TodayWorkoutCard from '@/components/ui/TodayWorkoutCard';
import RaceCountdown from '@/components/ui/RaceCountdown';
import WeatherStrip from '@/components/ui/WeatherStrip';
import CoachFAB from '@/components/coach/CoachFAB';
import SleepRecommendation from '@/components/ui/SleepRecommendation';
import { getCurrentWeek, getTodayWorkout, getWorkoutByDate, getPhaseForWeek, allWeeks, getDaysUntil } from '@/data/training-plan';
import { formatMiles, toLocalDateStr } from '@/utils/workout';
import type { WorkoutDay, WorkoutLog } from '@/types';

const TOTAL_WEEKS = 51;
const HOUSTON_DATE = '2027-01-17';
const GRASSLANDS_DATE = '2027-03-20';

interface LogState {
  [date: string]: { completed: boolean; skipped: boolean; actualMiles?: number; notes?: string };
}

function getPhaseColor(phase: number): string {
  const colors: Record<number, string> = {
    1: '#22C55E', 2: '#F59E0B', 3: '#3B82F6', 4: '#8B5CF6', 5: '#EF4444',
  };
  return colors[phase] ?? '#94A3B8';
}

function calculateStreak(logs: LogState, todayStr: string): number {
  let streak = 0;
  const date = new Date(todayStr + 'T00:00:00');
  for (let i = 0; i < 365; i++) {
    const dateStr = toLocalDateStr(date);
    const log = logs[dateStr];
    if (log?.completed || log?.skipped) {
      streak++;
    } else if (i > 0) {
      break;
    }
    date.setDate(date.getDate() - 1);
  }
  return streak;
}

function isHeatPeriod(dateStr?: string): boolean {
  if (!dateStr) return false;
  const month = new Date(dateStr + 'T00:00:00').getMonth();
  return month >= 5 && month <= 8;
}

export default function DashboardPage() {
  const [logs, setLogs] = useState<LogState>({});
  const [logsLoaded, setLogsLoaded] = useState(false);
  const [garminHealth, setGarminHealth] = useState<{
    restingHR?: number; sleepScore?: number; bodyBattery?: number; trainingReadiness?: number;
  } | null>(null);

  const today = new Date();
  const todayStr = toLocalDateStr(today);
  const todayWorkout = getTodayWorkout(today) as (WorkoutDay & { weekNumber: number; isDownWeek: boolean }) | null;
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = toLocalDateStr(tomorrow);
  const tomorrowWorkout = getWorkoutByDate(tomorrowStr);
  const currentWeek = getCurrentWeek(today);
  const phase = currentWeek ? getPhaseForWeek(currentWeek.week) : null;

  const completedWeeks = allWeeks.filter((w) => {
    const weekEnd = new Date(w.startDate);
    weekEnd.setDate(weekEnd.getDate() + 6);
    return weekEnd < today;
  }).length;

  const weekCompletedMiles = currentWeek?.days
    .filter((d) => logs[d.date]?.completed)
    .reduce((sum, d) => sum + (logs[d.date]?.actualMiles ?? d.miles), 0) ?? 0;

  const streak = calculateStreak(logs, todayStr);

  useEffect(() => {
    fetch('/api/logs')
      .then((r) => r.json())
      .then((data: Array<{ date: string; completed: boolean; skipped: boolean; actualMiles?: number; notes?: string }>) => {
        const map: LogState = {};
        if (Array.isArray(data)) {
          data.forEach((l) => { map[l.date] = l; });
        }
        setLogs(map);
        setLogsLoaded(true);
      })
      .catch(() => setLogsLoaded(true));
  }, []);

  useEffect(() => {
    fetch('/api/garmin/health')
      .then((r) => r.json())
      .then((d) => { if (!d.stub) setGarminHealth(d); })
      .catch(() => {});
  }, []);

  const handleComplete = useCallback(async (notes?: string) => {
    if (!todayWorkout) return;
    const res = await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: todayWorkout.date, completed: true, actualMiles: todayWorkout.miles, notes }),
    });
    const saved = await res.json();
    setLogs((prev) => ({ ...prev, [todayWorkout.date]: { ...saved, completed: true } }));
  }, [todayWorkout]);

  const handleSkip = useCallback(async () => {
    if (!todayWorkout) return;
    const res = await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: todayWorkout.date, skipped: true }),
    });
    const saved = await res.json();
    setLogs((prev) => ({ ...prev, [todayWorkout.date]: { ...saved, skipped: true } }));
  }, [todayWorkout]);

  const todayLog = todayWorkout ? logs[todayWorkout.date] : null;
  const heatAdvisory = isHeatPeriod(todayWorkout?.date);

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <AppHeader />

      <main className="flex-1 overflow-y-auto px-4 pb-32 pt-4 max-w-lg mx-auto w-full">
        {/* Race Countdowns */}
        <section className="mb-4">
          <div className="flex flex-col gap-3">
            <RaceCountdown
              name="Houston Marathon"
              date={HOUSTON_DATE}
              emoji="🏆"
              color="#5B5BFF"
              bgVariant="marathon"
              totalWeeks={TOTAL_WEEKS}
              currentWeek={completedWeeks}
              isActive={getDaysUntil(HOUSTON_DATE) > 0}
            />
            <RaceCountdown
              name="Grasslands 100"
              date={GRASSLANDS_DATE}
              emoji="🌟"
              color="#F59E0B"
              bgVariant="ultra"
              totalWeeks={TOTAL_WEEKS}
              currentWeek={completedWeeks}
              isActive={getDaysUntil(HOUSTON_DATE) <= 0}
            />
          </div>
        </section>

        {/* Weather Strip */}
        <section className="mb-4">
          <WeatherStrip />
        </section>

        {/* Today's Workout — THE hero element */}
        <section className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: 'var(--text-tertiary)', fontFamily: 'DM Sans, sans-serif' }}
            >
              Today&apos;s Training
            </h2>
            <span
              className="text-xs"
              style={{ color: 'var(--text-tertiary)', fontFamily: 'DM Mono, monospace' }}
            >
              {today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>

          {!logsLoaded ? (
            <div className="card skeleton h-48" />
          ) : todayWorkout && phase ? (
            <TodayWorkoutCard
              workout={todayWorkout}
              phase={phase.phase}
              phaseName={phase.name}
              totalWeeks={TOTAL_WEEKS}
              log={todayLog as WorkoutLog | null}
              onComplete={handleComplete}
              onSkip={handleSkip}
              heatAdjusted={heatAdvisory}
            />
          ) : (
            <div className="card text-center py-8">
              <div className="text-4xl mb-3">🎉</div>
              <div className="text-lg font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
                Training Complete!
              </div>
              <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                The 51-week program is finished. You did it.
              </div>
            </div>
          )}
        </section>

        {/* Sleep / Wind-Down Recommendation */}
        <SleepRecommendation
          tomorrowWorkout={tomorrowWorkout ? { type: tomorrowWorkout.type, estimatedMinutes: tomorrowWorkout.estimatedMinutes, description: tomorrowWorkout.description } : null}
          todayStr={todayStr}
        />

        {/* Weekly Mileage Progress */}
        {currentWeek && (
          <section className="mb-4">
            <div className="card" style={{ padding: '14px 16px' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                  WEEK {currentWeek.week} MILEAGE
                </span>
                <span className="text-sm font-bold" style={{ fontFamily: 'DM Mono, monospace' }}>
                  {formatMiles(weekCompletedMiles)} / {currentWeek.totalMiles} mi
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min(100, (weekCompletedMiles / currentWeek.totalMiles) * 100)}%`,
                    background: 'linear-gradient(135deg, #8B5CF6, #6366F1, #06B6D4)',
                  }}
                />
              </div>
              {currentWeek.isDownWeek && (
                <div className="text-xs mt-1.5" style={{ color: '#8B5CF6' }}>
                  Recovery week — reduced volume
                </div>
              )}
            </div>
          </section>
        )}

        {/* Streak Counter */}
        {streak > 0 && (
          <section className="mb-4">
            <div className="card flex items-center gap-3" style={{ padding: '12px 16px' }}>
              <span className="text-2xl">🔥</span>
              <div>
                <span className="text-xl font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {streak}
                </span>
                <span className="text-sm ml-1.5" style={{ color: 'var(--text-secondary)' }}>
                  day training streak
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Garmin Health Strip */}
        {garminHealth && (
          <section className="mb-4">
            <div className="card" style={{ padding: '12px 16px' }}>
              <div className="text-xs font-semibold tracking-wide mb-2" style={{ color: 'var(--text-tertiary)' }}>
                GARMIN HEALTH
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                {garminHealth.restingHR && (
                  <div className="text-center">
                    <div className="text-lg font-bold" style={{ fontFamily: 'DM Mono, monospace', color: '#EF4444' }}>
                      {garminHealth.restingHR}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>RHR</div>
                  </div>
                )}
                {garminHealth.sleepScore && (
                  <div className="text-center">
                    <div className="text-lg font-bold" style={{ fontFamily: 'DM Mono, monospace', color: '#3B82F6' }}>
                      {garminHealth.sleepScore}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Sleep</div>
                  </div>
                )}
                {garminHealth.bodyBattery && (
                  <div className="text-center">
                    <div className="text-lg font-bold" style={{ fontFamily: 'DM Mono, monospace', color: '#22C55E' }}>
                      {garminHealth.bodyBattery}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Battery</div>
                  </div>
                )}
                {garminHealth.trainingReadiness && (
                  <div className="text-center">
                    <div className="text-lg font-bold" style={{ fontFamily: 'DM Mono, monospace', color: '#F59E0B' }}>
                      {garminHealth.trainingReadiness}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Readiness</div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Quick Links */}
        <section className="mb-4">
          <div className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--text-tertiary)' }}>
            Quick Access
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/recovery',       icon: '💪', label: 'Recovery & Mobility', sub: "Today's protocol" },
              { href: '/nutrition',      icon: '🥗', label: 'Nutrition Guide',      sub: 'Pre/post-run fuel' },
              { href: '/race/houston',   icon: '🏆', label: 'Houston Race Plan',    sub: 'Jan 17, 2027' },
              { href: '/race/grasslands',icon: '🌟', label: 'Grasslands 100',       sub: 'Mar 20-21, 2027' },
            ].map(({ href, icon, label, sub }) => (
              <Link
                key={href}
                href={href}
                className="card flex items-center gap-3 min-h-0"
                style={{ padding: '12px 14px', textDecoration: 'none', transition: 'background 0.15s' }}
              >
                <span className="text-2xl flex-shrink-0">{icon}</span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                    {label}
                  </div>
                  <div className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>
                    {sub}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Phase info */}
        {phase && currentWeek && (
          <section className="mb-4">
            <div className="card" style={{ padding: '14px 16px', borderColor: `${getPhaseColor(phase.phase)}33` }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold tracking-wide" style={{ color: getPhaseColor(phase.phase) }}>
                    PHASE {phase.phase} · {phase.name.toUpperCase()}
                  </div>
                  <div className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    Weeks {phase.startWeek}–{phase.endWeek} ·{' '}
                    {Math.round(((currentWeek.week - phase.startWeek) / (phase.endWeek - phase.startWeek + 1)) * 100)}% complete
                  </div>
                </div>
                <Link href="/calendar" className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px', minHeight: 36 }}>
                  Full Plan
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      <AppNav />
      <CoachFAB />
    </div>
  );
}
