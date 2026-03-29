'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Watch, Settings, ChevronRight, RefreshCw, Activity, TrendingUp } from 'lucide-react';
import { athleteProfile, raceCalendar, trainingPaces } from '@/data/reference-data';
import { getCurrentWeek, getPhaseForWeek, allWeeks, getDaysUntil, getWeekByNumber } from '@/data/training-plan';
import { formatMiles } from '@/utils/workout';

interface GarminHealth {
  vo2max?: number | null;
  restingHR?: number | null;
  bodyBattery?: number | null;
  trainingReadiness?: number | null;
  sleepHours?: number | null;
  lastUpdated?: string | null;
}

interface GarminStatus {
  connected: boolean;
  lastSync: string | null;
  activitiesImported: number;
}

interface RecentActivity {
  id: string;
  activity_date: string;
  activity_type: string;
  distance_miles: number | null;
  duration_seconds: number | null;
  avg_heart_rate: number | null;
  activity_name: string | null;
}

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatDurationShort(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function activityTypeLabel(type: string): string {
  const map: Record<string, string> = {
    running: 'Run', cycling: 'Ride', swimming: 'Swim',
    strength_training: 'Strength', walking: 'Walk', hiking: 'Hike',
    yoga: 'Yoga', treadmill_running: 'Treadmill',
  };
  return map[type.toLowerCase()] ?? type;
}

export default function ProfileDrawer({ isOpen, onClose }: ProfileDrawerProps) {
  const [health, setHealth] = useState<GarminHealth | null>(null);
  const [status, setStatus] = useState<GarminStatus | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const [loggedMiles, setLoggedMiles] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);
  const [weekLoggedMiles, setWeekLoggedMiles] = useState(0);

  const today = new Date();
  const currentWeek = getCurrentWeek(today);
  const phase = currentWeek ? getPhaseForWeek(currentWeek.week) : null;
  const weekData = currentWeek ? getWeekByNumber(currentWeek.week) : null;
  const completedWeeks = allWeeks.filter((w) => {
    const end = new Date(w.startDate);
    end.setDate(end.getDate() + 6);
    return end < today;
  }).length;

  useEffect(() => {
    if (!isOpen) return;

    fetch('/api/garmin/health')
      .then(r => r.json())
      .then(d => { if (d && (d.lastUpdated || d.restingHR || d.vo2max)) setHealth(d); })
      .catch(() => {});

    fetch('/api/garmin/status')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setStatus(d); })
      .catch(() => {});

    fetch('/api/garmin/recent?limit=5')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setRecentActivities(d); })
      .catch(() => {});

    fetch('/api/logs')
      .then(r => r.json())
      .then((d: Array<{ date: string; completed: boolean; actualMiles?: number }>) => {
        if (!Array.isArray(d)) return;

        // Total logged miles
        const miles = d.reduce((s, l) => s + (l.actualMiles ?? 0), 0);
        setLoggedMiles(miles);

        // Overall completion rate
        const done = d.filter(l => l.completed).length;
        setCompletionRate(completedWeeks > 0
          ? Math.round((done / Math.max(completedWeeks * 6, 1)) * 100)
          : 0);

        // This-week logged miles
        if (weekData) {
          const weekDates = new Set(weekData.days.map(day => day.date));
          const wMiles = d
            .filter(l => weekDates.has(l.date) && l.completed)
            .reduce((s, l) => s + (l.actualMiles ?? 0), 0);
          setWeekLoggedMiles(wMiles);
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  async function handleSync() {
    setSyncing(true);
    setSyncMsg('');
    try {
      const r = await fetch('/api/garmin/pull', { method: 'POST' });
      const d = await r.json();
      if (d.success) {
        const parts = [
          d.activitiesImported && `${d.activitiesImported} activities`,
          d.healthSaved && 'health data',
          d.workoutsAutoCompleted && `${d.workoutsAutoCompleted} workouts logged`,
        ].filter(Boolean);
        setSyncMsg(`Synced: ${parts.join(', ') || 'up to date'}`);
        // Refresh health + status + activities
        const [hRes, sRes, aRes] = await Promise.all([
          fetch('/api/garmin/health'),
          fetch('/api/garmin/status'),
          fetch('/api/garmin/recent?limit=5'),
        ]);
        if (hRes.ok) {
          const hd = await hRes.json();
          if (hd && (hd.lastUpdated || hd.restingHR || hd.vo2max)) setHealth(hd);
        }
        if (sRes.ok) setStatus(await sRes.json());
        if (aRes.ok) {
          const ad = await aRes.json();
          if (Array.isArray(ad)) setRecentActivities(ad);
        }
      } else {
        setSyncMsg(d.error ?? 'Sync failed');
      }
    } catch {
      setSyncMsg('Sync failed');
    } finally {
      setSyncing(false);
    }
  }

  const metricTiles = [
    { label: 'VO2max',         value: health?.vo2max ? String(health.vo2max) : null,                              color: '#22C55E' },
    { label: 'Resting HR',     value: health?.restingHR ? `${health.restingHR} bpm` : null,                       color: '#EF4444' },
    { label: 'Body Battery',   value: health?.bodyBattery != null ? `${health.bodyBattery}%` : null,              color: '#F59E0B' },
    { label: 'Training Ready', value: health?.trainingReadiness != null ? `${health.trainingReadiness}%` : null,  color: '#8B5CF6' },
    { label: 'Sleep',          value: health?.sleepHours != null ? `${health.sleepHours}h` : null,                color: '#00E5FF' },
  ].filter(m => m.value != null);

  const weekPlanned = weekData?.totalMiles ?? 0;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={isOpen ? onClose : undefined}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.72)',
          backdropFilter: 'blur(4px)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.28s ease',
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: '100%', maxWidth: 430, zIndex: 201,
          background: '#0A0A0A',
          borderLeft: '1px solid #1A1A1A',
          overflowY: 'auto',
          paddingTop: 'env(safe-area-inset-top, 0)',
          paddingBottom: 48,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Sticky header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 16px 12px',
          borderBottom: '1px solid #1A1A1A',
          position: 'sticky', top: 0,
          background: '#0A0A0A', zIndex: 2,
        }}>
          <span style={{
            fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 16,
            color: 'var(--text-primary)',
          }}>
            Athlete Profile
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#52525B', padding: 6, display: 'flex', alignItems: 'center',
              minHeight: 'unset',
            }}
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        <div style={{ padding: '16px 16px 0' }}>

          {/* ── Athlete hero card ─────────────────────────────────── */}
          <div className="card mb-4" style={{ borderColor: 'rgba(13,13,242,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 12, flexShrink: 0,
                background: 'rgba(13,13,242,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
              }}>
                🏃
              </div>
              <div>
                <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>
                  {athleteProfile.name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                  {athleteProfile.location} · {athleteProfile.ageGroup}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                  PR: {athleteProfile.marathonPR} — {athleteProfile.prRace}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, textAlign: 'center', marginBottom: 12 }}>
              {[
                { label: 'Marathon PR', value: athleteProfile.marathonPR.replace(':00', ''), color: '#5B5BFF' },
                { label: 'Week',        value: currentWeek ? String(currentWeek.week) : '—',  color: '#F59E0B' },
                { label: 'Phase',       value: phase ? `P${phase.phase}` : '—',                color: '#8B5CF6' },
                { label: 'Done %',      value: `${completionRate}%`,                            color: '#22C55E' },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <div style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700, fontSize: 13, color }}>{value}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-tertiary)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Plan progress */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Plan progress</span>
                <span style={{ fontSize: 10, color: '#8B5CF6', fontFamily: 'DM Mono, monospace' }}>
                  Wk {completedWeeks} / 51 · {formatMiles(loggedMiles)} mi logged
                </span>
              </div>
              <div style={{ height: 3, background: '#1A1A1A', borderRadius: 99 }}>
                <div style={{
                  height: '100%', borderRadius: 99,
                  width: `${Math.min(100, (completedWeeks / 51) * 100)}%`,
                  background: 'linear-gradient(90deg, #5B5BFF, #8B5CF6)',
                }} />
              </div>
            </div>
          </div>

          {/* ── This week ─────────────────────────────────────────── */}
          {weekData && (
            <div className="card mb-4" style={{ borderColor: 'rgba(245,158,11,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <TrendingUp size={13} strokeWidth={1.5} color="#F59E0B" />
                  <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
                    This Week
                  </span>
                </div>
                <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                  {phase ? `${phase.name} · Wk ${currentWeek?.week}` : `Week ${currentWeek?.week}`}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700, fontSize: 20, color: '#22C55E' }}>
                    {formatMiles(weekLoggedMiles)}
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>logged mi</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700, fontSize: 20, color: '#F59E0B' }}>
                    {weekPlanned}
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>planned mi</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700, fontSize: 20, color: '#5B5BFF' }}>
                    {weekPlanned > 0 ? `${Math.min(100, Math.round((weekLoggedMiles / weekPlanned) * 100))}%` : '—'}
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>complete</div>
                </div>
              </div>
              <div style={{ height: 3, background: '#1A1A1A', borderRadius: 99 }}>
                <div style={{
                  height: '100%', borderRadius: 99,
                  width: `${weekPlanned > 0 ? Math.min(100, (weekLoggedMiles / weekPlanned) * 100) : 0}%`,
                  background: 'linear-gradient(90deg, #F59E0B, #22C55E)',
                }} />
              </div>
            </div>
          )}

          {/* ── Garmin health ─────────────────────────────────────── */}
          <div className="card mb-4">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Watch size={14} strokeWidth={1.5} color="#00E5FF" />
                <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
                  Garmin Health
                </span>
              </div>
              <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                {status?.lastSync
                  ? `Synced ${new Date(status.lastSync).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                  : health?.lastUpdated
                    ? `Data ${new Date(health.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                    : 'Never synced'}
              </span>
            </div>

            {metricTiles.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 12 }}>
                {metricTiles.map(({ label, value, color }) => (
                  <div key={label} style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid #1A1A1A',
                    borderRadius: 8, padding: '8px 10px',
                  }}>
                    <div style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700, fontSize: 15, color }}>{value}</div>
                    <div style={{ fontSize: 9, color: 'var(--text-tertiary)', marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 12 }}>
                No Garmin data — sync to see VO2max, body battery &amp; more
              </div>
            )}

            {syncMsg && (
              <div style={{ fontSize: 11, color: '#22C55E', marginBottom: 8, fontFamily: 'DM Sans, sans-serif' }}>{syncMsg}</div>
            )}

            {/* Charts = primary, Sync = secondary */}
            <div style={{ display: 'flex', gap: 8 }}>
              <Link
                href="/garmin"
                onClick={onClose}
                style={{
                  flex: 1, background: 'rgba(0,229,255,0.08)',
                  border: '1px solid rgba(0,229,255,0.25)',
                  borderRadius: 8, padding: '9px 12px',
                  color: '#00E5FF', fontSize: 12,
                  fontFamily: 'DM Sans, sans-serif', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  textDecoration: 'none',
                }}
              >
                <Activity size={13} strokeWidth={2} />
                View Charts
              </Link>
              <button
                onClick={handleSync}
                disabled={syncing}
                title="Sync Garmin now"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid #1A1A1A',
                  borderRadius: 8, padding: '9px 14px',
                  color: syncing ? '#52525B' : 'var(--text-secondary)',
                  cursor: syncing ? 'not-allowed' : 'pointer',
                  opacity: syncing ? 0.6 : 1, minHeight: 'unset',
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontFamily: 'DM Sans, sans-serif', fontSize: 12,
                }}
              >
                <RefreshCw size={12} strokeWidth={2} style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
                {syncing ? '…' : 'Sync'}
              </button>
            </div>
          </div>

          {/* ── Recent activities ─────────────────────────────────── */}
          {recentActivities.length > 0 && (
            <div className="card mb-4">
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginBottom: 10 }}>
                Recent Activities
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {recentActivities.map((act, i) => {
                  const dist = act.distance_miles != null ? `${Number(act.distance_miles).toFixed(1)} mi` : null;
                  const dur = act.duration_seconds ? formatDurationShort(act.duration_seconds) : null;
                  const hr = act.avg_heart_rate ? `${act.avg_heart_rate} bpm` : null;
                  const dateStr = new Date(act.activity_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  return (
                    <div key={act.id} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 0',
                      borderBottom: i < recentActivities.length - 1 ? '1px solid #1A1A1A' : 'none',
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                        background: 'rgba(0,229,255,0.07)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14,
                      }}>
                        {activityTypeLabel(act.activity_type) === 'Run' ? '🏃' :
                          activityTypeLabel(act.activity_type) === 'Strength' ? '🏋️' : '⚡'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>{activityTypeLabel(act.activity_type)}</span>
                          {dist && <span style={{ fontFamily: 'DM Mono, monospace', color: '#00E5FF', fontSize: 11 }}>{dist}</span>}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 1 }}>
                          {dateStr}{dur ? ` · ${dur}` : ''}{hr ? ` · ${hr}` : ''}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Link
                href="/garmin"
                onClick={onClose}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  marginTop: 10, padding: '6px 0',
                  borderTop: '1px solid #1A1A1A',
                  color: 'var(--text-tertiary)', fontSize: 11,
                  fontFamily: 'Manrope, sans-serif',
                  textDecoration: 'none',
                }}
              >
                View all · {status?.activitiesImported ?? 0} activities <ChevronRight size={10} />
              </Link>
            </div>
          )}

          {/* ── Race calendar ─────────────────────────────────────── */}
          <div className="card mb-4">
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginBottom: 10 }}>
              Race Calendar
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {raceCalendar.map((race, i) => {
                const days = getDaysUntil(race.date);
                const isPast = days <= 0;
                const isMain = race.type === 'main';
                return (
                  <div key={race.date} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: i < raceCalendar.length - 1 ? '1px solid #1A1A1A' : 'none',
                    opacity: isPast ? 0.5 : 1,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                        background: isMain
                          ? (race.name.includes('Houston') ? '#5B5BFF' : '#F59E0B')
                          : '#52525B',
                      }} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{race.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 1 }}>{race.goal}</div>
                      </div>
                    </div>
                    <div style={{
                      fontFamily: 'DM Mono, monospace', fontWeight: 700, fontSize: 13,
                      color: isPast ? '#22C55E' : isMain ? '#F59E0B' : 'var(--text-tertiary)',
                      flexShrink: 0,
                    }}>
                      {isPast ? '✓' : `${days}d`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Target paces ─────────────────────────────────────── */}
          <div className="card mb-4">
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginBottom: 10 }}>
              Target Paces
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {trainingPaces.map(p => (
                <div key={p.zone} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{p.zone}</span>
                  <span style={{ fontSize: 12, fontFamily: 'DM Mono, monospace', color: 'var(--text-primary)' }}>{p.normalPace}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Settings link ─────────────────────────────────────── */}
          <Link
            href="/settings"
            onClick={onClose}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 16px', borderRadius: 12,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid #1A1A1A',
              textDecoration: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Settings size={16} strokeWidth={1.5} color="#52525B" />
              <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif' }}>
                Settings
              </span>
            </div>
            <ChevronRight size={14} color="#52525B" />
          </Link>

        </div>
      </div>
    </>
  );
}
