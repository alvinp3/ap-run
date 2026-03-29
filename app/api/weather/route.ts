import { NextResponse } from 'next/server';
import { calculateHeatIndex } from '@/utils/workout';

// Cache keyed by "startHour-endHour" so each training window is cached independently
const weatherCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000;

// WMO Weather Code → human-readable description
// Strings intentionally contain keywords matched by WeatherStrip advisory logic:
// "thunder" → storm advisory, "rain"/"drizzle" → rain advisory, "clear"/"sunny" → icon selection
function wmoToDescription(code: number): string {
  if (code === 0)                        return 'clear sky';
  if (code === 1)                        return 'mainly clear';
  if (code === 2)                        return 'partly cloudy';
  if (code === 3)                        return 'overcast';
  if (code === 45 || code === 48)        return 'fog';
  if (code >= 51 && code <= 55)          return 'drizzle';
  if (code === 56 || code === 57)        return 'freezing drizzle';
  if (code >= 61 && code <= 65)          return 'rain';
  if (code === 66 || code === 67)        return 'freezing rain';
  if (code >= 71 && code <= 77)          return 'snow';
  if (code >= 80 && code <= 82)          return 'rain showers';
  if (code === 85 || code === 86)        return 'snow showers';
  if (code === 95)                       return 'thunderstorm';
  if (code === 96 || code === 99)        return 'thunderstorm with hail';
  return 'clear sky';
}

// Higher priority = more severe, used to pick the worse of the 5 AM / 6 AM codes
function wmoPriority(code: number): number {
  if (code === 95 || code === 96 || code === 99) return 10; // thunderstorm
  if (code >= 61 && code <= 67)                  return 8;  // rain / freezing rain
  if (code >= 80 && code <= 82)                  return 7;  // rain showers
  if (code >= 51 && code <= 57)                  return 6;  // drizzle
  if (code >= 71 && code <= 86)                  return 5;  // snow
  if (code === 45 || code === 48)                return 4;  // fog
  if (code === 3)                                return 2;  // overcast
  if (code === 2)                                return 1;  // partly cloudy
  return 0;                                                 // clear
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startHour = Math.max(0, Math.min(23, parseInt(searchParams.get('start') ?? '5', 10)));
  const endHour   = Math.max(startHour, Math.min(23, parseInt(searchParams.get('end')   ?? '6', 10)));
  const cacheKey  = `${startHour}-${endHour}`;

  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  try {
    // Dallas, TX — Open-Meteo is free, no API key required
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude',         '32.7767');
    url.searchParams.set('longitude',        '-96.7970');
    url.searchParams.set('hourly',           'temperature_2m,relativehumidity_2m,apparent_temperature,weathercode,windspeed_10m');
    url.searchParams.set('temperature_unit', 'fahrenheit');
    url.searchParams.set('windspeed_unit',   'mph');
    url.searchParams.set('timezone',         'America/Chicago');
    url.searchParams.set('forecast_days',    '1');

    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);

    const raw = await res.json();
    const h = raw.hourly as {
      temperature_2m:      number[];
      relativehumidity_2m: number[];
      apparent_temperature: number[];
      weathercode:         number[];
      windspeed_10m:       number[];
    };

    // Average all hours in the requested training window (indices = hours 0-23)
    const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);
    const mean = (pick: (i: number) => number) =>
      Math.round(hours.reduce((s, i) => s + pick(i), 0) / hours.length);

    const temp      = mean((i) => h.temperature_2m[i]);
    const feelsLike = mean((i) => h.apparent_temperature[i]);
    const humidity  = mean((i) => h.relativehumidity_2m[i]);
    const windSpeed = mean((i) => h.windspeed_10m[i]);

    // Use the most severe WMO code across the window
    const code = hours.reduce(
      (worst, i) => wmoPriority(h.weathercode[i]) > wmoPriority(worst) ? h.weathercode[i] : worst,
      h.weathercode[hours[0]]
    );

    const description = wmoToDescription(code);
    const heatIndex   = calculateHeatIndex(temp, humidity);

    const data = { temp, feelsLike, humidity, windSpeed, description, icon: String(code), heatIndex };

    weatherCache.set(cacheKey, { data, timestamp: Date.now() });
    return NextResponse.json(data);
  } catch (err) {
    console.error('Weather fetch error:', err);
    return NextResponse.json(
      { temp: 72, feelsLike: 72, humidity: 55, windSpeed: 5, description: 'clear sky', icon: '0', heatIndex: 72 },
      { status: 200 }
    );
  }
}
