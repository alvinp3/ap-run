'use client';

import { useEffect, useState } from 'react';
import type { WeatherData, TrainingAdvisory } from '@/types';
import { calculateHeatIndex } from '@/utils/workout';

// Training window options stored in bq-settings as trainingWindow
const WINDOWS = {
  morning: { start: 5,  end: 6  },
  midday:  { start: 12, end: 13 },
  evening: { start: 17, end: 19 },
} as const;
type WindowKey = keyof typeof WINDOWS;

function formatWindowLabel(start: number, end: number): string {
  const fmt = (h: number) => (h === 0 ? 12 : h > 12 ? h - 12 : h);
  const period = (h: number) => (h < 12 ? 'AM' : 'PM');
  const sP = period(start), eP = period(end);
  return sP === eP
    ? `${fmt(start)}-${fmt(end)} ${sP}`
    : `${fmt(start)} ${sP}-${fmt(end)} ${eP}`;
}

function getWeatherIcon(description: string, icon?: string): string {
  if (!description) return '🌡️';
  const desc = description.toLowerCase();
  if (desc.includes('thunder') || desc.includes('storm')) return '⛈️';
  if (desc.includes('rain') || desc.includes('drizzle')) return '🌧️';
  if (desc.includes('snow')) return '❄️';
  if (desc.includes('fog') || desc.includes('mist') || desc.includes('haze')) return '🌫️';
  if (desc.includes('cloud') && desc.includes('partly')) return '⛅';
  if (desc.includes('cloud') || desc.includes('overcast')) return '☁️';
  if (desc.includes('clear') || desc.includes('sunny')) return '☀️';
  return '🌤️';
}

function getAdvisory(weather: WeatherData): TrainingAdvisory | null {
  const hi = weather.heatIndex ?? calculateHeatIndex(weather.temp, weather.humidity);

  if (hi >= 105) return {
    level: 'danger',
    icon: '🌡️',
    message: 'DANGEROUS HEAT — Treadmill for quality sessions. Easy runs only outdoors. Start by 5:00 AM.',
    heatAdjusted: true,
  };
  if (hi >= 100) return {
    level: 'danger',
    icon: '☀️',
    message: 'EXTREME HEAT — Move speed work to treadmill. Cap outdoor runs at 2 hours. Extra hydration.',
    heatAdjusted: true,
  };
  if (hi >= 85) return {
    level: 'warning',
    icon: '☀️',
    message: 'HEAT ADVISORY — Train by HR, not pace. Add 25-40 sec/mile to all targets. Carry fluids.',
    heatAdjusted: true,
  };
  if (weather.description?.toLowerCase().includes('thunder')) return {
    level: 'warning',
    icon: '⛈️',
    message: 'Storms expected — have an indoor backup plan. Never run during lightning.',
    heatAdjusted: false,
  };
  if (weather.description?.toLowerCase().includes('rain')) return {
    level: 'info',
    icon: '🌧️',
    message: 'Rain expected — roads may be slick. Adjust footing on turns.',
    heatAdjusted: false,
  };
  if (weather.temp < 40) return {
    level: 'info',
    icon: '🧤',
    message: 'Cold morning — layer up. Gloves and ear cover recommended. Warm up inside first.',
    heatAdjusted: false,
  };
  if (weather.windSpeed > 15) return {
    level: 'info',
    icon: '💨',
    message: 'Windy — expect slower pace on exposed sections. Use wind for effort calibration.',
    heatAdjusted: false,
  };
  if (weather.temp >= 55 && weather.temp <= 70 && weather.humidity < 60 && weather.windSpeed < 10) return {
    level: 'success',
    icon: '🟢',
    message: 'Perfect running weather. Enjoy it.',
    heatAdjusted: false,
  };
  return null;
}

const advisoryColors = {
  info:    { bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.3)',  text: '#3B82F6' },
  warning: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)',  text: '#F59E0B' },
  danger:  { bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)',   text: '#EF4444' },
  success: { bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.3)',   text: '#22C55E' },
};

interface WeatherStripProps {
  className?: string;
}

export default function WeatherStrip({ className = '' }: WeatherStripProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [windowLabel, setWindowLabel] = useState('5-6 AM');

  useEffect(() => {
    // Read training window preference from settings
    let start: number = WINDOWS.morning.start;
    let end: number   = WINDOWS.morning.end;
    try {
      const stored = localStorage.getItem('bq-settings');
      if (stored) {
        const key = JSON.parse(stored)?.trainingWindow as WindowKey | undefined;
        if (key && key in WINDOWS) { start = WINDOWS[key].start; end = WINDOWS[key].end; }
      }
    } catch {}
    setWindowLabel(formatWindowLabel(start, end));

    fetch(`/api/weather?start=${start}&end=${end}`)
      .then((r) => r.json())
      .then((d) => { setWeather(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={`card skeleton h-14 ${className}`} />
    );
  }

  if (!weather) {
    return (
      <div
        className={`card flex items-center gap-2 text-sm ${className}`}
        style={{ color: 'var(--text-tertiary)' }}
      >
        <span>🌡️</span>
        <span>Weather unavailable</span>
      </div>
    );
  }

  const hi = weather.heatIndex ?? calculateHeatIndex(weather.temp, weather.humidity);
  const advisory = getAdvisory(weather);
  const icon = getWeatherIcon(weather.description, weather.icon);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Main strip */}
      <div
        className="card cursor-pointer select-none"
        style={{ padding: '12px 16px' }}
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xl">{icon}</span>
            <span
              className="font-bold"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)' }}
            >
              {Math.round(weather.temp)}°F
            </span>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Feels {Math.round(weather.feelsLike)}°
            </span>
            <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              {weather.humidity}% humidity
            </span>
            <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              {Math.round(weather.windSpeed)} mph wind
            </span>
            {hi >= 85 && (
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444' }}
              >
                HI {Math.round(hi)}°
              </span>
            )}
          </div>
          <span
            className="text-xs ml-2 flex-shrink-0"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {windowLabel} {expanded ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {/* Advisory banner */}
      {advisory && (
        <div
          className="rounded-xl px-4 py-2.5 flex items-center gap-2"
          style={{
            background: advisoryColors[advisory.level].bg,
            border: `1px solid ${advisoryColors[advisory.level].border}`,
          }}
        >
          <span className="text-base">{advisory.icon}</span>
          <span
            className="text-sm font-medium"
            style={{ color: advisoryColors[advisory.level].text, fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            {advisory.message}
          </span>
          {advisory.heatAdjusted && (
            <span
              className="ml-auto text-xs font-semibold flex-shrink-0"
              style={{ color: '#F59E0B' }}
            >
              +25-40s/mi
            </span>
          )}
        </div>
      )}
    </div>
  );
}
