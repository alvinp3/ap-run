/**
 * Supabase Seed Script
 * Populates the workouts table from the TypeScript training plan constants.
 *
 * Usage:
 *   npx tsx supabase/seed.ts
 *
 * Requirements:
 *   - NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

// Import all weeks from training plan
// Note: ts-node needs to resolve the @/ alias; use relative path here.
import { allWeeks } from '../src/data/training-plan';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  console.error('Copy .env.local.example to .env.local and fill in your values.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const PHASE_NAMES: Record<number, string> = {
  1: 'Base Building',
  2: 'Speed + Heat Acclimatization',
  3: 'Marathon Specific',
  4: 'Taper + Houston',
  5: 'Ultra Bridge',
};

interface WorkoutRow {
  date: string;
  week_number: number;
  day_of_week: string;
  type: string;
  miles: number;
  description: string;
  has_strength: boolean;
  estimated_minutes: number | null;
  phase: number;
  phase_name: string;
  is_down_week: boolean;
}

async function seed() {
  console.log('Starting seed...');
  console.log(`Total weeks to seed: ${allWeeks.length}`);

  const rows: WorkoutRow[] = [];

  for (const week of allWeeks) {
    // Determine phase from week number
    let phase = 1;
    if (week.week <= 10) phase = 1;
    else if (week.week <= 20) phase = 2;
    else if (week.week <= 36) phase = 3;
    else if (week.week <= 42) phase = 4;
    else phase = 5;

    for (const day of week.days) {
      rows.push({
        date: day.date,
        week_number: week.week,
        day_of_week: day.day,
        type: day.type,
        miles: day.miles,
        description: day.description,
        has_strength: day.hasStrength ?? false,
        estimated_minutes: day.estimatedMinutes ?? null,
        phase,
        phase_name: PHASE_NAMES[phase],
        is_down_week: week.isDownWeek ?? false,
      });
    }
  }

  console.log(`Total workout rows: ${rows.length}`);

  // Upsert in batches of 100 to avoid payload limits
  const BATCH_SIZE = 100;
  let inserted = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from('workouts')
      .upsert(batch, { onConflict: 'date' });

    if (error) {
      console.error(`Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`, error);
      process.exit(1);
    }

    inserted += batch.length;
    console.log(`Seeded ${inserted}/${rows.length} workouts...`);
  }

  console.log(`\n✓ Seeded ${rows.length} workouts across ${allWeeks.length} weeks.`);
  console.log('Your Supabase workouts table is ready!\n');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
