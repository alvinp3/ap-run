import { NextResponse } from 'next/server';
import { getGarminClient } from '@/lib/garmin';

/**
 * POST /api/garmin/connect
 * Authenticates with Garmin Connect, saves OAuth tokens to Supabase.
 * Safe to call repeatedly — restores existing session if valid.
 */
export async function POST() {
  try {
    const gc = await getGarminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profile = await gc.getUserProfile() as any;

    return NextResponse.json({
      success: true,
      displayName: profile?.displayName ?? profile?.fullName ?? 'Garmin User',
      connected: true,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[garmin/connect]', msg);
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
