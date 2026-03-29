'use client';

import { useState, useEffect } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import AppNav from '@/components/layout/AppNav';
import CoachFAB from '@/components/coach/CoachFAB';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { allWeeks, trainingPhases, getCurrentWeek, getDaysUntil } from '@/data/training-plan';

interface LogData {
  date: string;
  completed: boolean;
  skipped: boolean;
  actualMiles?: number;
}

export default function ProgressPage() {
  const [logs, setLogs] = useState<LogData[]>([]);

  useEffect(() => {
    fetch('/api/logs')
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setLogs(d); })
      .catch(() => {});
  }, []);

  const logsMap = logs.reduce((acc, l) => { acc[l.date] = l; return acc; }, {} as Record<string, LogData>);
  const today = new Date();
  const currentWeek = getCurrentWeek(today);

  // Total miles completed
  const totalMilesCompleted = logs
    .filter((l) => l.completed)
    .reduce((sum, l) => sum + (l.actualMiles ?? 0), 0);

  // Total planned miles in plan
  const totalPlannedMiles = allWeeks.reduce((sum, w) => sum + w.totalMiles, 0);

  // Completion rate
  const pastWorkouts = allWeeks
    .flatMap((w) => w.days)
    .filter((d) => d.date < today.toISOString().split('T')[0]);
  const completedCount = pastWorkouts.filter((d) => logsMap[d.date]?.completed).length;
  const completionRate = pastWorkouts.length > 0
    ? Math.round((completedCount / pastWorkouts.length) * 100)
    : 0;

  // Longest completed run
  const longestRun = logs
    .filter((l) => l.completed && (l.actualMiles ?? 0) > 0)
    .reduce((max, l) => Math.max(max, l.actualMiles ?? 0), 0);

  // Weekly mileage chart data (last 20 completed weeks)
  const weeklyChartData = allWeeks
    .filter((w) => new Date(w.startDate) <= today)
    .slice(-20)
    .map((w) => {
      const actual = w.days
        .filter((d) => logsMap[d.date]?.completed)
        .reduce((sum, d) => sum + (logsMap[d.date]?.actualMiles ?? d.miles), 0);
      return {
        week: `Wk ${w.week}`,
        planned: w.totalMiles,
        actual: parseFloat(actual.toFixed(1)),
      };
    });

  // Phase progress
  const completedWeeks = allWeeks.filter((w) => {
    const weekEnd = new Date(w.startDate);
    weekEnd.setDate(weekEnd.getDate() + 6);
    return weekEnd < today;
  }).length;

  const houstonDays = getDaysUntil('2027-01-17');
  const grasslandsDays = getDaysUntil('2027-03-20');

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <AppHeader title="Progress & Stats" />

      <main className="flex-1 overflow-y-auto px-4 pb-32 pt-4 max-w-lg mx-auto w-full">
        <h1
          className="text-2xl font-black mb-4"
          style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}
        >
          Training Progress
        </h1>

        {/* Key stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: 'Miles Logged', value: totalMilesCompleted.toFixed(0), unit: 'mi', color: 'var(--accent-teal)' },
            { label: 'Completion Rate', value: `${completionRate}`, unit: '%', color: '#22C55E' },
            { label: 'Longest Run', value: longestRun.toFixed(1), unit: 'mi', color: '#3B82F6' },
            { label: 'Weeks Done', value: `${completedWeeks}`, unit: '/ 51', color: '#F59E0B' },
          ].map(({ label, value, unit, color }) => (
            <div key={label} className="card text-center" style={{ padding: '16px' }}>
              <div
                className="text-3xl font-black"
                style={{ fontFamily: 'JetBrains Mono, monospace', color }}
              >
                {value}
                <span className="text-sm font-normal ml-1" style={{ color: 'var(--text-secondary)' }}>
                  {unit}
                </span>
              </div>
              <div
                className="text-xs mt-1"
                style={{ color: 'var(--text-tertiary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Race countdowns */}
        <div className="card mb-6">
          <div className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Race Countdowns</div>
          <div className="space-y-3">
            {[
              { name: '🏆 Houston Marathon', date: '2027-01-17', days: houstonDays, color: '#2DD4BF', goal: 'Sub-2:50:00' },
              { name: '🌟 Grasslands 100',   date: '2027-03-20', days: grasslandsDays, color: '#A855F7', goal: 'Sub-24 hours' },
            ].map(({ name, days, color, goal }) => (
              <div key={name}>
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{name}</span>
                    <span className="text-xs ml-2" style={{ color: 'var(--text-tertiary)' }}>· Goal: {goal}</span>
                  </div>
                  <span
                    className="text-lg font-black"
                    style={{ fontFamily: 'JetBrains Mono, monospace', color }}
                  >
                    {days > 0 ? `${days}d` : 'DONE'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total mileage progress bar */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
              Plan Progress
            </span>
            <span className="text-sm" style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-secondary)' }}>
              {totalMilesCompleted.toFixed(0)} / {totalPlannedMiles} mi
            </span>
          </div>
          <div className="progress-bar h-3 mb-1">
            <div
              className="progress-fill h-3"
              style={{
                width: `${Math.min(100, (totalMilesCompleted / totalPlannedMiles) * 100)}%`,
                background: 'var(--accent-teal)',
              }}
            />
          </div>
          <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {Math.round((totalMilesCompleted / totalPlannedMiles) * 100)}% of total training mileage
          </div>
        </div>

        {/* Weekly mileage chart */}
        {weeklyChartData.length > 0 && (
          <div className="card mb-6">
            <div className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Weekly Mileage — Planned vs Actual
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weeklyChartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(71,85,105,0.3)" />
                <XAxis dataKey="week" tick={{ fill: '#64748B', fontSize: 10 }} interval={3} />
                <YAxis tick={{ fill: '#64748B', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 8,
                    color: 'var(--text-primary)',
                    fontSize: 12,
                  }}
                />
                <Line type="monotone" dataKey="planned" stroke="#334155" strokeWidth={2} dot={false} name="Planned" />
                <Line type="monotone" dataKey="actual" stroke="#2DD4BF" strokeWidth={2} dot={false} name="Actual" />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2 justify-center">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-0.5" style={{ background: '#334155' }} />
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Planned</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-0.5" style={{ background: '#2DD4BF' }} />
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Actual</span>
              </div>
            </div>
          </div>
        )}

        {/* Phase timeline */}
        <div className="card mb-6">
          <div className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            Phase Timeline
          </div>
          <div className="space-y-2">
            {trainingPhases.map((phase) => {
              const phaseCompleted = Math.min(
                phase.endWeek - phase.startWeek + 1,
                Math.max(0, completedWeeks - phase.startWeek + 1)
              );
              const phaseTotal = phase.endWeek - phase.startWeek + 1;
              const pct = Math.round((phaseCompleted / phaseTotal) * 100);
              const isActive = currentWeek
                ? currentWeek.week >= phase.startWeek && currentWeek.week <= phase.endWeek
                : false;

              return (
                <div key={phase.phase}>
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="text-xs font-semibold"
                      style={{ color: isActive ? phase.color : 'var(--text-secondary)' }}
                    >
                      Phase {phase.phase}: {phase.name}
                      {isActive && ' ← NOW'}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)', fontFamily: 'JetBrains Mono, monospace' }}>
                      {pct}%
                    </span>
                  </div>
                  <div className="progress-bar" style={{ height: 6 }}>
                    <div
                      className="progress-fill"
                      style={{ width: `${pct}%`, background: phase.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Milestones */}
        <div className="card mb-6">
          <div className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            Key Milestones
          </div>
          <div className="space-y-2">
            {[
              { label: 'First 40-mile week',  achieved: allWeeks.filter(w => new Date(w.startDate) < today).some(w => w.totalMiles >= 40) },
              { label: 'First 50-mile week',  achieved: allWeeks.filter(w => new Date(w.startDate) < today).some(w => w.totalMiles >= 50) },
              { label: 'First 60-mile week',  achieved: allWeeks.filter(w => new Date(w.startDate) < today).some(w => w.totalMiles >= 60) },
              { label: 'First 70-mile week',  achieved: allWeeks.filter(w => new Date(w.startDate) < today).some(w => w.totalMiles >= 70) },
              { label: 'First 20-miler',      achieved: longestRun >= 20 },
              { label: '100 miles logged',    achieved: totalMilesCompleted >= 100 },
              { label: '500 miles logged',    achieved: totalMilesCompleted >= 500 },
              { label: 'Houston Marathon',    achieved: getDaysUntil('2027-01-17') <= 0 },
              { label: 'Grasslands 100',      achieved: getDaysUntil('2027-03-21') <= 0 },
            ].map(({ label, achieved }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-lg">{achieved ? '✅' : '○'}</span>
                <span
                  className="text-sm"
                  style={{ color: achieved ? 'var(--text-primary)' : 'var(--text-tertiary)' }}
                >
                  {label}
                </span>
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
