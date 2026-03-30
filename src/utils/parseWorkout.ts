import type { WorkoutType } from '@/types';
import { getStrengthExercises } from '@/data/strength-exercises';

export interface WorkoutBlock {
  kind: 'segment' | 'strength' | 'note';
  label: string;       // e.g. "WARMUP", "INTERVALS", "STRENGTH A", "NOTE"
  detail?: string;     // descriptive text below the label
  pace?: string;       // cyan mono target e.g. "5:50–6:00/mi"
  count?: string;      // e.g. "4 × 1000m", "3 × 2 mi"
  recovery?: string;   // e.g. "90s jog"
  exercises?: string[]; // for strength blocks
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Split on commas while respecting parentheses nesting. */
function splitByCommaRespectParens(text: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

/** Normalise hyphen to en-dash in a pace string. */
function normalisePaceDash(pace: string): string {
  return pace.replace(/-/g, '–');
}

/** Extract a pace string from a segment text, e.g. "@ 6:10-6:20/mi". */
function extractPace(text: string): string | undefined {
  const m = text.match(/@\s*([\d:]+[-–][\d:]+\/mi|[\d:]+\/mi)/);
  if (!m) return undefined;
  return normalisePaceDash(m[1]);
}

/** Extract recovery notation from a segment, e.g. "w/ 90s jog". */
function extractRecovery(text: string): string | undefined {
  const m = text.match(/w\/\s*([^,)]+)/i);
  if (!m) return undefined;
  return m[1].trim();
}

/** Extract rep count from a segment, e.g. "4x1000m" → "4 × 1000m". */
function extractCount(text: string): string | undefined {
  const m = text.match(/(\d+)\s*[×x]\s*(\S+)/);
  if (!m) return undefined;
  return `${m[1]} × ${m[2]}`;
}

/** Parse a strength block text like "Strength A (Phase 2: Ex1, Ex2, ...)" */
function parseStrengthBlock(raw: string, phase?: number): WorkoutBlock {
  const labelMatch = raw.match(/Strength\s+([ABC])/i);
  const letter = labelMatch ? labelMatch[1].toUpperCase() : 'A';
  const label = `STRENGTH ${letter}`;

  const parenMatch = raw.match(/\(([^)]*)\)/);
  if (!parenMatch) {
    // No parenthetical exercises — look up from canonical data
    if (phase != null) {
      const lookup = getStrengthExercises(phase, letter);
      if (lookup) {
        return { kind: 'strength', label, detail: lookup.detail, exercises: lookup.exercises };
      }
    }
    return { kind: 'strength', label };
  }

  const inner = parenMatch[1].trim();

  if (inner.toLowerCase() === 'light') {
    return { kind: 'strength', label, detail: 'Light weights' };
  }

  // Check for "SectionLabel: exercises" pattern
  const colonIdx = inner.indexOf(':');
  let detail: string | undefined;
  let exerciseText = inner;
  if (colonIdx !== -1) {
    detail = inner.slice(0, colonIdx).trim();
    exerciseText = inner.slice(colonIdx + 1).trim();
  }

  const exercises = splitByCommaRespectParens(exerciseText)
    .map((e) => e.trim())
    .filter(Boolean);

  return { kind: 'strength', label, detail, exercises: exercises.length ? exercises : undefined };
}

// ---------------------------------------------------------------------------
// Rule 1 – Structured with em-dash (or colon variant for "7 miles total: ...")
// ---------------------------------------------------------------------------

function parseEmDashWorkout(description: string): WorkoutBlock[] {
  // Also handle "7 miles total: 2mi warmup, ..." (colon instead of em-dash)
  const emDashSep = ' — ';
  const colonTotalPattern = /^(.+?)\s+(?:total|miles?):\s+(.+)$/i;

  let header = '';
  let segmentsAndNotes = '';

  if (description.includes(emDashSep)) {
    const idx = description.indexOf(emDashSep);
    header = description.slice(0, idx).trim();
    segmentsAndNotes = description.slice(idx + emDashSep.length).trim();
  } else {
    const m = description.match(colonTotalPattern);
    if (m) {
      header = m[1].trim();
      segmentsAndNotes = m[2].trim();
    } else {
      return [];
    }
  }

  // Detect fartlek
  const isFartlek = /fartlek/i.test(header);
  // Detect progression
  const isProgression = /progression/i.test(header);

  // Split trailing notes: everything after ". " that follows the last segment
  // We'll pull notes off after parsing segments.
  const segmentsPart = segmentsAndNotes;

  const rawSegments = splitByCommaRespectParens(segmentsPart);

  // Some trailing segments may have a ". " note appended in the last element
  // Split that off from the last raw segment.
  const trailingNotes: string[] = [];
  const cleanSegments = rawSegments.map((seg, i) => {
    if (i === rawSegments.length - 1) {
      const dotIdx = seg.indexOf('. ');
      if (dotIdx !== -1) {
        trailingNotes.push(...seg.slice(dotIdx + 2).split('. ').map((s) => s.trim()).filter(Boolean));
        return seg.slice(0, dotIdx).trim();
      }
    }
    return seg;
  });

  const blocks: WorkoutBlock[] = [];

  if (isFartlek) {
    blocks.push({
      kind: 'segment',
      label: 'FARTLEK',
      detail: segmentsAndNotes,
      pace: extractPace(description),
    });
    for (const note of trailingNotes) {
      if (note) blocks.push({ kind: 'note', label: 'NOTE', detail: note });
    }
    return blocks;
  }

  const n = cleanSegments.length;

  cleanSegments.forEach((seg, i) => {
    const isFirst = i === 0;
    const isLast = i === n - 1;
    const pace = extractPace(seg);
    const recovery = extractRecovery(seg);
    const count = extractCount(seg);

    if (isProgression) {
      // "first X mi" → EASY, "last X mi" or "mile N" → PICKUP, other → RUN
      if (/first\s+\d/i.test(seg)) {
        blocks.push({ kind: 'segment', label: 'EASY', detail: seg.trim(), pace, count });
      } else if (/last\s+\d|miles?\s+\d+[-–]\d+|mile\s+\d+\s+at/i.test(seg)) {
        blocks.push({ kind: 'segment', label: 'PICKUP', detail: seg.trim(), pace, count });
      } else {
        blocks.push({ kind: 'segment', label: 'RUN', detail: seg.trim(), pace, count });
      }
      return;
    }

    if (n === 1) {
      blocks.push({ kind: 'segment', label: 'RUN', detail: seg.trim(), pace, count });
      return;
    }

    if (isFirst) {
      blocks.push({ kind: 'segment', label: 'WARMUP', detail: seg.trim(), pace, count });
    } else if (isLast) {
      blocks.push({ kind: 'segment', label: 'COOLDOWN', detail: seg.trim(), pace });
    } else {
      // Middle – determine type
      if (/\d+\s*[×x]\s*\S+/.test(seg)) {
        blocks.push({ kind: 'segment', label: 'INTERVALS', detail: seg.trim(), pace, count, recovery });
      } else if (pace) {
        blocks.push({ kind: 'segment', label: 'TEMPO', detail: seg.trim(), pace, count });
      } else {
        blocks.push({ kind: 'segment', label: 'RUN', detail: seg.trim(), pace, count });
      }
    }
  });

  for (const note of trailingNotes) {
    if (note) blocks.push({ kind: 'note', label: 'NOTE', detail: note });
  }

  return blocks;
}

// ---------------------------------------------------------------------------
// Rule 2 & 3 – Run + Strength / Strides only
// ---------------------------------------------------------------------------

function parseStrengthOrStrides(description: string, phase?: number): WorkoutBlock[] | null {
  const strengthIdx = description.indexOf(' + Strength ');
  const hasStrength = strengthIdx !== -1;
  const hasStrides = /\+\s*\d+x100m strides/i.test(description);

  if (!hasStrength && !hasStrides) return null;

  const blocks: WorkoutBlock[] = [];

  if (hasStrength) {
    const runPart = description.slice(0, strengthIdx).trim();
    const strengthPart = description.slice(strengthIdx + 3).trim(); // skip " + "

    // Parse the run portion, but also check for strides embedded before "+Strength"
    const stridesMatch = runPart.match(/\+\s*(\d+)x100m strides?/i);
    let cleanRunPart = runPart;
    if (stridesMatch) {
      cleanRunPart = runPart.slice(0, runPart.indexOf(stridesMatch[0])).trim();
    }

    const runPace = extractPace(cleanRunPart);
    const distMatch = cleanRunPart.match(/(\d+(?:\.\d+)?)\s*(?:mi(?:les?)?)/i);
    const runCount = distMatch ? `${distMatch[1]} mi` : undefined;
    blocks.push({ kind: 'segment', label: 'RUN', detail: cleanRunPart, pace: runPace, count: runCount });

    if (stridesMatch) {
      blocks.push({ kind: 'segment', label: 'STRIDES', count: `${stridesMatch[1]} × 100m` });
    }

    blocks.push(parseStrengthBlock(strengthPart, phase));
    return blocks;
  }

  // Strides only (no Strength)
  const stridesMatch = description.match(/\+\s*(\d+)x100m strides?/i);
  if (stridesMatch) {
    const runPart = description.slice(0, description.indexOf(stridesMatch[0])).trim();
    const runPace = extractPace(runPart);
    const distMatch = runPart.match(/(\d+(?:\.\d+)?)\s*(?:mi(?:les?)?)/i);
    const runCount = distMatch ? `${distMatch[1]} mi` : undefined;
    blocks.push({ kind: 'segment', label: 'RUN', detail: runPart, pace: runPace, count: runCount });
    blocks.push({ kind: 'segment', label: 'STRIDES', count: `${stridesMatch[1]} × 100m` });
    return blocks;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Rule 4 – Rest + Strength
// ---------------------------------------------------------------------------

function parseRestStrength(description: string, phase?: number): WorkoutBlock[] | null {
  if (!/^rest\s*\+\s*strength/i.test(description)) return null;

  const blocks: WorkoutBlock[] = [];
  blocks.push({ kind: 'segment', label: 'REST', detail: 'Rest day' });

  const strengthMatch = description.match(/Strength\s+[ABC].*/i);
  if (strengthMatch) {
    blocks.push(parseStrengthBlock(strengthMatch[0], phase));
  }

  return blocks;
}

// ---------------------------------------------------------------------------
// Rule 5 – Long run
// ---------------------------------------------------------------------------

function parseLongRun(description: string): WorkoutBlock[] {
  const sentences = description.split('. ').map((s) => s.trim()).filter(Boolean);
  const blocks: WorkoutBlock[] = [];

  sentences.forEach((sentence, i) => {
    if (i === 0) {
      const pace = extractPace(sentence);
      const distMatch = sentence.match(/(\d+(?:\.\d+)?)\s*(?:mi(?:les?)?)/i);
      const count = distMatch ? `${distMatch[1]} mi` : undefined;
      blocks.push({ kind: 'segment', label: 'LONG RUN', detail: sentence, pace, count });
      return;
    }

    const lower = sentence.toLowerCase();

    if (/last\s+\d+\s+miles?/.test(lower)) {
      const pace = extractPace(sentence);
      blocks.push({ kind: 'segment', label: 'FINISH', detail: sentence, pace });
      return;
    }

    if (/fuel|gel/.test(lower)) {
      blocks.push({ kind: 'segment', label: 'FUEL', detail: sentence });
      return;
    }

    blocks.push({ kind: 'note', label: 'NOTE', detail: sentence });
  });

  return blocks;
}

// ---------------------------------------------------------------------------
// Rule 6 – Rest day
// ---------------------------------------------------------------------------

function parseRestDay(description: string): WorkoutBlock[] {
  const sentences = description.split('. ').map((s) => s.trim()).filter(Boolean);
  return sentences.map((sentence) => ({
    kind: 'segment' as const,
    label: sentence.replace(/\.$/, '').toUpperCase().slice(0, 40),
    detail: undefined,
  }));
}

// ---------------------------------------------------------------------------
// Rule 7 – "Label: ex1, ex2, ex3" note/exercise block
// Handles coach-generated overrides like "Note Lift Day A at lunch: Squat 3x8, ..."
// ---------------------------------------------------------------------------

/** True if a string looks like an exercise (contains sets×reps notation). */
function looksLikeExerciseList(text: string): boolean {
  return /\d+x\d|\d+\/\w|RPE|sets?|reps?|\bx\s*\d/i.test(text);
}

function parseNoteWithExercises(description: string): WorkoutBlock[] | null {
  // Match "Some Label Text: exercise1, exercise2, ..."
  const colonIdx = description.indexOf(': ');
  if (colonIdx === -1) return null;

  const labelPart = description.slice(0, colonIdx).trim();
  const exercisePart = description.slice(colonIdx + 2).trim();

  // Only fire this rule if:
  //  1. The label has no em-dash (not an em-dash workout)
  //  2. The exercise part looks like an exercise list
  if (description.includes(' — ')) return null;
  if (!looksLikeExerciseList(exercisePart)) return null;
  // Skip if it looks like a run distance description (e.g. "10 miles total: ...")
  if (/^\d+\s*(?:mi(?:les?)?|km)/.test(labelPart)) return null;

  const exercises = splitByCommaRespectParens(exercisePart).map((e) => e.trim()).filter(Boolean);
  if (exercises.length < 2) return null; // Need at least 2 items to be a list

  // Determine kind: if label mentions strength/lift/gym → strength, else note
  const isStrength = /strength|lift|gym|squat|deadlift/i.test(labelPart);
  return [{
    kind: isStrength ? 'strength' : 'note',
    label: labelPart.toUpperCase().slice(0, 50),
    exercises,
  }];
}

// ---------------------------------------------------------------------------
// Rule 8 – Fallback
// ---------------------------------------------------------------------------

function parseFallback(description: string): WorkoutBlock[] {
  const sentences = description.split('. ').map((s) => s.trim()).filter(Boolean);
  if (sentences.length === 0) return [];

  const blocks: WorkoutBlock[] = [];
  const first = sentences[0];
  blocks.push({ kind: 'segment', label: 'RUN', detail: first, pace: extractPace(first) });

  for (let i = 1; i < sentences.length; i++) {
    blocks.push({ kind: 'note', label: 'NOTE', detail: sentences[i] });
  }

  return blocks;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function parseWorkoutDescription(description: string, type: WorkoutType, phase?: number): WorkoutBlock[] {
  // Rule 4 – Rest + Strength (check before rest-day rule)
  const restStrength = parseRestStrength(description, phase);
  if (restStrength) return restStrength;

  // Rule 6 – Rest day (no "+")
  if (type === 'rest') {
    return parseRestDay(description);
  }

  // Rule 2 & 3 – Run + Strength or Strides
  const strengthOrStrides = parseStrengthOrStrides(description, phase);
  if (strengthOrStrides) return strengthOrStrides;

  // Rule 1 – Structured with em-dash (or colon "total" variant)
  const hasEmDash = description.includes(' — ');
  const hasColonTotal = /\d+\s+(?:miles?|mi)\s+total\s*:/i.test(description) ||
    /^(?:INTERVALS|TEMPO|First real tempo).*:\s/i.test(description);
  if (hasEmDash || hasColonTotal) {
    const result = parseEmDashWorkout(description);
    if (result.length) return result;
  }

  // Rule 5 – Long run
  if (type === 'long') {
    return parseLongRun(description);
  }

  // Rule 7 – "Label: ex1, ex2" note/exercise block (coach overrides)
  const noteWithEx = parseNoteWithExercises(description);
  if (noteWithEx) return noteWithEx;

  // Rule 8 – Fallback
  return parseFallback(description);
}
