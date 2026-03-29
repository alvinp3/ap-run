import { NextResponse } from 'next/server';

/**
 * GET /api/garmin/status
 * Returns the current Garmin sync connection status.
 * In production, queries Supabase for the latest garmin_activities record.
 * Returns a stub when Supabase or Garmin credentials are not configured.
 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const garminEmail = process.env.GARMIN_EMAIL;

  // If no Garmin credentials configured, return disconnected status
  if (!garminEmail) {
    return NextResponse.json({
      connected: false,
      lastSync: null,
      activitiesImported: 0,
      latestActivity: null,
      message: 'Garmin credentials not configured',
    });
  }

  // If Supabase is not configured, return connected stub (credentials exist)
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({
      connected: true,
      lastSync: null,
      activitiesImported: 0,
      latestActivity: null,
      message: 'Supabase not configured — activity data unavailable',
    });
  }

  // Query Supabase for latest activity data
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: activities, error } = await supabase
      .from('garmin_activities')
      .select('activity_date, activity_type, distance_miles')
      .order('activity_date', { ascending: false })
      .limit(1);

    if (error) throw error;

    const { data: settings } = await supabase
      .from('user_settings')
      .select('garmin_last_sync')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .single();

    const latestActivity = activities?.[0];
    const latestSync = settings?.garmin_last_sync ?? null;
    const distanceMi = latestActivity?.distance_miles
      ? Number(latestActivity.distance_miles).toFixed(1)
      : null;

    // Count total imported activities
    const { count } = await supabase
      .from('garmin_activities')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      connected: true,
      lastSync: latestSync,
      activitiesImported: count ?? 0,
      latestActivity: distanceMi ? `${distanceMi}mi ${latestActivity?.activity_type ?? 'Run'}` : null,
    });
  } catch (err) {
    console.error('[garmin/status] Supabase error:', err);
    return NextResponse.json({
      connected: !!garminEmail,
      lastSync: null,
      activitiesImported: 0,
      latestActivity: null,
      error: 'Failed to fetch activity data',
    });
  }
}
