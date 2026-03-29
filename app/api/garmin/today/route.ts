import { NextResponse } from 'next/server';
import { getWorkoutByDate, getPhaseForWeek, getDaysUntil } from '@/data/training-plan';

export async function GET() {
  const today = new Date().toISOString().split('T')[0];
  const workout = getWorkoutByDate(today);

  if (!workout) {
    return NextResponse.json({
      week: 0,
      phase: 'Off Season',
      type: 'REST',
      distance: '0 mi',
      summary: 'No workout scheduled today',
      houstonDays: getDaysUntil('2027-01-17'),
      grasslandsDays: getDaysUntil('2027-03-20'),
    });
  }

  const phase = getPhaseForWeek(workout.weekNumber);

  // Generate short summary (2-3 lines) for watch display
  const desc = workout.description;
  const shortSummary = desc.length > 120 ? desc.substring(0, 117) + '...' : desc;

  return NextResponse.json({
    week: workout.weekNumber,
    phase: phase?.name ?? 'Training',
    type: workout.type.toUpperCase(),
    distance: workout.miles > 0 ? `${workout.miles} mi` : 'Rest',
    summary: shortSummary,
    strength: workout.hasStrength ? 'Strength session included' : null,
    houstonDays: getDaysUntil('2027-01-17'),
    grasslandsDays: getDaysUntil('2027-03-20'),
  });
}
