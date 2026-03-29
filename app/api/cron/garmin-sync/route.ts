import { NextRequest, NextResponse } from 'next/server';
import { runGarminPull } from '@/lib/garmin-pull';

/**
 * GET /api/cron/garmin-sync
 * Called nightly at midnight CST (06:00 UTC) by Vercel Cron.
 * Protected by CRON_SECRET that Vercel auto-injects.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('[cron/garmin-sync] Starting nightly Garmin sync');

  try {
    const result = await runGarminPull();
    console.log('[cron/garmin-sync] Done', result);
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[cron/garmin-sync] Error:', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
