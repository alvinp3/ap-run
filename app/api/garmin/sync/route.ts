import { NextResponse } from 'next/server';

/**
 * POST /api/garmin/sync
 * Pushes the next 7 days of structured workouts to Garmin Connect.
 * Requires GARMIN_EMAIL and GARMIN_PASSWORD env vars.
 * The actual garmin-connect package is used in the Railway worker;
 * this serverless route triggers it or handles quick pushes.
 */
export async function POST() {
  const email = process.env.GARMIN_EMAIL;
  const password = process.env.GARMIN_PASSWORD;

  if (!email || !password) {
    return NextResponse.json(
      {
        success: false,
        message: 'Garmin credentials not configured. Set GARMIN_EMAIL and GARMIN_PASSWORD environment variables.',
      },
      { status: 200 }
    );
  }

  // In production, this delegates to the Railway worker service
  // The Railway worker handles session management and rate limiting
  // For now, return a stub response
  return NextResponse.json({
    success: false,
    message: 'Garmin sync requires the Railway worker service. See documentation for setup.',
    stub: true,
  });
}
