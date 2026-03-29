export type WorkoutType =
  | 'easy'
  | 'intervals'
  | 'tempo'
  | 'long'
  | 'rest'
  | 'race'
  | 'recovery'
  | 'strength';

export interface WorkoutDay {
  day: string;
  date: string;
  type: WorkoutType;
  miles: number;
  description: string;
  hasStrength: boolean;
  estimatedMinutes: number;
}

export interface TrainingWeek {
  week: number;
  startDate: string;
  totalMiles: number;
  isDownWeek: boolean;
  days: WorkoutDay[];
}

export interface TrainingPhase {
  phase: number;
  name: string;
  startWeek: number;
  endWeek: number;
  startDate: string;
  endDate: string;
  color: string;
  weeks: TrainingWeek[];
}

export interface WorkoutLog {
  id: string;
  date: string;
  completed: boolean;
  actualMiles?: number;
  actualDuration?: number;
  avgHeartRate?: number;
  notes?: string;
  skipped?: boolean;
  garminActivityId?: string;
  completedAt?: string;
}

export interface WeatherData {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  heatIndex?: number;
}

export interface TrainingAdvisory {
  level: 'info' | 'warning' | 'danger' | 'success';
  message: string;
  icon: string;
  heatAdjusted?: boolean;
}

export interface CoachMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface WorkoutModification {
  date: string;
  changes: {
    description?: string;
    mileage?: number;
    type?: WorkoutType;
  };
  reason: string;
}

export interface GarminHealthData {
  restingHR?: number;
  sleepScore?: number;
  bodyBattery?: number;
  trainingReadiness?: number;
  vo2max?: number;
}

export interface TrainingPace {
  zone: string;
  normalPace: string;
  purpose: string;
  heatAdjusted: string;
}

export type PhaseNumber = 1 | 2 | 3 | 4 | 5;

export interface NutritionTarget {
  phase: PhaseNumber;
  calories: string;
  carbs: string;
  protein: string;
  fat: string;
}

export interface GearItem {
  id: string;
  name: string;
  category?: string;
  checked?: boolean;
}
