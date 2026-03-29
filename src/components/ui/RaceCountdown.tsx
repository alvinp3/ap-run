'use client';

import ProgressRing from './ProgressRing';
import { getDaysUntil } from '@/utils/workout';

interface RaceCountdownProps {
  name: string;
  date: string;
  emoji?: string;
  color?: string;
  totalWeeks: number;
  currentWeek: number;
  isActive?: boolean;
  bgVariant?: 'marathon' | 'ultra';
}

// ── Background SVGs ───────────────────────────────────────────────────────────

function MarathonBg({ color }: { color: string }) {
  return (
    <svg
      aria-hidden="true"
      width="100%" height="100%"
      viewBox="0 0 360 100"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      {/* Road perspective lines */}
      <line x1="0"   y1="38" x2="360" y2="46" stroke={color} strokeWidth="0.8" strokeOpacity="0.14" />
      <line x1="0"   y1="50" x2="360" y2="50" stroke={color} strokeWidth="0.8" strokeOpacity="0.10" />
      <line x1="0"   y1="62" x2="360" y2="54" stroke={color} strokeWidth="0.8" strokeOpacity="0.14" />
      {/* Dashed center line */}
      <line x1="0" y1="50" x2="360" y2="50" stroke={color} strokeWidth="1" strokeOpacity="0.09"
            strokeDasharray="10 10" />
      {/* City skyline — right half */}
      <rect x="190" y="25" width="7"  height="25" fill={color} fillOpacity="0.055" />
      <rect x="202" y="14" width="10" height="36" fill={color} fillOpacity="0.065" />
      <rect x="216" y="20" width="6"  height="30" fill={color} fillOpacity="0.05" />
      <rect x="226" y="8"  width="13" height="42" fill={color} fillOpacity="0.07" />
      <rect x="243" y="18" width="8"  height="32" fill={color} fillOpacity="0.055" />
      <rect x="255" y="12" width="14" height="38" fill={color} fillOpacity="0.065" />
      <rect x="273" y="22" width="7"  height="28" fill={color} fillOpacity="0.045" />
      <rect x="284" y="16" width="9"  height="34" fill={color} fillOpacity="0.055" />
      <rect x="297" y="10" width="11" height="40" fill={color} fillOpacity="0.06" />
      <rect x="312" y="20" width="6"  height="30" fill={color} fillOpacity="0.05" />
      <rect x="322" y="5"  width="16" height="45" fill={color} fillOpacity="0.07" />
      <rect x="342" y="18" width="8"  height="32" fill={color} fillOpacity="0.05" />
      {/* Ground line under skyline */}
      <line x1="185" y1="50" x2="360" y2="50" stroke={color} strokeWidth="0.5" strokeOpacity="0.12" />
      {/* Finish tape hint */}
      <line x1="338" y1="0" x2="338" y2="100" stroke={color} strokeWidth="1.5" strokeOpacity="0.1"
            strokeDasharray="4 3" />
    </svg>
  );
}

function UltraBg({ color }: { color: string }) {
  return (
    <svg
      aria-hidden="true"
      width="100%" height="100%"
      viewBox="0 0 360 100"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      {/* Rolling terrain contour lines */}
      <path d="M0,72 C40,58 80,75 130,62 C180,48 220,68 270,55 C305,45 335,60 360,52"
            stroke={color} strokeWidth="1" strokeOpacity="0.18" />
      <path d="M0,82 C40,68 80,85 130,72 C180,58 220,78 270,65 C305,55 335,70 360,62"
            stroke={color} strokeWidth="0.8" strokeOpacity="0.13" />
      <path d="M0,62 C50,48 90,66 140,52 C190,38 230,58 280,44 C310,34 340,50 360,42"
            stroke={color} strokeWidth="0.7" strokeOpacity="0.10" />
      {/* Stars / trail waypoints */}
      <circle cx="55"  cy="48" r="1.8" fill={color} fillOpacity="0.30" />
      <circle cx="130" cy="35" r="1.8" fill={color} fillOpacity="0.25" />
      <circle cx="200" cy="42" r="1.8" fill={color} fillOpacity="0.30" />
      <circle cx="275" cy="30" r="1.8" fill={color} fillOpacity="0.22" />
      <circle cx="340" cy="38" r="1.8" fill={color} fillOpacity="0.18" />
      {/* Dotted trail connecting waypoints */}
      <path d="M55,48 L130,35 L200,42 L275,30 L340,38"
            stroke={color} strokeWidth="0.8" strokeOpacity="0.12"
            strokeDasharray="3 5" />
      {/* Moon / night sky suggestion */}
      <circle cx="320" cy="18" r="8" stroke={color} strokeWidth="0.8" strokeOpacity="0.10" />
      <circle cx="324" cy="15" r="8" fill="#050505" />
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function RaceCountdown({
  name,
  date,
  emoji = '🏁',
  color = '#8B5CF6',
  totalWeeks,
  currentWeek,
  isActive = false,
  bgVariant,
}: RaceCountdownProps) {
  const days = getDaysUntil(date);
  const percent = Math.min(100, (currentWeek / totalWeeks) * 100);
  const raceDate = new Date(date + 'T00:00:00');
  const dateStr = raceDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const isComplete = days <= 0;

  return (
    <div
      className="card flex items-center gap-4 w-full"
      style={{
        borderColor: isActive ? `${color}44` : 'var(--border-subtle)',
        boxShadow: isActive ? `0 0 20px ${color}15` : undefined,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background graphic */}
      {bgVariant === 'marathon' && <MarathonBg color={color} />}
      {bgVariant === 'ultra'    && <UltraBg    color={color} />}

      {/* Content (above the bg) */}
      <ProgressRing
        percent={percent}
        size={80}
        strokeWidth={6}
        color={color}
        label={isComplete ? '✓' : `${Math.round(percent)}%`}
        sublabel={isComplete ? 'DONE' : 'done'}
      />
      <div className="flex-1 min-w-0" style={{ position: 'relative' }}>
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-base">{emoji}</span>
          <span
            className="text-xs font-semibold tracking-wide truncate"
            style={{ color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif' }}
          >
            {name.toUpperCase()}
          </span>
        </div>
        <div
          className="text-3xl font-black leading-none"
          style={{ fontFamily: 'Space Grotesk, sans-serif', color: isComplete ? color : 'var(--text-primary)' }}
        >
          {isComplete ? 'DONE!' : `${days}`}
          {!isComplete && (
            <span
              className="text-sm font-semibold ml-1"
              style={{ color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif' }}
            >
              days
            </span>
          )}
        </div>
        <div
          className="text-xs mt-1 truncate"
          style={{ color: 'var(--text-tertiary)', fontFamily: 'DM Sans, sans-serif' }}
        >
          {dateStr}
        </div>
      </div>
    </div>
  );
}
