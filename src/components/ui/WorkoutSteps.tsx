'use client';

import { useState } from 'react';
import type { WorkoutType } from '@/types';
import { useTextLines } from '@/hooks/useTextLines';
import { parseWorkoutDescription, type WorkoutBlock } from '@/utils/parseWorkout';

const DETAIL_FONT        = '13px/1.4 Manrope, sans-serif';
const DETAIL_LINE_HEIGHT = 13 * 1.4; // 18.2 px
const DETAIL_MAX_LINES   = 2;
const MAX_EXERCISES      = 3;

interface WorkoutStepsProps {
  description: string;
  type: WorkoutType;
  /**
   * When set, collapse the block list after this many steps.
   * Also enables per-block detail truncation via pretext.
   * Leave undefined (detail page) to show everything untruncated.
   */
  maxBlocks?: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getLabelColor(label: string): string {
  const u = label.toUpperCase();
  if (u === 'WARMUP' || u === 'COOLDOWN')          return '#52525B';
  if (u === 'INTERVALS')                            return '#EF4444';
  if (u === 'TEMPO' || u === 'FARTLEK'
      || u === 'STRIDES' || u === 'PICKUP')         return '#F59E0B';
  if (u === 'EASY' || u === 'RUN' || u === 'LONG RUN') return '#22C55E';
  if (u.startsWith('STRENGTH'))                     return '#B388FF';
  if (u === 'FINISH')                               return '#00E5FF';
  if (u === 'FUEL')                                 return '#F59E0B';
  return '#52525B';
}

function StepNumber({ index, isNote }: { index: number; isNote: boolean }) {
  if (isNote) {
    return (
      <span style={{
        fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
        color: '#F59E0B', minWidth: 20, flexShrink: 0, lineHeight: 1,
      }}>!</span>
    );
  }
  return (
    <span style={{
      fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
      color: '#3A3A3A', minWidth: 20, flexShrink: 0, lineHeight: 1,
    }}>
      {String(index + 1).padStart(2, '0')}
    </span>
  );
}

// ── BlockRow ─────────────────────────────────────────────────────────────────

function BlockRow({
  block,
  index,
  isLast,
  stepIndex,
  compact,
}: {
  block: WorkoutBlock;
  index: number;
  isLast: boolean;
  stepIndex: number;
  compact: boolean; // true → truncate detail + exercises
}) {
  const [detailOpen,    setDetailOpen]    = useState(false);
  const [exercisesOpen, setExercisesOpen] = useState(false);

  // pretext line measurement for detail text
  const { lineCount, containerRef } = useTextLines(
    block.detail ?? '',
    DETAIL_FONT,
    DETAIL_LINE_HEIGHT,
  );

  const isNote       = block.kind === 'note';
  const labelColor   = getLabelColor(block.label);
  const rightMeta    = block.count ?? block.pace ?? undefined;

  const detailTall   = compact && lineCount !== null && lineCount > DETAIL_MAX_LINES;
  const collapsedH   = DETAIL_MAX_LINES * DETAIL_LINE_HEIGHT;

  const hasExercises  = (block.exercises?.length ?? 0) > 0;
  const exTooMany     = compact && hasExercises && block.exercises!.length > MAX_EXERCISES;
  const visibleEx     = exTooMany && !exercisesOpen
    ? block.exercises!.slice(0, MAX_EXERCISES)
    : block.exercises ?? [];

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      paddingTop: index === 0 ? 0 : 10, paddingBottom: 10,
      borderBottom: isLast ? 'none' : '1px solid #1A1A1A',
    }}>
      {/* Step number */}
      <StepNumber index={stepIndex} isNote={isNote} />

      {/* Content column */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Label */}
        <span style={{
          fontFamily: 'Space Grotesk, sans-serif', fontSize: 10,
          letterSpacing: '0.10em', textTransform: 'uppercase',
          color: labelColor, fontWeight: 600,
        }}>
          {block.label}
        </span>

        {/* Detail text — pretext-measured, collapses when compact + tall */}
        {block.detail && (
          <div style={{ position: 'relative' }}>
            <div
              ref={containerRef}
              style={{
                fontFamily: 'Manrope, sans-serif', fontSize: 13, color: '#A1A1AA',
                marginTop: 2, lineHeight: 1.4, overflow: 'hidden',
                maxHeight: detailTall && !detailOpen ? collapsedH : undefined,
              }}
            >
              {block.detail}
            </div>
            {/* Fade-out gradient when collapsed */}
            {detailTall && !detailOpen && (
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 16,
                background: 'linear-gradient(to bottom, transparent, #111111)',
                pointerEvents: 'none',
              }} />
            )}
            {detailTall && (
              <button
                onClick={() => setDetailOpen(v => !v)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#52525B', fontFamily: 'Manrope, sans-serif', fontSize: 11,
                  letterSpacing: '0.04em', padding: '2px 0 0', minHeight: 'unset',
                }}
              >
                {detailOpen ? '↑ less' : '↓ more'}
              </button>
            )}
          </div>
        )}

        {/* Recovery */}
        {block.recovery && (
          <div style={{
            fontFamily: 'Manrope, sans-serif', fontSize: 11, color: '#52525B', marginTop: 2,
          }}>
            · {block.recovery}
          </div>
        )}

        {/* Exercise list */}
        {hasExercises && (
          <div style={{ marginTop: 4 }}>
            {visibleEx.map((ex, i) => (
              <div key={i} style={{
                fontFamily: 'Manrope, sans-serif', fontSize: 12, color: '#52525B', lineHeight: 1.5,
              }}>
                · {ex}
              </div>
            ))}
            {exTooMany && (
              <button
                onClick={() => setExercisesOpen(v => !v)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#52525B', fontFamily: 'Manrope, sans-serif', fontSize: 11,
                  letterSpacing: '0.04em', padding: '2px 0 0', minHeight: 'unset',
                }}
              >
                {exercisesOpen
                  ? '↑ less'
                  : `↓ ${block.exercises!.length - MAX_EXERCISES} more`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pace / count chip */}
      {rightMeta && (
        <span style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#00E5FF',
          flexShrink: 0, textAlign: 'right', lineHeight: 1.2, paddingTop: 1,
        }}>
          {rightMeta}
        </span>
      )}
    </div>
  );
}

// ── WorkoutSteps ──────────────────────────────────────────────────────────────

export default function WorkoutSteps({ description, type, maxBlocks }: WorkoutStepsProps) {
  const [allVisible, setAllVisible] = useState(false);
  const blocks = parseWorkoutDescription(description, type);
  if (!blocks.length) return null;

  const compact       = !!maxBlocks;
  const shouldCollapse = compact && !allVisible && blocks.length > maxBlocks!;
  const visible        = shouldCollapse ? blocks.slice(0, maxBlocks!) : blocks;
  const hiddenCount    = blocks.length - (maxBlocks ?? blocks.length);

  let stepCounter = 0;

  return (
    <div>
      {visible.map((block, i) => {
        const isNote     = block.kind === 'note';
        const stepIndex  = isNote ? 0 : stepCounter++;
        return (
          <BlockRow
            key={i}
            block={block}
            index={i}
            isLast={i === visible.length - 1 && !shouldCollapse}
            stepIndex={stepIndex}
            compact={compact}
          />
        );
      })}

      {shouldCollapse && (
        <button
          onClick={() => setAllVisible(true)}
          style={{
            width: '100%', background: 'transparent', border: 'none',
            borderTop: '1px solid #1A1A1A', paddingTop: 10, paddingBottom: 0,
            cursor: 'pointer', color: '#52525B', fontFamily: 'Manrope, sans-serif',
            fontSize: 12, letterSpacing: '0.04em', minHeight: 'unset', textAlign: 'left',
          }}
        >
          ↓ {hiddenCount} more step{hiddenCount !== 1 ? 's' : ''}
        </button>
      )}
    </div>
  );
}
