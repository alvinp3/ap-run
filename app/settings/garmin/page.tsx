'use client';

import { useState, useEffect } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import AppNav from '@/components/layout/AppNav';

interface GarminStatus {
  connected: boolean;
  lastSync: string | null;
  activitiesImported: number;
  latestActivity: string | null;
  message?: string;
}

type ActionState = 'idle' | 'loading' | 'success' | 'error';

export default function GarminSettingsPage() {
  const [status, setStatus] = useState<GarminStatus>({
    connected: false,
    lastSync: null,
    activitiesImported: 0,
    latestActivity: null,
  });
  const [statusLoading, setStatusLoading] = useState(true);

  const [connectState, setConnectState] = useState<ActionState>('idle');
  const [pullState, setPullState]       = useState<ActionState>('idle');
  const [syncState, setSyncState]       = useState<ActionState>('idle');

  const [connectMsg, setConnectMsg] = useState('');
  const [pullMsg, setPullMsg]       = useState('');
  const [syncMsg, setSyncMsg]       = useState('');

  useEffect(() => { fetchStatus(); }, []);

  async function fetchStatus() {
    setStatusLoading(true);
    try {
      const r = await fetch('/api/garmin/status');
      if (r.ok) setStatus(await r.json());
    } finally {
      setStatusLoading(false);
    }
  }

  async function handleConnect() {
    setConnectState('loading');
    setConnectMsg('');
    try {
      const r = await fetch('/api/garmin/connect', { method: 'POST' });
      const d = await r.json();
      if (d.success) {
        setConnectState('success');
        setConnectMsg(`Connected as ${d.displayName}`);
        await fetchStatus();
      } else {
        setConnectState('error');
        setConnectMsg(d.error ?? 'Connection failed');
      }
    } catch (e) {
      setConnectState('error');
      setConnectMsg(String(e));
    }
  }

  async function handlePull() {
    setPullState('loading');
    setPullMsg('');
    try {
      const r = await fetch('/api/garmin/pull', { method: 'POST' });
      const d = await r.json();
      if (d.success) {
        setPullState('success');
        const parts = [
          d.healthSaved && 'health data',
          d.activitiesImported && `${d.activitiesImported} activities`,
          d.workoutsAutoCompleted && `${d.workoutsAutoCompleted} workouts auto-completed`,
        ].filter(Boolean);
        setPullMsg(`Pulled: ${parts.join(', ') || 'no new data'}${d.errors?.length ? ` (${d.errors.length} errors)` : ''}`);
        await fetchStatus();
      } else {
        setPullState('error');
        setPullMsg(d.error ?? 'Pull failed');
      }
    } catch (e) {
      setPullState('error');
      setPullMsg(String(e));
    }
  }

  async function handleSync() {
    setSyncState('loading');
    setSyncMsg('');
    try {
      const r = await fetch('/api/garmin/sync', { method: 'POST' });
      const d = await r.json();
      if (d.success) {
        setSyncState('success');
        setSyncMsg(`Pushed ${d.pushed} workouts to watch (${d.skipped} rest days skipped${d.errors ? `, ${d.errors} errors` : ''})`);
      } else {
        setSyncState('error');
        setSyncMsg(d.error ?? 'Push failed');
      }
    } catch (e) {
      setSyncState('error');
      setSyncMsg(String(e));
    }
  }

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <AppHeader title="Garmin Connect" />

      <main className="flex-1 overflow-y-auto px-4 pb-32 pt-4 max-w-lg mx-auto w-full">
        <h1
          className="text-2xl font-black mb-1"
          style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
        >
          Garmin Connect
        </h1>
        <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
          Forerunner 745 — sync health data and push workouts to your watch
        </p>

        {/* Status tiles */}
        <div className="card mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: 'rgba(139,92,246,0.1)' }}
            >
              ⌚
            </div>
            <div>
              <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Garmin Forerunner 745</div>
              <div
                className="text-xs mt-0.5 flex items-center gap-1.5"
                style={{ color: status.connected ? '#22C55E' : '#EF4444' }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full inline-block flex-shrink-0"
                  style={{ background: status.connected ? '#22C55E' : '#EF4444' }}
                />
                {statusLoading ? 'Checking…' : status.connected ? 'Connected' : 'Not connected'}
              </div>
              {!statusLoading && !status.connected && status.message && (
                <div className="text-xs mt-1" style={{ color: '#A1A1AA' }}>
                  {status.message}
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <StatusTile label="Activities" value={statusLoading ? '…' : String(status.activitiesImported)} color="var(--accent-teal)" />
            <StatusTile
              label="Last Sync"
              value={statusLoading ? '…' : (status.lastSync ? new Date(status.lastSync).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Never')}
              color="var(--text-secondary)"
            />
            <StatusTile label="Latest Run" value={statusLoading ? '…' : (status.latestActivity ?? '—')} color="var(--text-secondary)" />
          </div>
        </div>

        {/* Step 1: Connect */}
        <ActionCard
          step="1"
          title="Authenticate"
          description="Log in to Garmin Connect and save your session. Run this once — the app stores your tokens so it won't need to log in again."
          buttonLabel="Connect to Garmin"
          buttonLoadingLabel="Connecting…"
          state={connectState}
          message={connectMsg}
          onAction={handleConnect}
        />

        {/* Step 2: Pull */}
        <ActionCard
          step="2"
          title="Pull Data from Watch"
          description="Fetch today's health metrics (resting HR, sleep) and your last 14 activities. Matching runs are auto-completed in your training log."
          buttonLabel="Pull Health & Activities"
          buttonLoadingLabel="Pulling…"
          state={pullState}
          message={pullMsg}
          onAction={handlePull}
        />

        {/* Step 3: Push workouts */}
        <ActionCard
          step="3"
          title="Push Workouts to Watch"
          description="Upload the next 7 days of planned workouts to your Garmin Connect library. Sync your watch and they'll appear in your workout list."
          buttonLabel="Push Next 7 Days"
          buttonLoadingLabel="Pushing…"
          state={syncState}
          message={syncMsg}
          onAction={handleSync}
        />

        {/* What syncs */}
        <div className="card mb-4">
          <div className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            What Gets Synced
          </div>
          <div className="space-y-2.5">
            {[
              { icon: '🏃', label: 'Run activities', detail: 'Distance, pace, duration, avg HR' },
              { icon: '❤️', label: 'Resting heart rate', detail: 'Daily RHR — rising trend = warning' },
              { icon: '😴', label: 'Sleep duration', detail: 'Last night\'s sleep hours' },
              { icon: '📋', label: 'Workout auto-complete', detail: 'Activities matched to your training plan' },
              { icon: '📲', label: 'Workouts to watch', detail: 'Next 7 days pushed to Garmin Connect' },
            ].map(({ icon, label, detail }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-lg w-8 text-center flex-shrink-0">{icon}</span>
                <div>
                  <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{label}</div>
                  <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Watch widget */}
        <div className="card mb-4" style={{ borderColor: 'rgba(139,92,246,0.2)' }}>
          <div className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            Connect IQ Watch Widget
          </div>
          <div className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
            See today&apos;s workout on your wrist. Source is in <code style={{ color: '#8B5CF6' }}>/garmin-widget/</code> — load via Connect IQ SDK and sideload to your FR745.
          </div>
        </div>
      </main>

      <AppNav />
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────

function StatusTile({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl p-3 text-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="text-sm font-bold truncate" style={{ color, fontFamily: 'DM Mono, monospace' }}>
        {value}
      </div>
      <div className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{label}</div>
    </div>
  );
}

function ActionCard({
  step, title, description, buttonLabel, buttonLoadingLabel, state, message, onAction,
}: {
  step: string;
  title: string;
  description: string;
  buttonLabel: string;
  buttonLoadingLabel: string;
  state: ActionState;
  message: string;
  onAction: () => void;
}) {
  const isLoading = state === 'loading';
  return (
    <div className="card mb-4">
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
          style={{ background: 'rgba(139,92,246,0.15)', color: '#8B5CF6' }}
        >
          {step}
        </div>
        <div>
          <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{title}</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{description}</div>
        </div>
      </div>

      {message && (
        <div
          className="text-xs px-3 py-2 rounded-xl mb-3"
          style={{
            background: state === 'success' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
            color: state === 'success' ? '#22C55E' : '#EF4444',
          }}
        >
          {state === 'success' ? '✓ ' : '✗ '}{message}
        </div>
      )}

      <button
        onClick={onAction}
        disabled={isLoading}
        className="w-full py-2.5 rounded-xl text-sm font-semibold"
        style={{
          background: isLoading ? 'rgba(139,92,246,0.08)' : 'rgba(139,92,246,0.12)',
          border: '1px solid rgba(139,92,246,0.3)',
          color: '#8B5CF6',
          minHeight: 44,
          opacity: isLoading ? 0.7 : 1,
        }}
      >
        {isLoading ? buttonLoadingLabel : buttonLabel}
      </button>
    </div>
  );
}
