import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { allWeeks, getPhaseForWeek } from '@/data/training-plan';

export interface WeeklySummary {
  weekStart: string;
  weekNumber: number;
  phaseName: string;
  summaryText: string;
  grade: string;
  plannedMiles: number;
  actualMiles: number;
  completionRate: number;
  workoutsCompleted: number;
  workoutsPlanned: number;
  createdAt: string;
}

function formatPace(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}/mi`;
}

/**
 * Generate an AI-powered weekly summary for the given week start date (Monday).
 * Fetches workout logs, Garmin activities, and daily metrics from Supabase,
 * then calls Claude to produce a coaching summary. Stores result in weekly_summaries.
 */
export async function generateWeeklySummary(weekStart: Date): Promise<WeeklySummary | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!supabaseUrl || !serviceKey || !anthropicKey) return null;

  const db = createClient(supabaseUrl, serviceKey);

  // Week date range: Monday → Sunday
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const startStr = weekStart.toISOString().split('T')[0];
  const endStr = weekEnd.toISOString().split('T')[0];

  // Find matching training plan week
  const planWeek = allWeeks.find(w => w.startDate === startStr);
  const weekNumber = planWeek?.week ?? 0;
  const phase = weekNumber > 0 ? getPhaseForWeek(weekNumber) : null;

  // ── Fetch data ────────────────────────────────────────────────────
  const [logsRes, activitiesRes, metricsRes] = await Promise.all([
    db.from('workout_logs')
      .select('workout_date, completed, skipped, actual_miles, actual_duration_min, avg_heart_rate, notes')
      .gte('workout_date', startStr)
      .lte('workout_date', endStr)
      .order('workout_date'),

    db.from('garmin_activities')
      .select('activity_date, activity_type, distance_miles, duration_seconds, avg_heart_rate, activity_name')
      .gte('activity_date', startStr)
      .lte('activity_date', endStr)
      .order('activity_date'),

    db.from('garmin_daily_metrics')
      .select('date, resting_heart_rate, sleep_duration_hours')
      .gte('date', startStr)
      .lte('date', endStr)
      .order('date'),
  ]);

  const logs = logsRes.data ?? [];
  const activities = activitiesRes.data ?? [];
  const metrics = metricsRes.data ?? [];

  // ── Calculate stats ───────────────────────────────────────────────
  const plannedDays = planWeek?.days ?? [];
  const workoutsPlanned = plannedDays.filter(d => d.type !== 'rest').length;
  const workoutsCompleted = logs.filter(l => l.completed).length;
  const plannedMiles = planWeek?.totalMiles ?? 0;
  const actualMiles = logs
    .filter(l => l.completed)
    .reduce((sum, l) => sum + (l.actual_miles ?? 0), 0);
  const completionRate = workoutsPlanned > 0
    ? Math.round((workoutsCompleted / workoutsPlanned) * 100)
    : 0;

  // ── Build prompt context ──────────────────────────────────────────
  const plannedWorkoutsText = plannedDays.map(d => {
    const day = new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    return `  ${day}: ${d.type.toUpperCase()}${d.miles > 0 ? ` ${d.miles}mi` : ''} — ${d.description.substring(0, 80)}`;
  }).join('\n');

  const logsText = logs.length > 0
    ? logs.map(l => {
        const day = new Date(l.workout_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const status = l.completed ? '✓' : l.skipped ? 'SKIP' : '—';
        const miles = l.actual_miles ? ` ${l.actual_miles}mi` : '';
        const hr = l.avg_heart_rate ? ` ${l.avg_heart_rate}bpm` : '';
        const pace = (l.actual_miles && l.actual_duration_min)
          ? ` ${formatPace((l.actual_duration_min * 60) / l.actual_miles)}`
          : '';
        const notes = l.notes ? ` | "${l.notes}"` : '';
        return `  ${day}: ${status}${miles}${pace}${hr}${notes}`;
      }).join('\n')
    : '  No logs recorded';

  const garminText = activities.length > 0
    ? activities.map(a => {
        const day = new Date(a.activity_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const dur = a.duration_seconds ? `${Math.round(a.duration_seconds / 60)}min` : '';
        const hr = a.avg_heart_rate ? ` avg ${a.avg_heart_rate}bpm` : '';
        return `  ${day}: ${a.activity_name ?? a.activity_type} ${a.distance_miles}mi ${dur}${hr}`;
      }).join('\n')
    : '  No Garmin activities';

  const healthText = metrics.length > 0
    ? metrics.map(m => {
        const parts = [
          m.resting_heart_rate ? `RHR ${m.resting_heart_rate}bpm` : null,
          m.sleep_duration_hours ? `sleep ${m.sleep_duration_hours}h` : null,
        ].filter(Boolean);
        return `  ${m.date}: ${parts.join(', ') || 'no data'}`;
      }).join('\n')
    : '  No health metrics';

  const prompt = `You are Coach — a direct, experienced running coach. Analyze this athlete's training week and produce a concise weekly performance review.

WEEK ${weekNumber > 0 ? `#${weekNumber}` : '(Off-Plan)'} ${phase ? `| Phase ${phase.phase}: ${phase.name}` : ''}
Period: ${startStr} → ${endStr}
Target races: Houston Marathon Jan 17, 2027 (Sub-2:50 BQ) and Grasslands 100 Mar 20, 2027 (Sub-24h)

PLANNED WORKOUTS:
${plannedWorkoutsText || '  No workouts planned (off-plan week)'}

WORKOUT LOGS:
${logsText}

GARMIN ACTIVITIES:
${garminText}

DAILY HEALTH METRICS:
${healthText}

SUMMARY STATS:
- Planned miles: ${plannedMiles.toFixed(1)} | Actual: ${actualMiles.toFixed(1)} | Variance: ${(actualMiles - plannedMiles).toFixed(1)}
- Workouts: ${workoutsCompleted}/${workoutsPlanned} completed (${completionRate}%)

---
Write a weekly coaching review. Use this exact structure:

GRADE: [A/A-/B+/B/B-/C+/C/D/F]
[One sentence justifying the grade]

WINS:
• [specific win 1 with data]
• [specific win 2 with data, or skip if only 1]

WATCH:
• [1-2 things to monitor or improve]

NEXT WEEK:
[One actionable sentence about what to focus on or adjust next week]

Keep total response under 180 words. Be specific — cite actual miles, paces, HR numbers. Be a coach, not a therapist.`;

  // ── Call Anthropic ────────────────────────────────────────────────
  const anthropic = new Anthropic({ apiKey: anthropicKey });
  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 400,
    messages: [{ role: 'user', content: prompt }],
  });

  const summaryText = msg.content
    .filter(b => b.type === 'text')
    .map(b => (b as { type: 'text'; text: string }).text)
    .join('\n')
    .trim();

  // Extract grade from first line
  const gradeMatch = summaryText.match(/^GRADE:\s*([A-F][+-]?)/m);
  const grade = gradeMatch?.[1] ?? '—';

  // ── Store in DB ───────────────────────────────────────────────────
  await db.from('weekly_summaries').upsert(
    {
      week_start: startStr,
      week_number: weekNumber,
      phase_name: phase?.name ?? null,
      summary_text: summaryText,
      grade,
      planned_miles: plannedMiles,
      actual_miles: parseFloat(actualMiles.toFixed(2)),
      completion_rate: completionRate,
      workouts_completed: workoutsCompleted,
      workouts_planned: workoutsPlanned,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'week_start' }
  );

  return {
    weekStart: startStr,
    weekNumber,
    phaseName: phase?.name ?? 'Off-Plan',
    summaryText,
    grade,
    plannedMiles,
    actualMiles: parseFloat(actualMiles.toFixed(2)),
    completionRate,
    workoutsCompleted,
    workoutsPlanned,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Returns the Monday of the week that just ended (previous week's Monday).
 */
export function getLastWeekStart(): Date {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ...
  // Days since last Monday
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const lastMonday = new Date(today);
  lastMonday.setDate(today.getDate() - daysSinceMonday - 7);
  lastMonday.setHours(0, 0, 0, 0);
  return lastMonday;
}

/**
 * Returns the Monday of the current week.
 */
export function getCurrentWeekStart(): Date {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - daysSinceMonday);
  monday.setHours(0, 0, 0, 0);
  return monday;
}
