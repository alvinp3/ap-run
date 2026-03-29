'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Watch, Settings, ChevronRight, RefreshCw } from 'lucide-react';
import { athleteProfile, raceCalendar, trainingPaces } from '@/data/reference-data';
import { getCurrentWeek, getPhaseForWeek, allWeeks, getDaysUntil } from '@/data/training-plan';
import { formatMiles } from '@/utils/workout';

interface GarminHealth {
  vo2max?: number;
  restingHR?: number;
  bodyBattery?: number;
  hrv?: number;
  lastUpdated?: string;
}

interface GarminStatus {
  connected: boolean;
  lastSync: string | null;
  activitiesImported: number;
}

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileDrawer({ isOpen, onClose }: ProfileDrawerProps) {
  const [health, setHealth] = useState<GarminHealth | null>(null);
  const [status, setStatus] = useState<GarminStatus | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const [loggedMiles, setLoggedMiles] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);

  const today = new Date();
  const currentWeek = getCurrentWeek(today);
  const phase = currentWeek ? getPhaseForWeek(currentWeek.week) : null;
  const completedWeeks = allWeeks.filter((w) => {
    const end = new Date(w.startDate);
    end.setDate(end.getDate() + 6);
    return end < today;
  }).length;

  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/garmin/today')
      .then(r => r.json())
      .then(d => { if (d.health) setHealth(d.health); })
      .catch(() => {});
    fetch('/api/garmin/status')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setStatus(d); })
      .catch(() => {});
    fetch('/api/logs')
      .then(r => r.json())
      .then(d => {
        if (d.logs) {
          const logs = d.logs as Record<string, { completed: boolean; miles?: number }>;
          const miles = Object.values(logs).reduce((s, l) => s + (l.miles ?? 0), 0);
          setLoggedMiles(miles);
          const done = Object.values(logs).filter(l => l.completed).length;
          setCompletionRate(completedWeeks > 0
            ? Math.round((done / Math.max(completedWeeks * 6, 1)) * 100)
            : 0);
        }
      })
      .catch(() => {});
  }, [isOpen, completedWeeks]);

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
        ].filter(Boolean);
        setSyncMsg(`Synced: ${parts.join(', ') || 'up to date'}`);
        const [hRes, sRes] = await Promise.all([fetch('/api/garmin/today'), fetch('/api/garmin/status')]);
        if (hRes.ok) { const hd = await hRes.json(); if (hd.health) setHealth(hd.health); }
        if (sRes.ok) setStatus(await sRes.json());
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
    { label: 'VO2max',       value: health?.vo2max ? String(health.vo2max) : null,                color: '#22C55E' },
    { label: 'Resting HR',   value: health?.restingHR ? `${health.restingHR} bpm` : null,        color: '#EF4444' },
    { label: 'Body Battery', value: health?.bodyBattery !== undefined ? `${health.bodyBattery}%` : null, color: '#F59E0B' },
    { label: 'HRV',          value: health?.hrv ? `${health.hrv} ms` : null,                      color: '#8B5CF6' },
  ].filter(m => m.value);

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
            Profile &amp; Settings
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

          {/* Athlete hero card */}
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, textAlign: 'center' }}>
              {[
                { label: 'Marathon PR', value: athleteProfile.marathonPR.replace(':00', ''), color: '#0d0df2' },
                { label: 'Week',        value: currentWeek ? String(currentWeek.week) : '—', color: '#F59E0B' },
                { label: 'Phase',       value: phase ? `P${phase.phase}` : '—',              color: '#8B5CF6' },
                { label: 'Done %',      value: `${completionRate}%`,                          color: '#22C55E' },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <div style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700, fontSize: 13, color }}>{value}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-tertiary)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div style={{ marginTop: 12 }}>
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
                  background: 'linear-gradient(90deg, #0d0df2, #8B5CF6)',
                }} />
              </div>
            </div>
          </div>

          {/* Garmin section */}
          <div className="card mb-4">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Watch size={14} strokeWidth={1.5} color="#00E5FF" />
                <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
                  Garmin
                </span>
              </div>
              <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                {status?.lastSync
                  ? `Synced ${new Date(status.lastSync).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                  : 'Never synced'}
              </span>
            </div>

            {metricTiles.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, marginBottom: 12 }}>
                {metricTiles.map(({ label, value, color }) => (
                  <div key={label} style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid #1A1A1A',
                    borderRadius: 8, padding: '8px 10px',
                  }}>
                    <div style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700, fontSize: 16, color }}>{value}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 12 }}>
                No Garmin data — sync to see VO2max, HRV &amp; more
              </div>
            )}

            {syncMsg && (
              <div style={{ fontSize: 11, color: '#22C55E', marginBottom: 8, fontFamily: 'DM Sans, sans-serif' }}>{syncMsg}</div>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleSync}
                disabled={syncing}
                style={{
                  flex: 1, background: 'rgba(0,229,255,0.07)',
                  border: '1px solid rgba(0,229,255,0.2)',
                  borderRadius: 8, padding: '8px 12px',
                  color: '#00E5FF', fontSize: 12,
                  fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
                  cursor: syncing ? 'not-allowed' : 'pointer',
                  opacity: syncing ? 0.6 : 1, minHeight: 'unset',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <RefreshCw size={12} strokeWidth={2} style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
                {syncing ? 'Syncing…' : 'Sync Now'}
              </button>
              <Link
                href="/garmin"
                onClick={onClose}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid #1A1A1A',
                  borderRadius: 8, padding: '8px 14px',
                  color: 'var(--text-secondary)', fontSize: 12,
                  fontFamily: 'DM Sans, sans-serif',
                  display: 'flex', alignItems: 'center', gap: 4,
                  textDecoration: 'none', whiteSpace: 'nowrap',
                }}
              >
                Charts <ChevronRight size={12} />
              </Link>
            </div>
          </div>

          {/* Race calendar */}
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
                          ? (race.name.includes('Houston') ? '#0d0df2' : '#F59E0B')
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

          {/* Training paces */}
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

          {/* Settings link */}
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
