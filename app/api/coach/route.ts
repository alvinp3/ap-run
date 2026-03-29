import { NextRequest, NextResponse } from 'next/server';

const COACH_SYSTEM_PROMPT = `You are Coach — a knowledgeable, direct, and motivating running coach embedded in a training app. You're coaching an athlete in Dallas, TX who is training for two races:

1. 2027 Houston Marathon (January 17, 2027) — Goal: Sub-2:50 for a Boston Qualifier
2. 2027 Grasslands 100-Mile Ultra (March 20-21, 2027) — Goal: Sub-24 hours (first 100-miler ever)

Athlete profile: Male, 18-34, 150-170 lbs, marathon PR 3:27 (on just 20-30 mpw), currently ramping to 70 mpw peak. Trains mornings 6 days/week (rest Friday). Full gym access. No injury history. Lives in Dallas — uses summer heat for acclimatization.

Training plan: 51-week periodized program:
- Phase 1: Base Building (Wks 1-10, Mar 30 - Jun 7, 25→42 mpw, lifting 3x/wk)
- Phase 2: Speed + Heat (Wks 11-20, Jun 8 - Aug 15, 42→55 mpw, lifting 2x/wk)
- Phase 3: Marathon Specific (Wks 21-36, Aug 16 - Nov 28, 55→70 mpw, lifting 2x/wk)
- Phase 4: Taper + Houston (Wks 37-42, Nov 29 - Jan 17, 50→25 mpw, lifting 1x→0)
- Phase 5: Ultra Bridge (Wks 43-51, Jan 18 - Mar 20, recovery→50 mpw, ultra-specific)

Key paces: Easy 7:50-8:20, Marathon Pace 6:25-6:35, Tempo 6:05-6:15, Interval 5:45-6:00, Recovery 8:30-9:00. Add 20-40 sec/mile in Dallas summer heat (June-September).

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

The app will parse this and apply the changes to the training plan.`;

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { content: 'AI Coach is not configured. Please add ANTHROPIC_API_KEY to your environment variables.' },
        { status: 200 }
      );
    }

    // Build context prefix if we have situational data
    let systemWithContext = COACH_SYSTEM_PROMPT;
    if (context) {
      const contextLines = [];
      if (context.weekNumber) contextLines.push(`Current week: Week ${context.weekNumber} of 51`);
      if (context.phase)      contextLines.push(`Current phase: Phase ${context.phase} — ${context.phaseName}`);
      if (context.todayWorkout) contextLines.push(`Today's planned workout: ${context.todayWorkout}`);
      if (contextLines.length > 0) {
        systemWithContext += `\n\nCurrent context:\n${contextLines.join('\n')}`;
      }
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: systemWithContext,
        messages: messages.slice(-20), // last 20 messages for context window
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Anthropic API error:', error);
      return NextResponse.json(
        { content: 'Coach is temporarily unavailable. Please try again in a moment.' },
        { status: 200 }
      );
    }

    const data = await response.json();
    const content = data.content?.[0]?.text ?? 'No response from Coach.';

    return NextResponse.json({ content });
  } catch (err) {
    console.error('Coach API error:', err);
    return NextResponse.json(
      { content: 'Something went wrong. Please try again.' },
      { status: 200 }
    );
  }
}
