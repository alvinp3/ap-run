import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getGarminClient } from '@/lib/garmin';

/**
 * POST /api/garmin/pull
 * Pulls health metrics (resting HR, sleep) and the last 14 activities from
 * Garmin Connect and writes them to Supabase. Also auto-completes any
 * workout_log rows where a matching Garmin activity was found.
 */
export async function POST() {
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const results = {
    healthSaved: false,
    activitiesImported: 0,
    workoutsAutoCompleted: 0,
    errors: [] as string[],
  };

  try {
    const gc = await getGarminClient();
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // ── Health metrics ────────────────────────────────────────
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
      results.healthSaved = true;
    } catch (e) {
      results.errors.push(`Health: ${e instanceof Error ? e.message : String(e)}`);
    }

    // ── Activities ────────────────────────────────────────────
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const activities: any[] = (await gc.getActivities(0, 14)) ?? [];

      for (const act of activities) {
        const distanceMiles =
          act.distance != null ? Math.round((act.distance / 1609.34) * 100) / 100 : 0;

        // Garmin returns startTimeLocal as "YYYY-MM-DD HH:mm:ss"
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
          results.errors.push(`Activity ${act.activityId}: ${upsertErr.message}`);
          continue;
        }

        results.activitiesImported++;

        // Auto-complete the matching workout log row
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
            results.workoutsAutoCompleted++;
          }
        }
      }
    } catch (e) {
      results.errors.push(`Activities: ${e instanceof Error ? e.message : String(e)}`);
    }

    // Update last sync timestamp
    await db.from('user_settings').upsert({
      id: '00000000-0000-0000-0000-000000000001',
      garmin_last_sync: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, ...results });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[garmin/pull]', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
