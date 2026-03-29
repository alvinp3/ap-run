/**
 * Garmin Connect client factory with OAuth token persistence via Supabase.
 *
 * Tokens are stored in user_settings.garmin_session_encrypted as JSON.
 * On each call we try to restore the token first; if it fails we re-login
 * and save fresh tokens.
 */
import { GarminConnect } from 'garmin-connect';
import { createClient } from '@supabase/supabase-js';

const SETTINGS_ID = '00000000-0000-0000-0000-000000000001';

// Schedule endpoint not exposed by the package — use raw POST
const SCHEDULE_URL = (workoutId: number) =>
  `https://connectapi.garmin.com/workout-service/schedule/${workoutId}`;

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function saveTokens(gc: GarminConnect) {
  const tokens = gc.exportToken();
  await supabase()
    .from('user_settings')
    .upsert({
      id: SETTINGS_ID,
      garmin_session_encrypted: JSON.stringify(tokens),
      garmin_connected: true,
      garmin_last_sync: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
}

export async function getGarminClient(): Promise<GarminConnect> {
  const email = process.env.GARMIN_EMAIL;
  const password = process.env.GARMIN_PASSWORD;
  if (!email || !password) throw new Error('GARMIN_EMAIL / GARMIN_PASSWORD not set');

  const gc = new GarminConnect({ username: email, password });

  // Try stored tokens first
  const { data } = await supabase()
    .from('user_settings')
    .select('garmin_session_encrypted')
    .eq('id', SETTINGS_ID)
    .single();

  if (data?.garmin_session_encrypted) {
    try {
      const { oauth1, oauth2 } = JSON.parse(data.garmin_session_encrypted);
      gc.loadToken(oauth1, oauth2);
      // Quick smoke-test: if this throws, tokens are stale
      await gc.getUserSettings();
      return gc;
    } catch {
      // Fall through to fresh login
    }
  }

  await gc.login(email, password);
  await saveTokens(gc);
  return gc;
}

/** Push a workout to Garmin Connect and schedule it on a specific date. */
export async function pushAndScheduleWorkout(
  gc: GarminConnect,
  name: string,
  distanceMiles: number,
  description: string,
  dateStr: string // YYYY-MM-DD
): Promise<{ workoutId: number; scheduled: boolean }> {
  const meters = Math.round(distanceMiles * 1609.34);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const workout = await gc.addRunningWorkout(name, meters, description) as any;
  const workoutId: number = workout?.workoutId;

  let scheduled = false;
  if (workoutId) {
    try {
      // Raw schedule call — not exposed by the library
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (gc as any).post(SCHEDULE_URL(workoutId), { date: dateStr });
      scheduled = true;
    } catch {
      // Library might not support scheduling — workout is still in the library
    }
  }

  return { workoutId, scheduled };
}
