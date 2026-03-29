'use client';

interface ProgressRingProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  sublabel?: string;
}

export default function ProgressRing({
  percent,
  size = 80,
  strokeWidth = 6,
  color = '#2DD4BF',
  label,
  sublabel,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(Math.max(percent, 0), 100) / 100) * circumference;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute top-0 left-0 -rotate-90">
        {/* Track */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="rgba(51,65,85,0.6)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      {(label || sublabel) && (
        <div className="flex flex-col items-center justify-center z-10 text-center">
          {label && (
            <span
              className="font-bold leading-none"
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: size > 90 ? '18px' : '14px',
                color: 'var(--text-primary)',
              }}
            >
              {label}
            </span>
          )}
          {sublabel && (
            <span
              className="leading-none mt-0.5"
              style={{
                fontSize: size > 90 ? '10px' : '9px',
                color: 'var(--text-tertiary)',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}
            >
              {sublabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
