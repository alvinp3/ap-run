import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser-side client (uses anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client (uses service role key — server only, never client)
export function createServerClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// ============================================================
// Workout log helpers
// ============================================================

export async function getWorkoutLog(date: string) {
  const { data, error } = await supabase
    .from('workout_logs')
    .select('*')
    .eq('workout_date', date)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function upsertWorkoutLog(
  date: string,
  updates: {
    completed?: boolean;
    skipped?: boolean;
    actualMiles?: number;
    actualDurationMin?: number;
    avgHeartRate?: number;
    notes?: string;
    garminActivityId?: number;
    completedAt?: string;
  }
) {
  const { data, error } = await supabase
    .from('workout_logs')
    .upsert(
      {
        workout_date: date,
        completed: updates.completed,
        skipped: updates.skipped,
        actual_miles: updates.actualMiles,
        actual_duration_min: updates.actualDurationMin,
        avg_heart_rate: updates.avgHeartRate,
        notes: updates.notes,
        garmin_activity_id: updates.garminActivityId,
        completed_at: updates.completedAt ?? (updates.completed ? new Date().toISOString() : undefined),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'workout_date' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getLogsForWeek(startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('workout_logs')
    .select('*')
    .gte('workout_date', startDate)
    .lte('workout_date', endDate);
  if (error) throw error;
  return data ?? [];
}

export async function getAllLogs() {
  const { data, error } = await supabase
    .from('workout_logs')
    .select('*')
    .order('workout_date', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ============================================================
// Coach conversation helpers
// ============================================================

export async function saveCoachMessage(role: 'user' | 'assistant', content: string) {
  const { data, error } = await supabase
    .from('coach_conversations')
    .insert({ role, content })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getRecentCoachMessages(limit = 20) {
  const { data, error } = await supabase
    .from('coach_conversations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).reverse();
}

// ============================================================
// User settings helpers
// ============================================================

export async function getUserSettings() {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .limit(1)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function upsertUserSettings(updates: Record<string, unknown>) {
  // Get existing settings to determine id
  const existing = await getUserSettings();

  if (existing) {
    const { data, error } = await supabase
      .from('user_settings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('user_settings')
      .insert({ ...updates })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

// ============================================================
// Garmin daily metrics
// ============================================================

export async function getTodayGarminMetrics(date: string) {
  const { data, error } = await supabase
    .from('garmin_daily_metrics')
    .select('*')
    .eq('date', date)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getRecentGarminMetrics(days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const { data, error } = await supabase
    .from('garmin_daily_metrics')
    .select('*')
    .gte('date', since.toISOString().split('T')[0])
    .order('date', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// ============================================================
// Gear checklist
// ============================================================

export async function getGearChecklist(race: 'houston' | 'grasslands') {
  const { data, error } = await supabase
    .from('gear_checklist')
    .select('*')
    .eq('race', race);
  if (error) throw error;
  return data ?? [];
}

export async function toggleGearItem(race: 'houston' | 'grasslands', itemId: string, checked: boolean) {
  const { data, error } = await supabase
    .from('gear_checklist')
    .upsert(
      { race, item_id: itemId, checked, updated_at: new Date().toISOString() },
      { onConflict: 'race,item_id' }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}
