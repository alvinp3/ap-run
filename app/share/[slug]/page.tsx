import { getTodayWorkout, getCurrentWeek, getPhaseForWeek, allWeeks, getDaysUntil } from '@/data/training-plan';
import WorkoutBadge from '@/components/ui/WorkoutBadge';
import PhaseBadge from '@/components/ui/PhaseBadge';
import { formatDate, formatMiles, getWorkoutColor } from '@/utils/workout';

export const dynamic = 'force-dynamic';

export default function SharePage() {
  const today = new Date();
  const todayWorkout = getTodayWorkout(today);
  const currentWeek = getCurrentWeek(today);
  const phase = currentWeek ? getPhaseForWeek(currentWeek.week) : null;

  const completedWeeks = allWeeks.filter((w) => {
    const weekEnd = new Date(w.startDate);
    weekEnd.setDate(weekEnd.getDate() + 6);
    return weekEnd < today;
  }).length;

  const houstonDays = getDaysUntil('2027-01-17');
  const grasslandsDays = getDaysUntil('2027-03-20');

  const workoutColor = todayWorkout ? getWorkoutColor(todayWorkout.type) : '#8B5CF6';

  return (
    <div
      className="min-h-dvh"
      style={{ background: 'var(--bg-primary)', fontFamily: 'DM Sans, sans-serif' }}
    >
      {/* Header */}
      <div
        className="px-4 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">🏃</span>
          <span
            className="font-black text-lg"
            style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#8B5CF6' }}
          >
            BQ Training
          </span>
        </div>
        <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          Public View · Read Only
        </div>
      </div>

      <main className="px-4 pb-8 pt-4 max-w-lg mx-auto">
        {/* Intro */}
        <div className="mb-4">
          <h1
            className="text-2xl font-black"
            style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
          >
            Training for Houston + Grasslands 100
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            51 weeks · Sub-2:50 marathon + Sub-24hr 100-miler
          </p>
        </div>

        {/* Race countdowns */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { name: '🏆 Houston Marathon', date: '2027-01-17', days: houstonDays, color: '#8B5CF6', goal: 'Sub-2:50' },
            { name: '🌟 Grasslands 100', date: '2027-03-20', days: grasslandsDays, color: '#06B6D4', goal: 'Sub-24hr' },
          ].map(({ name, days, color, goal }) => (
            <div key={name} className="card text-center" style={{ padding: '14px' }}>
              <div className="text-2xl font-black" style={{ fontFamily: 'DM Mono, monospace', color }}>
                {days > 0 ? days : '✓'}
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                {days > 0 ? 'days' : 'done'}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>{name}</div>
              <div className="text-xs font-semibold" style={{ color }}>{goal}</div>
            </div>
          ))}
        </div>

        {/* Today's workout */}
        {todayWorkout && phase && (
          <div
            className="card mb-4"
            style={{ borderColor: `${workoutColor}44`, position: 'relative', overflow: 'hidden' }}
          >
            <div
              className="absolute left-0 top-0 bottom-0 w-1"
              style={{ background: workoutColor }}
            />
            <div className="pl-3">
              <div className="flex items-center gap-2 mb-2">
                <PhaseBadge phase={phase.phase} name={phase.name} size="sm" />
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  Week {todayWorkout.weekNumber} of 51
                </span>
              </div>
              <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                {formatDate(todayWorkout.date)}
              </div>
              <div className="flex items-center gap-3 mb-2">
                <WorkoutBadge type={todayWorkout.type} size="md" />
                {todayWorkout.miles > 0 && (
                  <span
                    className="text-xl font-bold"
                    style={{ fontFamily: 'DM Mono, monospace' }}
                  >
                    {formatMiles(todayWorkout.miles)}mi
                  </span>
                )}
              </div>
              <div className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {todayWorkout.description}
              </div>
            </div>
          </div>
        )}

        {/* Training stats */}
        <div className="card mb-4">
          <div className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            Training Progress
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div
                className="text-2xl font-black"
                style={{ fontFamily: 'DM Mono, monospace', color: '#8B5CF6' }}
              >
                {completedWeeks}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>weeks done</div>
            </div>
            <div>
              <div
                className="text-2xl font-black"
                style={{ fontFamily: 'DM Mono, monospace', color: '#F59E0B' }}
              >
                {Math.round((completedWeeks / 51) * 100)}%
              </div>
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>complete</div>
            </div>
            <div>
              <div
                className="text-2xl font-black"
                style={{ fontFamily: 'DM Mono, monospace', color: '#8B5CF6' }}
              >
                {currentWeek?.week ?? '—'}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>current week</div>
            </div>
          </div>
        </div>

        {/* This week's schedule */}
        {currentWeek && (
          <div className="card mb-4">
            <div className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
              This Week&apos;s Schedule
            </div>
            <div className="space-y-2">
              {currentWeek.days.map((day) => (
                <div key={day.date} className="flex items-center gap-2">
                  <span
                    className="text-xs w-8"
                    style={{ color: 'var(--text-tertiary)', fontFamily: 'DM Mono, monospace' }}
                  >
                    {day.day.slice(0, 2)}
                  </span>
                  <WorkoutBadge type={day.type} size="sm" />
                  <span className="text-xs flex-1 truncate" style={{ color: 'var(--text-secondary)' }}>
                    {day.description.substring(0, 55)}…
                  </span>
                  {day.miles > 0 && (
                    <span
                      className="text-xs flex-shrink-0"
                      style={{ fontFamily: 'DM Mono, monospace', color: 'var(--text-tertiary)' }}
                    >
                      {day.miles}mi
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs py-4" style={{ color: 'var(--text-tertiary)' }}>
          Live training data · Updated daily<br />
          <span style={{ color: '#8B5CF6' }}>BQ Training App</span>
        </div>
      </main>
    </div>
  );
}
