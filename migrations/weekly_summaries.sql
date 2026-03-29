-- Weekly AI-generated performance summaries
CREATE TABLE IF NOT EXISTS weekly_summaries (
  week_start          DATE        PRIMARY KEY,
  week_number         INTEGER,
  phase_name          TEXT,
  summary_text        TEXT        NOT NULL,
  grade               TEXT,
  planned_miles       NUMERIC(6,2),
  actual_miles        NUMERIC(6,2),
  completion_rate     INTEGER,
  workouts_completed  INTEGER,
  workouts_planned    INTEGER,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS weekly_summaries_week_start_idx ON weekly_summaries (week_start DESC);
