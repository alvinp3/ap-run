import { NextRequest, NextResponse } from 'next/server';

// In-memory fallback (used when Supabase is not configured or DB call fails)
const memoryLogs: Record<string, {
  date: string;
  completed: boolean;
  skipped: boolean;
  actualMiles?: number;
  notes?: string;
  completedAt?: string;
}> = {};

function dbRowToLog(row: {
  workout_date: string;
  completed: boolean | null;
  skipped: boolean | null;
  actual_miles: number | null;
  notes: string | null;
  completed_at: string | null;
}) {
  return {
    date: row.workout_date,
    completed: row.completed ?? false,
    skipped: row.skipped ?? false,
    actualMiles: row.actual_miles ?? undefined,
    notes: row.notes ?? undefined,
    completedAt: row.completed_at ?? undefined,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');

  // Prefer Supabase when configured
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      if (date) {
        const { data } = await supabase
          .from('workout_logs')
          .select('workout_date, completed, skipped, actual_miles, notes, completed_at')
          .eq('workout_date', date)
          .maybeSingle();
        return NextResponse.json(data ? dbRowToLog(data) : null);
      }

      const { data } = await supabase
        .from('workout_logs')
        .select('workout_date, completed, skipped, actual_miles, notes, completed_at')
        .order('workout_date', { ascending: true });
      if (data) return NextResponse.json(data.map(dbRowToLog));
    } catch (err) {
      console.warn('[logs GET] Supabase failed, falling back to memory:', err);
    }
  }

  // Memory fallback
  if (date) return NextResponse.json(memoryLogs[date] ?? null);
  return NextResponse.json(Object.values(memoryLogs));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, completed, skipped, actualMiles, notes } = body;

    if (!date) {
      return NextResponse.json({ error: 'date is required' }, { status: 400 });
    }

    const log = {
      date,
      completed: completed ?? false,
      skipped: skipped ?? false,
      actualMiles,
      notes,
      completedAt: completed ? new Date().toISOString() : undefined,
    };

    memoryLogs[date] = log;

    // Persist to Supabase
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        await supabase.from('workout_logs').upsert(
          {
            workout_date: date,
            completed: log.completed,
            skipped: log.skipped,
            actual_miles: log.actualMiles,
            notes: log.notes,
            completed_at: log.completedAt,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'workout_date' }
        );
      } catch (dbErr) {
        console.warn('[logs POST] Supabase upsert failed (memory store used):', dbErr);
      }
    }

    return NextResponse.json(log);
  } catch (err) {
    console.error('Log POST error:', err);
    return NextResponse.json({ error: 'Failed to save log' }, { status: 500 });
  }
}
