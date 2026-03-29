import { NextRequest, NextResponse } from 'next/server';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  const { createClient } = require('@supabase/supabase-js');
  return createClient(url, key);
}

export async function GET(req: NextRequest) {
  const db = getSupabase();
  if (!db) return NextResponse.json([]);
  const date = new URL(req.url).searchParams.get('date');
  if (date) {
    const { data } = await db.from('workout_overrides').select('*').eq('date', date).single();
    return NextResponse.json(data ?? null);
  }
  const { data } = await db.from('workout_overrides').select('*').order('date');
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const db = getSupabase();
  if (!db) return NextResponse.json({ error: 'DB not configured' }, { status: 503 });
  try {
    const body = await req.json();
    const { date, description, miles, type, estimatedMinutes, reason } = body;
    if (!date) return NextResponse.json({ error: 'date required' }, { status: 400 });
    const { data, error } = await db
      .from('workout_overrides')
      .upsert({
        date,
        description:        description  ?? null,
        miles:              miles        ?? null,
        type:               type         ?? null,
        estimated_minutes:  estimatedMinutes ?? null,
        reason:             reason       ?? null,
        updated_at:         new Date().toISOString(),
      }, { onConflict: 'date' })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const db = getSupabase();
  if (!db) return NextResponse.json({ error: 'DB not configured' }, { status: 503 });
  const date = new URL(req.url).searchParams.get('date');
  if (!date) return NextResponse.json({ error: 'date required' }, { status: 400 });
  const { error } = await db.from('workout_overrides').delete().eq('date', date);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
