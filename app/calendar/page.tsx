'use client';

import { useState } from 'react';
import Link from 'next/link';
import AppHeader from '@/components/layout/AppHeader';
import AppNav from '@/components/layout/AppNav';
import CoachFAB from '@/components/coach/CoachFAB';
import WorkoutBadge from '@/components/ui/WorkoutBadge';
import { trainingPhases, allWeeks, getCurrentWeek } from '@/data/training-plan';
import { formatMiles, isToday } from '@/utils/workout';

const RACE_DATES = ['2026-05-30', '2026-08-01', '2026-10-18', '2026-12-26', '2027-01-17', '2027-03-20'];

export default function CalendarPage() {
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const currentWeek = getCurrentWeek(new Date());
  const currentWeekNum = currentWeek?.week ?? -1;

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <AppHeader title="Training Calendar" />

      <main className="flex-1 overflow-y-auto px-4 pb-32 pt-4 max-w-lg mx-auto w-full">
        <div className="mb-4">
          <h1
            className="text-2xl font-black"
            style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}
          >
            51-Week Plan
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: 'var(--text-secondary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            March 30, 2026 → March 21, 2027
          </p>
        </div>

        {trainingPhases.map((phase) => (
          <div key={phase.phase} className="mb-6">
            {/* Phase header */}
            <div
              className="flex items-center gap-3 mb-3 px-1"
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ background: phase.color }}
              />
              <div>
                <div
                  className="text-sm font-bold"
                  style={{ fontFamily: 'Outfit, sans-serif', color: phase.color }}
                >
                  Phase {phase.phase}: {phase.name}
                </div>
                <div
                  className="text-xs"
                  style={{ color: 'var(--text-tertiary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                >
                  Weeks {phase.startWeek}–{phase.endWeek} · {phase.startDate} to {phase.endDate}
                </div>
              </div>
            </div>

            {/* Week rows */}
            <div className="space-y-1.5">
              {phase.weeks.map((week) => {
                const isCurrentWeek = week.week === currentWeekNum;
                const isExpanded = expandedWeek === week.week;
                const hasRace = week.days.some((d) => RACE_DATES.includes(d.date));

                return (
                  <div key={week.week}>
                    {/* Week row */}
                    <div
                      className="card cursor-pointer select-none"
                      style={{
                        padding: '10px 14px',
                        borderColor: isCurrentWeek ? `${phase.color}55` : 'var(--border-subtle)',
                        boxShadow: isCurrentWeek ? `0 0 12px ${phase.color}15` : undefined,
                      }}
                      onClick={() => setExpandedWeek(isExpanded ? null : week.week)}
                    >
                      <div className="flex items-center gap-2">
                        {/* Week number */}
                        <span
                          className="text-xs font-bold w-16 flex-shrink-0"
                          style={{
                            fontFamily: 'JetBrains Mono, monospace',
                            color: isCurrentWeek ? phase.color : 'var(--text-tertiary)',
                          }}
                        >
                          Wk {week.week}
                        </span>

                        {/* Date range */}
                        <span
                          className="text-xs flex-shrink-0 hidden sm:inline"
                          style={{ color: 'var(--text-tertiary)', fontFamily: 'JetBrains Mono, monospace' }}
                        >
                          {new Date(week.startDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>

                        {/* Badges */}
                        <div className="flex items-center gap-1.5 flex-1">
                          {isCurrentWeek && (
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded-full font-bold animate-pulse"
                              style={{ background: `${phase.color}25`, color: phase.color }}
                            >
                              YOU ARE HERE
                            </span>
                          )}
                          {week.isDownWeek && (
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                              style={{ background: 'rgba(168,85,247,0.12)', color: '#A855F7' }}
                            >
                              DOWN
                            </span>
                          )}
                          {hasRace && (
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                              style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444' }}
                            >
                              🏁 RACE
                            </span>
                          )}
                        </div>

                        {/* Mileage */}
                        <span
                          className="text-sm font-bold flex-shrink-0"
                          style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)' }}
                        >
                          {formatMiles(week.totalMiles)} mi
                        </span>

                        {/* Expand chevron */}
                        <span
                          className="text-xs flex-shrink-0 transition-transform"
                          style={{
                            color: 'var(--text-tertiary)',
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          }}
                        >
                          ▼
                        </span>
                      </div>
                    </div>

                    {/* Expanded day view */}
                    {isExpanded && (
                      <div
                        className="ml-3 mt-1 space-y-1"
                        style={{ borderLeft: `2px solid ${phase.color}33`, paddingLeft: 12 }}
                      >
                        {week.days.map((day) => {
                          const isCurrentDay = isToday(day.date);
                          return (
                            <Link
                              key={day.date}
                              href={`/workout/${day.date}`}
                              className="flex items-center gap-2 py-1.5 px-2 rounded-lg min-h-0"
                              style={{
                                background: isCurrentDay ? `${phase.color}10` : undefined,
                                textDecoration: 'none',
                              }}
                            >
                              <span
                                className="text-xs w-8 flex-shrink-0"
                                style={{ color: 'var(--text-tertiary)', fontFamily: 'JetBrains Mono, monospace' }}
                              >
                                {day.day.slice(0, 2)}
                              </span>
                              <WorkoutBadge type={day.type} size="sm" />
                              <span
                                className="text-xs flex-1 truncate"
                                style={{ color: 'var(--text-secondary)' }}
                              >
                                {day.description.substring(0, 50)}…
                              </span>
                              {day.miles > 0 && (
                                <span
                                  className="text-xs flex-shrink-0"
                                  style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-tertiary)' }}
                                >
                                  {day.miles}mi
                                </span>
                              )}
                              {RACE_DATES.includes(day.date) && (
                                <span className="text-xs">🏁</span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </main>

      <AppNav />
      <CoachFAB />
    </div>
  );
}
