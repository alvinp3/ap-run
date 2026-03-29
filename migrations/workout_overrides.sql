-- Run this in your Supabase SQL editor
-- Workout overrides created by AI Coach
CREATE TABLE IF NOT EXISTS workout_overrides (
  date              DATE        PRIMARY KEY,
  description       TEXT,
  miles             NUMERIC(5,2),
  type              TEXT,
  estimated_minutes INTEGER,
  reason            TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Allow reads/writes from service role (already has full access)
-- Optional: enable RLS if you need user-scoped overrides in the future
