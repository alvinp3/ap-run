import { NextRequest, NextResponse } from 'next/server';

// In-memory log store for when Supabase is not configured
// In production, all operations go through Supabase
const memoryLogs: Record<string, {
  date: string;
  completed: boolean;
  skipped: boolean;
  actualMiles?: number;
  notes?: string;
  completedAt?: string;
}> = {};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');

  if (date) {
    const log = memoryLogs[date] ?? null;
    return NextResponse.json(log);
  }

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

    // If Supabase is configured, try to persist
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const { createServerClient } = await import('@/lib/supabase');
        const supabase = createServerClient();
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
        console.warn('Supabase log upsert failed (continuing with memory store):', dbErr);
      }
    }

    return NextResponse.json(log);
  } catch (err) {
    console.error('Log POST error:', err);
    return NextResponse.json({ error: 'Failed to save log' }, { status: 500 });
  }
}
