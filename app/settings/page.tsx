'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppHeader from '@/components/layout/AppHeader';
import AppNav from '@/components/layout/AppNav';
import CoachFAB from '@/components/coach/CoachFAB';
import { Watch, Share2, Copy, Check } from 'lucide-react';

type TrainingWindow = 'morning' | 'midday' | 'evening';

const TRAINING_WINDOWS: { key: TrainingWindow; label: string; sublabel: string }[] = [
  { key: 'morning', label: 'Morning', sublabel: '5–6 AM'  },
  { key: 'midday',  label: 'Midday',  sublabel: '12–1 PM' },
  { key: 'evening', label: 'Evening', sublabel: '5–7 PM'  },
];

interface UserSettings {
  displayName: string;
  unitSystem: 'imperial' | 'metric';
  trainingWindow: TrainingWindow;
  heatAdvisories: boolean;
  paceAlerts: boolean;
  weeklyReminders: boolean;
  restDayReminders: boolean;
  shareEnabled: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  displayName: 'Runner',
  unitSystem: 'imperial',
  trainingWindow: 'morning',
  heatAdvisories: true,
  paceAlerts: true,
  weeklyReminders: true,
  restDayReminders: false,
  shareEnabled: true,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [swStatus, setSwStatus] = useState<'unknown' | 'registered' | 'unsupported'>('unknown');

  useEffect(() => {
    const stored = localStorage.getItem('bq-settings');
    if (stored) {
      try { setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) }); } catch {}
    }
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration('/').then((reg) => {
        setSwStatus(reg ? 'registered' : 'unknown');
      });
    } else {
      setSwStatus('unsupported');
    }
  }, []);

  function updateSetting<K extends keyof UserSettings>(key: K, value: UserSettings[K]) {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      localStorage.setItem('bq-settings', JSON.stringify(next));
      return next;
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleCopyLink() {
    const url = window.location.origin + '/share/me';
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select + copy
      const el = document.createElement('input');
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleNativeShare() {
    const url = window.location.origin + '/share/me';
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'BQ Training Progress',
          text: 'Follow my training for the Houston Marathon and Grasslands 100!',
          url,
        });
      } catch {}
    }
  }

  function clearAllData() {
    if (!window.confirm('Clear all local data? This resets gear checklists, workout notes, and settings. Training plan data is unaffected.')) return;
    ['bq-settings', 'gear-checklist', 'bq-coach-history', 'bq-coach-applied', 'bq-coach-dismissed'].forEach((k) => localStorage.removeItem(k));
    setSettings(DEFAULT_SETTINGS);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <AppHeader />

      <main className="flex-1 overflow-y-auto px-4 pb-32 pt-4 max-w-lg mx-auto w-full">
        <h1
          className="text-2xl font-black mb-1"
          style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
        >
          Settings
        </h1>
        <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
          App preferences and configuration
        </p>

        {saved && (
          <div
            className="mb-4 px-4 py-2 rounded-xl text-sm font-semibold text-center"
            style={{ background: 'rgba(34,197,94,0.12)', color: '#22C55E' }}
          >
            ✓ Settings saved
          </div>
        )}

        {/* Profile */}
        <SectionHeader label="Profile" />
        <div className="card mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Display Name</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                Shown in share links and coach chat
              </div>
            </div>
            <input
              type="text"
              value={settings.displayName}
              onChange={(e) => updateSetting('displayName', e.target.value)}
              className="text-sm px-3 py-2 rounded-xl w-36 text-right"
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontFamily: 'DM Sans, sans-serif',
                outline: 'none',
              }}
              maxLength={24}
            />
          </div>
        </div>

        {/* Display */}
        <SectionHeader label="Display" />
        <div className="card mb-4">
          <ToggleRow
            label="Unit System"
            sublabel={settings.unitSystem === 'imperial' ? 'Miles, °F' : 'Kilometers, °C'}
            value={settings.unitSystem === 'imperial'}
            onLabel="Imperial"
            offLabel="Metric"
            isToggle={false}
            onSelect={(val) => updateSetting('unitSystem', val ? 'imperial' : 'metric')}
          />
        </div>

        {/* Training window */}
        <SectionHeader label="Training Window" />
        <div className="card mb-4">
          <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            Preferred Workout Time
          </div>
          <div className="text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>
            Weather forecast and heat advisories reflect conditions during this window.
          </div>
          <div className="flex gap-2">
            {TRAINING_WINDOWS.map(({ key, label, sublabel }) => {
              const active = settings.trainingWindow === key;
              return (
                <button
                  key={key}
                  onClick={() => updateSetting('trainingWindow', key)}
                  className="flex-1 py-2.5 rounded-xl text-center"
                  style={{
                    background: active ? 'rgba(139,92,246,0.12)' : 'var(--bg-primary)',
                    border: `1px solid ${active ? '#8B5CF6' : 'var(--border-subtle)'}`,
                    minHeight: 56,
                  }}
                >
                  <div className="text-sm font-semibold" style={{ color: active ? '#8B5CF6' : 'var(--text-primary)' }}>
                    {label}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)', fontFamily: 'DM Mono, monospace' }}>
                    {sublabel}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notifications */}
        <SectionHeader label="Notifications & Advisories" />
        <div className="card mb-4 space-y-4">
          <ToggleRow
            label="Heat Advisories"
            sublabel="Show heat index warnings during summer training"
            value={settings.heatAdvisories}
            onToggle={(val) => updateSetting('heatAdvisories', val)}
          />
          <div style={{ borderTop: '1px solid var(--border-subtle)' }} />
          <ToggleRow
            label="Pace Alerts"
            sublabel="Alert when actual pace deviates from plan"
            value={settings.paceAlerts}
            onToggle={(val) => updateSetting('paceAlerts', val)}
          />
          <div style={{ borderTop: '1px solid var(--border-subtle)' }} />
          <ToggleRow
            label="Weekly Summary"
            sublabel="Monday reminder with upcoming week overview"
            value={settings.weeklyReminders}
            onToggle={(val) => updateSetting('weeklyReminders', val)}
          />
          <div style={{ borderTop: '1px solid var(--border-subtle)' }} />
          <ToggleRow
            label="Rest Day Reminders"
            sublabel="Reminder to do active recovery on rest days"
            value={settings.restDayReminders}
            onToggle={(val) => updateSetting('restDayReminders', val)}
          />
        </div>

        {/* Garmin — link to the dedicated page */}
        <SectionHeader label="Garmin" />
        <Link
          href="/garmin"
          className="card mb-4 flex items-center justify-between no-underline"
          style={{ cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: 'rgba(0,229,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Watch size={18} strokeWidth={1.5} color="#00E5FF" />
            </div>
            <div>
              <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Athlete Profile &amp; Garmin Data
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                View activities, charts, and sync controls
              </div>
            </div>
          </div>
          <span style={{ color: '#52525B', fontSize: 18, lineHeight: 1 }}>›</span>
        </Link>

        {/* Sharing */}
        <SectionHeader label="Sharing" />
        <div className="card mb-4 space-y-4">
          <ToggleRow
            label="Public Share Link"
            sublabel="Allow /share/me to show your training progress"
            value={settings.shareEnabled}
            onToggle={(val) => updateSetting('shareEnabled', val)}
          />
          {settings.shareEnabled && (
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
              <div className="text-xs mb-2" style={{ color: 'var(--text-tertiary)' }}>Your training share link:</div>
              <div
                className="text-xs px-3 py-2 rounded-xl flex items-center gap-2"
                style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)' }}
              >
                <span
                  className="flex-1 truncate"
                  style={{ fontFamily: 'DM Mono, monospace', color: '#8B5CF6', fontSize: 11 }}
                >
                  {typeof window !== 'undefined' ? window.location.origin : ''}/share/me
                </span>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold flex-shrink-0"
                  style={{
                    background: copied ? 'rgba(34,197,94,0.12)' : 'rgba(139,92,246,0.1)',
                    color: copied ? '#22C55E' : '#8B5CF6',
                    border: `1px solid ${copied ? 'rgba(34,197,94,0.2)' : 'rgba(139,92,246,0.2)'}`,
                    minHeight: 'unset', transition: 'all 0.15s',
                  }}
                >
                  {copied ? <Check size={11} strokeWidth={2.5} /> : <Copy size={11} strokeWidth={2} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                {typeof navigator !== 'undefined' && 'share' in navigator && (
                  <button
                    onClick={handleNativeShare}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold flex-shrink-0"
                    style={{
                      background: 'rgba(0,229,255,0.07)',
                      color: '#00E5FF',
                      border: '1px solid rgba(0,229,255,0.2)',
                      minHeight: 'unset',
                    }}
                  >
                    <Share2 size={11} strokeWidth={2} />
                    Share
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* PWA / Offline */}
        <SectionHeader label="App & Offline" />
        <div className="card mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Offline Mode</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                Service worker caches today&apos;s workout
              </div>
            </div>
            <div
              className="text-xs px-2 py-1 rounded-lg font-semibold"
              style={{
                background: swStatus === 'registered' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
                color: swStatus === 'registered' ? '#22C55E' : '#F59E0B',
              }}
            >
              {swStatus === 'registered' ? 'Active' : swStatus === 'unsupported' ? 'Unsupported' : 'Pending'}
            </div>
          </div>
          <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            Install to home screen for full offline access. iOS: Share → Add to Home Screen. Android: menu → Install App.
          </div>
        </div>

        {/* Data / danger zone */}
        <SectionHeader label="Data" />
        <div className="card mb-4">
          <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
            Clears all locally stored data: settings, gear checklist, coach history. Training plan data is never deleted.
          </div>
          <button
            onClick={clearAllData}
            className="w-full py-2.5 rounded-xl text-sm font-semibold mt-1"
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#EF4444', minHeight: 44,
            }}
          >
            Clear Local Data
          </button>
        </div>

        <div className="text-center text-xs py-4" style={{ color: 'var(--text-tertiary)' }}>
          BQ Training App · v1.0.0<br />
          51-week plan · Houston 2027 + Grasslands 100
        </div>
      </main>

      <AppNav />
      <CoachFAB />
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <div
      className="text-xs font-semibold tracking-widest uppercase mb-2 px-1"
      style={{ color: 'var(--text-tertiary)', fontFamily: 'DM Sans, sans-serif' }}
    >
      {label}
    </div>
  );
}

interface ToggleRowProps {
  label: string;
  sublabel: string;
  value: boolean;
  onToggle?: (val: boolean) => void;
  onSelect?: (val: boolean) => void;
  onLabel?: string;
  offLabel?: string;
  isToggle?: boolean;
}

function ToggleRow({ label, sublabel, value, onToggle, onSelect, onLabel, offLabel, isToggle = true }: ToggleRowProps) {
  if (!isToggle && onSelect && onLabel && offLabel) {
    return (
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{sublabel}</div>
        </div>
        <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
          {[true, false].map((v) => (
            <button
              key={String(v)}
              onClick={() => onSelect(v)}
              className="px-3 py-1.5 text-xs font-semibold"
              style={{
                background: value === v ? 'rgba(139,92,246,0.15)' : 'transparent',
                color: value === v ? '#8B5CF6' : 'var(--text-tertiary)',
                minHeight: 36,
              }}
            >
              {v ? onLabel : offLabel}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex-1 pr-4">
        <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{sublabel}</div>
      </div>
      <button
        onClick={() => onToggle?.(!value)}
        className="relative flex-shrink-0"
        style={{
          width: 48, height: 28, borderRadius: 14,
          background: value ? 'rgba(139,92,246,0.3)' : 'var(--bg-primary)',
          border: `1px solid ${value ? '#8B5CF6' : 'var(--border-subtle)'}`,
          transition: 'background 0.2s, border-color 0.2s',
          minWidth: 48,
        }}
        aria-checked={value}
        role="switch"
      >
        <span
          style={{
            position: 'absolute', top: 3,
            left: value ? 22 : 3,
            width: 20, height: 20, borderRadius: '50%',
            background: value ? '#8B5CF6' : 'var(--border-accent)',
            transition: 'left 0.2s',
          }}
        />
      </button>
    </div>
  );
}
