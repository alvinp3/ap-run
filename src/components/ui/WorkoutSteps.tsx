'use client';

import type { WorkoutType } from '@/types';
import { parseWorkoutDescription, type WorkoutBlock } from '@/utils/parseWorkout';

interface WorkoutStepsProps {
  description: string;
  type: WorkoutType;
}

function getLabelColor(label: string): string {
  const upper = label.toUpperCase();
  if (upper === 'WARMUP' || upper === 'COOLDOWN') return '#52525B';
  if (upper === 'INTERVALS') return '#EF4444';
  if (upper === 'TEMPO') return '#F59E0B';
  if (upper === 'FARTLEK' || upper === 'STRIDES') return '#F59E0B';
  if (upper === 'PICKUP') return '#F59E0B';
  if (upper === 'EASY' || upper === 'RUN' || upper === 'LONG RUN') return '#22C55E';
  if (upper.startsWith('STRENGTH')) return '#B388FF';
  if (upper === 'REST' || upper === 'RECOVERY') return '#52525B';
  if (upper === 'FINISH') return '#00E5FF';
  if (upper === 'FUEL') return '#F59E0B';
  if (upper === 'NOTE') return '#52525B';
  return '#52525B';
}

function StepNumber({ index, isNote }: { index: number; isNote: boolean }) {
  if (isNote) {
    return (
      <span
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10,
          color: '#F59E0B',
          minWidth: 20,
          flexShrink: 0,
          lineHeight: 1,
        }}
      >
        !
      </span>
    );
  }
  const num = String(index + 1).padStart(2, '0');
  return (
    <span
      style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10,
        color: '#3A3A3A',
        minWidth: 20,
        flexShrink: 0,
        lineHeight: 1,
      }}
    >
      {num}
    </span>
  );
}

function BlockRow({
  block,
  index,
  isLast,
  stepIndex,
}: {
  block: WorkoutBlock;
  index: number;
  isLast: boolean;
  stepIndex: number;
}) {
  const isNote = block.kind === 'note';
  const labelColor = getLabelColor(block.label);
  const rightMeta = block.count ?? block.pace ?? undefined;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        paddingTop: index === 0 ? 0 : 10,
        paddingBottom: 10,
        borderBottom: isLast ? 'none' : '1px solid #1A1A1A',
      }}
    >
      {/* Step number column */}
      <StepNumber index={stepIndex} isNote={isNote} />

      {/* Label + detail + exercises */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 10,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            color: labelColor,
            fontWeight: 600,
          }}
        >
          {block.label}
        </span>

        {block.detail && (
          <div
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: 13,
              color: '#A1A1AA',
              marginTop: 2,
              lineHeight: 1.4,
            }}
          >
            {block.detail}
          </div>
        )}

        {block.recovery && (
          <div
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: 11,
              color: '#52525B',
              marginTop: 2,
            }}
          >
            · {block.recovery}
          </div>
        )}

        {block.exercises && block.exercises.length > 0 && (
          <div style={{ marginTop: 4 }}>
            {block.exercises.map((ex, i) => (
              <div
                key={i}
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: 12,
                  color: '#52525B',
                  lineHeight: 1.5,
                }}
              >
                · {ex}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pace / count */}
      {rightMeta && (
        <span
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 12,
            color: '#00E5FF',
            flexShrink: 0,
            textAlign: 'right',
            lineHeight: 1.2,
            paddingTop: 1,
          }}
        >
          {rightMeta}
        </span>
      )}
    </div>
  );
}

export default function WorkoutSteps({ description, type }: WorkoutStepsProps) {
  const blocks = parseWorkoutDescription(description, type);

  if (!blocks.length) return null;

  // Track step numbering separately (notes don't consume a step number slot visually,
  // but we still pass the absolute index for the "!" indicator logic)
  let stepCounter = 0;

  return (
    <div style={{ background: 'transparent' }}>
      {blocks.map((block, i) => {
        const isNote = block.kind === 'note';
        const currentStep = isNote ? 0 : stepCounter++;
        return (
          <BlockRow
            key={i}
            block={block}
            index={i}
            isLast={i === blocks.length - 1}
            stepIndex={currentStep}
          />
        );
      })}
    </div>
  );
}
