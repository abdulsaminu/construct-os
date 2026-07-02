import React from 'react';

interface Props {
  value: number;
  color?: string;
}

export const ScoreBar: React.FC<Props> = ({ value, color = 'bg-primary' }) => (
  <div className="flex items-center gap-3">
    <div className="flex-1 bg-elevated rounded-full h-2">
      <div 
        className={`${color} h-2 rounded-full transition-all`} 
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }} 
        aria-valuenow={value}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
    <span className="text-sm font-bold text-text-main w-10 text-right">{value}</span>
  </div>
);
