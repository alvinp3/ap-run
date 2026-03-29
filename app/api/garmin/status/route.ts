import { NextResponse } from 'next/server';

/**
 * GET /api/garmin/status
 *
 * Three-tier check:
 * 1. Credentials missing (GARMIN_EMAIL / GARMIN_PASSWORD not in env) → not configured
 * 2. Credentials present but never authenticated (user_settings.garmin_connected != true) → not connected
 * 3. Authenticated → connected, return activity stats
 */
export async function GET() {
  const garminEmail    = process.env.GARMIN_EMAIL;
  const garminPassword = process.env.GARMIN_PASSWORD;
  const supabaseUrl    = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey    = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Tier 1 — credentials not configured at all
  if (!garminEmail || !garminPassword) {
    return NextResponse.json({
      connected: false,
      lastSync: null,
      activitiesImported: 0,
      latestActivity: null,
      message: 'GARMIN_EMAIL / GARMIN_PASSWORD not set in environment variables',
    });
  }

  // Tier 2 — credentials exist but no Supabase (dev/local without DB)
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({
      connected: false,
      lastSync: null,
      activitiesImported: 0,
      latestActivity: null,
      message: 'Supabase not configured — run Step 1 to authenticate',
    });
  }

  // Tier 3 — check actual connection state from Supabase
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Primary connection indicator: garmin_connected flag set by saveTokens()
    const { data: settings } = await supabase
      .from('user_settings')
      .select('garmin_connected, garmin_last_sync')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .single();

    const isConnected = settings?.garmin_connected === true;

    if (!isConnected) {
      return NextResponse.json({
        connected: false,
        lastSync: null,
        activitiesImported: 0,
        latestActivity: null,
        message: 'Not authenticated — click "Connect to Garmin" (Step 1) to log in',
      });
    }

    // Connected — fetch activity stats
    const [activitiesRes, countRes] = await Promise.all([
      supabase
        .from('garmin_activities')
        .select('activity_date, activity_type, distance_miles')
        .order('activity_date', { ascending: false })
        .limit(1),
      supabase
        .from('garmin_activities')
        .select('*', { count: 'exact', head: true }),
    ]);

    const latestActivity = activitiesRes.data?.[0];
    const distanceMi = latestActivity?.distance_miles
      ? Number(latestActivity.distance_miles).toFixed(1)
      : null;

    return NextResponse.json({
      connected: true,
      lastSync: settings.garmin_last_sync ?? null,
      activitiesImported: countRes.count ?? 0,
      latestActivity: distanceMi
        ? `${distanceMi}mi ${latestActivity?.activity_type ?? 'Run'}`
        : null,
    });
  } catch (err) {
    console.error('[garmin/status]', err);
    return NextResponse.json({
      connected: false,
      lastSync: null,
      activitiesImported: 0,
      latestActivity: null,
      message: 'Error checking status — see server logs',
    });
  }
}
