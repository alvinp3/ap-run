import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateWeeklySummary, getCurrentWeekStart, getLastWeekStart } from '@/lib/generate-weekly-summary';

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * GET /api/weekly-summary
 * Query params:
 *   ?week=YYYY-MM-DD  — fetch a specific week's summary
 *   ?limit=N          — fetch the N most recent summaries (default 10)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const weekParam = searchParams.get('week');

  try {
    if (weekParam) {
      const { data, error } = await db()
        .from('weekly_summaries')
        .select('*')
        .eq('week_start', weekParam)
        .maybeSingle();

      if (error) throw error;
      return NextResponse.json(data ?? null);
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10', 10), 52);
    const { data, error } = await db()
      .from('weekly_summaries')
      .select('week_start, week_number, phase_name, grade, planned_miles, actual_miles, completion_rate, workouts_completed, workouts_planned, created_at')
      .order('week_start', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

/**
 * POST /api/weekly-summary
 * Body: { week?: 'YYYY-MM-DD' } — defaults to current or last week.
 * Generates (or regenerates) an AI summary and stores it.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    let weekStart: Date;

    if (body.week) {
      weekStart = new Date(body.week + 'T00:00:00');
    } else {
      // If today is Monday, generate last week's; otherwise current week
      const now = new Date();
      weekStart = now.getDay() === 1 ? getLastWeekStart() : getCurrentWeekStart();
    }

    const summary = await generateWeeklySummary(weekStart);
    if (!summary) {
      return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
    }

    // Map camelCase to snake_case to match WeeklySummaryRow interface in the UI
    return NextResponse.json({
      week_start: summary.weekStart,
      week_number: summary.weekNumber,
      phase_name: summary.phaseName,
      grade: summary.grade,
      planned_miles: summary.plannedMiles,
      actual_miles: summary.actualMiles,
      completion_rate: summary.completionRate,
      workouts_completed: summary.workoutsCompleted,
      workouts_planned: summary.workoutsPlanned,
      summary_text: summary.summaryText,
      created_at: summary.createdAt,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
