import React from 'react';

interface Props {
  value: number;
  color?: string;
}

export const ScoreBar: React.FC<Props> = ({ value, color = 'bg-primary' }) => (
 <div className="flex items-center gap-3 w-full">
 <div className="flex-1 bg-elevated rounded-full h-2 overflow-hidden" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div
 className={`h-full rounded-full progress-bar-fill ${color}`}
        style={{ '--progress-width': `${Math.min(100, Math.max(0, value))}%` } as React.CSSProperties}
      />
    </div>
 <span className="text-small font-bold text-text-main w-10 text-right tabular-nums">{value}</span>
  </div>
);