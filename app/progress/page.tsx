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

interface WeeklySummaryRow {
  week_start: string;
  week_number: number;
  phase_name: string | null;
  grade: string | null;
  planned_miles: number;
  actual_miles: number;
  completion_rate: number;
  workouts_completed: number;
  workouts_planned: number;
  summary_text?: string;
  created_at: string;
}

const GRADE_COLOR: Record<string, string> = {
  'A': '#22C55E', 'A-': '#22C55E',
  'B+': '#84CC16', 'B': '#84CC16', 'B-': '#84CC16',
  'C+': '#F59E0B', 'C': '#F59E0B',
  'D': '#EF4444', 'F': '#EF4444',
};

export default function ProgressPage() {
  const [logs, setLogs] = useState<LogData[]>([]);
  const [summaries, setSummaries] = useState<WeeklySummaryRow[]>([]);
  const [activeSummary, setActiveSummary] = useState<WeeklySummaryRow | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genMsg, setGenMsg] = useState('');

  useEffect(() => {
    fetch('/api/logs')
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setLogs(d); })
      .catch(() => {});

    fetch('/api/weekly-summary?limit=12')
      .then(r => r.json())
      .then((d: WeeklySummaryRow[]) => {
        if (Array.isArray(d) && d.length > 0) {
          setSummaries(d);
          setActiveSummary(d[0]);
        }
      })
      .catch(() => {});
  }, []);

  async function handleGenerate() {
    setGenerating(true);
    setGenMsg('');
    try {
      const r = await fetch('/api/weekly-summary', { method: 'POST' });
      const d: WeeklySummaryRow = await r.json();
      if (d.week_start) {
        setSummaries(prev => {
          const filtered = prev.filter(s => s.week_start !== d.week_start);
          return [d, ...filtered];
        });
        setActiveSummary(d);
        setGenMsg('Summary generated!');
        setTimeout(() => setGenMsg(''), 3000);
      }
    } catch {
      setGenMsg('Failed to generate');
    } finally {
      setGenerating(false);
    }
  }

  async function loadFullSummary(row: WeeklySummaryRow) {
    if (row.summary_text) { setActiveSummary(row); return; }
    const r = await fetch(`/api/weekly-summary?week=${row.week_start}`);
    const d: WeeklySummaryRow = await r.json();
    if (d?.summary_text) {
      setSummaries(prev => prev.map(s => s.week_start === d.week_start ? d : s));
      setActiveSummary(d);
    }
  }

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
          style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
        >
          Training Progress
        </h1>

        {/* Weekly AI Summary */}
        <div className="card mb-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                Weekly Review
              </span>
              {activeSummary?.grade && (
                <span style={{
                  fontFamily: 'DM Mono, monospace', fontWeight: 700, fontSize: 13,
                  color: GRADE_COLOR[activeSummary.grade] ?? '#8B5CF6',
                  background: `${GRADE_COLOR[activeSummary.grade] ?? '#8B5CF6'}15`,
                  border: `1px solid ${GRADE_COLOR[activeSummary.grade] ?? '#8B5CF6'}40`,
                  borderRadius: 6, padding: '1px 8px',
                }}>
                  {activeSummary.grade}
                </span>
              )}
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating}
              style={{
                background: 'rgba(13,13,242,0.08)', border: '1px solid rgba(13,13,242,0.25)',
                borderRadius: 8, padding: '5px 12px',
                color: '#5B5BFF', fontSize: 11,
                fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
                cursor: generating ? 'not-allowed' : 'pointer',
                opacity: generating ? 0.6 : 1, minHeight: 'unset',
              }}
            >
              {generating ? 'Generating…' : summaries.length === 0 ? 'Generate Summary' : 'Regenerate'}
            </button>
          </div>

          {/* Week selector pills */}
          {summaries.length > 1 && (
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8, marginBottom: 8 }}>
              {summaries.map(s => {
                const isActive = s.week_start === activeSummary?.week_start;
                return (
                  <button
                    key={s.week_start}
                    onClick={() => loadFullSummary(s)}
                    style={{
                      flexShrink: 0, padding: '3px 10px', borderRadius: 99,
                      background: isActive ? 'rgba(13,13,242,0.1)' : 'transparent',
                      border: `1px solid ${isActive ? 'rgba(13,13,242,0.4)' : '#2A2A2A'}`,
                      color: isActive ? '#5B5BFF' : 'var(--text-tertiary)',
                      fontSize: 10, fontFamily: 'DM Mono, monospace',
                      cursor: 'pointer', minHeight: 'unset',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}
                  >
                    {s.grade && (
                      <span style={{ color: GRADE_COLOR[s.grade] ?? '#8B5CF6', fontWeight: 700 }}>
                        {s.grade}
                      </span>
                    )}
                    Wk{s.week_number}
                  </button>
                );
              })}
            </div>
          )}

          {/* Summary content */}
          {activeSummary ? (
            <>
              {/* Stats row */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
                <StatChip label="Planned" value={`${activeSummary.planned_miles}mi`} />
                <StatChip label="Actual" value={`${activeSummary.actual_miles}mi`} color={activeSummary.actual_miles >= activeSummary.planned_miles ? '#22C55E' : '#F59E0B'} />
                <StatChip label="Done" value={`${activeSummary.workouts_completed}/${activeSummary.workouts_planned}`} />
                <StatChip label="Rate" value={`${activeSummary.completion_rate}%`} />
              </div>

              {/* Summary text */}
              {activeSummary.summary_text ? (
                <div style={{
                  fontSize: 12, lineHeight: 1.6,
                  color: 'var(--text-secondary)',
                  fontFamily: 'DM Sans, sans-serif',
                  whiteSpace: 'pre-line',
                  borderTop: '1px solid #1A1A1A',
                  paddingTop: 10,
                }}>
                  {activeSummary.summary_text}
                </div>
              ) : (
                <button
                  onClick={() => loadFullSummary(activeSummary)}
                  style={{ fontSize: 11, color: '#5B5BFF', background: 'none', border: 'none', cursor: 'pointer', padding: 0, minHeight: 'unset' }}
                >
                  Load summary text →
                </button>
              )}

              <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 8 }}>
                Week {activeSummary.week_number}
                {activeSummary.phase_name ? ` · ${activeSummary.phase_name}` : ''}
                {' · '}
                {new Date(activeSummary.week_start + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                –
                {new Date(new Date(activeSummary.week_start + 'T00:00:00').setDate(new Date(activeSummary.week_start + 'T00:00:00').getDate() + 6)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center', padding: '16px 0' }}>
              {genMsg || 'Summaries are auto-generated every Monday. Tap Generate to create one now.'}
            </div>
          )}
          {genMsg && summaries.length > 0 && (
            <div style={{ fontSize: 11, color: '#22C55E', marginTop: 6 }}>{genMsg}</div>
          )}
        </div>

        {/* Key stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: 'Miles Logged', value: totalMilesCompleted.toFixed(0), unit: 'mi', color: '#8B5CF6' },
            { label: 'Completion Rate', value: `${completionRate}`, unit: '%', color: '#22C55E' },
            { label: 'Longest Run', value: longestRun.toFixed(1), unit: 'mi', color: '#3B82F6' },
            { label: 'Weeks Done', value: `${completedWeeks}`, unit: '/ 51', color: '#F59E0B' },
          ].map(({ label, value, unit, color }) => (
            <div key={label} className="card text-center" style={{ padding: '16px' }}>
              <div
                className="text-3xl font-black"
                style={{ fontFamily: 'DM Mono, monospace', color }}
              >
                {value}
                <span className="text-sm font-normal ml-1" style={{ color: 'var(--text-secondary)' }}>
                  {unit}
                </span>
              </div>
              <div
                className="text-xs mt-1"
                style={{ color: 'var(--text-tertiary)', fontFamily: 'DM Sans, sans-serif' }}
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
              { name: '🏆 Houston Marathon', date: '2027-01-17', days: houstonDays, color: '#8B5CF6', goal: 'Sub-2:50:00' },
              { name: '🌟 Grasslands 100',   date: '2027-03-20', days: grasslandsDays, color: '#06B6D4', goal: 'Sub-24 hours' },
            ].map(({ name, days, color, goal }) => (
              <div key={name}>
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{name}</span>
                    <span className="text-xs ml-2" style={{ color: 'var(--text-tertiary)' }}>· Goal: {goal}</span>
                  </div>
                  <span
                    className="text-lg font-black"
                    style={{ fontFamily: 'DM Mono, monospace', color }}
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
            <span className="text-sm" style={{ fontFamily: 'DM Mono, monospace', color: 'var(--text-secondary)' }}>
              {totalMilesCompleted.toFixed(0)} / {totalPlannedMiles} mi
            </span>
          </div>
          <div className="progress-bar h-3 mb-1">
            <div
              className="progress-fill h-3"
              style={{
                width: `${Math.min(100, (totalMilesCompleted / totalPlannedMiles) * 100)}%`,
                background: 'linear-gradient(135deg, #8B5CF6, #6366F1, #06B6D4)',
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
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="week" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} interval={3} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 8,
                    color: 'var(--text-primary)',
                    fontSize: 12,
                  }}
                />
                <Line type="monotone" dataKey="planned" stroke="rgba(255,255,255,0.15)" strokeWidth={2} dot={false} name="Planned" />
                <Line type="monotone" dataKey="actual" stroke="#8B5CF6" strokeWidth={2} dot={false} name="Actual" />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2 justify-center">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-0.5" style={{ background: 'rgba(255,255,255,0.15)' }} />
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Planned</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-0.5" style={{ background: '#8B5CF6' }} />
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
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)', fontFamily: 'DM Mono, monospace' }}>
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

function StatChip({ label, value, color = 'var(--text-primary)' }: { label: string; value: string; color?: string }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid #1A1A1A',
      borderRadius: 8, padding: '4px 10px',
    }}>
      <div style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700, fontSize: 13, color }}>{value}</div>
      <div style={{ fontSize: 9, color: 'var(--text-tertiary)', marginTop: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    </div>
  );
}
