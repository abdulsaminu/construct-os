import React, { memo } from 'react';

interface Props {
  value: number;
  size?: number;
  stroke?: number;
}

export const CircularGauge = memo<Props>(({ value, size = 120, stroke = 8 }) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  let color = 'text-success';
  if (value > 80) color = 'text-danger';
  else if (value > 60) color = 'text-warning';
  else if (value > 30) color = 'text-primary';

  return (
    <div className="relative" style={{ width: size, height: size }} role="img" aria-label={`Score: ${value} out of 100`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-elevated" />
        <circle
          cx={size/2}
          cy={size/2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${color} transition-all duration-slow ease-out`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-title font-bold ${color} tabular-nums`}>{value}</span>
        <span className="text-caption text-text-dim -mt-1">/ 100</span>
      </div>
    </div>
  );
});