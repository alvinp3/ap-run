'use client';

import { useState } from 'react';
import type { WorkoutType } from '@/types';
import { useTextLines } from '@/hooks/useTextLines';
import { parseWorkoutDescription, type WorkoutBlock } from '@/utils/parseWorkout';

// ── Constants ─────────────────────────────────────────────────────────────────
const DETAIL_FONT        = '13px/1.5 Manrope, sans-serif';
const DETAIL_LINE_HEIGHT = 13 * 1.5;
const DETAIL_MAX_LINES   = 3;
const MAX_EXERCISES      = 5;

// ── Types ─────────────────────────────────────────────────────────────────────
interface WorkoutStepsProps {
  description: string;
  type: WorkoutType;
  maxBlocks?: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getLabelColor(label: string): string {
  const u = label.toUpperCase();
  if (u === 'WARMUP' || u === 'COOLDOWN')                        return '#6B7280';
  if (u === 'INTERVALS')                                         return '#EF4444';
  if (u === 'TEMPO' || u === 'FARTLEK' || u === 'STRIDES' || u === 'PICKUP') return '#F59E0B';
  if (u === 'EASY' || u === 'RUN' || u === 'LONG RUN')          return '#22C55E';
  if (u.startsWith('STRENGTH'))                                  return '#B388FF';
  if (u === 'FINISH')                                            return '#00E5FF';
  if (u === 'FUEL')                                              return '#F59E0B';
  return '#6B7280';
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
  compact: boolean;
}) {
  const [detailOpen, setDetailOpen]       = useState(false);
  const [exercisesOpen, setExercisesOpen] = useState(false);

  const { lineCount, containerRef } = useTextLines(
    block.detail ?? '',
    DETAIL_FONT,
    DETAIL_LINE_HEIGHT,
  );

  const isNote     = block.kind === 'note';
  const isStrength = block.kind === 'strength';
  const labelColor = getLabelColor(block.label);

  const detailTall  = compact && lineCount !== null && lineCount > DETAIL_MAX_LINES;
  const collapsedH  = DETAIL_MAX_LINES * DETAIL_LINE_HEIGHT;

  const hasExercises = (block.exercises?.length ?? 0) > 0;
  const exTooMany    = compact && hasExercises && block.exercises!.length > MAX_EXERCISES;
  const visibleEx    = exTooMany && !exercisesOpen
    ? block.exercises!.slice(0, MAX_EXERCISES)
    : block.exercises ?? [];

  return (
    <div style={{
      paddingTop:    index === 0 ? 0 : 14,
      paddingBottom: 14,
      borderBottom:  isLast ? 'none' : '1px solid rgba(255,255,255,0.06)',
    }}>
      {/* ── Header row: label + count + pace ─────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px 10px', marginBottom: 6 }}>
        {/* Step number */}
        {!isNote && (
          <span style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
            color: '#3A3A3A', minWidth: 18, flexShrink: 0,
          }}>
            {String(stepIndex + 1).padStart(2, '0')}
          </span>
        )}
        {isNote && (
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#F59E0B', minWidth: 18, flexShrink: 0 }}>!</span>
        )}

        {/* Label — larger and bold */}
        <span style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 13, fontWeight: 700,
          letterSpacing: '0.06em', textTransform: 'uppercase',
          color: labelColor,
        }}>
          {block.label}
        </span>

        {/* Section name for strength (e.g. "Lower Body") */}
        {isStrength && block.detail && (
          <span style={{
            fontFamily: 'Manrope, sans-serif', fontSize: 11,
            color: 'var(--text-tertiary)',
          }}>
            {block.detail}
          </span>
        )}

        {/* Count (reps/distance) */}
        {block.count && (
          <span style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
            color: '#00E5FF', fontWeight: 600,
          }}>
            {block.count}
          </span>
        )}

        {/* Pace */}
        {block.pace && (
          <span style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
            color: '#F59E0B',
          }}>
            @{block.pace}
          </span>
        )}

        {/* Recovery */}
        {block.recovery && (
          <span style={{
            fontFamily: 'Manrope, sans-serif', fontSize: 11,
            color: '#52525B',
          }}>
            · {block.recovery} rest
          </span>
        )}
      </div>

      {/* ── Detail text (run description, notes) ─────────────────── */}
      {block.detail && !isStrength && (
        <div style={{ paddingLeft: 28, position: 'relative' }}>
          <div
            ref={containerRef}
            style={{
              fontFamily: 'Manrope, sans-serif', fontSize: 13, lineHeight: 1.5,
              color: '#C4C4C4',
              overflow: 'hidden',
              maxHeight: detailTall && !detailOpen ? collapsedH : undefined,
            }}
          >
            {block.detail}
          </div>
          {detailTall && !detailOpen && (
            <div style={{
              position: 'absolute', bottom: 0, left: 28, right: 0, height: 20,
              background: 'linear-gradient(to bottom, transparent, #111111)',
              pointerEvents: 'none',
            }} />
          )}
          {detailTall && (
            <button
              onClick={(e) => { e.stopPropagation(); setDetailOpen(v => !v); }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#52525B', fontFamily: 'Manrope, sans-serif', fontSize: 11,
                padding: '3px 0 0', minHeight: 'unset',
              }}
            >
              {detailOpen ? '↑ less' : '↓ more'}
            </button>
          )}
        </div>
      )}

      {/* ── Exercise list ─────────────────────────────────────────── */}
      {hasExercises && (
        <div style={{
          paddingLeft: 28,
          marginTop: block.detail && !isStrength ? 6 : 0,
          borderLeft: `2px solid ${labelColor}33`,
          display: 'flex', flexDirection: 'column', gap: 5,
        }}>
          {visibleEx.map((ex, i) => (
            <div key={i} style={{
              fontFamily: 'Manrope, sans-serif', fontSize: 13,
              color: '#D4D4D8', lineHeight: 1.4,
            }}>
              {ex}
            </div>
          ))}
          {exTooMany && (
            <button
              onClick={(e) => { e.stopPropagation(); setExercisesOpen(v => !v); }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#6B7280', fontFamily: 'Manrope, sans-serif', fontSize: 11,
                padding: '2px 0 0', minHeight: 'unset', textAlign: 'left',
              }}
            >
              {exercisesOpen
                ? '↑ show less'
                : `↓ ${block.exercises!.length - MAX_EXERCISES} more exercises`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── WorkoutSteps ──────────────────────────────────────────────────────────────

export default function WorkoutSteps({ description, type, maxBlocks }: WorkoutStepsProps) {
  const [allVisible, setAllVisible] = useState(false);
  const blocks = parseWorkoutDescription(description, type);
  if (!blocks.length) return null;

  const compact        = !!maxBlocks;
  const shouldCollapse = compact && !allVisible && blocks.length > maxBlocks!;
  const visible        = shouldCollapse ? blocks.slice(0, maxBlocks!) : blocks;
  const hiddenCount    = blocks.length - (maxBlocks ?? blocks.length);

  let stepCounter = 0;

  return (
    <div>
      {visible.map((block, i) => {
        const isNote   = block.kind === 'note';
        const stepIdx  = isNote ? 0 : stepCounter++;
        return (
          <BlockRow
            key={i}
            block={block}
            index={i}
            isLast={i === visible.length - 1 && !shouldCollapse}
            stepIndex={stepIdx}
            compact={compact}
          />
        );
      })}

      {shouldCollapse && (
        <button
          onClick={(e) => { e.stopPropagation(); setAllVisible(true); }}
          style={{
            width: '100%', background: 'transparent', border: 'none',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            paddingTop: 10, paddingBottom: 0,
            cursor: 'pointer', color: '#52525B',
            fontFamily: 'Manrope, sans-serif', fontSize: 12,
            letterSpacing: '0.04em', minHeight: 'unset', textAlign: 'left',
          }}
        >
          ↓ {hiddenCount} more step{hiddenCount !== 1 ? 's' : ''}
        </button>
      )}
    </div>
  );
}
