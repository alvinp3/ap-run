'use client';

import type { WorkoutType } from '@/types';
import { getWorkoutBadgeClass, getWorkoutLabel } from '@/utils/workout';

interface WorkoutBadgeProps {
  type: WorkoutType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function WorkoutBadge({ type, size = 'md', className = '' }: WorkoutBadgeProps) {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 font-semibold tracking-widest',
    md: 'text-xs px-3 py-1 font-bold tracking-wider',
    lg: 'text-sm px-4 py-1.5 font-bold tracking-wider',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full ${getWorkoutBadgeClass(type)} ${sizeClasses[size]} ${className}`}
      style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
    >
      {getWorkoutLabel(type)}
    </span>
  );
}
