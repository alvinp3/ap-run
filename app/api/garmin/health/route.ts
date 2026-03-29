import { NextResponse } from 'next/server';

/**
 * GET /api/garmin/health
 * Returns the most recent Garmin health metrics from garmin_daily_metrics.
 * Falls back up to 7 days if today has no data (e.g. sync ran yesterday).
 */
export async function GET() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const { createServerClient } = await import('@/lib/supabase');
      const supabase = createServerClient();

      const today = new Date().toISOString().split('T')[0];
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

      // Get most recent entry within the last 7 days
      const { data } = await supabase
        .from('garmin_daily_metrics')
        .select('*')
        .gte('date', sevenDaysAgoStr)
        .lte('date', today)
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        return NextResponse.json({
          restingHR: data.resting_heart_rate ?? null,
          sleepHours: data.sleep_duration_hours ?? null,
          bodyBattery: data.body_battery_high ?? null,
          trainingReadiness: data.training_readiness ?? null,
          vo2max: data.vo2max ?? null,
          lastUpdated: data.date,
        });
      }
    } catch {
      // Supabase unavailable
    }
  }

  return NextResponse.json({
    restingHR: null,
    sleepHours: null,
    bodyBattery: null,
    trainingReadiness: null,
    vo2max: null,
    lastUpdated: null,
  });
}
