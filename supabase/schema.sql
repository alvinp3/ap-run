-- ============================================================
-- BQ + 100-Miler Training Companion — Database Schema
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- workouts: The 51-week training plan (seeded from training-plan.ts)
-- ============================================================
create table if not exists workouts (
  id            uuid primary key default uuid_generate_v4(),
  date          date not null unique,
  week_number   int not null,
  phase         int not null check (phase between 1 and 5),
  phase_name    text not null,
  day_of_week   text not null,
  type          text not null check (type in ('easy','intervals','tempo','long','rest','race','recovery','strength')),
  miles         float not null default 0,
  description   text not null,
  has_strength  boolean not null default false,
  estimated_minutes int,
  is_down_week  boolean not null default false,
  created_at    timestamptz default now()
);

create index on workouts (date);
create index on workouts (week_number);
create index on workouts (phase);

-- ============================================================
-- workout_logs: User's completion records
-- ============================================================
create table if not exists workout_logs (
  id                  uuid primary key default uuid_generate_v4(),
  workout_date        date not null references workouts(date) on delete cascade,
  completed           boolean not null default false,
  skipped             boolean not null default false,
  actual_miles        float,
  actual_duration_min int,
  avg_heart_rate      int,
  notes               text,
  garmin_activity_id  bigint,
  completed_at        timestamptz,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

create index on workout_logs (workout_date);
create unique index on workout_logs (workout_date);

-- ============================================================
-- user_settings: App preferences
-- ============================================================
create table if not exists user_settings (
  id                       uuid primary key default uuid_generate_v4(),
  share_slug               text unique,
  share_enabled            boolean default true,
  garmin_connected         boolean default false,
  garmin_email             text,
  garmin_session_encrypted text,
  garmin_last_sync         timestamptz,
  garmin_auto_sync         boolean default false,
  show_garmin_on_dashboard boolean default true,
  dark_mode                boolean default true,
  created_at               timestamptz default now(),
  updated_at               timestamptz default now()
);

-- ============================================================
-- coach_conversations: AI Coach chat history
-- ============================================================
create table if not exists coach_conversations (
  id         uuid primary key default uuid_generate_v4(),
  role       text not null check (role in ('user', 'assistant')),
  content    text not null,
  created_at timestamptz default now()
);

create index on coach_conversations (created_at);

-- ============================================================
-- garmin_activities: Imported Garmin activity data
-- ============================================================
create table if not exists garmin_activities (
  id                  bigint primary key,  -- Garmin activityId
  activity_date       date not null,
  activity_type       text,
  distance_miles      float,
  duration_seconds    int,
  avg_pace_per_mile   float,
  avg_heart_rate      int,
  max_heart_rate      int,
  avg_cadence         int,
  elevation_gain_ft   float,
  calories            int,
  training_effect     float,
  vo2max_estimate     float,
  avg_temperature_f   float,
  splits              jsonb,
  heart_rate_zones    jsonb,
  activity_name       text,
  raw_data            jsonb,
  imported_at         timestamptz default now()
);

create index on garmin_activities (activity_date);

-- ============================================================
-- garmin_daily_metrics: Daily health metrics from Garmin
-- ============================================================
create table if not exists garmin_daily_metrics (
  date                    date primary key,
  resting_heart_rate      int,
  sleep_score             int,
  sleep_duration_hours    float,
  stress_level            int,
  body_battery_high       int,
  body_battery_low        int,
  training_readiness      int,
  vo2max                  float,
  steps                   int,
  imported_at             timestamptz default now()
);

-- ============================================================
-- gear_checklist: User's gear packing status
-- ============================================================
create table if not exists gear_checklist (
  id        uuid primary key default uuid_generate_v4(),
  race      text not null check (race in ('houston', 'grasslands')),
  item_id   text not null,
  checked   boolean not null default false,
  updated_at timestamptz default now(),
  unique(race, item_id)
);

-- ============================================================
-- warning_signs: Recovery warning sign checklist
-- ============================================================
create table if not exists warning_signs (
  sign_id     text primary key,
  checked     boolean not null default false,
  updated_at  timestamptz default now()
);

-- ============================================================
-- Row Level Security (RLS)
-- Enable RLS on tables with sensitive data
-- Public read allowed on workouts for shared view
-- ============================================================

-- workouts: public read, no write from client
alter table workouts enable row level security;
create policy "workouts_public_read" on workouts for select using (true);

-- workout_logs: service role only for now (athlete uses their own session)
alter table workout_logs enable row level security;
create policy "workout_logs_all" on workout_logs using (true);

-- coach_conversations: authenticated only
alter table coach_conversations enable row level security;
create policy "coach_conversations_all" on coach_conversations using (true);

-- user_settings: service role only
alter table user_settings enable row level security;
create policy "user_settings_all" on user_settings using (true);

-- garmin tables: service role
alter table garmin_activities enable row level security;
create policy "garmin_activities_all" on garmin_activities using (true);

alter table garmin_daily_metrics enable row level security;
create policy "garmin_daily_metrics_all" on garmin_daily_metrics using (true);

alter table gear_checklist enable row level security;
create policy "gear_checklist_all" on gear_checklist using (true);

alter table warning_signs enable row level security;
create policy "warning_signs_all" on warning_signs using (true);
