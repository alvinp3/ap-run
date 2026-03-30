/**
 * Canonical strength exercise definitions by phase and letter.
 * Used to fill in exercises when workout descriptions only say "Strength A"
 * without a parenthetical exercise list.
 */

interface StrengthDef {
  detail: string;
  exercises: string[];
}

type LetterMap = Record<string, StrengthDef>;

const phase1: LetterMap = {
  A: {
    detail: 'Full Body',
    exercises: [
      'Back Squat 4x6 RPE 7-8',
      'Bench Press 3x8',
      'RDL 3x8',
      'DB Row 3x10',
      'Plank 3x45s',
    ],
  },
  B: {
    detail: 'Full Body',
    exercises: [
      'Trap Bar DL 3x8',
      'OH Press 3x8',
      'Walking Lunges 3x12/leg',
      'Chin-ups 3x8',
      'Dead Bug 3x10/side',
    ],
  },
  C: {
    detail: 'Full Body',
    exercises: [
      'Step-Ups 3x10/leg',
      'Push-up 3x12',
      'SL RDL 3x8/side',
      'Pallof Press 3x12/side',
      'Side Plank 3x30s/side',
    ],
  },
};

const phase2: LetterMap = {
  A: {
    detail: 'Full Body',
    exercises: [
      'Front Squat 3x6',
      'Bench Press 3x8',
      'SL RDL 3x8/side',
      'DB Row 3x10',
      'Box Jumps 3x5',
      'Anti-Rotation Press 3x10/side',
    ],
  },
};

const phase3: LetterMap = {
  A: {
    detail: 'Full Body',
    exercises: [
      'Back Squat 3x5 RPE 6-7',
      'Push-up 3x12',
      'Weighted Step-Ups 3x8/side',
      'Pull-up 3x6',
      'SL RDL 3x8/side',
      'Core circuit 2 rounds',
    ],
  },
};

const phase4: LetterMap = {
  A: {
    detail: 'Light Full Body',
    exercises: [
      'Goblet Squat 2x8',
      'Push-up 2x10',
      'SL RDL 2x8',
      'DB Row 2x10',
      'Plank+Side Plank 2x30s',
      'Calf Raises 2x15',
    ],
  },
};

const phase5: LetterMap = {
  A: {
    detail: 'Bodyweight',
    exercises: [
      'SL Squat variations 3x8/side',
      'Hip Thrusts 3x12',
      'Eccentric Calf Lowers 3x12',
      'Core circuit 2 rounds',
    ],
  },
};

const phaseMap: Record<number, LetterMap> = {
  1: phase1,
  2: phase2,
  3: phase3,
  4: phase4,
  5: phase5,
};

/**
 * Look up the canonical strength exercises for a given phase and letter.
 * Returns null if no definition exists for that combination.
 */
export function getStrengthExercises(
  phase: number,
  letter: string,
): { detail: string; exercises: string[] } | null {
  const letters = phaseMap[phase];
  if (!letters) return null;
  const def = letters[letter.toUpperCase()];
  if (!def) return null;
  return { detail: def.detail, exercises: [...def.exercises] };
}
