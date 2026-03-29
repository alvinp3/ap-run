import { NextRequest, NextResponse } from 'next/server';
import { getWorkoutByDate, allWeeks, getPhaseForWeek } from '@/data/training-plan';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const week = searchParams.get('week');

  if (date) {
    const workout = getWorkoutByDate(date);
    if (!workout) {
      return NextResponse.json({ error: 'No workout for this date' }, { status: 404 });
    }
    const phase = getPhaseForWeek(workout.weekNumber);
    return NextResponse.json({ ...workout, phase: phase?.phase, phaseName: phase?.name });
  }

  if (week) {
    const weekNum = parseInt(week);
    const weekData = allWeeks.find((w) => w.week === weekNum);
    if (!weekData) {
      return NextResponse.json({ error: 'Week not found' }, { status: 404 });
    }
    const phase = getPhaseForWeek(weekNum);
    return NextResponse.json({ ...weekData, phase: phase?.phase, phaseName: phase?.name });
  }

  // Return all weeks summary
  const summary = allWeeks.map((w) => ({
    week: w.week,
    startDate: w.startDate,
    totalMiles: w.totalMiles,
    isDownWeek: w.isDownWeek,
    phase: getPhaseForWeek(w.week)?.phase,
    phaseName: getPhaseForWeek(w.week)?.name,
  }));

  return NextResponse.json(summary);
}
