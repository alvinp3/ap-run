'use client';

import { useState, useEffect } from 'react';

interface TomorrowWorkout {
  type: string;
  estimatedMinutes: number;
  description: string;
}

interface SleepRecommendationProps {
  tomorrowWorkout: TomorrowWorkout | null;
  todayStr: string;
}

function getWakeUpHourMin(workout: TomorrowWorkout | null): [number, number] {
  if (!workout) return [7, 0]; // rest day default

  // Check description for explicit wake-up times
  if (workout.description.includes('5:00 AM')) return [5, 0];
  if (workout.description.includes('5:30 AM')) return [5, 30];

  switch (workout.type) {
    case 'long':
      return [5, 0];
    case 'intervals':
    case 'tempo':
      return [5, 30];
    case 'easy':
    case 'recovery':
      return [6, 0];
    case 'rest':
    case 'strength':
      return [7, 0];
    case 'race':
      return [3, 30];
    default:
      return [6, 0];
  }
}

function subtractMinutes(hours: number, minutes: number, subtractMin: number): [number, number] {
  let totalMin = hours * 60 + minutes - subtractMin;
  if (totalMin < 0) totalMin += 24 * 60;
  return [Math.floor(totalMin / 60), totalMin % 60];
}

function formatTime(hours: number, minutes: number): string {
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const displayMin = String(minutes).padStart(2, '0');
  return `${displayHour}:${displayMin} ${period}`;
}

function getWorkoutLabel(workout: TomorrowWorkout | null): string {
  if (!workout) return 'rest day';
  switch (workout.type) {
    case 'long': return 'long run';
    case 'intervals': return 'intervals';
    case 'tempo': return 'tempo run';
    case 'easy': return 'easy run';
    case 'recovery': return 'recovery run';
    case 'rest': return 'rest day';
    case 'race': return 'race day';
    case 'strength': return 'strength';
    default: return workout.type;
  }
}

export default function SleepRecommendation({ tomorrowWorkout, todayStr }: SleepRecommendationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    setVisible(hour >= 17);
  }, []);

  if (!visible) return null;

  const [wakeH, wakeM] = getWakeUpHourMin(tomorrowWorkout);
  const [bedH, bedM] = subtractMinutes(wakeH, wakeM, 450); // 7.5 hours = 450 min
  const [windH, windM] = subtractMinutes(bedH, bedM, 30);

  const label = getWorkoutLabel(tomorrowWorkout);

  return (
    <section className="mb-4">
      <div
        className="card"
        style={{
          padding: '14px 16px',
          borderLeft: '3px solid #6366F1',
          background: 'var(--bg-secondary)',
        }}
      >
        <div className="flex items-center gap-2 mb-2.5">
          <span className="text-base">🌙</span>
          <span
            className="text-xs font-semibold tracking-wide uppercase"
            style={{ color: '#6366F1', fontFamily: 'DM Sans, sans-serif' }}
          >
            Tonight&apos;s Wind Down
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline gap-2">
            <span
              className="text-sm font-bold"
              style={{ fontFamily: 'DM Mono, monospace', color: '#A78BFA', minWidth: 72 }}
            >
              {formatTime(windH, windM)}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              screens off, start winding down
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span
              className="text-sm font-bold"
              style={{ fontFamily: 'DM Mono, monospace', color: '#6366F1', minWidth: 72 }}
            >
              {formatTime(bedH, bedM)}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              lights out for 7.5 hours
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span
              className="text-sm font-bold"
              style={{ fontFamily: 'DM Mono, monospace', color: 'var(--text-primary)', minWidth: 72 }}
            >
              {formatTime(wakeH, wakeM)}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {label} tomorrow
            </span>
          </div>
        </div>

        {tomorrowWorkout && tomorrowWorkout.estimatedMinutes > 0 && (
          <div
            className="text-xs mt-2 pt-2"
            style={{ color: 'var(--text-tertiary)', borderTop: '1px solid var(--border-primary, rgba(255,255,255,0.06))' }}
          >
            ~{tomorrowWorkout.estimatedMinutes} min session planned
          </div>
        )}
      </div>
    </section>
  );
}
