'use client';

import { useState, useEffect } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import AppNav from '@/components/layout/AppNav';

interface GarminSyncStatus {
  connected: boolean;
  lastSync: string | null;
  activitiesImported: number;
  latestActivity: string | null;
}

export default function GarminSettingsPage() {
  const [status, setStatus] = useState<GarminSyncStatus>({
    connected: false,
    lastSync: null,
    activitiesImported: 0,
    latestActivity: null,
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  async function fetchStatus() {
    setLoading(true);
    try {
      const res = await fetch('/api/garmin/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch {
      // Garmin sync worker not configured — expected in dev
    } finally {
      setLoading(false);
    }
  }

  async function triggerSync() {
    setSyncing(true);
    setMessage(null);
    try {
      const res = await fetch('/api/garmin/sync', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message || 'Sync triggered. Check back in a few minutes.' });
        await fetchStatus();
      } else {
        setMessage({ type: 'error', text: data.error || 'Sync failed. Check Railway worker logs.' });
      }
    } catch {
      setMessage({ type: 'info', text: 'Garmin sync worker is not configured. See setup instructions below.' });
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <AppHeader title="Garmin Connect" />

      <main className="flex-1 overflow-y-auto px-4 pb-32 pt-4 max-w-lg mx-auto w-full">
        <h1
          className="text-2xl font-black mb-1"
          style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}
        >
          Garmin Connect
        </h1>
        <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
          Forerunner 745 activity sync
        </p>

        {/* Message banner */}
        {message && (
          <div
            className="mb-4 px-4 py-3 rounded-xl text-sm"
            style={{
              background:
                message.type === 'success' ? 'rgba(34,197,94,0.1)' :
                message.type === 'error' ? 'rgba(239,68,68,0.1)' :
                'rgba(59,130,246,0.1)',
              color:
                message.type === 'success' ? '#22C55E' :
                message.type === 'error' ? '#EF4444' :
                '#3B82F6',
            }}
          >
            {message.text}
          </div>
        )}

        {/* Connection status */}
        <div className="card mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: 'rgba(45,212,191,0.1)' }}
            >
              ⌚
            </div>
            <div>
              <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                Garmin Forerunner 745
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                Running computer + heart rate monitor
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatusTile
              label="Status"
              value={loading ? '...' : (status.connected ? 'Connected' : 'Disconnected')}
              color={status.connected ? '#22C55E' : '#F59E0B'}
            />
            <StatusTile
              label="Activities"
              value={loading ? '...' : String(status.activitiesImported)}
              color="var(--accent-teal)"
            />
            <StatusTile
              label="Last Sync"
              value={loading ? '...' : (status.lastSync ? new Date(status.lastSync).toLocaleDateString() : 'Never')}
              color="var(--text-secondary)"
            />
            <StatusTile
              label="Latest Run"
              value={loading ? '...' : (status.latestActivity ?? 'None yet')}
              color="var(--text-secondary)"
            />
          </div>
        </div>

        {/* Manual sync button */}
        <div className="card mb-4">
          <div className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Manual Sync
          </div>
          <div className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
            Triggers the Railway worker to pull the latest activities from Garmin Connect. Auto-sync runs every 6 hours.
          </div>
          <button
            onClick={triggerSync}
            disabled={syncing}
            className="btn-teal w-full"
            style={{ opacity: syncing ? 0.7 : 1 }}
          >
            {syncing ? '⟳ Syncing…' : '↻ Sync Now'}
          </button>
        </div>

        {/* What gets synced */}
        <div className="card mb-4">
          <div className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            What Gets Synced
          </div>
          <div className="space-y-2">
            {[
              { icon: '🏃', label: 'Run activities', detail: 'Distance, pace, duration, HR' },
              { icon: '❤️', label: 'Heart rate zones', detail: 'Time in Zone 1-5 per workout' },
              { icon: '📊', label: 'VO2max estimate', detail: 'Garmin Performance Condition' },
              { icon: '😴', label: 'Recovery data', detail: 'Sleep, HRV, Body Battery' },
              { icon: '🌡️', label: 'Stress score', detail: 'Daily stress tracking' },
            ].map(({ icon, label, detail }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-lg w-8 text-center">{icon}</span>
                <div>
                  <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{label}</div>
                  <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Architecture note */}
        <div className="card mb-4" style={{ borderColor: 'rgba(59,130,246,0.2)', background: 'rgba(59,130,246,0.04)' }}>
          <div className="text-sm font-bold mb-2" style={{ color: '#3B82F6' }}>
            Setup Required: Railway Worker
          </div>
          <div className="text-xs space-y-2" style={{ color: 'var(--text-secondary)' }}>
            <p>
              Garmin does not provide a public webhook API. This app uses a separate Railway worker service that logs into Garmin Connect on a schedule and pulls activity data.
            </p>
            <p>
              The sync worker is in <code style={{ color: 'var(--accent-teal)' }}>/services/garmin-sync/</code> and runs as a Railway cron job.
            </p>
          </div>
          <div className="mt-3 space-y-1">
            {[
              '1. Deploy the Railway service from /services/garmin-sync/',
              '2. Set GARMIN_EMAIL and GARMIN_PASSWORD env vars',
              '3. Set the Railway worker URL in your .env.local',
              '4. Enable auto-sync in Settings',
            ].map((step) => (
              <div key={step} className="text-xs flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#3B82F6' }} />
                <span style={{ color: 'var(--text-tertiary)' }}>{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Connect IQ Widget */}
        <div className="card mb-4">
          <div className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Connect IQ Watch Widget
          </div>
          <div className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
            Install the BQ Training widget on your Forerunner 745 to see today&apos;s planned workout directly on your wrist.
          </div>
          <div
            className="text-xs p-3 rounded-xl"
            style={{ background: 'rgba(45,212,191,0.05)', border: '1px solid rgba(45,212,191,0.15)', color: 'var(--text-tertiary)' }}
          >
            Widget source: <code style={{ color: 'var(--accent-teal)' }}>/garmin-widget/</code>
            <br />
            Fetches data from: <code style={{ color: 'var(--accent-teal)' }}>/api/garmin/today</code>
            <br />
            Install via Garmin Express or Connect IQ SDK
          </div>
        </div>
      </main>

      <AppNav />
    </div>
  );
}

function StatusTile({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="rounded-xl p-3 text-center"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div className="text-sm font-bold" style={{ color, fontFamily: 'JetBrains Mono, monospace' }}>
        {value}
      </div>
      <div className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
        {label}
      </div>
    </div>
  );
}
