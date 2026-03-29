import { createClient } from '@supabase/supabase-js';
import { getGarminClient } from './garmin';

export interface PullResult {
  healthSaved: boolean;
  activitiesImported: number;
  workoutsAutoCompleted: number;
  errors: string[];
}

export async function runGarminPull(): Promise<PullResult> {
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const result: PullResult = {
    healthSaved: false,
    activitiesImported: 0,
    workoutsAutoCompleted: 0,
    errors: [],
  };

  const gc = await getGarminClient();
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // ── Health metrics ──────────────────────────────────────────────────
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [hrData, sleepData] = await Promise.all([
      gc.getHeartRate(today) as Promise<any>,
      gc.getSleepData(today) as Promise<any>,
    ]);

    const restingHR: number | null = hrData?.restingHeartRate ?? null;
    const sleepSeconds: number | null =
      sleepData?.dailySleepDTO?.sleepTimeSeconds ?? null;
    const sleepHours = sleepSeconds != null
      ? Math.round(sleepSeconds / 360) / 10
      : null;

    await db.from('garmin_daily_metrics').upsert(
      {
        date: todayStr,
        resting_heart_rate: restingHR,
        sleep_duration_hours: sleepHours,
        imported_at: new Date().toISOString(),
      },
      { onConflict: 'date' }
    );
    result.healthSaved = true;
  } catch (e) {
    result.errors.push(`Health: ${e instanceof Error ? e.message : String(e)}`);
  }

  // ── Activities ──────────────────────────────────────────────────────
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allActivities: any[] = [];
    let start = 0;
    const batchSize = 100;

    while (true) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const batch = await gc.getActivities(start, batchSize) as any[];
      if (!batch || batch.length === 0) break;
      allActivities.push(...batch);
      if (batch.length < batchSize) break;
      start += batchSize;
      await new Promise(r => setTimeout(r, 500));
    }

    for (const act of allActivities) {
      const distanceMiles =
        act.distance != null ? Math.round((act.distance / 1609.34) * 100) / 100 : 0;

      const actDate: string | null =
        act.startTimeLocal?.split(' ')[0] ??
        act.startTimeGMT?.split(' ')[0] ??
        null;

      const { error: upsertErr } = await db
        .from('garmin_activities')
        .upsert(
          {
            id: act.activityId,
            activity_date: actDate,
            activity_type: act.activityType?.typeKey ?? 'running',
            distance_miles: distanceMiles,
            duration_seconds: act.duration != null ? Math.round(act.duration) : null,
            avg_heart_rate: act.averageHR ?? null,
            max_heart_rate: act.maxHR ?? null,
            calories: act.calories ?? null,
            activity_name: act.activityName ?? null,
            raw_data: act,
            imported_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );

      if (upsertErr) {
        result.errors.push(`Activity ${act.activityId}: ${upsertErr.message}`);
        continue;
      }

      result.activitiesImported++;

      // Auto-complete matching workout log
      if (actDate) {
        const { data: planned } = await db
          .from('workouts')
          .select('date')
          .eq('date', actDate)
          .single();

        if (planned) {
          await db.from('workout_logs').upsert(
            {
              workout_date: actDate,
              completed: true,
              actual_miles: distanceMiles,
              actual_duration_min: act.duration != null ? Math.round(act.duration / 60) : null,
              avg_heart_rate: act.averageHR ?? null,
              garmin_activity_id: act.activityId,
              completed_at: act.startTimeLocal
                ? new Date(act.startTimeLocal.replace(' ', 'T')).toISOString()
                : null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'workout_date' }
          );
          result.workoutsAutoCompleted++;
        }
      }
    }
  } catch (e) {
    result.errors.push(`Activities: ${e instanceof Error ? e.message : String(e)}`);
  }

  // Update last sync timestamp
  await db.from('user_settings').upsert({
    id: '00000000-0000-0000-0000-000000000001',
    garmin_last_sync: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  return result;
}
