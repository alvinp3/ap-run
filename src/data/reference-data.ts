import type { TrainingPace, NutritionTarget, GearItem } from '@/types';

// ============================================================
// Training Paces Reference
// ============================================================
export const trainingPaces: TrainingPace[] = [
  { zone: 'Recovery',      normalPace: '8:30-9:00/mi', purpose: 'Active recovery runs', heatAdjusted: '9:00-9:45/mi' },
  { zone: 'Easy Aerobic',  normalPace: '7:50-8:20/mi', purpose: 'Daily easy runs',      heatAdjusted: '8:15-9:00/mi' },
  { zone: 'Long Run',      normalPace: '7:20-7:50/mi', purpose: 'Endurance',            heatAdjusted: '7:45-8:30/mi' },
  { zone: 'Marathon Pace', normalPace: '6:25-6:35/mi', purpose: 'Race-specific',        heatAdjusted: '6:45-7:10/mi' },
  { zone: 'Tempo / LT',   normalPace: '6:05-6:15/mi', purpose: 'Stamina',              heatAdjusted: '6:25-6:45/mi' },
  { zone: 'VO2max / 5K',  normalPace: '5:45-6:00/mi', purpose: 'Aerobic ceiling',      heatAdjusted: '6:00-6:25/mi' },
  { zone: 'Repetition',   normalPace: '5:30-5:45/mi', purpose: 'Neuromuscular speed',  heatAdjusted: '5:40-6:05/mi' },
];

export const hrZones = [
  { zone: 1, pct: '60-65%', use: 'Recovery' },
  { zone: 2, pct: '65-75%', use: 'Easy, long runs' },
  { zone: 3, pct: '76-85%', use: 'Marathon pace, moderate tempo' },
  { zone: 4, pct: '85-90%', use: 'Threshold, hard tempo' },
  { zone: 5, pct: '90-100%', use: 'Intervals, racing' },
];

// ============================================================
// Nutrition Data
// ============================================================
export const nutritionTargets: NutritionTarget[] = [
  { phase: 1, calories: '2,800-3,200', carbs: '55% (385-440g)', protein: '20% (140-160g)', fat: '25% (78-89g)' },
  { phase: 2, calories: '3,200-3,600', carbs: '55% (440-495g)', protein: '20% (160-180g)', fat: '25% (89-100g)' },
  { phase: 3, calories: '3,500-4,000', carbs: '58% (508-580g)', protein: '18% (158-180g)', fat: '24% (93-107g)' },
  { phase: 4, calories: '2,800-3,200', carbs: '60% (carb load)',  protein: '20%',            fat: '20%' },
  { phase: 5, calories: '3,200-3,800', carbs: '55%',             protein: '20%',            fat: '25%' },
];

export const workoutNutrition = {
  preRun: {
    timing: '60-90 min before',
    calories: '200-400 cal',
    options: ['Toast + honey + banana', 'Oatmeal with fruit', 'Bagel + peanut butter'],
  },
  duringRun: {
    over75min: '30-60g carbs/hr (gels, chews, sports drink)',
    over2hrs: '60-80g carbs/hr',
    options: ['Energy gels (25-32g carbs)', 'Chews', 'Sports drink', 'Banana at aid stations'],
  },
  postRun: {
    timing: 'Within 30-60 min',
    protein: '30-40g protein',
    carbs: '60-80g carbs',
    options: [
      'Chocolate milk + banana',
      'Protein shake + oats',
      '3 eggs + 2 toast + fruit',
    ],
  },
};

export const houstonCarbLoad = {
  timing: '3 days before race (Jan 14-16)',
  target: '4-5g carbs/lb body weight/day (~600-800g)',
  foods: ['White rice', 'Pasta', 'Bread', 'Potatoes', 'Pancakes', 'Pretzels'],
  avoid: ['High fat foods', 'High fiber foods', 'Anything new or unusual'],
  note: 'Expect +2-4 lbs water weight — that\'s glycogen storage, not fat.',
};

export const grasslandsNutrition = [
  { segment: 'Miles 1-30',   calPerHour: '250-300', options: 'Gels, chews, PB&J, bananas' },
  { segment: 'Miles 30-60',  calPerHour: '200-250', options: 'Potatoes, broth, quesadillas, pretzels' },
  { segment: 'Miles 60-80',  calPerHour: '150-200', options: 'Broth, flat Coke, ginger chews, watermelon' },
  { segment: 'Miles 80-100', calPerHour: '100-200', options: 'Whatever you tolerate; Coke + broth' },
];

export const samplePeakDay = [
  { time: '5:00 AM',  meal: 'Bagel w/ honey + banana + coffee',               calories: 400 },
  { time: '7:30 AM',  meal: '3 eggs, 2 toast, avocado, fruit',                calories: 600 },
  { time: '10:00 AM', meal: 'Greek yogurt, granola, berries',                  calories: 350 },
  { time: '12:30 PM', meal: 'Chicken rice bowl, veggies, beans, salsa',        calories: 700 },
  { time: '3:00 PM',  meal: 'PB&J + milk',                                     calories: 450 },
  { time: '6:30 PM',  meal: 'Salmon, sweet potato, broccoli, olive oil',       calories: 700 },
  { time: '8:30 PM',  meal: 'Cottage cheese + almonds',                        calories: 300 },
];

// ============================================================
// Recovery Protocols
// ============================================================
export const recoveryProtocols = {
  easy: {
    label: 'Easy Run Recovery',
    estimatedMinutes: { min: 10, max: 15 },
    steps: [
      { order: 1, tool: 'Massage Gun', duration: '30-60s each', targets: 'Calves, glutes, hip flexors (primer)' },
      { order: 2, tool: 'Foam Roll',   duration: '2min calves, 2min quads, 2min glutes, 90s IT band', targets: 'Full lower body' },
      { order: 3, tool: 'Static Stretch', duration: '30s+ holds each', targets: 'Standing calf (gastroc), wall calf bent knee (soleus), half-kneeling hip flexor, pigeon pose' },
    ],
  },
  quality: {
    label: 'Quality Day Recovery (Intervals/Tempo)',
    estimatedMinutes: { min: 15, max: 25 },
    steps: [
      { order: 1, tool: 'Massage Gun',  duration: '30-60s each', targets: 'Calves, glutes, hip flexors' },
      { order: 2, tool: 'Foam Roll',    duration: '2-3min each area', targets: 'Full lower body' },
      { order: 3, tool: 'Lacrosse Ball', duration: '2min on worst two spots', targets: 'Piriformis, psoas, soleus, or plantar fascia' },
      { order: 4, tool: 'Barbell Mash', duration: '4-5min/leg (if at gym)', targets: 'Calf smash with dorsiflex/plantarflex' },
    ],
  },
  longRun: {
    label: 'Long Run Recovery',
    estimatedMinutes: { min: 45, max: 60 },
    steps: [
      { order: 1, tool: 'Massage Gun',   duration: '3-5min full lower body', targets: 'Primer for all areas' },
      { order: 2, tool: 'Foam Roll',     duration: '2-3min each area',        targets: 'Calves, quads, glutes, IT band' },
      { order: 3, tool: 'Lacrosse Ball', duration: '2min on 2 worst spots',   targets: 'Piriformis + one other tight area' },
      { order: 4, tool: 'Barbell Mash',  duration: '8-10min per leg',         targets: 'Calf smash if accessible' },
      { order: 5, tool: 'Epsom Salt Bath', duration: '15-20 min',             targets: 'Full body recovery' },
      { order: 6, tool: 'Compression',   duration: 'Remainder of day',        targets: 'Calf compression socks' },
    ],
  },
  rest: {
    label: 'Rest Day Recovery',
    estimatedMinutes: { min: 20, max: 25 },
    steps: [
      { order: 1, tool: 'Massage Gun',    duration: '3-5min full body primer', targets: 'All lower body muscle groups' },
      { order: 2, tool: 'Lacrosse Ball',  duration: '2min/side + 60s/side + 2min/leg', targets: 'Piriformis glute smash & floss, psoas, soleus' },
      { order: 3, tool: 'Couch Stretch',  duration: '2min/side',               targets: 'Hip flexors (Starrett #1 for runners)' },
      { order: 4, tool: 'Foam Roll',      duration: 'Gentle, full body',        targets: 'General maintenance' },
    ],
  },
  strength: {
    label: 'Strength Day Recovery',
    estimatedMinutes: { min: 7, max: 10 },
    steps: [
      { order: 1, tool: 'Dynamic Warmup', duration: '5-8 min pre-lift', targets: 'Leg swings, hip circles, ankle circles, bodyweight squats' },
      { order: 2, tool: 'Static Stretch', duration: '30s+ holds post-lift', targets: 'Hip flexors, hamstrings, calves, quads' },
    ],
  },
};

export const strengtheningExercises = [
  { id: 1, name: 'Single-Leg Glute Bridge',         muscles: 'Glutes, hamstrings', sets: '3', reps: '20/leg',      note: '"Kipchoge\'s #1 — mirrors single-leg running demand"' },
  { id: 2, name: 'Clamshells w/ Band',               muscles: 'Glute medius',       sets: '3', reps: '15-20/side', note: '"Glute medius stabilizes your pelvis every stride"' },
  { id: 3, name: 'Single-Leg Deadlift',              muscles: 'Hamstrings, glutes',  sets: '3', reps: '8-12/side',  note: '"The most important exercise for runners — Jay Dicharry"' },
  { id: 4, name: 'Bulgarian Split Squat',            muscles: 'Quads, glutes, hip flexors', sets: '3', reps: '8-10/side', note: '"Strength + hip flexor stretch simultaneously"' },
  { id: 5, name: 'Bent-Knee Calf Raise',             muscles: 'Soleus',             sets: '3', reps: '15-20, 3s eccentric', note: '"Targets soleus — the deep calf muscle most runners neglect"' },
  { id: 6, name: 'Straight-Leg Eccentric Calf Raise', muscles: 'Gastroc, Achilles', sets: '3', reps: '12-15, 3s lower', note: '"Builds Achilles tendon resilience"' },
  { id: 7, name: 'Dead Bug',                         muscles: 'Deep core',           sets: '3', reps: '10 alternating', note: '"Trains deep core to hold pelvic position during running"' },
  { id: 8, name: 'Banded Hip March',                 muscles: 'Hip flexors',         sets: '3', reps: '12/side',    note: '"Strengthens hip flexors through running-specific range"' },
  { id: 9, name: 'Tibialis Raises',                  muscles: 'Tibialis anterior',   sets: '3', reps: '20',         note: '"Prevents shin splints, improves foot strike"' },
  { id: 10, name: 'Copenhagen Plank',                muscles: 'Adductors',           sets: '2', reps: '10-20s/side', note: '"Adductor strength prevents medial knee collapse"' },
];

export const warningSigns = [
  { id: 'sharp_pain',   text: 'Sharp/localized pain worsening with running or lasting 24+ hours' },
  { id: 'hard_easy',    text: 'Easy runs feeling hard for 3+ consecutive days' },
  { id: 'elevated_hr',  text: 'Resting HR elevated 5+ bpm for 2+ consecutive mornings' },
  { id: 'mood',         text: 'Irritability, poor sleep, or loss of appetite' },
  { id: 'gait_change',  text: 'Pain that changes your running gait' },
];

// ============================================================
// Gear Checklists
// ============================================================
export const houstonGear: GearItem[] = [
  { id: 'h1',  name: 'Race shoes (carbon plated, broken in during Phase 3)', category: 'Footwear' },
  { id: 'h2',  name: 'Race outfit (NOTHING new on race day)', category: 'Clothing' },
  { id: 'h3',  name: 'GPS watch (charged, race screen configured)', category: 'Electronics' },
  { id: 'h4',  name: '3-4 gels taped to shorts/waistband', category: 'Nutrition' },
  { id: 'h5',  name: 'Race bib + timing chip', category: 'Race Materials' },
  { id: 'h6',  name: 'Body Glide (nipples, inner thighs, feet)', category: 'Body Care' },
  { id: 'h7',  name: 'Throwaway layer for corral (it\'ll be cool at 7 AM)', category: 'Clothing' },
  { id: 'h8',  name: 'Pre-race meal supplies (bagels, honey, banana, coffee)', category: 'Nutrition' },
  { id: 'h9',  name: 'Electrolyte drink for morning', category: 'Nutrition' },
];

export const grasslandsGear: GearItem[] = [
  { id: 'g1',  name: 'Trail shoes (primary pair, broken in)', category: 'Footwear' },
  { id: 'g2',  name: 'Trail shoes (backup pair for ~mile 50 shoe change)', category: 'Footwear' },
  { id: 'g3',  name: 'Running vest (1.5L+ capacity, loaded and tested)', category: 'Gear' },
  { id: 'g4',  name: 'Headlamp (200+ lumens, tested)', category: 'Electronics' },
  { id: 'g5',  name: 'Handheld flashlight (for depth perception)', category: 'Electronics' },
  { id: 'g6',  name: 'Extra batteries (headlamp + flashlight)', category: 'Electronics' },
  { id: 'g7',  name: 'Drop bag 1 (~mile 25): extra gels, socks, electrolytes', category: 'Drop Bags' },
  { id: 'g8',  name: 'Drop bag 2 (~mile 50): backup shoes, socks, body glide, warm layer, headlamp batteries, real food', category: 'Drop Bags' },
  { id: 'g9',  name: 'Night layer (light insulating jacket)', category: 'Clothing' },
  { id: 'g10', name: 'Gloves + buff (overnight temps 40-50°F)', category: 'Clothing' },
  { id: 'g11', name: 'Body Glide (apply everywhere before the start)', category: 'Body Care' },
  { id: 'g12', name: 'Blister kit (tape, moleskin, needle, alcohol wipes)', category: 'First Aid' },
  { id: 'g13', name: 'Race nutrition (gels, chews, PB&J, salt tabs, ginger chews)', category: 'Nutrition' },
  { id: 'g14', name: 'Flat Coke (2 cans in drop bag for miles 60+)', category: 'Nutrition' },
  { id: 'g15', name: 'Phone (charged, emergency contacts saved)', category: 'Electronics' },
  { id: 'g16', name: 'Pacer briefing sheet (nutrition schedule, pace targets, motivational cues)', category: 'Race Materials' },
];

// ============================================================
// Race Day Execution Plans
// ============================================================
export const houstonRacePlan = {
  pacing: {
    miles1to13: { pace: '6:32-6:35/mi', note: 'Conservative — run by feel, not watch' },
    miles14to20: { pace: '6:28-6:30/mi', note: 'Goal marathon pace' },
    miles21to26: { pace: '6:25-6:28/mi', note: 'Race the last 10K — this is what you trained for' },
    halfSplit: '1:25:30 first half / 1:24:00-1:24:30 second half',
    target: 'Sub-2:50:00',
  },
  fueling: [
    'Gel every 5K starting at mile 3',
    'Water at every aid station',
    'NOTHING new on race day',
  ],
  morning: {
    wakeUp: '3:00-3:30 AM',
    breakfast: '100-150g carbs (2 bagels, honey, banana, 16oz sports drink)',
    arrive: '60-75 min before start',
    warmup: '10min shakeout + 4x100m strides',
    corral: '15min early',
  },
  mentalCheckpoints: [
    { mile: 6, message: 'Running within myself? Easy does it. Save it.' },
    { mile: 13, message: 'Split should be ~1:25:00-1:26:00. You\'re on track.' },
    { mile: 18, message: 'Race starts here. Focus on the next mile only.' },
    { mile: 22, message: 'You will hurt. You prepared for this. Trust it.' },
    { mile: 24, message: '2.2 miles left. 15 minutes. Push everything.' },
  ],
};

export const grasslandsRacePlan = {
  pacing: {
    overall: '13:00-13:30/mi average (~22hr finish)',
    flats: '11:30-12:00/mi',
    uphills: 'WALK all uphills + aid stations',
    warning: 'Do NOT go out fast — the race does not start until mile 60',
  },
  fueling: {
    calories: '200-300 cal/hr from mile 1',
    timer: 'Set timer every 20-25 min to eat',
    rule: 'Eat BEFORE you feel hungry — never chase a deficit at mile 70',
  },
  aidStations: 'Walk in. Refill, eat, assess blisters/chafing, mental check. Out in 3-5 min.',
  night: {
    headlamp: '200+ lumens',
    backup: 'Handheld flashlight for depth perception',
    gear: 'Extra batteries, light layer + gloves for overnight cold (40-50°F)',
  },
  pacer: 'Joins at mile 54.9 (blue loop). Brief on nutrition plan and pace strategy.',
  mindset: [
    'The first 30 miles should feel effortfully easy.',
    'The race doesn\'t truly start until mile 60.',
    'Manage the first 60 miles, then run the last 40.',
    'Walk when you need to — walking is strategy, not failure.',
    'Your pacer is there to keep you moving forward after mile 54.',
  ],
};

// ============================================================
// Athlete Profile
// ============================================================
export const athleteProfile = {
  name: 'Athlete',
  location: 'Dallas, Texas',
  gender: 'Male',
  ageGroup: '18-34',
  weight: '150-170 lbs',
  marathonPR: '3:27:00',
  prRace: '2025 BMW Dallas Marathon',
  currentMileage: '20-30 mpw',
  trainingDays: 6,
  restDay: 'Sunday',
  trainingTime: '5:00-7:00 AM',
};

export const raceCalendar = [
  { name: '5K Tune-Up',          date: '2026-05-30', goal: '20:00-20:30', purpose: 'Speed baseline', type: 'tune-up' },
  { name: '10K Tune-Up (Heat)',   date: '2026-08-01', goal: '41:30-42:30', purpose: 'Heat fitness check', type: 'tune-up' },
  { name: 'Half Marathon',        date: '2026-10-18', goal: '1:22-1:24',   purpose: 'BQ predictor (1:23 ≈ 2:50 marathon)', type: 'key' },
  { name: '10K Final Sharpener',  date: '2026-12-26', goal: '40:30-41:30', purpose: 'Final pre-marathon sharpener', type: 'tune-up' },
  { name: 'Houston Marathon',     date: '2027-01-17', goal: 'Sub-2:50:00', purpose: 'BQ — The A Race', type: 'main' },
  { name: 'Grasslands 100',       date: '2027-03-20', goal: 'Sub-24 hours', purpose: 'First 100-miler — The Ultimate Goal', type: 'main' },
];
