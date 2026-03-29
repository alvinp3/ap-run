import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/garmin/profile
 * Reads all garmin_activities and garmin_daily_metrics from Supabase and
 * computes a rich athlete profile object.
 */
export async function GET() {
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // ── Fetch all activities ──────────────────────────────────
    const { data: activities, error: actErr } = await db
      .from('garmin_activities')
      .select('*')
      .order('activity_date', { ascending: true });

    if (actErr) throw actErr;

    // ── Fetch daily metrics ───────────────────────────────────
    const { data: dailyMetrics, error: dmErr } = await db
      .from('garmin_daily_metrics')
      .select('date, resting_heart_rate')
      .order('date', { ascending: true });

    if (dmErr) throw dmErr;

    const acts = (activities ?? []) as Array<{
      activity_date: string;
      activity_type: string | null;
      distance_miles: number | null;
      duration_seconds: number | null;
      avg_heart_rate: number | null;
      avg_pace_per_mile?: number | null;
      activity_name: string | null;
    }>;

    // Filter to running activities only
    const runs = acts.filter((a) => {
      const t = (a.activity_type ?? '').toLowerCase();
      return t === 'running' || t === 'run' || t === '' || a.distance_miles != null;
    });

    // ── Basic totals ──────────────────────────────────────────
    const totalRuns = runs.length;
    const totalMiles = runs.reduce((sum, a) => sum + (a.distance_miles ?? 0), 0);
    const totalSeconds = runs.reduce((sum, a) => sum + (a.duration_seconds ?? 0), 0);
    const totalHours = Math.round((totalSeconds / 3600) * 10) / 10;

    // ── Longest run ───────────────────────────────────────────
    const longestRunAct = runs.reduce<typeof runs[0] | null>((best, a) => {
      if (best === null) return a;
      return (a.distance_miles ?? 0) > (best.distance_miles ?? 0) ? a : best;
    }, null);
    const longestRun = {
      miles: Math.round((longestRunAct?.distance_miles ?? 0) * 100) / 100,
      date: longestRunAct?.activity_date ?? '',
    };

    // ── Training age ─────────────────────────────────────────
    let trainingAge = 'Unknown';
    if (runs.length > 0) {
      const firstDate = new Date(runs[0].activity_date + 'T00:00:00');
      const now = new Date();
      const diffMs = now.getTime() - firstDate.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const years = Math.floor(diffDays / 365);
      const months = Math.floor((diffDays % 365) / 30);
      if (years >= 1) {
        trainingAge = months > 0 ? `${years}y ${months}mo` : `${years} year${years > 1 ? 's' : ''}`;
      } else if (months >= 1) {
        trainingAge = `${months} month${months > 1 ? 's' : ''}`;
      } else {
        trainingAge = `${diffDays} days`;
      }
    }

    // ── Avg pace helper ───────────────────────────────────────
    function computePaceStr(durationSeconds: number, distanceMiles: number): string {
      if (distanceMiles <= 0) return '--:--';
      const paceMinutes = (durationSeconds / 60) / distanceMiles;
      const mins = Math.floor(paceMinutes);
      const secs = Math.round((paceMinutes - mins) * 60);
      return `${mins}:${String(secs).padStart(2, '0')}`;
    }

    // ── Avg easy pace ─────────────────────────────────────────
    // Easy/recovery runs = activity name contains "easy" or "recovery",
    // or avg HR < 145 (zone 2-ish). Fall back to all runs if no easy runs found.
    const easyRuns = runs.filter((a) => {
      const name = (a.activity_name ?? '').toLowerCase();
      const isEasyName = name.includes('easy') || name.includes('recovery') || name.includes('zone 2');
      const isEasyHR = a.avg_heart_rate != null && a.avg_heart_rate < 145;
      return isEasyName || isEasyHR;
    });

    const easySource = easyRuns.length > 0 ? easyRuns : runs;
    const totalEasySeconds = easySource.reduce((s, a) => s + (a.duration_seconds ?? 0), 0);
    const totalEasyMiles = easySource.reduce((s, a) => s + (a.distance_miles ?? 0), 0);
    const avgEasyPace = computePaceStr(totalEasySeconds, totalEasyMiles) + '/mi';

    // ── Avg HR ────────────────────────────────────────────────
    const runsWithHR = runs.filter((a) => a.avg_heart_rate != null);
    const avgHR = runsWithHR.length > 0
      ? Math.round(runsWithHR.reduce((s, a) => s + (a.avg_heart_rate ?? 0), 0) / runsWithHR.length)
      : 0;

    // ── Resting HR trend ──────────────────────────────────────
    const restingHRTrend = (dailyMetrics ?? [])
      .filter((m) => m.resting_heart_rate != null)
      .map((m) => ({ date: m.date as string, hr: m.resting_heart_rate as number }));

    // ── Weekly mileage — last 16 weeks ────────────────────────
    const now = new Date();
    const weeklyMileage: { week: string; miles: number }[] = [];

    for (let w = 15; w >= 0; w--) {
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() - w * 7);
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 6);

      const startStr = weekStart.toISOString().split('T')[0];
      const endStr = weekEnd.toISOString().split('T')[0];

      const miles = runs
        .filter((a) => a.activity_date >= startStr && a.activity_date <= endStr)
        .reduce((sum, a) => sum + (a.distance_miles ?? 0), 0);

      weeklyMileage.push({
        week: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        miles: Math.round(miles * 10) / 10,
      });
    }

    // ── Avg miles per week — last 12 weeks ───────────────────
    const last12 = weeklyMileage.slice(-12);
    const avgMilesPerWeek =
      Math.round(
        (last12.reduce((s, w) => s + w.miles, 0) / Math.max(last12.length, 1)) * 10
      ) / 10;

    // ── Pace distribution ─────────────────────────────────────
    // Classify each run by pace into easy (<9:30), moderate (9:30–7:30), hard (>7:30)
    let easyCount = 0, moderateCount = 0, hardCount = 0;
    for (const run of runs) {
      if (!run.duration_seconds || !run.distance_miles || run.distance_miles <= 0) continue;
      const paceMin = (run.duration_seconds / 60) / run.distance_miles;
      if (paceMin >= 9.5) easyCount++;
      else if (paceMin >= 7.5) moderateCount++;
      else hardCount++;
    }
    const paceTotal = easyCount + moderateCount + hardCount || 1;
    const paceDistribution = [
      { zone: 'Easy', pct: Math.round((easyCount / paceTotal) * 100) },
      { zone: 'Moderate', pct: Math.round((moderateCount / paceTotal) * 100) },
      { zone: 'Hard', pct: Math.round((hardCount / paceTotal) * 100) },
    ];

    // ── Recent runs — last 10 ────────────────────────────────
    const recentRuns = runs
      .slice()
      .sort((a, b) => (b.activity_date > a.activity_date ? 1 : -1))
      .slice(0, 10)
      .map((a) => ({
        date: a.activity_date,
        miles: Math.round((a.distance_miles ?? 0) * 100) / 100,
        pace: a.duration_seconds && a.distance_miles
          ? computePaceStr(a.duration_seconds, a.distance_miles) + '/mi'
          : '--:--/mi',
        hr: a.avg_heart_rate ?? null,
        type: (a.activity_name ?? a.activity_type ?? 'Run'),
      }));

    // ── Fitness score (0–100) ────────────────────────────────
    // Simple heuristic: consistency (% of weeks with mileage in last 12) * 50
    //   + pace score (lower avg pace = better, capped at sub-7:00 = max 50)
    const weeksWithRuns = last12.filter((w) => w.miles > 0).length;
    const consistencyScore = Math.round((weeksWithRuns / 12) * 50);

    let paceScore = 25; // default middle
    if (totalEasyMiles > 0) {
      const avgPaceMin = (totalEasySeconds / 60) / totalEasyMiles;
      // 7:00/mi = 50pts, 12:00/mi = 0pts
      paceScore = Math.max(0, Math.min(50, Math.round(((12 - avgPaceMin) / 5) * 50)));
    }
    const fitnessScore = Math.min(100, consistencyScore + paceScore);

    return NextResponse.json({
      totalRuns,
      totalMiles: Math.round(totalMiles * 10) / 10,
      totalHours,
      avgMilesPerWeek,
      longestRun,
      avgEasyPace,
      avgHR,
      restingHRTrend,
      weeklyMileage,
      paceDistribution,
      recentRuns,
      trainingAge,
      fitnessScore,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[garmin/profile]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
