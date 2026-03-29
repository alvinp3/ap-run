import { NextResponse } from 'next/server';
import { runGarminPull } from '@/lib/garmin-pull';

/**
 * POST /api/garmin/pull
 * Manual trigger for Garmin sync (also called by ProfileDrawer's Sync Now button).
 */
export async function POST() {
  try {
    const result = await runGarminPull();
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[garmin/pull]', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
