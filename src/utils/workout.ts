import type { WorkoutType } from '@/types';

export function getWorkoutColor(type: WorkoutType): string {
  switch (type) {
    case 'easy':      return '#22C55E';
    case 'intervals': return '#EF4444';
    case 'tempo':     return '#F59E0B';
    case 'long':      return '#3B82F6';
    case 'rest':      return '#64748B';
    case 'race':      return '#EF4444';
    case 'recovery':  return '#A855F7';
    case 'strength':  return '#A855F7';
    default:          return '#94A3B8';
  }
}

export function getWorkoutBadgeClass(type: WorkoutType): string {
  switch (type) {
    case 'easy':      return 'badge-easy';
    case 'intervals': return 'badge-intervals';
    case 'tempo':     return 'badge-tempo';
    case 'long':      return 'badge-long';
    case 'rest':      return 'badge-rest';
    case 'race':      return 'badge-race';
    case 'recovery':  return 'badge-recovery';
    case 'strength':  return 'badge-strength';
    default:          return 'badge-rest';
  }
}

export function getWorkoutLabel(type: WorkoutType): string {
  switch (type) {
    case 'easy':      return 'EASY';
    case 'intervals': return 'INTERVALS';
    case 'tempo':     return 'TEMPO';
    case 'long':      return 'LONG RUN';
    case 'rest':      return 'REST';
    case 'race':      return 'RACE DAY';
    case 'recovery':  return 'RECOVERY';
    case 'strength':  return 'STRENGTH';
    default:          return (type as string).toUpperCase();
  }
}

export function getPhaseColor(phase: number): string {
  switch (phase) {
    case 1: return '#22C55E';
    case 2: return '#F59E0B';
    case 3: return '#3B82F6';
    case 4: return '#A855F7';
    case 5: return '#EF4444';
    default: return '#94A3B8';
  }
}

export function getPhaseBadgeClass(phase: number): string {
  return `badge-phase-${phase}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export function isHeatSeason(dateStr: string): boolean {
  const date = new Date(dateStr + 'T00:00:00');
  const month = date.getMonth(); // 0-indexed: June=5, July=6, Aug=7, Sept=8
  return month >= 5 && month <= 8;
}

export function isToday(dateStr: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return dateStr === today;
}

export function isPast(dateStr: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return dateStr < today;
}

export function isFuture(dateStr: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return dateStr > today;
}

export function getHeatAdvisoryLevel(heatIndex: number): null | 'warning' | 'danger' | 'extreme' {
  if (heatIndex >= 105) return 'extreme';
  if (heatIndex >= 100) return 'danger';
  if (heatIndex >= 85)  return 'warning';
  return null;
}

export function formatMiles(miles: number): string {
  if (miles === 0) return '—';
  return miles % 1 === 0 ? `${miles}` : miles.toFixed(1);
}

export function calculateHeatIndex(tempF: number, humidity: number): number {
  // Rothfusz equation
  if (tempF < 80) return tempF;
  const hi =
    -42.379 +
    2.04901523 * tempF +
    10.14333127 * humidity -
    0.22475541 * tempF * humidity -
    0.00683783 * tempF * tempF -
    0.05481717 * humidity * humidity +
    0.00122874 * tempF * tempF * humidity +
    0.00085282 * tempF * humidity * humidity -
    0.00000199 * tempF * tempF * humidity * humidity;
  return Math.round(hi);
}

export function getDaysUntil(targetDateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDateStr + 'T00:00:00');
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
