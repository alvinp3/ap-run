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
}

export default function RaceCountdown({
  name,
  date,
  emoji = '🏁',
  color = '#8B5CF6',
  totalWeeks,
  currentWeek,
  isActive = false,
}: RaceCountdownProps) {
  const days = getDaysUntil(date);
  const percent = Math.min(100, (currentWeek / totalWeeks) * 100);
  const raceDate = new Date(date + 'T00:00:00');
  const dateStr = raceDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const isComplete = days <= 0;

  return (
    <div
      className="card flex-shrink-0 flex items-center gap-4"
      style={{
        minWidth: 240,
        borderColor: isActive ? `${color}44` : 'var(--border-subtle)',
        boxShadow: isActive ? `0 0 20px ${color}15` : undefined,
      }}
    >
      <ProgressRing
        percent={percent}
        size={80}
        strokeWidth={6}
        color={color}
        label={isComplete ? '✓' : `${Math.round(percent)}%`}
        sublabel={isComplete ? 'DONE' : 'done'}
      />
      <div className="flex-1 min-w-0">
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
