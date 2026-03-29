'use client';

import { getPhaseColor } from '@/utils/workout';

interface PhaseBadgeProps {
  phase: number;
  name: string;
  size?: 'sm' | 'md';
  className?: string;
}

export default function PhaseBadge({ phase, name, size = 'md', className = '' }: PhaseBadgeProps) {
  const color = getPhaseColor(phase);
  const sizeCls = size === 'sm'
    ? 'text-[10px] px-2 py-0.5 gap-1'
    : 'text-xs px-3 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold tracking-wider ${sizeCls} ${className}`}
      style={{
        background: `${color}22`,
        color,
        fontFamily: 'DM Sans, sans-serif',
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: color }}
      />
      PHASE {phase} · {name.toUpperCase()}
    </span>
  );
}
