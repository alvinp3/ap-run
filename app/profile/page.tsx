'use client';

import { useState, useEffect } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import AppNav from '@/components/layout/AppNav';
import CoachFAB from '@/components/coach/CoachFAB';
import { athleteProfile, raceCalendar, trainingPaces, hrZones } from '@/data/reference-data';
import { getCurrentWeek, getPhaseForWeek, allWeeks, getDaysUntil } from '@/data/training-plan';
import { formatMiles } from '@/utils/workout';

interface GarminHealth {
  vo2max?: number;
  restingHR?: number;
  bodyBattery?: number;
  hrv?: number;
  stressScore?: number;
  lastUpdated?: string;
}

interface RecentRun {
  date: string;
  distance: number;
  duration: string;
  avgPace: string;
  avgHR: number;
  type: string;
}

export default function ProfilePage() {
  const today = new Date();
  const currentWeek = getCurrentWeek(today);
  const phase = currentWeek ? getPhaseForWeek(currentWeek.week) : null;

  const [garmin, setGarmin] = useState<GarminHealth | null>(null);
  const [recentRuns, setRecentRuns] = useState<RecentRun[]>([]);
  const [logs, setLogs] = useState<Record<string, { completed: boolean; miles?: number }>>({});

  const completedWeeks = allWeeks.filter((w) => {
    const weekEnd = new Date(w.startDate);
    weekEnd.setDate(weekEnd.getDate() + 6);
    return weekEnd < today;
  }).length;

  const totalPlannedMiles = allWeeks.reduce(
    (sum, w) => sum + w.days.reduce((d, day) => d + day.miles, 0),
    0
  );

  const houstonDays = getDaysUntil('2027-01-17');
  const grasslandsDays = getDaysUntil('2027-03-20');

  useEffect(() => {
    // Fetch Garmin health data
    fetch('/api/garmin/today')
      .then((r) => r.json())
      .then((data) => {
        if (data.health) setGarmin(data.health);
      })
      .catch(() => {});

    // Fetch workout logs for mileage calculation
    fetch('/api/logs')
      .then((r) => r.json())
      .then((data) => {
        if (data.logs) setLogs(data.logs);
        if (data.recentRuns) setRecentRuns(data.recentRuns);
      })
      .catch(() => {});
  }, []);

  const loggedMiles = Object.values(logs).reduce((sum, log) => sum + (log.miles ?? 0), 0);
  const completionRate = completedWeeks > 0
    ? Math.round((Object.values(logs).filter((l) => l.completed).length /
        Math.max(completedWeeks * 6, 1)) * 100)
    : 0;

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <AppHeader title="Profile" />

      <main className="flex-1 overflow-y-auto px-4 pb-32 pt-4 max-w-lg mx-auto w-full">
        {/* Hero */}
        <div className="card mb-4" style={{ borderColor: 'rgba(45,212,191,0.3)' }}>
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{ background: 'rgba(45,212,191,0.1)' }}
            >
              🏃
            </div>
            <div className="flex-1">
              <div
                className="text-xl font-black"
                style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}
              >
                {athleteProfile.name}
              </div>
              <div className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                {athleteProfile.location} · {athleteProfile.ageGroup}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                Training {athleteProfile.trainingDays}x/wk · {athleteProfile.trainingTime}
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <Stat label="Marathon PR" value={athleteProfile.marathonPR} color="var(--accent-teal)" />
            <Stat label="Week" value={currentWeek ? String(currentWeek.week) : '—'} color="#F59E0B" />
            <Stat label="Phase" value={phase ? `P${phase.phase}` : '—'} color="#A855F7" />
          </div>
        </div>

        {/* Race countdowns */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: 'Houston', days: houstonDays, color: 'var(--accent-teal)', goal: 'Sub-2:50' },
            { label: 'Grasslands', days: grasslandsDays, color: '#A855F7', goal: 'Sub-24hr' },
          ].map(({ label, days, color, goal }) => (
            <div key={label} className="card text-center" style={{ padding: 14 }}>
              <div
                className="text-3xl font-black"
                style={{ fontFamily: 'JetBrains Mono, monospace', color }}
              >
                {days > 0 ? days : '✓'}
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                {days > 0 ? 'days' : 'done'} · {label}
              </div>
              <div className="text-xs font-semibold mt-1" style={{ color }}>{goal}</div>
            </div>
          ))}
        </div>

        {/* Training stats */}
        <div className="card mb-4">
          <div className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            Training Stats
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Weeks Done" value={String(completedWeeks)} sub="of 51" color="var(--accent-teal)" />
            <StatCard label="Completion" value={`${completionRate}%`} sub="workout rate" color="#22C55E" />
            <StatCard label="Miles Logged" value={formatMiles(loggedMiles)} sub="tracked" color="#3B82F6" />
            <StatCard label="Plan Miles" value={Math.round(totalPlannedMiles).toString()} sub="total" color="#F59E0B" />
          </div>

          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span style={{ color: 'var(--text-tertiary)' }}>Overall progress</span>
              <span style={{ color: 'var(--accent-teal)', fontFamily: 'JetBrains Mono, monospace' }}>
                {Math.round((completedWeeks / 51) * 100)}%
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(completedWeeks / 51) * 100}%`, background: 'var(--accent-teal)' }}
              />
            </div>
          </div>
        </div>

        {/* Garmin health data */}
        {garmin ? (
          <div className="card mb-4">
            <div className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
              ⌚ Garmin Health Metrics
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {garmin.vo2max && (
                <Stat label="VO2max" value={String(garmin.vo2max)} color="#22C55E" />
              )}
              {garmin.restingHR && (
                <Stat label="Resting HR" value={`${garmin.restingHR}bpm`} color="#EF4444" />
              )}
              {garmin.bodyBattery !== undefined && (
                <Stat label="Body Battery" value={`${garmin.bodyBattery}%`} color="#F59E0B" />
              )}
              {garmin.hrv && (
                <Stat label="HRV" value={`${garmin.hrv}ms`} color="#A855F7" />
              )}
              {garmin.stressScore && (
                <Stat label="Stress" value={String(garmin.stressScore)} color="#3B82F6" />
              )}
            </div>
            {garmin.lastUpdated && (
              <div className="text-xs mt-2 text-center" style={{ color: 'var(--text-tertiary)' }}>
                Last synced: {new Date(garmin.lastUpdated).toLocaleString()}
              </div>
            )}
          </div>
        ) : (
          <div
            className="card mb-4 text-center py-5"
            style={{ borderStyle: 'dashed', borderColor: 'var(--border-subtle)' }}
          >
            <div className="text-2xl mb-2">⌚</div>
            <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
              No Garmin data yet
            </div>
            <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Connect your Forerunner 745 in Settings to see VO2max, HRV, and Body Battery
            </div>
          </div>
        )}

        {/* Recent runs */}
        {recentRuns.length > 0 && (
          <div className="card mb-4">
            <div className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
              Recent Runs
            </div>
            <div className="space-y-3">
              {recentRuns.slice(0, 5).map((run) => (
                <div key={run.date} className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: 'rgba(45,212,191,0.1)', color: 'var(--accent-teal)', fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    {run.distance.toFixed(1)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{run.type}</div>
                    <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      {new Date(run.date).toLocaleDateString()} · {run.duration}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold" style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent-teal)' }}>
                      {run.avgPace}/mi
                    </div>
                    {run.avgHR > 0 && (
                      <div className="text-xs" style={{ color: '#EF4444' }}>{run.avgHR} bpm</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Race calendar */}
        <div className="card mb-4">
          <div className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            Race Calendar
          </div>
          <div className="space-y-2">
            {raceCalendar.map((race) => {
              const raceDate = new Date(race.date);
              const isPast = raceDate < today;
              const isMain = race.type === 'main';
              return (
                <div
                  key={race.date}
                  className="flex items-center gap-3 py-2"
                  style={{ borderBottom: '1px solid var(--border-subtle)', opacity: isPast ? 0.6 : 1 }}
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: isMain ? (race.name.includes('Houston') ? 'var(--accent-teal)' : '#A855F7') : '#F59E0B' }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {race.name}
                      </span>
                      {isMain && (
                        <span
                          className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                          style={{ background: 'rgba(45,212,191,0.1)', color: 'var(--accent-teal)' }}
                        >
                          A
                        </span>
                      )}
                      {isPast && (
                        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>✓</span>
                      )}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                      {raceDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {' · '}
                      {race.goal}
                    </div>
                  </div>
                  <div className="text-xs text-right" style={{ color: 'var(--text-tertiary)', maxWidth: 80 }}>
                    {isPast ? 'Done' : `${getDaysUntil(race.date)}d`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Training paces reference */}
        <div className="card mb-4">
          <div className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            Target Training Paces
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Zone', 'Normal', 'Heat-Adj.'].map((h) => (
                    <th
                      key={h}
                      className="text-left pb-2 pr-3"
                      style={{ color: 'var(--text-tertiary)', fontWeight: 600, fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trainingPaces.map((p) => (
                  <tr key={p.zone} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <td className="py-1.5 pr-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>{p.zone}</td>
                    <td className="py-1.5 pr-3" style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)' }}>
                      {p.normalPace}
                    </td>
                    <td className="py-1.5" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#F59E0B' }}>
                      {p.heatAdjusted}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* HR Zones */}
        <div className="card mb-4">
          <div className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            Heart Rate Zones
          </div>
          <div className="space-y-2">
            {hrZones.map((z, i) => {
              const colors = ['#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#A855F7'];
              return (
                <div key={z.zone} className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                    style={{ background: `${colors[i]}20`, color: colors[i] }}
                  >
                    {z.zone}
                  </div>
                  <div className="flex-1 text-sm" style={{ color: 'var(--text-secondary)' }}>{z.use}</div>
                  <div
                    className="text-xs font-bold"
                    style={{ fontFamily: 'JetBrains Mono, monospace', color: colors[i] }}
                  >
                    {z.pct}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <AppNav />
      <CoachFAB />
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <div className="text-lg font-black" style={{ fontFamily: 'JetBrains Mono, monospace', color }}>
        {value}
      </div>
      <div className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{label}</div>
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div
      className="rounded-xl p-3 text-center"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div className="text-xl font-black" style={{ fontFamily: 'JetBrains Mono, monospace', color }}>
        {value}
      </div>
      <div className="text-xs mt-0.5" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{label}</div>
      <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{sub}</div>
    </div>
  );
}
