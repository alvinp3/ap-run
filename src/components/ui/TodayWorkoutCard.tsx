'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { WorkoutDay, WorkoutLog } from '@/types';
import WorkoutBadge from './WorkoutBadge';
import PhaseBadge from './PhaseBadge';
import WorkoutSteps from './WorkoutSteps';
import { formatDate, formatDuration, formatMiles, isHeatSeason, getWorkoutColor } from '@/utils/workout';

interface TodayWorkoutCardProps {
  workout: WorkoutDay & { weekNumber: number; isDownWeek: boolean };
  phase: number;
  phaseName: string;
  totalWeeks: number;
  log?: WorkoutLog | null;
  onComplete?: (notes?: string) => Promise<void>;
  onSkip?: () => Promise<void>;
  onOverride?: () => void;
  heatAdjusted?: boolean;
  hasOverride?: boolean;
}

export default function TodayWorkoutCard({
  workout,
  phase,
  phaseName,
  totalWeeks,
  log,
  onComplete,
  onSkip,
  onOverride,
  heatAdjusted = false,
  hasOverride = false,
}: TodayWorkoutCardProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(log?.completed ?? false);
  const [showSuccessAnim, setShowSuccessAnim] = useState(false);

  const isRest = workout.type === 'rest';
  const workoutColor = getWorkoutColor(workout.type);
  const isHeat = isHeatSeason(workout.date);

  async function handleComplete() {
    if (completing) return;
    setCompleting(true);
    try {
      await onComplete?.(notes || undefined);
      setCompleted(true);
      setShowSuccessAnim(true);
      setShowNotes(false);
      setTimeout(() => setShowSuccessAnim(false), 2000);
    } finally {
      setCompleting(false);
    }
  }

  async function handleSkip() {
    await onSkip?.();
  }

  return (
    <div
      className="card relative overflow-hidden"
      style={{
        borderColor: completed ? `${workoutColor}44` : 'var(--border-subtle)',
        boxShadow: completed ? `0 0 24px ${workoutColor}15` : undefined,
      }}
    >
      {/* Colored left border accent */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ background: workoutColor }}
      />

      <div className="pl-3">
        {/* Header row */}
        <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <PhaseBadge phase={phase} name={phaseName} />
            {workout.isDownWeek && (
              <span
                className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: 'rgba(139,92,246,0.15)', color: '#8B5CF6' }}
              >
                DOWN WEEK
              </span>
            )}
          </div>
          <div
            className="text-xs"
            style={{ color: 'var(--text-tertiary)', fontFamily: 'DM Sans, sans-serif' }}
          >
            Week {workout.weekNumber} of {totalWeeks}
          </div>
        </div>

        {/* Date */}
        <div
          className="text-sm mb-2"
          style={{ color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif' }}
        >
          {formatDate(workout.date)}
        </div>

        {/* Type badge + distance */}
        <div className="flex items-center gap-3 mb-4">
          <WorkoutBadge type={workout.type} size="lg" />
          {workout.miles > 0 && (
            <span
              className="text-2xl font-bold"
              style={{ fontFamily: 'DM Mono, monospace', color: 'var(--text-primary)' }}
            >
              {formatMiles(workout.miles)}
              <span
                className="text-sm font-normal ml-1"
                style={{ color: 'var(--text-secondary)' }}
              >
                mi
              </span>
            </span>
          )}
          {workout.estimatedMinutes && workout.estimatedMinutes > 0 && (
            <span
              className="text-sm"
              style={{ color: 'var(--text-tertiary)', fontFamily: 'DM Mono, monospace' }}
            >
              ~{formatDuration(workout.estimatedMinutes)}
            </span>
          )}
        </div>

        {/* Override indicator */}
        {hasOverride && (
          <div
            className="rounded-lg px-3 py-2 mb-3 flex items-center gap-2"
            style={{ background: 'rgba(179,136,255,0.1)', border: '1px solid rgba(179,136,255,0.25)' }}
          >
            <span className="text-xs font-medium" style={{ color: '#B388FF' }}>
              Modified — this workout has been overridden
            </span>
          </div>
        )}

        {/* Heat advisory for workout */}
        {heatAdjusted && isHeat && workout.type !== 'rest' && (
          <div
            className="rounded-lg px-3 py-2 mb-3 flex items-center gap-2"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)' }}
          >
            <span className="text-sm">☀️</span>
            <span className="text-xs font-medium" style={{ color: '#F59E0B' }}>
              Heat season — train by effort and HR, not pace. Add 25-40 sec/mile to all targets.
            </span>
          </div>
        )}

        {/* Workout steps */}
        <div className="mb-4">
          <WorkoutSteps description={workout.description} type={workout.type} maxBlocks={4} phase={phase} />
        </div>

        {/* Heat-adjusted paces (shown if heat season + phase 2/3) */}
        {heatAdjusted && isHeat && workout.type !== 'rest' && workout.type !== 'strength' && (
          <div
            className="rounded-lg p-3 mb-4"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}
          >
            <div
              className="text-xs font-semibold mb-2"
              style={{ color: '#F59E0B', fontFamily: 'DM Sans, sans-serif' }}
            >
              Heat-Adjusted Paces
            </div>
            <div
              className="text-xs grid grid-cols-2 gap-x-4 gap-y-1"
              style={{ fontFamily: 'DM Mono, monospace', color: 'var(--text-secondary)' }}
            >
              <span>Easy:</span>      <span style={{ color: '#F59E0B' }}>8:15-9:00/mi</span>
              <span>Tempo:</span>     <span style={{ color: '#F59E0B' }}>6:25-6:45/mi</span>
              <span>Marathon:</span>  <span style={{ color: '#F59E0B' }}>6:45-7:10/mi</span>
              <span>Intervals:</span> <span style={{ color: '#F59E0B' }}>6:00-6:25/mi</span>
            </div>
          </div>
        )}

        {/* Completion status */}
        {completed && (
          <div
            className="rounded-xl px-4 py-3 mb-4 flex items-center gap-3"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}
          >
            <span
              className="text-xl"
              style={{
                display: 'inline-block',
                animation: showSuccessAnim ? 'checkmark 0.4s ease forwards' : undefined,
              }}
            >
              ✅
            </span>
            <div>
              <div className="text-sm font-semibold" style={{ color: '#22C55E' }}>
                Workout Complete!
              </div>
              {log?.notes && (
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  {log.notes}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes textarea */}
        {showNotes && !completed && (
          <div className="mb-3">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did it go? Optional notes..."
              rows={3}
              className="resize-none"
              style={{ fontSize: '14px' }}
            />
          </div>
        )}

        {/* Action row */}
        {!completed && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              className="btn-teal flex-1 min-w-[120px] flex items-center justify-center gap-2"
              onClick={showNotes ? handleComplete : () => setShowNotes(true)}
              disabled={completing}
            >
              {completing ? (
                <span className="animate-spin">⟳</span>
              ) : showNotes ? (
                <>✅ Save & Complete</>
              ) : isRest ? (
                <>✅ Rest Day Done</>
              ) : (
                <>✅ Complete</>
              )}
            </button>
            {showNotes && (
              <button
                className="btn-secondary"
                onClick={handleComplete}
                style={{ minWidth: 80 }}
              >
                Skip notes
              </button>
            )}
            {!showNotes && (
              <>
                {onOverride && (
                  <button
                    className="btn-secondary"
                    onClick={onOverride}
                    style={{ fontSize: 13, padding: '10px 14px', minWidth: 'unset', minHeight: 44, color: '#B388FF' }}
                  >
                    Override
                  </button>
                )}
                <Link
                  href={`/workout/${workout.date}`}
                  className="btn-secondary"
                  style={{ fontSize: 13, padding: '10px 14px', minWidth: 'unset', minHeight: 44 }}
                >
                  Details
                </Link>
                <button
                  className="btn-secondary"
                  onClick={handleSkip}
                  style={{ fontSize: 13, padding: '10px 14px', minWidth: 'unset', minHeight: 44, color: 'var(--text-tertiary)' }}
                >
                  Skip
                </button>
              </>
            )}
          </div>
        )}

        {completed && (
          <div className="flex items-center gap-2">
            <Link
              href={`/workout/${workout.date}`}
              className="btn-secondary flex-1 text-center"
              style={{ fontSize: 13 }}
            >
              View Details
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
