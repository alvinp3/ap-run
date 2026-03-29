import { NextResponse } from 'next/server';

/**
 * GET /api/garmin/health
 * Returns today's Garmin health metrics (resting HR, sleep, training readiness, body battery).
 * Data is populated by the Railway worker (Garmin sync cron job).
 * Falls back to null values when no data is available.
 */
export async function GET() {
  // In production, this reads from Supabase garmin_daily_metrics table
  // populated by the Railway worker's cron job
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { createServerClient } = await import('@/lib/supabase');
      const supabase = createServerClient();
      const { data } = await supabase
        .from('garmin_daily_metrics')
        .select('*')
        .eq('date', today)
        .single();

      if (data) {
        return NextResponse.json({
          restingHR: data.resting_heart_rate,
          sleepScore: data.sleep_score,
          bodyBattery: data.body_battery_high,
          trainingReadiness: data.training_readiness,
          vo2max: data.vo2max,
          date: data.date,
        });
      }
    } catch {
      // Supabase not available
    }
  }

  return NextResponse.json({
    restingHR: null,
    sleepScore: null,
    bodyBattery: null,
    trainingReadiness: null,
    vo2max: null,
    date: new Date().toISOString().split('T')[0],
    stub: true,
  });
}
