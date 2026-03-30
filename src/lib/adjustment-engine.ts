import type {
  WorkoutType,
  WorkoutDay,
  WorkoutOverride,
  OverrideFormData,
  AdjustmentSuggestion,
  TrainingWeek,
} from '@/types';

// ── Helpers ──────────────────────────────────────────────────────────────────

const HARD_TYPES: Set<WorkoutType> = new Set(['intervals', 'tempo', 'long', 'race']);

function isHardType(type: WorkoutType): boolean {
  return HARD_TYPES.has(type);
}

/** Merge a planned day with its override (if any). */
function effectiveDay(
  day: WorkoutDay,
  overrides: Record<string, WorkoutOverride>,
): { type: WorkoutType; miles: number } {
  const o = overrides[day.date];
  return {
    type: (o?.type as WorkoutType) ?? day.type,
    miles: o?.miles ?? day.miles,
  };
}

/** Days in the week AFTER the given date that are not yet completed/skipped. */
function remainingDays(
  week: TrainingWeek,
  afterDate: string,
  logs: Record<string, { completed: boolean; skipped?: boolean }>,
): WorkoutDay[] {
  return week.days.filter(
    (d) => d.date > afterDate && !logs[d.date]?.completed && !logs[d.date]?.skipped,
  );
}

function estimateMinutes(type: WorkoutType, miles: number): number {
  const paceMap: Record<string, number> = {
    easy: 8.25, recovery: 9, long: 7.75, tempo: 6.33,
    intervals: 7, rest: 0, race: 6.5, strength: 0,
  };
  const pace = paceMap[type] ?? 8;
  return Math.round(miles * pace);
}

let idCounter = 0;
function nextId(): string {
  return `adj-${++idCounter}-${Date.now()}`;
}

// ── Rules ────────────────────────────────────────────────────────────────────

function ruleMilesBalance(
  overrideDate: string,
  overrideData: OverrideFormData,
  plannedDay: WorkoutDay,
  week: TrainingWeek,
  overrides: Record<string, WorkoutOverride>,
  logs: Record<string, { completed: boolean; skipped?: boolean; actualMiles?: number }>,
): AdjustmentSuggestion[] {
  const delta = (overrideData.miles ?? plannedDay.miles) - plannedDay.miles;
  const threshold = week.isDownWeek ? 3 : 2;
  if (Math.abs(delta) < threshold) return [];

  const future = remainingDays(week, overrideDate, logs);
  const easyDays = future.filter((d) => {
    const eff = effectiveDay(d, overrides);
    return !isHardType(eff.type) && eff.type !== 'rest' && eff.miles > 0;
  });

  if (easyDays.length === 0) return [];

  if (delta > 0) {
    // Ran more — reduce the highest-miles future easy day
    const target = easyDays.sort((a, b) => effectiveDay(b, overrides).miles - effectiveDay(a, overrides).miles)[0];
    const eff = effectiveDay(target, overrides);
    const newMiles = Math.max(2, eff.miles - delta);
    if (newMiles >= eff.miles) return [];
    return [{
      id: nextId(),
      targetDate: target.date,
      targetDayName: target.day,
      currentType: eff.type,
      currentMiles: eff.miles,
      suggestedMiles: newMiles,
      ruleName: 'Miles Balance',
      ruleIcon: '⚖️',
      explanation: `You ran ${delta}mi extra today. Reduce ${target.day} from ${eff.miles}mi to ${newMiles}mi to stay near the weekly target.`,
      severity: 'info',
    }];
  } else {
    // Ran less — suggest adding to the lightest future easy day
    const absDelta = Math.abs(delta);
    const target = easyDays.sort((a, b) => effectiveDay(a, overrides).miles - effectiveDay(b, overrides).miles)[0];
    const eff = effectiveDay(target, overrides);
    const newMiles = Math.min(eff.miles + absDelta, eff.miles + 3);
    if (newMiles <= eff.miles) return [];
    return [{
      id: nextId(),
      targetDate: target.date,
      targetDayName: target.day,
      currentType: eff.type,
      currentMiles: eff.miles,
      suggestedMiles: newMiles,
      ruleName: 'Miles Balance',
      ruleIcon: '⚖️',
      explanation: `You ran ${absDelta}mi less today. Add ${newMiles - eff.miles}mi to ${target.day} to keep weekly mileage on track.`,
      severity: 'info',
    }];
  }
}

function ruleIntensityBalance(
  overrideDate: string,
  overrideData: OverrideFormData,
  week: TrainingWeek,
  overrides: Record<string, WorkoutOverride>,
  logs: Record<string, { completed: boolean; skipped?: boolean }>,
): AdjustmentSuggestion[] {
  const overrideType = overrideData.type;
  if (!overrideType || !isHardType(overrideType)) return [];

  const dayIdx = week.days.findIndex((d) => d.date === overrideDate);
  if (dayIdx < 0 || dayIdx >= week.days.length - 1) return [];

  const tomorrow = week.days[dayIdx + 1];
  if (logs[tomorrow.date]?.completed || logs[tomorrow.date]?.skipped) return [];

  const tomorrowEff = effectiveDay(tomorrow, overrides);
  if (!isHardType(tomorrowEff.type)) return [];

  return [{
    id: nextId(),
    targetDate: tomorrow.date,
    targetDayName: tomorrow.day,
    currentType: tomorrowEff.type,
    currentMiles: tomorrowEff.miles,
    suggestedType: 'easy',
    suggestedMiles: tomorrowEff.miles,
    suggestedDescription: `Easy ${tomorrowEff.miles}mi (swapped from ${tomorrowEff.type} to avoid back-to-back hard days)`,
    ruleName: 'Intensity Balance',
    ruleIcon: '🔄',
    explanation: `Today is now ${overrideType}. ${tomorrow.day} is also ${tomorrowEff.type} — avoid back-to-back hard days.`,
    severity: 'info',
  }];
}

function ruleLongRunProtection(
  overrideDate: string,
  overrideData: OverrideFormData,
  plannedDay: WorkoutDay,
  week: TrainingWeek,
  overrides: Record<string, WorkoutOverride>,
  logs: Record<string, { completed: boolean; skipped?: boolean }>,
): AdjustmentSuggestion[] {
  const suggestions: AdjustmentSuggestion[] = [];

  // Case 1: Overriding the long run day itself
  if (plannedDay.type === 'long' && overrideData.type && overrideData.type !== 'long') {
    const future = remainingDays(week, overrideDate, logs);
    const candidate = future.find((d) => {
      const eff = effectiveDay(d, overrides);
      return !isHardType(eff.type) && eff.type !== 'rest';
    });
    if (candidate) {
      suggestions.push({
        id: nextId(),
        targetDate: candidate.date,
        targetDayName: candidate.day,
        currentType: effectiveDay(candidate, overrides).type,
        currentMiles: effectiveDay(candidate, overrides).miles,
        suggestedType: 'long',
        suggestedMiles: plannedDay.miles,
        suggestedDescription: `Long run ${plannedDay.miles}mi (rescheduled from ${plannedDay.day})`,
        ruleName: 'Long Run Protection',
        ruleIcon: '🛡️',
        explanation: `You're replacing your long run. Reschedule it to ${candidate.day} to keep your week's key workout.`,
        severity: 'warning',
      });
    } else {
      suggestions.push({
        id: nextId(),
        targetDate: overrideDate,
        targetDayName: plannedDay.day,
        currentType: plannedDay.type,
        currentMiles: plannedDay.miles,
        ruleName: 'Long Run Protection',
        ruleIcon: '🛡️',
        explanation: `This week's long run will be missed. No available day to reschedule. Consider extending next week's long run.`,
        severity: 'warning',
      });
    }
  }

  // Case 2: Heavy miles the day before the long run
  const longRunDay = week.days.find((d) => d.type === 'long');
  if (longRunDay && longRunDay.date !== overrideDate) {
    const longRunIdx = week.days.findIndex((d) => d.date === longRunDay.date);
    const overrideIdx = week.days.findIndex((d) => d.date === overrideDate);
    if (overrideIdx === longRunIdx - 1) {
      const overrideMiles = overrideData.miles ?? plannedDay.miles;
      const overrideType = overrideData.type ?? plannedDay.type;
      if (overrideMiles >= plannedDay.miles + 3 || isHardType(overrideType)) {
        suggestions.push({
          id: nextId(),
          targetDate: overrideDate,
          targetDayName: plannedDay.day,
          currentType: overrideType,
          currentMiles: overrideMiles,
          ruleName: 'Long Run Protection',
          ruleIcon: '⚠️',
          explanation: `Heavy effort the day before your long run (${longRunDay.day} ${longRunDay.miles}mi) may affect performance. Consider keeping today easy.`,
          severity: 'warning',
        });
      }
    }
  }

  return suggestions;
}

function ruleRestDayProtection(
  overrideDate: string,
  overrideData: OverrideFormData,
  plannedDay: WorkoutDay,
  week: TrainingWeek,
  overrides: Record<string, WorkoutOverride>,
  logs: Record<string, { completed: boolean; skipped?: boolean }>,
): AdjustmentSuggestion[] {
  if (plannedDay.type !== 'rest') return [];
  if (overrideData.type === 'rest') return [];

  // Count rest days this week (considering existing overrides)
  const restDays = week.days.filter((d) => {
    if (d.date === overrideDate) return false; // this day is being overridden
    const eff = effectiveDay(d, overrides);
    return eff.type === 'rest';
  });

  if (restDays.length > 0) return []; // still have another rest day

  // No rest days left — suggest making the lightest future day rest
  const future = remainingDays(week, overrideDate, logs).filter(
    (d) => effectiveDay(d, overrides).type !== 'rest',
  );
  const lightest = future.sort(
    (a, b) => effectiveDay(a, overrides).miles - effectiveDay(b, overrides).miles,
  )[0];

  if (!lightest) return [];

  return [{
    id: nextId(),
    targetDate: lightest.date,
    targetDayName: lightest.day,
    currentType: effectiveDay(lightest, overrides).type,
    currentMiles: effectiveDay(lightest, overrides).miles,
    suggestedType: 'rest',
    suggestedMiles: 0,
    suggestedDescription: 'Full rest day. Foam rolling 10-15 min. Mobility work.',
    ruleName: 'Rest Day Protection',
    ruleIcon: '😴',
    explanation: `This removes your only rest day. Move rest to ${lightest.day} so your body can recover.`,
    severity: 'warning',
  }];
}

// ── Main export ──────────────────────────────────────────────────────────────

export function computeAdjustments(
  overrideDate: string,
  overrideData: OverrideFormData,
  currentWeek: TrainingWeek,
  existingOverrides: Record<string, WorkoutOverride>,
  existingLogs: Record<string, { completed: boolean; skipped?: boolean; actualMiles?: number }>,
): AdjustmentSuggestion[] {
  const plannedDay = currentWeek.days.find((d) => d.date === overrideDate);
  if (!plannedDay) return [];

  const allSuggestions: AdjustmentSuggestion[] = [];

  // Run all rules
  allSuggestions.push(...ruleMilesBalance(overrideDate, overrideData, plannedDay, currentWeek, existingOverrides, existingLogs));
  allSuggestions.push(...ruleIntensityBalance(overrideDate, overrideData, currentWeek, existingOverrides, existingLogs));
  allSuggestions.push(...ruleLongRunProtection(overrideDate, overrideData, plannedDay, currentWeek, existingOverrides, existingLogs));
  allSuggestions.push(...ruleRestDayProtection(overrideDate, overrideData, plannedDay, currentWeek, existingOverrides, existingLogs));

  // Deduplicate by targetDate — keep safety rules (warning severity) over info
  const byDate = new Map<string, AdjustmentSuggestion>();
  for (const s of allSuggestions) {
    const existing = byDate.get(s.targetDate);
    if (!existing) {
      byDate.set(s.targetDate, s);
    } else if (s.severity === 'warning' && existing.severity === 'info') {
      byDate.set(s.targetDate, s);
    }
  }

  // Sort: warnings first, then by date
  return Array.from(byDate.values()).sort((a, b) => {
    if (a.severity !== b.severity) return a.severity === 'warning' ? -1 : 1;
    return a.targetDate.localeCompare(b.targetDate);
  });
}
