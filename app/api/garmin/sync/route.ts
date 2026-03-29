import { NextResponse } from 'next/server';
import { getGarminClient, pushAndScheduleWorkout } from '@/lib/garmin';
import { allWeeks } from '@/data/training-plan';

/**
 * POST /api/garmin/sync
 * Pushes the next 7 days of planned running workouts to Garmin Connect
 * and attempts to schedule each one on its target date.
 * Rest days and strength-only days are skipped.
 */
export async function POST() {
  try {
    const gc = await getGarminClient();

    const pushed: { date: string; name: string; workoutId: number; scheduled: boolean }[] = [];
    const skipped: string[] = [];
    const errors: { date: string; error: string }[] = [];

    for (let offset = 0; offset < 7; offset++) {
      const d = new Date();
      d.setDate(d.getDate() + offset);
      const dateStr = d.toISOString().split('T')[0];

      // Find workout in the training plan
      let workout: ({ weekNum: number } & typeof allWeeks[0]['days'][0]) | null = null;
      for (const week of allWeeks) {
        const found = week.days.find((day) => day.date === dateStr);
        if (found) { workout = { ...found, weekNum: week.week }; break; }
      }

      if (!workout || workout.type === 'rest' || workout.miles === 0) {
        skipped.push(dateStr);
        continue;
      }

      const typeLabel = workout.type.charAt(0).toUpperCase() + workout.type.slice(1);
      const name = `Wk${workout.weekNum} ${typeLabel} ${workout.miles}mi`;

      try {
        const result = await pushAndScheduleWorkout(
          gc,
          name,
          workout.miles,
          workout.description.substring(0, 999),
          dateStr
        );
        pushed.push({ date: dateStr, name, ...result });
      } catch (e) {
        errors.push({ date: dateStr, error: e instanceof Error ? e.message : String(e) });
      }
    }

    return NextResponse.json({
      success: true,
      pushed: pushed.length,
      skipped: skipped.length,
      errors: errors.length,
      detail: { pushed, skipped, errors },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[garmin/sync]', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
