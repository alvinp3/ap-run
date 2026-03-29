import { NextRequest, NextResponse } from 'next/server';
import { generateWeeklySummary, getLastWeekStart } from '@/lib/generate-weekly-summary';

/**
 * GET /api/cron/weekly-summary
 * Called every Monday at 07:00 UTC (01:00 CST) by Vercel Cron.
 * Generates an AI performance summary for the week that just ended (Sun night).
 * Protected by CRON_SECRET that Vercel auto-injects.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('[cron/weekly-summary] Generating weekly summary');

  try {
    const weekStart = getLastWeekStart();
    const summary = await generateWeeklySummary(weekStart);

    if (!summary) {
      return NextResponse.json({ success: false, error: 'Missing environment variables' }, { status: 500 });
    }

    console.log(`[cron/weekly-summary] Done — Week ${summary.weekNumber} grade: ${summary.grade}`);
    return NextResponse.json({ success: true, weekNumber: summary.weekNumber, grade: summary.grade });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[cron/weekly-summary] Error:', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
