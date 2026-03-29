import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getWorkoutByDate, allWeeks } from '@/data/training-plan';

const COACH_SYSTEM_PROMPT = `You are Coach — a knowledgeable, direct, and motivating running coach embedded in a training app. You're coaching an athlete in Dallas, TX who is training for two races:

1. 2027 Houston Marathon (January 17, 2027) — Goal: Sub-2:50 for a Boston Qualifier
2. 2027 Grasslands 100-Mile Ultra (March 20-21, 2027) — Goal: Sub-24 hours (first 100-miler ever)

Athlete profile: Male, 18-34, 150-170 lbs, marathon PR 3:27 (on just 20-30 mpw), currently ramping to 70 mpw peak. Trains 6 days/week (rest Friday). Full gym access. No injury history. Lives in Dallas — uses summer heat for acclimatization.

Training plan: 51-week periodized program:
- Phase 1: Base Building (Wks 1-10, Mar 30 - Jun 7, 25→42 mpw, lifting 3x/wk)
- Phase 2: Speed + Heat (Wks 11-20, Jun 8 - Aug 15, 42→55 mpw, lifting 2x/wk)
- Phase 3: Marathon Specific (Wks 21-36, Aug 16 - Nov 28, 55→70 mpw, lifting 2x/wk)
- Phase 4: Taper + Houston (Wks 37-42, Nov 29 - Jan 17, 50→25 mpw, lifting 1x→0)
- Phase 5: Ultra Bridge (Wks 43-51, Jan 18 - Mar 20, recovery→50 mpw, ultra-specific)

Key paces: Easy 7:50-8:20, Marathon Pace 6:25-6:35, Tempo 6:05-6:15, Interval 5:45-6:00, Recovery 8:30-9:00. Add 20-40 sec/mile in Dallas summer heat (June-September).

Your communication style:
- Direct and confident, like a coach who knows their stuff
- Concise — give the answer, then explain if needed. Don't ramble.
- Use running terminology naturally
- Be encouraging but honest. If the athlete is behind, say so constructively.
- When modifying workouts, explain the reasoning briefly
- Use "you" and "your" — this is personal coaching
- When asked about something outside your expertise (medical, etc.), say so and recommend they see a professional
- Reference specific logged workouts and data when relevant — this is what separates good coaching from generic advice

When the athlete asks to modify a workout, respond with your coaching rationale AND include a structured modification in your response using this format:

---WORKOUT_MODIFICATION---
{
  "date": "YYYY-MM-DD",
  "changes": {
    "description": "new workout description",
    "mileage": 8,
    "type": "easy"
  },
  "reason": "brief reason"
}
---END_MODIFICATION---

The app will parse this and apply the changes to the training plan.`;

// ── Performance data fetcher ──────────────────────────────────────────────────
async function fetchPerformanceContext(): Promise<string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return '';

  try {
    const db = createClient(supabaseUrl, serviceKey);

    // Date range: last 4 weeks
    const today = new Date();
    const fourWeeksAgo = new Date(today);
    fourWeeksAgo.setDate(today.getDate() - 28);
    const sinceDate  = fourWeeksAgo.toISOString().split('T')[0];
    const todayStr   = today.toISOString().split('T')[0];

    const [logsRes, garminRes, metricsRes] = await Promise.all([
      db
        .from('workout_logs')
        .select('workout_date, completed, skipped, actual_miles, actual_duration_min, avg_heart_rate, notes')
        .gte('workout_date', sinceDate)
        .order('workout_date', { ascending: false }),

      db
        .from('garmin_activities')
        .select('activity_date, activity_type, distance_miles, duration_seconds, avg_heart_rate')
        .gte('activity_date', sinceDate)
        .order('activity_date', { ascending: false })
        .limit(20),

      db
        .from('garmin_daily_metrics')
        .select('date, resting_heart_rate, sleep_duration_hours')
        .gte('date', new Date(today.getTime() - 7 * 86400000).toISOString().split('T')[0])
        .order('date', { ascending: true }),
    ]);

    const logs     = logsRes.data    ?? [];
    const garmin   = garminRes.data  ?? [];
    const metrics  = metricsRes.data ?? [];

    if (!logs.length && !garmin.length && !metrics.length) return '';

    const lines: string[] = ['\n\n--- ATHLETE PERFORMANCE DATA (server-fetched) ---'];

    // ── Weekly summary ──────────────────────────────────────────────────────
    // Build a map of planned workouts per week from training plan
    const logMap = new Map(logs.map((l) => [l.workout_date, l]));

    // Find the 4 weeks that contain our log range
    const relevantWeeks = allWeeks
      .filter((w) => w.startDate >= sinceDate && w.startDate <= todayStr)
      .slice(-4);

    if (relevantWeeks.length > 0) {
      lines.push('\nWeekly Miles (actual vs planned):');
      for (const week of relevantWeeks) {
        const plannedMiles = week.totalMiles;
        let actualMiles    = 0;
        let completed      = 0;
        let skipped        = 0;

        for (const day of week.days) {
          const log = logMap.get(day.date);
          if (log?.completed) {
            completed++;
            actualMiles += log.actual_miles ?? day.miles;
          } else if (log?.skipped) {
            skipped++;
          }
        }

        const pct = plannedMiles > 0 ? Math.round((actualMiles / plannedMiles) * 100) : 0;
        const downTag = week.isDownWeek ? ' [DOWN WEEK]' : '';
        lines.push(
          `  Wk ${week.week} (${week.startDate}): ${actualMiles.toFixed(1)}/${plannedMiles} mi (${pct}%)${downTag}` +
          (skipped > 0 ? ` — ${skipped} skipped` : '')
        );
      }
    }

    // ── Recent workouts ──────────────────────────────────────────────────────
    const recentLogs = logs.slice(0, 10);
    if (recentLogs.length > 0) {
      lines.push('\nRecent Workouts (newest first):');
      for (const log of recentLogs) {
        const planned = getWorkoutByDate(log.workout_date);
        const tag  = log.completed ? '✓' : log.skipped ? 'SKIP' : '—';
        const type = planned?.type?.toUpperCase() ?? '';
        const plannedMi = planned?.miles ?? 0;
        const actualMi  = log.actual_miles ?? null;
        const mi = actualMi != null
          ? `${actualMi}mi${plannedMi ? `/${plannedMi}mi planned` : ''}`
          : plannedMi ? `${plannedMi}mi planned` : '';
        const hr   = log.avg_heart_rate ? ` HR ${log.avg_heart_rate}bpm` : '';
        const note = log.notes ? ` Note: "${log.notes}"` : '';
        lines.push(`  ${log.workout_date} ${tag} ${type} ${mi}${hr}${note}`.trimEnd());
      }
    }

    // ── Garmin activity detail (for pace context) ────────────────────────────
    const qualityRuns = garmin.filter(
      (a) => a.distance_miles >= 5 && (a.activity_type === 'running' || a.activity_type === 'trail_running')
    ).slice(0, 5);

    if (qualityRuns.length > 0) {
      lines.push('\nRecent Garmin Runs (quality sessions):');
      for (const run of qualityRuns) {
        const pace = run.duration_seconds && run.distance_miles
          ? (() => {
              const secsPerMile = run.duration_seconds / run.distance_miles;
              const min = Math.floor(secsPerMile / 60);
              const sec = Math.round(secsPerMile % 60);
              return `${min}:${String(sec).padStart(2, '0')}/mi`;
            })()
          : null;
        const hr   = run.avg_heart_rate ? ` HR ${run.avg_heart_rate}` : '';
        const paceStr = pace ? ` @ ${pace}` : '';
        lines.push(`  ${run.activity_date}: ${run.distance_miles.toFixed(1)}mi${paceStr}${hr}`);
      }
    }

    // ── Health metrics ───────────────────────────────────────────────────────
    if (metrics.length > 0) {
      const rhrs   = metrics.map((m) => m.resting_heart_rate).filter(Boolean) as number[];
      const sleeps = metrics.map((m) => m.sleep_duration_hours).filter(Boolean) as number[];
      if (rhrs.length > 0) {
        const avgRhr = Math.round(rhrs.reduce((a, b) => a + b, 0) / rhrs.length);
        const trend  = rhrs.length >= 3
          ? rhrs[rhrs.length - 1] - rhrs[0] > 3 ? ' ↑ (elevated — check recovery)'
            : rhrs[rhrs.length - 1] - rhrs[0] < -3 ? ' ↓ (improving)'
            : ' (stable)'
          : '';
        lines.push(`\nResting HR (${rhrs.length}d): ${rhrs.join(', ')} bpm — avg ${avgRhr}${trend}`);
      }
      if (sleeps.length > 0) {
        const avgSleep = (sleeps.reduce((a, b) => a + b, 0) / sleeps.length).toFixed(1);
        lines.push(`Sleep (${sleeps.length}d avg): ${avgSleep}h`);
      }
    }

    lines.push('--- END PERFORMANCE DATA ---');
    return lines.join('\n');
  } catch (err) {
    console.warn('[coach] Performance fetch failed (non-fatal):', err);
    return '';
  }
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { content: 'AI Coach is not configured. Please add ANTHROPIC_API_KEY to your environment variables.' },
        { status: 200 }
      );
    }

    // Fetch performance context and build system prompt in parallel
    const [performanceContext] = await Promise.all([
      fetchPerformanceContext(),
    ]);

    let systemWithContext = COACH_SYSTEM_PROMPT + performanceContext;

    // Append situational context from client (current week/phase/today's workout)
    if (context) {
      const contextLines: string[] = [];
      if (context.weekNumber)   contextLines.push(`Current week: Week ${context.weekNumber} of 51`);
      if (context.phase)        contextLines.push(`Current phase: Phase ${context.phase} — ${context.phaseName}`);
      if (context.todayWorkout) contextLines.push(`Today's planned workout: ${context.todayWorkout}`);
      if (contextLines.length > 0) {
        systemWithContext += `\n\nSession context:\n${contextLines.join('\n')}`;
      }
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: systemWithContext,
        messages: messages.slice(-20),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Anthropic API error:', error);
      return NextResponse.json(
        { content: 'Coach is temporarily unavailable. Please try again in a moment.' },
        { status: 200 }
      );
    }

    const data    = await response.json();
    const content = data.content?.[0]?.text ?? 'No response from Coach.';

    return NextResponse.json({ content });
  } catch (err) {
    console.error('Coach API error:', err);
    return NextResponse.json(
      { content: 'Something went wrong. Please try again.' },
      { status: 200 }
    );
  }
}
