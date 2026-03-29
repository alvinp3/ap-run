import type { TrainingWeek, TrainingPhase } from '@/types';

// ============================================================
// PHASE 1: Base Building (Weeks 1-10, March 30 - June 7, 2026)
// ============================================================
export const phase1Weeks: TrainingWeek[] = [
  {
    week: 1, startDate: '2026-03-30', totalMiles: 32, isDownWeek: false,
    days: [
      { day: 'Monday',    date: '2026-03-30', type: 'easy',     miles: 4,  description: 'Easy run 4 miles @ 8:00-8:20/mi + Strength A (Lower Body: Back Squat 4x6 RPE 7-8, RDL 3x8, Walking Lunges 3x12/leg, Calf Raises 3x15, Plank 3x45s)', hasStrength: true,  estimatedMinutes: 75 },
      { day: 'Tuesday',   date: '2026-03-31', type: 'easy',     miles: 5,  description: 'Easy run 5 miles @ 8:00-8:20/mi + 6x100m strides (fast but controlled, full recovery between)', hasStrength: false, estimatedMinutes: 50 },
      { day: 'Wednesday', date: '2026-04-01', type: 'easy',     miles: 4,  description: 'Easy run 4 miles @ 8:00-8:20/mi + Strength B (Upper + Core: Bench 3x8, Row 3x10, OH Press 3x8, Pallof Press 3x12/side, Dead Bug 3x10/side)', hasStrength: true,  estimatedMinutes: 75 },
      { day: 'Thursday',  date: '2026-04-02', type: 'easy',     miles: 5,  description: 'Progression run 5 miles — first 3 mi easy, last 2 mi at 7:20-7:40/mi (comfortably quick, not tempo)', hasStrength: false, estimatedMinutes: 42 },
      { day: 'Friday',    date: '2026-04-03', type: 'rest',     miles: 0,  description: 'Full rest day. Foam rolling 10-15 min. Mobility work. Hydrate well.', hasStrength: false, estimatedMinutes: 15 },
      { day: 'Saturday',  date: '2026-04-04', type: 'long',     miles: 10, description: 'Long run 10 miles @ 7:30-8:00/mi. Easy, conversational effort throughout. Practice carrying a handheld bottle.', hasStrength: false, estimatedMinutes: 78 },
      { day: 'Sunday',    date: '2026-04-05', type: 'easy',     miles: 4,  description: 'Recovery run 4 miles @ 8:30-9:00/mi + Strength C (Posterior: Trap Bar DL 3x8, Step-Ups 3x10/leg, Side Plank 3x30s/side, Copenhagen 2x20s/side, Bird Dog 3x10/side)', hasStrength: true,  estimatedMinutes: 65 },
    ],
  },
  {
    week: 2, startDate: '2026-04-06', totalMiles: 35, isDownWeek: false,
    days: [
      { day: 'Monday',    date: '2026-04-06', type: 'easy', miles: 5,  description: 'Easy run 5 miles @ 8:00-8:20/mi + Strength A', hasStrength: true,  estimatedMinutes: 80 },
      { day: 'Tuesday',   date: '2026-04-07', type: 'easy', miles: 5,  description: 'Easy run 5 miles + 6x100m strides', hasStrength: false, estimatedMinutes: 50 },
      { day: 'Wednesday', date: '2026-04-08', type: 'easy', miles: 4,  description: 'Easy run 4 miles + Strength B', hasStrength: true,  estimatedMinutes: 75 },
      { day: 'Thursday',  date: '2026-04-09', type: 'easy', miles: 6,  description: 'Progression run 6 miles — first 4 easy, last 2 at 7:20-7:40/mi', hasStrength: false, estimatedMinutes: 50 },
      { day: 'Friday',    date: '2026-04-10', type: 'rest', miles: 0,  description: 'Full rest. Foam roll + mobility.', hasStrength: false, estimatedMinutes: 15 },
      { day: 'Saturday',  date: '2026-04-11', type: 'long', miles: 11, description: 'Long run 11 miles @ 7:30-8:00/mi. Easy, conversational. Take a gel at mile 7 to start practicing fueling.', hasStrength: false, estimatedMinutes: 86 },
      { day: 'Sunday',    date: '2026-04-12', type: 'easy', miles: 4,  description: 'Recovery run 4 miles + Strength C', hasStrength: true,  estimatedMinutes: 65 },
    ],
  },
  {
    week: 3, startDate: '2026-04-13', totalMiles: 37, isDownWeek: false,
    days: [
      { day: 'Monday',    date: '2026-04-13', type: 'easy', miles: 5,  description: 'Easy 5 miles + Strength A', hasStrength: true,  estimatedMinutes: 80 },
      { day: 'Tuesday',   date: '2026-04-14', type: 'easy', miles: 6,  description: 'Easy 6 miles + 6x100m strides', hasStrength: false, estimatedMinutes: 55 },
      { day: 'Wednesday', date: '2026-04-15', type: 'easy', miles: 4,  description: 'Easy 4 miles + Strength B', hasStrength: true,  estimatedMinutes: 75 },
      { day: 'Thursday',  date: '2026-04-16', type: 'easy', miles: 6,  description: 'Fartlek run 6 miles — 8x30s fast / 90s easy throughout (unstructured speed play)', hasStrength: false, estimatedMinutes: 50 },
      { day: 'Friday',    date: '2026-04-17', type: 'rest', miles: 0,  description: 'Rest. Foam roll + lacrosse ball work on calves.', hasStrength: false, estimatedMinutes: 15 },
      { day: 'Saturday',  date: '2026-04-18', type: 'long', miles: 12, description: 'Long run 12 miles @ 7:30-8:00/mi. Practice fueling: gel at 45min and 75min.', hasStrength: false, estimatedMinutes: 93 },
      { day: 'Sunday',    date: '2026-04-19', type: 'easy', miles: 4,  description: 'Recovery 4 miles + Strength C', hasStrength: true,  estimatedMinutes: 65 },
    ],
  },
  {
    week: 4, startDate: '2026-04-20', totalMiles: 26, isDownWeek: true,
    days: [
      { day: 'Monday',    date: '2026-04-20', type: 'easy', miles: 4, description: 'Easy 4 miles + Strength A (reduce all weights by 10-15% this week)', hasStrength: true,  estimatedMinutes: 70 },
      { day: 'Tuesday',   date: '2026-04-21', type: 'easy', miles: 4, description: 'Easy 4 miles + 4x100m strides (shorter strides session)', hasStrength: false, estimatedMinutes: 40 },
      { day: 'Wednesday', date: '2026-04-22', type: 'easy', miles: 3, description: 'Recovery 3 miles + Strength B (light)', hasStrength: true,  estimatedMinutes: 60 },
      { day: 'Thursday',  date: '2026-04-23', type: 'easy', miles: 4, description: 'Easy 4 miles, relaxed effort', hasStrength: false, estimatedMinutes: 34 },
      { day: 'Friday',    date: '2026-04-24', type: 'rest', miles: 0, description: 'Rest. Extra sleep. Full recovery protocol.', hasStrength: false, estimatedMinutes: 15 },
      { day: 'Saturday',  date: '2026-04-25', type: 'long', miles: 8, description: 'Easy long run 8 miles @ 7:50-8:10/mi. Keep it relaxed — this is a recovery week.', hasStrength: false, estimatedMinutes: 64 },
      { day: 'Sunday',    date: '2026-04-26', type: 'easy', miles: 3, description: 'Recovery 3 miles + Strength C (light)', hasStrength: true,  estimatedMinutes: 55 },
    ],
  },
  {
    week: 5, startDate: '2026-04-27', totalMiles: 40, isDownWeek: false,
    days: [
      { day: 'Monday',    date: '2026-04-27', type: 'easy', miles: 5,  description: 'Easy 5 miles + Strength A', hasStrength: true,  estimatedMinutes: 80 },
      { day: 'Tuesday',   date: '2026-04-28', type: 'easy', miles: 6,  description: 'Easy 6 miles + 8x100m strides', hasStrength: false, estimatedMinutes: 55 },
      { day: 'Wednesday', date: '2026-04-29', type: 'easy', miles: 5,  description: 'Easy 5 miles + Strength B', hasStrength: true,  estimatedMinutes: 80 },
      { day: 'Thursday',  date: '2026-04-30', type: 'easy', miles: 7,  description: 'Progression 7 miles — first 5 easy, last 2 at 7:15-7:35/mi', hasStrength: false, estimatedMinutes: 58 },
      { day: 'Friday',    date: '2026-05-01', type: 'rest', miles: 0,  description: 'Rest. Foam roll + mobility.', hasStrength: false, estimatedMinutes: 15 },
      { day: 'Saturday',  date: '2026-05-02', type: 'long', miles: 13, description: 'Long run 13 miles @ 7:30-7:50/mi. Fuel every 45 min.', hasStrength: false, estimatedMinutes: 100 },
      { day: 'Sunday',    date: '2026-05-03', type: 'easy', miles: 4,  description: 'Recovery 4 miles + Strength C', hasStrength: true,  estimatedMinutes: 65 },
    ],
  },
  {
    week: 6, startDate: '2026-05-04', totalMiles: 43, isDownWeek: false,
    days: [
      { day: 'Monday',    date: '2026-05-04', type: 'easy', miles: 5,  description: 'Easy 5 miles + Strength A', hasStrength: true,  estimatedMinutes: 80 },
      { day: 'Tuesday',   date: '2026-05-05', type: 'easy', miles: 7,  description: 'Easy 7 miles + 8x100m strides', hasStrength: false, estimatedMinutes: 60 },
      { day: 'Wednesday', date: '2026-05-06', type: 'easy', miles: 5,  description: 'Easy 5 miles + Strength B', hasStrength: true,  estimatedMinutes: 80 },
      { day: 'Thursday',  date: '2026-05-07', type: 'easy', miles: 7,  description: 'Fartlek 7 miles — 10x30s fast / 90s easy', hasStrength: false, estimatedMinutes: 58 },
      { day: 'Friday',    date: '2026-05-08', type: 'rest', miles: 0,  description: 'Rest + mobility.', hasStrength: false, estimatedMinutes: 15 },
      { day: 'Saturday',  date: '2026-05-09', type: 'long', miles: 14, description: 'Long run 14 miles @ 7:30-7:50/mi. Practice race-day fueling every 5K.', hasStrength: false, estimatedMinutes: 108 },
      { day: 'Sunday',    date: '2026-05-10', type: 'easy', miles: 5,  description: 'Recovery 5 miles + Strength C', hasStrength: true,  estimatedMinutes: 70 },
    ],
  },
  {
    week: 7, startDate: '2026-05-11', totalMiles: 43, isDownWeek: false,
    days: [
      { day: 'Monday',    date: '2026-05-11', type: 'easy', miles: 5,  description: 'Easy 5 miles + Strength A', hasStrength: true,  estimatedMinutes: 80 },
      { day: 'Tuesday',   date: '2026-05-12', type: 'easy', miles: 7,  description: 'Easy 7 miles + 8x100m strides', hasStrength: false, estimatedMinutes: 60 },
      { day: 'Wednesday', date: '2026-05-13', type: 'easy', miles: 5,  description: 'Easy 5 miles + Strength B', hasStrength: true,  estimatedMinutes: 80 },
      { day: 'Thursday',  date: '2026-05-14', type: 'easy', miles: 7,  description: 'Progression 7 miles — first 4 easy, miles 5-6 moderate, mile 7 at tempo effort (6:15-6:25)', hasStrength: false, estimatedMinutes: 58 },
      { day: 'Friday',    date: '2026-05-15', type: 'rest', miles: 0,  description: 'Rest. Focus on sleep and hydration.', hasStrength: false, estimatedMinutes: 15 },
      { day: 'Saturday',  date: '2026-05-16', type: 'long', miles: 14, description: 'Long run 14 miles @ 7:30-7:50/mi. Last 2 miles at marathon effort (6:30-6:40).', hasStrength: false, estimatedMinutes: 108 },
      { day: 'Sunday',    date: '2026-05-17', type: 'easy', miles: 5,  description: 'Recovery 5 miles + Strength C', hasStrength: true,  estimatedMinutes: 70 },
    ],
  },
  {
    week: 8, startDate: '2026-05-18', totalMiles: 32, isDownWeek: true,
    days: [
      { day: 'Monday',    date: '2026-05-18', type: 'easy', miles: 4,  description: 'Easy 4 miles + Strength A (light)', hasStrength: true,  estimatedMinutes: 70 },
      { day: 'Tuesday',   date: '2026-05-19', type: 'easy', miles: 5,  description: 'Easy 5 miles + 4x100m strides', hasStrength: false, estimatedMinutes: 45 },
      { day: 'Wednesday', date: '2026-05-20', type: 'easy', miles: 4,  description: 'Easy 4 miles + Strength B (light)', hasStrength: true,  estimatedMinutes: 70 },
      { day: 'Thursday',  date: '2026-05-21', type: 'easy', miles: 5,  description: 'Easy 5 miles, relaxed', hasStrength: false, estimatedMinutes: 42 },
      { day: 'Friday',    date: '2026-05-22', type: 'rest', miles: 0,  description: 'Rest. Recovery protocol.', hasStrength: false, estimatedMinutes: 15 },
      { day: 'Saturday',  date: '2026-05-23', type: 'long', miles: 10, description: 'Easy long run 10 miles. Down week — keep it very relaxed.', hasStrength: false, estimatedMinutes: 80 },
      { day: 'Sunday',    date: '2026-05-24', type: 'easy', miles: 4,  description: 'Recovery 4 miles + Strength C (light)', hasStrength: true,  estimatedMinutes: 60 },
    ],
  },
  {
    week: 9, startDate: '2026-05-25', totalMiles: 45, isDownWeek: false,
    days: [
      { day: 'Monday',    date: '2026-05-25', type: 'easy',  miles: 6,  description: 'Easy 6 miles + Strength A', hasStrength: true,  estimatedMinutes: 85 },
      { day: 'Tuesday',   date: '2026-05-26', type: 'easy',  miles: 7,  description: 'Easy 7 miles + 8x100m strides. Consider entering a 5K race this week or next.', hasStrength: false, estimatedMinutes: 60 },
      { day: 'Wednesday', date: '2026-05-27', type: 'easy',  miles: 5,  description: 'Easy 5 miles + Strength B', hasStrength: true,  estimatedMinutes: 80 },
      { day: 'Thursday',  date: '2026-05-28', type: 'tempo', miles: 7,  description: 'First real tempo! 7 miles total: 2mi warmup, 3mi @ 6:15-6:25/mi (tempo), 2mi cooldown. The tempo should feel comfortably hard — short phrases only.', hasStrength: false, estimatedMinutes: 56 },
      { day: 'Friday',    date: '2026-05-29', type: 'rest',  miles: 0,  description: 'Rest.', hasStrength: false, estimatedMinutes: 15 },
      { day: 'Saturday',  date: '2026-05-30', type: 'long',  miles: 15, description: 'Long run 15 miles @ 7:30-7:50/mi. Fuel every 45 min. This is your longest run yet — respect the distance.', hasStrength: false, estimatedMinutes: 115 },
      { day: 'Sunday',    date: '2026-05-31', type: 'easy',  miles: 5,  description: 'Recovery 5 miles + Strength C', hasStrength: true,  estimatedMinutes: 70 },
    ],
  },
  {
    week: 10, startDate: '2026-06-01', totalMiles: 47, isDownWeek: false,
    days: [
      { day: 'Monday',    date: '2026-06-01', type: 'easy',  miles: 6,  description: 'Easy 6 miles + Strength A. Race a 5K this week if available (goal: 20:00-20:30).', hasStrength: true,  estimatedMinutes: 85 },
      { day: 'Tuesday',   date: '2026-06-02', type: 'easy',  miles: 7,  description: 'Easy 7 miles + 8x100m strides', hasStrength: false, estimatedMinutes: 60 },
      { day: 'Wednesday', date: '2026-06-03', type: 'easy',  miles: 5,  description: 'Easy 5 miles + Strength B', hasStrength: true,  estimatedMinutes: 80 },
      { day: 'Thursday',  date: '2026-06-04', type: 'tempo', miles: 8,  description: 'Tempo 8 miles: 2mi warmup, 4mi @ 6:10-6:20/mi, 2mi cooldown', hasStrength: false, estimatedMinutes: 62 },
      { day: 'Friday',    date: '2026-06-05', type: 'rest',  miles: 0,  description: 'Rest. Phase 1 complete! You\'ve built your base. Celebrate.', hasStrength: false, estimatedMinutes: 15 },
      { day: 'Saturday',  date: '2026-06-06', type: 'long',  miles: 16, description: 'Long run 16 miles @ 7:20-7:50/mi. Last 3 miles at MP effort (6:30-6:40). Your longest run — big milestone!', hasStrength: false, estimatedMinutes: 122 },
      { day: 'Sunday',    date: '2026-06-07', type: 'easy',  miles: 5,  description: 'Recovery 5 miles + Strength C', hasStrength: true,  estimatedMinutes: 70 },
    ],
  },
];

// ============================================================
// PHASE 2: Speed + Heat (Weeks 11-20, June 8 - August 15, 2026)
// ============================================================
export const phase2Weeks: TrainingWeek[] = [
  {
    week: 11, startDate: '2026-06-08', totalMiles: 45, isDownWeek: false,
    days: [
      { day: 'Monday',    date: '2026-06-08', type: 'easy',      miles: 6,   description: 'Easy 6mi + Strength A (Phase 2: Front Squat 3x6, SL RDL 3x8/side, Box Jumps 3x6, Banded Clamshells 3x15/side, Anti-Rotation Press 3x10/side). Welcome to heat season — run by effort, not pace.', hasStrength: true,  estimatedMinutes: 80 },
      { day: 'Tuesday',   date: '2026-06-09', type: 'intervals', miles: 8,   description: 'INTERVALS: 8mi total — 2mi warmup, 4x1000m @ 5:50-6:00/mi (3:37-3:43 per 1K) w/ 90s jog recovery, 2mi cooldown. In heat: run by effort (Zone 5), accept slower splits. Treadmill OK if heat index >105°F.', hasStrength: false, estimatedMinutes: 65 },
      { day: 'Wednesday', date: '2026-06-10', type: 'recovery',  miles: 4,   description: 'Recovery 4 miles @ 8:30-9:00/mi. Zone 1-2 ONLY. This should feel absurdly easy.', hasStrength: false, estimatedMinutes: 36 },
      { day: 'Thursday',  date: '2026-06-11', type: 'tempo',     miles: 8,   description: 'TEMPO: 8mi total — 2mi warmup, 4mi @ 6:10-6:20/mi (or HR Zone 4), 2mi cooldown. Comfortably hard — short phrases only.', hasStrength: false, estimatedMinutes: 62 },
      { day: 'Friday',    date: '2026-06-12', type: 'rest',      miles: 0,   description: 'Rest + Strength B (Phase 2: Bulgarian Split Squat 3x8/leg, Hip Thrust 3x12, SL Calf Raises 3x12/side, Plank Variations 3x45s, Hanging Knee Raises 3x12)', hasStrength: true,  estimatedMinutes: 40 },
      { day: 'Saturday',  date: '2026-06-13', type: 'long',      miles: 14,  description: 'Long run 14mi @ easy effort (HR Zone 2). Start by 5:30 AM. Carry fluids + electrolytes. Fuel every 45min.', hasStrength: false, estimatedMinutes: 115 },
      { day: 'Sunday',    date: '2026-06-14', type: 'easy',      miles: 5,   description: 'Recovery 5mi @ 8:30-9:00/mi. Zone 2.', hasStrength: false, estimatedMinutes: 45 },
    ],
  },
  {
    week: 12, startDate: '2026-06-15', totalMiles: 47, isDownWeek: false,
    days: [
      { day: 'Monday',    date: '2026-06-15', type: 'easy',      miles: 6,  description: 'Easy 6mi + Strength A', hasStrength: true,  estimatedMinutes: 80 },
      { day: 'Tuesday',   date: '2026-06-16', type: 'intervals', miles: 9,  description: 'INTERVALS: 9mi — 2mi WU, 5x1000m @ 5:50/mi w/ 90s jog, 2mi CD', hasStrength: false, estimatedMinutes: 72 },
      { day: 'Wednesday', date: '2026-06-17', type: 'recovery',  miles: 4,  description: 'Recovery 4mi. Zone 1-2.', hasStrength: false, estimatedMinutes: 36 },
      { day: 'Thursday',  date: '2026-06-18', type: 'tempo',     miles: 9,  description: 'TEMPO: 9mi — 2mi WU, 5mi @ 6:10-6:20/mi, 2mi CD', hasStrength: false, estimatedMinutes: 68 },
      { day: 'Friday',    date: '2026-06-19', type: 'rest',      miles: 0,  description: 'Rest + Strength B', hasStrength: true,  estimatedMinutes: 40 },
      { day: 'Saturday',  date: '2026-06-20', type: 'long',      miles: 15, description: 'Long run 15mi easy. Last 3mi at MP effort by HR (Zone 3). Start early.', hasStrength: false, estimatedMinutes: 120 },
      { day: 'Sunday',    date: '2026-06-21', type: 'easy',      miles: 4,  description: 'Recovery 4mi', hasStrength: false, estimatedMinutes: 36 },
    ],
  },
  {
    week: 13, startDate: '2026-06-22', totalMiles: 49, isDownWeek: false,
    days: [
      { day: 'Monday',    date: '2026-06-22', type: 'easy',      miles: 6,  description: 'Easy 6mi + Strength A', hasStrength: true,  estimatedMinutes: 80 },
      { day: 'Tuesday',   date: '2026-06-23', type: 'intervals', miles: 9,  description: 'INTERVALS: 9mi — 2mi WU, 5x1000m @ 5:45-5:55/mi w/ 90s jog, 2mi CD. Heat is building — if heat index >100°F, do this on the treadmill.', hasStrength: false, estimatedMinutes: 72 },
      { day: 'Wednesday', date: '2026-06-24', type: 'recovery',  miles: 5,  description: 'Recovery 5mi. Truly easy.', hasStrength: false, estimatedMinutes: 45 },
      { day: 'Thursday',  date: '2026-06-25', type: 'tempo',     miles: 9,  description: 'Cruise intervals: 9mi — 2mi WU, 3x2mi @ 6:10/mi w/ 90s jog between, 1mi CD', hasStrength: false, estimatedMinutes: 68 },
      { day: 'Friday',    date: '2026-06-26', type: 'rest',      miles: 0,  description: 'Rest + Strength B', hasStrength: true,  estimatedMinutes: 40 },
      { day: 'Saturday',  date: '2026-06-27', type: 'long',      miles: 16, description: 'Long run 16mi easy effort. Start by 5:00 AM. Cap at 2:15 if extreme heat. Carry fluids.', hasStrength: false, estimatedMinutes: 128 },
      { day: 'Sunday',    date: '2026-06-28', type: 'easy',      miles: 4,  description: 'Recovery 4mi', hasStrength: false, estimatedMinutes: 36 },
    ],
  },
  {
    week: 14, startDate: '2026-06-29', totalMiles: 35, isDownWeek: true,
    days: [
      { day: 'Monday',    date: '2026-06-29', type: 'easy',     miles: 5,   description: 'Easy 5mi + Strength A (light)', hasStrength: true,  estimatedMinutes: 70 },
      { day: 'Tuesday',   date: '2026-06-30', type: 'easy',     miles: 5,   description: 'Easy 5mi + 4x100m strides', hasStrength: false, estimatedMinutes: 45 },
      { day: 'Wednesday', date: '2026-07-01', type: 'recovery', miles: 4,   description: 'Recovery 4mi', hasStrength: false, estimatedMinutes: 36 },
      { day: 'Thursday',  date: '2026-07-02', type: 'tempo',    miles: 6,   description: 'Light tempo: 6mi — 2mi WU, 2mi @ 6:20/mi, 2mi CD', hasStrength: false, estimatedMinutes: 46 },
      { day: 'Friday',    date: '2026-07-03', type: 'rest',     miles: 0,   description: 'Rest + Strength B (light)', hasStrength: true,  estimatedMinutes: 35 },
      { day: 'Saturday',  date: '2026-07-04', type: 'long',     miles: 10,  description: 'Easy 10mi — Fourth of July run. Keep it relaxed. Hydrate extra.', hasStrength: false, estimatedMinutes: 82 },
      { day: 'Sunday',    date: '2026-07-05', type: 'easy',     miles: 5,   description: 'Recovery 5mi', hasStrength: false, estimatedMinutes: 45 },
    ],
  },
  {
    week: 15, startDate: '2026-07-06', totalMiles: 50, isDownWeek: false,
    days: [
      { day: 'Monday',    date: '2026-07-06', type: 'easy',      miles: 6,  description: 'Easy 6mi + Strength A. Deep into heat season now. All easy running by HR Zone 2.', hasStrength: true,  estimatedMinutes: 80 },
      { day: 'Tuesday',   date: '2026-07-07', type: 'intervals', miles: 10, description: 'INTERVALS: 10mi — 2mi WU, 6x1000m @ 5:45-5:55/mi w/ 90s jog, 2mi CD. Treadmill strongly recommended if heat index >100°F.', hasStrength: false, estimatedMinutes: 78 },
      { day: 'Wednesday', date: '2026-07-08', type: 'recovery',  miles: 5,  description: 'Recovery 5mi. Zone 1-2.', hasStrength: false, estimatedMinutes: 45 },
      { day: 'Thursday',  date: '2026-07-09', type: 'tempo',     miles: 9,  description: 'TEMPO: 9mi — 2mi WU, 5mi @ LT (6:10-6:20/mi or HR Zone 4), 2mi CD', hasStrength: false, estimatedMinutes: 68 },
      { day: 'Friday',    date: '2026-07-10', type: 'rest',      miles: 0,  description: 'Rest + Strength B', hasStrength: true,  estimatedMinutes: 40 },
      { day: 'Saturday',  date: '2026-07-11', type: 'long',      miles: 16, description: 'Long run 16mi. All easy. Start 5:00 AM. Carry 24oz+ fluids. Electrolytes mandatory.', hasStrength: false, estimatedMinutes: 130 },
      { day: 'Sunday',    date: '2026-07-12', type: 'easy',      miles: 4,  description: 'Recovery 4mi', hasStrength: false, estimatedMinutes: 36 },
    ],
  },
  {
    week: 16, startDate: '2026-07-13', totalMiles: 51, isDownWeek: false,
    days: [
      { day: 'Monday',    date: '2026-07-13', type: 'easy',      miles: 7,  description: 'Easy 7mi + Strength A', hasStrength: true,  estimatedMinutes: 85 },
      { day: 'Tuesday',   date: '2026-07-14', type: 'intervals', miles: 10, description: 'INTERVALS: 10mi — 2mi WU, 6x1000m @ 5:45/mi w/ 90s jog, 2mi CD', hasStrength: false, estimatedMinutes: 78 },
      { day: 'Wednesday', date: '2026-07-15', type: 'recovery',  miles: 5,  description: 'Recovery 5mi', hasStrength: false, estimatedMinutes: 45 },
      { day: 'Thursday',  date: '2026-07-16', type: 'tempo',     miles: 9,  description: 'Cruise intervals: 3x2mi @ 6:10/mi w/ 90s jog. 2mi WU + 1mi CD.', hasStrength: false, estimatedMinutes: 68 },
      { day: 'Friday',    date: '2026-07-17', type: 'rest',      miles: 0,  description: 'Rest + Strength B', hasStrength: true,  estimatedMinutes: 40 },
      { day: 'Saturday',  date: '2026-07-18', type: 'long',      miles: 17, description: 'Long run 17mi. Easy with last 3mi at MP effort (HR Zone 3). If 10K race available late July — consider racing as heat fitness check.', hasStrength: false, estimatedMinutes: 135 },
      { day: 'Sunday',    date: '2026-07-19', type: 'easy',      miles: 3,  description: 'Recovery 3mi', hasStrength: false, estimatedMinutes: 27 },
    ],
  },
  {
    week: 17, startDate: '2026-07-20', totalMiles: 52, isDownWeek: false,
    days: [
      { day: 'Monday',    date: '2026-07-20', type: 'easy',      miles: 7,  description: 'Easy 7mi + Strength A', hasStrength: true,  estimatedMinutes: 85 },
      { day: 'Tuesday',   date: '2026-07-21', type: 'intervals', miles: 10, description: 'INTERVALS: 10mi — 2mi WU, 3x1600m @ 5:50/mi (5:50 per mile = 5:47 per 1600) w/ 2min jog, 2mi CD. Longer reps this week.', hasStrength: false, estimatedMinutes: 78 },
      { day: 'Wednesday', date: '2026-07-22', type: 'recovery',  miles: 5,  description: 'Recovery 5mi', hasStrength: false, estimatedMinutes: 45 },
      { day: 'Thursday',  date: '2026-07-23', type: 'tempo',     miles: 10, description: 'TEMPO: 10mi — 2mi WU, 6mi @ 6:10-6:15/mi, 2mi CD. Longest tempo yet.', hasStrength: false, estimatedMinutes: 75 },
      { day: 'Friday',    date: '2026-07-24', type: 'rest',      miles: 0,  description: 'Rest + Strength B', hasStrength: true,  estimatedMinutes: 40 },
      { day: 'Saturday',  date: '2026-07-25', type: 'long',      miles: 17, description: 'Long run 17mi easy effort. Full heat protocol — early start, fluids, electrolytes.', hasStrength: false, estimatedMinutes: 135 },
      { day: 'Sunday',    date: '2026-07-26', type: 'easy',      miles: 3,  description: 'Recovery 3mi', hasStrength: false, estimatedMinutes: 27 },
    ],
  },
  {
    week: 18, startDate: '2026-07-27', totalMiles: 36, isDownWeek: true,
    days: [
      { day: 'Monday',    date: '2026-07-27', type: 'easy',      miles: 5,   description: 'Easy 5mi + Strength A (light)', hasStrength: true,  estimatedMinutes: 70 },
      { day: 'Tuesday',   date: '2026-07-28', type: 'intervals', miles: 7,   description: 'Light speed: 7mi — 2mi WU, 4x800m @ 5:45/mi w/ 90s jog, 2mi CD', hasStrength: false, estimatedMinutes: 55 },
      { day: 'Wednesday', date: '2026-07-29', type: 'recovery',  miles: 4,   description: 'Recovery 4mi', hasStrength: false, estimatedMinutes: 36 },
      { day: 'Thursday',  date: '2026-07-30', type: 'easy',      miles: 5,   description: 'Easy 5mi. If racing a 10K this weekend, keep this very light.', hasStrength: false, estimatedMinutes: 42 },
      { day: 'Friday',    date: '2026-07-31', type: 'rest',      miles: 0,   description: 'Rest + Strength B (light). Pre-race if 10K tomorrow.', hasStrength: true,  estimatedMinutes: 35 },
      { day: 'Saturday',  date: '2026-08-01', type: 'race',      miles: 6.2, description: '🏁 10K TUNE-UP RACE — Goal: 41:30-42:30 (6:41-6:51/mi). This is a heat fitness check. Expect slower than cool-weather potential. Focus on effort and racing competitiveness. Warm up 2mi, race 6.2mi.', hasStrength: false, estimatedMinutes: 62 },
      { day: 'Sunday',    date: '2026-08-02', type: 'easy',      miles: 4,   description: 'Recovery 4mi — shake out race legs', hasStrength: false, estimatedMinutes: 36 },
    ],
  },
  {
    week: 19, startDate: '2026-08-03', totalMiles: 53, isDownWeek: false,
    days: [
      { day: 'Monday',    date: '2026-08-03', type: 'easy',      miles: 7,  description: 'Easy 7mi + Strength A. Last few weeks of peak heat. The payoff is coming.', hasStrength: true,  estimatedMinutes: 85 },
      { day: 'Tuesday',   date: '2026-08-04', type: 'intervals', miles: 10, description: 'INTERVALS: 10mi — 2mi WU, 4x1200m @ 5:45/mi w/ 2min jog, 2mi CD', hasStrength: false, estimatedMinutes: 78 },
      { day: 'Wednesday', date: '2026-08-05', type: 'recovery',  miles: 5,  description: 'Recovery 5mi', hasStrength: false, estimatedMinutes: 45 },
      { day: 'Thursday',  date: '2026-08-06', type: 'tempo',     miles: 10, description: 'TEMPO: 10mi — 2mi WU, 6mi @ 6:10/mi, 2mi CD', hasStrength: false, estimatedMinutes: 75 },
      { day: 'Friday',    date: '2026-08-07', type: 'rest',      miles: 0,  description: 'Rest + Strength B', hasStrength: true,  estimatedMinutes: 40 },
      { day: 'Saturday',  date: '2026-08-08', type: 'long',      miles: 18, description: 'Long run 18mi — last 4mi at MP effort (HR Zone 3). Peak long run for Phase 2. Start at 5:00 AM.', hasStrength: false, estimatedMinutes: 142 },
      { day: 'Sunday',    date: '2026-08-09', type: 'easy',      miles: 3,  description: 'Recovery 3mi', hasStrength: false, estimatedMinutes: 27 },
    ],
  },
  {
    week: 20, startDate: '2026-08-10', totalMiles: 55, isDownWeek: false,
    days: [
      { day: 'Monday',    date: '2026-08-10', type: 'easy',      miles: 7,  description: 'Easy 7mi + Strength A. Final week of Phase 2. Temps starting to break soon.', hasStrength: true,  estimatedMinutes: 85 },
      { day: 'Tuesday',   date: '2026-08-11', type: 'intervals', miles: 10, description: 'INTERVALS: 10mi — 2mi WU, 6x1000m @ 5:45/mi w/ 90s jog, 2mi CD. Best effort of the summer.', hasStrength: false, estimatedMinutes: 78 },
      { day: 'Wednesday', date: '2026-08-12', type: 'recovery',  miles: 5,  description: 'Recovery 5mi', hasStrength: false, estimatedMinutes: 45 },
      { day: 'Thursday',  date: '2026-08-13', type: 'tempo',     miles: 10, description: 'TEMPO: 10mi — 2mi WU, 6mi @ 6:05-6:15/mi (pushing the pace slightly), 2mi CD', hasStrength: false, estimatedMinutes: 75 },
      { day: 'Friday',    date: '2026-08-14', type: 'rest',      miles: 0,  description: 'Rest + Strength B. Phase 2 complete! You survived the heat. The gains are banked.', hasStrength: true,  estimatedMinutes: 40 },
      { day: 'Saturday',  date: '2026-08-15', type: 'long',      miles: 18, description: 'Long run 18mi easy. Last 3mi at MP effort. Final Phase 2 long run.', hasStrength: false, estimatedMinutes: 142 },
      { day: 'Sunday',    date: '2026-08-16', type: 'easy',      miles: 5,  description: 'Recovery 5mi. Tomorrow Phase 3 begins — this is where BQs are made.', hasStrength: false, estimatedMinutes: 45 },
    ],
  },
];

// ============================================================
// PHASE 3: Marathon Specific (Weeks 21-36, August 16 - November 28, 2026)
// Pattern: Mon easy+strength, Tue MP/tempo quality, Wed easy/recovery, Thu intervals/tempo alt, Fri rest+strength, Sat LONG RUN, Sun easy
// ============================================================
export const phase3Weeks: TrainingWeek[] = [
  {
    week: 21, startDate: '2026-08-17', totalMiles: 55, isDownWeek: false,
    days: [
      { day: 'Monday',    date: '2026-08-17', type: 'easy',      miles: 7,  description: 'Easy 7mi + Strength A (Phase 3: Back Squat 3x5 RPE 6-7, SL RDL 3x8/side, Weighted Step-Ups 3x8/side, Core circuit 2 rounds). Phase 3 starts — heat starting to break, paces will improve.', hasStrength: true,  estimatedMinutes: 85 },
      { day: 'Tuesday',   date: '2026-08-18', type: 'tempo',     miles: 11, description: 'MP run 11mi: 2mi WU, 7mi @ 6:25-6:35/mi (marathon pace), 2mi CD. Cooldown temps make this feel good.', hasStrength: false, estimatedMinutes: 82 },
      { day: 'Wednesday', date: '2026-08-19', type: 'easy',      miles: 6,  description: 'Easy 6mi recovery. Zone 2.', hasStrength: false, estimatedMinutes: 50 },
      { day: 'Thursday',  date: '2026-08-20', type: 'intervals', miles: 9,  description: 'INTERVALS: 9mi — 2mi WU, 5x1000m @ 5:45/mi w/ 90s jog, 2mi CD', hasStrength: false, estimatedMinutes: 70 },
      { day: 'Friday',    date: '2026-08-21', type: 'rest',      miles: 0,  description: 'Rest + Strength B (Phase 3: Hip Thrust 3x10, Clamshells + Monster Walks 2x15/side, SL Calf Raises 3x15, Copenhagen Plank 2x20s/side, Pallof Press 2x12/side)', hasStrength: true,  estimatedMinutes: 40 },
      { day: 'Saturday',  date: '2026-08-22', type: 'long',      miles: 16, description: 'Long run 16mi @ 7:20-7:50/mi. Last 4mi @ MP (6:25-6:35/mi). Heat starting to break — enjoy the cooler air.', hasStrength: false, estimatedMinutes: 125 },
      { day: 'Sunday',    date: '2026-08-23', type: 'easy',      miles: 6,  description: 'Easy 6mi recovery.', hasStrength: false, estimatedMinutes: 50 },
    ],
  },
  {
    week: 22, startDate: '2026-08-24', totalMiles: 57, isDownWeek: false,
    days: [
      { day: 'Monday',    date: '2026-08-24', type: 'easy',      miles: 7,  description: 'Easy 7mi + Strength A', hasStrength: true,  estimatedMinutes: 85 },
      { day: 'Tuesday',   date: '2026-08-25', type: 'tempo',     miles: 11, description: 'MP run 11mi: 2mi WU, 7mi @ 6:29/mi (goal marathon pace), 2mi CD', hasStrength: false, estimatedMinutes: 82 },
      { day: 'Wednesday', date: '2026-08-26', type: 'easy',      miles: 7,  description: 'Easy 7mi recovery', hasStrength: false, estimatedMinutes: 58 },
      { day: 'Thursday',  date: '2026-08-27', type: 'tempo',     miles: 9,  description: 'Tempo 9mi: 2mi WU, 5mi @ 6:10-6:15/mi, 2mi CD', hasStrength: false, estimatedMinutes: 68 },
      { day: 'Friday',    date: '2026-08-28', type: 'rest',      miles: 0,  description: 'Rest + Strength B', hasStrength: true,  estimatedMinutes: 40 },
      { day: 'Saturday',  date: '2026-08-29', type: 'long',      miles: 17, description: 'Long run 17mi easy throughout. Focus on aerobic volume.', hasStrength: false, estimatedMinutes: 132 },
      { day: 'Sunday',    date: '2026-08-30', type: 'easy',      miles: 6,  description: 'Easy 6mi recovery', hasStrength: false, estimatedMinutes: 50 },
    ],
  },
  {
    week: 23, startDate: '2026-08-31', totalMiles: 58, isDownWeek: false,
    days: [
      { day: 'Monday',    date: '2026-08-31', type: 'easy',      miles: 7,  description: 'Easy 7mi + Strength A', hasStrength: true,  estimatedMinutes: 85 },
      { day: 'Tuesday',   date: '2026-09-01', type: 'tempo',     miles: 10, description: 'MP run 10mi: 2mi WU, 6mi @ 6:29/mi, 2mi CD', hasStrength: false, estimatedMinutes: 76 },
      { day: 'Wednesday', date: '2026-09-02', type: 'easy',      miles: 6,  description: 'Easy 6mi', hasStrength: false, estimatedMinutes: 50 },
      { day: 'Thursday',  date: '2026-09-03', type: 'intervals', miles: 9,  description: 'INTERVALS: 9mi — 2mi WU, 5x1000m @ 5:45/mi w/ 90s jog, 2mi CD', hasStrength: false, estimatedMinutes: 70 },
      { day: 'Friday',    date: '2026-09-04', type: 'rest',      miles: 0,  description: 'Rest + Strength B', hasStrength: true,  estimatedMinutes: 40 },
      { day: 'Saturday',  date: '2026-09-05', type: 'long',      miles: 18, description: 'Long run 18mi: First 12mi easy, miles 13-18 @ MP (6:29/mi). First major MP long run — huge training stimulus.', hasStrength: false, estimatedMinutes: 140 },
      { day: 'Sunday',    date: '2026-09-06', type: 'easy',      miles: 8,  description: 'Easy 8mi recovery', hasStrength: false, estimatedMinutes: 66 },
    ],
  },
  {
    week: 24, startDate: '2026-09-07', totalMiles: 42, isDownWeek: true,
    days: [
      { day: 'Monday',    date: '2026-09-07', type: 'easy',  miles: 6,  description: 'Easy 6mi + Strength A (light). Down week — let the body absorb the training.', hasStrength: true,  estimatedMinutes: 75 },
      { day: 'Tuesday',   date: '2026-09-08', type: 'tempo', miles: 8,  description: 'Easy MP run 8mi: 2mi WU, 4mi @ 6:35/mi (relaxed MP), 2mi CD', hasStrength: false, estimatedMinutes: 62 },
      { day: 'Wednesday', date: '2026-09-09', type: 'easy',  miles: 5,  description: 'Easy 5mi recovery', hasStrength: false, estimatedMinutes: 42 },
      { day: 'Thursday',  date: '2026-09-10', type: 'easy',  miles: 6,  description: 'Easy 6mi + 6x100m strides', hasStrength: false, estimatedMinutes: 52 },
      { day: 'Friday',    date: '2026-09-11', type: 'rest',  miles: 0,  description: 'Rest + Strength B (light)', hasStrength: true,  estimatedMinutes: 35 },
      { day: 'Saturday',  date: '2026-09-12', type: 'long',  miles: 12, description: 'Easy long run 12mi. Down week — keep it truly easy.', hasStrength: false, estimatedMinutes: 95 },
      { day: 'Sunday',    date: '2026-09-13', type: 'easy',  miles: 5,  description: 'Easy 5mi recovery', hasStrength: false, estimatedMinutes: 42 },
    ],
  },
  {
    week: 25, startDate: '2026-09-14', totalMiles: 58, isDownWeek: false,
    days: [
      { day: 'Monday',    date: '2026-09-14', type: 'easy',      miles: 7,  description: 'Easy 7mi + Strength A. Refreshed after down week — ready to attack.', hasStrength: true,  estimatedMinutes: 85 },
      { day: 'Tuesday',   date: '2026-09-15', type: 'tempo',     miles: 12, description: 'MP run 12mi: 2mi WU, 8mi @ 6:29/mi, 2mi CD', hasStrength: false, estimatedMinutes: 89 },
      { day: 'Wednesday', date: '2026-09-16', type: 'easy',      miles: 6,  description: 'Easy 6mi', hasStrength: false, estimatedMinutes: 50 },
      { day: 'Thursday',  date: '2026-09-17', type: 'tempo',     miles: 9,  description: 'Cruise intervals: 9mi — 2mi WU, 3x2mi @ 6:10/mi w/ 90s jog, 1mi CD', hasStrength: false, estimatedMinutes: 68 },
      { day: 'Friday',    date: '2026-09-18', type: 'rest',      miles: 0,  description: 'Rest + Strength B', hasStrength: true,  estimatedMinutes: 40 },
      { day: 'Saturday',  date: '2026-09-19', type: 'long',      miles: 18, description: 'Long run 18mi: Easy first 12mi, last 6mi @ MP (6:29/mi). Fall temps — run the target pace for real.', hasStrength: false, estimatedMinutes: 140 },
      { day: 'Sunday',    date: '2026-09-20', type: 'easy',      miles: 6,  description: 'Easy 6mi recovery', hasStrength: false, estimatedMinutes: 50 },
    ],
  },
  {
    week: 26, startDate: '2026-09-21', totalMiles: 60, isDownWeek: false,
    days: [
      { day: 'Monday',    date: '2026-09-21', type: 'easy',      miles: 7,  description: 'Easy 7mi + Strength A. Cool mornings arriving — feel the heat acclimatization payoff in your paces.', hasStrength: true,  estimatedMinutes: 85 },
      { day: 'Tuesday',   date: '2026-09-22', type: 'tempo',     miles: 12, description: 'MP run 12mi: 2mi WU, 8mi @ 6:27-6:32/mi (targeting slightly under goal MP), 2mi CD', hasStrength: false, estimatedMinutes: 89 },
      { day: 'Wednesday', date: '2026-09-23', type: 'easy',      miles: 7,  description: 'Easy 7mi', hasStrength: false, estimatedMinutes: 58 },
      { day: 'Thursday',  date: '2026-09-24', type: 'intervals', miles: 10, description: 'INTERVALS: 10mi — 2mi WU, 3x2000m @ 5:45/mi w/ 2min jog, 2mi CD', hasStrength: false, estimatedMinutes: 76 },
      { day: 'Friday',    date: '2026-09-25', type: 'rest',      miles: 0,  description: 'Rest + Strength B', hasStrength: true,  estimatedMinutes: 40 },
      { day: 'Saturday',  date: '2026-09-26', type: 'long',      miles: 19, description: 'Long run 19mi: Easy mi 1-10, miles 11-17 @ MP (7mi of MP work), easy mi 18-19. This is a big session.', hasStrength: false, estimatedMinutes: 147 },
      { day: 'Sunday',    date: '2026-09-27', type: 'easy',      miles: 5,  description: 'Easy 5mi recovery', hasStrength: false, estimatedMinutes: 42 },
    ],
  },
  {
    week: 27, startDate: '2026-09-28', totalMiles: 62, isDownWeek: false,
    days: [
      { day: 'Monday',    date: '2026-09-28', type: 'easy',      miles: 8,  description: 'Easy 8mi + Strength A', hasStrength: true,  estimatedMinutes: 90 },
      { day: 'Tuesday',   date: '2026-09-29', type: 'tempo',     miles: 12, description: 'MP run 12mi: 2mi WU, 8mi @ 6:29/mi, 2mi CD', hasStrength: false, estimatedMinutes: 89 },
      { day: 'Wednesday', date: '2026-09-30', type: 'easy',      miles: 7,  description: 'Easy 7mi', hasStrength: false, estimatedMinutes: 58 },
      { day: 'Thursday',  date: '2026-10-01', type: 'tempo',     miles: 9,  description: 'Tempo 9mi: 2mi WU, 5mi @ 6:05-6:15/mi, 2mi CD', hasStrength: false, estimatedMinutes: 68 },
      { day: 'Friday',    date: '2026-10-02', type: 'rest',      miles: 0,  description: 'Rest + Strength B', hasStrength: true,  estimatedMinutes: 40 },
      { day: 'Saturday',  date: '2026-10-03', type: 'long',      miles: 20, description: '⭐ FIRST 20-MILER! 20mi easy effort throughout @ 7:30-8:00/mi. This is a MILESTONE. Fuel every 45min. Celebrate after.', hasStrength: false, estimatedMinutes: 155 },
      { day: 'Sunday',    date: '2026-10-04', type: 'easy',      miles: 6,  description: 'Easy 6mi recovery — you are officially a marathon training machine.', hasStrength: false, estimatedMinutes: 50 },
    ],
  },
  {
    week: 28, startDate: '2026-10-05', totalMiles: 45, isDownWeek: true,
    days: [
      { day: 'Monday',    date: '2026-10-05', type: 'easy',  miles: 6,  description: 'Easy 6mi + Strength A (light). Down week after the 20-miler.', hasStrength: true,  estimatedMinutes: 75 },
      { day: 'Tuesday',   date: '2026-10-06', type: 'tempo', miles: 8,  description: 'Easy tempo 8mi: 2mi WU, 4mi @ 6:35/mi (relaxed MP), 2mi CD', hasStrength: false, estimatedMinutes: 62 },
      { day: 'Wednesday', date: '2026-10-07', type: 'easy',  miles: 5,  description: 'Easy 5mi', hasStrength: false, estimatedMinutes: 42 },
      { day: 'Thursday',  date: '2026-10-08', type: 'easy',  miles: 7,  description: 'Easy 7mi + 6x100m strides', hasStrength: false, estimatedMinutes: 60 },
      { day: 'Friday',    date: '2026-10-09', type: 'rest',  miles: 0,  description: 'Rest + Strength B (light)', hasStrength: true,  estimatedMinutes: 35 },
      { day: 'Saturday',  date: '2026-10-10', type: 'long',  miles: 14, description: 'Easy long run 14mi. Let the legs bounce back.', hasStrength: false, estimatedMinutes: 110 },
      { day: 'Sunday',    date: '2026-10-11', type: 'easy',  miles: 5,  description: 'Easy 5mi recovery', hasStrength: false, estimatedMinutes: 42 },
    ],
  },
  {
    week: 29, startDate: '2026-10-12', totalMiles: 55, isDownWeek: false,
    days: [
      { day: 'Monday',    date: '2026-10-12', type: 'easy',  miles: 5,  description: 'Easy 5mi + light strength. Half marathon race week — taper slightly.', hasStrength: true,  estimatedMinutes: 70 },
      { day: 'Tuesday',   date: '2026-10-13', type: 'easy',  miles: 6,  description: 'Easy 6mi + 4x100m strides. Keep it light.', hasStrength: false, estimatedMinutes: 52 },
      { day: 'Wednesday', date: '2026-10-14', type: 'easy',  miles: 4,  description: 'Easy 4mi. Very relaxed.', hasStrength: false, estimatedMinutes: 34 },
      { day: 'Thursday',  date: '2026-10-15', type: 'easy',  miles: 3,  description: 'Easy 3mi + 4x100m strides (pre-race shakeout).', hasStrength: false, estimatedMinutes: 28 },
      { day: 'Friday',    date: '2026-10-16', type: 'rest',  miles: 0,  description: 'REST. Stay off your feet. Hydrate. Carb up. Sleep early.', hasStrength: false, estimatedMinutes: 10 },
      { day: 'Saturday',  date: '2026-10-17', type: 'easy',  miles: 3,  description: 'Easy 3mi shakeout + 4x100m strides. Race is tomorrow!', hasStrength: false, estimatedMinutes: 28 },
      { day: 'Sunday',    date: '2026-10-18', type: 'race',  miles: 13.1, description: '🏁 HALF MARATHON RACE — Goal: 1:22-1:24 (6:17-6:24/mi). THE fitness checkpoint. 1:23 = sub-2:50 predicted. Go get it. Negative split — hold back first half.', hasStrength: false, estimatedMinutes: 84 },
    ],
  },
  {
    week: 30, startDate: '2026-10-19', totalMiles: 62, isDownWeek: false,
    days: [
      { day: 'Monday',    date: '2026-10-19', type: 'easy',      miles: 7,  description: 'Easy 7mi + Strength A. Post-half recovery — let the race effort settle.', hasStrength: true,  estimatedMinutes: 85 },
      { day: 'Tuesday',   date: '2026-10-20', type: 'tempo',     miles: 12, description: 'MP run 12mi: 2mi WU, 8mi @ 6:29/mi, 2mi CD. Fitness from the half should make this feel easier than before.', hasStrength: false, estimatedMinutes: 89 },
      { day: 'Wednesday', date: '2026-10-21', type: 'easy',      miles: 7,  description: 'Easy 7mi', hasStrength: false, estimatedMinutes: 58 },
      { day: 'Thursday',  date: '2026-10-22', type: 'intervals', miles: 10, description: 'INTERVALS: 10mi — 2mi WU, 6x1000m @ 5:40/mi w/ 90s jog, 2mi CD. Half-race fitness on display.', hasStrength: false, estimatedMinutes: 76 },
      { day: 'Friday',    date: '2026-10-23', type: 'rest',      miles: 0,  description: 'Rest + Strength B', hasStrength: true,  estimatedMinutes: 40 },
      { day: 'Saturday',  date: '2026-10-24', type: 'long',      miles: 18, description: 'Long run 18mi: Easy mi 1-8, miles 9-16 @ MP (8mi), easy mi 17-18. Excellent fitness test.', hasStrength: false, estimatedMinutes: 140 },
      { day: 'Sunday',    date: '2026-10-25', type: 'easy',      miles: 8,  description: 'Easy 8mi recovery', hasStrength: false, estimatedMinutes: 66 },
    ],
  },
  {
    week: 31, startDate: '2026-10-26', totalMiles: 65, isDownWeek: false,
    days: [
      { day: 'Monday',    date: '2026-10-26', type: 'easy',      miles: 8,  description: 'Easy 8mi + Strength A', hasStrength: true,  estimatedMinutes: 90 },
      { day: 'Tuesday',   date: '2026-10-27', type: 'tempo',     miles: 12, description: 'MP run 12mi: 2mi WU, 8mi @ 6:27-6:32/mi, 2mi CD', hasStrength: false, estimatedMinutes: 89 },
      { day: 'Wednesday', date: '2026-10-28', type: 'easy',      miles: 7,  description: 'Easy 7mi', hasStrength: false, estimatedMinutes: 58 },
      { day: 'Thursday',  date: '2026-10-29', type: 'tempo',     miles: 10, description: 'Tempo 10mi: 2mi WU, 6mi @ 6:05-6:10/mi, 2mi CD. Best tempo effort yet.', hasStrength: false, estimatedMinutes: 75 },
      { day: 'Friday',    date: '2026-10-30', type: 'rest',      miles: 0,  description: 'Rest + Strength B', hasStrength: true,  estimatedMinutes: 40 },
      { day: 'Saturday',  date: '2026-10-31', type: 'long',      miles: 20, description: 'Long run 20mi: Easy first 12mi, last 8mi @ MP (6:29/mi). Halloween long run! Biggest MP long run yet.', hasStrength: false, estimatedMinutes: 155 },
      { day: 'Sunday',    date: '2026-11-01', type: 'easy',      miles: 8,  description: 'Easy 8mi recovery', hasStrength: false, estimatedMinutes: 66 },
    ],
  },
  {
    week: 32, startDate: '2026-11-02', totalMiles: 48, isDownWeek: true,
    days: [
      { day: 'Monday',    date: '2026-11-02', type: 'easy',  miles: 6,  description: 'Easy 6mi + Strength A (light). Down week — absorb the training block.', hasStrength: true,  estimatedMinutes: 75 },
      { day: 'Tuesday',   date: '2026-11-03', type: 'tempo', miles: 8,  description: 'MP run 8mi: 2mi WU, 4mi @ 6:32/mi, 2mi CD', hasStrength: false, estimatedMinutes: 62 },
      { day: 'Wednesday', date: '2026-11-04', type: 'easy',  miles: 6,  description: 'Easy 6mi', hasStrength: false, estimatedMinutes: 50 },
      { day: 'Thursday',  date: '2026-11-05', type: 'easy',  miles: 7,  description: 'Easy 7mi + 6x100m strides', hasStrength: false, estimatedMinutes: 60 },
      { day: 'Friday',    date: '2026-11-06', type: 'rest',  miles: 0,  description: 'Rest + Strength B (light)', hasStrength: true,  estimatedMinutes: 35 },
      { day: 'Saturday',  date: '2026-11-07', type: 'long',  miles: 14, description: 'Easy long run 14mi. Down week — keep it honest but controlled.', hasStrength: false, estimatedMinutes: 110 },
      { day: 'Sunday',    date: '2026-11-08', type: 'easy',  miles: 7,  description: 'Easy 7mi recovery', hasStrength: false, estimatedMinutes: 58 },
    ],
  },
  {
    week: 33, startDate: '2026-11-09', totalMiles: 65, isDownWeek: false,
    days: [
      { day: 'Monday',    date: '2026-11-09', type: 'easy',      miles: 8,  description: 'Easy 8mi + Strength A. Final high-volume block begins.', hasStrength: true,  estimatedMinutes: 90 },
      { day: 'Tuesday',   date: '2026-11-10', type: 'tempo',     miles: 12, description: 'MP run 12mi: 2mi WU, 8mi @ 6:27-6:30/mi (sharper MP), 2mi CD', hasStrength: false, estimatedMinutes: 89 },
      { day: 'Wednesday', date: '2026-11-11', type: 'easy',      miles: 7,  description: 'Easy 7mi', hasStrength: false, estimatedMinutes: 58 },
      { day: 'Thursday',  date: '2026-11-12', type: 'intervals', miles: 10, description: 'INTERVALS: 10mi — 2mi WU, 4x1600m @ 5:45/mi w/ 2min jog, 2mi CD. Focus on form at speed.', hasStrength: false, estimatedMinutes: 76 },
      { day: 'Friday',    date: '2026-11-13', type: 'rest',      miles: 0,  description: 'Rest + Strength B', hasStrength: true,  estimatedMinutes: 40 },
      { day: 'Saturday',  date: '2026-11-14', type: 'long',      miles: 20, description: 'Long run 20mi: Easy mi 1-6, miles 7-18 @ MP (12mi MP work!), easy mi 19-20. Biggest MP session of the entire plan. Execute this well.', hasStrength: false, estimatedMinutes: 155 },
      { day: 'Sunday',    date: '2026-11-15', type: 'easy',      miles: 8,  description: 'Easy 8mi recovery. You are ready for Houston.', hasStrength: false, estimatedMinutes: 66 },
    ],
  },
  {
    week: 34, startDate: '2026-11-16', totalMiles: 70, isDownWeek: false,
    days: [
      { day: 'Monday',    date: '2026-11-16', type: 'easy',      miles: 9,  description: '⭐ PEAK WEEK begins. Easy 9mi + Strength A. This is the summit of training.', hasStrength: true,  estimatedMinutes: 95 },
      { day: 'Tuesday',   date: '2026-11-17', type: 'tempo',     miles: 12, description: 'MP run 12mi: 2mi WU, 8mi @ 6:25-6:30/mi (race pace!), 2mi CD. Targeting 70 miles this week.', hasStrength: false, estimatedMinutes: 89 },
      { day: 'Wednesday', date: '2026-11-18', type: 'easy',      miles: 8,  description: 'Easy 8mi', hasStrength: false, estimatedMinutes: 66 },
      { day: 'Thursday',  date: '2026-11-19', type: 'tempo',     miles: 11, description: 'Tempo 11mi: 2mi WU, 7mi @ 6:05-6:10/mi, 2mi CD. Peak tempo session.', hasStrength: false, estimatedMinutes: 82 },
      { day: 'Friday',    date: '2026-11-20', type: 'rest',      miles: 0,  description: 'Rest + Strength B. Take care of yourself today.', hasStrength: true,  estimatedMinutes: 40 },
      { day: 'Saturday',  date: '2026-11-21', type: 'long',      miles: 22, description: '⭐ CAPSTONE WORKOUT: 22mi — Easy mi 1-8, miles 9-18 @ MP (10mi at race pace!), easy mi 19-22. This is the hardest workout of the entire 51-week plan. Completing this means sub-2:50 is within reach.', hasStrength: false, estimatedMinutes: 170 },
      { day: 'Sunday',    date: '2026-11-22', type: 'easy',      miles: 8,  description: 'Easy 8mi. You\'ve done the work. Now the taper begins.', hasStrength: false, estimatedMinutes: 66 },
    ],
  },
  {
    week: 35, startDate: '2026-11-23', totalMiles: 65, isDownWeek: false,
    days: [
      { day: 'Monday',    date: '2026-11-23', type: 'easy',      miles: 8,  description: 'Easy 8mi + Strength A. Volume taper begins — quality stays high.', hasStrength: true,  estimatedMinutes: 90 },
      { day: 'Tuesday',   date: '2026-11-24', type: 'tempo',     miles: 11, description: 'MP run 11mi: 2mi WU, 7mi @ 6:29/mi, 2mi CD', hasStrength: false, estimatedMinutes: 82 },
      { day: 'Wednesday', date: '2026-11-25', type: 'easy',      miles: 7,  description: 'Easy 7mi', hasStrength: false, estimatedMinutes: 58 },
      { day: 'Thursday',  date: '2026-11-26', type: 'intervals', miles: 9,  description: 'Thanksgiving intervals: 9mi — 2mi WU, 5x1000m @ 5:45/mi w/ 90s jog, 2mi CD. Earn the Turkey.', hasStrength: false, estimatedMinutes: 70 },
      { day: 'Friday',    date: '2026-11-27', type: 'rest',      miles: 0,  description: 'Rest + Strength B. Black Friday = rest day.', hasStrength: true,  estimatedMinutes: 40 },
      { day: 'Saturday',  date: '2026-11-28', type: 'long',      miles: 20, description: 'Long run 20mi: Easy 14mi, last 6mi @ MP. Begin mental taper — tell yourself the work is done.', hasStrength: false, estimatedMinutes: 155 },
      { day: 'Sunday',    date: '2026-11-29', type: 'easy',      miles: 10, description: 'Easy 10mi recovery. Phase 3 nearly complete.', hasStrength: false, estimatedMinutes: 82 },
    ],
  },
  {
    week: 36, startDate: '2026-11-30', totalMiles: 48, isDownWeek: true,
    days: [
      { day: 'Monday',    date: '2026-11-30', type: 'easy',  miles: 7,  description: 'Easy 7mi + Strength A (light). Phase 3 complete! Down week — mental taper begins.', hasStrength: true,  estimatedMinutes: 80 },
      { day: 'Tuesday',   date: '2026-12-01', type: 'tempo', miles: 8,  description: 'Easy MP run 8mi: 2mi WU, 4mi @ 6:32/mi, 2mi CD. Keep the legs sharp.', hasStrength: false, estimatedMinutes: 62 },
      { day: 'Wednesday', date: '2026-12-02', type: 'easy',  miles: 6,  description: 'Easy 6mi', hasStrength: false, estimatedMinutes: 50 },
      { day: 'Thursday',  date: '2026-12-03', type: 'easy',  miles: 7,  description: 'Easy 7mi + 6x100m strides', hasStrength: false, estimatedMinutes: 60 },
      { day: 'Friday',    date: '2026-12-04', type: 'rest',  miles: 0,  description: 'Rest + Strength B (light)', hasStrength: true,  estimatedMinutes: 35 },
      { day: 'Saturday',  date: '2026-12-05', type: 'long',  miles: 14, description: 'Easy long run 14mi. The hay is in the barn. Trust the process.', hasStrength: false, estimatedMinutes: 110 },
      { day: 'Sunday',    date: '2026-12-06', type: 'easy',  miles: 6,  description: 'Easy 6mi. Phase 4 taper starts Monday.', hasStrength: false, estimatedMinutes: 50 },
    ],
  },
];

// ============================================================
// PHASE 4: Taper + Houston (Weeks 37-42, Dec 7, 2026 - Jan 17, 2027)
// ============================================================
export const phase4Weeks: TrainingWeek[] = [
  {
    week: 37, startDate: '2026-12-07', totalMiles: 50, isDownWeek: false,
    days: [
      { day: 'Monday',    date: '2026-12-07', type: 'easy',  miles: 7,  description: 'Easy 7mi + Strength (Phase 4: Goblet Squat 2x8 light, SL RDL 2x8, Plank+Side Plank 2x30s, Calf Raises 2x15). Volume drop begins — body starts to freshen.', hasStrength: true,  estimatedMinutes: 80 },
      { day: 'Tuesday',   date: '2026-12-08', type: 'tempo', miles: 9,  description: 'MP run 9mi: 2mi WU, 5mi @ 6:29/mi, 2mi CD. Keeping the legs sharp.', hasStrength: false, estimatedMinutes: 68 },
      { day: 'Wednesday', date: '2026-12-09', type: 'easy',  miles: 7,  description: 'Easy 7mi', hasStrength: false, estimatedMinutes: 58 },
      { day: 'Thursday',  date: '2026-12-10', type: 'easy',  miles: 7,  description: 'Easy 7mi + 6x100m strides', hasStrength: false, estimatedMinutes: 60 },
      { day: 'Friday',    date: '2026-12-11', type: 'rest',  miles: 0,  description: 'Rest. Taper means extra sleep, not extra sitting.', hasStrength: false, estimatedMinutes: 15 },
      { day: 'Saturday',  date: '2026-12-12', type: 'long',  miles: 16, description: 'Long run 16mi easy throughout. Last truly long run — enjoy it.', hasStrength: false, estimatedMinutes: 125 },
      { day: 'Sunday',    date: '2026-12-13', type: 'easy',  miles: 4,  description: 'Easy 4mi recovery', hasStrength: false, estimatedMinutes: 34 },
    ],
  },
  {
    week: 38, startDate: '2026-12-14', totalMiles: 45, isDownWeek: false,
    days: [
      { day: 'Monday',    date: '2026-12-14', type: 'easy',  miles: 6,  description: 'Easy 6mi + Strength (light). Legs should be starting to feel fresher.', hasStrength: true,  estimatedMinutes: 75 },
      { day: 'Tuesday',   date: '2026-12-15', type: 'tempo', miles: 8,  description: 'MP run 8mi: 2mi WU, 4mi @ 6:27-6:32/mi, 2mi CD. Last proper MP workout before the race.', hasStrength: false, estimatedMinutes: 62 },
      { day: 'Wednesday', date: '2026-12-16', type: 'easy',  miles: 6,  description: 'Easy 6mi', hasStrength: false, estimatedMinutes: 50 },
      { day: 'Thursday',  date: '2026-12-17', type: 'easy',  miles: 6,  description: 'Easy 6mi + 4x100m strides', hasStrength: false, estimatedMinutes: 52 },
      { day: 'Friday',    date: '2026-12-18', type: 'rest',  miles: 0,  description: 'Rest.', hasStrength: false, estimatedMinutes: 15 },
      { day: 'Saturday',  date: '2026-12-19', type: 'long',  miles: 14, description: 'Long run 14mi: Easy first 11mi, last 3mi @ MP. This will feel easy — you\'re fresh.', hasStrength: false, estimatedMinutes: 110 },
      { day: 'Sunday',    date: '2026-12-20', type: 'easy',  miles: 5,  description: 'Easy 5mi recovery', hasStrength: false, estimatedMinutes: 42 },
    ],
  },
  {
    week: 39, startDate: '2026-12-21', totalMiles: 40, isDownWeek: false,
    days: [
      { day: 'Monday',    date: '2026-12-21', type: 'easy',  miles: 6,  description: 'Easy 6mi + Strength. Holiday week — stick to the plan, you\'re close now.', hasStrength: true,  estimatedMinutes: 75 },
      { day: 'Tuesday',   date: '2026-12-22', type: 'easy',  miles: 5,  description: 'Easy 5mi + 4x100m strides. 10K race Saturday if available.', hasStrength: false, estimatedMinutes: 45 },
      { day: 'Wednesday', date: '2026-12-23', type: 'easy',  miles: 4,  description: 'Easy 4mi. Merry Christmas Eve-Eve.', hasStrength: false, estimatedMinutes: 34 },
      { day: 'Thursday',  date: '2026-12-24', type: 'easy',  miles: 3,  description: 'Easy 3mi + strides. Christmas Eve shakeout.', hasStrength: false, estimatedMinutes: 28 },
      { day: 'Friday',    date: '2026-12-25', type: 'rest',  miles: 0,  description: 'REST — Christmas Day. Enjoy family. Come back fresh.', hasStrength: false, estimatedMinutes: 15 },
      { day: 'Saturday',  date: '2026-12-26', type: 'race',  miles: 6.2, description: '🏁 10K TUNE-UP RACE — Goal: 40:30-41:30 (6:32-6:41/mi). Final pre-marathon sharpener. Race hard but controlled. Warm up 2mi first.', hasStrength: false, estimatedMinutes: 60 },
      { day: 'Sunday',    date: '2026-12-27', type: 'easy',  miles: 5.8, description: 'Easy 6mi shake-out recovery', hasStrength: false, estimatedMinutes: 48 },
    ],
  },
  {
    week: 40, startDate: '2026-12-28', totalMiles: 35, isDownWeek: false,
    days: [
      { day: 'Monday',    date: '2026-12-28', type: 'easy',  miles: 5,  description: 'Easy 5mi. No more strength this week — stop lifting 10 days before the race.', hasStrength: false, estimatedMinutes: 42 },
      { day: 'Tuesday',   date: '2026-12-29', type: 'tempo', miles: 7,  description: 'MP run 7mi: 2mi WU, 3mi @ 6:29/mi, 2mi CD. Short and sharp.', hasStrength: false, estimatedMinutes: 55 },
      { day: 'Wednesday', date: '2026-12-30', type: 'easy',  miles: 6,  description: 'Easy 6mi', hasStrength: false, estimatedMinutes: 50 },
      { day: 'Thursday',  date: '2026-12-31', type: 'easy',  miles: 6,  description: 'Easy 6mi + 4x100m strides. New Year\'s Eve run.', hasStrength: false, estimatedMinutes: 52 },
      { day: 'Friday',    date: '2027-01-01', type: 'rest',  miles: 0,  description: 'Rest. Happy New Year! Houston is in 16 days.', hasStrength: false, estimatedMinutes: 15 },
      { day: 'Saturday',  date: '2027-01-02', type: 'long',  miles: 10, description: 'Easy 10mi. Legs should feel springy.', hasStrength: false, estimatedMinutes: 82 },
      { day: 'Sunday',    date: '2027-01-03', type: 'easy',  miles: 1,  description: 'Easy 1mi shake-out + foam roll', hasStrength: false, estimatedMinutes: 15 },
    ],
  },
  {
    week: 41, startDate: '2027-01-04', totalMiles: 28, isDownWeek: false,
    days: [
      { day: 'Monday',    date: '2027-01-04', type: 'easy',  miles: 5,  description: 'Easy 5mi. 13 days to race day. Legs should feel fresh and a little anxious.', hasStrength: false, estimatedMinutes: 42 },
      { day: 'Tuesday',   date: '2027-01-05', type: 'tempo', miles: 6,  description: 'MP sharpener 6mi: 2mi WU, 2mi @ 6:25-6:29/mi + 4x100m strides, 2mi CD. Race pace should feel easy now.', hasStrength: false, estimatedMinutes: 48 },
      { day: 'Wednesday', date: '2027-01-06', type: 'easy',  miles: 5,  description: 'Easy 5mi', hasStrength: false, estimatedMinutes: 42 },
      { day: 'Thursday',  date: '2027-01-07', type: 'easy',  miles: 4,  description: 'Easy 4mi + 4x100m strides. Last quality strides session.', hasStrength: false, estimatedMinutes: 36 },
      { day: 'Friday',    date: '2027-01-08', type: 'rest',  miles: 0,  description: 'REST. Stop all strength training. Your race starts now.', hasStrength: false, estimatedMinutes: 15 },
      { day: 'Saturday',  date: '2027-01-09', type: 'long',  miles: 8,  description: 'Easy 8mi. Last run over 6 miles before race day.', hasStrength: false, estimatedMinutes: 66 },
      { day: 'Sunday',    date: '2027-01-10', type: 'easy',  miles: 0,  description: 'Rest or easy 1mi walk. Save everything for next Sunday.', hasStrength: false, estimatedMinutes: 15 },
    ],
  },
  {
    week: 42, startDate: '2027-01-11', totalMiles: 18, isDownWeek: false,
    days: [
      { day: 'Monday',    date: '2027-01-11', type: 'easy',  miles: 5,  description: 'Easy 5mi. Race week! Carb loading begins. Extra fluids.', hasStrength: false, estimatedMinutes: 42 },
      { day: 'Tuesday',   date: '2027-01-12', type: 'tempo', miles: 5,  description: 'Race prep 5mi: 2mi WU, 4x800m @ marathon pace, 2mi CD. Last quality workout.', hasStrength: false, estimatedMinutes: 42 },
      { day: 'Wednesday', date: '2027-01-13', type: 'easy',  miles: 3,  description: 'Easy 3mi. Simple. Routine. Trust the training.', hasStrength: false, estimatedMinutes: 26 },
      { day: 'Thursday',  date: '2027-01-14', type: 'easy',  miles: 2,  description: 'Easy 2mi + 4x100m strides. Light legs. Ready.', hasStrength: false, estimatedMinutes: 20 },
      { day: 'Friday',    date: '2027-01-15', type: 'rest',  miles: 0,  description: 'REST. Expo pickup. Bib. Bag drop logistics. Eat 600-800g carbs. Bed by 9 PM.', hasStrength: false, estimatedMinutes: 10 },
      { day: 'Saturday',  date: '2027-01-16', type: 'easy',  miles: 2,  description: 'Easy 2mi shakeout + 4x100m strides. Race is TOMORROW. Lay out everything. Wake up 3:00-3:30 AM.', hasStrength: false, estimatedMinutes: 20 },
      { day: 'Sunday',    date: '2027-01-17', type: 'race',  miles: 26.2, description: '🏁🏆 2027 CHEVRON HOUSTON MARATHON — Goal: SUB-2:50:00 (6:29/mi). Negative split: 1:25:30 first half / 1:24:00-1:24:30 second half. YOU ARE READY. This is what 42 weeks of work was for.', hasStrength: false, estimatedMinutes: 170 },
    ],
  },
];

// ============================================================
// PHASE 5: Ultra Bridge (Weeks 43-51, Jan 18 - March 20, 2027)
// ============================================================
export const phase5Weeks: TrainingWeek[] = [
  {
    week: 43, startDate: '2027-01-18', totalMiles: 18, isDownWeek: true,
    days: [
      { day: 'Monday',    date: '2027-01-18', type: 'rest',  miles: 0, description: 'FULL REST. Post-marathon recovery. Eat everything. Sleep. Walk if you must, but no running.', hasStrength: false, estimatedMinutes: 0 },
      { day: 'Tuesday',   date: '2027-01-19', type: 'rest',  miles: 0, description: 'Rest day 2. Easy walk OK. Get a massage. Epsom salt bath. You earned it.', hasStrength: false, estimatedMinutes: 0 },
      { day: 'Wednesday', date: '2027-01-20', type: 'easy',  miles: 3, description: 'If legs allow: easy jog/walk 3mi @ 9:00-10:00/mi. Stop immediately if anything hurts.', hasStrength: false, estimatedMinutes: 30 },
      { day: 'Thursday',  date: '2027-01-21', type: 'easy',  miles: 3, description: 'Easy jog 3mi. Focus on how you feel, not pace.', hasStrength: false, estimatedMinutes: 30 },
      { day: 'Friday',    date: '2027-01-22', type: 'rest',  miles: 0, description: 'Rest + bodyweight mobility work. Hip circles, bodyweight squats, bird dogs.', hasStrength: true,  estimatedMinutes: 20 },
      { day: 'Saturday',  date: '2027-01-23', type: 'easy',  miles: 6, description: 'Easy 6mi run. Post-marathon legs may surprise you — some runners feel great by Week 2.', hasStrength: false, estimatedMinutes: 56 },
      { day: 'Sunday',    date: '2027-01-24', type: 'easy',  miles: 6, description: 'Easy 6mi. No pressure. This week is just about movement.', hasStrength: false, estimatedMinutes: 56 },
    ],
  },
  {
    week: 44, startDate: '2027-01-25', totalMiles: 23, isDownWeek: false,
    days: [
      { day: 'Monday',    date: '2027-01-25', type: 'easy',  miles: 4, description: 'Easy 4mi. Focus on easy running — 30-45min. Bodyweight strength 2x/week this phase.', hasStrength: true,  estimatedMinutes: 40 },
      { day: 'Tuesday',   date: '2027-01-26', type: 'easy',  miles: 4, description: 'Easy 4mi', hasStrength: false, estimatedMinutes: 40 },
      { day: 'Wednesday', date: '2027-01-27', type: 'easy',  miles: 3, description: 'Easy 3mi. Keep it gentle.', hasStrength: false, estimatedMinutes: 30 },
      { day: 'Thursday',  date: '2027-01-28', type: 'easy',  miles: 4, description: 'Easy 4mi + gentle strides late in the run.', hasStrength: false, estimatedMinutes: 38 },
      { day: 'Friday',    date: '2027-01-29', type: 'rest',  miles: 0, description: 'Rest + bodyweight strength: Squats 3x15, Lunges 3x12/leg, Glute Bridges 3x20, Planks 3x30s', hasStrength: true,  estimatedMinutes: 25 },
      { day: 'Saturday',  date: '2027-01-30', type: 'long',  miles: 5, description: 'Easy 5mi long run. Marathon recovery pace is fine — just build the habit.', hasStrength: false, estimatedMinutes: 50 },
      { day: 'Sunday',    date: '2027-01-31', type: 'easy',  miles: 3, description: 'Easy 3mi', hasStrength: false, estimatedMinutes: 30 },
    ],
  },
  {
    week: 45, startDate: '2027-02-01', totalMiles: 28, isDownWeek: false,
    days: [
      { day: 'Monday',    date: '2027-02-01', type: 'easy',  miles: 5, description: 'Easy 5mi + Bodyweight strength. Return to 6-day rhythm. Ultras reward consistency.', hasStrength: true,  estimatedMinutes: 55 },
      { day: 'Tuesday',   date: '2027-02-02', type: 'easy',  miles: 5, description: 'Easy 5mi', hasStrength: false, estimatedMinutes: 45 },
      { day: 'Wednesday', date: '2027-02-03', type: 'easy',  miles: 4, description: 'Easy 4mi', hasStrength: false, estimatedMinutes: 36 },
      { day: 'Thursday',  date: '2027-02-04', type: 'easy',  miles: 5, description: 'Easy 5mi + 4x100m strides to remind the legs what fast feels like.', hasStrength: false, estimatedMinutes: 45 },
      { day: 'Friday',    date: '2027-02-05', type: 'rest',  miles: 0, description: 'Rest + Bodyweight strength', hasStrength: true,  estimatedMinutes: 25 },
      { day: 'Saturday',  date: '2027-02-06', type: 'long',  miles: 7, description: 'TRAIL RUN 7mi @ LBJ Grasslands or similar trail. First trail run — practice on the actual surface. Take walk breaks as needed.', hasStrength: false, estimatedMinutes: 75 },
      { day: 'Sunday',    date: '2027-02-07', type: 'easy',  miles: 2, description: 'Recovery 2mi walk/jog after trail run.', hasStrength: false, estimatedMinutes: 25 },
    ],
  },
  {
    week: 46, startDate: '2027-02-08', totalMiles: 38, isDownWeek: false,
    days: [
      { day: 'Monday',    date: '2027-02-08', type: 'easy',   miles: 6, description: 'Easy 6mi + Light strength (SL squat variations, hip thrusts, eccentric calf lowers, core circuit).', hasStrength: true,  estimatedMinutes: 70 },
      { day: 'Tuesday',   date: '2027-02-09', type: 'easy',   miles: 6, description: 'Easy 6mi. Practice eating while running — take a gel or chew mid-run.', hasStrength: false, estimatedMinutes: 52 },
      { day: 'Wednesday', date: '2027-02-10', type: 'easy',   miles: 5, description: 'Easy 5mi', hasStrength: false, estimatedMinutes: 45 },
      { day: 'Thursday',  date: '2027-02-11', type: 'easy',   miles: 4, description: 'Easy 4mi + Light strength', hasStrength: true,  estimatedMinutes: 50 },
      { day: 'Friday',    date: '2027-02-12', type: 'rest',   miles: 0, description: 'Rest. Tomorrow is the first back-to-back weekend!', hasStrength: false, estimatedMinutes: 10 },
      { day: 'Saturday',  date: '2027-02-13', type: 'long',   miles: 15, description: 'TRAIL LONG RUN 15mi. Easy effort — practice fueling every 30min. Carry vest. Practice aid station routine (stop at mile 8, refill, eat, assess, go). Night running practice: run last 30-45min after dark if possible.', hasStrength: false, estimatedMinutes: 165 },
      { day: 'Sunday',    date: '2027-02-14', type: 'long',   miles: 8, description: 'BACK-TO-BACK RUN: 8mi on tired legs. This is the most important ultra workout — running on fatigue. Take walk breaks as needed.', hasStrength: false, estimatedMinutes: 95 },
    ],
  },
  {
    week: 47, startDate: '2027-02-15', totalMiles: 43, isDownWeek: false,
    days: [
      { day: 'Monday',    date: '2027-02-15', type: 'easy',  miles: 6, description: 'Easy 6mi + Light strength. How did the B2B weekend feel? Journal it.', hasStrength: true,  estimatedMinutes: 70 },
      { day: 'Tuesday',   date: '2027-02-16', type: 'easy',  miles: 7, description: 'Easy 7mi. Practice eating real food mid-run (PB&J, potatoes, banana).', hasStrength: false, estimatedMinutes: 62 },
      { day: 'Wednesday', date: '2027-02-17', type: 'easy',  miles: 5, description: 'Easy 5mi', hasStrength: false, estimatedMinutes: 45 },
      { day: 'Thursday',  date: '2027-02-18', type: 'easy',  miles: 3, description: 'Easy 3mi + Light strength. Pre-B2B fuel and sleep.', hasStrength: true,  estimatedMinutes: 40 },
      { day: 'Friday',    date: '2027-02-19', type: 'rest',  miles: 0, description: 'REST before the big B2B weekend.', hasStrength: false, estimatedMinutes: 10 },
      { day: 'Saturday',  date: '2027-02-20', type: 'long',  miles: 18, description: 'TRAIL LONG RUN 18mi. Fuel every 30min. Practice your aid station routine mid-run. Run part of this after dark with headlamp.', hasStrength: false, estimatedMinutes: 198 },
      { day: 'Sunday',    date: '2027-02-21', type: 'long',  miles: 10, description: 'BACK-TO-BACK RUN: 10mi on very tired legs. Walk the uphills. Eat every 20-25min. This mimics miles 30-40 of a 100.', hasStrength: false, estimatedMinutes: 120 },
    ],
  },
  {
    week: 48, startDate: '2027-02-22', totalMiles: 48, isDownWeek: false,
    days: [
      { day: 'Monday',    date: '2027-02-22', type: 'easy',  miles: 6, description: 'Easy 6mi + Light strength. Peak B2B weekend coming up.', hasStrength: true,  estimatedMinutes: 70 },
      { day: 'Tuesday',   date: '2027-02-23', type: 'easy',  miles: 8, description: 'Easy 8mi trail run. Practice broth + real food fueling.', hasStrength: false, estimatedMinutes: 80 },
      { day: 'Wednesday', date: '2027-02-24', type: 'easy',  miles: 5, description: 'Easy 5mi', hasStrength: false, estimatedMinutes: 45 },
      { day: 'Thursday',  date: '2027-02-25', type: 'easy',  miles: 4, description: 'Easy 4mi + Light strength. Pre-B2B preparation.', hasStrength: true,  estimatedMinutes: 50 },
      { day: 'Friday',    date: '2027-02-26', type: 'rest',  miles: 0, description: 'REST. Biggest training weekend of ultra prep ahead.', hasStrength: false, estimatedMinutes: 10 },
      { day: 'Saturday',  date: '2027-02-27', type: 'long',  miles: 21, description: '⭐ PEAK ULTRA LONG RUN: 20-22mi trail. Simulate a 50K — full vest, full fueling every 30min, aid station practice at miles 8, 14, and 20. Run at least 2 hours in the dark. Practice headlamp + flashlight setup.', hasStrength: false, estimatedMinutes: 240 },
      { day: 'Sunday',    date: '2027-02-28', type: 'long',  miles: 11, description: 'BACK-TO-BACK PEAK: 10-12mi on deeply tired legs. This is as hard as the ultra gets in training. Walk breaks are strength, not weakness.', hasStrength: false, estimatedMinutes: 135 },
    ],
  },
  {
    week: 49, startDate: '2027-03-01', totalMiles: 33, isDownWeek: true,
    days: [
      { day: 'Monday',    date: '2027-03-01', type: 'easy',  miles: 5, description: 'Easy 5mi recovery. Down week — gear check, drop bag prep, and mental review.', hasStrength: false, estimatedMinutes: 45 },
      { day: 'Tuesday',   date: '2027-03-02', type: 'easy',  miles: 5, description: 'Easy 5mi. Review your race plan. Where are the aid stations? Who is your pacer?', hasStrength: false, estimatedMinutes: 45 },
      { day: 'Wednesday', date: '2027-03-03', type: 'easy',  miles: 5, description: 'Easy 5mi', hasStrength: false, estimatedMinutes: 45 },
      { day: 'Thursday',  date: '2027-03-04', type: 'easy',  miles: 4, description: 'Easy 4mi. Test all gear one final time.', hasStrength: false, estimatedMinutes: 36 },
      { day: 'Friday',    date: '2027-03-05', type: 'rest',  miles: 0, description: 'Rest. STOP all strength training 7 days before Grasslands.', hasStrength: false, estimatedMinutes: 10 },
      { day: 'Saturday',  date: '2027-03-06', type: 'long',  miles: 12, description: 'Easy 12mi trail at race pace (~13:00-13:30/mi). Final dress rehearsal — practice the exact race morning routine, gear, fueling.', hasStrength: false, estimatedMinutes: 156 },
      { day: 'Sunday',    date: '2027-03-07', type: 'easy',  miles: 2, description: 'Easy 2mi recovery walk/jog.', hasStrength: false, estimatedMinutes: 25 },
    ],
  },
  {
    week: 50, startDate: '2027-03-08', totalMiles: 28, isDownWeek: false,
    days: [
      { day: 'Monday',    date: '2027-03-08', type: 'easy',  miles: 5, description: 'Easy 5mi. Final sharpen week. Trust the training.', hasStrength: false, estimatedMinutes: 45 },
      { day: 'Tuesday',   date: '2027-03-09', type: 'easy',  miles: 5, description: 'Easy 5mi trail run at race pace — practice the movement, remind your body what it knows.', hasStrength: false, estimatedMinutes: 65 },
      { day: 'Wednesday', date: '2027-03-10', type: 'easy',  miles: 5, description: 'Easy 5mi', hasStrength: false, estimatedMinutes: 45 },
      { day: 'Thursday',  date: '2027-03-11', type: 'easy',  miles: 4, description: 'Easy 4mi. Pack drop bags. Double-check headlamp batteries. Brief pacer.', hasStrength: false, estimatedMinutes: 36 },
      { day: 'Friday',    date: '2027-03-12', type: 'rest',  miles: 0, description: 'REST. Final day before race week. Carbs, fluids, early to bed.', hasStrength: false, estimatedMinutes: 10 },
      { day: 'Saturday',  date: '2027-03-13', type: 'easy',  miles: 3, description: 'Easy 10mi trail final shakeout — run exactly at race effort, enjoy it. 1 week to Grasslands.', hasStrength: false, estimatedMinutes: 120 },
      { day: 'Sunday',    date: '2027-03-14', type: 'easy',  miles: 6, description: 'Easy 6mi. This time next week you will be running a 100-miler. You are ready.', hasStrength: false, estimatedMinutes: 55 },
    ],
  },
  {
    week: 51, startDate: '2027-03-15', totalMiles: 10, isDownWeek: false,
    days: [
      { day: 'Monday',    date: '2027-03-15', type: 'easy', miles: 4,   description: 'Easy 4mi. RACE WEEK. Eat well. Sleep early. No heroics.', hasStrength: false, estimatedMinutes: 36 },
      { day: 'Tuesday',   date: '2027-03-16', type: 'easy', miles: 3,   description: 'Easy 3mi + 4x100m strides. Shake out the legs.', hasStrength: false, estimatedMinutes: 28 },
      { day: 'Wednesday', date: '2027-03-17', type: 'rest', miles: 0,   description: 'REST. Drop bags to race site if possible. Final gear check.', hasStrength: false, estimatedMinutes: 10 },
      { day: 'Thursday',  date: '2027-03-18', type: 'rest', miles: 0,   description: 'REST. Carb load. Hydrate aggressively. Sleep by 9 PM.', hasStrength: false, estimatedMinutes: 10 },
      { day: 'Friday',    date: '2027-03-19', type: 'easy', miles: 3,   description: 'Easy 3mi shakeout. Pack final gear. Review race plan one more time. Be at the start by 7 PM for a good corral position.', hasStrength: false, estimatedMinutes: 28 },
      { day: 'Saturday',  date: '2027-03-20', type: 'race', miles: 50,  description: '🏁🌟 2027 GRASSLANDS 100-MILER — DAY 1. Start time ~6:00 AM. Miles 1-50. Goal pace: 13:00-13:30/mi. WALK ALL UPHILLS. Eat every 25min. Pacer joins at mile 54.9. You got this.', hasStrength: false, estimatedMinutes: 650 },
      { day: 'Sunday',    date: '2027-03-21', type: 'race', miles: 50,  description: '🏆🌟 2027 GRASSLANDS 100-MILER — DAY 2. Miles 50-100. The race doesn\'t start until mile 60. Run the last 40 miles. Sub-24 buckle awaits.', hasStrength: false, estimatedMinutes: 660 },
    ],
  },
];

// ============================================================
// All phases combined
// ============================================================
export const allWeeks: TrainingWeek[] = [
  ...phase1Weeks,
  ...phase2Weeks,
  ...phase3Weeks,
  ...phase4Weeks,
  ...phase5Weeks,
];

export const trainingPhases: TrainingPhase[] = [
  {
    phase: 1,
    name: 'Base Building',
    startWeek: 1,
    endWeek: 10,
    startDate: '2026-03-30',
    endDate: '2026-06-07',
    color: '#22C55E',
    weeks: phase1Weeks,
  },
  {
    phase: 2,
    name: 'Speed + Heat',
    startWeek: 11,
    endWeek: 20,
    startDate: '2026-06-08',
    endDate: '2026-08-16',
    color: '#F59E0B',
    weeks: phase2Weeks,
  },
  {
    phase: 3,
    name: 'Marathon Specific',
    startWeek: 21,
    endWeek: 36,
    startDate: '2026-08-17',
    endDate: '2026-12-06',
    color: '#3B82F6',
    weeks: phase3Weeks,
  },
  {
    phase: 4,
    name: 'Taper + Houston',
    startWeek: 37,
    endWeek: 42,
    startDate: '2026-12-07',
    endDate: '2027-01-17',
    color: '#A855F7',
    weeks: phase4Weeks,
  },
  {
    phase: 5,
    name: 'Ultra Bridge',
    startWeek: 43,
    endWeek: 51,
    startDate: '2027-01-18',
    endDate: '2027-03-21',
    color: '#EF4444',
    weeks: phase5Weeks,
  },
];

// ============================================================
// Helper functions
// ============================================================
export function getWorkoutByDate(date: string) {
  for (const week of allWeeks) {
    for (const day of week.days) {
      if (day.date === date) {
        return { ...day, weekNumber: week.week, isDownWeek: week.isDownWeek };
      }
    }
  }
  return null;
}

export function getWeekByNumber(weekNum: number): TrainingWeek | undefined {
  return allWeeks.find((w) => w.week === weekNum);
}

export function getPhaseForWeek(weekNum: number): TrainingPhase | undefined {
  return trainingPhases.find(
    (p) => weekNum >= p.startWeek && weekNum <= p.endWeek
  );
}

export function getCurrentWeek(today: Date = new Date()): TrainingWeek | null {
  const todayStr = today.toISOString().split('T')[0];
  for (const week of allWeeks) {
    const weekStart = new Date(week.startDate);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const todayDate = new Date(todayStr);
    if (todayDate >= weekStart && todayDate <= weekEnd) {
      return week;
    }
  }
  return null;
}

export function getTodayWorkout(today: Date = new Date()) {
  const todayStr = today.toISOString().split('T')[0];
  return getWorkoutByDate(todayStr);
}

export function getDaysUntil(targetDate: string, fromDate: Date = new Date()): number {
  const target = new Date(targetDate);
  const from = new Date(fromDate.toISOString().split('T')[0]);
  return Math.ceil((target.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

export function getCompletedMilesInWeek(
  weekNum: number,
  logs: Record<string, { completed: boolean; actualMiles?: number }>
): number {
  const week = getWeekByNumber(weekNum);
  if (!week) return 0;
  return week.days.reduce((sum, day) => {
    const log = logs[day.date];
    if (log?.completed) {
      return sum + (log.actualMiles ?? day.miles);
    }
    return sum;
  }, 0);
}
