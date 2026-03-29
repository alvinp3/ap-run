# BQ + 100-Miler Training Companion — Complete Application Spec

> **This document is a complete specification for Claude Code to build a full-stack Progressive Web App. It contains every feature, every data point, every design decision, and 51 weeks of training data. Build the entire app from this single document.**

---

## Table of Contents
1. [Mission & Overview](#1-mission--overview)
2. [The Athlete Profile](#2-the-athlete-profile)
3. [The Two Races](#3-the-two-races)
4. [Tech Stack](#4-tech-stack)
5. [Design Direction](#5-design-direction)
6. [Application Pages & Features](#6-application-pages--features)
7. [AI Coach (Claude Integration)](#7-ai-coach-claude-integration)
8. [Shareable Public View](#8-shareable-public-view)
9. [Weather Integration](#9-weather-integration)
10. [Complete 51-Week Training Data](#10-complete-51-week-training-data)
11. [Training Paces Reference](#11-training-paces-reference)
12. [Strength Training Programs](#12-strength-training-programs)
13. [Recovery & Mobility Protocols](#13-recovery--mobility-protocols)
14. [Nutrition Data](#14-nutrition-data)
15. [Race Day Execution Plans](#15-race-day-execution-plans)
16. [Gear Checklists](#16-gear-checklists)
17. [Garmin Integration (Forerunner 745)](#17-garmin-integration-forerunner-745)
18. [Historical Data Import & Athlete Analysis](#18-historical-data-import--athlete-analysis)

---

## 1. Mission & Overview

Build a **Progressive Web App** that serves as a daily training companion for a runner preparing for two major races over 51 weeks. The app must be:

- **Beautiful**: Premium athletic design that feels like a world-class coaching app, not generic AI slop
- **Mobile-first**: Primarily used on a phone at 5 AM — today's workout must be visible instantly
- **Simple**: Minimal friction to check today's workout and log completion
- **Shareable**: Friends can open a public URL and see today's schedule and progress
- **Smart**: Weather-aware advisories, phase-aware nutrition, and an AI coach powered by Claude
- **Installable**: Full PWA with "Add to Home Screen" support and offline access for today's workout

The training timeline spans **March 30, 2026 through March 21, 2027** — 51 weeks covering a marathon and a 100-mile ultramarathon.

---

## 2. The Athlete Profile

```json
{
  "name": "Athlete",
  "location": "Dallas, Texas",
  "gender": "Male",
  "ageGroup": "18-34",
  "weight": "150-170 lbs",
  "marathonPR": "3:27:00",
  "prRace": "2025 BMW Dallas Marathon",
  "currentMileage": "20-30 mpw",
  "currentStrength": "1-2x/week",
  "gymAccess": "Full gym (barbells, machines, everything)",
  "trainingDays": 6,
  "restDay": "Friday",
  "trainingTime": "5:00-7:00 AM (mornings before work)",
  "injuryHistory": "None",
  "racePRs": {
    "5K": null,
    "10K": null,
    "halfMarathon": null,
    "marathon": "3:27:00"
  }
}
```

---

## 3. The Two Races

### Race 1: 2027 Chevron Houston Marathon
- **Date**: Sunday, January 17, 2027
- **Goal**: Sub-2:50:00 (6:29/mile pace)
- **BQ Standard**: 2:55:00 for Males 18-34 (2026/2027 standard)
- **Why sub-2:50**: The 2025 cutoff was 6:51 below the standard — 12,324 qualifiers were rejected. Sub-2:50 provides a safe acceptance cushion.
- **Course**: Flat, fast, USATF-certified. No net-downhill penalty under BAA's new 2027 rules.
- **Strategy**: Negative split — 1:25:30 first half, 1:24:00-1:24:30 second half

### Race 2: 2027 Grasslands Trail Run 100-Mile
- **Date**: Saturday-Sunday, March 20-21, 2027 (9 weeks after Houston)
- **Goal**: Sub-24 hours (~22 hour target) for the sub-24 hour buckle
- **Location**: LBJ National Grasslands, Decatur, TX
- **Course**: ~4,000 ft elevation gain. Very runnable trails. 30-hour cutoff.
- **Pacers**: Allowed starting at mile 54.9 (blue loop)
- **This is the athlete's FIRST ultramarathon**

### Tune-Up Races
| Race | Target Date | Goal Time | Purpose |
|------|------------|-----------|---------|
| 5K | Late May 2026 | 20:00-20:30 | Speed baseline |
| 10K | Late Jul/Early Aug 2026 | 41:30-42:30 | Heat fitness check |
| Half Marathon | Late Oct 2026 | 1:22-1:24 | BQ predictor (1:23 ≈ 2:50 marathon) |
| 10K | Early Dec 2026 | 40:30-41:30 | Final sharpener |

---

## 4. Tech Stack

- **Framework**: Next.js 14+ (App Router) with React 18+ and TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (Postgres + Auth + Realtime)
  - Tables: `workouts` (the 51-week plan), `workout_logs` (completion/notes), `user_settings`, `coach_conversations`
  - Row-level security for the athlete's data
  - Public read access for the shared view
- **AI Coach**: Anthropic API (Claude Sonnet 4.6 model) — `claude-sonnet-4-6`
  - Used for the in-app coaching chat
  - Can read and modify workout data through tool use
  - OAuth token authentication (user has Claude Max Pro)
- **Weather**: OpenWeatherMap API (free tier) — fetch hourly forecast for Dallas, TX at 32.7767, -96.7970
- **Garmin Integration**: `garmin-connect` npm package (or `@gooin/garmin-connect` fork) for pushing workouts to the Forerunner 745 and pulling completed activity data. Connect IQ SDK (Monkey C) for the watch widget.
- **Hosting**: 
  - **Vercel** — Frontend (Next.js), serverless API routes, edge functions, static assets
  - **Railway** — Backend services: Garmin sync worker (cron jobs for activity polling, workout pushing), long-running background jobs (historical data import), any persistent server processes that exceed Vercel's serverless timeout limits
- **PWA**: next-pwa or manual service worker — manifest, offline cache for today's workout, installable
- **Charts**: Recharts for progress visualizations
- **Animations**: Framer Motion for micro-interactions and transitions
- **Fonts**: Google Fonts

---

## 5. Design Direction

### Aesthetic: "Precision Athletic"

Dark, clean, data-rich, motivating. Think Strava's data density + a luxury coaching app's polish. Every screen should feel intentional and premium.

### Color System

```css
:root {
  /* Backgrounds */
  --bg-primary: #0F172A;
  --bg-card: #1E293B;
  --bg-card-hover: #334155;
  --bg-input: #0F172A;
  --border-subtle: #334155;
  --border-accent: #475569;

  /* Text */
  --text-primary: #F8FAFC;
  --text-secondary: #94A3B8;
  --text-tertiary: #64748B;

  /* Accents */
  --accent-teal: #2DD4BF;
  --accent-teal-glow: rgba(45, 212, 191, 0.15);
  --accent-amber: #F59E0B;
  --accent-amber-glow: rgba(245, 158, 11, 0.15);
  --accent-red: #EF4444;
  --accent-blue: #3B82F6;
  --accent-green: #22C55E;
  --accent-purple: #A855F7;

  /* Workout type colors */
  --easy: #22C55E;
  --intervals: #EF4444;
  --tempo: #F59E0B;
  --long-run: #3B82F6;
  --marathon-pace: #3B82F6;
  --rest: #64748B;
  --race: #EF4444;
  --strength: #A855F7;
  --recovery: #A855F7;

  /* Phase colors */
  --phase-1: #22C55E;   /* Base Building */
  --phase-2: #F59E0B;   /* Speed + Heat */
  --phase-3: #3B82F6;   /* Marathon Specific */
  --phase-4: #A855F7;   /* Taper + Race */
  --phase-5: #EF4444;   /* Ultra Bridge */
}
```

Provide a light mode toggle that inverts to white/light gray backgrounds with dark text. Keep accent colors the same.

### Typography

```css
/* Display / Headers — bold, geometric, athletic */
font-family: 'Outfit', sans-serif; /* weights 700, 800, 900 */

/* Body — clean, readable */
font-family: 'Plus Jakarta Sans', sans-serif; /* weights 400, 500, 600 */

/* Monospace — paces, times, distances, stats */
font-family: 'JetBrains Mono', monospace; /* weights 400, 500 */
```

Import from Google Fonts. **Never use Inter, Roboto, Arial, or system fonts.**

### Key Design Rules

1. **Mobile-first**: Design for 375px, scale up. Every interaction must work with thumbs.
2. **Today's workout in < 1 second**: Dashboard loads with today's training card front and center, no scroll needed.
3. **Large touch targets**: 48px minimum tap areas. "Complete" button should be big, prominent, satisfying.
4. **Micro-interactions**: Workout completion gets a satisfying checkmark animation. Milestone achievements (100 miles, 500 miles, first 20-miler, race week) get a celebratory moment.
5. **Data density without clutter**: Use hierarchy, cards, progressive disclosure. Never overwhelm.
6. **Monospace for all numeric data**: Paces, times, distances, calorie counts — all in JetBrains Mono.
7. **Phase awareness**: The current phase color should subtly influence the UI (accent on phase badge, progress rings, etc).

---

## 6. Application Pages & Features

### 6a. Dashboard / Home (`/`)

The command center. First and most important screen.

**Layout (top to bottom on mobile):**

1. **Header bar**: App name/logo + settings gear + share button + light/dark toggle
2. **Race Countdown Cards**: Two horizontally-scrollable cards
   - Houston Marathon: "XX days" + date + circular progress ring (% of training completed)
   - Grasslands 100: "XX days" + date + progress ring
   - After Houston is complete, Grasslands becomes the hero
3. **Weather Strip**: Compact weather bar showing 5-6 AM forecast
   - Temp, feels like, humidity, wind, conditions icon
   - Smart advisory banner if applicable (heat/rain/cold — see Weather section)
4. **Today's Training Card** (THE hero element — most important UI in the app)
   - Phase badge with phase color
   - "Week 14 of 51" indicator
   - Date: "Tuesday, July 14, 2026"
   - Workout type badge (color-coded): EASY / INTERVALS / TEMPO / LONG RUN / REST / RACE / MP RUN
   - **Full workout prescription** in clear coaching language (see training data)
   - If strength day: full lift session inline
   - If heat season: heat-adjusted paces shown in amber
   - Estimated duration
   - Action row: [✅ Complete] [📝 Notes] [⏭️ Skip] [✏️ Modify]
5. **Weekly Mileage Bar**: Progress bar — "32 / 45 miles this week" with fill animation
6. **Streak Counter**: "🔥 14-day training streak"
7. **Quick Links**: Recovery, Nutrition, AI Coach, Calendar, Profile
8. **Garmin Health Strip** (if connected): Compact bar showing last night's sleep score, resting HR, training readiness score, body battery. Pulled from Garmin daily metrics. Tap to expand to trends.
9. **AI Coach FAB** (floating action button): Always-visible button to open the AI coach chat

### 6b. Weekly View (`/week`)

7-day calendar grid for the current week:
- Each day card shows: day/date, workout type badge, brief description, mileage, completion status
- Weekly totals bar at bottom: miles planned vs actual, strength sessions
- Tap any day → full workout detail
- Swipe left/right to navigate weeks
- Current day has accent border highlight

### 6c. Full Calendar (`/calendar`)

Scrollable 51-week view grouped by phase:

- Phase section headers with phase color and name
- Each week: compact row with week number, date range, total mileage, key workout, down-week indicator, completion %
- Race days marked with special red badge: 5K, 10K, Half, Houston, Grasslands
- Current week: pulsing "YOU ARE HERE" indicator
- Tap any week to expand into day-by-day breakdown

### 6d. Workout Detail (`/workout/[date]`)

Full detail view for any day:
- Complete workout description with paces, distances, intervals, rest periods
- Heat-adjusted pace table (if June-Sept)
- Strength exercises: name, sets×reps, RPE, form cue
- Recovery protocol for today (based on workout type)
- Nutrition: pre-run, during-run (if >75min), post-run recommendations
- Notes text area (editable)
- Completion controls: Complete / Skip / Modify (mileage override field)

### 6e. Progress & Stats (`/progress`)

Comprehensive stats dashboard:
- **Total miles to date** with progress bar toward training total
- **Weekly mileage chart** (line chart over all 51 weeks — planned vs actual)
- **Longest run completed**
- **Workout completion rate** (% of planned sessions completed)
- **Training streak** (consecutive days)
- **Phase timeline**: Visual progress bar through all 5 phases with current position
- **Estimated race readiness**: Simple indicator based on completion rate + mileage consistency
- **Monthly mileage totals** bar chart
- **Key milestones tracker**: First 40-mile week ✓, First 50-mile week, First 60-mile week, First 20-miler, etc.

### 6f. Recovery & Mobility Hub (`/recovery`)

Built from the Runner's Kinetic Chain document. NOT just a static reference — dynamically recommends today's recovery work based on the training schedule.

**Daily Recovery Card** (also shown on dashboard):
Based on today's workout type, show the recommended recovery protocol:
- **Easy run days**: Massage gun 3-5 min (calves, glutes, hip flexors) → Foam roll 5-10 min → Light static stretching
- **Quality days (intervals/tempo)**: Above + Barbell calf smash 4-5 min/leg + Lacrosse ball work on 2 worst spots
- **Long run days**: Full protocol — foam roll + lacrosse ball + barbell mash + epsom salt bath + compression recommendation
- **Rest days (Friday)**: Massage gun primer → Lacrosse ball deep work (piriformis, psoas, soleus) → Couch stretch 2 min/side
- **Strength days**: Dynamic mobility pre-lift, static stretching post-lift

**Modality Guide** (expandable reference cards):
1. **Foam Rolling**: Technique for calves (2 min), hip flexors/quads (2 min), glutes in figure-4 (2 min), IT band (90s). Roller selection: start standard density, progress to textured/hard.
2. **Lacrosse Ball**: Piriformis "glute smash & floss" (2 min/side), posterior hip capsule, psoas/iliacus (lie face down, 30-60s/side), soleus with bent knee (2 min/leg), plantar fascia (stand on ball, roll heel to toe)
3. **Massage Gun**: Round/flat head for calves (straight + bent knee), flat head for hip flexors (light pressure, 30-45s/side), ball head for glutes (60-90s/side), peroneals/tib anterior (30s each). Always use BEFORE deeper work as a primer.
4. **Barbell Mash**: Calf smash protocol — calf on barbell, cross opposite leg for pressure, pressure wave side-to-side, dorsiflex/plantarflex under compression, 2 min/spot, 8-10 min total per leg. Quad/hip flexor variant.
5. **Dry Needling**: When to consider professional treatment (acute trigger points not resolving with self-work). Recommended 1-2x/week acute, biweekly maintenance. Best for: soleus, gastroc, piriformis, psoas, glute medius.

**Strengthening Library**:
Interactive exercise cards with name, muscles, sets×reps, form cue, and "why it matters":
1. Single-Leg Glute Bridge — 3×20/leg ("Kipchoge's #1 — mirrors single-leg running demand")
2. Clamshells w/ Band — 3×15-20/side ("Glute medius stabilizes your pelvis every stride")
3. Single-Leg Deadlift — 3×8-12/side ("The most important exercise for runners — Jay Dicharry")
4. Bulgarian Split Squat — 3×8-10/side ("Strength + hip flexor stretch simultaneously")
5. Bent-Knee Calf Raise — 3×15-20, 3s eccentric ("Targets soleus — the deep calf muscle most runners neglect")
6. Straight-Leg Eccentric Calf Raise — 3×12-15, 3s lower ("Builds Achilles tendon resilience")
7. Dead Bug — 3×10 alternating ("Trains deep core to hold pelvic position during running")
8. Banded Hip March — 3×12/side ("Strengthens hip flexors through running-specific range")
9. Tibialis Raises — 3×20 ("Prevents shin splints, improves foot strike")
10. Copenhagen Plank — 2×10-20s/side ("Adductor strength prevents medial knee collapse")

**Warning Signs Checklist**:
Interactive — user can check boxes, and if any are checked, show a recommendation banner:
- [ ] Sharp/localized pain worsening with running or lasting 24+ hours
- [ ] Easy runs feeling hard for 3+ consecutive days
- [ ] Resting HR elevated 5+ bpm for 2+ consecutive mornings
- [ ] Irritability, poor sleep, or loss of appetite
- [ ] Pain that changes your running gait
→ If checked: "⚠️ Recovery recommended — consider an extra rest day and reducing this week's mileage by 20-30%. A missed week now is better than a missed month later."

### 6g. Nutrition (`/nutrition`)

**Daily Nutrition Card** (also on dashboard):
- Current phase macro targets
- Pre-run suggestion for today's workout
- Post-run suggestion

**Full nutrition reference**:
- Phase-by-phase calorie and macro table (see Nutrition Data section)
- Sample meal day at peak training
- Houston carb loading protocol (3 days before race)
- Grasslands ultra nutrition strategy by race segment
- Hydration guidelines (half body weight in ounces + training additions)

### 6h. Race Day Plans (`/race/houston` and `/race/grasslands`)

Dedicated pages for each race with complete execution plans (see Race Day section for data).

### 6i. Gear Checklists (`/gear`)

Interactive checklists for Houston and Grasslands gear (see Gear section for data). Items can be checked off as packed.

---

## 7. AI Coach (Claude Integration)

### Overview

A built-in coaching chat powered by Claude Sonnet 4.6 (`claude-sonnet-4-6`) via the Anthropic API. The coach can:
1. **Answer training questions** — "Why am I doing intervals this week?" / "Should I skip today if my legs are sore?" / "What should I eat before my long run?"
2. **Modify workouts** — "Move today's tempo to Thursday" / "Reduce my long run to 16 miles this week" / "Add an extra recovery day"
3. **Provide encouragement and accountability** — "I'm struggling with motivation" / "I'm worried I can't hit sub-2:50"
4. **Analyze progress** — "Am I on track for my BQ?" / "How does my mileage compare to the plan?"
5. **Adjust for conditions** — "It's 105°F today, what should I change?" / "I tweaked my calf, how should I modify this week?"

### Implementation

**UI**: A slide-up chat panel triggered by a floating action button (FAB) on every page. The FAB should be:
- Fixed position, bottom-right on mobile
- Teal accent color with a chat/running icon
- Subtle pulse animation to invite interaction
- Opens a full-screen chat panel on mobile, side panel on desktop

**Chat interface**:
- Dark-themed to match the app
- Coach messages: left-aligned, slightly lighter card background
- User messages: right-aligned, teal accent background
- Markdown rendering for coach responses (bold, lists, tables)
- "Thinking" indicator while waiting for response
- Conversation history persisted in Supabase `coach_conversations` table

**API Integration**:

Make requests to the Anthropic API completion endpoint:

```javascript
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    // API key handled server-side, never exposed to client
  },
  body: JSON.stringify({
    model: "claude-sonnet-4-6",
    max_tokens: 1000,
    system: COACH_SYSTEM_PROMPT, // defined below
    messages: conversationHistory,
  })
});
```

**IMPORTANT**: The API key must be stored as a server-side environment variable (`ANTHROPIC_API_KEY`). Create a Next.js API route (`/api/coach`) that proxies requests to the Anthropic API. Never expose the key to the client.

**Coach System Prompt** (include this as the `system` parameter):

```
You are Coach — a knowledgeable, direct, and motivating running coach embedded in a training app. You're coaching an athlete in Dallas, TX who is training for two races:

1. 2027 Houston Marathon (January 17, 2027) — Goal: Sub-2:50 for a Boston Qualifier
2. 2027 Grasslands 100-Mile Ultra (March 20-21, 2027) — Goal: Sub-24 hours (first 100-miler ever)

Athlete profile: Male, 18-34, 150-170 lbs, marathon PR 3:27 (on just 20-30 mpw), currently ramping to 70 mpw peak. Trains mornings 6 days/week (rest Friday). Full gym access. No injury history. Lives in Dallas — uses summer heat for acclimatization.

Training plan: 51-week periodized program:
- Phase 1: Base Building (Wks 1-10, Mar 30 - Jun 7, 25→42 mpw, lifting 3x/wk)
- Phase 2: Speed + Heat (Wks 11-20, Jun 8 - Aug 15, 42→55 mpw, lifting 2x/wk)
- Phase 3: Marathon Specific (Wks 21-36, Aug 16 - Nov 28, 55→70 mpw, lifting 2x/wk)
- Phase 4: Taper + Houston (Wks 37-42, Nov 29 - Jan 17, 50→25 mpw, lifting 1x→0)
- Phase 5: Ultra Bridge (Wks 43-51, Jan 18 - Mar 20, recovery→50 mpw, ultra-specific)

Key paces: Easy 7:50-8:20, Marathon Pace 6:25-6:35, Tempo 6:05-6:15, Interval 5:45-6:00, Recovery 8:30-9:00. Add 20-40 sec/mile in Dallas summer heat.

Your communication style:
- Direct and confident, like a coach who knows their stuff
- Concise — give the answer, then explain if needed. Don't ramble.
- Use running terminology naturally
- Be encouraging but honest. If the athlete is behind, say so constructively.
- When modifying workouts, explain the reasoning briefly
- Use "you" and "your" — this is personal coaching
- When asked about something outside your expertise (medical, etc.), say so and recommend they see a professional

When the athlete asks to modify a workout, respond with your coaching rationale AND include a structured modification in your response using this format:

---WORKOUT_MODIFICATION---
{
  "date": "YYYY-MM-DD",
  "changes": {
    "description": "new workout description",
    "mileage": 8,
    "type": "easy"
  },
  "reason": "brief reason"
}
---END_MODIFICATION---

The app will parse this and apply the changes to the training plan.
```

**Parsing workout modifications**: When the coach response contains a `---WORKOUT_MODIFICATION---` block, the app should:
1. Parse the JSON
2. Show the user a confirmation card: "Coach wants to update [date]'s workout: [description]. Apply this change?"
3. On confirmation, update the workout in Supabase
4. Show a success toast

**Conversation context**: When sending messages to the API, include relevant context:
- Current week number and phase
- Today's planned workout
- Recent completion history (last 7 days)
- Current weather conditions (if relevant)
- Any checked warning signs from the recovery section

This context should be prepended to the user's message as a system-level context block so Coach has situational awareness. Also include the athlete's Garmin-derived profile data (VO2max, resting HR, easy run pace analysis, strengths/weaknesses) when available — see Section 18.

---

## 8. Shareable Public View

### Feature: Share Your Training

The athlete should be able to generate a **public shareable URL** (e.g., `/share/[athleteId]` or `/share/[slug]`) that friends can open to see:

- **Today's workout** — what's on the schedule
- **This week's plan** — the full 7-day view
- **Current progress** — miles to date, completion rate, streak, current phase
- **Race countdowns** — days until Houston and Grasslands
- **Recent workout log** — last 7 completed workouts with notes

The public view is **read-only** — no editing, no logging, no AI coach. Clean, simple, and informative.

**Share button**: On the dashboard header, a share icon that:
1. Copies the public URL to clipboard
2. Shows native share sheet on mobile (Web Share API)
3. Share text: "Follow my training for the Houston Marathon and Grasslands 100! [url]"

**Implementation**: Use Supabase Row Level Security to allow public read access on specific columns of the workouts and workout_logs tables. No auth required for the public view.

---

## 9. Weather Integration

### Implementation

Fetch weather data from OpenWeatherMap API (or WeatherAPI.com):
- **Location**: Dallas, TX (32.7767, -96.7970)
- **Frequency**: Cache for 1 hour. Fetch on dashboard load.
- **Data needed**: Current conditions, hourly forecast (specifically 5-6 AM window), 7-day forecast
- **API key**: Store as `WEATHER_API_KEY` environment variable

### Weather Display

**Compact weather strip** on dashboard:
- Icon (☀️ 🌤️ ⛅ 🌧️ ⛈️) + temp + "feels like" + humidity + wind
- Tap to expand to 7-day mini forecast

### Smart Training Advisories

Based on conditions at 5-6 AM training window. Show as colored banners:

| Condition | Advisory Color | Message |
|-----------|---------------|---------|
| Heat index 85-99°F | Amber | "HEAT ADVISORY — Train by HR, not pace. Add 25-40 sec/mile to all targets. Carry fluids." |
| Heat index 100-104°F | Red | "EXTREME HEAT — Move speed work to treadmill. Cap outdoor runs at 2 hours. Extra hydration." |
| Heat index ≥105°F | Red | "DANGEROUS HEAT — Treadmill for quality sessions. Easy runs only outdoors. Start by 5:00 AM." |
| Thunderstorms | Amber | "⛈️ Storms expected — have an indoor backup plan. Never run during lightning." |
| Rain (no storms) | Blue info | "🌧️ Rain expected — roads may be slick. Adjust footing on turns." |
| Temp < 40°F | Blue info | "🧤 Cold morning — layer up. Gloves and ear cover recommended. Warm up inside first." |
| Wind > 15 mph | Blue info | "💨 Windy — expect slower pace on exposed sections. Use wind for effort calibration." |
| Perfect (55-70°F, low humidity, calm) | Green | "🟢 Perfect running weather. Enjoy it." |

For the heat advisories, also update the pace displays throughout the app to show heat-adjusted versions when appropriate (June through September, or when heat index > 85°F).

---

## 10. Complete 51-Week Training Data

**CRITICAL**: This is the core data that populates the entire app. Store this as seed data in the database. Each day has a workout. Every workout is specific.

The plan week starts on **Monday** and the rest day is **Friday**.

### Phase 1: Base Building (Weeks 1-10, March 30 - June 7, 2026)

**Goal**: Ramp from 25 to 42-47 mpw. Build aerobic base, establish 6-day rhythm, general strength 3x/week. Down weeks at Week 4 and Week 8.

```json
{
  "phase": 1,
  "name": "Base Building",
  "weeks": [
    {
      "week": 1, "startDate": "2026-03-30", "totalMiles": 32, "isDownWeek": false,
      "days": [
        {"day": "Monday",    "date": "2026-03-30", "type": "easy",        "miles": 4, "description": "Easy run 4 miles @ 8:00-8:20/mi + Strength A (Lower Body: Back Squat 4x6, RDL 3x8, Walking Lunges 3x12/leg, Calf Raises 3x15, Plank 3x45s)", "hasStrength": true, "estimatedMinutes": 75},
        {"day": "Tuesday",   "date": "2026-03-31", "type": "easy",        "miles": 5, "description": "Easy run 5 miles @ 8:00-8:20/mi + 6x100m strides (fast but controlled, full recovery between)", "hasStrength": false, "estimatedMinutes": 50},
        {"day": "Wednesday", "date": "2026-04-01", "type": "easy",        "miles": 4, "description": "Easy run 4 miles @ 8:00-8:20/mi + Strength B (Upper + Core: Bench 3x8, Row 3x10, OH Press 3x8, Pallof Press 3x12/side, Dead Bug 3x10/side)", "hasStrength": true, "estimatedMinutes": 75},
        {"day": "Thursday",  "date": "2026-04-02", "type": "easy",        "miles": 5, "description": "Progression run 5 miles — first 3 mi easy, last 2 mi at 7:20-7:40/mi (comfortably quick, not tempo)", "hasStrength": false, "estimatedMinutes": 42},
        {"day": "Friday",    "date": "2026-04-03", "type": "rest",        "miles": 0, "description": "Full rest day. Foam rolling 10-15 min. Mobility work. Hydrate well.", "hasStrength": false, "estimatedMinutes": 15},
        {"day": "Saturday",  "date": "2026-04-04", "type": "long",        "miles": 10, "description": "Long run 10 miles @ 7:30-8:00/mi. Easy, conversational effort throughout. Practice carrying a handheld bottle.", "hasStrength": false, "estimatedMinutes": 78},
        {"day": "Sunday",    "date": "2026-04-05", "type": "easy",        "miles": 4, "description": "Recovery run 4 miles @ 8:30-9:00/mi + Strength C (Posterior: Trap Bar DL 3x8, Step-Ups 3x10/leg, Side Plank 3x30s/side, Copenhagen 2x20s/side, Bird Dog 3x10/side)", "hasStrength": true, "estimatedMinutes": 65}
      ]
    },
    {
      "week": 2, "startDate": "2026-04-06", "totalMiles": 35, "isDownWeek": false,
      "days": [
        {"day": "Monday",    "date": "2026-04-06", "type": "easy",        "miles": 5, "description": "Easy run 5 miles @ 8:00-8:20/mi + Strength A", "hasStrength": true, "estimatedMinutes": 80},
        {"day": "Tuesday",   "date": "2026-04-07", "type": "easy",        "miles": 5, "description": "Easy run 5 miles + 6x100m strides", "hasStrength": false, "estimatedMinutes": 50},
        {"day": "Wednesday", "date": "2026-04-08", "type": "easy",        "miles": 4, "description": "Easy run 4 miles + Strength B", "hasStrength": true, "estimatedMinutes": 75},
        {"day": "Thursday",  "date": "2026-04-09", "type": "easy",        "miles": 6, "description": "Progression run 6 miles — first 4 easy, last 2 at 7:20-7:40/mi", "hasStrength": false, "estimatedMinutes": 50},
        {"day": "Friday",    "date": "2026-04-10", "type": "rest",        "miles": 0, "description": "Full rest. Foam roll + mobility.", "hasStrength": false, "estimatedMinutes": 15},
        {"day": "Saturday",  "date": "2026-04-11", "type": "long",        "miles": 11, "description": "Long run 11 miles @ 7:30-8:00/mi. Easy, conversational. Take a gel at mile 7 to start practicing fueling.", "hasStrength": false, "estimatedMinutes": 86},
        {"day": "Sunday",    "date": "2026-04-12", "type": "easy",        "miles": 4, "description": "Recovery run 4 miles + Strength C", "hasStrength": true, "estimatedMinutes": 65}
      ]
    },
    {
      "week": 3, "startDate": "2026-04-13", "totalMiles": 37, "isDownWeek": false,
      "days": [
        {"day": "Monday",    "date": "2026-04-13", "type": "easy",        "miles": 5, "description": "Easy 5 miles + Strength A", "hasStrength": true, "estimatedMinutes": 80},
        {"day": "Tuesday",   "date": "2026-04-14", "type": "easy",        "miles": 6, "description": "Easy 6 miles + 6x100m strides", "hasStrength": false, "estimatedMinutes": 55},
        {"day": "Wednesday", "date": "2026-04-15", "type": "easy",        "miles": 4, "description": "Easy 4 miles + Strength B", "hasStrength": true, "estimatedMinutes": 75},
        {"day": "Thursday",  "date": "2026-04-16", "type": "easy",        "miles": 6, "description": "Fartlek run 6 miles — 8x30s fast / 90s easy throughout (unstructured speed play)", "hasStrength": false, "estimatedMinutes": 50},
        {"day": "Friday",    "date": "2026-04-17", "type": "rest",        "miles": 0, "description": "Rest. Foam roll + lacrosse ball work on calves.", "hasStrength": false, "estimatedMinutes": 15},
        {"day": "Saturday",  "date": "2026-04-18", "type": "long",        "miles": 12, "description": "Long run 12 miles @ 7:30-8:00/mi. Practice fueling: gel at 45min and 75min.", "hasStrength": false, "estimatedMinutes": 93},
        {"day": "Sunday",    "date": "2026-04-19", "type": "easy",        "miles": 4, "description": "Recovery 4 miles + Strength C", "hasStrength": true, "estimatedMinutes": 65}
      ]
    },
    {
      "week": 4, "startDate": "2026-04-20", "totalMiles": 26, "isDownWeek": true,
      "days": [
        {"day": "Monday",    "date": "2026-04-20", "type": "easy",        "miles": 4, "description": "Easy 4 miles + Strength A (reduce all weights by 10-15% this week)", "hasStrength": true, "estimatedMinutes": 70},
        {"day": "Tuesday",   "date": "2026-04-21", "type": "easy",        "miles": 4, "description": "Easy 4 miles + 4x100m strides (shorter strides session)", "hasStrength": false, "estimatedMinutes": 40},
        {"day": "Wednesday", "date": "2026-04-22", "type": "easy",        "miles": 3, "description": "Recovery 3 miles + Strength B (light)", "hasStrength": true, "estimatedMinutes": 60},
        {"day": "Thursday",  "date": "2026-04-23", "type": "easy",        "miles": 4, "description": "Easy 4 miles, relaxed effort", "hasStrength": false, "estimatedMinutes": 34},
        {"day": "Friday",    "date": "2026-04-24", "type": "rest",        "miles": 0, "description": "Rest. Extra sleep. Full recovery protocol.", "hasStrength": false, "estimatedMinutes": 15},
        {"day": "Saturday",  "date": "2026-04-25", "type": "long",        "miles": 8, "description": "Easy long run 8 miles @ 7:50-8:10/mi. Keep it relaxed — this is a recovery week.", "hasStrength": false, "estimatedMinutes": 64},
        {"day": "Sunday",    "date": "2026-04-26", "type": "easy",        "miles": 3, "description": "Recovery 3 miles + Strength C (light)", "hasStrength": true, "estimatedMinutes": 55}
      ]
    },
    {
      "week": 5, "startDate": "2026-04-27", "totalMiles": 40, "isDownWeek": false,
      "days": [
        {"day": "Monday",    "date": "2026-04-27", "type": "easy",        "miles": 5, "description": "Easy 5 miles + Strength A", "hasStrength": true, "estimatedMinutes": 80},
        {"day": "Tuesday",   "date": "2026-04-28", "type": "easy",        "miles": 6, "description": "Easy 6 miles + 8x100m strides", "hasStrength": false, "estimatedMinutes": 55},
        {"day": "Wednesday", "date": "2026-04-29", "type": "easy",        "miles": 5, "description": "Easy 5 miles + Strength B", "hasStrength": true, "estimatedMinutes": 80},
        {"day": "Thursday",  "date": "2026-04-30", "type": "easy",        "miles": 7, "description": "Progression 7 miles — first 5 easy, last 2 at 7:15-7:35/mi", "hasStrength": false, "estimatedMinutes": 58},
        {"day": "Friday",    "date": "2026-05-01", "type": "rest",        "miles": 0, "description": "Rest. Foam roll + mobility.", "hasStrength": false, "estimatedMinutes": 15},
        {"day": "Saturday",  "date": "2026-05-02", "type": "long",        "miles": 13, "description": "Long run 13 miles @ 7:30-7:50/mi. Fuel every 45 min.", "hasStrength": false, "estimatedMinutes": 100},
        {"day": "Sunday",    "date": "2026-05-03", "type": "easy",        "miles": 4, "description": "Recovery 4 miles + Strength C", "hasStrength": true, "estimatedMinutes": 65}
      ]
    },
    {
      "week": 6, "startDate": "2026-05-04", "totalMiles": 43, "isDownWeek": false,
      "days": [
        {"day": "Monday",    "date": "2026-05-04", "type": "easy",        "miles": 5, "description": "Easy 5 miles + Strength A", "hasStrength": true, "estimatedMinutes": 80},
        {"day": "Tuesday",   "date": "2026-05-05", "type": "easy",        "miles": 7, "description": "Easy 7 miles + 8x100m strides", "hasStrength": false, "estimatedMinutes": 60},
        {"day": "Wednesday", "date": "2026-05-06", "type": "easy",        "miles": 5, "description": "Easy 5 miles + Strength B", "hasStrength": true, "estimatedMinutes": 80},
        {"day": "Thursday",  "date": "2026-05-07", "type": "easy",        "miles": 7, "description": "Fartlek 7 miles — 10x30s fast / 90s easy", "hasStrength": false, "estimatedMinutes": 58},
        {"day": "Friday",    "date": "2026-05-08", "type": "rest",        "miles": 0, "description": "Rest + mobility.", "hasStrength": false, "estimatedMinutes": 15},
        {"day": "Saturday",  "date": "2026-05-09", "type": "long",        "miles": 14, "description": "Long run 14 miles @ 7:30-7:50/mi. Practice race-day fueling every 5K.", "hasStrength": false, "estimatedMinutes": 108},
        {"day": "Sunday",    "date": "2026-05-10", "type": "easy",        "miles": 5, "description": "Recovery 5 miles + Strength C", "hasStrength": true, "estimatedMinutes": 70}
      ]
    },
    {
      "week": 7, "startDate": "2026-05-11", "totalMiles": 43, "isDownWeek": false,
      "days": [
        {"day": "Monday",    "date": "2026-05-11", "type": "easy",        "miles": 5, "description": "Easy 5 miles + Strength A", "hasStrength": true, "estimatedMinutes": 80},
        {"day": "Tuesday",   "date": "2026-05-12", "type": "easy",        "miles": 7, "description": "Easy 7 miles + 8x100m strides", "hasStrength": false, "estimatedMinutes": 60},
        {"day": "Wednesday", "date": "2026-05-13", "type": "easy",        "miles": 5, "description": "Easy 5 miles + Strength B", "hasStrength": true, "estimatedMinutes": 80},
        {"day": "Thursday",  "date": "2026-05-14", "type": "easy",        "miles": 7, "description": "Progression 7 miles — first 4 easy, miles 5-6 moderate, mile 7 at tempo effort (6:15-6:25)", "hasStrength": false, "estimatedMinutes": 58},
        {"day": "Friday",    "date": "2026-05-15", "type": "rest",        "miles": 0, "description": "Rest. Focus on sleep and hydration.", "hasStrength": false, "estimatedMinutes": 15},
        {"day": "Saturday",  "date": "2026-05-16", "type": "long",        "miles": 14, "description": "Long run 14 miles @ 7:30-7:50/mi. Last 2 miles at marathon effort (6:30-6:40).", "hasStrength": false, "estimatedMinutes": 108},
        {"day": "Sunday",    "date": "2026-05-17", "type": "easy",        "miles": 5, "description": "Recovery 5 miles + Strength C", "hasStrength": true, "estimatedMinutes": 70}
      ]
    },
    {
      "week": 8, "startDate": "2026-05-18", "totalMiles": 32, "isDownWeek": true,
      "days": [
        {"day": "Monday",    "date": "2026-05-18", "type": "easy",        "miles": 4, "description": "Easy 4 miles + Strength A (light)", "hasStrength": true, "estimatedMinutes": 70},
        {"day": "Tuesday",   "date": "2026-05-19", "type": "easy",        "miles": 5, "description": "Easy 5 miles + 4x100m strides", "hasStrength": false, "estimatedMinutes": 45},
        {"day": "Wednesday", "date": "2026-05-20", "type": "easy",        "miles": 4, "description": "Easy 4 miles + Strength B (light)", "hasStrength": true, "estimatedMinutes": 70},
        {"day": "Thursday",  "date": "2026-05-21", "type": "easy",        "miles": 5, "description": "Easy 5 miles, relaxed", "hasStrength": false, "estimatedMinutes": 42},
        {"day": "Friday",    "date": "2026-05-22", "type": "rest",        "miles": 0, "description": "Rest. Recovery protocol.", "hasStrength": false, "estimatedMinutes": 15},
        {"day": "Saturday",  "date": "2026-05-23", "type": "long",        "miles": 10, "description": "Easy long run 10 miles. Down week — keep it very relaxed.", "hasStrength": false, "estimatedMinutes": 80},
        {"day": "Sunday",    "date": "2026-05-24", "type": "easy",        "miles": 4, "description": "Recovery 4 miles + Strength C (light)", "hasStrength": true, "estimatedMinutes": 60}
      ]
    },
    {
      "week": 9, "startDate": "2026-05-25", "totalMiles": 45, "isDownWeek": false,
      "days": [
        {"day": "Monday",    "date": "2026-05-25", "type": "easy",        "miles": 6, "description": "Easy 6 miles + Strength A", "hasStrength": true, "estimatedMinutes": 85},
        {"day": "Tuesday",   "date": "2026-05-26", "type": "easy",        "miles": 7, "description": "Easy 7 miles + 8x100m strides. Consider entering a 5K race this week or next.", "hasStrength": false, "estimatedMinutes": 60},
        {"day": "Wednesday", "date": "2026-05-27", "type": "easy",        "miles": 5, "description": "Easy 5 miles + Strength B", "hasStrength": true, "estimatedMinutes": 80},
        {"day": "Thursday",  "date": "2026-05-28", "type": "tempo",       "miles": 7, "description": "First real tempo! 7 miles total: 2mi warmup, 3mi @ 6:15-6:25/mi (tempo), 2mi cooldown. The tempo should feel comfortably hard — short phrases only.", "hasStrength": false, "estimatedMinutes": 56},
        {"day": "Friday",    "date": "2026-05-29", "type": "rest",        "miles": 0, "description": "Rest.", "hasStrength": false, "estimatedMinutes": 15},
        {"day": "Saturday",  "date": "2026-05-30", "type": "long",        "miles": 15, "description": "Long run 15 miles @ 7:30-7:50/mi. Fuel every 45 min. This is your longest run yet — respect the distance.", "hasStrength": false, "estimatedMinutes": 115},
        {"day": "Sunday",    "date": "2026-05-31", "type": "easy",        "miles": 5, "description": "Recovery 5 miles + Strength C", "hasStrength": true, "estimatedMinutes": 70}
      ]
    },
    {
      "week": 10, "startDate": "2026-06-01", "totalMiles": 47, "isDownWeek": false,
      "days": [
        {"day": "Monday",    "date": "2026-06-01", "type": "easy",        "miles": 6, "description": "Easy 6 miles + Strength A. Race a 5K this week if available (goal: 20:00-20:30).", "hasStrength": true, "estimatedMinutes": 85},
        {"day": "Tuesday",   "date": "2026-06-02", "type": "easy",        "miles": 7, "description": "Easy 7 miles + 8x100m strides", "hasStrength": false, "estimatedMinutes": 60},
        {"day": "Wednesday", "date": "2026-06-03", "type": "easy",        "miles": 5, "description": "Easy 5 miles + Strength B", "hasStrength": true, "estimatedMinutes": 80},
        {"day": "Thursday",  "date": "2026-06-04", "type": "tempo",       "miles": 8, "description": "Tempo 8 miles: 2mi warmup, 4mi @ 6:10-6:20/mi, 2mi cooldown", "hasStrength": false, "estimatedMinutes": 62},
        {"day": "Friday",    "date": "2026-06-05", "type": "rest",        "miles": 0, "description": "Rest. Phase 1 complete! You've built your base. Celebrate.", "hasStrength": false, "estimatedMinutes": 15},
        {"day": "Saturday",  "date": "2026-06-06", "type": "long",        "miles": 16, "description": "Long run 16 miles @ 7:20-7:50/mi. Last 3 miles at MP effort (6:30-6:40). Your longest run — big milestone!", "hasStrength": false, "estimatedMinutes": 122},
        {"day": "Sunday",    "date": "2026-06-07", "type": "easy",        "miles": 5, "description": "Recovery 5 miles + Strength C", "hasStrength": true, "estimatedMinutes": 70}
      ]
    }
  ]
}
```

### Phase 2: Speed + Heat Acclimatization (Weeks 11-20, June 8 - August 15, 2026)

**Goal**: Layer in VO2max intervals and tempo. Acclimatize to Dallas heat. Build from 42 to 55 mpw. Lifting drops to 2x/week. Down weeks at Week 14 and Week 18. Transition to HR-based training in heat.

**IMPORTANT**: For all Phase 2 workouts, the app should show heat-adjusted paces in amber alongside normal paces when the weather widget shows heat index > 85°F. Add a note to every workout: "☀️ Heat season — train by effort and HR, not pace. Slow down as needed."

```json
{
  "phase": 2,
  "name": "Speed + Heat Acclimatization",
  "weeks": [
    {
      "week": 11, "startDate": "2026-06-08", "totalMiles": 45, "isDownWeek": false,
      "days": [
        {"day": "Monday",    "date": "2026-06-08", "type": "easy",        "miles": 6, "description": "Easy 6mi + Strength A (Phase 2: Front Squat 3x6, SL RDL 3x8/side, Box Jumps 3x6, Banded Clamshells 3x15/side, Anti-Rotation Press 3x10/side). Welcome to heat season — run by effort, not pace.", "hasStrength": true, "estimatedMinutes": 80},
        {"day": "Tuesday",   "date": "2026-06-09", "type": "intervals",   "miles": 8, "description": "INTERVALS: 8mi total — 2mi warmup, 4x1000m @ 5:50-6:00/mi (3:37-3:43 per 1K) w/ 90s jog recovery, 2mi cooldown. In heat: run by effort (Zone 5), accept slower splits. Treadmill OK if heat index >105°F.", "hasStrength": false, "estimatedMinutes": 65},
        {"day": "Wednesday", "date": "2026-06-10", "type": "recovery",    "miles": 4, "description": "Recovery 4 miles @ 8:30-9:00/mi. Zone 1-2 ONLY. This should feel absurdly easy.", "hasStrength": false, "estimatedMinutes": 36},
        {"day": "Thursday",  "date": "2026-06-11", "type": "tempo",       "miles": 8, "description": "TEMPO: 8mi total — 2mi warmup, 4mi @ 6:10-6:20/mi (or HR Zone 4), 2mi cooldown. Comfortably hard — short phrases only.", "hasStrength": false, "estimatedMinutes": 62},
        {"day": "Friday",    "date": "2026-06-12", "type": "rest",        "miles": 0, "description": "Rest + Strength B (Phase 2: Bulgarian Split Squat 3x8/leg, Hip Thrust 3x12, SL Calf Raises 3x12/side, Plank Variations 3x45s, Hanging Knee Raises 3x12)", "hasStrength": true, "estimatedMinutes": 40},
        {"day": "Saturday",  "date": "2026-06-13", "type": "long",        "miles": 14, "description": "Long run 14mi @ easy effort (HR Zone 2). Start by 5:30 AM. Carry fluids + electrolytes. Fuel every 45min.", "hasStrength": false, "estimatedMinutes": 115},
        {"day": "Sunday",    "date": "2026-06-14", "type": "easy",        "miles": 5, "description": "Recovery 5mi @ 8:30-9:00/mi. Zone 2.", "hasStrength": false, "estimatedMinutes": 45}
      ]
    },
    {
      "week": 12, "startDate": "2026-06-15", "totalMiles": 47, "isDownWeek": false,
      "days": [
        {"day": "Monday",    "date": "2026-06-15", "type": "easy",        "miles": 6, "description": "Easy 6mi + Strength A", "hasStrength": true, "estimatedMinutes": 80},
        {"day": "Tuesday",   "date": "2026-06-16", "type": "intervals",   "miles": 9, "description": "INTERVALS: 9mi — 2mi WU, 5x1000m @ 5:50/mi w/ 90s jog, 2mi CD", "hasStrength": false, "estimatedMinutes": 72},
        {"day": "Wednesday", "date": "2026-06-17", "type": "recovery",    "miles": 4, "description": "Recovery 4mi. Zone 1-2.", "hasStrength": false, "estimatedMinutes": 36},
        {"day": "Thursday",  "date": "2026-06-18", "type": "tempo",       "miles": 9, "description": "TEMPO: 9mi — 2mi WU, 5mi @ 6:10-6:20/mi, 2mi CD", "hasStrength": false, "estimatedMinutes": 68},
        {"day": "Friday",    "date": "2026-06-19", "type": "rest",        "miles": 0, "description": "Rest + Strength B", "hasStrength": true, "estimatedMinutes": 40},
        {"day": "Saturday",  "date": "2026-06-20", "type": "long",        "miles": 15, "description": "Long run 15mi easy. Last 3mi at MP effort by HR (Zone 3). Start early.", "hasStrength": false, "estimatedMinutes": 120},
        {"day": "Sunday",    "date": "2026-06-21", "type": "easy",        "miles": 4, "description": "Recovery 4mi", "hasStrength": false, "estimatedMinutes": 36}
      ]
    },
    {
      "week": 13, "startDate": "2026-06-22", "totalMiles": 49, "isDownWeek": false,
      "days": [
        {"day": "Monday",    "date": "2026-06-22", "type": "easy",        "miles": 6, "description": "Easy 6mi + Strength A", "hasStrength": true, "estimatedMinutes": 80},
        {"day": "Tuesday",   "date": "2026-06-23", "type": "intervals",   "miles": 9, "description": "INTERVALS: 9mi — 2mi WU, 5x1000m @ 5:45-5:55/mi w/ 90s jog, 2mi CD. Heat is building — if heat index >100°F, do this on the treadmill.", "hasStrength": false, "estimatedMinutes": 72},
        {"day": "Wednesday", "date": "2026-06-24", "type": "recovery",    "miles": 5, "description": "Recovery 5mi. Truly easy.", "hasStrength": false, "estimatedMinutes": 45},
        {"day": "Thursday",  "date": "2026-06-25", "type": "tempo",       "miles": 9, "description": "Cruise intervals: 9mi — 2mi WU, 3x2mi @ 6:10/mi w/ 90s jog between, 1mi CD", "hasStrength": false, "estimatedMinutes": 68},
        {"day": "Friday",    "date": "2026-06-26", "type": "rest",        "miles": 0, "description": "Rest + Strength B", "hasStrength": true, "estimatedMinutes": 40},
        {"day": "Saturday",  "date": "2026-06-27", "type": "long",        "miles": 16, "description": "Long run 16mi easy effort. Start by 5:00 AM. Cap at 2:15 if extreme heat. Carry fluids.", "hasStrength": false, "estimatedMinutes": 128},
        {"day": "Sunday",    "date": "2026-06-28", "type": "easy",        "miles": 4, "description": "Recovery 4mi", "hasStrength": false, "estimatedMinutes": 36}
      ]
    },
    {
      "week": 14, "startDate": "2026-06-29", "totalMiles": 35, "isDownWeek": true,
      "days": [
        {"day": "Monday",    "date": "2026-06-29", "type": "easy",        "miles": 5, "description": "Easy 5mi + Strength A (light)", "hasStrength": true, "estimatedMinutes": 70},
        {"day": "Tuesday",   "date": "2026-06-30", "type": "easy",        "miles": 5, "description": "Easy 5mi + 4x100m strides", "hasStrength": false, "estimatedMinutes": 45},
        {"day": "Wednesday", "date": "2026-07-01", "type": "recovery",    "miles": 4, "description": "Recovery 4mi", "hasStrength": false, "estimatedMinutes": 36},
        {"day": "Thursday",  "date": "2026-07-02", "type": "tempo",       "miles": 6, "description": "Light tempo: 6mi — 2mi WU, 2mi @ 6:20/mi, 2mi CD", "hasStrength": false, "estimatedMinutes": 46},
        {"day": "Friday",    "date": "2026-07-03", "type": "rest",        "miles": 0, "description": "Rest + Strength B (light)", "hasStrength": true, "estimatedMinutes": 35},
        {"day": "Saturday",  "date": "2026-07-04", "type": "long",        "miles": 10, "description": "Easy 10mi — Fourth of July run. Keep it relaxed. Hydrate extra.", "hasStrength": false, "estimatedMinutes": 82},
        {"day": "Sunday",    "date": "2026-07-05", "type": "easy",        "miles": 5, "description": "Recovery 5mi", "hasStrength": false, "estimatedMinutes": 45}
      ]
    },
    {
      "week": 15, "startDate": "2026-07-06", "totalMiles": 50, "isDownWeek": false,
      "days": [
        {"day": "Monday",    "date": "2026-07-06", "type": "easy",        "miles": 6, "description": "Easy 6mi + Strength A. Deep into heat season now. All easy running by HR Zone 2.", "hasStrength": true, "estimatedMinutes": 80},
        {"day": "Tuesday",   "date": "2026-07-07", "type": "intervals",   "miles": 10, "description": "INTERVALS: 10mi — 2mi WU, 6x1000m @ 5:45-5:55/mi w/ 90s jog, 2mi CD. Treadmill strongly recommended if heat index >100°F.", "hasStrength": false, "estimatedMinutes": 78},
        {"day": "Wednesday", "date": "2026-07-08", "type": "recovery",    "miles": 5, "description": "Recovery 5mi. Zone 1-2.", "hasStrength": false, "estimatedMinutes": 45},
        {"day": "Thursday",  "date": "2026-07-09", "type": "tempo",       "miles": 9, "description": "TEMPO: 9mi — 2mi WU, 5mi @ LT (6:10-6:20/mi or HR Zone 4), 2mi CD", "hasStrength": false, "estimatedMinutes": 68},
        {"day": "Friday",    "date": "2026-07-10", "type": "rest",        "miles": 0, "description": "Rest + Strength B", "hasStrength": true, "estimatedMinutes": 40},
        {"day": "Saturday",  "date": "2026-07-11", "type": "long",        "miles": 16, "description": "Long run 16mi. All easy. Start 5:00 AM. Carry 24oz+ fluids. Electrolytes mandatory.", "hasStrength": false, "estimatedMinutes": 130},
        {"day": "Sunday",    "date": "2026-07-12", "type": "easy",        "miles": 4, "description": "Recovery 4mi", "hasStrength": false, "estimatedMinutes": 36}
      ]
    },
    {
      "week": 16, "startDate": "2026-07-13", "totalMiles": 51, "isDownWeek": false,
      "days": [
        {"day": "Monday",    "date": "2026-07-13", "type": "easy",        "miles": 7, "description": "Easy 7mi + Strength A", "hasStrength": true, "estimatedMinutes": 85},
        {"day": "Tuesday",   "date": "2026-07-14", "type": "intervals",   "miles": 10, "description": "INTERVALS: 10mi — 2mi WU, 6x1000m @ 5:45/mi w/ 90s jog, 2mi CD", "hasStrength": false, "estimatedMinutes": 78},
        {"day": "Wednesday", "date": "2026-07-15", "type": "recovery",    "miles": 5, "description": "Recovery 5mi", "hasStrength": false, "estimatedMinutes": 45},
        {"day": "Thursday",  "date": "2026-07-16", "type": "tempo",       "miles": 9, "description": "Cruise intervals: 3x2mi @ 6:10/mi w/ 90s jog. 2mi WU + 1mi CD.", "hasStrength": false, "estimatedMinutes": 68},
        {"day": "Friday",    "date": "2026-07-17", "type": "rest",        "miles": 0, "description": "Rest + Strength B", "hasStrength": true, "estimatedMinutes": 40},
        {"day": "Saturday",  "date": "2026-07-18", "type": "long",        "miles": 17, "description": "Long run 17mi. Easy with last 3mi at MP effort (HR Zone 3). If 10K race available late July — consider racing as heat fitness check.", "hasStrength": false, "estimatedMinutes": 135},
        {"day": "Sunday",    "date": "2026-07-19", "type": "easy",        "miles": 3, "description": "Recovery 3mi", "hasStrength": false, "estimatedMinutes": 27}
      ]
    },
    {
      "week": 17, "startDate": "2026-07-20", "totalMiles": 52, "isDownWeek": false,
      "days": [
        {"day": "Monday",    "date": "2026-07-20", "type": "easy",        "miles": 7, "description": "Easy 7mi + Strength A", "hasStrength": true, "estimatedMinutes": 85},
        {"day": "Tuesday",   "date": "2026-07-21", "type": "intervals",   "miles": 10, "description": "INTERVALS: 10mi — 2mi WU, 3x1600m @ 5:50/mi (5:50 per mile = 5:47 per 1600) w/ 2min jog, 2mi CD. Longer reps this week.", "hasStrength": false, "estimatedMinutes": 78},
        {"day": "Wednesday", "date": "2026-07-22", "type": "recovery",    "miles": 5, "description": "Recovery 5mi", "hasStrength": false, "estimatedMinutes": 45},
        {"day": "Thursday",  "date": "2026-07-23", "type": "tempo",       "miles": 10, "description": "TEMPO: 10mi — 2mi WU, 6mi @ 6:10-6:15/mi, 2mi CD. Longest tempo yet.", "hasStrength": false, "estimatedMinutes": 75},
        {"day": "Friday",    "date": "2026-07-24", "type": "rest",        "miles": 0, "description": "Rest + Strength B", "hasStrength": true, "estimatedMinutes": 40},
        {"day": "Saturday",  "date": "2026-07-25", "type": "long",        "miles": 17, "description": "Long run 17mi easy effort. Full heat protocol — early start, fluids, electrolytes.", "hasStrength": false, "estimatedMinutes": 135},
        {"day": "Sunday",    "date": "2026-07-26", "type": "easy",        "miles": 3, "description": "Recovery 3mi", "hasStrength": false, "estimatedMinutes": 27}
      ]
    },
    {
      "week": 18, "startDate": "2026-07-27", "totalMiles": 36, "isDownWeek": true,
      "days": [
        {"day": "Monday",    "date": "2026-07-27", "type": "easy",        "miles": 5, "description": "Easy 5mi + Strength A (light)", "hasStrength": true, "estimatedMinutes": 70},
        {"day": "Tuesday",   "date": "2026-07-28", "type": "intervals",   "miles": 7, "description": "Light speed: 7mi — 2mi WU, 4x800m @ 5:45/mi w/ 90s jog, 2mi CD", "hasStrength": false, "estimatedMinutes": 55},
        {"day": "Wednesday", "date": "2026-07-29", "type": "recovery",    "miles": 4, "description": "Recovery 4mi", "hasStrength": false, "estimatedMinutes": 36},
        {"day": "Thursday",  "date": "2026-07-30", "type": "easy",        "miles": 5, "description": "Easy 5mi. If racing a 10K this weekend, keep this very light.", "hasStrength": false, "estimatedMinutes": 42},
        {"day": "Friday",    "date": "2026-07-31", "type": "rest",        "miles": 0, "description": "Rest + Strength B (light). Pre-race if 10K tomorrow.", "hasStrength": true, "estimatedMinutes": 35},
        {"day": "Saturday",  "date": "2026-08-01", "type": "race",        "miles": 6.2, "description": "🏁 10K TUNE-UP RACE — Goal: 41:30-42:30 (6:41-6:51/mi). This is a heat fitness check. Expect slower than cool-weather potential. Focus on effort and racing competitiveness. Warm up 2mi, race 6.2mi.", "hasStrength": false, "estimatedMinutes": 62},
        {"day": "Sunday",    "date": "2026-08-02", "type": "easy",        "miles": 4, "description": "Recovery 4mi — shake out race legs", "hasStrength": false, "estimatedMinutes": 36}
      ]
    },
    {
      "week": 19, "startDate": "2026-08-03", "totalMiles": 53, "isDownWeek": false,
      "days": [
        {"day": "Monday",    "date": "2026-08-03", "type": "easy",        "miles": 7, "description": "Easy 7mi + Strength A. Last few weeks of peak heat. The payoff is coming.", "hasStrength": true, "estimatedMinutes": 85},
        {"day": "Tuesday",   "date": "2026-08-04", "type": "intervals",   "miles": 10, "description": "INTERVALS: 10mi — 2mi WU, 4x1200m @ 5:45/mi w/ 2min jog, 2mi CD", "hasStrength": false, "estimatedMinutes": 78},
        {"day": "Wednesday", "date": "2026-08-05", "type": "recovery",    "miles": 5, "description": "Recovery 5mi", "hasStrength": false, "estimatedMinutes": 45},
        {"day": "Thursday",  "date": "2026-08-06", "type": "tempo",       "miles": 10, "description": "TEMPO: 10mi — 2mi WU, 6mi @ 6:10/mi, 2mi CD", "hasStrength": false, "estimatedMinutes": 75},
        {"day": "Friday",    "date": "2026-08-07", "type": "rest",        "miles": 0, "description": "Rest + Strength B", "hasStrength": true, "estimatedMinutes": 40},
        {"day": "Saturday",  "date": "2026-08-08", "type": "long",        "miles": 18, "description": "Long run 18mi — last 4mi at MP effort (HR Zone 3). Peak long run for Phase 2. Start at 5:00 AM.", "hasStrength": false, "estimatedMinutes": 142},
        {"day": "Sunday",    "date": "2026-08-09", "type": "easy",        "miles": 3, "description": "Recovery 3mi", "hasStrength": false, "estimatedMinutes": 27}
      ]
    },
    {
      "week": 20, "startDate": "2026-08-10", "totalMiles": 55, "isDownWeek": false,
      "days": [
        {"day": "Monday",    "date": "2026-08-10", "type": "easy",        "miles": 7, "description": "Easy 7mi + Strength A. Final week of Phase 2. Temps starting to break soon.", "hasStrength": true, "estimatedMinutes": 85},
        {"day": "Tuesday",   "date": "2026-08-11", "type": "intervals",   "miles": 10, "description": "INTERVALS: 10mi — 2mi WU, 6x1000m @ 5:45/mi w/ 90s jog, 2mi CD. Best effort of the summer.", "hasStrength": false, "estimatedMinutes": 78},
        {"day": "Wednesday", "date": "2026-08-12", "type": "recovery",    "miles": 5, "description": "Recovery 5mi", "hasStrength": false, "estimatedMinutes": 45},
        {"day": "Thursday",  "date": "2026-08-13", "type": "tempo",       "miles": 10, "description": "TEMPO: 10mi — 2mi WU, 6mi @ 6:05-6:15/mi (pushing the pace slightly), 2mi CD", "hasStrength": false, "estimatedMinutes": 75},
        {"day": "Friday",    "date": "2026-08-14", "type": "rest",        "miles": 0, "description": "Rest + Strength B. Phase 2 complete! You survived the heat. The gains are banked.", "hasStrength": true, "estimatedMinutes": 40},
        {"day": "Saturday",  "date": "2026-08-15", "type": "long",        "miles": 18, "description": "Long run 18mi easy. Last 3mi at MP effort. Final Phase 2 long run.", "hasStrength": false, "estimatedMinutes": 142},
        {"day": "Sunday",    "date": "2026-08-16", "type": "easy",        "miles": 5, "description": "Recovery 5mi. Tomorrow Phase 3 begins — this is where BQs are made.", "hasStrength": false, "estimatedMinutes": 45}
      ]
    }
  ]
}
```

### Phase 3: Marathon Specific (Weeks 21-36, August 16 - November 28, 2026)

**NOTE TO CLAUDE CODE**: Due to the length of this spec, I'm providing Phase 3 in a condensed format. Generate the full day-by-day data following these patterns and the weekly structure below. Each week follows the same daily pattern:

- **Monday**: Easy 6-8mi + Strength (Phase 3: Back Squat 3x5 RPE 6-7, SL RDL 3x8/side, Weighted Step-Ups 3x8/side, Core circuit 2 rounds)
- **Tuesday**: QUALITY #1 — MP run or tempo (10-12mi with 6-8mi @ MP 6:29/mi)
- **Wednesday**: Easy/recovery 5-7mi
- **Thursday**: QUALITY #2 — Intervals or tempo (alternate weekly: VO2max week / tempo week)
- **Friday**: REST + Strength B (Phase 3: Hip Thrust 3x10, Clamshells + Monster Walks 2x15/side, SL Calf Raises 3x15, Copenhagen Plank 2x20s/side, Pallof Press 2x12/side)
- **Saturday**: LONG RUN (key session — see progression below)
- **Sunday**: Easy 5-7mi recovery

**Weekly Mileage & Long Run Progression (Phase 3):**

| Week | Total Miles | Long Run | MP Work in Long Run | Notes |
|------|-----------|----------|-------------------|-------|
| 21 | 55 | 16mi | Last 4mi @ MP | Heat starting to break — paces improving |
| 22 | 57 | 17mi | Easy throughout | Aerobic volume |
| 23 | 58 | 18mi | Miles 10-16 @ MP (6mi) | First major MP long run |
| 24 (Down) | 42 | 12mi | Easy | Recovery week |
| 25 | 58 | 18mi | Last 6mi @ MP | |
| 26 | 60 | 19mi | Miles 10-17 @ MP (7mi) | Cool mornings — feel the heat payoff |
| 27 | 62 | 20mi | Easy throughout | First 20-miler! Milestone! |
| 28 (Down) | 45 | 14mi | Easy | Recovery week |
| 29 | 55 | 13.1 RACE | HALF MARATHON RACE: 1:22-1:24 | THE fitness checkpoint. 1:23 = sub-2:50 predicted |
| 30 | 62 | 18mi | Miles 8-16 @ MP (8mi) | |
| 31 | 65 | 20mi | Last 8mi @ MP | |
| 32 (Down) | 48 | 14mi | Easy | Recovery week |
| 33 | 65 | 20mi | Miles 6-18 @ MP (12mi) | Biggest MP session |
| 34 | 70 | 22mi | Miles 8-18 @ MP (10mi) | ⭐ PEAK WEEK — capstone workout |
| 35 | 65 | 20mi | Last 6mi @ MP | Begin volume taper |
| 36 (Down) | 48 | 14mi | Easy | Mental taper begins |

**For Week 29 (Half Marathon Race Week)**, adjust the week:
- Monday: Easy 5mi + light strength
- Tuesday: Easy 6mi + 4x100m strides
- Wednesday: Easy 4mi
- Thursday: Easy 3mi + 4x100m strides (pre-race shakeout)
- Friday: REST
- Saturday: Easy 3mi shakeout (race is Sunday)
- Sunday: 🏁 HALF MARATHON RACE — Goal: 1:22-1:24 (6:17-6:24/mi)

### Phase 4: Taper + Houston (Weeks 37-42, November 29, 2026 - January 17, 2027)

| Week | Total Miles | Key Sessions | Notes |
|------|-----------|-------------|-------|
| 37 | 50 | Tue: 8mi w/5@MP; Sat: 16mi long (easy) | Volume drop begins |
| 38 | 45 | Tue: 6mi w/4@MP; Sat: 14mi long (last 3@MP) | Last long MP session |
| 39 | 40 | 🏁 10K race (goal: 40:30-41:30); Sat: 12mi easy | Final sharpener |
| 40 | 35 | Tue: 6mi w/3@MP; Sat: 10mi easy | Big volume drop |
| 41 | 28 | Tue: 5mi w/2@MP + strides; Sat: 8mi easy | Legs feel fresh |
| 42 (RACE) | ~18+Race | Mon:5e, Tue:4w/4x800@MP, Wed:3e, Thu:2+strides, Fri:OFF, Sat:2 shakeout, **Sun: 🏁 HOUSTON MARATHON** | RACE WEEK |

**Phase 4 Strength**: 1x/week only. Goblet Squat 2x8 light, SL RDL 2x8 light, Plank+Side Plank 2x30s, Calf Raises 2x15. **STOP lifting entirely by January 7** (10 days before race).

### Phase 5: Ultra Bridge — Marathon to Grasslands (Weeks 43-51, January 18 - March 20, 2027)

| Week | Total Miles | Key Sessions | Focus |
|------|-----------|-------------|-------|
| 43 (Recovery 1) | 15-20 | Walk/jog only, no pace targets | Rest, refuel, massage, sleep |
| 44 (Recovery 2) | 20-25 | Easy runs 30-45 min; gentle strides late week | Rebuild without stress |
| 45 (Recovery 3) | 25-30 | Return to easy running; 1 trail run 5-8mi | Introduce trail surface |
| 46 (Build 1) | 35-40 | Sat: 15mi trail; Sun: 8mi easy (BACK-TO-BACK) | First B2B weekend |
| 47 (Build 2) | 40-45 | Sat: 18mi trail; Sun: 10mi easy (B2B) | Practice fueling every 30min |
| 48 (Build 3) | 45-50 | Sat: 20-22mi trail; Sun: 10-12mi (B2B) | Peak B2B; longest ultra volume |
| 49 (Down) | 30-35 | Sat: 12mi easy trail; Sun: 6mi easy | Absorb, recover, gear check |
| 50 (Sharpen) | 25-30 | Sat: 10mi trail at race pace; practice routine | Final dress rehearsal |
| 51 (RACE) | ~10+Race | Mon:4e, Tue:3e, Wed-Thu:OFF, Fri:3 shakeout, **Sat-Sun: 🏁 GRASSLANDS 100** | RACE WEEK |

**Phase 5 Strength**: Weeks 43-45 bodyweight only (squats, lunges, glute bridges, planks 2x/wk, 20-30min). Weeks 46-50: Light weights, high reps — SL squat variations, hip thrusts, eccentric calf lowers, core circuit + step-downs, monster walks, Copenhagen plank. **STOP 7 days before Grasslands.**

**Phase 5 Ultra-Specific Notes** (include in workout descriptions):
- Practice night running at least 2x (even 30-45 min after dark) — dial in headlamp setup
- Practice eating while running: alternate gels, real food (PB&J, potatoes), broth
- Run on trails at LBJ Grasslands if possible for course familiarity
- Practice aid station routine: walk in, refill, eat, assess, leave in 3-5 min
- Back-to-back long runs are the #1 most important ultra workout

---

## 11. Training Paces Reference

Display these in a reference section and use them throughout workout descriptions:

| Zone | Normal Pace | Purpose | Heat Adjusted (+25-40s) |
|------|------------|---------|----------------------|
| Recovery | 8:30-9:00/mi | Active recovery | 9:00-9:45/mi |
| Easy Aerobic | 7:50-8:20/mi | Daily easy runs | 8:15-9:00/mi |
| Long Run | 7:20-7:50/mi | Endurance | 7:45-8:30/mi |
| Marathon Pace | 6:25-6:35/mi | Race-specific | 6:45-7:10/mi |
| Tempo / LT | 6:05-6:15/mi | Stamina | 6:25-6:45/mi |
| VO2max / 5K | 5:45-6:00/mi | Aerobic ceiling | 6:00-6:25/mi |
| Repetition | 5:30-5:45/mi | Neuromuscular speed | 5:40-6:05/mi |

### Heart Rate Zones (primary method June-September)
| Zone | % Max HR | Use |
|------|---------|-----|
| Zone 1 | 60-65% | Recovery |
| Zone 2 | 65-75% | Easy, long runs |
| Zone 3 | 76-85% | Marathon pace, moderate tempo |
| Zone 4 | 85-90% | Threshold, hard tempo |
| Zone 5 | 90-100% | Intervals, racing |

---

## 12. Strength Training Programs

(Already embedded in the workout descriptions above. Ensure the app can display the full exercise details when a workout has `hasStrength: true`.)

**Phase 1 (Wks 1-10) — 3x/week**:
- Day A (Monday): Back Squat 4x6 RPE 7-8, RDL 3x8, Walking Lunges 3x12/leg, Weighted Calf Raises 3x15, Plank 3x45s
- Day B (Wednesday): Bench Press 3x8, Barbell Row 3x10, OH Press 3x8, Pallof Press 3x12/side, Dead Bug 3x10/side
- Day C (Sunday): Trap Bar DL 3x8, SL Step-Ups 3x10/leg, Side Plank 3x30s/side, Copenhagen Plank 2x20s/side, Bird Dog 3x10/side

**Phase 2 (Wks 11-20) — 2x/week**:
- Day A (Monday): Front Squat 3x6, SL RDL 3x8/side, Box Jumps 3x6, Banded Clamshells 3x15/side, Anti-Rotation Press 3x10/side
- Day B (Friday): Bulgarian Split Squat 3x8/leg, Hip Thrust 3x12, SL Calf Raises 3x12/side, Plank Variations 3x45s, Hanging Knee Raises 3x12

**Phase 3 (Wks 21-36) — 2x/week**:
- Day A (Monday): Back Squat 3x5 RPE 6-7, SL RDL 3x8/side, Weighted Step-Ups 3x8/side, Core circuit 2 rounds
- Day B (Friday): Hip Thrust 3x10, Clamshells + Monster Walks 2x15/side, SL Calf Raises 3x15, Copenhagen Plank 2x20s/side, Pallof Press 2x12/side

**Phase 4 (Wks 37-42) — 1x/week**: Goblet Squat 2x8 light, SL RDL 2x8, Plank+Side Plank 2x30s, Calf Raises 2x15. Stop 10 days before race.

**Phase 5 (Wks 43-51) — 2x/week**: Bodyweight→light weights. SL squat variations, hip thrusts, eccentric calf lowers, core. Stop 7 days before Grasslands.

---

## 13. Recovery & Mobility Protocols

(From the Runner's Kinetic Chain document. Store as reference data and serve dynamically based on workout type.)

### Daily Recovery by Workout Type

**Easy run days**:
1. Massage gun: 30-60s each — calves, glutes, hip flexors (primer)
2. Foam roll: 2min calves, 2min quads, 2min glutes (figure-4), 90s IT band
3. Static stretching: Standing calf stretch (gastroc), wall calf stretch bent knee (soleus), half-kneeling hip flexor, pigeon pose. 30s+ holds.

**Quality days (intervals/tempo)**:
1. All of the above PLUS:
2. Lacrosse ball: 2min on worst two spots (rotate: piriformis, psoas, soleus, plantar fascia)
3. Barbell calf smash if at gym: 4-5min/leg with dorsiflex/plantarflex under compression

**Long run days**:
1. Full protocol: massage gun → foam roll (all areas) → lacrosse ball (2 worst spots) → barbell mash if accessible
2. Epsom salt bath recommended (15-20 min)
3. Compression socks for remainder of the day
4. Extra carbs + protein within 30 min

**Rest days (Friday)**:
1. Massage gun: 3-5min full body primer
2. Lacrosse ball: Deep work — piriformis glute smash & floss (2min/side), psoas (60s/side), soleus bent-knee (2min/leg)
3. Couch stretch: 2min/side (Starrett's #1 for runners)
4. Gentle foam rolling

**Strength days**:
1. Pre-lift: Dynamic stretching + mobility (leg swings, hip circles, ankle circles, bodyweight squats)
2. Post-lift: Static stretching — hip flexors, hamstrings, calves, quads. 30s+ holds.

### Modality Reference Data

Store these as reference cards accessible from the Recovery hub:

**Foam Rolling**: calves (opposite leg crossed for pressure, 2min), hip flexors/quads (face down, hip crease to mid-thigh, 2min), glutes (figure-4 sit, bias piriformis/glute med, 2min), IT band (lateral thigh hip to knee, 90s). Start standard density, progress to textured/hard roller.

**Lacrosse Ball**: Piriformis "glute smash & floss" (sit on ball medial to greater trochanter, cross ankle, rotate hip, 2min/side), posterior hip capsule (lie on back, ball under deep glute, pull knee to opposite shoulder), psoas/iliacus (face down, ball inside ASIS, extend hip, 30-60s/side), soleus (sit, ball under bent-knee calf, dorsiflex/plantarflex, 2min/leg), plantar fascia (stand on ball, roll heel to toe).

**Massage Gun**: Round/flat head for calves (straight + bent knee for soleus, 30-60s), flat head hip flexors (light pressure, 30-45s/side), ball head glutes (max tolerable intensity, 60-90s/side), peroneals/tib anterior (30s each). Use BEFORE deeper work. Never on Achilles tendon or bony prominences.

**Barbell Mash**: Calf on barbell, cross opposite leg, relax into bar, "pressure wave" side-to-side, dorsiflex/plantarflex under compression. 2min/spot, 8-10min total per leg. Quad variant: face down, barbell across front thigh, bend/straighten knee.

**Dry Needling**: Professional treatment for acute trigger points not resolving with self-work. 1-2 sessions/week acute, biweekly maintenance. Best targets: soleus, gastroc, piriformis, psoas, glute medius. Fast-in-fast-out technique superior for ROM. Must pair with strengthening for lasting results.

### Strengthening Exercises (Kinetic Chain)
1. Single-Leg Glute Bridge — 3×20/leg — "Kipchoge's #1"
2. Clamshells w/ Band — 3×15-20/side — "Glute medius = pelvic stability"
3. Single-Leg Deadlift — 3×8-12/side — "Most important exercise for runners"
4. Bulgarian Split Squat — 3×8-10/side — "Strength + hip flexor stretch"
5. Bent-Knee Calf Raise — 3×15-20, 3s eccentric — "Targets neglected soleus"
6. Straight-Leg Eccentric Calf Raise — 3×12-15, 3s lower — "Achilles tendon resilience"
7. Dead Bug — 3×10 alternating — "Deep core under limb movement"
8. Banded Hip March — 3×12/side — "Hip flexor strength through range"
9. Tibialis Raises — 3×20 — "Prevents shin splints"
10. Copenhagen Plank — 2×10-20s/side — "Adductor stability"

### Warning Signs (Interactive Checklist)
- Sharp/localized pain worsening or lasting 24+ hours
- Easy runs hard for 3+ consecutive days
- Resting HR elevated 5+ bpm for 2+ mornings
- Irritability / poor sleep / appetite loss
- Pain changing gait

---

## 14. Nutrition Data

### Phase Macro Targets
| Phase | Calories | Carbs | Protein | Fat |
|-------|----------|-------|---------|-----|
| Phase 1 (25-42 mpw) | 2,800-3,200 | 55% (385-440g) | 20% (140-160g) | 25% (78-89g) |
| Phase 2 (42-55 mpw) | 3,200-3,600 | 55% (440-495g) | 20% (160-180g) | 25% (89-100g) |
| Phase 3 (55-70 mpw) | 3,500-4,000 | 58% (508-580g) | 18% (158-180g) | 24% (93-107g) |
| Phase 4 (Taper) | 2,800-3,200 | 60% carb load | 20% | 20% |
| Phase 5 (Ultra) | 3,200-3,800 | 55% | 20% | 25% |

### Workout-Specific Nutrition
- **Pre-run (60-90min before)**: 200-400 cal easily digestible carbs (toast+honey+banana, oatmeal, bagel+PB)
- **During runs >75min**: 30-60g carbs/hr (gels, chews, sports drink). >2hrs: 60-80g/hr.
- **Post-run (within 30-60min)**: 30-40g protein + 60-80g carbs (chocolate milk+banana, protein shake+oats, eggs+toast+fruit)

### Sample Day (~3,800 cal at peak)
- 5:00 AM: Bagel w/ honey + banana + coffee (400 cal)
- 7:30 AM: 3 eggs, 2 toast, avocado, fruit (600 cal)
- 10:00 AM: Greek yogurt, granola, berries (350 cal)
- 12:30 PM: Chicken rice bowl, veggies, beans, salsa (700 cal)
- 3:00 PM: PB&J + milk (450 cal)
- 6:30 PM: Salmon, sweet potato, broccoli, olive oil (700 cal)
- 8:30 PM: Cottage cheese + almonds (300 cal)

### Houston Carb Load (3 days before)
4-5g carbs/lb body weight/day (~600-800g). Simple foods: white rice, pasta, bread, potatoes, pancakes, pretzels. Reduce fat/fiber. Expect +2-4 lbs water weight.

### Grasslands Ultra Nutrition
| Segment | Cal/Hour | Options |
|---------|---------|---------|
| Miles 1-30 | 250-300 | Gels, chews, PB&J, bananas |
| Miles 30-60 | 200-250 | Potatoes, broth, quesadillas, pretzels |
| Miles 60-80 | 150-200 | Broth, flat Coke, ginger chews, watermelon |
| Miles 80-100 | 100-200 | Whatever you tolerate; Coke + broth |

---

## 15. Race Day Execution Plans

### Houston Marathon

**Pacing (Negative Split)**:
- Miles 1-13: 6:32-6:35/mi (conservative)
- Miles 14-20: 6:28-6:30/mi (goal pace)
- Miles 21-26.2: 6:25-6:28/mi (race the last 10K)
- Target: 1:25:30 first half / 1:24:00-1:24:30 second half

**Fueling**: Gel every 5K from mile 3. Water at every aid station. Nothing new.

**Morning**: Wake 3:00-3:30 AM. Eat 100-150g carbs (2 bagels, honey, banana, 16oz sports drink). Arrive 60-75 min early. 10min shakeout + 4x100m strides. Corral 15min early.

**Mental Checkpoints**:
- Mile 6: Running within myself?
- Mile 13: Split should be ~1:25:00-1:26:00
- Mile 18: Race starts here. Next mile only.
- Mile 22: You will hurt. You prepared for this.
- Mile 24: 2.2 miles left. 15 minutes. Push.

### Grasslands 100

**Pacing**: 13:00-13:30/mi overall avg (~22hr). Run 11:30-12:00/mi flats, WALK all uphills + aid stations. Do NOT go out fast.

**Nutrition**: 200-300 cal/hr from mile 1. Timer every 20-25 min. Eat before hungry.

**Aid Stations**: Walk in. Refill, eat, assess blisters/chafing, mental check. Out in 3-5 min.

**Night**: Headlamp (200+ lumens) + handheld flashlight. Extra batteries. Light layer + gloves for overnight cold.

**Pacer**: Mile 54.9 onward. Brief them on nutrition plan and pace strategy.

**Key mindset**: The race doesn't truly start until mile 60. Manage the first 60, then run the last 40.

---

## 16. Gear Checklists

### Houston Marathon Gear
- [ ] Race shoes (carbon plated, broken in during Phase 3)
- [ ] Race outfit (NOTHING new)
- [ ] GPS watch (charged, race screen configured)
- [ ] 3-4 gels taped to shorts/waistband
- [ ] Race bib + timing chip
- [ ] Body glide (nipples, inner thighs, feet)
- [ ] Throwaway layer for corral (it'll be cool at 7 AM)
- [ ] Pre-race meal supplies (bagels, honey, banana, coffee)
- [ ] Electrolyte drink for morning

### Grasslands 100 Gear
- [ ] Trail shoes (primary pair, broken in)
- [ ] Trail shoes (backup pair for shoe change at ~mile 50)
- [ ] Running vest (1.5L+ capacity, loaded and tested)
- [ ] Headlamp (200+ lumens, tested)
- [ ] Handheld flashlight (for depth perception)
- [ ] Extra batteries (headlamp + flashlight)
- [ ] Drop bag 1 (aid station ~mile 25): extra gels, socks, electrolytes
- [ ] Drop bag 2 (aid station ~mile 50): backup shoes, socks, body glide, warm layer, headlamp batteries, real food
- [ ] Night layer (light insulating jacket)
- [ ] Gloves + buff (overnight temps 40-50°F)
- [ ] Body glide (apply everywhere)
- [ ] Blister kit (tape, moleskin, needle, alcohol wipes)
- [ ] Race nutrition (gels, chews, PB&J, salt tabs, ginger chews)
- [ ] Flat Coke (2 cans in drop bag)
- [ ] Phone (charged, emergency contacts)
- [ ] Pacer briefing sheet (nutrition schedule, pace targets, motivational cues)

---

## Implementation Notes for Claude Code

1. **Start with the data layer**: Seed the Supabase database with all 51 weeks of training data. Create the schema for workouts, workout_logs, coach_conversations, and user_settings.

2. **Build the dashboard first**: This is the most important screen. Get it right before moving to other pages.

3. **PWA from the start**: Configure the manifest and service worker early. Cache today's workout for offline access.

4. **API routes**: Create Next.js API routes for:
   - `/api/weather` — proxies to OpenWeatherMap, caches results
   - `/api/coach` — proxies to Anthropic API with system prompt, handles workout modifications
   - `/api/workouts` — CRUD for workout data
   - `/api/logs` — workout completion logging
   - `/api/garmin/sync` — pushes next 7 days of structured workouts to Garmin Connect
   - `/api/garmin/pull` — fetches completed activities from Garmin Connect and auto-populates workout logs
   - `/api/garmin/today` — public endpoint returning today's workout in compact JSON for the Connect IQ watch widget
   - `/api/garmin/health` — pulls resting HR, sleep, training readiness, VO2max from Garmin

5. **Responsive but mobile-first**: Design every component for 375px first. The desktop experience should feel like a wider version of mobile, not a separate design.

6. **Performance**: Use Next.js Image optimization, lazy loading for calendar views, and skeleton loading states. Dashboard should feel instant.

7. **The share URL should work without auth**: Public read-only view at `/share/[id]` that shows today's workout, this week's plan, and progress stats.

8. **Environment variables needed**:
   - `ANTHROPIC_API_KEY` — for the AI Coach
   - `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY` — for server-side operations
   - `WEATHER_API_KEY` — OpenWeatherMap API key
   - `GARMIN_EMAIL` — Garmin Connect login email
   - `GARMIN_PASSWORD` — Garmin Connect login password

9. **Garmin integration is a major feature** — see Section 17 below. It touches the dashboard (auto-populated stats), workout logging (auto-complete from watch data), and the weekly view (push upcoming workouts to the watch).

10. **Vercel + Railway architecture split**:
   - **Vercel**: Host the Next.js app (frontend + API routes). All user-facing API routes (`/api/weather`, `/api/coach`, `/api/workouts`, `/api/logs`, `/api/garmin/today`) run as Vercel serverless functions. These are quick request-response calls.
   - **Railway**: Host a separate Node.js/Express (or Fastify) worker service that handles:
     - **Garmin sync cron job**: Runs every 30 minutes to check for new completed activities and import them
     - **Weekly workout push**: Runs every Sunday at 8 PM to push next 7 days of structured workouts to Garmin Connect
     - **Historical data import**: Long-running job (can take 5-10 minutes for large histories) that exceeds Vercel's 60-second serverless timeout
     - **Weather prefetch**: Caches weather data every hour
   - Both Vercel and Railway connect to the same **Supabase** database
   - Railway worker communicates results by writing to Supabase — the Vercel frontend reads from Supabase. No direct Vercel↔Railway API calls needed for most flows.
   - For on-demand triggers (e.g., user clicks "Sync to Watch Now"), the Vercel API route can call the Railway service via a simple HTTP endpoint, or write a job to a Supabase `job_queue` table that Railway polls.
   - **Railway env vars**: Same Supabase credentials + `GARMIN_EMAIL` + `GARMIN_PASSWORD` + `WEATHER_API_KEY`

Build this app to be something the athlete is proud to open every morning at 5 AM, and something their friends enjoy checking in on. Make it beautiful, make it fast, make it useful.

---

## 17. Garmin Integration (Forerunner 745)

The athlete wears a **Garmin Forerunner 745** for all runs. This integration has three layers:

### Layer 1: Push Structured Workouts TO the Watch

Use the `garmin-connect` npm package (`npm install garmin-connect`) to create and schedule structured workouts in Garmin Connect. When the watch syncs, the workouts automatically appear on the device with pace targets, interval steps, and alerts.

**npm package**: `garmin-connect` (https://github.com/Pythe1337N/garmin-connect) or the more actively maintained fork `@gooin/garmin-connect`

**How it works**:
```javascript
const { GarminConnect } = require('garmin-connect');
const GCClient = new GarminConnect({
  username: process.env.GARMIN_EMAIL,
  password: process.env.GARMIN_PASSWORD
});
await GCClient.login();

// Create a structured running workout
const workout = await GCClient.addRunningWorkout('Week 14 - Intervals', {
  // Workout steps with pace targets, durations, rest intervals
});

// Schedule it to a specific date on the Garmin Connect calendar
await GCClient.scheduleWorkout(
  { workoutId: workout.workoutId },
  '2026-07-14' // YYYY-MM-DD format
);
// Watch syncs → workout appears on the Forerunner 745
```

**What to push**: For each day that has a running workout, generate a Garmin-compatible structured workout:
- **Easy runs**: Simple single-step workout with target pace range (e.g., 7:50-8:20/mi)
- **Intervals**: Multi-step workout — warmup step (distance + easy pace), repeat group (interval distance @ target pace + recovery jog), cooldown step
- **Tempo runs**: Warmup step + sustained tempo step (distance @ LT pace) + cooldown step
- **Long runs with MP segments**: Warmup distance @ easy pace, MP segment @ marathon pace, remaining distance @ easy pace
- **Recovery runs**: Single step, very easy pace range

**Sync strategy**: Create a Next.js API route `/api/garmin/sync` that:
1. Looks at the next 7 days of planned workouts
2. Creates structured Garmin workouts for each running day
3. Schedules them to the corresponding dates in Garmin Connect
4. The user syncs their watch and the workouts appear
5. Re-sync weekly (every Sunday night or on-demand via a "Sync to Watch" button in the app)

**Session management**: The `garmin-connect` library uses OAuth tokens that expire. Store the session/tokens in the database (encrypted) and use the `restoreOrLogin` method to reuse sessions:
```javascript
// Save session after login
GCClient.onSessionChange((session) => {
  // Store session in Supabase (encrypted)
});

// Restore session on subsequent calls
await GCClient.restoreOrLogin(storedSession, email, password);
```

### Layer 2: Pull Completed Activity Data FROM the Watch

After each run, when the athlete syncs their Forerunner 745, pull the completed activity data from Garmin Connect and auto-populate the workout log.

**What to pull**:
```javascript
// Get recent activities
const activities = await GCClient.getActivities(0, 10); // last 10 activities

// For each activity, get detailed data
const detail = await GCClient.getActivity({ activityId: activities[0].activityId });

// Available data points:
// - distance (miles/km)
// - duration
// - average pace
// - average heart rate
// - max heart rate
// - cadence
// - elevation gain
// - splits (per-mile or per-km)
// - calories burned
// - training effect
// - VO2max estimate

// Also pull health metrics
const hrData = await GCClient.getHeartRates('2026-07-14');    // Resting HR
const sleepData = await GCClient.getSleepData('2026-07-14');  // Sleep quality
const stressData = await GCClient.getStressData('2026-07-14'); // Stress levels
const readiness = await GCClient.getTrainingReadiness('2026-07-14'); // Training readiness score
```

**Auto-match logic**: When a new activity is pulled from Garmin:
1. Match it to the planned workout for that date (by date + activity type)
2. Auto-populate the workout log with actual distance, pace, HR, and duration
3. Mark the workout as "Completed" automatically
4. Show a comparison card: "Planned: 8mi intervals @ 5:50 → Actual: 8.2mi @ 5:47 avg, 162 avg HR"
5. Flag significant deviations (e.g., planned 8 miles but only ran 5)

**Sync frequency**: Create a cron job or webhook-style polling that checks for new activities every 30 minutes, or trigger a sync when the user opens the dashboard. Also provide a manual "Sync from Garmin" button.

**Dashboard enhancements with Garmin data**:
- **Resting heart rate trend**: Pull daily resting HR and chart it over time. Rising RHR is an overtraining signal — trigger a warning if it's elevated 5+ bpm for 2+ days.
- **Sleep quality**: Show last night's sleep score on the dashboard. Poor sleep before a quality day = recovery advisory.
- **Training readiness**: If Garmin provides a readiness score, show it on the dashboard as a "readiness gauge."
- **VO2max trend**: Chart estimated VO2max over the training cycle. This should improve as fitness builds.
- **Weekly HR analysis**: Show average easy-run HR decreasing over time as aerobic fitness improves (a key sign of heat acclimatization working).

### Layer 3: Connect IQ Watch Widget (Monkey C)

Build a simple Connect IQ widget for the Forerunner 745 that displays today's workout at a glance — no phone needed.

**Connect IQ App Type**: Widget (lightweight, accessible from the widget carousel on the watch)

**Language**: Monkey C (Garmin's proprietary language, similar to Java/C)

**SDK**: Connect IQ SDK (free, available at developer.garmin.com/connect-iq/sdk/)

**Target Device**: Forerunner 745 (supports Connect IQ 3.1+)

**What the widget shows** (single screen, glanceable):

```
┌────────────────────────┐
│  BQ TRAINING           │ ← App title
│  Week 14 • Phase 2     │ ← Current week/phase
│                        │
│  INTERVALS             │ ← Workout type (large, bold)
│  9 mi total            │ ← Total distance
│                        │
│  5×1000m @ 5:50/mi     │ ← Key workout detail
│  90s jog recovery      │
│                        │
│  Houston: 187 days     │ ← Race countdown
│  Grasslands: 249 days  │
└────────────────────────┘
```

**Data flow**: The widget needs to fetch today's workout from the web app. Two approaches:

**Option A: Garmin Connect IQ Web Request (preferred)**
The widget makes an HTTP request to a public API endpoint on your web app:
```
GET https://your-app.vercel.app/api/garmin/today
```
Returns a simple JSON payload:
```json
{
  "week": 14,
  "phase": "Speed + Heat",
  "type": "INTERVALS",
  "distance": "9 mi",
  "summary": "5×1000m @ 5:50/mi\n90s jog recovery",
  "houstonDays": 187,
  "grasslandsDays": 249
}
```
The widget caches this data and refreshes every 6 hours or on widget open.

**Note**: Connect IQ web requests require the watch to be connected to a phone with the Garmin Connect Mobile app. This is standard for most Garmin users.

**Option B: Via Garmin Connect workout notes**
When pushing structured workouts to Garmin Connect (Layer 1), embed the workout summary in the workout's "notes" field. The watch can display these notes natively when the user opens the scheduled workout. This requires no custom Connect IQ development but is less polished.

**Recommendation**: Implement **both**. Option B works immediately with Layer 1's workout push feature. Option A (the custom widget) is a stretch goal that provides a premium glanceable experience. Spec out the Connect IQ widget as a separate project folder with Monkey C source files.

**Connect IQ Project Structure**:
```
garmin-widget/
├── manifest.xml          # App manifest (target: fr745, type: widget)
├── source/
│   ├── BQTrainingApp.mc  # Main app class
│   ├── BQTrainingView.mc # Widget view (renders the screen)
│   └── BQTrainingData.mc # Data fetching and caching
├── resources/
│   ├── strings.xml       # Localized strings
│   ├── layouts.xml       # Layout definitions
│   └── drawables.xml     # Icons/images
└── README.md             # Build instructions
```

**API endpoint to create** (`/api/garmin/today`):
A simple public GET endpoint that returns today's workout in a compact JSON format optimized for the watch's limited memory:
```javascript
// /api/garmin/today/route.ts
export async function GET() {
  const today = new Date().toISOString().split('T')[0];
  const workout = await getWorkoutByDate(today);
  const houstonDate = new Date('2027-01-17');
  const grasslandsDate = new Date('2027-03-20');
  
  return Response.json({
    week: workout.weekNumber,
    phase: workout.phaseName,
    type: workout.type.toUpperCase(),
    distance: `${workout.miles} mi`,
    summary: workout.shortSummary, // 2-3 line condensed version
    strength: workout.hasStrength ? workout.strengthSummary : null,
    houstonDays: Math.ceil((houstonDate - new Date()) / 86400000),
    grasslandsDays: Math.ceil((grasslandsDate - new Date()) / 86400000),
  });
}
```

### Garmin Integration UI in the Web App

Add a **Garmin settings page** (`/settings/garmin`) with:

1. **Connection status**: "Connected as [garmin email]" with a green dot, or "Not connected" with setup instructions
2. **Sync to Watch button**: "Push next 7 days to Garmin" — triggers workout creation and scheduling
3. **Auto-sync toggle**: When enabled, automatically pushes next 7 days of workouts every Sunday at 8 PM
4. **Last sync timestamp**: "Last synced: 2 hours ago"
5. **Activity import status**: "Last activity imported: Today, 6:47 AM — 8.2 mi easy run"
6. **Garmin data on dashboard**: Toggle which Garmin metrics appear on the dashboard (resting HR, sleep, training readiness, VO2max)

### Important Notes for Claude Code

- **Rate limiting**: Garmin Connect has strict rate limits. Cache aggressively. Don't call the API more than necessary. Batch workout creation.
- **Session persistence**: Store Garmin OAuth tokens securely in Supabase (encrypted). Re-authenticate only when tokens expire.
- **Error handling**: Garmin sessions expire frequently. Build robust retry logic with `restoreOrLogin`.
- **The `garmin-connect` npm package is unofficial**: It reverse-engineers Garmin Connect's API. It works well but could break if Garmin changes their backend. Build the app so Garmin integration is a powerful enhancement, not a dependency — the app must work fully without it.
- **Connect IQ widget is a separate build**: It uses the Connect IQ SDK and Monkey C, not JavaScript. Include it as a separate project folder with its own README and build instructions. It can be built and sideloaded to the watch via USB or published to the Connect IQ store.
- **Environment variables**: Add `GARMIN_EMAIL` and `GARMIN_PASSWORD` to the required env vars list. These should be set by the user in the settings page and stored encrypted in Supabase, not hardcoded.

---

## 18. Historical Data Import & Athlete Analysis

### Overview

On first setup (or via a "Sync History" button in settings), the app should pull the athlete's **entire Garmin Connect running history** and analyze it to build a rich athlete profile. This replaces guesswork with real data — calibrating paces, identifying strengths/weaknesses, establishing baseline metrics, and tracking long-term progression.

### What to Pull

Using the `garmin-connect` npm library, fetch all available historical data:

```javascript
// Pull ALL running activities (paginate through all results)
let allActivities = [];
let start = 0;
const limit = 100;
let batch;
do {
  batch = await GCClient.getActivities(start, limit);
  allActivities = [...allActivities, ...batch];
  start += limit;
} while (batch.length === limit);

// Filter to running activities only
const runningActivities = allActivities.filter(a => 
  a.activityType?.typeKey === 'running' || 
  a.activityType?.typeKey === 'trail_running' ||
  a.activityType?.typeKey === 'treadmill_running'
);

// For each activity, get detailed splits and HR data
for (const activity of runningActivities) {
  const details = await GCClient.getActivity({ activityId: activity.activityId });
  const splits = await GCClient.getActivitySplits({ activityId: activity.activityId });
  // Store in Supabase: garmin_activities table
}

// Pull health/biometric history
const today = new Date().toISOString().split('T')[0];
const yearAgo = /* 12 months back */;

// VO2max history
const maxMetrics = await GCClient.getMaxMetrics(today); // includes vo2MaxValue, fitnessAge

// Personal records
const records = await GCClient.getPersonalRecord(); // PRs for various distances

// Body composition history
const bodyComp = await GCClient.getBodyComposition(today);

// Historical resting HR (daily for past 6 months)
// Pull day-by-day for trend analysis

// Race predictions (Garmin's built-in estimates)
// Available from getMaxMetrics or training status
```

### Data to Store

Create a `garmin_activities` table in Supabase:

```sql
CREATE TABLE garmin_activities (
  id BIGINT PRIMARY KEY,                    -- Garmin activityId
  activity_date DATE NOT NULL,
  activity_type TEXT,                        -- running, trail_running, treadmill_running
  distance_miles FLOAT,
  duration_seconds INT,
  avg_pace_per_mile FLOAT,                  -- seconds per mile
  avg_heart_rate INT,
  max_heart_rate INT,
  avg_cadence INT,
  elevation_gain_ft FLOAT,
  calories INT,
  training_effect FLOAT,                    -- aerobic training effect (1.0-5.0)
  vo2max_estimate FLOAT,
  avg_temperature_f FLOAT,                  -- important for heat analysis
  splits JSONB,                             -- per-mile splits with pace + HR
  heart_rate_zones JSONB,                   -- time in each HR zone
  activity_name TEXT,
  raw_data JSONB,                           -- full Garmin response for future use
  imported_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE garmin_daily_metrics (
  date DATE PRIMARY KEY,
  resting_heart_rate INT,
  sleep_score INT,
  sleep_duration_hours FLOAT,
  stress_level INT,
  body_battery_high INT,
  body_battery_low INT,
  training_readiness INT,
  vo2max FLOAT,
  steps INT,
  imported_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Athlete Analysis Engine

After importing historical data, run an analysis that generates an **Athlete Profile Report** shown on a dedicated page (`/profile`) and used to calibrate the training plan. The analysis should compute:

#### 1. Current Fitness Level
- **Recent race results**: Find the Dallas Marathon (3:27) and any other races in the data
- **Estimated current VDOT**: Calculate Jack Daniels' VDOT from best recent race (3:27 marathon ≈ VDOT 42.5). Use this to validate/adjust training paces
- **Garmin's VO2max estimate**: Pull the current value and chart its trend over the past 6-12 months
- **Race predictions**: Show Garmin's predicted times for 5K, 10K, half marathon, marathon alongside our training targets

#### 2. Training Volume History
- **Weekly mileage chart**: Plot weekly running mileage for the past 12+ months. This shows the real baseline (confirms the 20-30 mpw) and any peak weeks
- **Monthly mileage totals**: Bar chart
- **Longest run in the past 6 months**: Establishes long run starting point
- **Average runs per week**: Confirms training frequency
- **Mileage trend line**: Is volume increasing, decreasing, or flat?

#### 3. Pace Analysis
- **Easy run pace distribution**: Histogram of paces on easy/non-workout runs. This shows actual easy pace vs prescribed easy pace — many runners run their easy days too fast
- **Long run pace history**: Average pace on runs > 10 miles
- **Fastest mile/5K/10K splits**: From any activity — establishes speed ceiling
- **Pace vs. heart rate relationship**: Scatter plot showing how pace correlates with HR. This reveals aerobic efficiency — as fitness improves, the same pace should produce lower HR
- **Pace vs. temperature**: Critical for Dallas — show how heat impacts pace. This validates the heat adjustment factors in the training plan

#### 4. Heart Rate Analysis
- **Current resting HR**: Latest value + 30-day trend
- **Max HR observed**: From hardest efforts — use this to calibrate HR zones instead of 220-age formula
- **HR zone distribution across all runs**: How much time in each zone? Most runners spend too much time in Zone 3 (too hard for easy, too easy for tempo)
- **Cardiac drift on long runs**: Does HR creep up significantly in the back half of long runs? This indicates aerobic ceiling issues that the training plan addresses
- **Easy run HR trend**: Is average HR on easy runs decreasing over time? (sign of improving aerobic fitness)

#### 5. Running Dynamics
- **Average cadence**: Typical range for distance runners is 170-185 spm. Low cadence may indicate overstriding
- **Cadence vs. pace relationship**: Does cadence increase appropriately at faster paces?

#### 6. Strengths & Weaknesses Assessment

Based on the data analysis, generate a text summary identifying:
- **Strength**: e.g., "Consistent training frequency (5.2 runs/week avg) — discipline is not an issue"
- **Strength**: e.g., "Strong finishing kick — your last mile is often your fastest in easy runs"
- **Weakness**: e.g., "Easy runs averaging 7:55/mi with 155 bpm HR — running too fast on easy days. Should be 8:00-8:20 at 140-145 bpm"
- **Weakness**: e.g., "Long run pace decay — average HR rises 15+ bpm in the final 3 miles of runs over 12mi, suggesting aerobic endurance gap"
- **Opportunity**: e.g., "No speed work in recent history — VO2max intervals will unlock significant improvement"
- **Opportunity**: e.g., "Limited mileage (25 mpw avg) relative to marathon PR (3:27) — huge untapped aerobic potential from volume increase"

#### 7. Plan Calibration Recommendations

Use the analyzed data to fine-tune the training plan:
- **Starting mileage**: If recent data shows consistent 28 mpw, start Week 1 at 32 (not 25)
- **Pace zones**: If actual easy runs average 7:55 with HR at 155, adjust easy pace prescription to slow them down
- **HR zones**: If max HR observed is 192 (not calculated 190), recalculate all zone boundaries
- **Long run starting point**: If longest recent run is 13 miles, the Phase 1 long run progression is appropriate. If it's 8 miles, add an extra buildup week
- **Heat baseline**: If summer 2025 data exists, show how much pace slowed in heat — this calibrates heat adjustment factors

### Athlete Profile Page (`/profile`)

A dedicated page showing:

1. **Hero stats bar**: Current VO2max | Resting HR | Marathon PR | Weekly avg mileage | Total miles (all time)

2. **Fitness Timeline**: A line chart with VO2max and/or estimated fitness score over the past 12 months, with key events annotated (races, peak mileage weeks, injuries/breaks)

3. **Training Volume chart**: Weekly mileage bar chart for the past 12 months with a trend line

4. **Pace & HR Analysis cards**: The pace distribution, pace-vs-HR scatter, and HR zone distribution charts described above

5. **Strengths & Weaknesses summary**: The AI-generated text assessment

6. **Race History table**: All races found in the data with date, distance, finish time, avg pace, avg HR

7. **Personal Records**: Garmin's PR list for various distances (1 mile, 5K, 10K, half marathon, marathon)

8. **Plan Calibration Notes**: Any adjustments the analysis suggests to the default training plan, with "Apply" buttons that modify the plan data

### AI Coach Integration

Feed the historical analysis summary into the AI Coach's system prompt context so it can reference real data:

```
Additional athlete context from Garmin data analysis:
- Garmin VO2max: 45.2 (trending up from 42.1 six months ago)
- Actual max HR observed: 192 bpm (from 10K race effort)
- Average easy run pace: 7:55/mi at 152 bpm avg HR (running slightly too fast)
- Average weekly mileage (last 3 months): 27.3 miles
- Longest run (last 6 months): 13.1 miles
- Resting HR: 52 bpm (stable)
- Key weakness: Easy runs too fast (Zone 3 instead of Zone 2)
- Key strength: Consistent 5+ runs/week training frequency
```

This gives Coach real data to work with when the athlete asks questions like "Am I on track?" or "Should I adjust my paces?"

### Import Flow UX

When the user first connects Garmin:

1. **Connection screen**: Enter Garmin credentials → authenticate → show success
2. **Import progress**: "Importing your running history..." with a progress bar and activity counter ("Imported 247 of 312 activities...")
3. **Analysis**: "Analyzing your data..." with a brief loading animation
4. **Results**: Show the Athlete Profile page with all charts and insights populated
5. **Calibration prompt**: "Based on your data, we recommend adjusting your easy run pace to 8:10-8:30/mi. Apply this change?" with Accept/Dismiss buttons

The import can take a few minutes for large histories — show a friendly loading state and allow the user to navigate away (run it as a background job).

### Re-sync

Add a "Re-sync History" button in settings that re-imports the last 30 days of data to catch recent activities. Full re-import should be available but not the default (to respect Garmin rate limits).