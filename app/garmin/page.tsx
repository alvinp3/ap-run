'use client';

import { useState, useEffect, useCallback } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import AppNav from '@/components/layout/AppNav';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

// ── Types ────────────────────────────────────────────────────

interface AthleteProfile {
  totalRuns: number;
  totalMiles: number;
  totalHours: number;
  avgMilesPerWeek: number;
  longestRun: { miles: number; date: string };
  avgEasyPace: string;
  avgHR: number;
  restingHRTrend: { date: string; hr: number }[];
  weeklyMileage: { week: string; miles: number }[];
  paceDistribution: { zone: string; pct: number }[];
  recentRuns: {
    date: string;
    miles: number;
    pace: string;
    hr: number | null;
    type: string;
  }[];
  trainingAge: string;
  fitnessScore: number;
}

interface GarminStatus {
  connected: boolean;
  lastSync: string | null;
  activitiesImported: number;
}

// ── Helpers ──────────────────────────────────────────────────

const GLASS_CARD: React.CSSProperties = {
  background: 'rgba(17,17,19,0.70)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 16,
  padding: 20,
};

function runTypeColor(type: string): string {
  const t = type.toLowerCase();
  if (t.includes('easy') || t.includes('recovery') || t.includes('zone')) return '#22C55E';
  if (t.includes('long')) return '#3B82F6';
  if (t.includes('interval') || t.includes('tempo') || t.includes('speed') || t.includes('hard')) return '#EF4444';
  return '#94A3B8';
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── Sub-components ───────────────────────────────────────────

function StatCell({
  label,
  value,
  unit,
  color = '#8B5CF6',
}: {
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
}) {
  return (
    <div className="text-center" style={{ padding: '12px 8px' }}>
      <div
        style={{
          fontFamily: 'DM Mono, JetBrains Mono, monospace',
          fontWeight: 700,
          fontSize: 26,
          color,
          lineHeight: 1,
        }}
      >
        {value}
        {unit && (
          <span
            style={{
              fontSize: 13,
              fontWeight: 400,
              color: '#94A3B8',
              marginLeft: 3,
            }}
          >
            {unit}
          </span>
        )}
      </div>
      <div
        style={{
          fontFamily: 'DM Sans, Plus Jakarta Sans, sans-serif',
          fontSize: 11,
          color: 'rgba(255,255,255,0.35)',
          marginTop: 4,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        {label}
      </div>
    </div>
  );
}

function FitnessGauge({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score));
  const color = pct >= 70 ? '#22C55E' : pct >= 40 ? '#F59E0B' : '#EF4444';
  return (
    <div className="flex flex-col items-center" style={{ padding: '8px 0' }}>
      <div
        style={{
          position: 'relative',
          width: 80,
          height: 80,
        }}
      >
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r="32"
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="8"
          />
          <circle
            cx="40"
            cy="40"
            r="32"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(pct / 100) * 201} 201`}
            transform="rotate(-90 40 40)"
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'DM Mono, JetBrains Mono, monospace',
            fontWeight: 700,
            fontSize: 20,
            color,
          }}
        >
          {pct}
        </div>
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Fitness Score
      </div>
    </div>
  );
}

function PullButton({
  label,
  loadingLabel,
  onAction,
  loading,
  accent = '#8B5CF6',
}: {
  label: string;
  loadingLabel: string;
  onAction: () => void;
  loading: boolean;
  accent?: string;
}) {
  return (
    <button
      onClick={onAction}
      disabled={loading}
      style={{
        background: loading ? `${accent}14` : `${accent}1A`,
        border: `1px solid ${accent}4D`,
        color: accent,
        borderRadius: 12,
        padding: '11px 20px',
        fontFamily: 'DM Sans, Plus Jakarta Sans, sans-serif',
        fontWeight: 600,
        fontSize: 14,
        cursor: loading ? 'not-allowed' : 'pointer',
        minHeight: 44,
        opacity: loading ? 0.6 : 1,
        width: '100%',
        transition: 'opacity 0.15s',
      }}
    >
      {loading ? loadingLabel : label}
    </button>
  );
}

// ── Main page ────────────────────────────────────────────────

export default function GarminPage() {
  const [profile, setProfile] = useState<AthleteProfile | null>(null);
  const [status, setStatus] = useState<GarminStatus | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [pullLoading, setPullLoading] = useState(false);
  const [pullMsg, setPullMsg] = useState('');
  const [pullSuccess, setPullSuccess] = useState<boolean | null>(null);

  // Planned mileage keyed by week label for the bar chart
  const [plannedMap, setPlannedMap] = useState<Record<string, number>>({});

  const fetchProfile = useCallback(async () => {
    setProfileLoading(true);
    try {
      const r = await fetch('/api/garmin/profile');
      if (r.ok) setProfile(await r.json());
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const r = await fetch('/api/garmin/status');
      if (r.ok) setStatus(await r.json());
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchStatus();
  }, [fetchProfile, fetchStatus]);

  // Build a week-label → planned-miles map from the workouts API
  useEffect(() => {
    fetch('/api/workouts')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Array<{ date: string; miles: number }> | null) => {
        if (!Array.isArray(data)) return;
        const map: Record<string, number> = {};
        for (const w of data) {
          const d = new Date(w.date + 'T00:00:00');
          // find monday of that week
          const monday = new Date(d);
          monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
          const key = monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          map[key] = (map[key] ?? 0) + w.miles;
        }
        setPlannedMap(map);
      })
      .catch(() => {});
  }, []);

  async function handlePull() {
    setPullLoading(true);
    setPullMsg('');
    setPullSuccess(null);
    try {
      const r = await fetch('/api/garmin/pull', { method: 'POST' });
      const d = await r.json();
      if (d.success) {
        setPullSuccess(true);
        const parts = [
          d.healthSaved && 'health data',
          d.activitiesImported && `${d.activitiesImported} activities`,
          d.workoutsAutoCompleted && `${d.workoutsAutoCompleted} workouts auto-completed`,
        ].filter(Boolean);
        setPullMsg(`Pulled: ${parts.join(', ') || 'up to date'}${d.errors?.length ? ` (${d.errors.length} errors)` : ''}`);
        await fetchStatus();
        await fetchProfile();
      } else {
        setPullSuccess(false);
        setPullMsg(d.error ?? 'Pull failed');
      }
    } catch (e) {
      setPullSuccess(false);
      setPullMsg(String(e));
    } finally {
      setPullLoading(false);
    }
  }

  // Merge weekly mileage with planned data
  const weeklyChartData = (profile?.weeklyMileage ?? []).map((w) => ({
    ...w,
    planned: plannedMap[w.week] ?? 0,
  }));

  const avgRHR =
    profile && profile.restingHRTrend.length > 0
      ? Math.round(
          profile.restingHRTrend.reduce((s, d) => s + d.hr, 0) /
            profile.restingHRTrend.length
        )
      : null;

  // Show last 30 data points of resting HR trend for readability
  const rhrChartData = (profile?.restingHRTrend ?? []).slice(-30);

  // Check if latest RHR is above average (warn)
  const latestRHR =
    rhrChartData.length > 0 ? rhrChartData[rhrChartData.length - 1].hr : null;
  const rhrWarning =
    avgRHR != null && latestRHR != null && latestRHR > avgRHR + 5;

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ background: '#09090B' }}
    >
      <AppHeader title="Garmin Data" />

      <main className="flex-1 overflow-y-auto px-4 pb-32 pt-4 max-w-lg mx-auto w-full">
        <h1
          className="text-2xl font-black mb-1"
          style={{
            fontFamily: 'Space Grotesk, Outfit, sans-serif',
            color: '#F8FAFC',
          }}
        >
          Athlete Profile
        </h1>
        <p
          className="text-sm mb-5"
          style={{ fontFamily: 'DM Sans, Plus Jakarta Sans, sans-serif', color: 'rgba(255,255,255,0.35)' }}
        >
          Computed from all imported Garmin activities
        </p>

        {/* ── Section 1: Hero Profile Card ───────────────────── */}
        <section className="mb-5">
          <div style={GLASS_CARD}>
            {profileLoading && !profile ? (
              <div className="text-center py-8" style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>
                Loading profile…
              </div>
            ) : profile ? (
              <>
                {/* Top row: stats grid */}
                <div className="grid grid-cols-2 gap-0 mb-4">
                  <StatCell label="Total Runs" value={profile.totalRuns} color="#8B5CF6" />
                  <StatCell label="Total Miles" value={profile.totalMiles.toFixed(0)} unit="mi" color="#8B5CF6" />
                  <StatCell label="Avg mi/Week" value={profile.avgMilesPerWeek} unit="mi" color="#06B6D4" />
                  <StatCell label="Total Hours" value={profile.totalHours} unit="h" color="#06B6D4" />
                </div>

                <div
                  style={{
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    paddingTop: 14,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    flexWrap: 'wrap',
                  }}
                >
                  {/* Fitness gauge */}
                  <FitnessGauge score={profile.fitnessScore} />

                  {/* Key stats column */}
                  <div className="flex-1 space-y-2" style={{ minWidth: 160 }}>
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: 'DM Sans, sans-serif' }}>
                        Longest Run
                      </span>
                      <span
                        style={{
                          fontFamily: 'DM Mono, JetBrains Mono, monospace',
                          fontSize: 14,
                          fontWeight: 600,
                          color: '#3B82F6',
                        }}
                      >
                        {profile.longestRun.miles} mi
                        {profile.longestRun.date && (
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginLeft: 6 }}>
                            {formatDate(profile.longestRun.date)}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: 'DM Sans, sans-serif' }}>
                        Avg Easy Pace
                      </span>
                      <span
                        style={{
                          fontFamily: 'DM Mono, JetBrains Mono, monospace',
                          fontSize: 14,
                          fontWeight: 600,
                          color: '#22C55E',
                        }}
                      >
                        {profile.avgEasyPace}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: 'DM Sans, sans-serif' }}>
                        Avg HR
                      </span>
                      <span
                        style={{
                          fontFamily: 'DM Mono, JetBrains Mono, monospace',
                          fontSize: 14,
                          fontWeight: 600,
                          color: '#EF4444',
                        }}
                      >
                        {profile.avgHR > 0 ? `${profile.avgHR} bpm` : '—'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: 'DM Sans, sans-serif' }}>
                        Training Age
                      </span>
                      <span
                        style={{
                          fontFamily: 'DM Mono, JetBrains Mono, monospace',
                          fontSize: 14,
                          fontWeight: 600,
                          color: '#F59E0B',
                        }}
                      >
                        {profile.trainingAge}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pace distribution */}
                {profile.paceDistribution.some((z) => z.pct > 0) && (
                  <div style={{ marginTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
                    <div
                      style={{
                        fontSize: 11,
                        color: 'rgba(255,255,255,0.35)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        marginBottom: 8,
                        fontFamily: 'DM Sans, sans-serif',
                      }}
                    >
                      Pace Distribution
                    </div>
                    <div className="flex gap-2">
                      {profile.paceDistribution.map(({ zone, pct }) => (
                        <div key={zone} className="flex-1 text-center">
                          <div
                            style={{
                              height: 4,
                              borderRadius: 99,
                              background:
                                zone === 'Easy'
                                  ? '#22C55E'
                                  : zone === 'Moderate'
                                  ? '#F59E0B'
                                  : '#EF4444',
                              marginBottom: 4,
                              opacity: pct > 0 ? 1 : 0.2,
                            }}
                          />
                          <div
                            style={{
                              fontFamily: 'DM Mono, JetBrains Mono, monospace',
                              fontSize: 12,
                              fontWeight: 600,
                              color: pct > 0 ? '#F8FAFC' : 'rgba(255,255,255,0.12)',
                            }}
                          >
                            {pct}%
                          </div>
                          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{zone}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8" style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>
                No profile data yet — pull activities first.
              </div>
            )}
          </div>
        </section>

        {/* ── Section 2: Recent Runs ─────────────────────────── */}
        {profile && profile.recentRuns.length > 0 && (
          <section className="mb-5">
            <div
              style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.35)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 8,
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 600,
              }}
            >
              Recent Runs
            </div>
            <div style={GLASS_CARD}>
              <div className="space-y-0">
                {profile.recentRuns.map((run, i) => {
                  const color = runTypeColor(run.type);
                  return (
                    <div
                      key={`${run.date}-${i}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 0',
                        borderBottom:
                          i < profile.recentRuns.length - 1
                            ? '1px solid rgba(255,255,255,0.04)'
                            : 'none',
                      }}
                    >
                      {/* color dot */}
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: color,
                          flexShrink: 0,
                        }}
                      />
                      {/* date */}
                      <div
                        style={{
                          width: 52,
                          fontSize: 11,
                          color: 'rgba(255,255,255,0.35)',
                          fontFamily: 'DM Mono, JetBrains Mono, monospace',
                          flexShrink: 0,
                        }}
                      >
                        {formatDate(run.date)}
                      </div>
                      {/* name */}
                      <div
                        style={{
                          flex: 1,
                          fontSize: 13,
                          color: '#CBD5E1',
                          fontFamily: 'DM Sans, Plus Jakarta Sans, sans-serif',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {run.type}
                      </div>
                      {/* stats */}
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-end',
                          gap: 1,
                          flexShrink: 0,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: 'DM Mono, JetBrains Mono, monospace',
                            fontSize: 13,
                            fontWeight: 600,
                            color: '#F8FAFC',
                          }}
                        >
                          {run.miles} mi
                        </span>
                        <span
                          style={{
                            fontFamily: 'DM Mono, JetBrains Mono, monospace',
                            fontSize: 11,
                            color: 'rgba(255,255,255,0.35)',
                          }}
                        >
                          {run.pace}
                          {run.hr != null && (
                            <span style={{ color: '#EF4444', marginLeft: 6 }}>
                              {run.hr}bpm
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── Section 3: Weekly Mileage Chart ───────────────── */}
        {weeklyChartData.length > 0 && (
          <section className="mb-5">
            <div
              style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.35)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 8,
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 600,
              }}
            >
              Weekly Mileage — Last 16 Weeks
            </div>
            <div style={GLASS_CARD}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={weeklyChartData}
                  margin={{ top: 4, right: 4, left: -22, bottom: 4 }}
                  barCategoryGap="30%"
                  barGap={2}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis
                    dataKey="week"
                    tick={{ fill: '#475569', fontSize: 9 }}
                    interval={3}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#475569', fontSize: 9 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(17,17,19,0.95)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 8,
                      color: '#F8FAFC',
                      fontSize: 12,
                      fontFamily: 'DM Mono, JetBrains Mono, monospace',
                    }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(val: any, name: any) => [
                      `${val} mi`,
                      name === 'miles' ? 'Actual' : 'Planned',
                    ]}
                  />
                  <Bar dataKey="planned" fill="rgba(255,255,255,0.07)" radius={[3, 3, 0, 0]} name="Planned" />
                  <Bar dataKey="miles" fill="#8B5CF6" radius={[3, 3, 0, 0]} name="Actual" />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 mt-2 justify-center">
                <div className="flex items-center gap-1.5">
                  <div style={{ width: 12, height: 8, borderRadius: 2, background: 'rgba(255,255,255,0.15)' }} />
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Planned</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div style={{ width: 12, height: 8, borderRadius: 2, background: '#8B5CF6' }} />
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Actual</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Section 4: Resting HR Trend ───────────────────── */}
        {rhrChartData.length > 0 && (
          <section className="mb-5">
            <div
              style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.35)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 8,
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 600,
              }}
            >
              Resting Heart Rate Trend
            </div>
            <div style={GLASS_CARD}>
              {rhrWarning && (
                <div
                  style={{
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    marginBottom: 12,
                    fontSize: 12,
                    color: '#EF4444',
                    fontFamily: 'DM Sans, Plus Jakarta Sans, sans-serif',
                  }}
                >
                  Resting HR above average — consider extra recovery today
                </div>
              )}
              <ResponsiveContainer width="100%" height={160}>
                <LineChart
                  data={rhrChartData}
                  margin={{ top: 4, right: 4, left: -22, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#475569', fontSize: 9 }}
                    interval={Math.floor(rhrChartData.length / 4)}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: string) => {
                      const d = new Date(v + 'T00:00:00');
                      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }}
                  />
                  <YAxis
                    tick={{ fill: '#475569', fontSize: 9 }}
                    tickLine={false}
                    axisLine={false}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(17,17,19,0.95)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 8,
                      color: '#F8FAFC',
                      fontSize: 12,
                      fontFamily: 'DM Mono, JetBrains Mono, monospace',
                    }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(val: any) => [`${val} bpm`, 'Resting HR']}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    labelFormatter={(label: any) => formatDate(String(label))}
                  />
                  {avgRHR != null && (
                    <ReferenceLine
                      y={avgRHR}
                      stroke="rgba(6,182,212,0.4)"
                      strokeDasharray="4 4"
                      label={{
                        value: `avg ${avgRHR}`,
                        fill: '#06B6D4',
                        fontSize: 10,
                        position: 'insideTopRight',
                      }}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="hr"
                    stroke="#06B6D4"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: '#06B6D4' }}
                    name="RHR"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* ── Section 5: Pull Controls ───────────────────────── */}
        <section className="mb-5">
          <div
            style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.35)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 8,
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 600,
            }}
          >
            Sync Controls
          </div>
          <div style={GLASS_CARD}>
            {/* Status row */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 14,
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: 'DM Sans, sans-serif' }}>
                  Last Sync
                </div>
                <div
                  style={{
                    fontFamily: 'DM Mono, JetBrains Mono, monospace',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#F8FAFC',
                  }}
                >
                  {status?.lastSync
                    ? new Date(status.lastSync).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Never'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: 'DM Sans, sans-serif' }}>
                  Activities in DB
                </div>
                <div
                  style={{
                    fontFamily: 'DM Mono, JetBrains Mono, monospace',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#8B5CF6',
                  }}
                >
                  {status?.activitiesImported ?? profile?.totalRuns ?? '—'}
                </div>
              </div>
            </div>

            {/* Pull message */}
            {pullMsg && (
              <div
                style={{
                  background: pullSuccess ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
                  border: `1px solid ${pullSuccess ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                  borderRadius: 8,
                  padding: '8px 12px',
                  marginBottom: 12,
                  fontSize: 12,
                  color: pullSuccess ? '#22C55E' : '#EF4444',
                  fontFamily: 'DM Sans, Plus Jakarta Sans, sans-serif',
                }}
              >
                {pullSuccess ? '✓ ' : '✗ '}{pullMsg}
              </div>
            )}

            <div className="space-y-3">
              <PullButton
                label="Pull All Activities"
                loadingLabel="Pulling all activities…"
                onAction={handlePull}
                loading={pullLoading}
                accent="#8B5CF6"
              />
              <PullButton
                label="Compute Profile"
                loadingLabel="Computing…"
                onAction={fetchProfile}
                loading={profileLoading}
                accent="#06B6D4"
              />
            </div>
          </div>
        </section>
      </main>

      <AppNav />
    </div>
  );
}
