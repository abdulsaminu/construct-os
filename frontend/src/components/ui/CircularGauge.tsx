import React from 'react';

interface Props {
  value: number;
  size?: number;
  stroke?: number;
}

export const CircularGauge: React.FC<Props> = ({ value, size = 120, stroke = 8 }) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  // Strictly use backend value for offset. No math on financials.
  const offset = circumference - (value / 100) * circumference;

  let color = 'text-success';
  if (value > 80) color = 'text-danger';
  else if (value > 60) color = 'text-warning';
  else if (value > 30) color = 'text-primary';

  return (
    <div className="relative" style={{ width: size, height: size }}>
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
          className={`${color} transition-all duration-700`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-bold ${color}`}>{value}</span>
        <span className="text-[10px] text-text-dim -mt-1">/ 100</span>
      </div>
    </div>
  );
};
